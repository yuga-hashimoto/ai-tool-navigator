import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { unstable_cache } from 'next/cache';
import { ToolMetadata } from './tools';

const postsDirectory = path.join(process.cwd(), 'content/posts');

export interface PostMetadata {
  title: string;
  slug: string;
  date: string;
  author: string;
  excerpt: string;
  readingTime: number;
  image?: string;
  tags?: string[];
  source_locale?: string;
  requested_locale?: string;
  is_fallback?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const charactersPerMinute = 500;

  // Check for CJK characters
  const hasCJK = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/.test(content);

  if (hasCJK) {
    // Count characters (approximate, excluding whitespace)
    const charCount = content.replace(/\s+/g, '').length;
    return Math.max(1, Math.ceil(charCount / charactersPerMinute));
  } else {
    // Count words
    const wordCount = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  }
}

export interface Post {
  metadata: PostMetadata;
  content: string;
}

const _getAllPosts = async (locale: string = 'en'): Promise<PostMetadata[]> => {
  const localeDirectory = path.join(postsDirectory, locale);
  const enDirectory = path.join(postsDirectory, 'en');
  const localeFileNames = fs.existsSync(localeDirectory)
    ? fs.readdirSync(localeDirectory).filter((fileName) => fileName.endsWith('.md'))
    : [];
  const enFileNames = fs.existsSync(enDirectory)
    ? fs.readdirSync(enDirectory).filter((fileName) => fileName.endsWith('.md'))
    : [];

  const fileNames = Array.from(new Set([...localeFileNames, ...enFileNames]));
  const allPostsData = fileNames
    .map((fileName) => {
      const id = fileName.replace(/\.md$/, '');
      let fullPath = path.join(localeDirectory, fileName);
      let sourceLocale = locale;

      if (!fs.existsSync(fullPath)) {
        fullPath = path.join(enDirectory, fileName);
        sourceLocale = 'en';
      }

      if (!fs.existsSync(fullPath)) {
        return null;
      }

      const fileContents = fs.readFileSync(fullPath, 'utf8');

      const matterResult = matter(fileContents);

      return {
        slug: id,
        readingTime: calculateReadingTime(matterResult.content),
        source_locale: sourceLocale,
        requested_locale: locale,
        is_fallback: sourceLocale !== locale,
        ...matterResult.data,
      } as PostMetadata;
    })
    .filter((post): post is PostMetadata => post !== null);

  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
};

export const getAllPosts = unstable_cache(
  _getAllPosts,
  ['posts-all'],
  { tags: ['posts'], revalidate: 3600 }
);

const _getPostBySlug = async (slug: string, locale: string = 'en'): Promise<Post | null> => {
  let fullPath = path.join(postsDirectory, locale, `${slug}.md`);
  let sourceLocale = locale;

  // Fallback to root or 'en'
  if (!fs.existsSync(fullPath)) {
    fullPath = path.join(postsDirectory, 'en', `${slug}.md`);
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
      readingTime: calculateReadingTime(matterResult.content),
      source_locale: sourceLocale,
      requested_locale: locale,
      is_fallback: sourceLocale !== locale,
      ...matterResult.data,
    } as PostMetadata,
    content: matterResult.content,
  };
};

export const getPostBySlug = unstable_cache(
  _getPostBySlug,
  ['post-slug'],
  { tags: ['posts'], revalidate: 3600 }
);

export function getPostSlugs() {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      return {
        slug: fileName.replace(/\.md$/, ''),
      };
    });
}

const _getRelatedPosts = async (tool: ToolMetadata, limit: number = 3, locale: string = 'en'): Promise<PostMetadata[]> => {
  const allPosts = await getAllPosts(locale);

  if (allPosts.length === 0) {
    return [];
  }

  // Calculate scores for each post
  const scoredPosts = allPosts.map((post) => {
    let score = 0;
    const toolCategory = tool.category.toLowerCase();
    const toolTitle = tool.title.toLowerCase();

    // Check tags
    if (post.tags) {
      post.tags.forEach((tag) => {
        const lowerTag = tag.toLowerCase();
        // Exact category match or partial match
        if (lowerTag === toolCategory || toolCategory.includes(lowerTag) || lowerTag.includes(toolCategory)) {
          score += 3;
        }
        // Title match
        if (toolTitle.includes(lowerTag)) {
           score += 2;
        }
      });
    }

    // Check post title match
    if (post.title.toLowerCase().includes(toolCategory)) {
        score += 1;
    }

    return { post, score };
  });

  // Filter posts with score > 0 and sort by score descending
  let related = scoredPosts
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.post);

  // If we don't have enough related posts, fill with recent posts
  if (related.length < limit) {
    const usedSlugs = new Set(related.map(p => p.slug));
    const recent = allPosts
        .filter(p => !usedSlugs.has(p.slug))
        // allPosts is already sorted by date
        .slice(0, limit - related.length);
    related = [...related, ...recent];
  }

  return related.slice(0, limit);
}

export const getRelatedPosts = unstable_cache(
  _getRelatedPosts,
  ['related-posts'],
  { tags: ['posts'], revalidate: 3600 }
);
