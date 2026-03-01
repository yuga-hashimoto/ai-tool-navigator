/**
 * Tool of the Week Scheduler
 * 
 * This module handles automatic rotation of the Tool of the Week feature.
 * It can be run via cron or as a scheduled function.
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const TOOLS_DIR = path.join(process.cwd(), 'content/tools/en');
const POSTS_DIR = path.join(process.cwd(), 'content/posts/en/tool-of-the-week');

// Tools ranked by various metrics for selection
const SELECTION_PRIORITIES = [
  'rating',           // Higher rated tools first
  'featured',         // Featured tools preferred
  'updated',          // Recently updated tools
  'category_diversity', // Ensure variety across categories
];

export interface SchedulerConfig {
  rotationDay: number;        // 0-6 (Sunday-Saturday)
  maxToolsPerWeek: number;
  considerCategories: boolean;
  minRatingThreshold: number;
}

const DEFAULT_CONFIG: SchedulerConfig = {
  rotationDay: 1,             // Monday
  maxToolsPerWeek: 1,
  considerCategories: true,
  minRatingThreshold: 4.0,
};

/**
 * Get all available tools from the content directory
 */
export async function getAvailableTools(): Promise<Tool[]> {
  if (!fs.existsSync(TOOLS_DIR)) {
    console.log('Tools directory not found');
    return [];
  }

  const files = fs.readdirSync(TOOLS_DIR).filter(f => f.endsWith('.md'));
  
  const tools: Tool[] = files.map(file => {
    const content = fs.readFileSync(path.join(TOOLS_DIR, file), 'utf-8');
    const { data } = matter(content);
    return {
      slug: file.replace('.md', ''),
      ...data,
    } as Tool;
  });

  return tools;
}

/**
 * Get the current Tool of the Week
 */
export async function getCurrentToolOfTheWeek(): Promise<Tool | null> {
  const tools = await getAvailableTools();
  return tools.find(t => t.tool_of_the_week) || null;
}

/**
 * Get tools that have never been featured as Tool of the Week
 */
export async function getNeverFeaturedTools(): Promise<Tool[]> {
  const tools = await getAvailableTools();
  const featuredPosts = fs.existsSync(POSTS_DIR) 
    ? fs.readdirSync(POSTS_DIR).filter(f => f.startsWith('tool-of-the-week-'))
    : [];
  
  const featuredSlugs = featuredPosts.map(post => {
    // Extract slug from filename like "tool-of-the-week-2026-02-14-cursor-ai.md"
    const match = post.match(/tool-of-the-week-\d{4}-\d{2}-\d{2}-(.+)\.md/);
    return match ? match[1] : null;
  }).filter(Boolean);

  return tools.filter(tool => !featuredSlugs.includes(tool.slug));
}

/**
 * Select the next Tool of the Week based on criteria
 */
export async function selectNextToolOfTheWeek(
  config: SchedulerConfig = DEFAULT_CONFIG
): Promise<Tool | null> {
  const tools = await getAvailableTools();
  const eligibleTools = tools.filter(tool => {
    // Filter by minimum rating
    if (tool.rating < config.minRatingThreshold) {
      return false;
    }
    return true;
  });

  if (eligibleTools.length === 0) {
    console.log('No eligible tools found');
    return null;
  }

  // Score tools based on criteria
  const scoredTools = eligibleTools.map(tool => {
    let score = 0;
    
    // Rating score (0-40 points)
    score += (tool.rating || 0) * 10;
    
    // Featured bonus (10 points)
    if (tool.featured) score += 10;
    
    // Recently updated bonus (5 points if updated in last 30 days)
    if (tool.last_updated) {
      const updated = new Date(tool.last_updated);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      if (updated > thirtyDaysAgo) score += 5;
    }
    
    // Never featured bonus (20 points)
    score += 20;
    
    return { tool, score };
  });

  // Sort by score descending
  scoredTools.sort((a, b) => b.score - a.score);

  return scoredTools[0]?.tool || null;
}

/**
 * Check if it's time to rotate the Tool of the Week
 */
export function shouldRotate(config: SchedulerConfig = DEFAULT_CONFIG): boolean {
  const now = new Date();
  const today = now.getDay(); // 0-6 (Sunday-Saturday)
  return today === config.rotationDay;
}

/**
 * Generate the next Tool of the Week post content
 */
export async function generateToolOfTheWeekPost(
  tool: Tool,
  locale: string = 'en'
): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  
  const frontMatter = `---
title: "${tool.title}: Our Tool of the Week - ${today.toLocaleDateString()}"
slug: "tool-of-the-week-${dateStr}-${tool.slug}"
date: "${dateStr}"
author: "AI Tool Navigator Team"
excerpt: "${tool.description}"
tags: ["Tool of the Week", "${tool.category}", "Featured Tool"]
tool_of_the_week: true
related_tools: []
featured: true
---

## Why ${tool.title} Is Our Tool of the Week

${tool.title} stands out as an exceptional tool in the ${tool.category} space. With a rating of ${tool.rating}/5, it has consistently impressed our team and the community with its powerful features and user-friendly interface.

${tool.pros && tool.pros.length > 0 ? `
### What We Love

${tool.pros.slice(0, 3).map((pro: string) => `- ${pro}`).join('\n')}
` : ''}

${tool.cons && tool.cons.length > 0 ? `
### Considerations

${tool.cons.slice(0, 2).map((con: string) => `- ${con}`).join('\n')}
` : ''}

## Key Features

${tool.title} offers a range of powerful capabilities that make it a top choice:

- **Core Functionality**: [Describe the main functionality]
- **User Experience**: [Describe the UX]
- **Value for Money**: [Describe pricing value]

## Getting Started

Ready to try ${tool.title}? Here's how to get started:

1. Visit the [official website](${tool.affiliate_link})
2. Sign up for a free account
3. Explore the key features
4. Upgrade to a paid plan for commercial use

## Related Tools

Looking for alternatives or complementary tools? Check out:

- [Browse all ${tool.category} tools](/tools/category/${tool.category.toLowerCase().replace(/\s+/g, '-')})

## Final Thoughts

${tool.title} earns our "Tool of the Week" designation for its combination of powerful features, excellent user experience, and strong community support. Whether you're a beginner or an experienced user, ${tool.title} has something to offer.

Have you tried ${tool.title}? Let us know your experience in the comments!

---

*This post is part of our ongoing "Tool of the Week" series, highlighting the best and most innovative tools in the AI and productivity space.*
`;

  return frontMatter;
}

/**
 * Save the Tool of the Week post
 */
export async function saveToolOfTheWeekPost(
  tool: Tool,
  content: string
): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  const filename = `tool-of-the-week-${dateStr}-${tool.slug}.md`;
  
  if (!fs.existsSync(POSTS_DIR)) {
    fs.mkdirSync(POSTS_DIR, { recursive: true });
  }
  
  const filepath = path.join(POSTS_DIR, filename);
  fs.writeFileSync(filepath, content);
  
  return filepath;
}

/**
 * Main scheduler function - call this to run the rotation
 */
export async function runToolOfTheWeekScheduler(
  config: SchedulerConfig = DEFAULT_CONFIG
): Promise<{ success: boolean; message: string; tool?: string }> {
  console.log('Running Tool of the Week Scheduler...');
  
  // Check if rotation is needed
  if (!shouldRotate(config)) {
    console.log('Not time for rotation. Next rotation day:', config.rotationDay);
    return { 
      success: false, 
      message: 'Not time for scheduled rotation' 
    };
  }
  
  // Select next tool
  const nextTool = await selectNextToolOfTheWeek(config);
  
  if (!nextTool) {
    return { 
      success: false, 
      message: 'No eligible tools found for Tool of the Week' 
    };
  }
  
  // Generate and save post
  const postContent = await generateToolOfTheWeekPost(nextTool);
  const filepath = await saveToolOfTheWeekPost(nextTool, postContent);
  
  console.log(`Tool of the Week post created: ${filepath}`);
  
  return { 
    success: true, 
    message: `Tool of the Week post created for ${nextTool.title}`,
    tool: nextTool.title 
  };
}

// TypeScript interface for Tool
export interface Tool {
  slug: string;
  title: string;
  category: string;
  description: string;
  rating: number;
  pros?: string[];
  cons?: string[];
  affiliate_link: string;
  featured?: boolean;
  tool_of_the_week?: boolean;
  last_updated?: string;
  [key: string]: unknown;
}
