import { Metadata } from "next";
import { Breadcrumbs, BreadcrumbItem } from "@/components/Breadcrumbs";
import { AffiliateOptOut } from "@/components/AffiliateDisclaimer";
import { Link } from "@/i18n/routing";
import { generateBreadcrumbSchema } from "@/lib/schema";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isJapanese = locale === "ja";

  return {
    title: isJapanese ? "広告・アフィリエイト開示 | AI Tool Navigator" : "Affiliate Disclosure | AI Tool Navigator",
    description: isJapanese
      ? "AI Tool Navigator の広告・アフィリエイト開示、計測方針、編集との分離について説明します。"
      : "How AI Tool Navigator handles affiliate links, attribution tracking, and the separation between revenue and editorial decisions.",
    alternates: {
      canonical: `/${locale}/affiliate-disclosure`,
    },
  };
}

export default async function AffiliateDisclosurePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isJapanese = locale === "ja";
  const tBreadcrumbs = await getTranslations("Breadcrumbs");

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: tBreadcrumbs("home"), href: "/" },
    { label: isJapanese ? "広告開示" : "Affiliate Disclosure" },
  ];

  const jsonLd = generateBreadcrumbSchema(breadcrumbItems, locale);
  const copy = isJapanese
    ? {
        title: "広告・アフィリエイト開示",
        intro:
          "AI Tool Navigator では、一部の外部リンクにアフィリエイト計測を利用しています。リンク経由で申込みや購入が発生した場合、当サイトが紹介料を受け取ることがあります。",
        sections: [
          {
            title: "1. 収益が発生するケース",
            body:
              "ツール詳細、比較ページ、ランキング、レビュー内の CTA から公式サイトへ遷移したあと、提供元の条件を満たす申込みや購入が成立した場合に報酬が発生することがあります。",
          },
          {
            title: "2. 編集判断との分離",
            body:
              "掲載順位、カテゴリ導線、比較プリセットは、報酬率ではなく用途適合、検証状況、更新性を優先して決めます。確認が不十分な名称やページは主要導線から外し、必要に応じて noindex にします。",
          },
          {
            title: "3. 計測される情報",
            body:
              "クリック計測では、遷移元ページ、参照ツール、キャンペーン識別子、セッション単位の attribution 情報を保持することがあります。個人を直接特定する目的では使いません。",
          },
          {
            title: "4. 収益の使い道",
            body:
              "アフィリエイト収益は、比較記事の更新、検証工数、監視ジョブ、ホスティング費用など、サイト運営コストの一部に充てています。",
          },
        ],
        policyCta: "編集方針を見る",
        support:
          "計測を無効化したい場合は以下のボタンを利用してください。Cookie を削除したい場合はブラウザ側の設定も合わせて確認してください。",
      }
    : {
        title: "Affiliate Disclosure",
        intro:
          "AI Tool Navigator uses affiliate attribution on some external links. If a signup or purchase happens after you click one of those links, we may receive a commission.",
        sections: [
          {
            title: "1. When revenue is generated",
            body:
              "Revenue may be earned when a visitor clicks through from a tool page, comparison page, ranking, or review CTA and then completes a qualifying signup or purchase under the vendor's terms.",
          },
          {
            title: "2. Separation from editorial decisions",
            body:
              "Rankings, category pathways, and comparison presets are determined by product fit, review status, and freshness signals, not by commission rate. Pages that fail review can be removed from primary entry points and indexed search.",
          },
          {
            title: "3. What gets tracked",
            body:
              "Click attribution may store the referring page, tool identifier, campaign metadata, and session-level attribution details. We do not use this data to directly identify individual people.",
          },
          {
            title: "4. How revenue is used",
            body:
              "Affiliate revenue helps fund comparison updates, editorial verification work, monitoring jobs, and the basic operating costs of the site.",
          },
        ],
        policyCta: "Read editorial policy",
        support:
          "If you want to disable affiliate attribution, use the control below. Browser-level cookie controls still apply if you want to clear existing data.",
      };

  return (
    <div className="bg-white dark:bg-black min-h-screen transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-5xl px-6 py-24 sm:py-32 lg:px-8">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
            {copy.title}
          </h1>
          <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            {copy.intro}
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-4xl space-y-6">
          {copy.sections.map((section) => (
            <section
              key={section.title}
              className="rounded-3xl border border-zinc-200 bg-zinc-50 p-8 dark:border-zinc-800 dark:bg-zinc-900/60"
            >
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {section.title}
              </h2>
              <p className="mt-4 text-base leading-7 text-zinc-600 dark:text-zinc-400">
                {section.body}
              </p>
            </section>
          ))}

          <section className="rounded-3xl border border-blue-200 bg-blue-50 p-8 dark:border-blue-800/50 dark:bg-blue-950/30">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {isJapanese ? "計測の無効化" : "Tracking opt-out"}
            </h2>
            <p className="mt-4 text-base leading-7 text-zinc-600 dark:text-zinc-400">
              {copy.support}
            </p>
            <div className="mt-6">
              <AffiliateOptOut />
            </div>
            <div className="mt-6">
              <Link
                href="/editorial-policy"
                className="inline-flex items-center rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {copy.policyCta}
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
