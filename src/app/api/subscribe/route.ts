import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'subscribers.csv');
    const date = new Date().toISOString();
    const line = `${email},${date}\n`;

    // Append to file (create if doesn't exist)
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, 'email,date\n');
    }
    
    fs.appendFileSync(filePath, line);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
