import { NextRequest, NextResponse } from 'next/server';
import { generateCaptcha, storeCaptcha, CaptchaChallenge } from '@/lib/security/captcha';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const type = body.type || 'simple';
    
    // Generate new CAPTCHA
    const challenge = generateCaptcha(type);
    
    // Store it
    await storeCaptcha(challenge);
    
    // Return challenge (without the answer)
    return NextResponse.json({
      id: challenge.id,
      type: challenge.type,
      question: challenge.question,
    });
  } catch (error) {
    console.error('CAPTCHA generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate CAPTCHA' },
      { status: 500 }
    );
  }
}
