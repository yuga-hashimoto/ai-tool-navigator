'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Paperclip,
  Smile,
  X,
  ChevronDown,
  Image as ImageIcon,
  File,
  Clock,
  User,
} from 'lucide-react';
import MessageBubble from './MessageBubble';
import QuickReplies from './QuickReplies';
import { defaultAppearance, QuickReply } from '@/lib/chat-config';
import { useChat } from '@/hooks/chat/useChat';
import './ChatStyles.css';

interface ChatWindowProps {
  sessionId: string;
  messages: any[];
  typingUsers: any[];
  isConnected: boolean;
  unreadCount: number;
  appearance: typeof defaultAppearance;
  quickReplies: QuickReply[];
  onSendMessage: (content: string, contentType?: string) => void;
  onTyping: (isTyping: boolean) => void;
  onClose: () => void;
  onMarkAsRead: (messageIds: string[]) => void;
  userName?: string;
  userEmail?: string;
}

export default function ChatWindow({
  sessionId,
  messages,
  typingUsers,
  isConnected,
  unreadCount,
  appearance,
  quickReplies,
  onSendMessage,
  onTyping,
  onClose,
  onMarkAsRead,
  userName,
  userEmail,
}: ChatWindowProps) {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);

    // Send typing indicator
    if (!isTyping) {
      setIsTyping(true);
      onTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of no input
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTyping(false);
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;

    onSendMessage(inputValue.trim());
    setInputValue('');
    setIsTyping(false);
    onTyping(false);

    // Refocus input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleQuickReply = (reply: string) => {
    onSendMessage(reply);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Handle file upload
      onSendMessage(file.name, 'FILE');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString();
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message, index) => {
    const date = formatDate(message.createdAt);
    
    if (!groups[date]) {
      groups[date] = [];
    }
    
    // Check if message is from a different sender than previous
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const isNewGroup = !prevMessage || prevMessage.senderType !== message.senderType;
    
    groups[date].push({ ...message, isNewGroup });
    return groups;
  }, {} as Record<string, any[]>);

  return (
    <div className="chat-window" style={{ borderRadius: appearance.borderRadius }}>
      {/* Header */}
      <div className="chat-header" style={{ backgroundColor: appearance.primaryColor }}>
        <div className="chat-header-info">
          <div className="chat-avatar" style={{ backgroundColor: appearance.secondaryColor }}>
            <span style={{ color: appearance.primaryColor }}>
              {appearance.companyName.charAt(0)}
            </span>
          </div>
          <div className="chat-header-text">
            <h3 className="chat-header-title">{appearance.companyName}</h3>
            <p className="chat-header-status">
              {isConnected ? (
                <>
                  <span className="status-dot online"></span>
                  {appearance.agentOnlineText}
                </>
              ) : (
                <>
                  <span className="status-dot offline"></span>
                  {appearance.agentOfflineText}
                </>
              )}
            </p>
          </div>
        </div>
        <button className="chat-close-btn" onClick={onClose}>
          <X size={20} color={appearance.secondaryColor} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="chat-messages">
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date} className="message-date-group">
            <div className="date-divider">
              <span>{date}</span>
            </div>
            {dateMessages.map((message: any) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.senderType === 'VISITOR'}
                showAvatar={message.isNewGroup}
                showTime={message.isNewGroup}
                appearance={appearance}
              />
            ))}
          </div>
        ))}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="typing-indicator">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span className="typing-text">
              {typingUsers.map(u => u.userName || 'Agent').join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      {messages.length === 0 && quickReplies.length > 0 && (
        <QuickReplies
          replies={quickReplies}
          onSelect={handleQuickReply}
          primaryColor={appearance.primaryColor}
        />
      )}

      {/* Input Area */}
      <form className="chat-input-area" onSubmit={handleSubmit}>
        <div className="input-actions">
          <label className="input-action-btn" style={{ color: appearance.textColor }}>
            <Paperclip size={20} />
            <input
              type="file"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              accept="image/*,.pdf,.doc,.docx"
            />
          </label>
        </div>
        <textarea
          ref={inputRef}
          className="chat-input"
          style={{ color: appearance.textColor }}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          placeholder={appearance.placeholderText}
          rows={1}
        />
        <button
          type="submit"
          className="send-btn"
          style={{ backgroundColor: appearance.primaryColor }}
          disabled={!inputValue.trim() || !isConnected}
        >
          <Send size={20} color={appearance.secondaryColor} />
        </button>
      </form>
    </div>
  );
}
