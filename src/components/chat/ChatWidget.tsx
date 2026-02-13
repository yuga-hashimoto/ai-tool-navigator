'use client';

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import './ChatStyles.css';

interface ChatWidgetProps {
  isOpen: boolean;
  unreadCount: number;
  primaryColor: string;
  onClick: () => void;
}

export default function ChatWidget({
  isOpen,
  unreadCount,
  primaryColor,
  onClick,
}: ChatWidgetProps) {
  return (
    <button
      className={`chat-widget-button ${isOpen ? 'open' : ''}`}
      onClick={onClick}
      style={{ backgroundColor: primaryColor }}
      aria-label="Toggle chat"
    >
      {isOpen ? (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      ) : (
        <div className="widget-icon-wrapper">
          <MessageCircle size={28} color="white" />
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </div>
      )}
    </button>
  );
}
