'use client';

import { QuickReply } from '@/lib/chat-config';
import './ChatStyles.css';

interface QuickRepliesProps {
  replies: QuickReply[];
  onSelect: (reply: string) => void;
  primaryColor: string;
}

export default function QuickReplies({ replies, onSelect, primaryColor }: QuickRepliesProps) {
  if (replies.length === 0) return null;

  return (
    <div className="quick-replies">
      <div className="quick-replies-container">
        {replies.map((reply) => (
          <button
            key={reply.id}
            className="quick-reply-btn"
            onClick={() => onSelect(reply.value)}
            style={{ 
              borderColor: primaryColor,
              color: primaryColor,
            }}
          >
            {reply.label}
          </button>
        ))}
      </div>
    </div>
  );
}
