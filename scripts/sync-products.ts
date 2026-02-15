import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const prisma = new PrismaClient();
const toolsDirectory = path.join(process.cwd(), 'content/tools');

async function getAllTools() {
  const enDirectory = path.join(toolsDirectory, 'en');
  if (!fs.existsSync(enDirectory)) return [];

  const fileNames = fs.readdirSync(enDirectory);
  return fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, '');
    const fullPath = path.join(enDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);
    return {
      slug,
      ...matterResult.data,
    };
  });
}

async function main() {
  console.log('Starting sync...');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tools: any[] = await getAllTools();

  console.log(`Found ${tools.length} tools.`);

  for (const tool of tools) {
    console.log(`Syncing ${tool.slug}...`);
    await prisma.product.upsert({
      where: { slug: tool.slug },
      update: {
        name: tool.title,
        category: tool.category,
        description: tool.description,
        rating: tool.rating || 0,
        tags: tool.platform ? JSON.stringify(tool.platform) : null,
      },
      create: {
        slug: tool.slug,
        name: tool.title,
        category: tool.category,
        description: tool.description,
        rating: tool.rating || 0,
        tags: tool.platform ? JSON.stringify(tool.platform) : null,
      },
    });
  }

  console.log('Sync complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
