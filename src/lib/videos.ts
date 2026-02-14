import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { unstable_cache } from 'next/cache';

const videosDirectory = path.join(process.cwd(), 'content/videos');

export interface VideoTranscript {
  language: string;
  text: string; // Could be simple text or JSON string with timestamps
  src?: string; // Path to VTT file
}

export interface VideoMetadata {
  title: string;
  slug: string;
  description: string;
  videoUrl: string; // YouTube ID or file URL
  thumbnailUrl?: string;
  duration?: string; // ISO 8601 duration
  uploadDate: string;
  author?: string;
  transcripts?: VideoTranscript[];
  monetization?: {
    isPremium: boolean;
    ads: boolean;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface Video {
  metadata: VideoMetadata;
  content: string;
}

const _getAllVideos = async (locale: string = 'en'): Promise<VideoMetadata[]> => {
  // Try to find videos for the requested locale
  const localeDirectory = path.join(videosDirectory, locale);

  // If locale directory doesn't exist, fallback to root videosDirectory or 'en'
  let targetDirectory = localeDirectory;
  if (!fs.existsSync(localeDirectory)) {
    // try fallback to en if current locale not found
    targetDirectory = path.join(videosDirectory, 'en');
    if (!fs.existsSync(targetDirectory)) {
        // if even en doesn't exist, just return empty
        return [];
    }
  }

  const fileNames = fs.readdirSync(targetDirectory);
  const allVideosData = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      // Remove ".md" from file name to get id
      const id = fileName.replace(/\.md$/, '');

      // Read markdown file as string
      const fullPath = path.join(targetDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');

      // Use gray-matter to parse the video metadata section
      const matterResult = matter(fileContents);

      // Combine the data with the id
      return {
        slug: id,
        ...matterResult.data,
      } as VideoMetadata;
    });

  // Sort videos by date
  return allVideosData.sort((a, b) => {
    if (a.uploadDate < b.uploadDate) {
      return 1;
    } else {
      return -1;
    }
  });
};

export const getAllVideos = unstable_cache(
  _getAllVideos,
  ['videos-all'],
  { tags: ['videos'], revalidate: 3600 }
);

const _getVideoBySlug = async (slug: string, locale: string = 'en'): Promise<Video | null> => {
  let fullPath = path.join(videosDirectory, locale, `${slug}.md`);

  // Fallback to 'en'
  if (!fs.existsSync(fullPath)) {
    fullPath = path.join(videosDirectory, 'en', `${slug}.md`);
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
    } as VideoMetadata,
    content: matterResult.content,
  };
};

export const getVideoBySlug = unstable_cache(
  _getVideoBySlug,
  ['video-slug'],
  { tags: ['videos'], revalidate: 3600 }
);
