import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { getUpsellEmail1Hour, getUpsellEmail24Hour, getUpsellEmail72Hour } from '@/lib/email-templates';

export const dynamic = 'force-dynamic'; // Ensure this route is not cached

export async function GET() {
  const now = new Date();

  // Limit to last 7 days to avoid processing very old records
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const recentPurchases = await prisma.purchase.findMany({
    where: {
      createdAt: {
        gte: sevenDaysAgo,
        lt: now,
      },
      status: 'completed',
    },
    include: {
      emailLogs: true,
    },
  });

  let sentCount = 0;

  for (const purchase of recentPurchases) {
    const ageMs = now.getTime() - purchase.createdAt.getTime();
    const ageHours = ageMs / (1000 * 60 * 60);

    // Check 1 Hour
    if (ageHours >= 1 && !purchase.emailLogs.some(l => l.emailType === 'upsell_1h')) {
      await sendEmail(purchase.email, 'Complete your order', getUpsellEmail1Hour(purchase.email));
      await prisma.purchaseEmailLog.create({
        data: { purchaseId: purchase.id, emailType: 'upsell_1h', status: 'sent' }
      });
      sentCount++;
    }
    // Check 24 Hours
    else if (ageHours >= 24 && !purchase.emailLogs.some(l => l.emailType === 'upsell_24h')) {
      await sendEmail(purchase.email, 'Still interested?', getUpsellEmail24Hour(purchase.email));
      await prisma.purchaseEmailLog.create({
        data: { purchaseId: purchase.id, emailType: 'upsell_24h', status: 'sent' }
      });
      sentCount++;
    }
    // Check 72 Hours
    else if (ageHours >= 72 && !purchase.emailLogs.some(l => l.emailType === 'upsell_72h')) {
      await sendEmail(purchase.email, 'Last chance to save', getUpsellEmail72Hour(purchase.email));
      await prisma.purchaseEmailLog.create({
        data: { purchaseId: purchase.id, emailType: 'upsell_72h', status: 'sent' }
      });
      sentCount++;
    }
  }

  return NextResponse.json({ success: true, processed: recentPurchases.length, sent: sentCount });
}
