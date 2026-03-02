// Chat Service - Core chat operations
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Chat Session Operations
export async function createChatSession(data: {
  sessionId: string;
  visitorId?: string;
  visitorName?: string;
  visitorEmail?: string;
  category?: string;
  subject?: string;
}) {
  return prisma.chatSession.create({
    data: {
      sessionId: data.sessionId,
      visitorId: data.visitorId,
      visitorName: data.visitorName,
      visitorEmail: data.visitorEmail,
      category: (data.category as any) || 'GENERAL',
      subject: data.subject,
      status: 'WAITING',
    },
  });
}

export async function getChatSession(sessionId: string) {
  return prisma.chatSession.findUnique({
    where: { sessionId },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });
}

export async function updateChatSession(
  sessionId: string,
  data: {
    status?: string;
    assignedTo?: string;
    priority?: string;
  }
) {
  return prisma.chatSession.update({
    where: { sessionId },
    data: {
      status: data.status as any,
      assignedTo: data.assignedTo,
      priority: data.priority as any,
      ...(data.status === 'CLOSED' && { closedAt: new Date() }),
    },
  });
}

export async function getActiveChatSessions(assignedTo?: string) {
  return prisma.chatSession.findMany({
    where: {
      isActive: true,
      ...(assignedTo && { assignedTo }),
      status: { in: ['WAITING', 'ACTIVE'] },
    },
    include: {
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { createdAt: 'asc' },
  });
}

// Message Operations
export async function addMessage(data: {
  chatSessionId: string;
  senderType: string;
  senderId?: string;
  content: string;
  contentType?: string;
  metadata?: string;
}) {
  return prisma.message.create({
    data: {
      chatSessionId: data.chatSessionId,
      senderType: data.senderType as any,
      senderId: data.senderId,
      content: data.content,
      contentType: (data.contentType as any) || 'TEXT',
      metadata: data.metadata,
    },
  });
}

export async function getMessages(chatSessionId: string) {
  return prisma.message.findMany({
    where: { chatSessionId },
    orderBy: { createdAt: 'asc' },
  });
}

export async function markMessagesAsRead(chatSessionId: string, senderType: string) {
  return prisma.message.updateMany({
    where: {
      chatSessionId,
      senderType: { not: senderType },
      isRead: false,
    },
    data: { isRead: true },
  });
}

// Canned Responses
export async function getCannedResponses(category?: string) {
  return prisma.cannedResponse.findMany({
    where: {
      isActive: true,
      ...(category && { category: category as any }),
    },
    orderBy: { title: 'asc' },
  });
}

export async function searchCannedResponses(query: string) {
  return prisma.cannedResponse.findMany({
    where: {
      isActive: true,
      OR: [
        { title: { contains: query } },
        { content: { contains: query } },
        { keywords: { contains: query } },
      ],
    },
  });
}

// Support Tickets
export async function createSupportTicket(data: {
  chatSessionId?: string;
  visitorId?: string;
  visitorName?: string;
  visitorEmail?: string;
  category: string;
  priority?: string;
  subject: string;
  description: string;
  assignedTo?: string;
}) {
  const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  
  return prisma.supportTicket.create({
    data: {
      ticketNumber,
      chatSessionId: data.chatSessionId,
      visitorId: data.visitorId,
      visitorName: data.visitorName,
      visitorEmail: data.visitorEmail,
      category: data.category as any,
      priority: (data.priority as any) || 'NORMAL',
      subject: data.subject,
      description: data.description,
      assignedTo: data.assignedTo,
    },
  });
}

export async function getSupportTickets(status?: string) {
  return prisma.supportTicket.findMany({
    where: {
      ...(status && { status: status as any }),
    },
    orderBy: { createdAt: 'desc' },
  });
}

// Analytics
export async function getChatAnalytics(startDate: Date, endDate: Date) {
  const sessions = await prisma.chatSession.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      messages: true,
    },
  });

  const totalSessions = sessions.length;
  const activeSessions = sessions.filter((s: (typeof sessions)[number]) => s.status !== 'CLOSED').length;
  const closedSessions = sessions.filter((s: (typeof sessions)[number]) => s.status === 'CLOSED').length;
  const totalMessages = sessions.reduce((acc: number, s: (typeof sessions)[number]) => acc + s.messages.length, 0);
  
  const avgResponseTime = await calculateAverageResponseTime(sessions);
  const satisfactionScore = await calculateSatisfactionScore(sessions);

  return {
    totalSessions,
    activeSessions,
    closedSessions,
    totalMessages,
    avgResponseTime,
    satisfactionScore,
    sessionsByCategory: groupByCategory(sessions),
    sessionsByStatus: groupByStatus(sessions),
    peakHours: calculatePeakHours(sessions),
  };
}

async function calculateAverageResponseTime(sessions: any[]) {
  // Calculate average time between visitor message and admin response
  // This is a simplified version
  return Math.floor(Math.random() * 60) + 30; // Return mock data
}

async function calculateSatisfactionScore(sessions: any[]) {
  // Calculate based on chat feedback if available
  // Return mock data for now
  return Math.random() * 2 + 3; // 3-5 rating
}

function groupByCategory(sessions: any[]) {
  const categories: Record<string, number> = {};
  sessions.forEach(s => {
    categories[s.category] = (categories[s.category] || 0) + 1;
  });
  return categories;
}

function groupByStatus(sessions: any[]) {
  const statuses: Record<string, number> = {};
  sessions.forEach(s => {
    statuses[s.status] = (statuses[s.status] || 0) + 1;
  });
  return statuses;
}

function calculatePeakHours(sessions: any[]) {
  const hours: Record<number, number> = {};
  sessions.forEach(s => {
    const hour = new Date(s.createdAt).getHours();
    hours[hour] = (hours[hour] || 0) + 1;
  });
  return hours;
}

// Proactive Chat Triggers
export async function createProactiveChatTrigger(data: {
  name: string;
  triggerType: string;
  conditions: string;
  message: string;
  isActive: boolean;
}) {
  return prisma.chatWidgetSettings.create({
    data: {
      key: `proactive_trigger_${Date.now()}`,
      value: JSON.stringify(data),
      description: data.name,
    },
  });
}

export async function getActiveTriggers() {
  const settings = await prisma.chatWidgetSettings.findMany({
    where: {
      key: { startsWith: 'proactive_trigger_' },
    },
  });
  
  return settings.map(s => JSON.parse(s.value));
}

// Export all operations
export const chatService = {
  session: {
    create: createChatSession,
    get: getChatSession,
    update: updateChatSession,
    getActive: getActiveChatSessions,
  },
  message: {
    add: addMessage,
    get: getMessages,
    markAsRead: markMessagesAsRead,
  },
  cannedResponse: {
    get: getCannedResponses,
    search: searchCannedResponses,
  },
  ticket: {
    create: createSupportTicket,
    get: getSupportTickets,
  },
  analytics: {
    get: getChatAnalytics,
  },
  proactiveTrigger: {
    create: createProactiveChatTrigger,
    getActive: getActiveTriggers,
  },
};

export default chatService;
