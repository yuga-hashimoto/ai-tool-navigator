import { NextResponse } from 'next/server';
import { appendToolSubmission, ToolSubmissionData } from '@/lib/google-sheets';

export async function POST(request: Request) {
  try {
    const body: ToolSubmissionData = await request.json();
    const { name, url, description, category, pricing_model, price } = body;

    // Basic validation
    if (!name || !url || !description || !category || !pricing_model) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    try {
      await appendToolSubmission({ name, url, description, category, pricing_model, price: price || '' });
      
      console.log(`[TOOL SUBMISSION] New submission: ${name} (${url}) at ${new Date().toISOString()}`);

      return NextResponse.json(
        { message: 'Tool submitted successfully' },
        { status: 200 }
      );
    } catch (error) {
      console.error('Tool submission error:', error);
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
