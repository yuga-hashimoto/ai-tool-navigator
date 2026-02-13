// POST /api/subscriptions/webhook
// Stripe webhook endpoint

import { handleStripeWebhook } from '@/lib/subscriptions/webhook-handler';

export async function POST(request: Request) {
  return handleStripeWebhook(request);
}
