// Proactive Chat Triggers Configuration
export interface ProactiveTrigger {
  id: string;
  name: string;
  triggerType: 'time_on_page' | 'scroll_depth' | 'exit_intent' | 'page_visit' | 'custom';
  conditions: {
    pages?: string[];
    minTimeOnPage?: number;
    minScrollDepth?: number;
    userSegment?: string;
  };
  targeting: {
    newVisitors?: boolean;
    returningVisitors?: boolean;
    specificPages?: string[];
    excludePages?: string[];
  };
  message: string;
  buttonText?: string;
  autoOpen?: boolean;
  delay?: number; // milliseconds
  priority: 'low' | 'normal' | 'high';
  isActive: boolean;
  maxPerSession?: number;
  cooldownMinutes?: number;
}

export const defaultTriggers: ProactiveTrigger[] = [
  {
    id: 'welcome',
    name: 'Welcome Message',
    triggerType: 'time_on_page',
    conditions: {
      minTimeOnPage: 5000,
    },
    targeting: {
      newVisitors: true,
      excludePages: ['/checkout', '/cart'],
    },
    message: '👋 Hi there! Welcome to AI Tool Navigator. How can I help you find the perfect AI tool today?',
    buttonText: 'Chat with us',
    priority: 'normal',
    isActive: true,
    maxPerSession: 1,
    cooldownMinutes: 60,
  },
  {
    id: 'browsing_help',
    name: 'Need Help Browsing?',
    triggerType: 'scroll_depth',
    conditions: {
      minScrollDepth: 50,
    },
    targeting: {
      specificPages: ['/tools', '/category'],
    },
    message: '🎯 I noticed you\'re exploring our AI tools catalog. Looking for something specific? I can help you find the right tool!',
    buttonText: 'Get recommendations',
    priority: 'low',
    isActive: true,
    maxPerSession: 2,
    cooldownMinutes: 30,
  },
  {
    id: 'exit_intent',
    name: 'Exit Intent Offer',
    triggerType: 'exit_intent',
    conditions: {},
    targeting: {
      excludePages: ['/checkout', '/cart', '/support'],
    },
    message: '😔 Leaving so soon? Before you go, let me know if you have any questions about AI tools or if there\'s anything I can help with!',
    buttonText: 'Stay and chat',
    priority: 'high',
    isActive: true,
    maxPerSession: 1,
    cooldownMinutes: 120,
  },
  {
    id: 'pricing_inquiry',
    name: 'Pricing Questions',
    triggerType: 'page_visit',
    conditions: {},
    targeting: {
      specificPages: ['/pricing', '/plans'],
    },
    message: '💰 Interested in our pricing? I\'d be happy to explain our plans and help you choose the right one for your needs!',
    buttonText: 'Compare plans',
    priority: 'high',
    isActive: true,
  },
  {
    id: 'technical_help',
    name: 'Technical Support',
    triggerType: 'page_visit',
    conditions: {},
    targeting: {
      specificPages: ['/docs', '/help', '/support'],
    },
    message: '🔧 Need help with something technical? I\'m here to assist you with any questions or issues you might have!',
    buttonText: 'Get support',
    priority: 'high',
    isActive: true,
  },
  {
    id: 'tool_comparison',
    name: 'Tool Comparison Help',
    triggerType: 'time_on_page',
    conditions: {
      minTimeOnPage: 15000,
    },
    targeting: {
      specificPages: ['/compare'],
    },
    message: '🤔 Comparing AI tools? I can help you understand the differences and find the best one for your use case!',
    buttonText: 'Ask an expert',
    priority: 'normal',
    isActive: true,
  },
];

// Chat Widget Appearance Settings
export interface WidgetAppearance {
  position: 'bottom-right' | 'bottom-left';
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  accentColor: string;
  borderRadius: number;
  showAvatar: boolean;
  avatarUrl?: string;
  companyName: string;
  welcomeMessage: string;
  placeholderText: string;
  offlineMessage: string;
  agentOnlineText: string;
  agentOfflineText: string;
}

export const defaultAppearance: WidgetAppearance = {
  position: 'bottom-right',
  primaryColor: '#4F46E5', // Indigo-600
  secondaryColor: '#FFFFFF',
  textColor: '#1F2937',
  accentColor: '#6366F1',
  borderRadius: 12,
  showAvatar: true,
  companyName: 'AI Tool Navigator',
  welcomeMessage: 'Welcome! How can we help you today?',
  placeholderText: 'Type your message...',
  offlineMessage: 'We\'re currently offline. Leave a message and we\'ll get back to you!',
  agentOnlineText: 'We typically reply in a few minutes',
  agentOfflineText: 'Leave a message',
};

// Operating Hours
export interface OperatingHours {
  timezone: string;
  schedule: {
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    isOpen: boolean;
    openTime: string; // HH:mm
    closeTime: string; // HH:mm
  }[];
  holidayMode: 'offline' | 'automated' | 'custom';
  customOfflineMessage?: string;
}

export const defaultOperatingHours: OperatingHours = {
  timezone: 'America/New_York',
  schedule: [
    { day: 'monday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
    { day: 'tuesday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
    { day: 'wednesday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
    { day: 'thursday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
    { day: 'friday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
    { day: 'saturday', isOpen: true, openTime: '10:00', closeTime: '16:00' },
    { day: 'sunday', isOpen: false, openTime: '00:00', closeTime: '00:00' },
  ],
  holidayMode: 'offline',
};

// Quick Reply Options
export interface QuickReply {
  id: string;
  label: string;
  value: string;
  category?: string;
}

export const defaultQuickReplies: QuickReply[] = [
  { id: 'pricing', label: '💰 Pricing', value: 'I have a question about pricing' },
  { id: 'features', label: '✨ Features', value: 'Tell me about the features' },
  { id: 'demo', label: '🎮 Request a demo', value: 'I\'d like to request a demo' },
  { id: 'support', label: '🔧 Get support', value: 'I need technical support' },
  { id: 'affiliate', label: '🤝 Partnership', value: 'I\'m interested in partnership' },
];

// Export configuration
export const chatConfig = {
  triggers: defaultTriggers,
  appearance: defaultAppearance,
  operatingHours: defaultOperatingHours,
  quickReplies: defaultQuickReplies,
};

export default chatConfig;
