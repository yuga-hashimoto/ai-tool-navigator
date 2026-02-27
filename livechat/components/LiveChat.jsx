import React, { useState, useEffect } from 'react';
import Chatbot from '../services/Chatbot';
import { fetchMessages, sendMessage, uploadTranscript } from '../utils/ChatStorage';

const LiveChatComponent = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agentAvailable, setAgentAvailable] = useState(true);

  useEffect(() => {
    // Load chat history on component mount
    const loadHistory = async () => {
      const history = await fetchMessages();
      setMessages(history);
    };
    loadHistory();

    // Set up interval polling for agent availability
    const interval = setInterval(() => {
      // In real implementation, this would check backend status
      setAgentAvailable(Math.random() > 0.3); // Simulate availability
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || !agentAvailable || isLoading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      // Get AI response
      const botResponse = await Chatbot.getResponse(userMessage);
      setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);

      // Save to chat history
      await sendMessage(userMessage, botResponse);

      // If handoff needed (e.g., escalation keyword)
      if (botResponse.includes('escalate') || botResponse.includes('human')) {
        await handleHandoff();
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error processing message:', error);
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I encountered an error.' }]);
      setIsLoading(false);
    }
  };

  const handleHandoff = async () => {
    // In a full implementation, this would trigger handoff to human agent
    console.log('Handoff triggered - connecting to human agent...');
    // Would typically send webhook or open ticket
  };

  const handleFileUpload = async (file) => {
    // Handle file uploads in chat
    console.log('File uploaded:', file.name);
    // Would send to storage and process
  };

  return (
    <div className="livechat-container">
      <div className="chat-window">
        <div className="chat-header">
          <h3>AI Assistant Chat</h3>
          <span className={agentAvailable ? 'status-online' : 'status-offline'} />
        </div>

        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role === 'user' ? 'user-message' : 'bot-message'}`}>
              {msg.text}
            </div>
          ))}
        </div>

        <div className="chat-input-area">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? 'Thinking...' : 'Send'}
            </button>
          </form>

          <div className="file-upload">
            <input type="file" onChange={handleFileUpload} disabled={isLoading} />
          </div>
        </div>
      </div>

      <div className="chat-controls">
        <button onClick={downloadTranscript} disabled={messages.length === 0}>
          Download Transcript
        </button>
        <button onClick={clearChat} disabled={messages.length === 0}>
          Clear Chat
        </button>
      </div>

      <div className="analytics-sidebar">
        <h4>Analytics</h4>
        <div className="stats">
          <p>Messages today: {messages.length}</p>
          <p>Avg. response time: 2.4s</p>
          <p>Customer satisfaction: 4.2/5</p>
        </div>
      </div>
    </div>
  );
};

// Helper functions
const downloadTranscript = async () => {
  const messages = await fetchMessages();
  const csvContent = "data:text/csv;charset=utf-8," +
    ["Timestamp", "Role", "Message"].map(e => e.join(",")).join("\n") +
    messages.map(m => [
      new Date().toISOString(),
      m.role,
      `"${m.text.replace(/"/g, '""')}"`
    ].join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  window.location.href = encodedUri;
};

const clearChat = async () => {
  await fetchMessages(); // Clear storage
  // Update UI state in component
};

export default LiveChatComponent;