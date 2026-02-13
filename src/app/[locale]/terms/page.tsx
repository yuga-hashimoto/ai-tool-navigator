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
    title: "Terms of Service - AI Tool Navigator",
    description: "Terms of Service for AI Tool Navigator",
    alternates: {
      canonical: `/${locale}/terms`,
    }
  };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const tBreadcrumbs = await getTranslations('Breadcrumbs');

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: tBreadcrumbs('home'), href: '/' },
    { label: tBreadcrumbs('terms') },
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
          Terms of Service
        </h1>
        
        <div className="prose prose-zinc dark:prose-invert max-w-none">
            <p className="leading-7 [&:not(:first-child)]:mt-6">
                Last updated: {new Date().toLocaleDateString()}
            </p>

            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 mt-10">
                1. Acceptance of Terms
            </h2>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
                By accessing and using AI Tool Navigator, you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight mt-10">
                2. Use License
            </h2>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
                Permission is granted to temporarily download one copy of the materials (information or software) on AI Tool Navigator&apos;s website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                <li>modify or copy the materials;</li>
                <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
                <li>attempt to decompile or reverse engineer any software contained on AI Tool Navigator&apos;s website;</li>
                <li>remove any copyright or other proprietary notations from the materials; or</li>
                <li>transfer the materials to another person or &quot;mirror&quot; the materials on any other server.</li>
            </ul>

            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight mt-10">
                3. Disclaimer
            </h2>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
                The materials on AI Tool Navigator&apos;s website are provided &quot;as is&quot;. AI Tool Navigator makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties, including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>

             <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight mt-10">
                4. Limitations
            </h2>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
                In no event shall AI Tool Navigator or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on AI Tool Navigator&apos;s website, even if AI Tool Navigator or a AI Tool Navigator authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
            
            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight mt-10">
                5. Revisions and Errata
            </h2>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
                The materials appearing on AI Tool Navigator&apos;s website could include technical, typographical, or photographic errors. AI Tool Navigator does not warrant that any of the materials on its website are accurate, complete, or current. AI Tool Navigator may make changes to the materials contained on its website at any time without notice. AI Tool Navigator does not, however, make any commitment to update the materials.
            </p>

            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight mt-10">
                6. Affiliate Disclosure
            </h2>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
                AI Tool Navigator participates in affiliate marketing programs. This means we may earn commissions on qualifying purchases made through links on our website to third-party products or services.
            </p>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
                When you click on an affiliate link on our website and make a purchase, we may receive a commission from the affiliate partner. This comes at <strong>no additional cost to you</strong>.
            </p>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
                Our affiliate relationships do not influence our editorial content, product recommendations, or the products we choose to feature. We only recommend tools that we have personally used and believe will provide value to our users.
            </p>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
                The prices and availability of products may change. We strive to keep our information accurate and up-to-date, but we cannot guarantee the accuracy of all pricing information.
            </p>
        </div>
      </div>
    </div>
  );
}
