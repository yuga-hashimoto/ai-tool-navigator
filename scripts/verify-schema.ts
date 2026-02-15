import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL || "file:./dev.db"
});

async function main() {
  console.log('Verifying schema...');

  // Try to create a dummy product
  const slug = 'verify-schema-test-' + Date.now();
  const product = await prisma.product.create({
    data: {
      slug: slug,
      title: 'Test Product',
      category: 'Test',
      verified: false
    }
  });

  console.log(`Created product with id: ${product.id}`);

  // Verify it exists
  const retrieved = await prisma.product.findUnique({
    where: { slug: slug }
  });

  if (!retrieved) {
    throw new Error('Failed to retrieve created product');
  }

  console.log('Product retrieved successfully');

  // Delete it
  await prisma.product.delete({
    where: { id: product.id }
  });

  console.log('Product deleted successfully');
  console.log('Schema verification passed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
