import crypto from "crypto";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { filterToolList, sortToolsForEditorialLists } from "./editorial";

const TOOLS_DIRECTORY = path.join(process.cwd(), "content", "tools");
const DATA_DIRECTORY = path.join(process.cwd(), "data");
const CONTENT_SYNC_STATE_FILE = path.join(DATA_DIRECTORY, "content-sync-state.json");
const CONTENT_SYNC_REPORTS_DIRECTORY = path.join(DATA_DIRECTORY, "content-sync-reports");
const LATEST_REPORT_FILE = path.join(CONTENT_SYNC_REPORTS_DIRECTORY, "latest.json");
const DEFAULT_TIMEOUT_MS = 15000;
const HASH_INPUT_LIMIT = 50000;
const EXCERPT_LIMIT = 1200;
const MAX_REPORT_HISTORY = 20;

type SyncItemStatus = "initial" | "updated" | "unchanged" | "error";

interface ToolSyncTarget {
  slug: string;
  title: string;
  sourceUrl: string;
  verified?: boolean;
  last_updated?: string;
}

export interface ContentSyncSnapshot {
  slug: string;
  sourceUrl: string;
  finalUrl: string;
  title: string;
  pageTitle?: string;
  heading?: string;
  excerpt: string;
  hash: string;
  wordCount: number;
  keywordSignals: string[];
  pricingSignals: string[];
  statusCode: number;
  fetchedAt: string;
  lastCheckedAt: string;
  lastChangedAt: string;
  lastSummary?: string;
  lastHighlights?: string[];
}

export interface ContentSyncReportItem {
  slug: string;
  title: string;
  sourceUrl: string;
  finalUrl?: string;
  status: SyncItemStatus;
  summary: string;
  highlights: string[];
  usedLlm: boolean;
  httpStatus?: number;
  fetchedAt?: string;
  previousHash?: string;
  currentHash?: string;
  error?: string;
}

export interface ContentSyncReport {
  id: string;
  generatedAt: string;
  locale: string;
  filters: {
    slugs?: string[];
    limit?: number;
    force: boolean;
    useLlm: boolean;
  };
  totals: {
    targets: number;
    processed: number;
    changed: number;
    unchanged: number;
    errors: number;
  };
  items: ContentSyncReportItem[];
}

interface ContentSyncState {
  version: number;
  updatedAt: string;
  lastReportId?: string;
  snapshots: Record<string, ContentSyncSnapshot>;
  reports: Array<{
    id: string;
    generatedAt: string;
    locale: string;
    changed: number;
    unchanged: number;
    errors: number;
  }>;
}

interface DiffSummary {
  summary: string;
  highlights: string[];
}

const CHANGE_KEYWORDS = [
  "pricing",
  "price",
  "plan",
  "billing",
  "credit",
  "release",
  "launch",
  "feature",
  "update",
  "api",
  "docs",
  "documentation",
  "security",
  "enterprise",
  "integration",
  "model",
  "beta",
];

function ensureContentSyncPaths() {
  if (!fs.existsSync(DATA_DIRECTORY)) {
    fs.mkdirSync(DATA_DIRECTORY, { recursive: true });
  }

  if (!fs.existsSync(CONTENT_SYNC_REPORTS_DIRECTORY)) {
    fs.mkdirSync(CONTENT_SYNC_REPORTS_DIRECTORY, { recursive: true });
  }
}

function createEmptyState(): ContentSyncState {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    snapshots: {},
    reports: [],
  };
}

function readContentSyncState(): ContentSyncState {
  ensureContentSyncPaths();

  if (!fs.existsSync(CONTENT_SYNC_STATE_FILE)) {
    const initialState = createEmptyState();
    fs.writeFileSync(CONTENT_SYNC_STATE_FILE, JSON.stringify(initialState, null, 2));
    return initialState;
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(CONTENT_SYNC_STATE_FILE, "utf8")) as ContentSyncState;
    if (!parsed.snapshots || !Array.isArray(parsed.reports)) {
      throw new Error("Invalid content sync state");
    }
    return parsed;
  } catch {
    const repairedState = createEmptyState();
    fs.writeFileSync(CONTENT_SYNC_STATE_FILE, JSON.stringify(repairedState, null, 2));
    return repairedState;
  }
}

function writeContentSyncState(state: ContentSyncState) {
  ensureContentSyncPaths();
  state.updatedAt = new Date().toISOString();
  fs.writeFileSync(CONTENT_SYNC_STATE_FILE, JSON.stringify(state, null, 2));
}

function writeContentSyncReport(report: ContentSyncReport) {
  ensureContentSyncPaths();
  fs.writeFileSync(LATEST_REPORT_FILE, JSON.stringify(report, null, 2));
  fs.writeFileSync(
    path.join(CONTENT_SYNC_REPORTS_DIRECTORY, `${report.id}.json`),
    JSON.stringify(report, null, 2)
  );
}

function isHttpUrl(value: string | undefined): value is string {
  return Boolean(value && /^https?:\/\//i.test(value));
}

function decodeHtmlEntities(value: string): string {
  const namedEntities: Record<string, string> = {
    "&amp;": "&",
    "&quot;": '"',
    "&#39;": "'",
    "&apos;": "'",
    "&lt;": "<",
    "&gt;": ">",
    "&nbsp;": " ",
  };

  let output = value.replace(
    /&(amp|quot|#39|apos|lt|gt|nbsp);/g,
    (match) => namedEntities[match] || match
  );

  output = output.replace(/&#(\d+);/g, (match, codePoint) => {
    const parsed = Number.parseInt(codePoint, 10);
    return Number.isNaN(parsed) ? match : String.fromCodePoint(parsed);
  });
  output = output.replace(/&#x([\da-f]+);/gi, (match, codePoint) => {
    const parsed = Number.parseInt(codePoint, 16);
    return Number.isNaN(parsed) ? match : String.fromCodePoint(parsed);
  });

  return output;
}

function stripHtml(html: string): string {
  const withoutScripts = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");

  return decodeHtmlEntities(withoutScripts.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function extractTagContent(html: string, tagName: string): string | undefined {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i");
  const match = html.match(regex);
  if (!match?.[1]) {
    return undefined;
  }

  return stripHtml(match[1]).slice(0, 200) || undefined;
}

function extractPricingSignals(text: string): string[] {
  const matches = text.match(
    /(?:[$€¥£]\s?\d[\d.,]*(?:\s*\/\s*(?:month|mo|year|yr|seat|token|credit|week))?|\b\d[\d.,]*\s?(?:usd|jpy|eur|credits?|tokens?)\b)/gi
  );

  if (!matches) {
    return [];
  }

  return Array.from(new Set(matches.map((value) => value.trim()))).slice(0, 8);
}

function extractKeywordSignals(text: string): string[] {
  const lower = text.toLowerCase();
  return CHANGE_KEYWORDS.filter((keyword) => lower.includes(keyword)).slice(0, 10);
}

function buildHashInput(pageTitle: string | undefined, heading: string | undefined, text: string): string {
  return [pageTitle || "", heading || "", text.slice(0, HASH_INPUT_LIMIT)].join("\n");
}

function createHash(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function formatPercentDelta(value: number): string {
  return `${value > 0 ? "+" : ""}${Math.round(value)}%`;
}

function readToolSyncTargets(locale: string): ToolSyncTarget[] {
  const enDirectory = path.join(TOOLS_DIRECTORY, "en");

  if (!fs.existsSync(enDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(enDirectory).filter((fileName) => fileName.endsWith(".md")).sort();

  const targets = fileNames.map((fileName) => {
    const localizedPath = path.join(TOOLS_DIRECTORY, locale, fileName);
    const fallbackPath = path.join(enDirectory, fileName);
    const fullPath = fs.existsSync(localizedPath) ? localizedPath : fallbackPath;
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data } = matter(fileContents);
    const slug = fileName.replace(/\.md$/, "");

    return {
      slug,
      title: typeof data.title === "string" ? data.title : slug,
      sourceUrl: typeof data.affiliate_link === "string" ? data.affiliate_link : "",
      verified: Boolean(data.verified),
      last_updated: typeof data.last_updated === "string" ? data.last_updated : undefined,
    };
  });

  return filterToolList(targets.filter((target) => isHttpUrl(target.sourceUrl))).sort(sortToolsForEditorialLists);
}

async function fetchSyncSnapshot(target: ToolSyncTarget, timeoutMs: number): Promise<Omit<ContentSyncSnapshot, "lastCheckedAt" | "lastChangedAt">> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(target.sourceUrl, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
        accept: "text/html,application/xhtml+xml",
        "accept-language": "en-US,en;q=0.9,ja;q=0.8",
      },
      redirect: "follow",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} while fetching ${target.sourceUrl}`);
    }

    const html = await response.text();
    const pageTitle = extractTagContent(html, "title");
    const heading = extractTagContent(html, "h1");
    const textContent = stripHtml(html);
    const excerpt = textContent.slice(0, EXCERPT_LIMIT);

    return {
      slug: target.slug,
      sourceUrl: target.sourceUrl,
      finalUrl: response.url || target.sourceUrl,
      title: target.title,
      pageTitle,
      heading,
      excerpt,
      hash: createHash(buildHashInput(pageTitle, heading, textContent)),
      wordCount: textContent.length === 0 ? 0 : textContent.split(/\s+/).length,
      keywordSignals: extractKeywordSignals(textContent),
      pricingSignals: extractPricingSignals(textContent),
      statusCode: response.status,
      fetchedAt: new Date().toISOString(),
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

function formatTimestamp(locale: string, value?: string): string {
  if (!value) {
    return locale === "ja" ? "未記録" : "Not recorded";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return locale === "ja" ? "未記録" : "Not recorded";
  }

  return date.toLocaleString(locale === "ja" ? "ja-JP" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function summarizeDiff(locale: string, previous: ContentSyncSnapshot | undefined, current: Omit<ContentSyncSnapshot, "lastCheckedAt" | "lastChangedAt">): DiffSummary {
  const isJapanese = locale === "ja";

  if (!previous) {
    return {
      summary: isJapanese
        ? "公式ページの初回スナップショットを作成しました。今後の差分監視の基準点になります。"
        : "Created the initial snapshot from the official source. This becomes the baseline for future change detection.",
      highlights: [
        isJapanese ? `監視開始: ${current.title}` : `Monitoring started for ${current.title}`,
        isJapanese ? `取得日時: ${formatTimestamp(locale, current.fetchedAt)}` : `Fetched at ${formatTimestamp(locale, current.fetchedAt)}`,
      ],
    };
  }

  if (previous.hash === current.hash) {
    return {
      summary: isJapanese
        ? "前回取得時点から明確な差分は検出されませんでした。"
        : "No material change was detected since the previous snapshot.",
      highlights: [
        isJapanese ? `前回変更: ${formatTimestamp(locale, previous.lastChangedAt)}` : `Last change: ${formatTimestamp(locale, previous.lastChangedAt)}`,
      ],
    };
  }

  const notes: string[] = [];

  if (previous.pageTitle !== current.pageTitle && current.pageTitle) {
    notes.push(
      isJapanese
        ? `ページタイトルが更新されました。`
        : "The page title changed."
    );
  }

  if (previous.finalUrl !== current.finalUrl) {
    notes.push(
      isJapanese
        ? "リンク先の最終URLが変わりました。"
        : "The final destination URL changed."
    );
  }

  const wordDeltaPercent =
    previous.wordCount > 0 ? ((current.wordCount - previous.wordCount) / previous.wordCount) * 100 : 0;

  if (Math.abs(wordDeltaPercent) >= 15) {
    notes.push(
      isJapanese
        ? `本文ボリュームが ${formatPercentDelta(wordDeltaPercent)} 変化しました。`
        : `Page copy volume changed by ${formatPercentDelta(wordDeltaPercent)}.`
    );
  }

  const newKeywords = current.keywordSignals.filter((keyword) => !previous.keywordSignals.includes(keyword));
  if (newKeywords.length > 0) {
    notes.push(
      isJapanese
        ? `新しい変更シグナル: ${newKeywords.slice(0, 3).join(", ")}`
        : `New change signals: ${newKeywords.slice(0, 3).join(", ")}`
    );
  }

  const newPricingSignals = current.pricingSignals.filter((signal) => !previous.pricingSignals.includes(signal));
  if (newPricingSignals.length > 0) {
    notes.push(
      isJapanese
        ? `料金・数値表現に変更候補: ${newPricingSignals.slice(0, 3).join(", ")}`
        : `Possible pricing or numeric changes: ${newPricingSignals.slice(0, 3).join(", ")}`
    );
  }

  if (notes.length === 0) {
    notes.push(
      isJapanese
        ? "本文ハッシュが変化しているため、内容更新の可能性があります。"
        : "The content hash changed, which suggests the official page was updated."
    );
  }

  return {
    summary: notes[0],
    highlights: notes.slice(0, 3),
  };
}

function extractJsonObject(value: string): string | null {
  const fencedMatch = value.match(/```json\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1];
  }

  const firstBrace = value.indexOf("{");
  const lastBrace = value.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return value.slice(firstBrace, lastBrace + 1);
  }

  return null;
}

async function summarizeDiffWithLlm(
  locale: string,
  previous: ContentSyncSnapshot | undefined,
  current: Omit<ContentSyncSnapshot, "lastCheckedAt" | "lastChangedAt">
): Promise<DiffSummary | null> {
  const apiKey = process.env.CONTENT_SYNC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const endpoint = process.env.CONTENT_SYNC_OPENAI_ENDPOINT || "https://api.openai.com/v1/chat/completions";
  const model = process.env.CONTENT_SYNC_OPENAI_MODEL || "gpt-4o-mini";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            locale === "ja"
              ? "あなたは差分更新の要約器です。必ずJSONだけを返してください。キーは summary と highlights です。highlights は最大3件の短文配列です。"
              : "You summarize website diffs. Return JSON only with keys summary and highlights. highlights must be an array of up to 3 short strings.",
        },
        {
          role: "user",
          content: JSON.stringify({
            locale,
            current: {
              title: current.title,
              sourceUrl: current.sourceUrl,
              finalUrl: current.finalUrl,
              pageTitle: current.pageTitle,
              heading: current.heading,
              excerpt: current.excerpt,
              keywordSignals: current.keywordSignals,
              pricingSignals: current.pricingSignals,
              wordCount: current.wordCount,
            },
            previous: previous
              ? {
                  finalUrl: previous.finalUrl,
                  pageTitle: previous.pageTitle,
                  heading: previous.heading,
                  excerpt: previous.excerpt,
                  keywordSignals: previous.keywordSignals,
                  pricingSignals: previous.pricingSignals,
                  wordCount: previous.wordCount,
                  lastChangedAt: previous.lastChangedAt,
                }
              : null,
          }),
        },
      ],
    }),
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    return null;
  }

  const jsonString = extractJsonObject(content);
  if (!jsonString) {
    return null;
  }

  try {
    const parsed = JSON.parse(jsonString) as Partial<DiffSummary>;
    if (!parsed.summary || !Array.isArray(parsed.highlights)) {
      return null;
    }

    return {
      summary: parsed.summary,
      highlights: parsed.highlights.filter((item): item is string => typeof item === "string").slice(0, 3),
    };
  } catch {
    return null;
  }
}

export async function runContentSync(options?: {
  locale?: string;
  slugs?: string[];
  limit?: number;
  force?: boolean;
  useLlm?: boolean;
  timeoutMs?: number;
}): Promise<ContentSyncReport> {
  const locale = options?.locale || "en";
  const requestedSlugs = options?.slugs?.map((slug) => slug.trim()).filter(Boolean);
  const force = Boolean(options?.force);
  const useLlm = options?.useLlm !== false;
  const timeoutMs = options?.timeoutMs || DEFAULT_TIMEOUT_MS;

  const allTargets = readToolSyncTargets(locale);
  const filteredTargets = requestedSlugs?.length
    ? allTargets.filter((target) => requestedSlugs.includes(target.slug))
    : allTargets;
  const targets = typeof options?.limit === "number"
    ? filteredTargets.slice(0, Math.max(0, options.limit))
    : filteredTargets;

  const state = readContentSyncState();
  const report: ContentSyncReport = {
    id: new Date().toISOString().replace(/[:.]/g, "-"),
    generatedAt: new Date().toISOString(),
    locale,
    filters: {
      slugs: requestedSlugs,
      limit: options?.limit,
      force,
      useLlm,
    },
    totals: {
      targets: targets.length,
      processed: 0,
      changed: 0,
      unchanged: 0,
      errors: 0,
    },
    items: [],
  };

  for (const target of targets) {
    const previous = state.snapshots[target.slug];

    try {
      const current = await fetchSyncSnapshot(target, timeoutMs);
      const changed = !previous || previous.hash !== current.hash;
      const heuristicSummary = summarizeDiff(locale, previous, current);
      const llmSummary =
        useLlm && changed ? await summarizeDiffWithLlm(locale, previous, current).catch(() => null) : null;

      const storedSnapshot: ContentSyncSnapshot = {
        ...current,
        lastCheckedAt: current.fetchedAt,
        lastChangedAt: changed ? current.fetchedAt : previous.lastChangedAt,
        lastSummary: llmSummary?.summary || heuristicSummary.summary,
        lastHighlights: llmSummary?.highlights?.length ? llmSummary.highlights : heuristicSummary.highlights,
      };

      state.snapshots[target.slug] = storedSnapshot;
      report.items.push({
        slug: target.slug,
        title: target.title,
        sourceUrl: target.sourceUrl,
        finalUrl: current.finalUrl,
        status: previous ? (changed ? "updated" : "unchanged") : "initial",
        summary: llmSummary?.summary || heuristicSummary.summary,
        highlights: llmSummary?.highlights?.length ? llmSummary.highlights : heuristicSummary.highlights,
        usedLlm: Boolean(llmSummary),
        httpStatus: current.statusCode,
        fetchedAt: current.fetchedAt,
        previousHash: previous?.hash,
        currentHash: current.hash,
      });

      report.totals.processed += 1;
      if (changed) {
        report.totals.changed += 1;
      } else {
        report.totals.unchanged += 1;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown sync error";
      report.items.push({
        slug: target.slug,
        title: target.title,
        sourceUrl: target.sourceUrl,
        status: "error",
        summary: locale === "ja" ? "差分取得に失敗しました。" : "Failed to fetch the source page.",
        highlights: [],
        usedLlm: false,
        error: message,
      });
      report.totals.processed += 1;
      report.totals.errors += 1;
    }
  }

  state.lastReportId = report.id;
  state.reports = [
    {
      id: report.id,
      generatedAt: report.generatedAt,
      locale: report.locale,
      changed: report.totals.changed,
      unchanged: report.totals.unchanged,
      errors: report.totals.errors,
    },
    ...state.reports,
  ].slice(0, MAX_REPORT_HISTORY);

  writeContentSyncState(state);
  writeContentSyncReport(report);

  return report;
}

export function getLatestContentSyncReport(): ContentSyncReport | null {
  ensureContentSyncPaths();

  if (!fs.existsSync(LATEST_REPORT_FILE)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(LATEST_REPORT_FILE, "utf8")) as ContentSyncReport;
  } catch {
    return null;
  }
}

export function getContentSyncStatus() {
  const state = readContentSyncState();
  const latestReport = getLatestContentSyncReport();

  return {
    configured: true,
    trackedSnapshots: Object.keys(state.snapshots).length,
    lastRunAt: latestReport?.generatedAt || null,
    lastReportId: state.lastReportId || null,
    latestReport,
    recentRuns: state.reports,
  };
}

export function getContentSyncSummary(slug: string) {
  const state = readContentSyncState();
  const snapshot = state.snapshots[slug];

  if (!snapshot) {
    return null;
  }

  return {
    slug: snapshot.slug,
    sourceUrl: snapshot.sourceUrl,
    finalUrl: snapshot.finalUrl,
    statusCode: snapshot.statusCode,
    lastCheckedAt: snapshot.lastCheckedAt,
    lastChangedAt: snapshot.lastChangedAt,
    summary: snapshot.lastSummary || null,
    highlights: snapshot.lastHighlights || [],
  };
}
