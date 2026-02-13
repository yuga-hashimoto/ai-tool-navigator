class KnowledgeBase {
  constructor() {
    this.faqs = [];
    this.knowledgeBasePath = "/Users/yu-ga/.clawdbot/agents/monetize-agent/livechat/knowledge-base.json";
    this.load();
  }

  load() {
    try {
      const data = require(this.knowledgeBasePath);
      this.faqs = data.faqs || [];
    } catch (error) {
      console.warn('No knowledge base found. Creating new one...');
      this.faqs = [];
    }
  }

  save() {
    const data = { faqs: this.faqs };
    require('fs').writeFileSync(this.knowledgeBasePath, JSON.stringify(data, null, 2));
  }

  addFAQ(question, answer) {
    const existing = this.faqs.find(faq => faq.question.toLowerCase() === question.toLowerCase());
    if (existing) {
      existing.answer = answer;
    } else {
      this.faqs.push({ question, answer });
    }
    this.save();
  }

  findAnswer(question) {
    const lowerQuestion = question.toLowerCase();
    return this.faqs.find(faq => 
      faq.question.toLowerCase().includes(lowerQuestion)
    )?.answer;
  }

  getProductRecommendations() {
    return [
      {
        name: 'Premium Support Plan',
        description: '24/7 priority support with SLA guarantees',
        link: 'https://example.com/premium',
        keywords: ['premium', 'support', '24/7', 'sla']
      },
      {
        name: 'Knowledge Base Access',
        description: 'Unlimited access to our comprehensive support resources',
        link: 'https://example.com/knowledge',
        keywords: ['knowledge', 'base', 'resources', 'self-help']
      },
      {
        name: 'Community Forum',
        description: 'Join our active community for peer-to-peer support',
        link: 'https://example.com/community',
        keywords: ['community', 'forum', 'peer', 'support']
      }
    ];
  }
}

export default KnowledgeBase;