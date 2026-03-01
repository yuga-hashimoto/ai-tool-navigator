/**
 * Abandoned Affiliate Link Recovery System
 * 
 * This module provides functionality to:
 * - Track affiliate link exits and abandonment events
 * - Capture user email before exit (with consent)
 * - Store abandonment data for recovery campaigns
 * - Generate one-click recovery links
 * - Track recovery rates by channel
 */

import { PrismaClient } from '@prisma/client';
import { hashEmail } from '@/lib/security/email-hashing';

// Types for abandoned link tracking
export interface AbandonedLinkData {
  id?: string;
  sessionId: string;
  visitorId?: string;
  visitorEmail?: string;
  affiliateId: string;
  toolSlug: string;
  toolName: string;
  source: string;
  medium: string;
  campaign?: string;
  entryPage: string;
  exitPage: string;
  timeOnPage: number; // seconds
  scrollDepth?: number; // percentage
  clickPosition?: string;
  abandonmentType: AbandonmentType;
  recoveryStatus: RecoveryStatus;
  recoveryChannel?: RecoveryChannel;
  recoveryEmailSentAt?: string;
  recoveryClickedAt?: string;
  recoveryConvertedAt?: string;
  recoveryAttempts: number;
  createdAt: string;
  updatedAt: string;
}

export type AbandonmentType = 
  | 'exit_intent'
  | 'tab_close'
  | 'back_button'
  | 'timeout'
  | 'cart_abandon'
  | 'checkout_abandon'
  | 'trial_end_abandon'
  | 'price_abandon';

export type RecoveryStatus = 
  | 'pending'
  | 'email_sent'
  | 'email_opened'
  | 'link_clicked'
  | 'recovered'
  | 'failed'
  | 'opted_out';

export type RecoveryChannel = 
  | 'email'
  | 'push'
  | 'retargeting'
  | 'sms'
  | 'social';

// Email recovery sequence templates
export interface RecoveryEmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  delayHours: number;
  channel: RecoveryChannel;
}

// Recovery sequence configuration
export interface RecoverySequence {
  id: string;
  name: string;
  toolSlug?: string;
  emails: RecoveryEmailTemplate[];
  maxAttempts: number;
  totalDuration: number; // hours
  status: 'active' | 'paused' | 'draft';
}

// Channel metrics for recovery tracking
export interface RecoveryMetrics {
  channel: RecoveryChannel;
  totalAbandonments: number;
  emailsSent: number;
  emailsOpened: number;
  emailsClicked: number;
  recovered: number;
  recoveryRate: number;
  totalRevenue: number;
  avgTimeToRecover: number; // hours
}

// Prisma client instance
const prisma = new PrismaClient();

// Cookie/localStorage keys
const VISITOR_COOKIE_NAME = 'abandonment_visitor';
const SESSION_COOKIE_NAME = 'abandonment_session';
const CART_COOKIE_NAME = 'abandoned_cart';

/**
 * Get visitor cookie name with locale
 */
export function getVisitorCookieName(locale?: string): string {
  return locale ? `${VISITOR_COOKIE_NAME}_${locale}` : VISITOR_COOKIE_NAME;
}

/**
 * Get session cookie name with locale
 */
export function getSessionCookieName(locale?: string): string {
  return locale ? `${SESSION_COOKIE_NAME}_${locale}` : SESSION_COOKIE_NAME;
}

/**
 * Get cart cookie name with locale
 */
export function getCartCookieName(locale?: string): string {
  return locale ? `${CART_COOKIE_NAME}_${locale}` : CART_COOKIE_NAME;
}

/**
 * Capture visitor email for recovery
 */
export async function captureVisitorEmail(
  sessionId: string,
  email: string,
  visitorId?: string
): Promise<AbandonedLinkData | null> {
  try {
    // Upsert abandonment record with email
    const record = await prisma.$queryRaw<AbandonedLinkData[]>`
      INSERT OR REPLACE INTO abandoned_links (
        session_id, visitor_email, updated_at
      ) VALUES (
        ${sessionId}, ${email}, ${new Date().toISOString()}
      )
    `;

    return record[0] || null;
  } catch (error) {
    console.error('[Abandonment] Error capturing email:', error);
    return null;
  }
}

/**
 * Record an abandonment event
 */
export async function recordAbandonment(
  data: Omit<AbandonedLinkData, 'id' | 'createdAt' | 'updatedAt' | 'recoveryAttempts'>
): Promise<AbandonedLinkData | null> {
  try {
    const now = new Date().toISOString();
    
    const record = await prisma.$queryRaw<AbandonedLinkData[]>`
      INSERT INTO abandoned_links (
        session_id, visitor_id, visitor_email, affiliate_id, tool_slug, 
        tool_name, source, medium, campaign, entry_page, exit_page,
        time_on_page, scroll_depth, click_position, abandonment_type,
        recovery_status, recovery_attempts, created_at, updated_at
      ) VALUES (
        ${data.sessionId}, ${data.visitorId || null}, ${data.visitorEmail || null},
        ${data.affiliateId}, ${data.toolSlug}, ${data.toolName},
        ${data.source}, ${data.medium}, ${data.campaign || null},
        ${data.entryPage}, ${data.exitPage}, ${data.timeOnPage},
        ${data.scrollDepth || null}, ${data.clickPosition || null},
        ${data.abandonmentType}, ${data.recoveryStatus}, 0,
        ${now}, ${now}
      )
      RETURNING *
    `;

    return record[0] || null;
  } catch (error) {
    console.error('[Abandonment] Error recording abandonment:', error);
    return null;
  }
}

/**
 * Update abandonment recovery status
 */
export async function updateRecoveryStatus(
  sessionId: string,
  updates: Partial<Pick<AbandonedLinkData, 
    'recoveryStatus' | 'recoveryChannel' | 'recoveryEmailSentAt' | 
    'recoveryClickedAt' | 'recoveryConvertedAt' | 'recoveryAttempts'>>
): Promise<boolean> {
  try {
    const setClause = Object.entries(updates)
      .map(([key, value]) => {
        const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        return `${snakeKey} = ${typeof value === 'string' ? `'${value}'` : value}`;
      })
      .join(', ');

    await prisma.$queryRaw`
      UPDATE abandoned_links 
      SET ${setClause}, updated_at = ${new Date().toISOString()}
      WHERE session_id = ${sessionId}
    `;

    return true;
  } catch (error) {
    console.error('[Abandonment] Error updating recovery status:', error);
    return false;
  }
}

/**
 * Get abandonment by session ID
 */
export async function getAbandonmentBySession(sessionId: string): Promise<AbandonedLinkData | null> {
  try {
    const records = await prisma.$queryRaw<AbandonedLinkData[]>`
      SELECT * FROM abandoned_links WHERE session_id = ${sessionId} LIMIT 1
    `;

    return records[0] || null;
  } catch (error) {
    console.error('[Abandonment] Error fetching abandonment:', error);
    return null;
  }
}

/**
 * Get pending abandonments for recovery
 */
export async function getPendingAbandonments(
  channel: RecoveryChannel,
  limit: number = 100
): Promise<AbandonedLinkData[]> {
  try {
    const records = await prisma.$queryRaw<AbandonedLinkData[]>`
      SELECT * FROM abandoned_links 
      WHERE recovery_status = 'pending'
        AND visitor_email IS NOT NULL
        AND recovery_channel = ${channel}
        AND recovery_attempts < 5
      ORDER BY created_at ASC
      LIMIT ${limit}
    `;

    return records;
  } catch (error) {
    console.error('[Abandonment] Error fetching pending abandonments:', error);
    return [];
  }
}

/**
 * Generate one-click recovery URL
 */
export function generateRecoveryUrl(
  baseUrl: string,
  sessionId: string,
  affiliateId: string,
  toolSlug: string,
  source: string = 'recovery'
): string {
  try {
    const urlObj = new URL(baseUrl);
    
    // Add recovery parameters
    urlObj.searchParams.set('recover_session', sessionId);
    urlObj.searchParams.set('recover_affiliate', affiliateId);
    urlObj.searchParams.set('recover_tool', toolSlug);
    urlObj.searchParams.set('utm_source', source);
    urlObj.searchParams.set('utm_medium', 'recovery');
    urlObj.searchParams.set('utm_campaign', 'abandonment_recovery');
    
    // Add timestamp for freshness
    urlObj.searchParams.set('recover_ts', Date.now().toString());
    
    return urlObj.toString();
  } catch {
    return baseUrl;
  }
}

/**
 * Process a recovery link click
 */
export async function processRecoveryClick(
  sessionId: string,
  affiliateId: string,
  toolSlug: string
): Promise<{ success: boolean; wasRecovered: boolean; abandonment?: AbandonedLinkData }> {
  try {
    const abandonment = await getAbandonmentBySession(sessionId);
    
    if (!abandonment) {
      return { success: false, wasRecovered: false };
    }

    // Check if already recovered
    if (abandonment.recoveryStatus === 'recovered') {
      return { success: true, wasRecovered: true, abandonment };
    }

    // Update status to link clicked
    await updateRecoveryStatus(sessionId, {
      recoveryStatus: 'link_clicked',
      recoveryClickedAt: new Date().toISOString(),
    });

    // Increment recovery attempts
    await prisma.$queryRaw`
      UPDATE abandoned_links 
      SET recovery_attempts = recovery_attempts + 1,
          updated_at = ${new Date().toISOString()}
      WHERE session_id = ${sessionId}
    `;

    return { 
      success: true, 
      wasRecovered: false, 
      abandonment: { ...abandonment, recoveryStatus: 'link_clicked' } 
    };
  } catch (error) {
    console.error('[Abandonment] Error processing recovery click:', error);
    return { success: false, wasRecovered: false };
  }
}

/**
 * Mark abandonment as recovered
 */
export async function markAsRecovered(sessionId: string): Promise<boolean> {
  try {
    await updateRecoveryStatus(sessionId, {
      recoveryStatus: 'recovered',
      recoveryConvertedAt: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    console.error('[Abandonment] Error marking as recovered:', error);
    return false;
  }
}

/**
 * Get recovery metrics by channel
 */
export async function getRecoveryMetrics(
  startDate?: string,
  endDate?: string
): Promise<RecoveryMetrics[]> {
  try {
    const dateFilter = startDate && endDate 
      ? `WHERE created_at BETWEEN '${startDate}' AND '${endDate}'`
      : '';

    const records = await prisma.$queryRaw<Array<{
      channel: string;
      total: number;
      sent: number;
      opened: number;
      clicked: number;
      recovered: number;
      revenue: number;
    }>>`
      SELECT 
        COALESCE(recovery_channel, 'email') as channel,
        COUNT(*) as total,
        SUM(CASE WHEN recovery_status IN ('email_sent', 'email_opened', 'link_clicked', 'recovered') THEN 1 ELSE 0 END) as sent,
        SUM(CASE WHEN recovery_status IN ('email_opened', 'link_clicked', 'recovered') THEN 1 ELSE 0 END) as opened,
        SUM(CASE WHEN recovery_status IN ('link_clicked', 'recovered') THEN 1 ELSE 0 END) as clicked,
        SUM(CASE WHEN recovery_status = 'recovered' THEN 1 ELSE 0 END) as recovered,
        SUM(CASE WHEN recovery_status = 'recovered' THEN total_value ELSE 0 END) as revenue
      FROM abandoned_links
      ${dateFilter}
      GROUP BY recovery_channel
    `;

    return records.map(r => ({
      channel: r.channel as RecoveryChannel,
      totalAbandonments: r.total,
      emailsSent: r.sent,
      emailsOpened: r.opened,
      emailsClicked: r.clicked,
      recovered: r.recovered,
      recoveryRate: r.total > 0 ? (r.recovered / r.total) * 100 : 0,
      totalRevenue: r.revenue,
      avgTimeToRecover: 0, // Would need additional tracking
    }));
  } catch (error) {
    console.error('[Abandonment] Error getting metrics:', error);
    return [];
  }
}

/**
 * Get overall recovery statistics
 */
export async function getRecoveryStats(): Promise<{
  totalAbandonments: number;
  pendingRecovery: number;
  recovered: number;
  recoveryRate: number;
  revenueRecovered: number;
  topChannels: RecoveryMetrics[];
}> {
  try {
    const total = await prisma.$queryRaw<Array<{ count: number }>>`
      SELECT COUNT(*) as count FROM abandoned_links
    `;

    const recovered = await prisma.$queryRaw<Array<{ count: number; revenue: number }>>`
      SELECT COUNT(*) as count, COALESCE(SUM(total_value), 0) as revenue 
      FROM abandoned_links WHERE recovery_status = 'recovered'
    `;

    const pending = await prisma.$queryRaw<Array<{ count: number }>>`
      SELECT COUNT(*) as count FROM abandoned_links 
      WHERE recovery_status IN ('pending', 'email_sent', 'email_opened', 'link_clicked')
    `;

    const topChannels = await getRecoveryMetrics();

    return {
      totalAbandonments: total[0]?.count || 0,
      pendingRecovery: pending[0]?.count || 0,
      recovered: recovered[0]?.count || 0,
      recoveryRate: total[0]?.count > 0 
        ? (recovered[0]?.count / total[0]?.count) * 100 
        : 0,
      revenueRecovered: recovered[0]?.revenue || 0,
      topChannels,
    };
  } catch (error) {
    console.error('[Abandonment] Error getting stats:', error);
    return {
      totalAbandonments: 0,
      pendingRecovery: 0,
      recovered: 0,
      recoveryRate: 0,
      revenueRecovered: 0,
      topChannels: [],
    };
  }
}

// =====================================================
// EMAIL RECOVERY SEQUENCES
// =====================================================

/**
 * Default recovery email templates
 */
export const defaultRecoveryTemplates: RecoveryEmailTemplate[] = [
  {
    id: 'recovery_1_1h',
    name: 'First Reminder - 1 Hour',
    subject: '⏰ You left this {tool_name} behind!',
    body: `
      <h2>Hey {visitor_name},</h2>
      <p>We noticed you were checking out <strong>{tool_name}</strong> but didn't complete your signup.</p>
      <p>Here's a special recovery link just for you:</p>
      <p><a href="{recovery_link}" style="background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Complete Your Signup →</a></p>
      <p>This link will skip the wait and get you started immediately.</p>
      <p>Best,<br>The Team</p>
    `,
    delayHours: 1,
    channel: 'email',
  },
  {
    id: 'recovery_2_24h',
    name: 'Second Reminder - 24 Hours',
    subject: '😢 Still thinking about {tool_name}?',
    body: `
      <h2>Hi {visitor_name},</h2>
      <p>Just checking in — we saved your spot for <strong>{tool_name}</strong>.</p>
      <p>Your exclusive offer is still available:</p>
      <p><a href="{recovery_link}" style="background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Get Started Now →</a></p>
      <p>Questions? Just reply to this email.</p>
      <p>Best,<br>The Team</p>
    `,
    delayHours: 24,
    channel: 'email',
  },
  {
    id: 'recovery_3_72h',
    name: 'Final Reminder - 72 Hours',
    subject: '📊 Last chance: Your {tool_name} access',
    body: `
      <h2>Hey {visitor_name},</h2>
      <p>This is your final reminder about <strong>{tool_name}</strong>.</p>
      <p>Your recovery link expires soon, but we're extending a special bonus:</p>
      <ul>
        <li>✓ Instant access</li>
        <li>✓ Priority support</li>
        <li>✓ {bonus_value} bonus included</li>
      </ul>
      <p><a href="{recovery_link}" style="background: #cc0000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Claim Your Access →</a></p>
      <p>See you on the other side!</p>
      <p>Best,<br>The Team</p>
    `,
    delayHours: 72,
    channel: 'email',
  },
];

/**
 * Cart abandonment specific templates
 */
export const cartRecoveryTemplates: RecoveryEmailTemplate[] = [
  {
    id: 'cart_1_1h',
    name: 'Cart Reminder - 1 Hour',
    subject: '🛒 You left items in your cart!',
    body: `
      <h2>Hi {visitor_name},</h2>
      <p>You added <strong>{cart_items}</strong> to your cart but didn't complete checkout.</p>
      <p>Your cart is saved and ready:</p>
      <p><a href="{recovery_link}" style="background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Complete Checkout →</a></p>
      <p>Having trouble? Reply to this email and we'll help.</p>
      <p>Best,<br>The Team</p>
    `,
    delayHours: 1,
    channel: 'email',
  },
  {
    id: 'cart_2_24h',
    name: 'Cart Urgency - 24 Hours',
    subject: '⏳ Your cart will expire soon: {cart_items}',
    body: `
      <h2>Hey {visitor_name},</h2>
      <p>Just a heads up — items in your cart are selling fast!</p>
      <p>Complete your purchase before they run out:</p>
      <p><a href="{recovery_link}" style="background: #cc6600; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Complete Purchase →</a></p>
      <p>Best,<br>The Team</p>
    `,
    delayHours: 24,
    channel: 'email',
  },
  {
    id: 'cart_3_48h',
    name: 'Cart Final - 48 Hours',
    subject: '😢 Your cart was cleared... or was it?',
    body: `
      <h2>Hi {visitor_name},</h2>
      <p>We noticed you didn't complete your purchase for <strong>{cart_items}</strong>.</p>
      <p>As a thank you for considering us, here's a special discount code:</p>
      <p style="font-size: 24px; background: #f0f0f0; padding: 10px; text-align: center;">{discount_code}</p>
      <p><a href="{recovery_link}" style="background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Apply & Complete →</a></p>
      <p>Best,<br>The Team</p>
    `,
    delayHours: 48,
    channel: 'email',
  },
];

/**
 * Process and send recovery emails (would integrate with email provider)
 */
export async function processRecoveryEmails(
  channel: RecoveryChannel = 'email',
  batchSize: number = 100
): Promise<{ sent: number; failed: number }> {
  try {
    const pending = await getPendingAbandonments(channel, batchSize);
    
    let sent = 0;
    let failed = 0;

    for (const abandonment of pending) {
      try {
        // Generate recovery link
        const recoveryLink = generateRecoveryUrl(
          `https://${process.env.NEXT_PUBLIC_DOMAIN}/tools/${abandonment.toolSlug}`,
          abandonment.sessionId,
          abandonment.affiliateId,
          abandonment.toolSlug
        );

        // TODO: Integrate with actual email provider (SendGrid, Resend, etc.)
        // await sendEmail({
        //   to: abandonment.visitorEmail!,
        //   subject: template.subject,
        //   html: interpolateTemplate(template.body, {
        //     visitor_name: abandonment.visitorEmail?.split('@')[0] || 'Friend',
        //     tool_name: abandonment.toolName,
        //     recovery_link: recoveryLink,
        //   }),
        // });

        // Update status
        await updateRecoveryStatus(abandonment.sessionId, {
          recoveryStatus: 'email_sent',
          recoveryChannel: channel,
          recoveryEmailSentAt: new Date().toISOString(),
          recoveryAttempts: abandonment.recoveryAttempts + 1,
        });

        sent++;
      } catch (error) {
        console.error(`[Abandonment] Failed to send email for ${abandonment.sessionId}:`, error);
        failed++;
      }
    }

    return { sent, failed };
  } catch (error) {
    console.error('[Abandonment] Error processing recovery emails:', error);
    return { sent: 0, failed: 0 };
  }
}

/**
 * Interpolate template variables
 */
function interpolateTemplate(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;
  
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{${key}}`, 'g'), value);
  }
  
  return result;
}

// =====================================================
// CART ABANDONMENT
// =====================================================

/**
 * Cart abandonment data
 */
export interface AbandonedCart {
  sessionId: string;
  visitorId?: string;
  visitorEmail?: string;
  items: CartItem[];
  totalValue: number;
  currency: string;
  affiliateId?: string;
  source: string;
  recoveryStatus: RecoveryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  toolSlug: string;
  toolName: string;
  price: number;
  quantity: number;
  discount?: number;
}

/**
 * Store abandoned cart
 */
export async function storeAbandonedCart(
  sessionId: string,
  items: CartItem[],
  visitorEmail?: string,
  affiliateId?: string,
  source: string = 'direct'
): Promise<AbandonedCart | null> {
  try {
    const totalValue = items.reduce((sum, item) => {
      const itemTotal = item.price * item.quantity;
      return sum + (item.discount ? itemTotal - item.discount : itemTotal);
    }, 0);

    const now = new Date().toISOString();

    const record = await prisma.$queryRaw<AbandonedCart[]>`
      INSERT OR REPLACE INTO abandoned_carts (
        session_id, visitor_id, visitor_email, items, total_value,
        currency, affiliate_id, source, recovery_status, created_at, updated_at
      ) VALUES (
        ${sessionId}, ${visitorEmail ? `visitor_${hashEmail(visitorEmail)}` : null},
        ${visitorEmail || null}, ${JSON.stringify(items)},
        ${totalValue}, 'USD', ${affiliateId || null}, ${source},
        'pending', ${now}, ${now}
      )
      RETURNING *
    `;

    return record[0] || null;
  } catch (error) {
    console.error('[Abandonment] Error storing cart:', error);
    return null;
  }
}

/**
 * Get abandoned cart
 */
export async function getAbandonedCart(sessionId: string): Promise<AbandonedCart | null> {
  try {
    const records = await prisma.$queryRaw<AbandonedCart[]>`
      SELECT * FROM abandoned_carts WHERE session_id = ${sessionId} LIMIT 1
    `;

    if (records[0]?.items) {
      records[0].items = JSON.parse(records[0].items as unknown as string);
    }

    return records[0] || null;
  } catch (error) {
    console.error('[Abandonment] Error fetching cart:', error);
    return null;
  }
}

/**
 * Generate cart recovery URL
 */
export function generateCartRecoveryUrl(
  sessionId: string,
  cartItems: CartItem[]
): string {
  const baseUrl = `https://${process.env.NEXT_PUBLIC_DOMAIN}/checkout`;
  const urlObj = new URL(baseUrl);
  
  urlObj.searchParams.set('recover_cart', sessionId);
  urlObj.searchParams.set('recover_ts', Date.now().toString());
  
  // Add cart item references
  const itemIds = cartItems.map(item => item.toolSlug).join(',');
  urlObj.searchParams.set('cart_items', itemIds);
  
  return urlObj.toString();
}

/**
 * Create default database tables for abandonment tracking
 */
export async function createAbandonmentTables(): Promise<void> {
  // Create abandoned_links table
  await prisma.$queryRaw`
    CREATE TABLE IF NOT EXISTS abandoned_links (
      id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
      session_id TEXT UNIQUE NOT NULL,
      visitor_id TEXT,
      visitor_email TEXT,
      affiliate_id TEXT NOT NULL,
      tool_slug TEXT NOT NULL,
      tool_name TEXT NOT NULL,
      source TEXT DEFAULT 'direct',
      medium TEXT DEFAULT 'referral',
      campaign TEXT,
      entry_page TEXT NOT NULL,
      exit_page TEXT NOT NULL,
      time_on_page INTEGER DEFAULT 0,
      scroll_depth INTEGER,
      click_position TEXT,
      abandonment_type TEXT NOT NULL,
      recovery_status TEXT DEFAULT 'pending',
      recovery_channel TEXT,
      recovery_email_sent_at TEXT,
      recovery_clicked_at TEXT,
      recovery_converted_at TEXT,
      recovery_attempts INTEGER DEFAULT 0,
      total_value REAL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `;

  // Create abandoned_carts table
  await prisma.$queryRaw`
    CREATE TABLE IF NOT EXISTS abandoned_carts (
      id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
      session_id TEXT UNIQUE NOT NULL,
      visitor_id TEXT,
      visitor_email TEXT,
      items TEXT NOT NULL,
      total_value REAL NOT NULL,
      currency TEXT DEFAULT 'USD',
      affiliate_id TEXT,
      source TEXT DEFAULT 'direct',
      recovery_status TEXT DEFAULT 'pending',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `;

  // Create indexes
  await prisma.$queryRaw`CREATE INDEX IF NOT EXISTS idx_abandoned_links_session ON abandoned_links(session_id)`;
  await prisma.$queryRaw`CREATE INDEX IF NOT EXISTS idx_abandoned_links_email ON abandoned_links(visitor_email)`;
  await prisma.$queryRaw`CREATE INDEX IF NOT EXISTS idx_abandoned_links_status ON abandoned_links(recovery_status)`;
  await prisma.$queryRaw`CREATE INDEX IF NOT EXISTS idx_abandoned_links_channel ON abandoned_links(recovery_channel)`;
  await prisma.$queryRaw`CREATE INDEX IF NOT EXISTS idx_abandoned_carts_session ON abandoned_carts(session_id)`;
}
