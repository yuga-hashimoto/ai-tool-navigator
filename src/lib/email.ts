import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, from = 'onboarding@resend.dev' }: SendEmailOptions) {
  // In development or if API key is missing, we might want to log instead of failing
  if (!resend) {
    console.warn('RESEND_API_KEY is not set. Email sending is simulated.');
    console.log(`[Email Simulation] To: ${to}, Subject: ${subject}`);
    return { success: true, data: { id: 'simulated-email-id' } };
  }

  try {
    const data = await resend.emails.send({
      from,
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
