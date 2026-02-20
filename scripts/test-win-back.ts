import { PrismaClient } from '@prisma/client';
import { detectChurnedUsers, processWinBackCampaigns } from '../src/lib/win-back';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting win-back test...');

  // Clean up previous test data
  const testEmail = 'test-winback@example.com';

  // Find user first to clean up relations properly if needed
  const existingUser = await prisma.user.findUnique({ where: { email: testEmail } });

  if (existingUser) {
    await prisma.winBackCampaign.deleteMany({
      where: { userId: existingUser.id }
    });
    // Subscription deletes cascade from user usually, but let's be safe
    await prisma.subscription.deleteMany({
      where: { userId: existingUser.id }
    });
    await prisma.user.delete({
      where: { id: existingUser.id }
    });
  }

  // Ensure a tier exists
  let tier = await prisma.subscriptionTier.findUnique({ where: { slug: 'pro-monthly' } });
  if (!tier) {
    tier = await prisma.subscriptionTier.create({
      data: {
        name: 'Pro Monthly',
        slug: 'pro-monthly',
        price: 29.99,
        features: '["Feature 1", "Feature 2"]'
      }
    });
  }

  // Create a user with an EXPIRED subscription (e.g. 5 days ago)
  const expiredDate = new Date();
  expiredDate.setDate(expiredDate.getDate() - 5);

  const user = await prisma.user.create({
    data: {
      email: testEmail,
      name: 'Test User',
      subscription: {
        create: {
          tierId: tier.id,
          status: 'CANCELED',
          currentPeriodEnd: expiredDate,
          canceledAt: expiredDate,
          endedAt: expiredDate
        }
      }
    }
  });

  console.log(`Created user ${user.id} with expired subscription.`);

  // 1. Detect churned users
  console.log('\n--- Detecting Churn ---');
  const detectResult = await detectChurnedUsers();
  console.log('Detect result:', detectResult);

  // Verify campaign created
  const campaign = await prisma.winBackCampaign.findFirst({
    where: { userId: user.id }
  });

  if (!campaign) {
    console.error('FAILED: Win-back campaign not created!');
    process.exit(1);
  }

  console.log('Campaign created:', campaign);
  if (campaign.status !== 'ACTIVE') {
    console.error('FAILED: Campaign status should be ACTIVE');
    process.exit(1);
  }

  // 2. Process campaigns
  console.log('\n--- Processing Campaigns ---');
  const processResult = await processWinBackCampaigns();
  console.log('Process result:', processResult);

  // Verify campaign updated
  const updatedCampaign = await prisma.winBackCampaign.findFirst({
    where: { userId: user.id }
  });

  console.log('Updated campaign:', updatedCampaign);

  if (updatedCampaign?.stage !== 1) {
    console.error(`FAILED: Expected stage 1, got ${updatedCampaign?.stage}`);
    process.exit(1);
  }

  if (updatedCampaign?.lastSentAt === null) {
    console.error('FAILED: lastSentAt should not be null');
     process.exit(1);
  }

  console.log('\nSUCCESS: Win-back flow verified!');

  // 3. Test Re-enrollment Prevention (Active/Pending)
  console.log('\n--- Testing Re-enrollment Prevention (Active) ---');
  const detectResult2 = await detectChurnedUsers();
  console.log('Detect result 2:', detectResult2);
  if (detectResult2.createdCount !== 0) {
    console.error('FAILED: Should not create campaign if one is active.');
    process.exit(1);
  }

  // 4. Test Re-enrollment Prevention (Recent Completed)
  console.log('\n--- Testing Re-enrollment Prevention (Recent Completed) ---');
  // First, verify we have an active campaign (updatedCampaign from step 2 is stage 1, Active)
  // Let's mark it as COMPLETED and set createdAt to 10 days ago
  await prisma.winBackCampaign.update({
    where: { id: updatedCampaign!.id },
    data: {
      status: 'COMPLETED',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
    }
  });

  const detectResult3 = await detectChurnedUsers();
  console.log('Detect result 3:', detectResult3);
  if (detectResult3.createdCount !== 0) {
    console.error('FAILED: Should not create campaign if recently completed.');
    process.exit(1);
  }

  // 5. Test Re-enrollment (Old Completed)
  console.log('\n--- Testing Re-enrollment (Old Completed) ---');
  await prisma.winBackCampaign.update({
    where: { id: updatedCampaign!.id },
    data: {
      status: 'COMPLETED',
      createdAt: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000) // 95 days ago
    }
  });

  const detectResult4 = await detectChurnedUsers();
  console.log('Detect result 4:', detectResult4);
  if (detectResult4.createdCount !== 1) {
    console.error('FAILED: Should create campaign if completed > 90 days ago.');
    process.exit(1);
  }

  // 6. Test Stop Logic
  console.log('\n--- Testing Stop Logic ---');
  // Get the newly created campaign (from step 5)
  // Since we might have multiple now (the old completed one and the new one),
  // find the ACTIVE one.
  const newCampaign = await prisma.winBackCampaign.findFirst({
    where: {
      userId: user.id,
      status: 'ACTIVE'
    }
  });

  if (!newCampaign) {
      console.error('FAILED: Could not find new active campaign for step 6.');
      process.exit(1);
  }

  // Make it due for processing
  await prisma.winBackCampaign.update({
    where: { id: newCampaign.id },
    data: { nextRunAt: new Date(Date.now() - 1000) }
  });

  // Reactivate user subscription
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30);
  await prisma.subscription.update({
    where: { userId: user.id },
    data: {
      status: 'ACTIVE',
      currentPeriodEnd: futureDate,
      cancelAtPeriodEnd: false
    }
  });

  const processResult2 = await processWinBackCampaigns();
  console.log('Process result 2:', processResult2);

  // Verify stopped
  const stoppedCampaign = await prisma.winBackCampaign.findUnique({
    where: { id: newCampaign.id }
  });

  console.log('Stopped campaign:', stoppedCampaign);
  if (stoppedCampaign?.status !== 'STOPPED') {
     console.error('FAILED: Campaign should be STOPPED.');
     process.exit(1);
  }

  console.log('\nALL TESTS PASSED!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
