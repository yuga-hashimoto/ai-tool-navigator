import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { ToolMetadata } from './tools';

const postsDirectory = path.join(process.cwd(), 'content/posts');

export interface PostMetadata {
  title: string;
  slug: string;
  date: string;
  author: string;
  excerpt: string;
  image?: string;
  tags?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface Post {
  metadata: PostMetadata;
  content: string;
}

export function getAllPosts(locale: string = 'en'): PostMetadata[] {
  // Try to find posts for the requested locale
  const localeDirectory = path.join(postsDirectory, locale);
  
  // If locale directory doesn't exist, fallback to root postsDirectory or 'en'
  let targetDirectory = localeDirectory;
  if (!fs.existsSync(localeDirectory)) {
    targetDirectory = postsDirectory;
  }

  const fileNames = fs.readdirSync(targetDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      // Remove ".md" from file name to get id
      const id = fileName.replace(/\.md$/, '');

      // Read markdown file as string
    const fullPath = path.join(targetDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Combine the data with the id
    return {
      slug: id,
      ...matterResult.data,
    } as PostMetadata;
  });

  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getPostBySlug(slug: string, locale: string = 'en'): Post | null {
  let fullPath = path.join(postsDirectory, locale, `${slug}.md`);

  // Fallback to root or 'en'
  if (!fs.existsSync(fullPath)) {
    fullPath = path.join(postsDirectory, `${slug}.md`);
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
    } as PostMetadata,
    content: matterResult.content,
  };
}

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

export function getRelatedPosts(tool: ToolMetadata, limit: number = 3, locale: string = 'en'): PostMetadata[] {
  const allPosts = getAllPosts(locale);

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
