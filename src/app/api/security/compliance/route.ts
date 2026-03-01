import { NextRequest, NextResponse } from 'next/server';
import { getComplianceStatus } from '@/lib/security/compliance';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const status = await getComplianceStatus();

    // Also fetch historical/manual records from DB if they exist
    const records = await prisma.complianceRecord.findMany();

    return NextResponse.json({
      status,
      records,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { framework, checkId, status, description, metadata } = body;

    const record = await prisma.complianceRecord.upsert({
      where: {
        framework_checkId: {
          framework,
          checkId,
        },
      },
      update: {
        status,
        description,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
      create: {
        framework,
        checkId,
        name: body.name || checkId,
        status,
        description,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    return NextResponse.json(record);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
