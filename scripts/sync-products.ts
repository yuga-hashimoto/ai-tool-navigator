import { PrismaClient } from '@prisma/client';
import { getAllTools } from '../src/lib/tools';

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL || "file:./dev.db"
});

async function main() {
  console.log('Syncing products from markdown to database...');

  // getAllTools is using next/cache which might not work in a script environment easily without a workaround or if it relies on Next.js build context.
  // However, getAllTools implementation imports 'fs' and reads files directly, so it should work if we can bypass the cache wrapper or if the cache wrapper works in node.
  // The cache wrapper `unstable_cache` is imported from `next/cache`. This might fail in a standalone script.
  // I should check if I can import `_getAllTools` (the underlying function) but it is not exported.
  // I might need to copy the logic or modify src/lib/tools.ts to export the raw function.
  // Modifying src/lib/tools.ts is cleaner.

  // Wait, let's try to import it first. If it fails, I'll modify tools.ts.

  try {
     const tools = await getAllTools('en');
     console.log(`Found ${tools.length} tools to sync.`);

      for (const tool of tools) {
        try {
          await prisma.product.upsert({
            where: { slug: tool.slug },
            update: {
              title: tool.title,
              description: tool.description,
              category: tool.category,
              tags: JSON.stringify(tool.tags || []),
              image: tool.image,
              rating: tool.rating,
              verified: tool.verified || false,
              lastUpdated: tool.last_updated ? new Date(tool.last_updated) : undefined,
              metadata: JSON.stringify(tool)
            },
            create: {
              slug: tool.slug,
              title: tool.title,
              description: tool.description,
              category: tool.category,
              tags: JSON.stringify(tool.tags || []),
              image: tool.image,
              rating: tool.rating,
              verified: tool.verified || false,
              lastUpdated: tool.last_updated ? new Date(tool.last_updated) : undefined,
              metadata: JSON.stringify(tool)
            }
          });
          process.stdout.write('.');
        } catch (error) {
          console.error(`\nFailed to sync tool: ${tool.slug}`, error);
        }
      }
      console.log('\nSync complete.');

  } catch (e) {
      console.error("Error fetching tools using getAllTools. It likely depends on Next.js context.", e);
      console.log("Attempting to replicate logic...");
      // Replicate logic here if needed
      const fs = require('fs');
      const path = require('path');
      const matter = require('gray-matter');

      const toolsDirectory = path.join(process.cwd(), 'content/tools');
      const enDirectory = path.join(toolsDirectory, 'en');

      if (!fs.existsSync(enDirectory)) {
        console.log("No tools directory found.");
        return;
      }

      const fileNames = fs.readdirSync(enDirectory);
      const allToolsData = fileNames.map((fileName) => {
        const id = fileName.replace(/\.md$/, '');
        const fullPath = path.join(enDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const matterResult = matter(fileContents);
        return {
          slug: id,
          ...matterResult.data,
        };
      });

      console.log(`Found ${allToolsData.length} tools to sync (fallback).`);

      for (const tool of allToolsData) {
        try {
          await prisma.product.upsert({
            where: { slug: tool.slug },
            update: {
              title: tool.title,
              description: tool.description,
              category: tool.category,
              tags: JSON.stringify(tool.tags || []),
              image: tool.image,
              rating: tool.rating,
              verified: tool.verified || false,
              lastUpdated: tool.last_updated ? new Date(tool.last_updated) : undefined,
              metadata: JSON.stringify(tool)
            },
            create: {
              slug: tool.slug,
              title: tool.title,
              description: tool.description,
              category: tool.category,
              tags: JSON.stringify(tool.tags || []),
              image: tool.image,
              rating: tool.rating,
              verified: tool.verified || false,
              lastUpdated: tool.last_updated ? new Date(tool.last_updated) : undefined,
              metadata: JSON.stringify(tool)
            }
          });
          process.stdout.write('.');
        } catch (error) {
          console.error(`\nFailed to sync tool: ${tool.slug}`, error);
        }
      }
       console.log('\nSync complete (fallback).');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
