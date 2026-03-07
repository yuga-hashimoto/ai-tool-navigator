import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { unstable_cache } from 'next/cache';

const toolsDirectory = path.join(process.cwd(), 'content/tools');

export interface ToolMetadata {
  title: string;
  slug: string;
  category: string;
  description: string;
  rating: number;
  rating_breakdown?: Record<string, number>;
  image?: string;
  pros?: string[];
  cons?: string[];
  affiliate_link: string;
  promoted?: boolean;
  featured?: boolean;
  sponsored?: boolean;
  tool_of_the_week?: boolean;
  last_updated?: string;
  verified?: boolean;
  discount?: string;
  // Advanced search fields
  pricing?: 'free' | 'freemium' | 'paid' | 'contact';
  price?: string;
  platform?: ('Web' | 'Mobile' | 'Desktop')[];
  source_locale?: string;
  requested_locale?: string;
  is_fallback?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface Tool {
  metadata: ToolMetadata;
  content: string;
}

const _getAllTools = async (locale: string = 'en'): Promise<ToolMetadata[]> => {
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
    let sourceLocale = locale;

    // Fallback to English if file doesn't exist in requested locale
    if (!fs.existsSync(fullPath)) {
        fullPath = path.join(toolsDirectory, 'en', fileName);
        sourceLocale = 'en';
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Combine the data with the id
    return {
      slug: id,
      source_locale: sourceLocale,
      requested_locale: locale,
      is_fallback: sourceLocale !== locale,
      ...matterResult.data,
    } as ToolMetadata;
  });

  return allToolsData;
};

export const getAllTools = unstable_cache(
  _getAllTools,
  ['tools-all'],
  { tags: ['tools'], revalidate: 3600 }
);

export const getToolBySlugRaw = async (slug: string, locale: string = 'en'): Promise<Tool | null> => {
  let fullPath = path.join(toolsDirectory, locale, `${slug}.md`);
  let sourceLocale = locale;

  // Fallback to English
  if (!fs.existsSync(fullPath)) {
    fullPath = path.join(toolsDirectory, 'en', `${slug}.md`);
    sourceLocale = 'en';
  }

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);

  return {
    metadata: {
      slug,
      source_locale: sourceLocale,
      requested_locale: locale,
      is_fallback: sourceLocale !== locale,
      ...matterResult.data,
    } as ToolMetadata,
    content: matterResult.content,
  };
};

export const getToolBySlug = unstable_cache(
  getToolBySlugRaw,
  ['tool-slug'],
  { tags: ['tools'], revalidate: 3600 }
);

const _getToolOfTheWeek = async (locale: string = 'en'): Promise<ToolMetadata | null> => {
  const tools = await getAllTools(locale);
  return tools.find((tool) => tool.tool_of_the_week) || null;
}

export const getToolOfTheWeek = unstable_cache(
  _getToolOfTheWeek,
  ['tool-of-the-week'],
  { tags: ['tools'], revalidate: 3600 }
);

export function getToolSlugs() {
  const locales = ['en', 'ja'];
  const allParams: { slug: string; locale: string }[] = [];

  locales.forEach((locale) => {
    const dir = path.join(toolsDirectory, locale);
    if (fs.existsSync(dir)) {
      const fileNames = fs.readdirSync(dir);
      fileNames.forEach((fileName) => {
        if (fileName.endsWith('.md')) {
          allParams.push({
            slug: fileName.replace(/\.md$/, ''),
            locale: locale,
          });
        }
      });
    }
  });

  return allParams;
}

const _getRelatedTools = async (currentTool: ToolMetadata, limit: number = 3, locale: string = 'en'): Promise<ToolMetadata[]> => {
  const allTools = await getAllTools(locale);
  const candidates = allTools.filter(
    (tool) => tool.category === currentTool.category && tool.slug !== currentTool.slug
  );

  // Shuffle the candidates array
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  return candidates.slice(0, limit);
}

export const getRelatedTools = unstable_cache(
  _getRelatedTools,
  ['related-tools'],
  { tags: ['tools'], revalidate: 3600 }
);
