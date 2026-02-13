/**
 * Tool of the Week API Route
 * 
 * GET /api/tool-of-the-week - Get current Tool of the Week
 * POST /api/tool-of-the-week - Set a new Tool of the Week
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllTools, ToolMetadata } from '@/lib/tools';
import fs from 'fs';
import path from 'path';

const TOOLS_DIR = path.join(process.cwd(), 'content/tools/en');

interface ToolOfTheWeekResponse {
  tool: ToolMetadata | null;
  nextRotation?: string;
  previousTools?: Array<{ title: string; date: string }>;
}

/**
 * GET /api/tool-of-the-week
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const locale = searchParams.get('locale') || 'en';
  
  try {
    const tools = await getAllTools(locale);
    const currentTool = tools.find((tool) => tool.tool_of_the_week) || null;
    
    // Calculate next rotation (next Monday)
    const now = new Date();
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7 || 7));
    nextMonday.setHours(0, 0, 0, 0);
    
    // Get previous Tool of the Week posts if directory exists
    const postsDir = path.join(process.cwd(), 'content/posts/en/tool-of-the-week');
    let previousTools: Array<{ title: string; date: string }> = [];
    
    if (fs.existsSync(postsDir)) {
      const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
      previousTools = files.slice(-4).map(file => {
        const filename = file.replace('tool-of-the-week-', '').replace('.md', '');
        const parts = filename.split('-');
        const date = `${parts[0]}-${parts[1]}-${parts[2]}`;
        const titleSlug = parts.slice(3).join('-');
        return {
          title: titleSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          date,
        };
      });
    }
    
    const response: ToolOfTheWeekResponse = {
      tool: currentTool,
      nextRotation: nextMonday.toISOString(),
      previousTools: previousTools.reverse(),
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching Tool of the Week:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Tool of the Week' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tool-of-the-week
 * 
 * Body:
 * {
 *   slug: string,      // Tool slug to feature
 *   locale?: string    // Optional locale
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, locale = 'en' } = body;
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Tool slug is required' },
        { status: 400 }
      );
    }
    
    const tools = await getAllTools(locale);
    const toolToFeature = tools.find((tool) => tool.slug === slug);
    
    if (!toolToFeature) {
      return NextResponse.json(
        { error: 'Tool not found' },
        { status: 404 }
      );
    }
    
    // Update tool_of_the_week flag for all tools
    const toolsDir = path.join(TOOLS_DIR, '*.md');
    
    for (const tool of tools) {
      const toolPath = path.join(TOOLS_DIR, `${tool.slug}.md`);
      
      if (fs.existsSync(toolPath)) {
        let content = fs.readFileSync(toolPath, 'utf8');
        
        if (tool.slug === slug) {
          // Add tool_of_the_week: true if not present
          if (!content.includes('tool_of_the_week:')) {
            const yamlEnd = content.indexOf('---', 4);
            if (yamlEnd !== -1) {
              content = content.slice(0, yamlEnd) + 'tool_of_the_week: true\n' + content.slice(yamlEnd);
            }
          }
          content = content.replace(/tool_of_the_week:\s*false/g, 'tool_of_the_week: true');
          content = content.replace(/tool_of_the_week:\s*true\n/g, 'tool_of_the_week: true\n');
          // Remove duplicate tool_of_the_week lines
          const lines = content.split('\n');
          const seen = new Set();
          const deduped = lines.filter(line => {
            if (line.startsWith('tool_of_the_week:')) {
              if (seen.has('tool_of_the_week')) return false;
              seen.add('tool_of_the_week');
              return true;
            }
            return true;
          });
          content = deduped.join('\n');
        } else {
          // Remove tool_of_the_week from other tools
          content = content.replace(/tool_of_the_week:\s*true/g, 'tool_of_the_week: false');
        }
        
        fs.writeFileSync(toolPath, content);
      }
    }
    
    // Revalidate the cache
    // In a real app, you'd use revalidatePath from next/cache
    
    return NextResponse.json({
      success: true,
      message: `${toolToFeature.title} is now the Tool of the Week`,
      tool: toolToFeature,
    });
  } catch (error) {
    console.error('Error setting Tool of the Week:', error);
    return NextResponse.json(
      { error: 'Failed to set Tool of the Week' },
      { status: 500 }
    );
  }
}
