import { NextResponse } from 'next/server';
import { appendSubscriber } from '@/lib/google-sheets';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    try {
      await appendSubscriber(email);
      
      // Also log to console for visibility
      console.log(`[NEWSLETTER LEAD] New subscriber: ${email} at ${new Date().toISOString()}`);

      return NextResponse.json(
        { message: 'Subscribed successfully' },
        { status: 200 }
      );
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Request processing error:', error);
    return NextResponse.json(
      { error: 'Bad Request' },
      { status: 400 }
    );
  }
}
