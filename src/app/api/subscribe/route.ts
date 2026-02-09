import { NextResponse } from 'next/server';

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

    // TODO: Connect to Mailchimp/ConvertKit/Supabase
    // For now, we log it to server console (visible in Vercel logs)
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
}
