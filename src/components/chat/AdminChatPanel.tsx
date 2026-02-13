'use client';

import { useState, useEffect, useCallback } from 'react';
import { useChat } from '@/hooks/useChat';
import AdminChatWindow from './AdminChatWindow';
import './AdminChatStyles.css';

interface AdminChatPanelProps {
  adminId: string;
  adminName: string;
}

interface ChatSession {
  id: string;
  sessionId: string;
  visitorName?: string;
  visitorEmail?: string;
  category: string;
  status: string;
  priority: string;
  assignedTo?: string;
  createdAt: string;
  messages?: any[];
}

export default function AdminChatPanel({ adminId, adminName }: AdminChatPanelProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'waiting' | 'active' | 'closed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

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
    sessionId: selectedSession?.sessionId || '',
    userId: adminId,
    userName: adminName,
    userType: 'admin',
    autoConnect: true,
  });

  // Fetch active sessions
  const fetchSessions = useCallback(async () => {
    try {
      const response = await fetch('/api/chat/sessions');
      const data = await response.json();
      
      if (data.success) {
        setSessions(data.data);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [fetchSessions]);

  // Handle session selection
  const handleSelectSession = async (session: ChatSession) => {
    setSelectedSession(session);
    await loadMessages();
    markAsRead([]);
  };

  // Handle message send
  const handleSendMessage = (content: string) => {
    if (selectedSession) {
      sendMessage(content);
    }
  };

  // Handle assign chat
  const handleAssignChat = async (sessionId: string) => {
    try {
      await fetch('/api/chat/sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          status: 'ACTIVE',
          assignedTo: adminId,
        }),
      });
      fetchSessions();
    } catch (error) {
      console.error('Error assigning chat:', error);
    }
  };

  // Handle close chat
  const handleCloseChat = async (reason?: string) => {
    if (selectedSession) {
      try {
        await fetch('/api/chat/sessions', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: selectedSession.sessionId,
            status: 'CLOSED',
          }),
        });
        closeChat(reason);
        setSelectedSession(null);
        fetchSessions();
      } catch (error) {
        console.error('Error closing chat:', error);
      }
    }
  };

  // Filter sessions
  const filteredSessions = sessions.filter(session => {
    if (filter !== 'all' && session.status !== filter.toUpperCase()) {
      return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        session.visitorName?.toLowerCase().includes(query) ||
        session.visitorEmail?.toLowerCase().includes(query) ||
        session.sessionId.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const waitingCount = sessions.filter(s => s.status === 'WAITING').length;
  const activeCount = sessions.filter(s => s.status === 'ACTIVE' && s.assignedTo === adminId).length;

  return (
    <div className="admin-chat-panel">
      {/* Sidebar */}
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h2>Chat Inbox</h2>
          <div className="stats">
            <span className="stat-badge waiting">{waitingCount} waiting</span>
            <span className="stat-badge active">{activeCount} active</span>
          </div>
        </div>

        {/* Filters */}
        <div className="sidebar-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-tabs">
            {(['all', 'waiting', 'active', 'closed'] as const).map(f => (
              <button
                key={f}
                className={`filter-tab ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Session List */}
        <div className="session-list">
          {isLoading ? (
            <div className="loading">Loading...</div>
          ) : filteredSessions.length === 0 ? (
            <div className="empty-state">No conversations found</div>
          ) : (
            filteredSessions.map(session => (
              <div
                key={session.id}
                className={`session-item ${selectedSession?.id === session.id ? 'selected' : ''} ${session.status.toLowerCase()}`}
                onClick={() => handleSelectSession(session)}
              >
                <div className="session-avatar">
                  {session.visitorName?.charAt(0) || 'V'}
                </div>
                <div className="session-info">
                  <div className="session-header">
                    <span className="visitor-name">{session.visitorName || 'Anonymous Visitor'}</span>
                    <span className="session-time">
                      {new Date(session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="session-preview">
                    <span className={`status-badge ${session.status.toLowerCase()}`}>
                      {session.status}
                    </span>
                    <span className="category-badge">{session.category}</span>
                  </div>
                </div>
                {session.status === 'WAITING' && (
                  <button
                    className="assign-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAssignChat(session.sessionId);
                    }}
                  >
                    Accept
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      {selectedSession ? (
        <AdminChatWindow
          session={selectedSession}
          messages={messages}
          typingUsers={typingUsers}
          isConnected={isConnected}
          adminName={adminName}
          onSendMessage={handleSendMessage}
          onTyping={sendTyping}
          onClose={() => handleCloseChat()}
        />
      ) : (
        <div className="no-selection">
          <div className="no-selection-content">
            <h3>Select a conversation</h3>
            <p>Choose a chat from the sidebar to start responding</p>
          </div>
        </div>
      )}
    </div>
  );
}
