/**
 * Tool of the Week Scheduler API Route
 * 
 * POST /api/tool-of-the-week/schedule - Run the scheduler to rotate Tool of the Week
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  runToolOfTheWeekScheduler,
  shouldRotate,
  selectNextToolOfTheWeek,
  getCurrentToolOfTheWeek,
} from '@/lib/scheduler/tool-of-the-week-scheduler';
import { SchedulerConfig } from '@/lib/scheduler/tool-of-the-week-scheduler';

/**
 * GET /api/tool-of-the-week/schedule
 * 
 * Check scheduler status and get rotation info
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const locale = searchParams.get('locale') || 'en';
  
  try {
    const currentTool = await getCurrentToolOfTheWeek();
    const shouldRotateNow = shouldRotate();
    const nextTool = await selectNextToolOfTheWeek();
    
    // Calculate next rotation time
    const now = new Date();
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7 || 7));
    nextMonday.setHours(0, 0, 0, 0);
    
    return NextResponse.json({
      currentTool,
      shouldRotate: shouldRotateNow,
      nextRotation: nextMonday.toISOString(),
      suggestedNextTool: nextTool,
    });
  } catch (error) {
    console.error('Error checking scheduler status:', error);
    return NextResponse.json(
      { error: 'Failed to check scheduler status' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tool-of-the-week/schedule
 * 
 * Body (optional):
 * {
 *   force?: boolean,    // Force rotation even if not scheduled
 *   toolSlug?: string,  // Manually specify tool to feature
 *   locale?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { force = false, toolSlug, locale = 'en' } = body;
    
    // If toolSlug is provided, manually set that tool
    if (toolSlug) {
      const result = await manualRotation(toolSlug, locale);
      return NextResponse.json(result);
    }
    
    // Otherwise run automatic scheduler
    if (!force && !shouldRotate()) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Not time for rotation. Use { force: true } to override.',
          nextRotation: calculateNextRotation(),
        },
        { status: 400 }
      );
    }
    
    const result = await runToolOfTheWeekScheduler({
      rotationDay: 1,
      maxToolsPerWeek: 1,
      considerCategories: true,
      minRatingThreshold: 4.0,
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error running scheduler:', error);
    return NextResponse.json(
      { error: 'Failed to run scheduler' },
      { status: 500 }
    );
  }
}

/**
 * Manually set a specific tool as Tool of the Week
 */
async function manualRotation(slug: string, locale: string) {
  const { getAllTools, ToolMetadata } = await import('@/lib/tools');
  const fs = await import('fs');
  const path = await import('path');
  
  const tools = await getAllTools(locale);
  const tool = tools.find(t => t.slug === slug);
  
  if (!tool) {
    return { success: false, message: 'Tool not found' };
  }
  
  // Update tool metadata files
  const toolsDir = path.join(process.cwd(), 'content/tools/en');
  
  for (const t of tools) {
    const toolPath = path.join(toolsDir, `${t.slug}.md`);
    
    if (fs.existsSync(toolPath)) {
      let content = fs.readFileSync(toolPath, 'utf8');
      
      if (t.slug === slug) {
        content = content.replace(/tool_of_the_week:\s*false/g, 'tool_of_the_week: true');
        if (!content.includes('tool_of_the_week:')) {
          const yamlEnd = content.indexOf('---', 4);
          if (yamlEnd !== -1) {
            content = content.slice(0, yamlEnd) + 'tool_of_the_week: true\n' + content.slice(yamlEnd);
          }
        }
      } else {
        content = content.replace(/tool_of_the_week:\s*true/g, 'tool_of_the_week: false');
      }
      
      fs.writeFileSync(toolPath, content);
    }
  }
  
  return {
    success: true,
    message: `${tool.title} is now the Tool of the Week (manually set)`,
    tool: tool,
  };
}

/**
 * Calculate next rotation date
 */
function calculateNextRotation(): string {
  const now = new Date();
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7 || 7));
  nextMonday.setHours(0, 0, 0, 0);
  return nextMonday.toISOString();
}
