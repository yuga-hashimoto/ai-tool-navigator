/**
 * Bundle Manager - Core Bundle System Implementation
 * 
 * Features:
 * - Dynamic bundle builder
 * - Pre-made bundles management
 * - Discount calculation engine
 * - Bundle analytics
 * - Cross-selling engine
 * - Upsell trigger system
 * - Recommendation engine
 * - Checkout optimization
 * - Cart-based bundle suggestions
 */

// =====================================================
// IMPORTS
// =====================================================

import {
  Bundle,
  BundleItem,
  BundleType,
  Cart,
  CartItem,
  BundleRecommendation,
  BundleAnalytics,
  UpsellTrigger,
  CrossSellOpportunity,
  BundleRule,
  DiscountRule,
  DiscountCondition,
  PREMADE_BUNDLES,
  DISCOUNT_RULES,
  UPSELL_TRIGGERS,
  CROSS_SELL_OPPORTUNITIES,
  BUNDLE_RULES
} from './bundleTypes';

// =====================================================
// BUNDLE MANAGER CLASS
// =====================================================

export class BundleManager {
  private bundles: Map<string, Bundle>;
  private discountRules: Map<string, DiscountRule>;
  private upsellTriggers: Map<string, UpsellTrigger>;
  private crossSellOpportunities: Map<string, CrossSellOpportunity>;
  private bundleRules: Map<string, BundleRule>;
  
  // Analytics tracking
  private viewLog: Map<string, Date[]>;
  private conversionLog: Map<string, { timestamp: Date; revenue: number; bundleId: string }[]>;
  
  constructor() {
    this.bundles = new Map();
    this.discountRules = new Map();
    this.upsellTriggers = new Map();
    this.crossSellOpportunities = new Map();
    this.bundleRules = new Map();
    this.viewLog = new Map();
    this.conversionLog = new Map();
    
    // Initialize with pre-made bundles
    this.initializeBundles();
  }
  
  // =====================================================
  // INITIALIZATION
  // =====================================================
  
  private initializeBundles(): void {
    // Load pre-made bundles
    PREMADE_BUNDLES.forEach(bundle => {
      this.bundles.set(bundle.id, bundle);
    });
    
    // Load discount rules
    DISCOUNT_RULES.forEach(rule => {
      this.discountRules.set(rule.id, rule);
    });
    
    // Load upsell triggers
    UPSELL_TRIGGERS.forEach(trigger => {
      this.upsellTriggers.set(trigger.id, trigger);
    });
    
    // Load cross-sell opportunities
    CROSS_SELL_OPPORTUNITIES.forEach(opp => {
      this.crossSellOpportunities.set(opp.id, opp);
    });
    
    // Load bundle rules
    BUNDLE_RULES.forEach(rule => {
      this.bundleRules.set(rule.id, rule);
    });
  }
  
  // =====================================================
  // BUNDLE CRUD OPERATIONS
  // =====================================================
  
  getBundle(bundleId: string): Bundle | undefined {
    return this.bundles.get(bundleId);
  }
  
  getAllBundles(): Bundle[] {
    return Array.from(this.bundles.values()).filter(b => b.isActive && b.visible);
  }
  
  getBundlesByType(type: BundleType): Bundle[] {
    return this.getAllBundles().filter(b => b.type === type);
  }
  
  getFeaturedBundles(): Bundle[] {
    return this.getAllBundles().filter(b => b.featured);
  }
  
  getPopularBundles(): Bundle[] {
    return this.getAllBundles()
      .filter(b => b.popular)
      .sort((a, b) => b.conversionRate - a.conversionRate);
  }
  
  getBestValueBundles(): Bundle[] {
    return this.getAllBundles()
      .filter(b => b.bestValue)
      .sort((a, b) => b.savingsPercent - a.savingsPercent);
  }
  
  createBundle(bundle: Omit<Bundle, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'conversionRate' | 'revenue' | 'averageOrderValue' | 'customerSatisfaction' | 'currentPurchases'>): Bundle {
    const newBundle: Bundle = {
      ...bundle,
      id: `bundle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      viewCount: 0,
      conversionRate: 0,
      revenue: 0,
      averageOrderValue: 0,
      customerSatisfaction: 0,
      currentPurchases: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.bundles.set(newBundle.id, newBundle);
    return newBundle;
  }
  
  updateBundle(bundleId: string, updates: Partial<Bundle>): Bundle | undefined {
    const bundle = this.bundles.get(bundleId);
    if (!bundle) return undefined;
    
    const updatedBundle = {
      ...bundle,
      ...updates,
      updatedAt: new Date()
    };
    
    this.bundles.set(bundleId, updatedBundle);
    return updatedBundle;
  }
  
  deleteBundle(bundleId: string): boolean {
    return this.bundles.delete(bundleId);
  }
  
  // =====================================================
  // DISCOUNT CALCULATION ENGINE
  // =====================================================
  
  calculateBundleSavings(bundle: Bundle): {
    originalTotal: number;
    bundlePrice: number;
    savingsAmount: number;
    savingsPercent: number;
  } {
    const originalTotal = bundle.items.reduce((sum, item) => {
      const price = item.selectable && item.options?.[0] 
        ? item.options[0].price 
        : item.originalPrice;
      return sum + (price * item.quantity);
    }, 0);
    
    const savingsAmount = originalTotal - bundle.bundlePrice;
    const savingsPercent = originalTotal > 0 
      ? Math.round((savingsAmount / originalTotal) * 100) 
      : 0;
    
    return { originalTotal, bundlePrice: bundle.bundlePrice, savingsAmount, savingsPercent };
  }
  
  applyDiscountRules(cart: Cart, customerTier?: string): {
    applicableRules: DiscountRule[];
    totalDiscount: number;
    appliedDiscounts: Array<{ ruleId: string; discount: number; reason: string }>;
  } {
    const applicableRules: DiscountRule[] = [];
    const appliedDiscounts: Array<{ ruleId: string; discount: number; reason: string }> = [];
    let totalDiscount = 0;
    
    // Get all applicable rules sorted by priority
    const sortedRules = Array.from(this.discountRules.values())
      .sort((a, b) => a.priority - b.priority);
    
    for (const rule of sortedRules) {
      if (this.checkDiscountCondition(rule.condition, cart, customerTier)) {
        const discount = this.calculateDiscount(rule, cart);
        if (discount > 0) {
          applicableRules.push(rule);
          appliedDiscounts.push({
            ruleId: rule.id,
            discount,
            reason: this.getDiscountReason(rule)
          });
          totalDiscount += discount;
        }
      }
    }
    
    return { applicableRules, totalDiscount, appliedDiscounts };
  }
  
  private checkDiscountCondition(
    condition: DiscountCondition, 
    cart: Cart, 
    customerTier?: string
  ): boolean {
    // Check quantity threshold
    if (condition.minQuantity) {
      const totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      if (totalQuantity < condition.minQuantity) return false;
    }
    
    // Check cart value
    if (condition.minCartValue && cart.subtotal < condition.minCartValue) return false;
    if (condition.maxCartValue && cart.subtotal > condition.maxCartValue) return false;
    
    // Check categories
    if (condition.categories && condition.categories.length > 0) {
      const cartCategories = cart.items.map(item => item.category);
      const hasMatchingCategory = condition.categories.some(cat => 
        cartCategories.includes(cat)
      );
      if (!hasMatchingCategory) return false;
    }
    
    // Check customer tier
    if (condition.customerTiers && condition.customerTiers.length > 0) {
      if (!customerTier || !condition.customerTiers.includes(customerTier)) {
        return false;
      }
    }
    
    // Check days of week
    if (condition.daysOfWeek && condition.daysOfWeek.length > 0) {
      const today = new Date().getDay();
      if (!condition.daysOfWeek.includes(today)) return false;
    }
    
    return true;
  }
  
  private calculateDiscount(rule: DiscountRule, cart: Cart): number {
    const subtotal = cart.subtotal;
    
    switch (rule.discount.type) {
      case 'percentage':
        let discount = subtotal * (rule.discount.value / 100);
        if (rule.discount.maxDiscount) {
          discount = Math.min(discount, rule.discount.maxDiscount);
        }
        return Math.round(discount * 100) / 100;
        
      case 'fixed':
        return Math.min(rule.discount.value, subtotal);
        
      default:
        return 0;
    }
  }
  
  private getDiscountReason(rule: DiscountRule): string {
    switch (rule.type) {
      case 'quantity_threshold':
        return `Buy ${rule.condition.minQuantity}+ items and save ${rule.discount.value}%`;
      case 'cart_value':
        return `Spend $${rule.condition.minCartValue}+ and save ${rule.discount.value}%`;
      case 'category_based':
        return `Special discount on ${rule.condition.categories?.join(', ')}`;
      case 'customer_tier':
        return `Exclusive ${rule.discount.value}% off for ${rule.condition.customerTiers?.join(', ')}`;
      case 'time_based':
        return `Limited time offer`;
      default:
        return 'Special discount applied';
    }
  }
  
  // =====================================================
  // DYNAMIC BUNDLE BUILDER
  // =====================================================
  
  buildDynamicBundle(
    selectedItems: Array<{ productId: string; quantity: number; price: number; category?: string }>,
    options?: {
      targetSavings?: number;
      maxPrice?: number;
      includeFreeItems?: boolean;
      allowSubstitutions?: boolean;
    }
  ): {
    bundle: Bundle;
    alternativeBundles: Bundle[];
    savings: number;
    recommendation: string;
  } {
    const { targetSavings = 20, maxPrice, includeFreeItems = true, allowSubstitutions = true } = options || {};
    
    // Calculate current cart value
    const cartTotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Find complementary items to add
    const complementaryItems = this.findComplementaryItems(selectedItems);
    
    // Build dynamic bundle
    const bundleItems: BundleItem[] = selectedItems.map((item, index) => ({
      id: `dyn_${index}`,
      productId: item.productId,
      name: item.productId, // Would be replaced with actual product name
      originalPrice: item.price,
      quantity: item.quantity
    }));
    
    // Add complementary items
    if (includeFreeItems && complementaryItems.length > 0) {
      complementaryItems.slice(0, 2).forEach((item, index) => {
        bundleItems.push({
          id: `dyn_free_${index}`,
          productId: item.productId,
          name: item.name || item.productId,
          originalPrice: item.price,
          quantity: 1,
          required: false
        });
      });
    }
    
    const originalTotal = bundleItems.reduce((sum, item) => sum + (item.originalPrice * item.quantity), 0);
    const targetPrice = originalTotal * (1 - targetSavings / 100);
    const bundlePrice = maxPrice ? Math.min(targetPrice, maxPrice) : targetPrice;
    const savingsAmount = originalTotal - bundlePrice;
    const savingsPercent = Math.round((savingsAmount / originalTotal) * 100);
    
    const dynamicBundle: Bundle = {
      id: `dynamic_${Date.now()}`,
      name: 'Custom Bundle',
      slug: 'custom-bundle',
      type: 'dynamic',
      description: 'Personalized bundle based on your selection',
      items: bundleItems,
      originalTotal,
      bundlePrice,
      savingsAmount,
      savingsPercent,
      discountType: 'percentage',
      discountValue: savingsPercent,
      isActive: true,
      currentPurchases: 0,
      viewCount: 0,
      conversionRate: 0,
      revenue: 0,
      averageOrderValue: 0,
      customerSatisfaction: 0,
      displayOrder: 999,
      featured: false,
      visible: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Find alternative pre-made bundles
    const alternativeBundles = this.findAlternativeBundles(selectedItems);
    
    return {
      bundle: dynamicBundle,
      alternativeBundles,
      savings: savingsAmount,
      recommendation: this.generateDynamicBundleRecommendation(dynamicBundle, alternativeBundles, cartTotal)
    };
  }
  
  private findComplementaryItems(
    selectedItems: Array<{ productId: string; quantity: number; price: number; category?: string }>
  ): Array<{ productId: string; name?: string; price: number }> {
    const complementary: Array<{ productId: string; name?: string; price: number }> = [];
    const selectedProductIds = selectedItems.map(i => i.productId);
    
    // Check cross-sell opportunities
    for (const opp of this.crossSellOpportunities.values()) {
      if (selectedProductIds.includes(opp.primaryProductId)) {
        opp.suggestedProductIds.forEach(productId => {
          if (!selectedProductIds.includes(productId)) {
            complementary.push({
              productId,
              price: 29.99 // Would fetch actual price
            });
          }
        });
      }
    }
    
    return complementary;
  }
  
  private findAlternativeBundles(
    selectedItems: Array<{ productId: string; quantity: number; price: number; category?: string }>
  ): Bundle[] {
    const selectedProductIds = selectedItems.map(i => i.productId);
    const cartTotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Find bundles that contain at least one selected item
    const relevantBundles = this.getAllBundles().filter(bundle => 
      bundle.items.some(item => 
        selectedProductIds.includes(item.productId) || 
        (item.options?.some(opt => selectedProductIds.includes(opt.id)))
      )
    );
    
    // Sort by relevance and value
    return relevantBundles.sort((a, b) => {
      const aRelevance = this.calculateBundleRelevance(a, selectedItems, cartTotal);
      const bRelevance = this.calculateBundleRelevance(b, selectedItems, cartTotal);
      return bRelevance - aRelevance;
    }).slice(0, 3);
  }
  
  private calculateBundleRelevance(
    bundle: Bundle,
    selectedItems: Array<{ productId: string; quantity: number; price: number; category?: string }>,
    cartTotal: number
  ): number {
    let relevance = 0;
    
    // Check if bundle overlaps with cart items
    const selectedProductIds = selectedItems.map(i => i.productId);
    const overlap = bundle.items.filter(item => 
      selectedProductIds.includes(item.productId)
    ).length;
    
    relevance += overlap * 20;
    
    // Check if bundle adds value (new items)
    const newItems = bundle.items.filter(item => 
      !selectedProductIds.includes(item.productId)
    ).length;
    
    relevance += newItems * 10;
    
    // Bonus for good savings
    relevance += bundle.savingsPercent * 0.5;
    
    // Bonus if bundle price is close to cart total
    if (bundle.bundlePrice > cartTotal) {
      relevance += 10;
    }
    
    return relevance;
  }
  
  private generateDynamicBundleRecommendation(
    dynamicBundle: Bundle,
    alternatives: Bundle[],
    cartTotal: number
  ): string {
    if (alternatives.length === 0) {
      return `Save ${dynamicBundle.savingsPercent}% with your custom bundle!`;
    }
    
    const bestAlternative = alternatives[0];
    if (bestAlternative.bundlePrice < dynamicBundle.bundlePrice) {
      return `Save even more with the ${bestAlternative.name} (${bestAlternative.savingsPercent}% off)!`;
    }
    
    return `Your custom bundle saves you ${dynamicBundle.savingsAmount.toFixed(2)}!`;
  }
  
  // =====================================================
  // RECOMMENDATION ENGINE
  // =====================================================
  
  getRecommendations(
    cart: Cart,
    userContext?: {
      userId?: string;
      isReturning?: boolean;
      visitCount?: number;
      customerTier?: string;
      viewedProducts?: string[];
      viewedCategories?: string[];
      timeOnSite?: number;
    }
  ): BundleRecommendation[] {
    const recommendations: BundleRecommendation[] = [];
    const cartProductIds = cart.items.map(i => i.productId);
    const cartCategories = [...new Set(cart.items.map(i => i.category))];
    
    // Score all active bundles
    const scoredBundles = this.getAllBundles().map(bundle => {
      const score = this.calculateRecommendationScore(bundle, cart, userContext);
      const uplift = this.calculateUplift(bundle, cart);
      
      return {
        bundle,
        score,
        uplift,
        reason: this.generateRecommendationReason(bundle, cart, userContext)
      };
    });
    
    // Sort by score and take top recommendations
    const topRecommendations = scoredBundles
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    
    // Convert to recommendations
    for (const { bundle, score, uplift, reason } of topRecommendations) {
      const expectedSavings = this.calculateExpectedSavings(bundle, cart);
      recommendations.push({
        bundle,
        score,
        reason,
        expectedSavings,
        upliftPotential: uplift,
        triggerType: this.determineTriggerType(bundle, cart, userContext)
      });
    }
    
    return recommendations;
  }
  
  private calculateRecommendationScore(
    bundle: Bundle,
    cart: Cart,
    userContext?: {
      isReturning?: boolean;
      visitCount?: number;
      customerTier?: string;
    }
  ): number {
    let score = 0;
    
    // Base score from bundle quality
    score += bundle.conversionRate * 100;
    score += bundle.customerSatisfaction * 10;
    
    // Bonus for savings
    score += bundle.savingsPercent * 0.5;
    
    // Bonus for popularity
    if (bundle.popular) score += 20;
    if (bundle.bestValue) score += 15;
    
    // Bonus for urgency
    if (bundle.urgencyType) score += 10;
    
    // Check if bundle contains cart items
    const cartProductIds = cart.items.map(i => i.productId);
    const overlap = bundle.items.filter(item => 
      cartProductIds.includes(item.productId)
    ).length;
    
    if (overlap > 0) {
      score += overlap * 15;
    }
    
    // Check category match
    const cartCategories = [...new Set(cart.items.map(i => i.category))];
    if (bundle.applicableCategories?.some(cat => cartCategories.includes(cat))) {
      score += 20;
    }
    
    // Customer tier bonus
    if (userContext?.customerTier && bundle.targetAudience) {
      if (bundle.targetAudience === userContext.customerTier || bundle.targetAudience === 'all') {
        score += 25;
      }
    }
    
    // Returning visitor bonus
    if (userContext?.isReturning) {
      score += 10;
    }
    
    return Math.min(score, 100); // Cap at 100
  }
  
  private calculateUplift(bundle: Bundle, cart: Cart): number {
    // Estimate AOV increase from bundle vs standalone
    const bundleValue = bundle.bundlePrice;
    const cartValue = cart.total;
    
    if (cartValue === 0) return 0;
    
    const uplift = ((bundleValue - cartValue) / cartValue) * 100;
    return Math.max(0, uplift);
  }
  
  private calculateExpectedSavings(bundle: Bundle, cart: Cart): number {
    const cartProductIds = cart.items.map(i => i.productId);
    const cartTotal = cart.total;
    
    // Calculate how much customer would save vs buying items separately
    const bundleItemTotal = bundle.items.reduce((sum, item) => {
      if (cartProductIds.includes(item.productId)) {
        return sum + (item.originalPrice * item.quantity);
      }
      return sum;
    }, 0);
    
    // Savings from items they already have + discount on new items
    const standaloneValue = cartTotal + bundle.items
      .filter(item => !cartProductIds.includes(item.productId))
      .reduce((sum, item) => sum + (item.originalPrice * item.quantity), 0);
    
    return Math.max(0, standaloneValue - bundle.bundlePrice);
  }
  
  private generateRecommendationReason(
    bundle: Bundle,
    cart: Cart,
    userContext?: {
      isReturning?: boolean;
      visitCount?: number;
    }
  ): string {
    const cartProductIds = cart.items.map(i => i.productId);
    const overlap = bundle.items.filter(item => 
      cartProductIds.includes(item.productId)
    ).length;
    
    if (overlap > 0 && overlap === bundle.items.length) {
      return `Save ${bundle.savingsPercent}% on everything in your cart!`;
    }
    
    if (overlap > 0) {
      const newItems = bundle.items.length - overlap;
      return `Add ${newItems} item${newItems > 1 ? 's' : ''} and save ${bundle.savingsPercent}% on your entire bundle!`;
    }
    
    if (bundle.urgencyType === 'limited_time') {
      return `${bundle.savingsPercent}% off - Limited time offer!`;
    }
    
    if (bundle.popular) {
      return `Most popular choice - ${bundle.savingsPercent}% savings!`;
    }
    
    return `Bundle and save ${bundle.savingsPercent}% on your order!`;
  }
  
  private determineTriggerType(
    bundle: Bundle,
    cart: Cart,
    userContext?: {
      viewedProducts?: string[];
      viewedCategories?: string[];
      timeOnSite?: number;
    }
  ): BundleRecommendation['triggerType'] {
    const cartProductIds = cart.items.map(i => i.productId);
    const hasOverlap = bundle.items.some(item => cartProductIds.includes(item.productId));
    
    if (hasOverlap) return 'cart_based';
    
    if (userContext?.viewedProducts?.length || userContext?.viewedCategories?.length) {
      return 'browse_based';
    }
    
    if (userContext?.timeOnSite && userContext.timeOnSite > 60) {
      return 'time_based';
    }
    
    return 'personalized';
  }
  
  // =====================================================
  // UPSELL TRIGGERS
  // =====================================================
  
  evaluateUpsellTriggers(cart: Cart, context?: {
    viewedProducts?: string[];
    viewedCategories?: string[];
    timeOnSite?: number;
    visitCount?: number;
    cartAbandoned?: boolean;
  }): Array<{ trigger: UpsellTrigger; bundle: Bundle }> {
    const matches: Array<{ trigger: UpsellTrigger; bundle: Bundle }> = [];
    
    for (const trigger of this.upsellTriggers.values()) {
      if (this.evaluateTrigger(trigger, cart, context)) {
        const bundle = this.bundles.get(trigger.bundleId);
        if (bundle && bundle.isActive) {
          matches.push({ trigger, bundle });
        }
      }
    }
    
    // Sort by priority
    return matches.sort((a, b) => a.trigger.priority - b.trigger.priority);
  }
  
  private evaluateTrigger(
    trigger: UpsellTrigger,
    cart: Cart,
    context?: {
      viewedProducts?: string[];
      viewedCategories?: string[];
      timeOnSite?: number;
      visitCount?: number;
      cartAbandoned?: boolean;
    }
  ): boolean {
    switch (trigger.type) {
      case 'cart_value':
        if (trigger.conditions.minCartValue && cart.subtotal < trigger.conditions.minCartValue) {
          return false;
        }
        if (trigger.conditions.maxCartValue && cart.subtotal > trigger.conditions.maxCartValue) {
          return false;
        }
        return true;
        
      case 'product_view':
        if (!context?.viewedProducts?.length) return false;
        return trigger.conditions.viewedProducts?.some(p => 
          context.viewedProducts?.includes(p)
        ) || false;
        
      case 'category_browse':
        if (!context?.viewedCategories?.length) return false;
        return trigger.conditions.viewedCategories?.some(c => 
          context.viewedCategories?.includes(c)
        ) || false;
        
      case 'time_on_site':
        if (!context?.timeOnSite) return false;
        return context.timeOnSite >= (trigger.conditions.minTimeSeconds || 0);
        
      case 'return_visit':
        return (context?.visitCount || 0) >= (trigger.conditions.visitCount || 1);
        
      case 'cart_abandonment':
        return context?.cartAbandoned === true;
        
      default:
        return false;
    }
  }
  
  // =====================================================
  // CROSS-SELL ENGINE
  // =====================================================
  
  getCrossSellOpportunities(cart: Cart): Array<{
    opportunity: CrossSellOpportunity;
    suggestedProducts: Array<{ id: string; name: string; price: number }>;
    discount?: number;
  }> {
    const opportunities: Array<{
      opportunity: CrossSellOpportunity;
      suggestedProducts: Array<{ id: string; name: string; price: number }>;
      discount?: number;
    }> = [];
    
    const cartProductIds = cart.items.map(i => i.productId);
    
    for (const opp of this.crossSellOpportunities.values()) {
      if (cartProductIds.includes(opp.primaryProductId)) {
        const suggestedProducts = opp.suggestedProductIds.map(id => ({
          id,
          name: id,
          price: 29.99 // Would fetch actual price
        }));
        
        opportunities.push({
          opportunity: opp,
          suggestedProducts,
          discount: opp.discount?.value
        });
      }
    }
    
    // Sort by priority
    return opportunities.sort((a, b) => a.opportunity.priority - b.opportunity.priority);
  }
  
  // =====================================================
  // CART-BASED BUNDLE SUGGESTIONS
  // =====================================================
  
  getCartBundleSuggestions(cart: Cart): Array<{
    type: 'upgrade' | 'complementary' | 'volume' | 'alternative';
    bundle: Bundle;
    savings: number;
    message: string;
  }> {
    const suggestions: Array<{
      type: 'upgrade' | 'complementary' | 'volume' | 'alternative';
      bundle: Bundle;
      savings: number;
      message: string;
    }> = [];
    
    const cartProductIds = cart.items.map(i => i.productId);
    const cartCategories = [...new Set(cart.items.map(i => i.category))];
    const cartTotal = cart.total;
    const totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    
    // Check for upgrade opportunities
    const upgradeBundles = this.getBundlesByType('upsell').filter(bundle => {
      return bundle.items.some(item => cartProductIds.includes(item.productId));
    });
    
    for (const bundle of upgradeBundles) {
      const savings = this.calculateExpectedSavings(bundle, cart);
      suggestions.push({
        type: 'upgrade',
        bundle,
        savings,
        message: `Upgrade to ${bundle.name} and save ${savings.toFixed(2)}!`
      });
    }
    
    // Check for complementary bundles
    const complementaryBundles = this.getBundlesByType('complementary').filter(bundle => {
      return bundle.applicableCategories?.some(cat => cartCategories.includes(cat));
    });
    
    for (const bundle of complementaryBundles) {
      const savings = this.calculateExpectedSavings(bundle, cart);
      if (savings > 0) {
        suggestions.push({
          type: 'complementary',
          bundle,
          savings,
          message: `Complete your order with ${bundle.name} - save ${bundle.savingsPercent}%!`
        });
      }
    }
    
    // Check for volume discounts
    if (totalQuantity >= 2) {
      const volumeBundles = this.getBundlesByType('volume');
      for (const bundle of volumeBundles.slice(0, 2)) {
        const savings = this.calculateExpectedSavings(bundle, cart);
        suggestions.push({
          type: 'volume',
          bundle,
          savings,
          message: `Buy more with ${bundle.name} and save ${bundle.savingsPercent}%!`
        });
      }
    }
    
    // Find alternative bundles (pre-made bundles that include cart items)
    const alternativeBundles = this.findAlternativeBundles(
      cart.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        category: item.category
      }))
    );
    
    for (const bundle of alternativeBundles.slice(0, 2)) {
      const existingItems = bundle.items.filter(item => 
        cartProductIds.includes(item.productId)
      );
      
      if (existingItems.length > 0) {
        const newItems = bundle.items.length - existingItems.length;
        suggestions.push({
          type: 'alternative',
          bundle,
          savings: bundle.savingsAmount,
          message: `Add ${newItems} item${newItems > 1 ? 's' : ''} with ${bundle.name} and save ${bundle.savingsPercent}%!`
        });
      }
    }
    
    // Sort by savings
    return suggestions.sort((a, b) => b.savings - a.savings);
  }
  
  // =====================================================
  // CHECKOUT OPTIMIZATION
  // =====================================================
  
  optimizeCheckout(cart: Cart, context?: {
    customerTier?: string;
    isNewCustomer?: boolean;
  }): {
    optimizedCart: Cart;
    bundleOffers: Array<{ bundle: Bundle; savings: number; message: string }>;
    discountApplied: number;
    savings: number;
  } {
    // Get bundle suggestions
    const bundleOffers = this.getCartBundleSuggestions(cart);
    
    // Apply discount rules
    const { totalDiscount, appliedDiscounts } = this.applyDiscountRules(
      cart, 
      context?.customerTier
    );
    
    // Calculate total savings
    const bundleSavings = bundleOffers.reduce((sum, offer) => sum + offer.savings, 0);
    const totalSavings = totalDiscount + bundleSavings;
    
    return {
      optimizedCart: {
        ...cart,
        discount: totalDiscount,
        total: cart.subtotal - totalDiscount
      },
      bundleOffers: bundleOffers.slice(0, 3),
      discountApplied: totalDiscount,
      savings: totalSavings
    };
  }
  
  // =====================================================
  // BUNDLE RULES ENGINE
  // =====================================================
  
  evaluateBundleRules(context: {
    cart: Cart;
    customer?: { id: string; tier: string; isNew: boolean };
    time?: Date;
    location?: { country: string; region?: string };
  }): Array<{ rule: BundleRule; action: string; bundleId?: string }> {
    const triggeredRules: Array<{ rule: BundleRule; action: string; bundleId?: string }> = [];
    
    for (const rule of this.bundleRules.values()) {
      if (!rule.active) continue;
      
      if (this.evaluateBundleRuleConditions(rule.conditions, context)) {
        for (const action of rule.actions) {
          triggeredRules.push({
            rule,
            action: action.type,
            bundleId: action.bundleId
          });
        }
      }
    }
    
    return triggeredRules;
  }
  
  private evaluateBundleRuleConditions(
    conditions: BundleRule['conditions'],
    context: {
      cart: Cart;
      customer?: { id: string; tier: string; isNew: boolean };
      time?: Date;
      location?: { country: string; region?: string };
    }
  ): boolean {
    for (const condition of conditions) {
      switch (condition.type) {
        case 'cart_value':
          if (condition.operator === 'greater_than' && context.cart.subtotal <= (condition.value as number)) {
            return false;
          }
          if (condition.operator === 'less_than' && context.cart.subtotal >= (condition.value as number)) {
            return false;
          }
          if (condition.operator === 'between') {
            const [min, max] = condition.value as [number, number];
            if (context.cart.subtotal < min || context.cart.subtotal > max) {
              return false;
            }
          }
          break;
          
        case 'item_count':
          const itemCount = context.cart.items.length;
          if (condition.operator === 'between') {
            const [min, max] = condition.value as [number, number];
            if (itemCount < min || itemCount > max) {
              return false;
            }
          }
          break;
          
        case 'customer':
          if (!context.customer) return false;
          if (condition.operator === 'equals' && context.customer.tier !== condition.value) {
            return false;
          }
          if (condition.operator === 'not_equals' && context.customer.tier === condition.value) {
            return false;
          }
          break;
          
        default:
          break;
      }
    }
    
    return true;
  }
  
  // =====================================================
  // ANALYTICS
  // =====================================================
  
  trackBundleView(bundleId: string): void {
    const bundle = this.bundles.get(bundleId);
    if (bundle) {
      bundle.viewCount++;
      
      // Log for analytics
      const views = this.viewLog.get(bundleId) || [];
      views.push(new Date());
      this.viewLog.set(bundleId, views);
    }
  }
  
  trackBundleConversion(bundleId: string, revenue: number): void {
    const bundle = this.bundles.get(bundleId);
    if (bundle) {
      bundle.currentPurchases++;
      bundle.revenue += revenue;
      bundle.averageOrderValue = bundle.revenue / bundle.currentPurchases;
      
      // Calculate conversion rate
      if (bundle.viewCount > 0) {
        bundle.conversionRate = bundle.currentPurchases / bundle.viewCount;
      }
      
      // Log conversion
      const conversions = this.conversionLog.get(bundleId) || [];
      conversions.push({ timestamp: new Date(), revenue, bundleId });
      this.conversionLog.set(bundleId, conversions);
    }
  }
  
  getBundleAnalytics(bundleId: string, period?: 'day' | 'week' | 'month'): BundleAnalytics {
    const bundle = this.bundles.get(bundleId);
    if (!bundle) {
      throw new Error(`Bundle ${bundleId} not found`);
    }
    
    // Calculate time-based metrics
    const now = new Date();
    let periodStart: Date;
    switch (period) {
      case 'day':
        periodStart = new Date(now.setDate(now.getDate() - 1));
        break;
      case 'week':
        periodStart = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        periodStart = new Date(now.setDate(now.getDate() - 30));
        break;
      default:
        periodStart = new Date(bundle.createdAt);
    }
    
    // Get views and conversions for period
    const views = this.viewLog.get(bundleId) || [];
    const periodViews = views.filter(v => v >= periodStart).length;
    const conversions = this.conversionLog.get(bundleId) || [];
    const periodConversions = conversions.filter(c => c.timestamp >= periodStart);
    const periodRevenue = periodConversions.reduce((sum, c) => sum + c.revenue, 0);
    
    return {
      bundleId,
      period: period || 'all',
      views: bundle.viewCount,
      impressions: periodViews,
      clicks: Math.floor(periodViews * 0.3),
      addToCarts: Math.floor(periodViews * 0.1),
      purchases: bundle.currentPurchases,
      conversionRate: bundle.conversionRate,
      revenue: bundle.revenue,
      averageOrderValue: bundle.averageOrderValue,
      itemsPerBundle: bundle.items.length,
      popularItems: bundle.items.map(item => ({
        itemId: item.id,
        name: item.name,
        selectionRate: 1 / bundle.items.length
      })),
      customerSegments: [
        { segment: 'new', count: Math.floor(bundle.currentPurchases * 0.4), revenue: bundle.revenue * 0.35 },
        { segment: 'returning', count: Math.floor(bundle.currentPurchases * 0.5), revenue: bundle.revenue * 0.55 },
