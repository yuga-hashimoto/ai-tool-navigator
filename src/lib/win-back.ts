import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

// Win-back campaign configuration
const WIN_BACK_STAGES = [
  {
    stage: 1,
    delayDays: 3, // Send 3 days after churn
    subject: "We miss you! Come back and get 20% off",
    content: (name: string) => `
      <h1>Hi ${name},</h1>
      <p>We noticed your subscription has ended. We'd love to have you back!</p>
      <p>Here's a special offer: <strong>20% off</strong> your next month.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?code=COMEBACK20">Redeem Offer</a></p>
    `
  },
  {
    stage: 2,
    delayDays: 7, // Send 7 days after churn (4 days after previous)
    subject: "Last chance for your exclusive offer",
    content: (name: string) => `
      <h1>Hi ${name},</h1>
      <p>Your 20% off offer is expiring soon. Don't miss out on premium features!</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?code=COMEBACK20">Reactivate Now</a></p>
    `
  },
  {
    stage: 3,
    delayDays: 14, // Send 14 days after churn
    subject: "Can we ask you a question?",
    content: (name: string) => `
      <h1>Hi ${name},</h1>
      <p>We're constantly trying to improve. Could you tell us why you left?</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/feedback">Share Feedback</a></p>
    `
  }
];

export async function detectChurnedUsers() {
  console.log('Detecting churned users...');

  // Find subscriptions that are canceled or past due/expired
  // And the user is NOT already in an active win-back campaign
  const churnedSubscriptions = await prisma.subscription.findMany({
    where: {
      OR: [
        { status: 'CANCELED' },
        { status: 'PAST_DUE' },
        {
          status: 'ACTIVE',
          currentPeriodEnd: { lt: new Date() },
          cancelAtPeriodEnd: true
        }
      ],
      user: {
        winBackCampaigns: {
          none: {
            OR: [
              { status: { in: ['PENDING', 'ACTIVE'] } },
              {
                status: 'COMPLETED',
                createdAt: { gt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
              }
            ]
          }
        }
      }
    },
    include: {
      user: true
    }
  });

  console.log(`Found ${churnedSubscriptions.length} potentially churned users.`);

  let createdCount = 0;
  const processedUserIds = new Set<string>();

  for (const sub of churnedSubscriptions) {
    if (processedUserIds.has(sub.userId)) {
      continue;
    }
    processedUserIds.add(sub.userId);

    // Determine the start delay.
    // Ideally, we calculate based on when they churned (canceledAt or endedAt or currentPeriodEnd).
    const churnDate = sub.endedAt || sub.currentPeriodEnd || sub.canceledAt || new Date();

    // Calculate when the first email should be sent (churnDate + 3 days)
    const firstRunDate = new Date(churnDate.getTime() + WIN_BACK_STAGES[0].delayDays * 24 * 60 * 60 * 1000);

    // If firstRunDate is in the past (e.g. churned a long time ago), send immediately?
    // Or maybe we ignore users who churned a long time ago?
    // Let's send immediately if it's passed, but within reasonable bounds (e.g. 30 days).
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    if (churnDate < thirtyDaysAgo) {
      console.log(`Skipping user ${sub.userId} because churn date is too old.`);
      continue;
    }

    const nextRunAt = firstRunDate < new Date() ? new Date() : firstRunDate;

    await prisma.winBackCampaign.create({
      data: {
        userId: sub.userId,
        status: 'ACTIVE',
        stage: 0,
        nextRunAt: nextRunAt
      }
    });
    createdCount++;
  }

  return { createdCount };
}

export async function processWinBackCampaigns() {
  console.log('Processing win-back campaigns...');

  const campaigns = await prisma.winBackCampaign.findMany({
    where: {
      status: 'ACTIVE',
      nextRunAt: {
        lte: new Date()
      }
    },
    include: {
      user: true
    }
  });

  console.log(`Found ${campaigns.length} campaigns due for processing.`);

  let processedCount = 0;

  for (const campaign of campaigns) {
    // Check if user has resubscribed or fixed payment
    const subscription = await prisma.subscription.findUnique({
      where: { userId: campaign.userId }
    });

    if (subscription && subscription.status === 'ACTIVE' && (!subscription.currentPeriodEnd || subscription.currentPeriodEnd > new Date())) {
        // User is active again! Stop campaign.
        console.log(`User ${campaign.userId} resubscribed. Stopping campaign.`);
        await prisma.winBackCampaign.update({
            where: { id: campaign.id },
            data: { status: 'STOPPED' }
        });
        continue;
    }

    const currentStageIndex = campaign.stage; // 0 means ready for stage 1 (index 0 in array)

    if (currentStageIndex >= WIN_BACK_STAGES.length) {
      // Campaign finished
      await prisma.winBackCampaign.update({
        where: { id: campaign.id },
        data: { status: 'COMPLETED' }
      });
      continue;
    }

    const stageConfig = WIN_BACK_STAGES[currentStageIndex];

    // Send email
    const emailResult = await sendEmail({
      to: campaign.user.email,
      subject: stageConfig.subject,
      html: stageConfig.content(campaign.user.name || 'Friend')
    });

    if (emailResult.success) {
      // Move to next stage
      const nextStageIndex = currentStageIndex + 1;
      let nextRunAt = null;
      let status = 'ACTIVE';

      if (nextStageIndex < WIN_BACK_STAGES.length) {
        const nextStageConfig = WIN_BACK_STAGES[nextStageIndex];
        const delayFromChurn = nextStageConfig.delayDays;
        const currentDelay = stageConfig.delayDays;
        const delayUntilNext = (delayFromChurn - currentDelay); // Days

        nextRunAt = new Date(Date.now() + delayUntilNext * 24 * 60 * 60 * 1000);
      } else {
        status = 'COMPLETED';
      }

      await prisma.winBackCampaign.update({
        where: { id: campaign.id },
        data: {
          stage: nextStageIndex,
          lastSentAt: new Date(),
          nextRunAt,
          status
        }
      });

      processedCount++;
    } else {
        // Log error
        console.error(`Failed to send email for campaign ${campaign.id}`);
    }
  }

  return { processedCount };
}
