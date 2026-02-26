# Live Chat & Support Chat System

## Overview

This document describes the complete live chat and support chat system implementation for AI Tool Navigator.

## Features Implemented

### 1. Real-time Chat Interface
- **Socket.io Integration**: Real-time bidirectional communication between visitors and agents
- **Message History**: All messages are stored and retrieved from the database
- **Typing Indicators**: Real-time typing status for both visitors and agents
- **Read Receipts**: Message read status tracking
- **File Attachments**: Support for image and file uploads

### 2. Chat Widget Components
- **Responsive Design**: Works on all device sizes (desktop, tablet, mobile)
- **Customizable Appearance**: Colors, position, and styling options
- **Minimized/Maximized States**: Collapsible widget
- **Unread Message Badge**: Shows count of unread messages

### 3. Agent Assignment System
- **Admin Panel**: Interface for agents to manage chats
- **Chat Queue**: Waiting chats are displayed in a queue
- **Auto-assignment**: Chats can be manually assigned or auto-assigned
- **Transfer Capability**: Transfer chats between agents

### 4. Conversation History
- **Persistent Storage**: All conversations stored in database
- **Date-based Grouping**: Messages grouped by date
- **Session Tracking**: Unique session IDs for each conversation
- **Transcript Export**: Export chat transcripts

### 5. Canned Responses
- **Pre-defined Templates**: Quick reply options for common questions
- **Category Organization**: Responses organized by category
- **Search Functionality**: Quick search for canned responses
- **Keyword Matching**: Automatic suggestions based on context

### 6. File Sharing
- **Image Support**: Share images in chat
- **File Attachments**: Share documents and files
- **Download Capability**: Download shared files
- **Preview**: Image previews in chat

### 7. Chat Analytics Dashboard
- **Total Conversations**: Track chat volume
- **Response Time Metrics**: Average response time
- **Customer Satisfaction**: CSAT score tracking
- **Peak Hours**: Traffic patterns by hour
- **Category Distribution**: Chat distribution by category

### 8. Proactive Chat Triggers
- **Time on Page**: Trigger after specific duration
- **Scroll Depth**: Trigger at scroll percentage
- **Exit Intent**: Trigger when mouse leaves viewport
- **Page Visit**: Trigger on specific pages
- **Customizable Messages**: Custom trigger messages
- **Cooldown**: Prevent over-triggering

### 9. Omnichannel Integration
- **Voice Agent Ready**: Architecture supports voice integration
- **API-First Design**: All features accessible via API
- **Scalable**: Built to add more channels

## Architecture

### Database Schema (Prisma)
- `ChatSession`: Main chat session model
- `Message`: Individual messages
- `CannedResponse`: Pre-defined responses
- `SupportTicket`: Offline inquiry tracking
- `ChatTranscript`: Exported transcripts

### API Routes
- `POST/GET/PATCH /api/chat/sessions`: Session management
- `POST/GET/PATCH /api/chat/messages`: Message operations
- `GET/POST /api/chat/canned-responses`: Canned responses
- `GET /api/chat/analytics`: Analytics data
- `GET/POST /api/chat/triggers`: Proactive triggers
- `GET/POST /api/chat/tickets`: Support tickets

### Real-time (Socket.io)
- `join_session`: Visitor joins chat
- `join_admin`: Agent joins admin room
- `send_message`: Send message
- `typing/stop_typing`: Typing indicators
- `assign_chat`: Assign chat to agent
- `close_chat`: Close chat session

## Usage

### Adding Chat Widget to Page

```tsx
import { ChatWidgetContainer } from '@/components/chat';

export default function MyPage() {
  return (
    <>
      <ChatWidgetContainer
        sessionId="unique_session_id"
        userName="John Doe"
        userEmail="john@example.com"
        position="bottom-right"
        primaryColor="#4F46E5"
      />
      {/* Page content */}
    </>
  );
}
```

### Using the Admin Panel

```tsx
import { AdminChatPanel } from '@/components/chat';

export default function AdminPage() {
  return (
    <AdminChatPanel
      adminId="admin_123"
      adminName="Support Agent"
    />
  );
}
```

### Using the Analytics Dashboard

```tsx
import { ChatAnalyticsDashboard } from '@/components/chat';

export default function AnalyticsPage() {
  return <ChatAnalyticsDashboard />;
}
```

### Using the Chat Hook

```tsx
import { useChat } from '@/hooks/chat';

function MyChatComponent() {
  const {
    isConnected,
    messages,
    sendMessage,
    sendTyping,
  } = useChat({
    sessionId: 'session_123',
    userId: 'user_123',
    userName: 'John',
    userType: 'visitor',
  });

  const handleSend = () => {
    sendMessage('Hello!');
  };

  return <button onClick={handleSend}>Send</button>;
}
```

## Environment Variables

```env
# Socket.io Server
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://...

# Optional: File Upload
UPLOAD_DIR=/uploads
MAX_FILE_SIZE=10485760
```

## Expected Conversion Impact

Based on industry benchmarks, implementing live chat typically results in:
- **15-20% increase** in conversion rates
- **25% reduction** in cart abandonment
- **40% increase** in customer satisfaction
- **30% decrease** in support ticket volume

## Testing

### Manual Testing
1. Open chat widget
2. Send messages as visitor
3. Respond as admin
4. Test file attachments
5. Test proactive triggers
6. Test canned responses

### Automated Tests
```bash
npm test -- --testPathPattern=chat
```

## Performance Considerations

- **Connection Pooling**: Database connections are pooled
- **Caching**: Analytics data cached for 5 minutes
- **Compression**: Socket.io messages compressed
- **Rate Limiting**: API endpoints rate limited

## Security

- **Input Sanitization**: All messages sanitized
- **XSS Protection**: React handles auto-escaping
- **Rate Limiting**: Prevents abuse
- **Session Validation**: Sessions validated on each request
