import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const incidents = await prisma.securityIncident.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return NextResponse.json(incidents);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const incident = await prisma.securityIncident.create({
      data: {
        type: body.type,
        severity: body.severity,
        status: 'OPEN',
        source: body.source,
        description: body.description,
        metadata: body.metadata ? JSON.stringify(body.metadata) : null,
      },
    });
    return NextResponse.json(incident);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (data.status === 'RESOLVED' && !data.resolvedAt) {
      data.resolvedAt = new Date();
    }

    const incident = await prisma.securityIncident.update({
      where: { id },
      data,
    });
    return NextResponse.json(incident);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
