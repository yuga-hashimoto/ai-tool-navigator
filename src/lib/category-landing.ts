type SupportedLocale = "en" | "ja";

interface FAQItem {
  question: string;
  answer: string;
}

interface CategoryLandingCopy {
  intro: string;
  selectionPoints: string[];
  faqs: FAQItem[];
}

type LocalizedCategoryGuide = Record<SupportedLocale, CategoryLandingCopy>;

const CATEGORY_GUIDES: Partial<Record<string, LocalizedCategoryGuide>> = {
  coding: {
    en: {
      intro:
        "The best coding tools do more than autocomplete. They need to understand large repositories, keep refactors consistent across files, and fit your team's security and budget constraints.",
      selectionPoints: [
        "Check whether the tool can work across multiple files, tests, and pull-request review workflows.",
        "Prioritize products with transparent limits on context size, usage caps, and enterprise controls.",
        "Compare total cost by seat and by usage so the tool still scales after pilot adoption.",
      ],
      faqs: [
        {
          question: "What should I compare first for AI coding tools?",
          answer:
            "Start with code quality, repository awareness, and how well the assistant handles debugging and review tasks inside your existing workflow.",
        },
        {
          question: "Are free AI coding tools enough for production work?",
          answer:
            "Free plans are fine for evaluation, but production teams usually need stronger context windows, collaboration controls, and predictable limits.",
        },
        {
          question: "Should I choose a chat model or an IDE-native coding tool?",
          answer:
            "Choose IDE-native tools for daily implementation work and generalized chat tools when research, planning, and documentation matter equally.",
        },
      ],
    },
    ja: {
      intro:
        "AIコーディングツールは、単なる補完精度だけでは差がつきません。大規模コードベースの理解、複数ファイル編集、レビュー工程との相性まで見て選ぶ必要があります。",
      selectionPoints: [
        "複数ファイル編集、テスト実行、PRレビューまで一連の開発フローに入れられるかを確認する。",
        "コンテキスト上限、利用制限、セキュリティ制御が明示されているかを優先して見る。",
        "席課金と従量課金の両方を比較し、試験導入後もスケールする料金かを見極める。",
      ],
      faqs: [
        {
          question: "AIコーディングツールは何を最優先で比較すべきですか？",
          answer:
            "まずはコード品質、リポジトリ理解、デバッグやレビューまで一貫して使えるかを比較するのが重要です。",
        },
        {
          question: "無料プランでも実務利用できますか？",
          answer:
            "評価目的には十分ですが、本番運用では長いコンテキスト、チーム管理、安定した上限設定が必要になることが多いです。",
        },
        {
          question: "チャット型とIDE統合型はどちらが向いていますか？",
          answer:
            "日々の実装が中心ならIDE統合型、調査や設計、文章化まで含めたいなら汎用チャット型も有力です。",
        },
      ],
    },
  },
  video: {
    en: {
      intro:
        "Video generators differ most in motion quality, editing control, and how quickly you can iterate from prompt to publishable footage. Short demos and real pricing matter more than headline claims.",
      selectionPoints: [
        "Compare output quality for people, camera motion, and consistency across longer sequences.",
        "Look at editing features such as storyboard control, aspect ratio options, and export quality.",
        "Review pricing by credit usage so high-volume production does not become unexpectedly expensive.",
      ],
      faqs: [
        {
          question: "What makes one AI video tool better than another?",
          answer:
            "The practical difference comes from motion realism, controllability, rendering speed, and how much post-editing is required after generation.",
        },
        {
          question: "Do I need an all-in-one editor or a generator?",
          answer:
            "Choose a generator if ideation speed is the priority. Choose an editor-focused tool when you need repeatable brand assets and post-production controls.",
        },
        {
          question: "How should I compare pricing for video tools?",
          answer:
            "Check the number of credits per clip, output length, resolution limits, and whether commercial usage is included on the plan you need.",
        },
      ],
    },
    ja: {
      intro:
        "AI動画生成ツールは、見た目の派手さよりも、動きの自然さ、編集自由度、量産時のコストで差が出ます。デモ映像と実際の料金をセットで比較するのが重要です。",
      selectionPoints: [
        "人物の破綻、カメラワーク、長めのシーンでも一貫性が保てるかを見る。",
        "ストーリーボード指定、アスペクト比、書き出し品質など編集面の自由度を比較する。",
        "クレジット消費量を確認し、量産運用で費用が膨らまないかを見積もる。",
      ],
      faqs: [
        {
          question: "AI動画ツールは何で差がつきますか？",
          answer:
            "実務では、動きの自然さ、制御しやすさ、生成速度、そして生成後にどれだけ修正が必要かで差が出ます。",
        },
        {
          question: "生成特化型と編集特化型はどちらを選ぶべきですか？",
          answer:
            "アイデアの試作速度を重視するなら生成特化型、ブランド動画を継続制作するなら編集機能が強いツールが向いています。",
        },
        {
          question: "料金比較で見るべきポイントは？",
          answer:
            "1本あたりのクレジット消費、出力時間、解像度上限、商用利用可否まで確認すると判断しやすくなります。",
        },
      ],
    },
  },
  writing: {
    en: {
      intro:
        "Writing assistants should be judged on output quality, brand consistency, and editing workflow, not just speed. The right tool depends on whether you need drafts, SEO content, or polished copy.",
      selectionPoints: [
        "Compare how well each tool matches tone, style guides, and structured content briefs.",
        "Check for collaboration features, version control, and workflow integrations for publishing teams.",
        "Validate whether the tool supports factual review and citation workflows before scaling content production.",
      ],
      faqs: [
        {
          question: "Which AI writing tool is best for SEO content?",
          answer:
            "The best option is the one that balances briefing support, outline quality, and editorial controls rather than only producing large volumes quickly.",
        },
        {
          question: "Can AI writing tools replace human editors?",
          answer:
            "No. They speed up research and drafting, but human review is still needed for accuracy, positioning, and brand voice.",
        },
        {
          question: "What should teams compare beyond text quality?",
          answer:
            "Look at workflow integrations, collaboration controls, export options, and the cost of maintaining quality at scale.",
        },
      ],
    },
    ja: {
      intro:
        "AIライティングツールは、生成速度だけでなく、ブランドトーンの再現性や編集ワークフローへの組み込みやすさで選ぶべきです。下書き重視かSEO運用重視かで最適解が変わります。",
      selectionPoints: [
        "トーン、表記ルール、構成指示にどこまで忠実に従えるかを比較する。",
        "共同編集、履歴管理、CMS連携など運用面の機能を確認する。",
        "事実確認や引用確認の工程をどう組み込めるかを見て、量産時の品質を担保する。",
      ],
      faqs: [
        {
          question: "SEO記事向けのAIライティングツールは何を見て選ぶべきですか？",
          answer:
            "大量生成の速さよりも、ブリーフ対応、構成品質、編集コントロールのしやすさで選ぶ方が運用では安定します。",
        },
        {
          question: "AIライティングツールだけで記事を公開しても大丈夫ですか？",
          answer:
            "そのまま公開するのは避けるべきです。正確性、独自性、ブランド表現の担保には人のレビューが必要です。",
        },
        {
          question: "本文品質以外で比較するポイントは？",
          answer:
            "共同作業機能、エクスポート性、CMS連携、そして品質維持に必要な運用コストまで比較すると失敗しにくくなります。",
        },
      ],
    },
  },
  marketing: {
    en: {
      intro:
        "Marketing tools succeed when they connect research, copy, and execution. Compare analytics depth, campaign automation, and how easily you can turn insights into measurable actions.",
      selectionPoints: [
        "Measure how well the tool covers the full workflow from research and planning to launch and reporting.",
        "Check whether landing pages, ads, and CRM data can be connected without manual copy-paste work.",
        "Compare attribution and reporting quality so the tool contributes to revenue, not just content volume.",
      ],
      faqs: [
        {
          question: "What is the biggest difference between AI marketing tools?",
          answer:
            "The biggest gap is usually between tools that only generate assets and tools that also provide analytics, workflow automation, and attribution.",
        },
        {
          question: "Can one AI marketing tool replace my stack?",
          answer:
            "Usually not. Most teams still combine a research platform, content generator, and distribution or CRM tools.",
        },
        {
          question: "How should I evaluate ROI for marketing software?",
          answer:
            "Track time saved, campaign velocity, improvement in conversion metrics, and the reporting clarity needed to justify spend.",
        },
      ],
    },
    ja: {
      intro:
        "AIマーケティングツールは、文章生成だけでなく、調査、実行、分析までつながって初めて価値が出ます。施策を売上に結びつけられるかで比較するのが重要です。",
      selectionPoints: [
        "調査、企画、配信、レポートまで一連の運用をどこまでカバーできるかを見る。",
        "LP、広告、CRMデータを手作業なしでつなげられるかを確認する。",
        "成果計測やアトリビューションの精度を見て、単なる生成ツールで終わらないかを判断する。",
      ],
      faqs: [
        {
          question: "AIマーケティングツールは何が一番違いますか？",
          answer:
            "大きな差は、素材生成だけで終わるか、分析・自動化・成果計測まで含めて支援できるかにあります。",
        },
        {
          question: "1つのツールだけでマーケティング運用は完結しますか？",
          answer:
            "多くの場合は難しく、調査、制作、配信やCRMを組み合わせる構成になります。",
        },
        {
          question: "ROIはどう評価すればいいですか？",
          answer:
            "削減できた工数、施策の立ち上がり速度、CV改善幅、そしてレポートの分かりやすさをセットで見ると判断しやすいです。",
        },
      ],
    },
  },
  llm: {
    en: {
      intro:
        "General-purpose AI assistants should be compared by reasoning quality, multimodal capability, reliability, and pricing. The best model depends on whether you prioritize research, coding, analysis, or broad everyday use.",
      selectionPoints: [
        "Compare reasoning quality on your real tasks instead of relying only on benchmark summaries.",
        "Review multimodal support, memory, and document handling for the workflows you actually run.",
        "Assess pricing, rate limits, and data policies before rolling a model out to a team.",
      ],
      faqs: [
        {
          question: "How do I compare large language models fairly?",
          answer:
            "Run the same prompts across research, drafting, and structured problem-solving tasks, then evaluate quality, consistency, and latency together.",
        },
        {
          question: "Does a larger context window always mean a better model?",
          answer:
            "No. Large context is useful, but reasoning quality, tool use, and response reliability often matter more in practice.",
        },
        {
          question: "Should I optimize for price or quality first?",
          answer:
            "Start with the minimum quality needed for your workflow, then compare cost at the usage level you expect after adoption.",
        },
      ],
    },
    ja: {
      intro:
        "汎用LLMは、推論力、マルチモーダル性能、安定性、料金体系で比較するのが基本です。調査重視か、コーディング重視か、日常利用重視かで最適なモデルは変わります。",
      selectionPoints: [
        "ベンチマークだけでなく、自社の実タスクで同じプロンプトを流して品質を比べる。",
        "画像や文書の扱い、メモリ機能、ツール連携が運用に合うかを確認する。",
        "チーム導入前に料金、レート制限、データポリシーまで確認する。",
      ],
      faqs: [
        {
          question: "LLMはどう比較すると公平ですか？",
          answer:
            "調査、下書き、構造化推論など同じ実務タスクで横並びに評価し、品質と応答速度をまとめて見るのが有効です。",
        },
        {
          question: "コンテキストウィンドウが大きいほど優秀ですか？",
          answer:
            "必ずしもそうではありません。長文処理は強みですが、実務では推論の正確さやツール利用の安定性も同じくらい重要です。",
        },
        {
          question: "価格と品質はどちらを優先すべきですか？",
          answer:
            "まず必要品質の下限を決め、そのうえで実際の利用量に対する総コストを比較するのが現実的です。",
        },
      ],
    },
  },
  automation: {
    en: {
      intro:
        "Automation platforms should be judged by how safely they connect systems, how much human review they support, and how reliably they handle exceptions. Speed alone is not enough when workflows touch customers or revenue.",
      selectionPoints: [
        "Review the quality of integrations, trigger options, and fallback handling for failed steps.",
        "Check whether humans can approve, edit, or stop workflows before sensitive actions run.",
        "Compare pricing based on task volume and active automation count, not just entry plan cost.",
      ],
      faqs: [
        {
          question: "What makes an AI automation tool safe to deploy?",
          answer:
            "Safe tools provide approval gates, audit trails, clear logs, and reliable handling when integrations fail or inputs change unexpectedly.",
        },
        {
          question: "Do AI automations need human review?",
          answer:
            "Yes, especially for workflows that touch billing, customer messaging, compliance, or data updates across multiple systems.",
        },
        {
          question: "How should I compare automation pricing?",
          answer:
            "Look at task limits, execution volume, connected apps, and how much oversight time each workflow still requires.",
        },
      ],
    },
    ja: {
      intro:
        "AI自動化ツールは、連携の広さだけでなく、安全に止められるか、例外処理に強いかまで見て評価する必要があります。顧客対応や売上に触れる業務では特に重要です。",
      selectionPoints: [
        "連携先の豊富さだけでなく、失敗時のフォールバックやログの見やすさを確認する。",
        "重要な処理の前に人が承認・修正・停止できる設計かを見る。",
        "初期プランの安さではなく、実行回数と自動化本数が増えた時の料金で比較する。",
      ],
      faqs: [
        {
          question: "AI自動化ツールで安全性はどう見ればいいですか？",
          answer:
            "承認フロー、監査ログ、エラー時の通知、連携失敗時の挙動が明確かを見ると判断しやすいです。",
        },
        {
          question: "自動化でも人の確認は必要ですか？",
          answer:
            "請求、顧客連絡、コンプライアンス、基幹データ更新に関わるフローでは人の確認を残すのが基本です。",
        },
        {
          question: "価格比較では何を見ればいいですか？",
          answer:
            "タスク上限、実行量、接続アプリ数、そして運用に残る手動チェック工数まで含めて比較すると現実的です。",
        },
      ],
    },
  },
  search: {
    en: {
      intro:
        "AI search tools are strongest when they reduce verification time without hiding sources. Compare citation quality, freshness, and how well each product supports deep research workflows.",
      selectionPoints: [
        "Test whether citations are clear, recent, and easy to verify from the original source.",
        "Check how well the tool handles follow-up questions, file uploads, and long research threads.",
        "Compare export options so findings can move into docs, briefs, or client deliverables quickly.",
      ],
      faqs: [
        {
          question: "What matters most for AI search tools?",
          answer:
            "Citation quality and source transparency matter most, followed by freshness, follow-up capability, and how much manual checking is still required.",
        },
        {
          question: "Can AI search replace manual research?",
          answer:
            "It can accelerate discovery and summarization, but high-stakes work still requires checking the original sources directly.",
        },
        {
          question: "How should teams evaluate search tools?",
          answer:
            "Run the same research brief across several tools and compare relevance, citations, speed, and how usable the exported output is.",
        },
      ],
    },
    ja: {
      intro:
        "AI検索ツールは、答えの速さよりも、一次情報へ戻りやすいか、検証コストをどれだけ減らせるかで選ぶべきです。引用品質と情報鮮度が実務では重要です。",
      selectionPoints: [
        "引用元が明確で、一次情報にすぐ戻れるかを最優先で確認する。",
        "追加質問、ファイル読込、長い調査スレッドにどこまで耐えられるかを比較する。",
        "出力をメモや提案書へ転用しやすいエクスポート性も確認する。",
      ],
      faqs: [
        {
          question: "AI検索ツールは何を最重視して比べるべきですか？",
          answer:
            "最重要なのは引用品質と出典の透明性です。そのうえで鮮度、追加質問への強さ、検証に必要な手間を見ます。",
        },
        {
          question: "AI検索だけで調査を完結していいですか？",
          answer:
            "下調べや要約には有効ですが、重要な意思決定では一次情報を直接確認する工程が必要です。",
        },
        {
          question: "チーム導入前の比較方法は？",
          answer:
            "同じ調査ブリーフを複数ツールで試し、関連性、引用、速度、出力の使いやすさを横並びで見ると判断しやすいです。",
        },
      ],
    },
  },
};

function buildGenericGuide(title: string, locale: SupportedLocale): CategoryLandingCopy {
  if (locale === "ja") {
    return {
      intro: `${title}を選ぶときは、機能一覧だけでなく、実運用で使う業務フロー、料金、更新頻度までまとめて比較するのが重要です。`,
      selectionPoints: [
        "導入前に、日常業務のどの工程を短縮したいのかを明確にする。",
        "無料枠だけでなく、本格運用時の料金と制限を確認する。",
        "公式情報や更新日が追いやすいツールを優先して比較する。",
      ],
      faqs: [
        {
          question: `${title}はどう選べばいいですか？`,
          answer:
            "自分の用途に近い業務フローで試し、機能、料金、更新のしやすさをセットで比較するのが基本です。",
        },
        {
          question: "無料プランだけで判断してもいいですか？",
          answer:
            "評価には役立ちますが、本番運用では上限や商用利用条件が変わるため、有料プラン前提でも確認した方が安全です。",
        },
        {
          question: "比較時に見るべき共通ポイントは？",
          answer:
            "機能差だけでなく、信頼性、導入しやすさ、チームでの運用コストまで見ると失敗しにくくなります。",
        },
      ],
    };
  }

  return {
    intro: `When reviewing ${title}, compare real workflow fit, pricing, and update cadence instead of relying on feature lists alone.`,
    selectionPoints: [
      "Define the workflow you want to accelerate before comparing feature checklists.",
      "Check paid-plan limits and commercial usage rules, not just the free tier.",
      "Prioritize tools with clear source material, maintenance signals, and recent updates.",
    ],
    faqs: [
      {
        question: `How should I choose ${title}?`,
        answer:
          "Test tools against the actual workflow you want to improve, then compare features, pricing, and reliability together.",
      },
      {
        question: "Is the free plan enough to evaluate a tool?",
        answer:
          "Free plans are useful for evaluation, but production decisions should also consider usage caps, support, and commercial terms.",
      },
      {
        question: "What common factors matter across categories?",
        answer:
          "Look beyond features and compare trustworthiness, operational fit, and the total cost of running the tool over time.",
      },
    ],
  };
}

export function getCategoryLandingContent(
  slug: string,
  locale: SupportedLocale,
  title: string
): CategoryLandingCopy {
  return CATEGORY_GUIDES[slug]?.[locale] ?? buildGenericGuide(title, locale);
}
