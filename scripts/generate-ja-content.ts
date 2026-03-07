import fs from "fs";
import path from "path";
import matter from "gray-matter";

const TOOL_SOURCE_DIR = path.join(process.cwd(), "content", "tools", "en");
const TOOL_TARGET_DIR = path.join(process.cwd(), "content", "tools", "ja");
const POST_SOURCE_DIR = path.join(process.cwd(), "content", "posts", "en");
const POST_TARGET_DIR = path.join(process.cwd(), "content", "posts", "ja");

const CATEGORY_MAP: Record<string, string> = {
  "Business Automation": "業務自動化",
  "Video Generation": "動画生成",
  Coding: "コーディング",
  Comparison: "比較",
  "AI Coworker": "AIコワーカー",
  LLM: "LLM",
  Copywriting: "コピーライティング",
  Code: "コードエディタ",
  "LLM/Chatbot": "LLM・チャットボット",
  "AI Comparisons": "AI比較",
  "Coding Agent": "コーディングエージェント",
  Writing: "ライティング",
  "Real Estate": "不動産",
  Automation: "自動化",
  "Upcoming LLM": "次世代LLM",
  "Website Builder": "Webサイトビルダー",
  Search: "検索",
  Marketing: "マーケティング",
  Security: "セキュリティ",
  "Text-to-Speech": "音声読み上げ",
};

const CATEGORY_AUDIENCE_MAP: Record<string, string> = {
  "Business Automation": "電話対応、予約受付、問い合わせ対応の自動化を進めたい事業者",
  "Video Generation": "動画制作、SNS運用、広告クリエイティブを効率化したいクリエイター",
  Coding: "コード生成、レビュー、設計補助を求める開発者",
  Comparison: "複数ツールの違いを短時間で把握したい比較検討ユーザー",
  "AI Coworker": "リサーチ、文書作成、業務支援をAIに任せたい知識労働者",
  LLM: "汎用AIアシスタントを探している個人・チーム",
  Copywriting: "広告文、SNS投稿、営業文面を素早く作りたいマーケター",
  Code: "IDE一体型のAI支援を重視する開発チーム",
  "LLM/Chatbot": "無料または高コスパで汎用AIを活用したいユーザー",
  "AI Comparisons": "将来性や性能差を踏まえてモデル選定したい人",
  "Coding Agent": "長時間のコーディング作業をAIエージェントに任せたい開発組織",
  Writing: "文章生成やGoogle連携を重視するユーザー",
  "Real Estate": "不動産分析や案件探索を効率化したい担当者",
  Automation: "店舗や中小企業の業務フローを自動化したい運用担当者",
  "Upcoming LLM": "未発表モデルの動向を追っているAIウォッチャー",
  "Website Builder": "LPや簡易サイトを短時間で立ち上げたい起業家",
  Search: "出典付きで調査を進めたいリサーチ中心のユーザー",
  Marketing: "SEO、メール営業、コンテンツ制作を一気通貫で進めたいチーム",
  Security: "本人確認や不正対策を強化したい事業者",
  "Text-to-Speech": "読み上げやアクセシビリティ用途で音声化を活用したいユーザー",
};

const TAG_MAP: Record<string, string> = {
  "Affiliate Marketing": "アフィリエイト",
  "AI Tools": "AIツール",
  "Passive Income": "副収入",
  SaaS: "SaaS",
  "Workflow Automation": "ワークフロー自動化",
  Productivity: "生産性",
  Coding: "コーディング",
  "Code Review": "コードレビュー",
  "Video Generation": "動画生成",
  "Content Marketing": "コンテンツマーケティング",
  "Social Media": "SNS運用",
  "Marketing Automation": "マーケティング自動化",
  "Business Automation": "業務自動化",
  Comparison: "比較",
};

const POST_TITLE_MAP: Record<string, string> = {
  "affiliate-report-2026-02": "2026年2月版: 高単価なAIアフィリエイト案件レポート",
  "gemini-3-vs-llama-5-2026": "2026年版 Gemini 3 vs Llama 5 比較",
  "llama-4.5-vs-gemini-3-pro": "Llama 4.5 vs Gemini 3 Pro を比較",
  "llama-5-code-review": "Llama 5 はコードレビューに使えるのか",
  "tiktok-script-stop-promoting-chatgpt": "TikTok向け台本で ChatGPT 推しを見直す理由",
  "top-5-ai-video-generators-2026": "2026年版: おすすめAI動画生成ツール5選",
  "top-5-high-paying-ai-tools-2026": "高単価で狙いやすいAIツール5選",
  "workflow-automation-2026": "2026年のワークフロー自動化ガイド",
};

const POST_EXCERPT_MAP: Record<string, string> = {
  "affiliate-report-2026-02": "高単価・継続報酬・Cookie期間の観点から、注目しやすいAI案件を日本語で整理したレポートです。",
  "gemini-3-vs-llama-5-2026": "Gemini 3 と Llama 5 の立ち位置、向いている用途、比較ポイントを日本語で要約します。",
  "llama-4.5-vs-gemini-3-pro": "Llama 4.5 と Gemini 3 Pro を、自動化や運用観点で比較しやすい形に整理します。",
  "llama-5-code-review": "Llama 5 をコードレビュー用途で使う前に見ておきたい論点をまとめます。",
  "tiktok-script-stop-promoting-chatgpt": "TikTok向けコンテンツ戦略で ChatGPT 一辺倒を避ける理由を整理します。",
  "top-5-ai-video-generators-2026": "動画制作で比較されやすいAI動画生成ツール5つを日本語で要約します。",
  "top-5-high-paying-ai-tools-2026": "アフィリエイトや紹介導線と相性が良いAIツール候補を高単価視点でまとめます。",
  "workflow-automation-2026": "2026年の業務自動化で押さえたい設計ポイントとツール選定軸を整理します。",
};

const REPLACEMENTS: Array<[RegExp, string]> = [
  [/AI-powered/gi, "AI搭載"],
  [/All-in-one/gi, "オールインワン"],
  [/open-source/gi, "オープンソース"],
  [/Open-source/gi, "オープンソース"],
  [/website builder/gi, "Webサイトビルダー"],
  [/video generation/gi, "動画生成"],
  [/video generator/gi, "動画生成ツール"],
  [/text-to-speech/gi, "音声読み上げ"],
  [/real-time/gi, "リアルタイム"],
  [/high-quality/gi, "高品質な"],
  [/natural conversation flow/gi, "自然な会話フロー"],
  [/Natural conversation flow/gi, "自然な会話フロー"],
  [/AI receptionist/gi, "AI受付"],
  [/small businesses/gi, "中小事業者"],
  [/books appointments/gi, "予約を受け付け"],
  [/captures leads/gi, "リード情報を取得し"],
  [/keyword research/gi, "キーワード調査"],
  [/competitor analysis/gi, "競合分析"],
  [/market analysis/gi, "市場分析"],
  [/cold outreach/gi, "コールドメール営業"],
  [/lead generation/gi, "リード獲得"],
  [/fraud prevention/gi, "不正対策"],
  [/identity verification/gi, "本人確認"],
  [/developer/gi, "開発者"],
  [/developers/gi, "開発者"],
  [/marketers/gi, "マーケター"],
  [/entrepreneurs/gi, "起業家"],
  [/creators/gi, "クリエイター"],
  [/automation/gi, "自動化"],
  [/reasoning/gi, "推論"],
  [/comparison/gi, "比較"],
  [/pricing/gi, "料金"],
  [/free tier/gi, "無料プラン"],
  [/lifetime recurring/gi, "継続報酬"],
  [/cookie duration/gi, "Cookie期間"],
  [/best for/gi, "向いている用途"],
  [/commission rate/gi, "報酬率"],
  [/potential earnings/gi, "想定報酬"],
  [/released in February 2026/gi, "2026年2月に公開された"],
  [/released in early 2026/gi, "2026年初頭に公開された"],
  [/released in September 2025/gi, "2025年9月に公開された"],
];

function ensureDir(targetDir: string) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
}

function listMissingMarkdownFiles(sourceDir: string, targetDir: string): string[] {
  const source = new Set(fs.readdirSync(sourceDir).filter((file) => file.endsWith(".md")));
  const target = new Set(fs.existsSync(targetDir) ? fs.readdirSync(targetDir).filter((file) => file.endsWith(".md")) : []);
  return Array.from(source).filter((file) => !target.has(file)).sort();
}

function translateText(input: string): string {
  let output = input;

  for (const [pattern, replacement] of REPLACEMENTS) {
    output = output.replace(pattern, replacement);
  }

  return output
    .replace(/\s+/g, " ")
    .replace(/\s([,.:;!?])/g, "$1")
    .trim();
}

function extractBrandName(title: string): string {
  const first = title.split(":")[0]?.trim() || title;
  return first.replace(/\s+\(.+\)$/, "").trim();
}

function translateList(items?: string[]): string[] | undefined {
  if (!items || items.length === 0) {
    return undefined;
  }

  return items.map((item) => translateText(item));
}

function buildToolBody(metadata: Record<string, unknown>): string {
  const title = String(metadata.title || "");
  const brandName = extractBrandName(title);
  const category = String(metadata.category || "");
  const description = translateText(String(metadata.description || `${brandName} の概要ページです。`));
  const pros = translateList(Array.isArray(metadata.pros) ? metadata.pros.map(String) : []);
  const cons = translateList(Array.isArray(metadata.cons) ? metadata.cons.map(String) : []);
  const rating = metadata.rating ? `${metadata.rating}/5` : "未掲載";
  const categoryJa = CATEGORY_MAP[category] || category;
  const audience = CATEGORY_AUDIENCE_MAP[category] || "比較しながら導入判断を進めたいユーザー";
  const topStrength = pros?.[0] || `${categoryJa} 領域での使いやすさ`;

  const sections = [
    `## ${brandName}とは？`,
    "",
    `${description}。この日本語ページでは、主な用途、強み、注意点を短く整理しています。最新の料金や仕様は公式サイトもあわせて確認してください。`,
    "",
    "### 主なポイント",
    "",
    `* **カテゴリ:** ${categoryJa}`,
    `* **評価:** ${rating}`,
    `* **向いている用途:** ${audience}`,
    "",
    "### 強み",
    "",
    ...(pros && pros.length > 0
      ? pros.map((item) => `* ${item}`)
      : ["* 導入判断に必要な基本情報を整理しやすい構成です。"]),
    "",
    "### 注意点",
    "",
    ...(cons && cons.length > 0
      ? cons.map((item) => `* ${item}`)
      : ["* 実運用前に料金・利用規約・対応言語を確認してください。"]),
    "",
    "### 日本語ユーザー向けメモ",
    "",
    "* 公式ページの表記や価格は更新される可能性があるため、契約前に再確認してください。",
    "* 比較ページやカテゴリLPから、近い用途のツールと横並びで比較できます。",
    "* API連携、商用利用、チーム共有の条件は導入前にチェックしておくと安全です。",
    "",
    "### 総評",
    "",
    `${brandName} は、${categoryJa}領域で有力な候補のひとつです。特に「${topStrength}」を重視するユーザーに向いています。`,
  ];

  return sections.join("\n");
}

function slugToReadableTitle(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildPostBody(slug: string, metadata: Record<string, unknown>, content: string): string {
  const excerpt = POST_EXCERPT_MAP[slug] || translateText(String(metadata.excerpt || `${slugToReadableTitle(slug)} の要点を日本語で整理します。`));
  const lines = content.split("\n");
  const bulletPoints = lines
    .filter((line) => /^[-*]\s+/.test(line.trim()))
    .map((line) => translateText(line.replace(/^[-*]\s+/, "").trim()))
    .filter(Boolean)
    .slice(0, 4);

  const headings = lines
    .filter((line) => /^(##|###)\s+/.test(line.trim()))
    .map((line) => line.replace(/^(##|###)\s+/, "").trim())
    .slice(0, 4);

  const paragraphs = lines
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !/^(#|##|###|\*|-|\|)/.test(line))
    .slice(0, 6)
    .map((line) => translateText(line));

  const summaryPoints = bulletPoints.length > 0
    ? bulletPoints
    : [
        "比較時は料金、用途、導入しやすさを優先して見ると判断しやすくなります。",
        "英語圏の記事の論点を、日本語ユーザー向けに再整理しています。",
        "実際の導入前には公式情報で最新仕様を確認してください。",
      ];

  const sectionBlocks = headings.map((heading, index) => {
    const paragraph = paragraphs[index] || "このトピックでは、導入判断や比較の観点から見るべきポイントを整理しています。";
    return `### ${translateText(heading)}\n\n${paragraph}`;
  });

  const tags = Array.isArray(metadata.tags) ? metadata.tags.map((tag) => TAG_MAP[String(tag)] || String(tag)) : [];
  const audience = tags.length > 0 ? tags.join("、") : "AIツール比較";

  return [
    `${excerpt}`,
    "",
    "この日本語版では、英語記事の論点をもとに、日本語ユーザーが比較や導入判断に使いやすい形で要点をまとめています。",
    "",
    "## この記事の要点",
    "",
    ...summaryPoints.map((point) => `* ${point}`),
    "",
    "## 注目ポイント",
    "",
    ...(sectionBlocks.length > 0
      ? sectionBlocks
      : ["### ポイント整理\n\n導入目的と予算、求めるワークフローを明確にすると比較しやすくなります。"]),
    "",
    "## こんな人に向いています",
    "",
    `* ${audience} に関心がある人`,
    "* 海外発のAIツール情報を日本語で素早く把握したい人",
    "* 比較ページやカテゴリLPに進む前に論点を整理しておきたい人",
    "",
    "## まとめ",
    "",
    "個別ツールの導入判断では、話題性よりも実務での再現性と継続コストが重要です。比較ページやカテゴリLPもあわせて確認し、最終的には公式情報を基準に判断してください。",
  ].join("\n");
}

function stringifyMarkdown(data: Record<string, unknown>, content: string): string {
  return matter.stringify(content, sanitizeData(data));
}

function sanitizeData<T>(value: T): T {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10) as T;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => sanitizeData(item))
      .filter((item) => item !== undefined) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, sanitizeData(item)])
    ) as T;
  }

  return value;
}

function buildToolData(metadata: Record<string, unknown>) {
  return {
    ...metadata,
    description: translateText(String(metadata.description || "")),
    pros: translateList(Array.isArray(metadata.pros) ? metadata.pros.map(String) : []) || metadata.pros,
    cons: translateList(Array.isArray(metadata.cons) ? metadata.cons.map(String) : []) || metadata.cons,
  };
}

function buildPostData(slug: string, metadata: Record<string, unknown>) {
  return {
    ...metadata,
    title: POST_TITLE_MAP[slug] || translateText(String(metadata.title || slugToReadableTitle(slug))),
    author: "AI Tool Navigator 編集部",
    excerpt: POST_EXCERPT_MAP[slug] || translateText(String(metadata.excerpt || "")),
    tags: Array.isArray(metadata.tags) ? metadata.tags.map((tag) => TAG_MAP[String(tag)] || String(tag)) : metadata.tags,
  };
}

function generateMissingToolFiles() {
  ensureDir(TOOL_TARGET_DIR);
  const missingFiles = listMissingMarkdownFiles(TOOL_SOURCE_DIR, TOOL_TARGET_DIR);

  missingFiles.forEach((fileName) => {
    const sourcePath = path.join(TOOL_SOURCE_DIR, fileName);
    const targetPath = path.join(TOOL_TARGET_DIR, fileName);
    const fileContents = fs.readFileSync(sourcePath, "utf8");
    const parsed = matter(fileContents);
    const data = buildToolData(parsed.data as Record<string, unknown>);
    const body = buildToolBody(data);

    fs.writeFileSync(targetPath, stringifyMarkdown(data, body));
  });

  return missingFiles.length;
}

function generateMissingPostFiles() {
  ensureDir(POST_TARGET_DIR);
  const missingFiles = listMissingMarkdownFiles(POST_SOURCE_DIR, POST_TARGET_DIR);

  missingFiles.forEach((fileName) => {
    const slug = fileName.replace(/\.md$/, "");
    const sourcePath = path.join(POST_SOURCE_DIR, fileName);
    const targetPath = path.join(POST_TARGET_DIR, fileName);
    const fileContents = fs.readFileSync(sourcePath, "utf8");
    const parsed = matter(fileContents);
    const data = buildPostData(slug, parsed.data as Record<string, unknown>);
    const body = buildPostBody(slug, parsed.data as Record<string, unknown>, parsed.content);

    fs.writeFileSync(targetPath, stringifyMarkdown(data, body));
  });

  return missingFiles.length;
}

function main() {
  const generatedTools = generateMissingToolFiles();
  const generatedPosts = generateMissingPostFiles();

  console.log(
    JSON.stringify(
      {
        generatedTools,
        generatedPosts,
      },
      null,
      2
    )
  );
}

main();
