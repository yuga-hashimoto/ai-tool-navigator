import { NextResponse } from 'next/server';
import { removeSubscriber } from '@/lib/mailchimp';

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
      const result = await removeSubscriber(email);

      if (!result) {
           console.warn('Mailchimp unsubscribe skipped (configuration missing).');
           return NextResponse.json(
            { message: 'Unsubscribed successfully.' },
            { status: 200 }
           );
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((result as any).status === 'not_found') {
          return NextResponse.json(
            { message: 'You are not subscribed to our newsletter.' },
            { status: 404 }
          );
      }

      return NextResponse.json(
        { message: 'Unsubscribed successfully.' },
        { status: 200 }
      );

    } catch (error) {
      console.error('Newsletter unsubscribe error:', error);
      return NextResponse.json(
        { error: 'Failed to unsubscribe.' },
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
