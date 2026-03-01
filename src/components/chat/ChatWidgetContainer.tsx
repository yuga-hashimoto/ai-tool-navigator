'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, X, Minimize2 } from 'lucide-react';
import { useChat } from '@/hooks/chat/useChat';
import { useProactiveChat } from '@/hooks/chat/useProactiveChat';
import { defaultAppearance, defaultQuickReplies } from '@/lib/chat-config';
import ChatWindow from './ChatWindow';
import ChatWidget from './ChatWidget';
import './ChatStyles.css';

interface ChatWidgetContainerProps {
  sessionId?: string;
  userName?: string;
  userEmail?: string;
  position?: 'bottom-right' | 'bottom-left';
  primaryColor?: string;
  appearance?: Partial<typeof defaultAppearance>;
}

export default function ChatWidgetContainer({
  sessionId: initialSessionId,
  userName,
  userEmail,
  position = 'bottom-right',
  primaryColor = defaultAppearance.primaryColor,
  appearance = {},
}: ChatWidgetContainerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState(initialSessionId || '');
  const [showWidget, setShowWidget] = useState(true);

  // Initialize or get session ID
  useEffect(() => {
    if (!sessionId) {
      const storedSessionId = localStorage.getItem('chat_session_id');
      if (storedSessionId) {
        setSessionId(storedSessionId);
      } else {
        const newSessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('chat_session_id', newSessionId);
        setSessionId(newSessionId);
      }
    }
  }, [sessionId]);

  // Initialize chat hook
  const {
    isConnected,
    messages,
    typingUsers,
    unreadCount,
    sendMessage,
    sendTyping,
    markAsRead,
    closeChat,
    loadMessages,
  } = useChat({
    sessionId,
    userId: userEmail || sessionId,
    userName,
    userType: 'visitor',
    autoConnect: isOpen,
  });

  // Initialize proactive chat
  const { pendingTrigger, dismissTrigger, acceptTrigger } = useProactiveChat({
    sessionId,
    isEnabled: !isOpen,
    onTrigger: (trigger) => {
      // Auto-open chat when trigger fires
      setIsOpen(true);
    },
  });

  // Merge appearance settings
  const mergedAppearance = { ...defaultAppearance, ...appearance };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      loadMessages();
      markAsRead([]);
    }
  };

  const handleSendMessage = (content: string, contentType?: string) => {
    sendMessage(content, contentType as any);
  };

  const handleCloseChat = () => {
    closeChat('Visitor closed chat');
    setIsOpen(false);
    setShowWidget(false);
    
    // Show widget again after a delay
    setTimeout(() => {
      setShowWidget(true);
    }, 30000);
  };

  if (!showWidget && !pendingTrigger) {
    return null;
  }

  return (
    <div className={`chat-widget-container ${position}`}>
      {/* Proactive Chat Trigger Popup */}
      {pendingTrigger && !isOpen && (
        <div className="proactive-trigger-popup">
          <div className="proactive-trigger-content">
            <p>{pendingTrigger.message}</p>
            <div className="proactive-trigger-actions">
              <button
                className="proactive-accept-btn"
                onClick={acceptTrigger}
                style={{ backgroundColor: primaryColor }}
              >
                {pendingTrigger.buttonText || 'Chat now'}
              </button>
              <button className="proactive-dismiss-btn" onClick={dismissTrigger}>
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <ChatWindow
          sessionId={sessionId}
          messages={messages}
          typingUsers={typingUsers}
          isConnected={isConnected}
          unreadCount={unreadCount}
          appearance={mergedAppearance}
          quickReplies={defaultQuickReplies}
          onSendMessage={handleSendMessage}
          onTyping={sendTyping}
          onClose={handleCloseChat}
          onMarkAsRead={markAsRead}
          userName={userName}
          userEmail={userEmail}
        />
      )}

      {/* Chat Toggle Button */}
      {showWidget && (
        <ChatWidget
          isOpen={isOpen}
          unreadCount={unreadCount}
          primaryColor={primaryColor}
          onClick={toggleChat}
        />
      )}
    </div>
  );
}
