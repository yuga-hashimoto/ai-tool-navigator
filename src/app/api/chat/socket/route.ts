import { NextRequest, NextResponse } from 'next/server';

// Socket.io doesn't use traditional API routes
// The socket server is initialized in server.js
// This route is for health checking the socket connection

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Chat socket server is running',
    socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000',
  });
}
