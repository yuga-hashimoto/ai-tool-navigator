import { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { getSubscriptionTiers } from "@/lib/subscriptions/subscription-manager";
import PricingCards from "@/components/subscriptions/PricingCards";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isJapanese = locale === "ja";

  return {
    title: isJapanese ? "料金プラン | AI Tool Navigator" : "Pricing | AI Tool Navigator",
    description: isJapanese
      ? "サブスクリプション、比較支援、継続利用向けの料金プランを確認できます。"
      : "Review subscription options and pricing plans for AI Tool Navigator.",
    alternates: {
      canonical: `/${locale}/pricing`,
    },
  };
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isJapanese = locale === "ja";
  const tiers = await getSubscriptionTiers();

  const copy = isJapanese
    ? {
        title: "シンプルで分かりやすい料金",
        description: "必要な機能に合わせてプランを選べます。アップグレードやダウングレードはいつでも可能です。",
        faqTitle: "よくある質問",
        faqs: [
          {
            question: "後からプランを変更できますか？",
            answer: "はい。上位プランへの変更やダウングレードはいつでも可能です。アップグレード時は残り期間に応じて日割り計算されます。",
          },
          {
            question: "支払い方法は何に対応していますか？",
            answer: "主要なクレジットカードに対応しています。決済処理は Stripe 経由で行います。",
          },
          {
            question: "無料トライアルはありますか？",
            answer: "有料プランにはトライアルを設定できる構成です。実際の提供条件は管理画面の設定に従います。",
          },
          {
            question: "いつでも解約できますか？",
            answer: "はい。アカウント設定から解約できます。契約期間の終了までは利用を継続できます。",
          },
          {
            question: "返金対応はありますか？",
            answer: "返金条件は契約プランと決済条件に依存します。個別案件はサポートから確認してください。",
          },
        ],
        ctaTitle: "利用を始めますか？",
        ctaDescription: "導入前に比較導線や編集方針も確認できます。",
        cta: "比較ページを見る",
      }
    : {
        title: "Simple, transparent pricing",
        description: "Choose the plan that fits your needs. Upgrades and downgrades can be handled at any time.",
        faqTitle: "Frequently asked questions",
        faqs: [
          {
            question: "Can I change my plan later?",
            answer: "Yes. You can upgrade or downgrade at any time, and upgrade charges are prorated for the remaining billing period.",
          },
          {
            question: "What payment methods are supported?",
            answer: "Major credit cards are supported through Stripe.",
          },
          {
            question: "Is there a free trial?",
            answer: "Trial availability depends on the plan configuration currently enabled in the subscription system.",
          },
          {
            question: "Can I cancel anytime?",
            answer: "Yes. You can cancel from account settings and keep access until the end of the billing period.",
          },
          {
            question: "Do you offer refunds?",
            answer: "Refund handling depends on the plan and payment terms. Contact support for case-specific clarification.",
          },
        ],
        ctaTitle: "Ready to get started?",
        ctaDescription: "You can also review the comparison hub and editorial policy before subscribing.",
        cta: "Open comparison hub",
      };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-zinc-950 dark:to-black">
      <div className="text-center py-16 px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          {copy.title}
        </h1>
        <p className="text-xl text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto">
          {copy.description}
        </p>
      </div>

      <PricingCards tiers={tiers} />

      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
          {copy.faqTitle}
        </h2>

        <div className="grid gap-6">
          {copy.faqs.map((faq) => (
            <div
              key={faq.question}
              className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{faq.question}</h3>
              <p className="text-gray-600 dark:text-zinc-400">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">{copy.ctaTitle}</h2>
          <p className="text-gray-300 mb-8">{copy.ctaDescription}</p>
          <Link
            href="/compare"
            className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            {copy.cta}
          </Link>
        </div>
      </section>
    </main>
  );
}
