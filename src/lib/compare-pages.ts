export interface ComparePreset {
  slug: string;
  toolSlugs: string[];
  title: {
    en: string;
    ja: string;
  };
  description: {
    en: string;
    ja: string;
  };
  intro: {
    en: string;
    ja: string;
  };
  faqs: Array<{
    question: {
      en: string;
      ja: string;
    };
    answer: {
      en: string;
      ja: string;
    };
  }>;
}

function sanitizeComparisonSlugs(toolSlugs: string[]): string[] {
  return Array.from(
    new Set(
      toolSlugs
        .map((slug) => slug.trim())
        .filter(Boolean)
    )
  ).slice(0, 4);
}

export function buildComparisonSlug(toolSlugs: string[]): string {
  return sanitizeComparisonSlugs(toolSlugs).join("-vs-");
}

export function parseComparisonSlug(slug: string): string[] {
  return sanitizeComparisonSlugs(
    slug
    .split("-vs-")
    .map((part) => part.trim())
    .filter(Boolean)
  );
}

export const COMPARE_PRESETS: ComparePreset[] = [
  {
    slug: buildComparisonSlug(["chatgpt", "claude", "perplexity"]),
    toolSlugs: ["chatgpt", "claude", "perplexity"],
    title: {
      en: "ChatGPT vs Claude vs Perplexity",
      ja: "ChatGPT vs Claude vs Perplexity",
    },
    description: {
      en: "Compare the three most common general-purpose AI assistants for research, drafting, and daily work.",
      ja: "調査、執筆、日常業務で使われる主要AIアシスタント3種を比較します。",
    },
    intro: {
      en: "This comparison is designed for teams choosing a default assistant for everyday work. The practical differences usually come down to reasoning quality, research workflow, and source transparency.",
      ja: "日常業務の標準AIアシスタントを選ぶときの比較ページです。実務では、推論品質、調査フロー、出典の透明性で差が出ます。",
    },
    faqs: [
      {
        question: {
          en: "Which of these tools is best for general office work?",
          ja: "日常業務全般ではどれが向いていますか？",
        },
        answer: {
          en: "Choose the tool that best balances drafting quality, source reliability, and the workflow integrations your team actually needs.",
          ja: "文章品質、出典の信頼性、そしてチームで必要な連携機能のバランスで選ぶのが実務的です。",
        },
      },
      {
        question: {
          en: "Should I optimize for research or writing first?",
          ja: "調査重視と執筆重視のどちらを優先すべきですか？",
        },
        answer: {
          en: "Start from the dominant workflow. Research-heavy teams care more about citations, while writing-heavy teams care more about editing speed and tone control.",
          ja: "主業務から決めるのが基本です。調査中心なら引用品質、執筆中心なら編集速度とトーン再現性が重要です。",
        },
      },
    ],
  },
  {
    slug: buildComparisonSlug(["chatgpt", "cursor", "claude"]),
    toolSlugs: ["chatgpt", "cursor", "claude"],
    title: {
      en: "ChatGPT vs Cursor vs Claude for coding",
      ja: "ChatGPT vs Cursor vs Claude のコーディング比較",
    },
    description: {
      en: "A practical coding comparison for teams deciding between IDE-native assistance and general-purpose reasoning models.",
      ja: "IDE統合型と汎用推論型のどちらを主軸にするかを判断するための比較ページです。",
    },
    intro: {
      en: "Engineering teams rarely need one model for everything. This page focuses on where repo awareness, review speed, and reasoning depth change the decision.",
      ja: "開発チームでは1つのモデルですべてを賄うより、用途ごとに最適化する方が現実的です。ここではリポジトリ理解、レビュー速度、推論の深さを軸に比べます。",
    },
    faqs: [
      {
        question: {
          en: "What matters most when comparing coding assistants?",
          ja: "コーディング支援ツールは何を軸に比べるべきですか？",
        },
        answer: {
          en: "Repository awareness, multi-file edit quality, and how well the tool fits review and debugging workflows matter most.",
          ja: "リポジトリ理解、複数ファイル編集の精度、レビューやデバッグ工程との相性が最重要です。",
        },
      },
      {
        question: {
          en: "Is an IDE-native tool always better than a chat model?",
          ja: "IDE統合型は常にチャット型より優れていますか？",
        },
        answer: {
          en: "Not always. IDE-native tools are stronger for daily implementation, while general chat models are still useful for planning, architecture, and documentation.",
          ja: "必ずしもそうではありません。日々の実装はIDE統合型が強い一方、設計や調査、文書化では汎用チャット型も有効です。",
        },
      },
    ],
  },
  {
    slug: buildComparisonSlug(["sora-2", "runway-gen-3", "luma-dream-machine"]),
    toolSlugs: ["sora-2", "runway-gen-3", "luma-dream-machine"],
    title: {
      en: "Sora 2 vs Runway Gen-3 vs Luma Dream Machine",
      ja: "Sora 2 vs Runway Gen-3 vs Luma Dream Machine",
    },
    description: {
      en: "Compare leading AI video tools on motion quality, controllability, and production cost.",
      ja: "主要AI動画ツールを、動きの品質、制御性、制作コストで比較します。",
    },
    intro: {
      en: "Video tools look similar at first glance, but real production differences show up in prompt control, rendering consistency, and cost per usable clip.",
      ja: "AI動画ツールは一見似ていますが、実務ではプロンプト制御、出力の一貫性、使える尺あたりのコストで差が出ます。",
    },
    faqs: [
      {
        question: {
          en: "Which metric matters most for video generators?",
          ja: "動画生成ツールで最も重要な比較軸は何ですか？",
        },
        answer: {
          en: "Useable output rate matters most: how often a generated clip is good enough to publish or edit with minimal fixes.",
          ja: "最も重要なのは実用出力率です。生成したクリップがどれだけ少ない修正で使えるかが差になります。",
        },
      },
      {
        question: {
          en: "Should I compare by headline quality or workflow fit?",
          ja: "見栄えよりワークフロー適合を重視すべきですか？",
        },
        answer: {
          en: "Workflow fit is the better decision metric. Export options, shot control, and credit usage usually matter more than demo clips.",
          ja: "はい。書き出し形式、ショット制御、クレジット消費の方が、デモ映像の見栄えより実務では重要です。",
        },
      },
    ],
  },
];

export function getComparePresetBySlug(slug: string): ComparePreset | null {
  return COMPARE_PRESETS.find((preset) => preset.slug === slug) || null;
}

export function getComparisonHref(toolSlugs: string[]): string {
  const cleanedSlugs = sanitizeComparisonSlugs(toolSlugs);

  if (cleanedSlugs.length === 0) {
    return "/compare";
  }

  const preset = COMPARE_PRESETS.find(
    (candidate) =>
      candidate.toolSlugs.length === cleanedSlugs.length &&
      candidate.toolSlugs.every((slug) => cleanedSlugs.includes(slug))
  );

  if (preset) {
    return `/compare/${preset.slug}`;
  }

  return `/compare?tools=${cleanedSlugs.join(",")}`;
}
