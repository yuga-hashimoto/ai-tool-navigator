import { NextRequest, NextResponse } from 'next/server';
import { runVulnerabilityScan } from '@/lib/security/vulnerability-scanner';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const scans = await prisma.vulnerabilityScan.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    return NextResponse.json(scans);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Create scan record
    const scan = await prisma.vulnerabilityScan.create({
      data: {
        scanType: 'AUTOMATED',
        status: 'RUNNING',
      },
    });

    // 2. Run scan (In a real app, this should be a background job)
    const results = await runVulnerabilityScan();

    const passedCount = results.filter(r => r.status === 'passed').length;
    const score = Math.round((passedCount / results.length) * 100);

    // 3. Update scan record
    const updatedScan = await prisma.vulnerabilityScan.update({
      where: { id: scan.id },
      data: {
        status: 'COMPLETED',
        results: JSON.stringify(results),
        score,
        completedAt: new Date(),
      },
    });

    return NextResponse.json(updatedScan);
  } catch (error) {
    console.error('Scan failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
