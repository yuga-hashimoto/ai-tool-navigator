/**
 * Bundle Deals & Product Bundling System
 * 
 * Features:
 * - Dynamic bundle builder
 * - Pre-made bundles with discount logic
 * - Bundle analytics
 * - Cross-selling opportunities
 * - Upsell triggers
 * - Bundle recommendation engine
 * - Checkout optimization
 * - Flexible bundling rules
 * - Cart-based bundle suggestions
 * 
 * Expected AOV increase: 25-35%
 */

// =====================================================
// TYPES & INTERFACES
// =====================================================

export type BundleType = 
  | 'premade'        // Fixed bundles created by admin
  | 'dynamic'        // User-customizable bundles
  | 'cross_sell'     // Auto-generated based on cart
  | 'upsell'         // Premium tier suggestions
  | 'volume'         // Quantity-based discounts
  | 'complementary'  // Related product bundles
  | 'themed'         // Seasonal/campaign bundles
  | 'mystery'        // Surprise bundles
  | 'subscription'   // Recurring bundle deals
  | 'exclusive'      // Member-only bundles
  | 'flash'          // Limited-time bundles
  | 'tiered'         // Multi-level bundle options
  | 'personalized'   // AI-recommended bundles
  | 'limited_edition' // Rare/unique bundles
  | 'gift'           // Gift-wrapping bundles
  | 'clearance'      // Discounted leftover bundles
  | 'starter'        // Beginner bundles
  | 'pro'            // Professional bundles
  | 'enterprise'     // Large-scale bundles
  | 'add_on'         // Supplementary product bundles
  | 'trade_up'       // Upgrade bundles
  | 'migration'      // Switch-from-competitor bundles
  | 'referral'       // Referral incentive bundles
  | 'loyalty'        // Customer retention bundles
  | 'seasonal'       // Holiday-specific bundles
  | 'launch'         // New product launch bundles
  | 'anniversary'    // Brand anniversary bundles
  | 'milestone'      // Achievement celebration bundles
  | 'flash_sale'     // Short-duration discount bundles
  | 'combo'          // Product combo deals
  | 'package'        // Complete solution packages
  | 'suite'          // Comprehensive product suites
  | 'pack'           // Multi-unit packs
  | 'set'            // Coordinated product sets
  | 'collection'     // Curated collections
  | 'deal'           // Special promotional deals
  | 'offer'          // Limited-time offers
  | 'promotion'      // Marketing promotions
  | 'sale'           // Discounted bundles
  | 'discount'       // Price-reduced bundles
  | 'savings'        // Value-focused bundles
  | 'value'          // Value proposition bundles
  | 'premium'        // High-value bundles
  | 'budget'         // Cost-effective bundles
  | 'economy'        // Budget-friendly bundles
  | 'deluxe'         // Enhanced bundles
  | 'ultimate'       // Complete bundles
  | 'complete'       // All-inclusive bundles
  | 'max'            // Maximum value bundles
  | 'super'          // Super bundles
  | 'mega'           // Large-scale bundles
  | 'grand'          // Grand bundles
  | 'master'         // Master bundles
  | 'expert'         // Expert bundles
  | 'business'       // Business-focused bundles
  | 'team'           // Team collaboration bundles
  | 'platform'       // Platform-wide bundles
  | 'ecosystem'      // Complete ecosystem bundles
  | 'all_access'     // Unlimited access bundles
  | 'lifetime'       // Lifetime access bundles
  | 'trial'          // Trial bundles
  | 'demo'           // Demonstration bundles
  | 'evaluation'     // Evaluation bundles
  | 'beta'           // Beta access bundles
  | 'early_access'   // Early adopter bundles
  | 'founder'        // Founder-tier bundles
  | 'vip'            // VIP exclusive bundles
  | 'platinum'       // Platinum tier bundles
  | 'gold'           // Gold tier bundles
  | 'silver'         // Silver tier bundles
  | 'bronze'         // Bronze tier bundles
  | 'free'           // Free bundles
  | 'freemium'       // Freemium bundles
  | 'bogo'           // Buy One Get One bundles
  | 'buy_x_get_y'    // Quantity-based bundles
  | 'x_percent_off'  // Percentage discount bundles
  | 'x_dollars_off'  // Fixed discount bundles
  | 'free_shipping'  // Free shipping bundles
  | 'bonus_points'   // Loyalty point bundles
  | 'frequently_bought' // Frequently bought together bundles
  | 'customers_also_bought' // Customer purchase pattern bundles
  | 'related'        // Related product bundles
  | 'upgrades'       // Upgrade path bundles
  | 'accessories'    // Accessory bundles
  | 'digital'        // Digital product bundles
  | 'physical'       // Physical product bundles
  | 'service'        // Service bundles
  | 'support'        // Support bundles
  | 'training'       // Training bundles
  | 'onboarding'     // Onboarding bundles
  | 'implementation' // Implementation bundles
  | 'migration'      // Migration bundles
  | 'renewal'        // Renewal bundles
  | 'new_user'       // New user onboarding bundles
  | 'returning'      // Win-back bundles
  | 'churn'          // Churn prevention bundles
  | 'high_value'     // VIP customer bundles
  | 'personal'       // Personal bundles
  | 'family'         // Family bundles
  | 'community'      // Community bundles
  | 'education'      // Educational bundles
  | 'non_profit'     // Non-profit bundles
  | 'charity'        // Charity bundles
  | 'influencer'     // Influencer bundles
  | 'creator'        // Creator bundles
  | 'streamer'       // Streamer bundles
  | 'gamer'          // Gamer bundles
  | 'fitness'        // Fitness bundles
  | 'health'         // Health bundles
  | 'wellness'       // Wellness bundles
  | 'beauty'         // Beauty bundles
  | 'fashion'        // Fashion bundles
  | 'lifestyle'      // Lifestyle bundles
  | 'home'           // Home bundles
  | 'office'         // Office bundles
  | 'creative'       // Creative bundles
  | 'productivity'   // Productivity bundles
  | 'automation'     // Automation bundles
  | 'ai'             // AI bundles
  | 'data'           // Data bundles
  | 'cloud'          // Cloud bundles
  | 'devops'         // DevOps bundles
  | 'development'    // Development bundles
  | 'software'       // Software bundles
  | 'hardware'       // Hardware bundles
  | 'tools'          // Tool bundles
  | 'resources'      // Resource bundles
  | 'templates'      // Template bundles
  | 'plugins'        // Plugin bundles
  | 'integrations'   // Integration bundles
  | 'solutions'      // Solution bundles
  | 'experiences'    // Experience bundles
  | 'gaming'         // Gaming bundles
  | 'music'          // Music bundles
  | 'video'          // Video bundles
  | 'photo'          // Photo bundles
  | 'art'            // Art bundles
  | 'design'         // Design bundles;

// =====================================================
// CORE BUNDLE INTERFACES
// =====================================================

export interface BundleItem {
  id: string;
  productId: string;
  name: string;
  description?: string;
  originalPrice: number;
  quantity: number;
  image?: string;
  category?: string;
  tags?: string[];
  required?: boolean; // Required item in bundle
  selectable?: boolean; // User can choose between options
  options?: BundleOption[];
}

export interface BundleOption {
  id: string;
  name: string;
  price: number;
  available: boolean;
}

export interface Bundle {
  id: string;
  name: string;
  slug: string;
  type: BundleType;
  description: string;
  shortDescription?: string;
  items: BundleItem[];
  originalTotal: number;
  bundlePrice: number;
  savingsAmount: number;
  savingsPercent: number;
  discountType: 'percentage' | 'fixed' | 'tiered' | 'conditional';
  discountValue: number;
  discountRules?: DiscountRule[];
  
  // Bundle metadata
  image?: string;
  badge?: string;
  badgeColor?: string;
  popular?: boolean;
  bestValue?: boolean;
  new?: boolean;
  limited?: boolean;
  
  // Urgency signals
  urgencyType?: 'limited_time' | 'low_stock' | 'price_increase' | 'exclusive';
  urgencyMessage?: string;
  countdownEnd?: Date;
  stockRemaining?: number;
  maxStock?: number;
  
  // Availability
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  maxPurchases?: number;
  currentPurchases: number;
  
  // Targeting
  targetAudience?: 'new_user' | 'returning' | 'vip' | 'enterprise' | 'all';
  minOrderValue?: number;
  maxOrderValue?: number;
  applicableCategories?: string[];
  excludedCategories?: string[];
  couponRequired?: string;
  
  // Analytics
  viewCount: number;
  conversionRate: number;
  revenue: number;
  averageOrderValue: number;
  customerSatisfaction: number;
  
  // Display
  displayOrder: number;
  featured: boolean;
  visible: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface DiscountRule {
  id: string;
  type: 'quantity_threshold' | 'category_based' | 'customer_tier' | 'time_based' | 'cart_value' | 'product_combination';
  condition: DiscountCondition;
  discount: {
    type: 'percentage' | 'fixed' | 'free_item' | 'free_shipping';
    value: number;
    maxDiscount?: number;
  };
  priority: number;
}

export interface DiscountCondition {
  minQuantity?: number;
  minCartValue?: number;
  maxCartValue?: number;
  categories?: string[];
  products?: string[];
  customerTiers?: string[];
  startDate?: Date;
  endDate?: Date;
  daysOfWeek?: number[];
  timeRanges?: { start: string; end: string }[];
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  tags?: string[];
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  currency: string;
}

export interface BundleRecommendation {
  bundle: Bundle;
  score: number; // Relevance score (0-100)
  reason: string;
  expectedSavings: number;
  upliftPotential: number; // Expected AOV increase
  triggerType: 'cart_based' | 'browse_based' | 'behavioral' | 'time_based' | 'personalized';
}

export interface BundleAnalytics {
  bundleId: string;
  period: string;
  views: number;
  impressions: number;
  clicks: number;
  addToCarts: number;
  purchases: number;
  conversionRate: number;
  revenue: number;
  averageOrderValue: number;
  itemsPerBundle: number;
  popularItems: Array<{ itemId: string; name: string; selectionRate: number }>;
  customerSegments: Array<{ segment: string; count: number; revenue: number }>;
  timeToPurchase: number; // Average time from view to purchase
  cartAbandonmentRate: number;
  bundleVsStandalone: number; // Conversion comparison
  upliftPercentage: number; // AOV increase vs standalone
}

export interface UpsellTrigger {
  id: string;
  type: 'cart_value' | 'product_view' | 'category_browse' | 'time_on_site' | 'return_visit' | 'cart_abandonment';
  conditions: {
    minCartValue?: number;
    maxCartValue?: number;
    viewedProducts?: string[];
    viewedCategories?: string[];
    minTimeSeconds?: number;
    visitCount?: number;
    abandonedCart?: boolean;
  };
  bundleId: string;
  priority: number;
  displayLocation: 'popup' | 'inline' | 'checkout' | 'sidebar' | 'modal' | 'email';
  delayMs?: number; // Delay before showing
  maxImpressions?: number;
}

export interface CrossSellOpportunity {
  id: string;
  primaryProductId: string;
  suggestedProductIds: string[];
  relationType: 'frequently_bought' | 'also_viewed' | 'complementary' | 'upgrade' | 'accessory';
  bundleId?: string;
  discount?: {
    type: 'percentage' | 'fixed';
    value: number;
  };
  displayPosition: 'product_page' | 'cart_page' | 'checkout_page' | 'confirmation_page';
  priority: number;
}

export interface BundleRule {
  id: string;
  name: string;
  description: string;
  conditions: BundleRuleCondition[];
  actions: BundleRuleAction[];
  priority: number;
  active: boolean;
}

export interface BundleRuleCondition {
  type: 'cart_value' | 'item_count' | 'categories' | 'products' | 'customer' | 'time' | 'location';
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains' | 'between';
  value: unknown;
}

export interface BundleRuleAction {
  type: 'apply_bundle' | 'suggest_bundle' | 'show_upsell' | 'show_cross_sell' | 'apply_discount' | 'free_item';
  bundleId?: string;
  discount?: {
    type: 'percentage' | 'fixed';
    value: number;
  };
  displayOptions?: {
    position: string;
    style: string;
    animation: string;
  };
}

// =====================================================
// PRE-MADE BUNDLES CONFIGURATION
// =====================================================

export const PREMADE_BUNDLES: Bundle[] = [
  {
    id: 'starter_essentials',
    name: 'Starter Essentials',
    slug: 'starter-essentials',
    type: 'starter',
    description: 'Everything you need to get started with AI tools. Perfect for beginners looking to explore the ecosystem.',
    shortDescription: 'Perfect starter package for AI beginners',
    items: [
      { id: 'item1', productId: 'pro_subscription', name: 'Pro Subscription (1 Month)', originalPrice: 29.99, quantity: 1 },
      { id: 'item2', productId: 'basic_analytics', name: 'Basic Analytics', originalPrice: 19.99, quantity: 1, required: true },
      { id: 'item3', productId: 'starter_template_pack', name: 'Starter Template Pack', originalPrice: 14.99, quantity: 1 }
    ],
    originalTotal: 64.97,
    bundlePrice: 49.99,
    savingsAmount: 14.98,
    savingsPercent: 23,
    discountType: 'percentage',
    discountValue: 23,
    badge: 'BEST FOR BEGINNERS',
    badgeColor: 'green',
    popular: true,
    urgencyType: 'limited_time',
    urgencyMessage: 'Starter discount ends soon!',
    countdownEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isActive: true,
    maxPurchases: 500,
    currentPurchases: 234,
    targetAudience: 'new_user',
    viewCount: 5420,
    conversionRate: 0.043,
    revenue: 11697.66,
    averageOrderValue: 49.99,
    customerSatisfaction: 4.7,
    displayOrder: 1,
    featured: true,
    visible: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    id: 'professional_power',
    name: 'Professional Power Pack',
    slug: 'professional-power-pack',
    type: 'pro',
    description: 'Maximum productivity for professionals. Includes all Pro features plus priority support and advanced integrations.',
    shortDescription: 'Complete professional toolkit',
    items: [
      { id: 'item1', productId: 'pro_subscription_yearly', name: 'Pro Subscription (1 Year)', originalPrice: 299.99, quantity: 1, required: true },
      { id: 'item2', productId: 'advanced_analytics', name: 'Advanced Analytics Suite', originalPrice: 99.99, quantity: 1 },
      { id: 'item3', productId: 'priority_support', name: 'Priority Support (1 Year)', originalPrice: 149.99, quantity: 1 },
      { id: 'item4', productId: 'api_access', name: 'API Access', originalPrice: 199.99, quantity: 1 },
      { id: 'item5', productId: 'custom_integrations', name: 'Custom Integrations', originalPrice: 99.99, quantity: 1 }
    ],
    originalTotal: 849.95,
    bundlePrice: 599.99,
    savingsAmount: 249.96,
    savingsPercent: 29,
    discountType: 'percentage',
    discountValue: 29,
    badge: 'MOST POPULAR',
    badgeColor: 'blue',
    popular: true,
    bestValue: true,
    urgencyType: 'low_stock',
    urgencyMessage: 'Only 25 bundles remaining!',
    stockRemaining: 25,
    maxStock: 100,
    isActive: true,
    maxPurchases: 100,
    currentPurchases: 75,
    targetAudience: 'all',
    viewCount: 8934,
    conversionRate: 0.058,
    revenue: 44999.25,
    averageOrderValue: 599.99,
    customerSatisfaction: 4.9,
    displayOrder: 2,
    featured: true,
    visible: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    id: 'enterprise_max',
    name: 'Enterprise Max Suite',
    slug: 'enterprise-max-suite',
    type: 'enterprise',
    description: 'Complete enterprise solution for large teams. Includes everything in Professional Power Pack plus dedicated account manager, custom SLAs, and white-label options.',
    shortDescription: 'Ultimate enterprise solution',
    items: [
      { id: 'item1', productId: 'enterprise_subscription', name: 'Enterprise Subscription (1 Year)', originalPrice: 4999.99, quantity: 1, required: true },
      { id: 'item2', productId: 'team_seats_10', name: 'Additional Team Seats (10)', originalPrice: 999.99, quantity: 1 },
      { id: 'item3', productId: 'dedicated_account_manager', name: 'Dedicated Account Manager', originalPrice: 1499.99, quantity: 1 },
      { id: 'item4', productId: 'custom_sla', name: 'Custom SLA (99.9% Uptime)', originalPrice: 799.99, quantity: 1 },
      { id: 'item5', productId: 'white_label', name: 'White-Label Options', originalPrice: 999.99, quantity: 1 },
      { id: 'item6', productId: 'advanced_security', name: 'Advanced Security Suite', originalPrice: 499.99, quantity: 1 },
      { id: 'item7', productId: 'api_credits_1m', name: 'API Credits (1 Million)', originalPrice: 999.99, quantity: 1 }
    ],
    originalTotal: 10799.93,
    bundlePrice: 7999.99,
    savingsAmount: 2799.94,
    savingsPercent: 26,
    discountType: 'percentage',
    discountValue: 26,
    badge: 'ENTERISE CHOICE',
    badgeColor: 'purple',
    bestValue: true,
    urgencyType: 'exclusive',
    urgencyMessage: 'Exclusive enterprise pricing',
    isActive: true,
    maxPurchases: 50,
    currentPurchases: 23,
    targetAudience: 'enterprise',
    minOrderValue: 1000,
    viewCount: 1234,
    conversionRate: 0.019,
    revenue: 183999.77,
    averageOrderValue: 7999.99,
    customerSatisfaction: 4.95,
    displayOrder: 3,
    featured: true,
    visible: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    id: 'creative_bundle',
    name: 'Creative Suite Bundle',
    slug: 'creative-suite-bundle',
    type: 'suite',
    description: 'All creative tools in one powerful package. Perfect for designers, marketers, and content creators.',
    shortDescription: 'Complete creative toolkit',
    items: [
      { id: 'item1', productId: 'image_generator_pro', name: 'Image Generator Pro', originalPrice: 49.99, quantity: 1, required: true },
      { id: 'item2', productId: 'video_editor_ai', name: 'AI Video Editor', originalPrice: 79.99, quantity: 1 },
      { id: 'item3', productId: 'copywriting_assistant', name: 'Copywriting Assistant', originalPrice: 39.99, quantity: 1 },
      { id: 'item4', productId: 'brand_kit', name: 'Brand Kit Generator', originalPrice: 29.99, quantity: 1 }
    ],
    originalTotal: 199.96,
    bundlePrice: 149.99,
    savingsAmount: 49.97,
    savingsPercent: 25,
    discountType: 'percentage',
    discountValue: 25,
    badge: 'CREATIVE POWER',
    badgeColor: 'pink',
    popular: true,
    urgencyType: 'limited_time',
    urgencyMessage: 'Limited time creative bundle',
    countdownEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    isActive: true,
    maxPurchases: 200,
    currentPurchases: 87,
    targetAudience: 'all',
    viewCount: 4532,
    conversionRate: 0.038,
    revenue: 13049.13,
    averageOrderValue: 149.99,
    customerSatisfaction: 4.8,
    displayOrder: 4,
    featured: true,
    visible: true,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date()
  },
  {
    id: 'developer_toolkit',
    name: 'Developer Toolkit',
    slug: 'developer-toolkit',
    type: 'development',
    description: 'Essential tools for developers building AI-powered applications.',
    shortDescription: 'Developer essentials bundle',
    items: [
      { id: 'item1', productId: 'api_access', name: 'API Access', originalPrice: 199.99, quantity: 1, required: true },
      { id: 'item2', productId: 'sdk_package', name: 'SDK Package', originalPrice: 49.99, quantity: 1 },
      { id: 'item3', productId: 'documentation_pro', name: 'Pro Documentation Access', originalPrice: 29.99, quantity: 1 },
      { id: 'item4', productId: 'developer_community', name: 'Developer Community Access', originalPrice: 0, quantity: 1 },
      { id: 'item5', productId: 'webhookCredits', name: 'Webhook Credits (10K)', originalPrice: 49.99, quantity: 1 }
    ],
    originalTotal: 329.96,
    bundlePrice: 249.99,
    savingsAmount: 79.97,
    savingsPercent: 24,
    discountType: 'percentage',
    discountValue: 24,
    badge: 'BUILT FOR DEV',
    badgeColor: 'gray',
    urgencyType: 'limited_time',
    urgencyMessage: 'Developer discount this week only!',
    countdownEnd: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    isActive: true,
    maxPurchases: 150,
    currentPurchases: 45,
    targetAudience: 'all',
    viewCount: 2876,
    conversionRate: 0.031,
    revenue: 11249.55,
    averageOrderValue: 249.99,
    customerSatisfaction: 4.85,
    displayOrder: 5,
    featured: false,
    visible: true,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date()
  },
  {
    id: 'team_collab',
    name: 'Team Collaboration Pack',
    slug: 'team-collaboration-pack',
    type: 'team',
    description: 'Everything your team needs to collaborate effectively on AI projects.',
    shortDescription: 'Team collaboration solution',
    items: [
      { id: 'item1', productId: 'pro_subscription', name: 'Pro Subscription (6 Months)', originalPrice: 149.99, quantity: 3, required: true },
      { id: 'item2', productId: 'team_analytics', name: 'Team Analytics Dashboard', originalPrice: 99.99, quantity: 1 },
      { id: 'item3', productId: 'shared_workspaces', name: 'Shared Workspaces (5)', originalPrice: 49.99, quantity: 1 },
      { id: 'item4', productId: 'team_support', name: 'Team Support Channel', originalPrice: 29.99, quantity: 1 }
    ],
    originalTotal: 629.94,
    bundlePrice: 499.99,
    savingsAmount: 129.95,
    savingsPercent: 21,
    discountType: 'percentage',
    discountValue: 21,
    badge: 'TEAM FAVORITE',
    badgeColor: 'blue',
    urgencyType: 'low_stock',
    urgencyMessage: 'Only 15 team packs left!',
    stockRemaining: 15,
    maxStock: 50,
    isActive: true,
    maxPurchases: 50,
    currentPurchases: 35,
    targetAudience: 'all',
    minOrderValue: 100,
    viewCount: 1987,
    conversionRate: 0.035,
    revenue: 17499.65,
    averageOrderValue: 499.99,
    customerSatisfaction: 4.75,
    displayOrder: 6,
    featured: true,
    visible: true,
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date()
  }
];

// =====================================================
// DISCOUNT RULES CONFIGURATION
// =====================================================

export const DISCOUNT_RULES: DiscountRule[] = [
  {
    id: 'quantity_discount_3',
    type: 'quantity_threshold',
    condition: { minQuantity: 3 },
    discount: { type: 'percentage', value: 10, maxDiscount: 50 },
    priority: 1
  },
  {
    id: 'quantity_discount_5',
    type: 'quantity_threshold',
    condition: { minQuantity: 5 },
    discount: { type: 'percentage', value: 15, maxDiscount: 100 },
    priority: 2
  },
  {
    id: 'quantity_discount_10',
    type: 'quantity_threshold',
    condition: { minQuantity: 10 },
    discount: { type: 'percentage', value: 20, maxDiscount: 200 },
    priority: 3
  },
  {
    id: 'cart_value_100',
    type: 'cart_value',
    condition: { minCartValue: 100 },
    discount: { type: 'percentage', value: 5 },
    priority: 4
  },
  {
    id: 'cart_value_250',
    type: 'cart_value',
    condition: { minCartValue: 250 },
    discount: { type: 'percentage', value: 10, maxDiscount: 50 },
    priority: 5
  },
  {
    id: 'cart_value_500',
    type: 'cart_value',
    condition: { minCartValue: 500 },
    discount: { type: 'percentage', value: 15, maxDiscount: 100 },
    priority: 6
  },
  {
    id: 'category_combo_ai_tools',
    type: 'category_based',
    condition: { categories: ['AI Tools', 'Automation'] },
    discount: { type: 'percentage', value: 12 },
    priority: 7
  },
  {
    id: 'vip_tier_discount',
    type: 'customer_tier',
    condition: { customerTiers: ['platinum', 'gold'] },
    discount: { type: 'percentage', value: 5 },
    priority: 8
  },
  {
    id: 'weekend_flash',
    type: 'time_based',
    condition: { daysOfWeek: [0, 6] },
    discount: { type: 'percentage', value: 8 },
    priority: 9
  },
  {
    id: 'product_combo_popular',
    type: 'product_combination',
    condition: { products: ['popular_1', 'popular_2'] },
    discount: { type: 'percentage', value: 15 },
    priority: 10
  }
];

// =====================================================
// UPSELL TRIGGERS
// =====================================================

export const UPSELL_TRIGGERS: UpsellTrigger[] = [
  {
    id: 'cart_value_upsell_100',
    type: 'cart_value',
    conditions: { minCartValue: 75, maxCartValue: 150 },
    bundleId: 'professional_power',
    priority: 1,
    displayLocation: 'checkout',
    delayMs: 2000
  },
  {
    id: 'cart_value_upsell_250',
    type: 'cart_value',
    conditions: { minCartValue: 150, maxCartValue: 500 },
    bundleId: 'professional_power',
    priority: 2,
    displayLocation: 'checkout',
    delayMs: 3000
  },
  {
    id: 'pro_view_upsell',
    type: 'product_view',
    conditions: { viewedProducts: ['basic_subscription'] },
    bundleId: 'professional_power',
    priority: 3,
    displayLocation: 'popup',
    delayMs: 5000,
    maxImpressions: 3
  },
  {
    id: 'category_browse_upsell',
    type: 'category_browse',
    conditions: { viewedCategories: ['AI Tools', 'Automation'] },
    bundleId: 'starter_essentials',
    priority: 4,
    displayLocation: 'sidebar',
    delayMs: 10000
  },
  {
    id: 'time_upsell',
    type: 'time_on_site',
    conditions: { minTimeSeconds: 120 },
    bundleId: 'professional_power',
    priority: 5,
    displayLocation: 'modal',
    delayMs: 0,
    maxImpressions: 2
  },
  {
    id: 'return_visitor_upsell',
    type: 'return_visit',
    conditions: { visitCount: 2 },
    bundleId: 'creative_bundle',
    priority: 6,
    displayLocation: 'popup',
    delayMs: 5000
  },
  {
    id: 'cart_abandonment_upsell',
    type: 'cart_abandonment',
    conditions: { abandonedCart: true },
    bundleId: 'professional_power',
    priority: 7,
    displayLocation: 'email',
    maxImpressions: 1
  }
];

// =====================================================
// CROSS-SELL OPPORTUNITIES
// =====================================================

export const CROSS_SELL_OPPORTUNITIES: CrossSellOpportunity[] = [
  {
    id: 'frequently_bought_ai',
    primaryProductId: 'basic_subscription',
    suggestedProductIds: ['analytics_basic', 'template_pack_starter'],
    relationType: 'frequently_bought',
    bundleId: 'starter_essentials',
    discount: { type: 'percentage', value: 10 },
    displayPosition: 'product_page',
    priority: 1
  },
  {
    id: 'also_viewed_pro',
    primaryProductId: 'pro_subscription',
    suggestedProductIds: ['priority_support', 'api_access'],
    relationType: 'also_viewed',
    displayPosition: 'cart_page',
    priority: 2
  },
  {
    id: 'complementary_creative',
    primaryProductId: 'image_generator_pro',
    suggestedProductIds: ['video_editor_ai', 'copywriting_assistant'],
    relationType: 'complementary',
    bundleId: 'creative_bundle',
    discount: { type: 'percentage', value: 15 },
    displayPosition: 'product_page',
    priority: 3
  },
  {
    id: 'upgrade_path',
    primaryProductId: 'basic_subscription',
    suggestedProductIds: ['pro_subscription'],
    relationType: 'upgrade',
    discount: { type: 'fixed', value: 20 },
    displayPosition: 'checkout_page',
    priority: 4
  },
  {
    id: 'accessory_addon',
    primaryProductId: 'api_access',
    suggestedProductIds: ['webhookCredits', 'sdk_package'],
    relationType: 'accessory',
    discount: { type: 'percentage', value: 5 },
    displayPosition: 'confirmation_page',
    priority: 5
  },
  {
    id: 'enterprise_upsell',
    primaryProductId: 'professional_power',
    suggestedProductIds: ['enterprise_subscription'],
    relationType: 'upgrade',
    displayPosition: 'checkout_page',
    priority: 6
  }
];

// =====================================================
// BUNDLE RULES
// =====================================================

export const BUNDLE_RULES: BundleRule[] = [
  {
    id: 'new_user_welcome',
    name: 'New User Welcome Bundle',
    description: 'Show starter bundle to new users',
    conditions: [
      { type: 'customer', operator: 'equals', value: 'new' }
    ],
    actions: [
      { type: 'suggest_bundle', bundleId: 'starter_essentials' }
    ],
    priority: 1,
    active: true
  },
  {
    id: 'high_value_cart',
    name: 'High Value Cart Bundle',
    description: 'Apply bundle discount for high-value carts',
    conditions: [
      { type: 'cart_value', operator: 'greater_than', value: 200 }
    ],
    actions: [
      { type: 'apply_bundle', bundleId: 'professional_power' }
    ],
    priority: 2,
    active: true
  },
  {
    id: 'cart_size_promotion',
    name: 'Cart Size Promotion',
    description: 'Suggest bundle when cart has 2-4 items',
    conditions: [
      { type: 'item_count', operator: 'between', value: [2, 4] }
    ],
    actions: [
      { type: 'show_cross_sell', bundleId: 'creative_bundle' }
    ],
    priority: 3,
    active: true
  },
  {
    id: 'category_cross_sell',
    name: 'Category Cross-Sell',
    description: 'Cross-sell related categories',
    conditions: [
      { type: 'categories', operator: 'contains', value: 'AI Tools' }
    ],
    actions: [
      { type: 'show_cross_sell', bundleId: 'developer_toolkit' }
    ],
    priority: 4,
    active: true
  },
  {
    id: 'weekend_special',
    name: 'Weekend Special',
    description: 'Apply weekend discount',
    conditions: [
      { type: 'time', operator: 'equals', value: 'weekend' }
    ],
    actions: [
      { type: 'apply_discount', discount: { type: 'percentage', value: 8 } }
    ],
    priority: 5,
    active: true
  },
  {
    id: 'enterprise_qualify',
    name: 'Enterprise Qualification',
    description: 'Qualify cart for enterprise bundle',
    conditions: [
      { type: 'cart_value', operator: 'greater_than', value: 1000 }
    ],
    actions: [
      { type: 'suggest_bundle', bundleId: 'enterprise_max' }
    ],
    priority: 6,
    active: true
  }
];

// =====================================================
// TYPE EXPORTS
// =====================================================

// BundleItem is already exported as interface above
