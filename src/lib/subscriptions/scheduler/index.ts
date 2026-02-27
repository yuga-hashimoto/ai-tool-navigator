// Subscription Scheduler
// Handles periodic tasks like renewal reminders and analytics

import { 
  getPendingReminders, 
  markReminderSent,
  expireTrials,
  recordDailyAnalytics,
} from './subscription-manager';

// =====================================================
// RENEWAL REMINDER SYSTEM
// =====================================================

interface EmailTemplate {
  subject: string;
  body: string;
  type: ReminderType;
}

type ReminderType = 
  | 'TRIAL_EXPIRING'
  | 'TRIAL_EXPIRED'
  | 'SUBSCRIPTION_EXPIRING'
  | 'SUBSCRIPTION_RENEWED'
  | 'PAYMENT_FAILED'
  | 'WINBACK';

// Email templates for different reminder types
const emailTemplates: Record<ReminderType, EmailTemplate> = {
  TRIAL_EXPIRING: {
    type: 'TRIAL_EXPIRING',
    subject: 'Your free trial ends soon!',
    body: `Hi,

Your free trial is ending in {days} days. Don't lose access to your premium features!

To continue enjoying your subscription, simply add your payment method and your subscription will automatically convert to a paid plan.

[Add Payment Method]

If you have any questions, we're here to help!

Best regards,
The Team`,
  },
  
  TRIAL_EXPIRED: {
    type: 'TRIAL_EXPIRED',
    subject: 'Your free trial has ended',
    body: `Hi,

Your free trial has ended. We hope you enjoyed your premium features!

To continue using our service, you'll need to add a payment method:

[Subscribe Now]

Still not ready to commit? No problem - you can always try again later.

Best regards,
The Team`,
  },
  
  SUBSCRIPTION_EXPIRING: {
    type: 'SUBSCRIPTION_EXPIRING',
    subject: 'Your subscription renewal is coming up',
    body: `Hi,

Just a friendly reminder that your subscription will renew on {renewal_date}.

Your next charge will be {amount}.

If you'd like to make any changes to your subscription, you can do so from your account settings.

[Manage Subscription]

Best regards,
The Team`,
  },
  
  SUBSCRIPTION_RENEWED: {
    type: 'SUBSCRIPTION_RENEWED',
    subject: 'Your subscription has been renewed',
    body: `Hi,

Great news! Your subscription has been successfully renewed.

You now have access to all your premium features until the next billing date.

[View Subscription]

Thank you for your continued support!

Best regards,
The Team`,
  },
  
  PAYMENT_FAILED: {
    type: 'PAYMENT_FAILED',
    subject: 'Payment failed - Action required',
    body: `Hi,

We tried to process your subscription payment but it failed.

Please update your payment method to avoid service interruption:

[Update Payment Method]

If you need any help, our support team is here for you.

Best regards,
The Team`,
  },
  
  WINBACK: {
    type: 'WINBACK',
    subject: 'We miss you! Come back with 20% off',
    body: `Hi,

We noticed you recently canceled your subscription. We'd love to have you back!

As a special offer, get 20% off your next 3 months:

[Claim 20% Off]

Use code: WINBACK20

This offer expires in 7 days.

Best regards,
The Team`,
  },
};

/**
 * Send reminder email (placeholder - integrate with your email service)
 */
async function sendReminderEmail(
  userId: string,
  email: string,
  template: EmailTemplate,
  variables: Record<string, string>
): Promise<boolean> {
  // Replace variables in template
  let subject = template.subject;
  let body = template.body;
  
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    subject = subject.replace(placeholder, value);
    body = body.replace(placeholder, value);
  });
  
  // Here you would integrate with your email service
  // e.g., SendGrid, Resend, AWS SES, etc.
  console.log(`[EMAIL] To: ${email}`);
  console.log(`[EMAIL] Subject: ${subject}`);
  
  // Placeholder: In production, send the actual email
  // await resend.emails.send({ to: email, subject, text: body });
  
  return true;
}

/**
 * Process pending reminders
 */
export async function processReminders() {
  console.log('🔔 Processing renewal reminders...');
  
  try {
    const reminders = await getPendingReminders();
    console.log(`Found ${reminders.length} pending reminders`);
    
    for (const reminder of reminders) {
      try {
        // Get user email from subscription
        const { getUserSubscription } = await import('./subscription-manager');
        const subscription = await getUserSubscription(reminder.userId);
        
        if (!subscription) {
          console.log(`No subscription found for user ${reminder.userId}`);
          continue;
        }
        
        const template = emailTemplates[reminder.reminderType as ReminderType];
        
        if (!template) {
          console.log(`Unknown reminder type: ${reminder.reminderType}`);
          continue;
        }
        
        // Prepare variables
        const variables: Record<string, string> = {
          days: reminder.reminderType === 'TRIAL_EXPIRING' ? '3' : '',
          renewal_date: subscription.currentPeriodEnd 
            ? new Date(subscription.currentPeriodEnd).toLocaleDateString() 
            : '',
          amount: `$${subscription.tier.price}`,
        };
        
        // Send email
        const success = await sendReminderEmail(
          reminder.userId,
          subscription.email,
          template,
          variables
        );
        
        if (success) {
          await markReminderSent(reminder.id);
          console.log(`✅ Sent ${reminder.reminderType} reminder to ${subscription.email}`);
        } else {
          console.log(`❌ Failed to send reminder to ${subscription.email}`);
        }
      } catch (error) {
        console.error(`Error processing reminder ${reminder.id}:`, error);
      }
    }
    
    console.log('✅ Reminder processing complete');
  } catch (error) {
    console.error('❌ Error in reminder processing:', error);
  }
}

// =====================================================
// TRIAL MANAGEMENT
// =====================================================

/**
 * Process expired trials
 */
export async function processExpiredTrials() {
  console.log('⏰ Processing expired trials...');
  
  try {
    const expiredCount = await expireTrials();
    console.log(`✅ Processed ${expiredCount} expired trials`);
  } catch (error) {
    console.error('❌ Error processing expired trials:', error);
  }
}

// =====================================================
// ANALYTICS
// =====================================================

/**
 * Record daily analytics snapshot
 */
export async function recordAnalytics() {
  console.log('📊 Recording daily analytics...');
  
  try {
    const analytics = await recordDailyAnalytics();
    console.log(`✅ Recorded analytics - MRR: $${analytics.mrr}, ARR: $${analytics.arr}`);
  } catch (error) {
    console.error('❌ Error recording analytics:', error);
  }
}

// =====================================================
// SCHEDULER ENTRY POINT
// =====================================================

/**
 * Run all scheduled tasks
 * This would typically be called by a cron job or task scheduler
 */
export async function runScheduledTasks() {
  console.log('🚀 Starting subscription scheduled tasks...');
  const startTime = Date.now();
  
  await Promise.all([
    processReminders(),
    processExpiredTrials(),
    recordAnalytics(),
  ]);
  
  const duration = Date.now() - startTime;
  console.log(`🎉 All tasks completed in ${duration}ms`);
}

// =====================================================
// EXAMPLE CRON EXPRESSIONS
// =====================================================

/*
# Run reminder processing every hour
0 * * * * node -e "require('./scheduler').processReminders()"

# Run trial expiration check every 15 minutes
*/15 * * * * node -e "require('./scheduler').processExpiredTrials()"

# Record analytics once per day at midnight
0 0 * * * node -e "require('./scheduler').recordAnalytics()"

# Run all tasks together at midnight
0 0 * * * node -e "require('./scheduler').runScheduledTasks()"
*/

// =====================================================
// VERCEL CRON EXAMPLE
// =====================================================

/*
// vercel.json
{
  "crons": [
    {
      "path": "/api/scheduler/reminders",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/scheduler/analytics",
      "schedule": "0 0 * * *"
    }
  ]
}
*/

export default {
  processReminders,
  processExpiredTrials,
  recordAnalytics,
  runScheduledTasks,
};
