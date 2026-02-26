import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, quiet: !dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  // Initialize Socket.io
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Store active chat rooms
  const chatRooms = new Map();
  const adminSockets = new Map();

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join a chat session (visitor)
    socket.on('join_session', (data: { sessionId: string; userId?: string; userName?: string }) => {
      const roomId = `session_${data.sessionId}`;
      socket.join(roomId);

      if (!chatRooms.has(data.sessionId)) {
        chatRooms.set(data.sessionId, {
          sessionId: data.sessionId,
          visitors: new Set(),
        });
      }
      chatRooms.get(data.sessionId)?.visitors.add(socket.id);

      socket.to('admin_room').emit('visitor_joined', {
        sessionId: data.sessionId,
        visitorId: data.userId,
        visitorName: data.userName,
      });

      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    // Join admin room
    socket.on('join_admin', (data: { adminId: string }) => {
      socket.join('admin_room');
      adminSockets.set(socket.id, data.adminId);
      socket.emit('admin_status', { status: 'connected' });
      console.log(`Admin ${data.adminId} connected`);
    });

    // Leave session
    socket.on('leave_session', (sessionId: string) => {
      const roomId = `session_${sessionId}`;
      socket.leave(roomId);
      chatRooms.get(sessionId)?.visitors.delete(socket.id);
    });

    // Handle incoming messages
    socket.on('send_message', (message: any) => {
      const roomId = `session_${message.chatSessionId}`;

      io.to(roomId).emit('new_message', {
        ...message,
        id: message.id || `msg_${Date.now()}`,
        createdAt: new Date(),
        isRead: false,
      });

      if (message.senderType === 'VISITOR') {
        socket.to('admin_room').emit('new_visitor_message', {
          sessionId: message.chatSessionId,
          message,
        });
      }
    });

    // Typing indicator
    socket.on('typing', (data: any) => {
      const roomId = `session_${data.chatSessionId}`;
      socket.to(roomId).emit('user_typing', data);
    });

    socket.on('stop_typing', (data: any) => {
      const roomId = `session_${data.chatSessionId}`;
      socket.to(roomId).emit('user_stopped_typing', data);
    });

    // Assign chat to admin
    socket.on('assign_chat', (data: { sessionId: string; adminId: string }) => {
      const roomId = `session_${data.sessionId}`;
      const room = chatRooms.get(data.sessionId);
      if (room) {
        room.adminId = data.adminId;
      }

      io.to(roomId).emit('chat_assigned', {
        sessionId: data.sessionId,
        adminId: data.adminId,
      });

      socket.to('admin_room').emit('chat_assigned_notification', {
        sessionId: data.sessionId,
        adminId: data.adminId,
      });
    });

    // Mark messages as read
    socket.on('mark_read', (data: { sessionId: string; messageIds: string[] }) => {
      const roomId = `session_${data.sessionId}`;
      io.to(roomId).emit('messages_read', data);
    });

    // Close chat
    socket.on('close_chat', (data: { sessionId: string; reason?: string }) => {
      const roomId = `session_${data.sessionId}`;

      io.to(roomId).emit('chat_closed', {
        sessionId: data.sessionId,
        reason: data.reason,
        closedAt: new Date(),
      });

      chatRooms.delete(data.sessionId);
    });

    // Get online agents
    socket.on('get_online_agents', () => {
      const onlineAdmins = Array.from(adminSockets.entries()).map(([socketId, adminId]) => ({
        socketId,
        adminId,
      }));
      socket.emit('online_agents', { agents: onlineAdmins });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      adminSockets.delete(socket.id);

      chatRooms.forEach((room, sessionId) => {
        if (room.visitors.has(socket.id)) {
          room.visitors.delete(socket.id);
          socket.to('admin_room').emit('visitor_left', { sessionId, socketId: socket.id });
        }
      });
    });
  });

  // Error handling
  io.on('error', (err) => {
    console.error('Socket.io error:', err);
  });

  // Start server
  server.listen(port, () => {
    console.log(`🚀 Next.js server with Socket.io ready at http://${hostname}:${port}`);
    console.log(`   Real-time chat enabled`);
  });
});
