/**
 * Email Utility
 *
 * Provides functionality to send emails (currently mocked).
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, from = 'noreply@example.com' }: EmailOptions): Promise<boolean> {
  console.log('--- MOCK EMAIL SEND ---');
  console.log(`From: ${from}`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log('--- BODY ---');
  console.log(html);
  console.log('-----------------------');

  return true;
}
