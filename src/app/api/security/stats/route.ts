import { NextRequest, NextResponse } from 'next/server';
import { getSecurityStats } from '@/lib/security/audit-log';
import { getComplianceStatus } from '@/lib/security/compliance';

export async function GET(request: NextRequest) {
  try {
    const stats = await getSecurityStats(24);
    const compliance = await getComplianceStatus();

    // Mocked posture score based on stats and compliance
    const securityPosture = 92; // 0-100

    return NextResponse.json({
      posture: securityPosture,
      stats,
      compliance: compliance.map(c => ({
        framework: c.framework,
        score: c.score,
        status: c.status,
      })),
      trends: {
        threats: [10, 12, 8, 15, 7, 5, 4], // Last 7 days
        blocked: [95, 98, 97, 99, 96, 95, 98],
      }
    });
  } catch (error) {
    console.error('Failed to fetch security stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
