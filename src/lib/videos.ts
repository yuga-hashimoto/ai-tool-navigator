import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const videosDirectory = path.join(process.cwd(), 'content/videos');

export interface VideoMetadata {
  slug: string;
  title: string;
  description: string;
  videoUrl: string;
  videoType: 'youtube' | 'local';
  thumbnailUrl: string;
  duration?: number; // seconds
  uploadDate: string;
  transcript?: string;
  captionsUrl?: string; // .vtt file
  monetization?: {
    enabled: boolean;
    type: 'ad' | 'premium';
    price?: number;
    adTimestamps?: number[];
  };
  seo?: {
    keywords: string[];
  };
  [key: string]: any;
}

export interface Video {
  metadata: VideoMetadata;
  content: string; // Markdown content if any (maybe transcript or show notes)
}

export function getAllVideos(): VideoMetadata[] {
  if (!fs.existsSync(videosDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(videosDirectory);
  const allVideosData = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(videosDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const matterResult = matter(fileContents);

      return {
        slug,
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
}

export function getVideoBySlug(slug: string): Video | null {
  const fullPath = path.join(videosDirectory, `${slug}.md`);

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
}

export function saveVideo(slug: string, data: Omit<VideoMetadata, 'slug'>, content: string = ''): void {
  if (!fs.existsSync(videosDirectory)) {
    fs.mkdirSync(videosDirectory, { recursive: true });
  }

  const fullPath = path.join(videosDirectory, `${slug}.md`);
  const fileContent = matter.stringify(content, data);

  fs.writeFileSync(fullPath, fileContent);
}

export function deleteVideo(slug: string): void {
  const fullPath = path.join(videosDirectory, `${slug}.md`);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
}
