import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const toolsDirectory = path.join(process.cwd(), 'content/tools');

async function syncTools() {
  const enDirectory = path.join(toolsDirectory, 'en');
  if (!fs.existsSync(enDirectory)) {
    console.log('No tools found in content/tools/en');
    return;
  }

  const fileNames = fs.readdirSync(enDirectory);
  console.log(`Found ${fileNames.length} files.`);

  for (const fileName of fileNames) {
    if (!fileName.endsWith('.md')) continue;

    const slug = fileName.replace(/\.md$/, '');
    const fullPath = path.join(enDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data } = matter(fileContents);

    const categoryName = data.category || 'Uncategorized';
    const categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Create or update Category
    let category;
    try {
        category = await prisma.category.upsert({
          where: { slug: categorySlug },
          update: { name: categoryName },
          create: {
            name: categoryName,
            slug: categorySlug
          },
        });
    } catch (e) {
        console.error(`Error syncing category ${categoryName} (${categorySlug}):`, e);
        continue;
    }

    // Create or update Product
    try {
        await prisma.product.upsert({
          where: { slug },
          update: {
            name: data.title,
            description: data.description,
            categoryId: category.id,
            price: data.price?.toString(), // Ensure string
            tags: JSON.stringify(data.tags || []),
            metadata: JSON.stringify({
              rating: data.rating,
              image: data.image,
              affiliate_link: data.affiliate_link,
              pros: data.pros,
              cons: data.cons,
              pricing: data.pricing,
              platform: data.platform
            }),
          },
          create: {
            slug,
            name: data.title,
            description: data.description,
            categoryId: category.id,
            price: data.price?.toString(),
            tags: JSON.stringify(data.tags || []),
            metadata: JSON.stringify({
              rating: data.rating,
              image: data.image,
              affiliate_link: data.affiliate_link,
              pros: data.pros,
              cons: data.cons,
              pricing: data.pricing,
              platform: data.platform
            }),
          },
        });
        console.log(`Synced: ${slug}`);
    } catch (e) {
        console.error(`Error syncing product ${slug}:`, e);
    }
  }

  console.log('Sync complete.');
}

syncTools()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
