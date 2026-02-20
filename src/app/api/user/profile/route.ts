
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const userId = 'mock-user-id';

    let user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
       // Create mock user if not exists
       try {
        user = await prisma.user.create({
            data: {
                id: userId,
                email: 'mock@example.com',
                name: 'Demo User',
                role: 'USER'
            }
        });
       } catch (e) {
         // Race condition handling
         user = await prisma.user.findUnique({ where: { id: userId } });
       }
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = 'mock-user-id';
    const data = await request.json();

    // Only allow updating certain fields
    const { name, email, image } = data;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, email, image }
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
