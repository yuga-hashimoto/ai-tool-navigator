'use client';

import { useState } from 'react';

interface UseChatProps {
  sessionId: string;
  userId?: string;
  userName?: string;
  userType: 'visitor' | 'admin';
  autoConnect?: boolean;
}

export function useChat(props: UseChatProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const sendMessage = (content: string, contentType: string = 'text') => {
    console.log('Dummy sendMessage', content);
  };

  const sendTyping = (isTyping: boolean) => {
    console.log('Dummy sendTyping', isTyping);
  };

  const markAsRead = (msgIds: string[]) => {
    console.log('Dummy markAsRead', msgIds);
  };

  const closeChat = (reason?: string) => {
    console.log('Dummy closeChat', reason);
  };

  const loadMessages = () => {
    console.log('Dummy loadMessages');
  };

  return {
    isConnected,
    messages,
    typingUsers,
    unreadCount,
    sendMessage,
    sendTyping,
    markAsRead,
    closeChat,
    loadMessages,
  };
}

export default useChat;
