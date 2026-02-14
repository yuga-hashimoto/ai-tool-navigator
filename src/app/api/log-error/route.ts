import { NextResponse } from 'next/server';
import { logError, ErrorSeverity, ErrorCategory } from '@/lib/error-tracking';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      message,
      stack,
      context,
      url,
      userId,
      severity = 'MEDIUM',
      category = 'FRONTEND'
    } = body;

    // Map strings to Enums (if necessary) or just pass strings if they match
    // Since our Enums are strings, we can cast them if we trust the client or validate them.

    // Simple validation/fallback
    const safeSeverity = (Object.values(ErrorSeverity) as string[]).includes(severity)
      ? (severity as ErrorSeverity)
      : ErrorSeverity.MEDIUM;

    const safeCategory = (Object.values(ErrorCategory) as string[]).includes(category)
      ? (category as ErrorCategory)
      : ErrorCategory.FRONTEND;

    await logError({
      message: message || 'Unknown client error',
      severity: safeSeverity,
      category: safeCategory,
      stackTrace: stack,
      context,
      url,
      userId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to process error report:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
