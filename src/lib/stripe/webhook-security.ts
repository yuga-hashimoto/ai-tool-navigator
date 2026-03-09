import Stripe from 'stripe';

export interface WebhookSecurityConfig {
  signingSecret: string;
  timestampToleranceSeconds?: number;
  enableReplayPrevention?: boolean;
  enableAuditLog?: boolean;
}

export interface WebhookVerificationResult {
  success: boolean;
  event?: Stripe.Event;
  error?: string;
  errorCode?: 'MISSING_SIGNATURE' | 'INVALID_SIGNATURE' | 'TIMESTAMP_EXPIRED' | 'REPLAY_DETECTED' | 'EMPTY_BODY' | 'UNKNOWN_ERROR';
}

export interface WebhookAuditEntry {
  timestamp: string;
  eventId: string;
  eventType: string;
  verified: boolean;
  errorCode?: string;
  errorMessage?: string;
  ipAddress?: string;
  livemode: boolean;
}

class ReplayPreventionStore {
  private processedEvents: Map<string, number> = new Map();
  private readonly maxEntries: number;
  private readonly ttlMs: number;

  constructor(maxEntries = 10000, ttlMs = 24 * 60 * 60 * 1000) {
    this.maxEntries = maxEntries;
    this.ttlMs = ttlMs;
  }

  hasBeenProcessed(eventId: string): boolean {
    const ts = this.processedEvents.get(eventId);
    if (!ts) return false;
    if (Date.now() - ts > this.ttlMs) { this.processedEvents.delete(eventId); return false; }
    return true;
  }

  markAsProcessed(eventId: string): void {
    if (this.processedEvents.size >= this.maxEntries) this.cleanup();
    this.processedEvents.set(eventId, Date.now());
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [id, ts] of this.processedEvents.entries()) {
      if (now - ts > this.ttlMs) this.processedEvents.delete(id);
    }
    if (this.processedEvents.size >= this.maxEntries) {
      const sorted = [...this.processedEvents.entries()].sort((a, b) => a[1] - b[1]);
      sorted.slice(0, Math.floor(this.maxEntries * 0.2)).forEach(([id]) => this.processedEvents.delete(id));
    }
  }

  get size(): number { return this.processedEvents.size; }
}

const replayStore = new ReplayPreventionStore();

function logWebhookAudit(entry: WebhookAuditEntry): void {
  const logData = { level: entry.verified ? 'info' : 'warn', category: 'stripe_webhook_security', ...entry };
  if (entry.verified) {
    console.log('[Stripe Webhook Audit]', JSON.stringify(logData));
  } else {
    console.warn('[Stripe Webhook Audit] VERIFICATION FAILED', JSON.stringify(logData));
  }
}

export function getWebhookSigningSecret(livemode?: boolean): string {
  if (livemode === true && process.env.STRIPE_WEBHOOK_SECRET_LIVE) return process.env.STRIPE_WEBHOOK_SECRET_LIVE;
  if (livemode === false && process.env.STRIPE_WEBHOOK_SECRET_TEST) return process.env.STRIPE_WEBHOOK_SECRET_TEST;
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error('Missing STRIPE_WEBHOOK_SECRET environment variable.');
  return secret;
}

export async function verifyWebhookSignature(
  rawBody: string | Buffer,
  signature: string | null,
  config: WebhookSecurityConfig,
  ipAddress?: string
): Promise<WebhookVerificationResult> {
  const { signingSecret, timestampToleranceSeconds = 300, enableReplayPrevention = true, enableAuditLog = true } = config;

  if (!rawBody || (typeof rawBody === 'string' && rawBody.length === 0)) {
    if (enableAuditLog) logWebhookAudit({ timestamp: new Date().toISOString(), eventId: 'unknown', eventType: 'unknown', verified: false, errorCode: 'EMPTY_BODY', errorMessage: 'Empty request body', ipAddress, livemode: false });
    return { success: false, error: 'Empty request body', errorCode: 'EMPTY_BODY' };
  }

  if (!signature) {
    if (enableAuditLog) logWebhookAudit({ timestamp: new Date().toISOString(), eventId: 'unknown', eventType: 'unknown', verified: false, errorCode: 'MISSING_SIGNATURE', errorMessage: 'Missing Stripe-Signature header', ipAddress, livemode: false });
    return { success: false, error: 'Missing Stripe-Signature header', errorCode: 'MISSING_SIGNATURE' };
  }

  let event: Stripe.Event;
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16', typescript: true });
    event = stripe.webhooks.constructEvent(rawBody, signature, signingSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    const code = msg.toLowerCase().includes('timestamp') ? 'TIMESTAMP_EXPIRED' : 'INVALID_SIGNATURE';
    if (enableAuditLog) logWebhookAudit({ timestamp: new Date().toISOString(), eventId: 'unknown', eventType: 'unknown', verified: false, errorCode: code, errorMessage: msg, ipAddress, livemode: false });
    return { success: false, error: `Webhook signature verification failed: ${msg}`, errorCode: code };
  }

  if (event.created) {
    const age = Math.floor(Date.now() / 1000) - event.created;
    if (age > timestampToleranceSeconds) {
      if (enableAuditLog) logWebhookAudit({ timestamp: new Date().toISOString(), eventId: event.id, eventType: event.type, verified: false, errorCode: 'TIMESTAMP_EXPIRED', errorMessage: `Event too old: ${age}s`, ipAddress, livemode: event.livemode });
      return { success: false, error: `Webhook event too old: ${age}s exceeds ${timestampToleranceSeconds}s`, errorCode: 'TIMESTAMP_EXPIRED' };
    }
  }

  if (enableReplayPrevention) {
    if (replayStore.hasBeenProcessed(event.id)) {
      if (enableAuditLog) logWebhookAudit({ timestamp: new Date().toISOString(), eventId: event.id, eventType: event.type, verified: false, errorCode: 'REPLAY_DETECTED', errorMessage: `Replay: ${event.id}`, ipAddress, livemode: event.livemode });
      return { success: false, error: `Replay attack detected: event ${event.id} already processed`, errorCode: 'REPLAY_DETECTED' };
    }
    replayStore.markAsProcessed(event.id);
  }

  if (enableAuditLog) logWebhookAudit({ timestamp: new Date().toISOString(), eventId: event.id, eventType: event.type, verified: true, ipAddress, livemode: event.livemode });
  return { success: true, event };
}

export async function verifyWebhookRequest(
  request: Request,
  config?: Partial<WebhookSecurityConfig>
): Promise<WebhookVerificationResult> {
  const rawBody = await request.text();
  const signature = request.headers.get('stripe-signature');
  const signingSecret = config?.signingSecret || getWebhookSigningSecret();
  return verifyWebhookSignature(rawBody, signature, {
    signingSecret,
    timestampToleranceSeconds: config?.timestampToleranceSeconds ?? 300,
    enableReplayPrevention: config?.enableReplayPrevention ?? true,
    enableAuditLog: config?.enableAuditLog ?? true,
  }, request.headers.get('x-forwarded-for') || undefined);
}
