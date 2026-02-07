import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const toolsDirectory = path.join(process.cwd(), 'content/tools');

export interface ToolMetadata {
  title: string;
  slug: string;
  category: string;
  description: string;
  rating: number;
  pros: string[];
  cons: string[];
  affiliate_link: string;
  [key: string]: any;
}

export interface Tool {
  metadata: ToolMetadata;
  content: string;
}

export function getAllTools(): ToolMetadata[] {
  // Ensure directory exists
  if (!fs.existsSync(toolsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(toolsDirectory);
  const allToolsData = fileNames.map((fileName) => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, '');

    // Read markdown file as string
    const fullPath = path.join(toolsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Combine the data with the id
    return {
      slug: id,
      ...matterResult.data,
    } as ToolMetadata;
  });

  return allToolsData;
}

export function getToolBySlug(slug: string): Tool | null {
  const fullPath = path.join(toolsDirectory, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);

  return {
    metadata: {
      slug,
      ...matterResult.data,
    } as ToolMetadata,
    content: matterResult.content,
  };
}

export function getToolSlugs() {
  if (!fs.existsSync(toolsDirectory)) {
    return [];
  }
  const fileNames = fs.readdirSync(toolsDirectory);
  return fileNames.map((fileName) => {
    return {
      slug: fileName.replace(/\.md$/, ''),
    };
  });
}
