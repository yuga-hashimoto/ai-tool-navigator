import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cartRecoveryTemplates, generateCartRecoveryUrl } from '@/lib/abandoned-link-recovery';
import { CartItem } from '@/lib/cart-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // Find carts that are abandoned and not fully recovered
    const carts = await prisma.cart.findMany({
      where: {
        status: 'abandoned',
        visitorEmail: { not: null },
        items: { not: '[]' },
        recoveryStatus: {
          notIn: ['recovered', 'converted', 'failed']
        }
      },
      take: 50
    });

    let sentCount = 0;

    // Sort templates by delay just in case
    const sortedTemplates = [...cartRecoveryTemplates].sort((a, b) => a.delayHours - b.delayHours);

    for (const cart of carts) {
       if (!cart.visitorEmail) continue;

       // Get history
       const sentEmails = await prisma.recoveryEmail.findMany({
         where: { cartId: cart.id },
         select: { templateId: true }
       });
       const sentTemplateIds = new Set(sentEmails.map(e => e.templateId));

       // Use lastActiveAt if available, otherwise updatedAt
       const referenceTime = cart.lastActiveAt || cart.updatedAt;
       const hoursSinceAbandonment = (Date.now() - referenceTime.getTime()) / (1000 * 60 * 60);

       let nextTemplate = null;

       for (const template of sortedTemplates) {
         if (sentTemplateIds.has(template.id)) continue;

         // If delay has passed relative to abandonment time
         if (hoursSinceAbandonment >= template.delayHours) {
           nextTemplate = template;
           break; // Found the next one due
         }
       }

       if (!nextTemplate) continue; // Nothing due or all sent

       // Send email
       const items = JSON.parse(cart.items) as CartItem[];
       const recoveryUrl = generateCartRecoveryUrl(cart.sessionId, items);

       console.log(`[Recovery] Sending email (${nextTemplate.name}) to ${cart.visitorEmail}`);
       console.log(`[Recovery] Subject: ${nextTemplate.subject.replace('{cart_items}', items.map(i => i.toolSlug).join(', '))}`);
       console.log(`[Recovery] Link: ${recoveryUrl}`);

       // Create RecoveryEmail record
       await prisma.recoveryEmail.create({
         data: {
           cartId: cart.id,
           templateId: nextTemplate.id,
           status: 'sent',
         },
       });

       // Update status
       await prisma.cart.update({
         where: { id: cart.id },
         data: {
           recoveryStatus: 'email_sent',
         },
       });

       sentCount++;
    }

    return NextResponse.json({
      success: true,
      processed: sentCount,
      message: `Sent ${sentCount} recovery emails`,
    });
  } catch (error) {
    console.error('[Recovery Execution] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
