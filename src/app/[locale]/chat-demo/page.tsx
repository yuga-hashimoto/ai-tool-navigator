'use client';

import { useState } from 'react';
import { ChatWidgetContainer } from '@/components/chat';
import { defaultQuickReplies, defaultTriggers } from '@/lib/chat-config';
import './ChatWidgetDemo.css';

export default function ChatWidgetDemo() {
  const [showSettings, setShowSettings] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [position, setPosition] = useState<'bottom-right' | 'bottom-left'>('bottom-right');
  const [primaryColor, setPrimaryColor] = useState('#4F46E5');

  return (
    <div className="chat-demo-page">
      <div className="demo-header">
        <h1>Live Chat Widget Demo</h1>
        <p>Test the live chat functionality</p>
      </div>

      <div className="demo-controls">
        <button 
          className="control-toggle"
          onClick={() => setShowSettings(!showSettings)}
        >
          {showSettings ? 'Hide Settings' : 'Show Settings'}
        </button>

        {showSettings && (
          <div className="settings-panel">
            <h3>Widget Settings</h3>
            
            <div className="setting-group">
              <label>Your Name (optional)</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>

            <div className="setting-group">
              <label>Your Email (optional)</label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>

            <div className="setting-group">
              <label>Position</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value as any)}
              >
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-left">Bottom Left</option>
              </select>
            </div>

            <div className="setting-group">
              <label>Primary Color</label>
              <div className="color-picker">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                />
                <span>{primaryColor}</span>
              </div>
            </div>

            <div className="setting-info">
              <h4>Proactive Triggers Active:</h4>
              <ul>
                {defaultTriggers.filter(t => t.isActive).map(trigger => (
                  <li key={trigger.id}>{trigger.name}</li>
                ))}
              </ul>
            </div>

            <div className="setting-info">
              <h4>Quick Replies Available:</h4>
              <ul>
                {defaultQuickReplies.map(reply => (
                  <li key={reply.id}>{reply.label}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="demo-content">
        <h2>Test the Live Chat</h2>
        <p>
          Click the chat button in the corner to start a conversation. 
          Try out the proactive chat triggers by:
        </p>
        <ul>
          <li>Waiting 5 seconds on this page (time-on-page trigger)</li>
          <li>Scrolling down 50% of the page (scroll depth trigger)</li>
          <li>Moving your mouse outside the page (exit intent trigger)</li>
        </ul>
        <p className="note">
          Note: Triggers are disabled when the chat is open to avoid interruptions.
        </p>
      </div>

      <ChatWidgetContainer
        sessionId={`demo_${Date.now()}`}
        userName={userName || undefined}
        userEmail={userEmail || undefined}
        position={position}
        primaryColor={primaryColor}
      />
    </div>
  );
}
