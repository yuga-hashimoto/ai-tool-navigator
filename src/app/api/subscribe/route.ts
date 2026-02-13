import { NextResponse } from 'next/server';
import { appendSubscriber } from '@/lib/google-sheets';
import { addSubscriber } from '@/lib/mailchimp';

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

    // 1. Google Sheets (Legacy/Backup)
    try {
      if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
        await appendSubscriber(email);
      } else {
        console.warn('GOOGLE_SERVICE_ACCOUNT_JSON not set, skipping Google Sheets append.');
      }
    } catch (sheetError) {
      console.error('Google Sheets append error:', sheetError);
      // Continue execution, don't fail the request just because Sheets failed
    }

    // 2. Mailchimp (Primary)
    try {
      const mcResponse = await addSubscriber(email);
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (mcResponse && (mcResponse as any).status === 'exists') {
         return NextResponse.json(
          { message: 'You are already subscribed.' },
          { status: 200 }
        );
      }

      // If mcResponse is null, it means env vars are missing. We treat it as success (dev mode) or log warning.
      if (!mcResponse) {
          console.warn('Mailchimp subscription skipped (configuration missing).');
      }

    } catch (mcError) {
      console.error('Mailchimp subscription error:', mcError);
      return NextResponse.json(
        { error: 'Failed to subscribe to newsletter service.' },
        { status: 500 }
      );
    }

    console.log(`[NEWSLETTER LEAD] New subscriber: ${email} at ${new Date().toISOString()}`);

    return NextResponse.json(
      { message: 'Subscribed successfully. Please check your email to confirm.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Request processing error:', error);
    return NextResponse.json(
      { error: 'Bad Request' },
      { status: 400 }
    );
  }
}
