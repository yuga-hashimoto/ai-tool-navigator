import { NextResponse } from 'next/server';
import { processCartRecoveryEmails } from '@/lib/abandoned-link-recovery';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await processCartRecoveryEmails();

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error processing abandoned carts:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
