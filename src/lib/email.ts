
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 'dummy_key_for_build');

export async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'dummy_key_for_build') {
    console.warn('RESEND_API_KEY is not set. Email sending skipped.');
    return { success: false, error: 'RESEND_API_KEY missing' };
  }

  try {
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to,
      subject,
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}
