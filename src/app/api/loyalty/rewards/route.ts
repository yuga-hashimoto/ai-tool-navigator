
import { NextResponse } from 'next/server';
import { REWARDS } from '@/lib/loyalty/loyalty-core';

export async function GET() {
  return NextResponse.json({ rewards: REWARDS });
}
