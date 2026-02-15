import { PrismaClient } from '@prisma/client';
import { CartService } from '../src/lib/cart-service';
import { cartRecoveryTemplates } from '../src/lib/abandoned-link-recovery';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting verification...');

  const sessionId = `verify_${Date.now()}`;
  const toolSlug = 'chatgpt'; // Use a real tool slug
  const visitorEmail = 'test@example.com';

  // 0. Verify invalid tool handling
  console.log('0. Verifying invalid tool handling...');
  try {
    await CartService.addToCart(sessionId, {
        toolSlug: 'invalid-tool-slug-xyz',
        quantity: 1
    });
    throw new Error('Should have thrown error for invalid tool');
  } catch (e: any) {
    if (e.message.includes('Tool not found')) {
        console.log('Caught expected error for invalid tool');
    } else {
        throw e;
    }
  }

  // 1. Add to cart
  console.log('1. Adding item to cart...');
  await CartService.addToCart(sessionId, {
    toolSlug,
    quantity: 1,
    price: 100,
    toolName: 'Test Tool'
  }, { visitorEmail });

  // 2. Verify active status
  const dbCart = await prisma.cart.findUnique({ where: { sessionId } });
  if (!dbCart || dbCart.status !== 'active') throw new Error('Cart not active');

  // 3. Simulate time passing (2 hours ago)
  console.log('3. Simulating abandonment (2 hours ago)...');
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  await prisma.cart.update({
    where: { sessionId },
    data: {
      lastActiveAt: twoHoursAgo,
      updatedAt: twoHoursAgo // For detection query which checks updatedAt
    }
  });

  // 4. Run detection logic
  console.log('4. Running abandonment detection...');
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  await prisma.cart.updateMany({
    where: { sessionId, status: 'active', updatedAt: { lt: oneHourAgo } },
    data: { status: 'abandoned', recoveryStatus: 'pending' }
  });

  // 5. Run recovery logic (T1)
  console.log('5. Running recovery (T1)...');
  let cart = await prisma.cart.findUnique({ where: { sessionId }, include: { recoveryEmails: true } });
  if (!cart) throw new Error('Cart not found');

  const sortedTemplates = [...cartRecoveryTemplates].sort((a, b) => a.delayHours - b.delayHours);
  const sentTemplateIds = new Set(cart.recoveryEmails.map(e => e.templateId));
  const referenceTime = cart.lastActiveAt || cart.updatedAt;
  const hoursSinceAbandonment = (Date.now() - referenceTime.getTime()) / (1000 * 60 * 60);

  console.log('Hours since abandonment:', hoursSinceAbandonment);

  let nextTemplate = null;
  for (const template of sortedTemplates) {
    if (sentTemplateIds.has(template.id)) continue;
    if (hoursSinceAbandonment >= template.delayHours) {
      nextTemplate = template;
      break;
    }
  }

  if (nextTemplate) {
    console.log(`Sending T1: ${nextTemplate.name}`);
    await prisma.recoveryEmail.create({
      data: { cartId: cart.id, templateId: nextTemplate.id, status: 'sent' }
    });
    await prisma.cart.update({ where: { id: cart.id }, data: { recoveryStatus: 'email_sent' } });
  } else {
    throw new Error('T1 should be due');
  }

  // 6. Simulate time passing (25 hours ago)
  console.log('6. Simulating more time passing (25 hours ago)...');
  const twentyFiveHoursAgo = new Date(Date.now() - 25 * 60 * 60 * 1000);
  await prisma.cart.update({
    where: { sessionId },
    data: { lastActiveAt: twentyFiveHoursAgo }
  });

  // 7. Run recovery logic (T2)
  console.log('7. Running recovery (T2)...');
  cart = await prisma.cart.findUnique({ where: { sessionId }, include: { recoveryEmails: true } });
  if (!cart) throw new Error('Cart not found');

  const sentTemplateIds2 = new Set(cart.recoveryEmails.map(e => e.templateId));
  const referenceTime2 = cart.lastActiveAt || cart.updatedAt;
  const hoursSinceAbandonment2 = (Date.now() - referenceTime2.getTime()) / (1000 * 60 * 60);

  console.log('Hours since abandonment (T2 check):', hoursSinceAbandonment2);

  let nextTemplate2 = null;
  for (const template of sortedTemplates) {
    if (sentTemplateIds2.has(template.id)) continue;
    if (hoursSinceAbandonment2 >= template.delayHours) {
      nextTemplate2 = template;
      break;
    }
  }

  if (nextTemplate2) {
    console.log(`Sending T2: ${nextTemplate2.name}`);
    await prisma.recoveryEmail.create({
      data: { cartId: cart.id, templateId: nextTemplate2.id, status: 'sent' }
    });
  } else {
    throw new Error('T2 should be due');
  }

  // Verify 2 emails sent
  const emails = await prisma.recoveryEmail.findMany({ where: { cartId: cart.id } });
  if (emails.length !== 2) throw new Error('Expected 2 recovery emails');

  console.log('Verification successful!');

  // Cleanup
  await prisma.recoveryEmail.deleteMany({ where: { cartId: cart.id } });
  await prisma.cart.delete({ where: { sessionId } });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
