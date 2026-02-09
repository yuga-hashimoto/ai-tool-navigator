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
  pros?: string[];
  cons?: string[];
  affiliate_link: string;
  promoted?: boolean;
  last_updated?: string;
  verified?: boolean;
  discount?: string;
  [key: string]: any;
}

export interface Tool {
  metadata: ToolMetadata;
  content: string;
}

export function getAllTools(locale: string = 'en'): ToolMetadata[] {
  const enDirectory = path.join(toolsDirectory, 'en');
  // Ensure directory exists
  if (!fs.existsSync(enDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(enDirectory);
  const allToolsData = fileNames.map((fileName) => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, '');

    // Try to find the file in the requested locale
    let fullPath = path.join(toolsDirectory, locale, fileName);

    // Fallback to English if file doesn't exist in requested locale
    if (!fs.existsSync(fullPath)) {
        fullPath = path.join(toolsDirectory, 'en', fileName);
    }

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

export function getToolBySlug(slug: string, locale: string = 'en'): Tool | null {
  let fullPath = path.join(toolsDirectory, locale, `${slug}.md`);

  // Fallback to English
  if (!fs.existsSync(fullPath)) {
    fullPath = path.join(toolsDirectory, 'en', `${slug}.md`);
  }

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
  const enDirectory = path.join(toolsDirectory, 'en');
  if (!fs.existsSync(enDirectory)) {
    return [];
  }
  const fileNames = fs.readdirSync(enDirectory);
  return fileNames.map((fileName) => {
    return {
      slug: fileName.replace(/\.md$/, ''),
    };
  });
}

export function getRelatedTools(currentTool: ToolMetadata, limit: number = 3, locale: string = 'en'): ToolMetadata[] {
  const allTools = getAllTools(locale);
  return allTools
    .filter((tool) => tool.category === currentTool.category && tool.slug !== currentTool.slug)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}
