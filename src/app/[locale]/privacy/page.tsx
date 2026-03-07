import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Breadcrumbs, BreadcrumbItem } from "@/components/Breadcrumbs";
import { generateBreadcrumbSchema } from "@/lib/schema";
import { Link } from "@/i18n/routing";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params;
  const isJapanese = locale === "ja";
  return {
    title: isJapanese ? "プライバシーポリシー | AI Tool Navigator" : "Privacy Policy | AI Tool Navigator",
    description: isJapanese
      ? "データ取得、広告・アフィリエイト計測、問い合わせ保存、外部サービス連携の扱いを説明します。"
      : "How AI Tool Navigator handles data collection, affiliate tracking, inquiries, and third-party services.",
    alternates: {
      canonical: `/${locale}/privacy`,
    }
  };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isJapanese = locale === "ja";
  const tBreadcrumbs = await getTranslations('Breadcrumbs');

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: tBreadcrumbs('home'), href: '/' },
    { label: tBreadcrumbs('privacy') },
  ];

  const jsonLd = generateBreadcrumbSchema(breadcrumbItems, locale);
  const copy = isJapanese
    ? {
        title: "プライバシーポリシー",
        lastUpdated: "最終更新日",
        intro:
          "AI Tool Navigator は、比較・レビュー・広告導線・問い合わせ機能を運営するために必要な範囲で情報を取り扱います。取得目的と保存先をできるだけ明確にし、広告収益と編集判断を分離して運用します。",
        sections: [
          {
            title: "1. 取得する情報",
            body:
              "ニュースレター登録、ツール送信、広告・スポンサー問い合わせ、比較導線のクリック計測、アクセス解析のために、メールアドレス、会社情報、参照元、利用端末に関する基本的な情報を取得することがあります。",
          },
          {
            title: "2. 利用目的",
            body:
              "取得した情報は、比較導線の改善、問い合わせ対応、掲載審査、広告効果の把握、不正利用の抑止、サイト品質の改善に利用します。本人の同意なく、これらの目的を超えて利用しません。",
          },
          {
            title: "3. Cookie・広告・アフィリエイト計測",
            body:
              "広告枠の表示、アフィリエイトクリックの帰属、再訪時の体験最適化のために Cookie や類似技術を使うことがあります。クリック計測には個人を直接特定しない識別子を使い、計測を無効化したい場合は Cookie の削除やブラウザ設定で制御できます。",
          },
          {
            title: "4. 外部サービス",
            body:
              "Google Analytics、Google AdSense / Ad Manager、Google Sheets、決済や配信に関する外部サービスを利用する場合があります。各サービスの取り扱いは、それぞれの提供者のポリシーにも従います。",
          },
          {
            title: "5. 保存期間と共有",
            body:
              "問い合わせや送信データは運営上必要な期間だけ保存します。法令対応、業務委託、または本人同意がある場合を除き、個人情報を第三者へ販売しません。",
          },
          {
            title: "6. ユーザーの権利",
            body:
              "地域の法令に応じて、開示、訂正、削除、広告計測の停止を求めることができます。個別の依頼はサポート窓口から受け付けます。",
          },
        ],
        relatedTitle: "関連ページ",
        disclosure: "広告開示",
        editorial: "編集方針",
        support: "サポート",
      }
    : {
        title: "Privacy Policy",
        lastUpdated: "Last updated",
        intro:
          "AI Tool Navigator processes only the data needed to operate comparison pages, reviews, monetization flows, and inquiry forms. We aim to keep collection scope explicit and to separate editorial decisions from revenue relationships.",
        sections: [
          {
            title: "1. Information we collect",
            body:
              "We may collect email addresses, company details, referral information, and basic device or usage data when you subscribe, submit a tool, send a partnership inquiry, or interact with tracked comparison and affiliate flows.",
          },
          {
            title: "2. Why we use it",
            body:
              "We use collected data to improve comparison routes, respond to inquiries, review submissions, measure ad and affiliate performance, prevent abuse, and maintain site quality. We do not repurpose personal data beyond these uses without a clear basis.",
          },
          {
            title: "3. Cookies, ads, and affiliate tracking",
            body:
              "Cookies and similar technologies may be used for ad delivery, affiliate attribution, and return-visit optimization. Click attribution relies on non-personal identifiers where possible, and you can disable or clear cookies through your browser settings.",
          },
          {
            title: "4. Third-party services",
            body:
              "We may use services such as Google Analytics, Google AdSense / Ad Manager, Google Sheets, and payment or delivery providers. Their own privacy policies also apply to how those services process data.",
          },
          {
            title: "5. Retention and sharing",
            body:
              "Inquiry and submission records are stored only as long as operationally necessary. We do not sell personal information. Data may be shared only when required for legal compliance, service delivery, or with your consent.",
          },
          {
            title: "6. Your rights",
            body:
              "Depending on your jurisdiction, you may have rights to access, correct, delete, or restrict processing, including requests related to advertising or tracking. Support can route those requests.",
          },
        ],
        relatedTitle: "Related pages",
        disclosure: "Affiliate disclosure",
        editorial: "Editorial policy",
        support: "Support",
      };

  return (
    <div className="bg-background min-h-screen py-12 transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbItems} />
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-8">
          {copy.title}
        </h1>
        
        <div className="prose prose-zinc dark:prose-invert max-w-none">
          <p className="leading-7 [&:not(:first-child)]:mt-6">
            {copy.lastUpdated}: {new Date().toLocaleDateString(locale === "ja" ? "ja-JP" : "en-US")}
          </p>
          <p className="leading-7 [&:not(:first-child)]:mt-6">{copy.intro}</p>

          {copy.sections.map((section) => (
            <section key={section.title}>
              <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 mt-10">
                {section.title}
              </h2>
              <p className="leading-7 [&:not(:first-child)]:mt-6">{section.body}</p>
            </section>
          ))}

          <section>
            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight mt-10">
              {copy.relatedTitle}
            </h2>
            <div className="mt-6 flex flex-wrap gap-3 not-prose">
              <Link
                href="/affiliate-disclosure"
                className="inline-flex items-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                {copy.disclosure}
              </Link>
              <Link
                href="/editorial-policy"
                className="inline-flex items-center rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
              >
                {copy.editorial}
              </Link>
              <Link
                href="/support"
                className="inline-flex items-center rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
              >
                {copy.support}
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
