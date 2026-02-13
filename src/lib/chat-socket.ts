// Socket.io Server for Real-time Chat
import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

interface ChatMessage {
  id: string;
  chatSessionId: string;
  senderType: 'VISITOR' | 'ADMIN' | 'BOT';
  senderId?: string;
  senderName?: string;
  content: string;
  contentType: 'TEXT' | 'FILE' | 'IMAGE' | 'SYSTEM';
  metadata?: string;
  createdAt: Date;
  isRead: boolean;
}

interface TypingStatus {
  chatSessionId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

interface ChatRoom {
  sessionId: string;
  adminId?: string;
  visitors: Set<string>;
}

export function initializeChatServer(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Store active rooms
  const chatRooms: Map<string, ChatRoom> = new Map();
  const adminSockets: Map<string, string> = new Map(); // socketId -> adminId

  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join a chat session (visitor)
    socket.on('join_session', (data: { sessionId: string; userId?: string; userName?: string }) => {
      const roomId = `session_${data.sessionId}`;
      socket.join(roomId);
      
      // Track room
      if (!chatRooms.has(data.sessionId)) {
        chatRooms.set(data.sessionId, {
          sessionId: data.sessionId,
          visitors: new Set(),
        });
      }
      chatRooms.get(data.sessionId)?.visitors.add(socket.id);

      // Notify admins
      socket.to('admin_room').emit('visitor_joined', {
        sessionId: data.sessionId,
        visitorId: data.userId,
        visitorName: data.userName,
      });

      console.log(`Client ${socket.id} joined room ${roomId}`);
    });

    // Join admin room
    socket.on('join_admin', (data: { adminId: string }) => {
      socket.join('admin_room');
      adminSockets.set(socket.id, data.adminId);
      socket.emit('admin_status', { status: 'connected' });
      console.log(`Admin ${data.adminId} connected`);
    });

    // Leave chat session
    socket.on('leave_session', (sessionId: string) => {
      const roomId = `session_${sessionId}`;
      socket.leave(roomId);
      chatRooms.get(sessionId)?.visitors.delete(socket.id);
    });

    // Handle incoming messages
    socket.on('send_message', async (message: Partial<ChatMessage>) => {
      const roomId = `session_${message.chatSessionId}`;
      
      // Emit to room
      io.to(roomId).emit('new_message', {
        ...message,
        id: message.id || `msg_${Date.now()}`,
        createdAt: new Date(),
        isRead: false,
      });

      // Notify admins if visitor sent message
      if (message.senderType === 'VISITOR') {
        socket.to('admin_room').emit('new_visitor_message', {
          sessionId: message.chatSessionId,
          message,
        });
      }

      console.log(`Message sent in ${roomId}: ${message.content?.substring(0, 50)}...`);
    });

    // Typing indicator
    socket.on('typing', (data: TypingStatus) => {
      const roomId = `session_${data.chatSessionId}`;
      socket.to(roomId).emit('user_typing', data);
    });

    // Stop typing indicator
    socket.on('stop_typing', (data: TypingStatus) => {
      const roomId = `session_${data.chatSessionId}`;
      socket.to(roomId).emit('user_stopped_typing', data);
    });

    // Assign chat to admin
    socket.on('assign_chat', (data: { sessionId: string; adminId: string }) => {
      const roomId = `session_${data.sessionId}`;
      
      // Update room
      const room = chatRooms.get(data.sessionId);
      if (room) {
        room.adminId = data.adminId;
      }

      // Notify both parties
      io.to(roomId).emit('chat_assigned', {
        sessionId: data.sessionId,
        adminId: data.adminId,
      });

      socket.to('admin_room').emit('chat_assigned_notification', {
        sessionId: data.sessionId,
        adminId: data.adminId,
      });
    });

    // Transfer chat to another admin
    socket.on('transfer_chat', (data: { sessionId: string; fromAdminId: string; toAdminId: string }) => {
      const roomId = `session_${data.sessionId}`;
      
      // Notify parties
      io.to(roomId).emit('chat_transferred', {
        sessionId: data.sessionId,
        fromAdminId: data.fromAdminId,
        toAdminId: data.toAdminId,
      });
    });

    // Mark messages as read
    socket.on('mark_read', (data: { sessionId: string; messageIds: string[] }) => {
      const roomId = `session_${data.sessionId}`;
      io.to(roomId).emit('messages_read', {
        sessionId: data.sessionId,
        messageIds: data.messageIds,
      });
    });

    // Close chat session
    socket.on('close_chat', (data: { sessionId: string; reason?: string }) => {
      const roomId = `session_${data.sessionId}`;
      
      io.to(roomId).emit('chat_closed', {
        sessionId: data.sessionId,
        reason: data.reason,
        closedAt: new Date(),
      });

      // Remove from active rooms
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
      console.log(`Client disconnected: ${socket.id}`);
      
      // Remove from admin sockets
      adminSockets.delete(socket.id);
      
      // Update chat rooms
      chatRooms.forEach((room, sessionId) => {
        if (room.visitors.has(socket.id)) {
          room.visitors.delete(socket.id);
          
          // Notify admins
          socket.to('admin_room').emit('visitor_left', {
            sessionId,
            socketId: socket.id,
          });
        }
      });
    });
  });

  return io;
}

// Helper to emit to specific session
export function emitToSession(io: Server, sessionId: string, event: string, data: any) {
  const roomId = `session_${sessionId}`;
  io.to(roomId).emit(event, data);
}

// Helper to emit to admin room
export function emitToAdmins(io: Server, event: string, data: any) {
  io.to('admin_room').emit(event, data);
}

export default initializeChatServer;
