'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Paperclip,
  X,
  ChevronLeft,
  MoreVertical,
  Phone,
  Video,
  User,
  Clock,
} from 'lucide-react';
import MessageBubble from './MessageBubble';
import CannedResponses from './CannedResponses';
import { defaultAppearance } from '@/lib/chat-config';
import './AdminChatStyles.css';

interface AdminChatWindowProps {
  session: any;
  messages: any[];
  typingUsers: any[];
  isConnected: boolean;
  adminName: string;
  onSendMessage: (content: string) => void;
  onTyping: (isTyping: boolean) => void;
  onClose: () => void;
}

export default function AdminChatWindow({
  session,
  messages,
  typingUsers,
  isConnected,
  adminName,
  onSendMessage,
  onTyping,
  onClose,
}: AdminChatWindowProps) {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCannedResponses, setShowCannedResponses] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      onTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

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
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleCannedResponse = (response: string) => {
    setInputValue(response);
    setShowCannedResponses(false);
    inputRef.current?.focus();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
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
  const groupedMessages = messages.reduce((groups: any, message: any, index: number) => {
    const date = formatDate(message.createdAt);
    
    if (!groups[date]) {
      groups[date] = [];
    }
    
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const isNewGroup = !prevMessage || prevMessage.senderType !== message.senderType;
    
    groups[date].push({ ...message, isNewGroup });
    return groups;
  }, {});

  return (
    <div className="admin-chat-window">
      {/* Header */}
      <div className="admin-chat-header">
        <div className="header-left">
          <button className="back-btn" onClick={onClose}>
            <ChevronLeft size={20} />
          </button>
          <div className="visitor-info">
            <div className="visitor-avatar">
              {session.visitorName?.charAt(0) || 'V'}
            </div>
            <div className="visitor-details">
              <h3>{session.visitorName || 'Anonymous Visitor'}</h3>
              <span className="visitor-email">{session.visitorEmail || 'No email'}</span>
            </div>
          </div>
        </div>
        <div className="header-right">
          <button className="header-btn">
            <Phone size={18} />
          </button>
          <button className="header-btn">
            <Video size={18} />
          </button>
          <button className="header-btn">
            <User size={18} />
          </button>
          <button className="header-btn">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* Visitor Info Bar */}
      <div className="visitor-meta">
        <div className="meta-item">
          <span className="meta-label">Category:</span>
          <span className="meta-value">{session.category}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Started:</span>
          <span className="meta-value">{formatTime(session.createdAt)}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Session ID:</span>
          <span className="meta-value">{session.sessionId.slice(-8)}</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="admin-chat-messages">
        {Object.entries(groupedMessages).map(([date, dateMessages]: [string, any]) => (
          <div key={date} className="message-date-group">
            <div className="date-divider">
              <span>{date}</span>
            </div>
            {dateMessages.map((message: any) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.senderType === 'ADMIN'}
                showAvatar={message.isNewGroup}
                showTime={message.isNewGroup}
                appearance={defaultAppearance}
              />
            ))}
          </div>
        ))}

        {typingUsers.length > 0 && (
          <div className="typing-indicator">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span>Visitor is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Canned Responses Panel */}
      {showCannedResponses && (
        <CannedResponses
          category={session.category}
          onSelect={handleCannedResponse}
          onClose={() => setShowCannedResponses(false)}
        />
      )}

      {/* Input Area */}
      <form className="admin-chat-input" onSubmit={handleSubmit}>
        <button
          type="button"
          className="canned-response-btn"
          onClick={() => setShowCannedResponses(!showCannedResponses)}
        >
          💬
        </button>
        <button type="button" className="attach-btn">
          <Paperclip size={20} />
        </button>
        <textarea
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          placeholder="Type your message..."
          rows={1}
        />
        <button
          type="submit"
          className="send-btn"
          disabled={!inputValue.trim() || !isConnected}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}
