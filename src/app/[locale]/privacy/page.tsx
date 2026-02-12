import React from 'react';
import { Metadata } from 'next';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  return {
    title: "Privacy Policy - AI Tool Navigator",
    description: "Privacy Policy for AI Tool Navigator",
    alternates: {
      canonical: `/${locale}/privacy`,
    },
  };
}

export default async function PrivacyPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  await params;
  return (
    <div className="bg-background min-h-screen py-12 transition-colors duration-300">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-8">
          Privacy Policy
        </h1>
        
        <div className="prose prose-zinc dark:prose-invert max-w-none">
            <p className="leading-7 [&:not(:first-child)]:mt-6">
                Last updated: {new Date().toLocaleDateString()}
            </p>

            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 mt-10">
                1. Information We Collect
            </h2>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
                We collect information that you provide directly to us, such as when you create an account, subscribe to our newsletter, or contact us for support. This information may include your name, email address, and any other information you choose to provide.
            </p>

            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight mt-10">
                2. How We Use Your Information
            </h2>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
                We use the information we collect to provide, maintain, and improve our services, to communicate with you, and to personalize your experience.
            </p>

            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight mt-10">
                3. Sharing of Information
            </h2>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
                We do not share your personal information with third parties except as described in this privacy policy. We may share your information with service providers who perform services on our behalf, or in response to a request for information if we believe disclosure is in accordance with, or required by, any applicable law, regulation, or legal process.
            </p>

            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight mt-10">
                4. Cookies and Tracking Technologies
            </h2>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
                We use cookies and similar tracking technologies to track the activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
            
            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight mt-10">
                5. Security
            </h2>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
                The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
            </p>
        </div>
      </div>
    </div>
  );
}
