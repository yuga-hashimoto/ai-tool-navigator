import React from 'react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Breadcrumbs, BreadcrumbItem } from "@/components/Breadcrumbs";
import { generateBreadcrumbSchema } from "@/lib/schema";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Privacy Policy - AI Tool Navigator",
    description: "Privacy Policy for AI Tool Navigator",
    alternates: {
      canonical: `/${locale}/privacy`,
    }
  };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const tBreadcrumbs = await getTranslations('Breadcrumbs');

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: tBreadcrumbs('home'), href: '/' },
    { label: tBreadcrumbs('privacy') },
  ];

  const jsonLd = generateBreadcrumbSchema(breadcrumbItems, locale);

  return (
    <div className="bg-background min-h-screen py-12 transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbItems} />
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
                We use cookies and similar tracking technologies to track the activity on our service and hold certain information. You can instruct your browser to refuse all cookies or indicate when a cookie is being sent.
            </p>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
                <strong>Affiliate Tracking:</strong> We use affiliate tracking cookies to attribute referrals to our affiliate partners. When you click on an affiliate link, we may set a cookie that helps us track the referral. This cookie is stored for 90 days and does not contain personally identifiable information.
            </p>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
                <strong>Opt-Out:</strong> You can opt out of affiliate tracking by clearing your browser cookies or using privacy tools that block tracking cookies. Some browsers also support "Do Not Track" signals.
            </p>

            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight mt-10">
                5. Third-Party Analytics and Tracking
            </h2>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
                We use third-party services such as Google Analytics to understand how users interact with our site. These services may collect information about your browsing behavior across websites.
            </p>

            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight mt-10">
                6. Affiliate Relationships Disclosure
            </h2>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
                Our website contains affiliate links to third-party products and services. When you click on these links and make a purchase, we may receive a commission. This comes at no additional cost to you.
            </p>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
                We only recommend products and services that we have personally used and believe will provide value to our readers. Our affiliate relationships do not influence our editorial content or product recommendations.
            </p>

            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight mt-10">
                7. Your Privacy Rights
            </h2>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
                Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc list-inside ml-6 space-y-2">
                <li>Right to access the personal information we hold about you</li>
                <li>Right to request correction of inaccurate information</li>
                <li>Right to request deletion of your information</li>
                <li>Right to opt out of targeted advertising</li>
                <li>Right to opt out of affiliate tracking</li>
            </ul>

            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight mt-10">
                8. California Consumer Privacy Act (CCPA)
            </h2>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
                If you are a California resident, you have the right to know what personal information we collect, the right to request deletion, and the right to opt out of the sale of your personal information. Note that we do not sell your personal information to third parties.
            </p>

            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight mt-10">
                9. General Data Protection Regulation (GDPR)
            </h2>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
                For users in the European Economic Area, we process your personal data based on legitimate interest, consent, or contractual necessity. You have the right to access, rectify, erase, restrict processing, and port your data.
            </p>

            <p className="leading-7 [&:not(:first-child)]:mt-6">
                The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
            </p>
        </div>
      </div>
    </div>
  );
}
