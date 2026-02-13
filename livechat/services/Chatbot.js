import KnowledgeBase from '../models/KnowledgeBase';
import HandoffManager from './HandoffManager';

class ChatbotService {
  constructor() {
    this.knowledgeBase = new KnowledgeBase();
    this.handoffManager = new HandoffManager();
    this.conversationHistory = [];
    this.maxHistoryLength = 10;
    
    // Sentiment detection patterns
    this.escalationKeywords = [
      'angry', 'frustrated', 'supervisor', 'manager', 'escalate', 
      'human', 'agent', 'live person', 'complaint', 'refund',
      'billing error', 'not working', 'broken', 'urgent'
    ];
    
    // Product recommendation triggers
    this.recommendationTriggers = [
      'recommend', 'suggest', 'what should i buy', 'best product',
      'looking for', 'need help choosing', 'which is better',
      'product for', 'good for', 'alternative'
    ];
  }

  async getResponse(userMessage) {
    // Add to conversation history
    this.conversationHistory.push({ role: 'user', content: userMessage });
    
    // Trim history if too long
    if (this.conversationHistory.length > this.maxHistoryLength) {
      this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
    }

    // 1. Check for handoff needed
    if (this.shouldHandoff(userMessage)) {
      return await this.getHandoffResponse();
    }

    // 2. Check for product recommendations
    if (this.shouldRecommend(userMessage)) {
      return this.getProductRecommendation(userMessage);
    }

    // 3. Query knowledge base for answer
    const answer = await this.knowledgeBase.findAnswer(userMessage);
    if (answer) {
      return answer;
    }

    // 4. Generate contextual response based on conversation
    const contextualAnswer = await this.generateContextualResponse(userMessage);
    return contextualAnswer;
  }

  shouldHandoff(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    return this.escalationKeywords.some(keyword => 
      lowerMessage.includes(keyword)
    );
  }

  async getHandoffResponse() {
    // Check if agents are available
    const agentsAvailable = await this.handoffManager.checkAgents();
    
    if (agentsAvailable) {
      // Trigger handoff
      const ticketId = await this.handoffManager.createTicket(
        this.conversationHistory.slice(-5)
      );
      return `I'll connect you with a human agent now. Your ticket ID is ${ticketId}. They'll be with you in 2-5 minutes.`;
    } else {
      // Store for offline messaging
      const offlineTicketId = await this.handoffManager.storeOfflineMessage(
        this.conversationHistory.slice(-5)
      );
      return `Unfortunately, our agents are currently offline. I've saved your conversation and an agent will respond when they return (typically within 24 hours). Your reference ID: ${offlineTicketId}. In the meantime, can I help you with something else?`;
    }
  }

  shouldRecommend(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    return this.recommendationTriggers.some(trigger => 
      lowerMessage.includes(trigger)
    );
  }

  getProductRecommendation(userMessage) {
    // Simplified recommendation logic
    const recommendations = this.knowledgeBase.getProductRecommendations();
    const product = this.matchProductToQuery(userMessage, recommendations);
    
    if (product) {
      return `Based on your needs, I'd recommend our ${product.name}. It's ${product.description}. You can find it here: ${product.link}`;
    } else {
      return `I'd be happy to help with product recommendations. Could you tell me more about what you're looking for? For example: budget, use case, any specific features?`;
    }
  }

  matchProductToQuery(query, products) {
    const lowerQuery = query.toLowerCase();
    // Simple keyword matching (would be more sophisticated in production)
    return products.find(p => 
      p.keywords.some(kw => lowerQuery.includes(kw))
    ) || products[0]; // Return top product if no match
  }

  async generateContextualResponse(userMessage) {
    // Generate response based on last few messages
    const lastMessages = this.conversationHistory.slice(-3);
    
    // Simple pattern matching with context
    const context = lastMessages.map(m => m.content).join('\n');
    
    // Check if it's a greeting
    if (this.isGreeting(userMessage)) {
      return this.generateGreetingResponse();
    }
    
    // Check for repeated questions
    if (this.isRepeatedQuestion(userMessage)) {
      return `I think we discussed this before. Let me repeat: ${this.getPreviousAnswer(userMessage)}`;
    }
    
    // Default fallback response
    return `Thanks for your message. I'm not quite sure I understand. Could you please rephrase or ask something specific about our products or services? I'm here to help with: product information, troubleshooting, order status, and more.`;
  }

  isGreeting(message) {
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'];
    return greetings.some(g => message.toLowerCase().includes(g));
  }

  generateGreetingResponse() {
    const greetings = [
      'Hello! How can I help you today?',
      'Hi there! What can I assist you with?',
      'Hey! Welcome to our support chat. How may I assist?'
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  isRepeatedQuestion(message) {
    const lowerMessage = message.toLowerCase();
    const historyTexts = this.conversationHistory.slice(-5).map(m => m.content.toLowerCase());
    // Check if similar question was asked in last 5 turns
    return historyTexts.slice(0, -1).some(prev => 
      this.similarity(lowerMessage, prev) > 0.7
    );
  }

  getPreviousAnswer(question) {
    const lowerQuestion = question.toLowerCase();
    for (let i = this.conversationHistory.length - 2; i >= 0; i--) {
      const prevMsg = this.conversationHistory[i];
      if (this.conversationHistory[i+1] && 
          this.similarity(lowerQuestion, prevMsg.content.toLowerCase()) > 0.7) {
        return this.conversationHistory[i+1].content;
      }
    }
    return null;
  }

  // Simple text similarity (Jaccard-like)
  similarity(str1, str2) {
    const words1 = new Set(str1.toLowerCase().split(/\s+/));
    const words2 = new Set(str2.toLowerCase().split(/\s+/));
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    return intersection.size / union.size;
  }

  // Analytics
  getSessionStats() {
    const totalMessages = this.conversationHistory.length;
    const userMessages = this.conversationHistory.filter(m => m.role === 'user').length;
    
    return {
      totalMessages,
      userMessages,
      botResponses: totalMessages - userMessages,
      handoffs: this.handoffManager.getHandoffCount(),
      avgResponseTime: this.handoffManager.getAvgResponseTime(),
      satisfaction: this.handoffManager.getAvgSatisfaction()
    };
  }
}

export default ChatbotService;