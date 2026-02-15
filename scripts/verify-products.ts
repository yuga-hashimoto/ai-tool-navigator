import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL || "file:./dev.db"
});

async function main() {
  console.log('Verifying products in database...');

  const count = await prisma.product.count();
  console.log(`Total products: ${count}`);

  const products = await prisma.product.findMany({
    take: 3
  });

  console.log('Sample products:');
  products.forEach(p => {
    console.log(`- ${p.title} (${p.slug})`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
