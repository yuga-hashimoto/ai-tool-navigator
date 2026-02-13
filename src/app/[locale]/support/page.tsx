import { getTranslations } from 'next-intl/server';
import { Breadcrumbs, BreadcrumbItem } from "@/components/Breadcrumbs";
import { generateBreadcrumbSchema } from "@/lib/schema";
import { ChatWidgetContainer } from "@/components/chat";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const t = await getTranslations({locale, namespace: 'SupportPage'});
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `/${locale}/support`,
    }
  };
}

export default async function SupportPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const t = await getTranslations('SupportPage');
  const tBreadcrumbs = await getTranslations('Breadcrumbs');

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: tBreadcrumbs('home'), href: '/' },
    { label: tBreadcrumbs('support') },
  ];

  const jsonLd = generateBreadcrumbSchema(breadcrumbItems, locale);

  return (
    <div className="bg-white dark:bg-black min-h-screen transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-6xl dark:text-zinc-50">
            {t('title')}
          </h1>
          <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            {t('description')}
          </p>
        </div>

        <div className="mx-auto max-w-3xl text-center">
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              💬 Need Immediate Help?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start a live chat conversation with our support team. We typically respond within minutes during business hours.
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="/chat-demo"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <span>Test Chat Widget</span>
              </a>
              <a
                href="#"
                className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <span>View Support Options</span>
              </a>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Live Chat</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Real-time chat with our support team during business hours (9 AM - 6 PM EST).
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📧</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Email Support</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Send us an email and we'll get back to you within 24 business hours.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Help Center</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Browse our extensive documentation and guides to find answers quickly.
              </p>
            </div>
          </div>

          <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-300">
            {t('intro')}
          </p>

          <a
            href="#"
            className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 inline-block mt-8"
            aria-disabled="true"
          >
            {t('donate_button')}
          </a>
        </div>
      </div>

      {/* Live Chat Widget */}
      <ChatWidgetContainer
        sessionId="support_page_chat"
        position="bottom-right"
        primaryColor="#4F46E5"
      />
    </div>
  );
}
