'use client';

import { useState } from 'react';
import { Check, Clock, Image as ImageIcon, File as FileIcon } from 'lucide-react';
import { defaultAppearance } from '@/lib/chat-config';
import './ChatStyles.css';

interface MessageBubbleProps {
  message: {
    id: string;
    senderType: string;
    senderName?: string;
    content: string;
    contentType: string;
    createdAt: string;
    isRead: boolean;
  };
  isOwn: boolean;
  showAvatar: boolean;
  showTime: boolean;
  appearance: typeof defaultAppearance;
}

export default function MessageBubble({
  message,
  isOwn,
  showAvatar,
  showTime,
  appearance,
}: MessageBubbleProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderContent = () => {
    switch (message.contentType) {
      case 'IMAGE':
        return (
          <div className="message-image">
            <img
              src={message.content}
              alt="Shared image"
              loading="lazy"
              onLoad={() => setIsImageLoaded(true)}
              onError={() => setImageError(true)}
              style={{ display: isImageLoaded ? 'block' : 'none' }}
            />
            {!isImageLoaded && !imageError && (
              <div className="image-loading">
                <div className="spinner"></div>
              </div>
            )}
            {imageError && (
              <div className="image-error">
                <ImageIcon size={48} />
                <span>Failed to load image</span>
              </div>
            )}
          </div>
        );

      case 'FILE':
        return (
          <a href={message.content} download className="message-file">
            <FileIcon size={24} />
            <div className="file-info">
              <span className="file-name">{message.content}</span>
              <span className="file-download">Click to download</span>
            </div>
          </a>
        );

      default:
        return (
          <div className="message-text">
            {message.content.split('\n').map((line, i) => (
              <span key={i}>{line}</span>
            ))}
          </div>
        );
    }
  };

  return (
    <div className={`message-bubble ${isOwn ? 'own' : 'other'}`}>
      {/* Avatar */}
      {!isOwn && showAvatar && (
        <div className="message-avatar">
          {message.senderType === 'ADMIN' ? (
            <div className="avatar admin" style={{ backgroundColor: appearance.primaryColor }}>
              <span>A</span>
            </div>
          ) : (
            <div className="avatar visitor">
              <span>{message.senderName?.charAt(0) || 'V'}</span>
            </div>
          )}
        </div>
      )}

      {/* Message Content */}
      <div className="message-content">
        {!isOwn && showAvatar && message.senderName && (
          <span className="sender-name">{message.senderName}</span>
        )}
        {renderContent()}
        <div className="message-meta">
          {showTime && (
            <span className="message-time">{formatTime(message.createdAt)}</span>
          )}
          {isOwn && (
            <span className="message-status">
              {message.isRead ? (
                <Check size={14} className="read" />
              ) : (
                <Clock size={14} />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
