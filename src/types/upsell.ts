export interface UpsellTriggerRules {
  minAmount?: number;
  products?: string[]; // Product IDs/Slugs that trigger the upsell
  excludeProducts?: string[]; // Don't show if user bought these
}

export interface UpsellOffer {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  image?: string;
  productId: string; // The product being upsold
  campaignId?: string; // Optional, useful for tracking
}
