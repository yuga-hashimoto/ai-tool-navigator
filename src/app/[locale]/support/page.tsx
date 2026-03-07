import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Breadcrumbs, BreadcrumbItem } from "@/components/Breadcrumbs";
import { generateBreadcrumbSchema } from "@/lib/schema";
import { ChatWidgetContainer } from "@/components/chat";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "SupportPage" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/support`,
    },
  };
}

export default async function SupportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isJapanese = locale === "ja";
  const t = await getTranslations("SupportPage");
  const tBreadcrumbs = await getTranslations("Breadcrumbs");

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: tBreadcrumbs("home"), href: "/" },
    { label: tBreadcrumbs("support") },
  ];

  const jsonLd = generateBreadcrumbSchema(breadcrumbItems, locale);
  const cards = isJapanese
    ? [
        {
          title: "ライブチャット",
          body: "営業時間中はチャット経由で問い合わせできます。短い確認や導線相談に向いています。",
        },
        {
          title: "メール・フォーム",
          body: "スポンサー相談、広告掲載、ツール送信などはフォーム経由で送信できます。",
        },
        {
          title: "運営方針",
          body: "広告開示、編集方針、更新フローを事前に確認したい場合は方針ページをご覧ください。",
        },
      ]
    : [
        {
          title: "Live chat",
          body: "Use chat during business hours for quick routing or product questions.",
        },
        {
          title: "Email and forms",
          body: "Advertising, sponsorship, and submission requests can be sent through the relevant forms.",
        },
        {
          title: "Editorial policy",
          body: "Check disclosure, review standards, and the update workflow before reaching out.",
        },
      ];

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
            {t("title")}
          </h1>
          <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            {t("description")}
          </p>
        </div>

        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 p-8 mb-8 border border-indigo-100 dark:border-indigo-900/40">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {isJapanese ? "すぐに確認したい場合" : "Need a quick answer?"}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {isJapanese
                ? "比較導線、掲載方針、スポンサー相談は下記のページから直接進めます。"
                : "Use the direct pages below for comparison routing, editorial policy, or commercial inquiries."}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/editorial-policy"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {isJapanese ? "編集方針" : "Editorial policy"}
              </Link>
              <Link
                href="/affiliate-disclosure"
                className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                {isJapanese ? "広告開示" : "Affiliate disclosure"}
              </Link>
              <Link
                href="/advertise"
                className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                {isJapanese ? "広告掲載" : "Advertise"}
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {cards.map((card, index) => (
              <div
                key={card.title}
                className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">{index === 0 ? "💬" : index === 1 ? "📧" : "📚"}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{card.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{card.body}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-300">{t("intro")}</p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/submit"
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 inline-block"
              >
                {isJapanese ? "ツールを送信" : "Submit a tool"}
              </Link>
              <Link
                href="/sponsor"
                className="rounded-md border border-zinc-300 px-3.5 py-2.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900 inline-block"
              >
                {isJapanese ? "スポンサー相談" : "Sponsorship inquiry"}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <ChatWidgetContainer
        sessionId="support_page_chat"
        position="bottom-right"
        primaryColor="#4F46E5"
      />
    </div>
  );
}
