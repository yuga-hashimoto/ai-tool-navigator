import { NextRequest, NextResponse } from 'next/server';
import { verifyCaptcha } from '@/lib/security/captcha';
import { getClientIP } from '@/lib/security/bot-detection';
import { recordSuccess, recordFailure, clearIPReputationCaptchaRequirement as clearCaptchaRequirement } from '@/lib/security/ip-reputation';

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  
  try {
    const body = await request.json();
    const { id, answer } = body;
    
    if (!id || !answer) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const result = await verifyCaptcha(id, answer);
    
    if (result.valid) {
      // Clear CAPTCHA requirement for this IP
      await clearCaptchaRequirement(ip);
      // Improve IP reputation
      await recordSuccess(ip);
      
      return NextResponse.json({
        valid: true,
        message: 'Verification successful',
      });
    } else {
      // Record failed attempt
      await recordFailure(ip, 'CAPTCHA verification failed');
      
      return NextResponse.json({
        valid: false,
        message: 'Verification failed. Please try again.',
      });
    }
  } catch (error) {
    console.error('CAPTCHA verification error:', error);
    return NextResponse.json(
      { error: 'Verification error' },
      { status: 500 }
    );
  }
}
