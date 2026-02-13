/**
 * Availability Check API Route
 * 
 * GET /api/availability/[toolSlug]
 * - Returns real-time availability status for a tool
 * - Supports batch checking via POST
 */

import { NextRequest, NextResponse } from 'next/server';

// Simulated availability data (in production, this would query actual services)
const availabilityData: Record<string, boolean> = {
  // Add actual tool availability data here
};

// GET single tool availability
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ toolSlug: string }> }
) {
  const { toolSlug } = await params;
  
  try {
    // Simulate API latency for realistic behavior
    await new Promise(resolve => setTimeout(resolve, 100));

    // In production, this would:
    // 1. Check actual service availability
    // 2. Check inventory systems
    // 3. Check third-party APIs
    
    const available = availabilityData[toolSlug] ?? Math.random() > 0.1;

    return NextResponse.json({
      toolSlug,
      available,
      timestamp: new Date().toISOString(),
      cached: false,
    }, {
      headers: {
        // Cache for 5 minutes
        'Cache-Control': 'public, max-age=300, s-maxage=300',
      },
    });
  } catch (error) {
    console.error(`[Availability API] Error checking ${toolSlug}:`, error);
    return NextResponse.json(
      { error: 'Failed to check availability', toolSlug },
      { status: 500 }
    );
  }
}

// POST batch availability check
export async function POST(request: NextRequest) {
  try {
    const { toolSlugs } = await request.json();

    if (!Array.isArray(toolSlugs) || toolSlugs.length === 0) {
      return NextResponse.json(
        { error: 'toolSlugs must be a non-empty array' },
        { status: 400 }
      );
    }

    // Limit batch size
    const limitedSlugs = toolSlugs.slice(0, 20);

    // Check availability in parallel
    const results = await Promise.all(
      limitedSlugs.map(async (slug: string) => {
        // Simulate API latency
        await new Promise(resolve => setTimeout(resolve, 50));
        
        const available = availabilityData[slug] ?? Math.random() > 0.1;
        
        return {
          toolSlug: slug,
          available,
          timestamp: new Date().toISOString(),
        };
      })
    );

    // Return as object for easier lookup
    const availabilityMap = results.reduce((acc, result) => {
      acc[result.toolSlug] = result.available;
      return acc;
    }, {} as Record<string, boolean>);

    return NextResponse.json({
      availability: availabilityMap,
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=300',
      },
    });
  } catch (error) {
    console.error('[Availability API] Batch check error:', error);
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    );
  }
}
