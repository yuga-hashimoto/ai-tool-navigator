import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, details, location } = body;

    if (!type) {
      return NextResponse.json(
        { error: "Missing type" },
        { status: 400 }
      );
    }

    const activity = await prisma.userActivity.create({
      data: {
        type,
        details: details ? JSON.stringify(details) : undefined,
        location: location || null,
      },
    });

    return NextResponse.json({ success: true, activity });
  } catch (error) {
    console.error("Error creating activity:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const slug = searchParams.get("slug");

    // Recent global activities
    const activities = await prisma.userActivity.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    // Active viewers count (global)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const activeViewers = await prisma.userActivity.count({
        where: {
            type: 'VIEW',
            createdAt: {
                gte: fifteenMinutesAgo
            }
        }
    });

    // Tool specific stats if slug is provided
    let toolStats = null;
    if (slug) {
        const toolViewers = await prisma.userActivity.count({
            where: {
                type: 'VIEW',
                details: {
                    contains: `"slug":"${slug}"`
                },
                createdAt: {
                    gte: fifteenMinutesAgo
                }
            }
        });
        toolStats = { activeViewers: toolViewers };
    }

    return NextResponse.json({ activities, activeViewers, toolStats });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
