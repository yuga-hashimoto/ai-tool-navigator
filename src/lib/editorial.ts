import { ToolMetadata } from "@/lib/tools";

const REVIEW_PENDING_TOOL_SLUGS = new Set([
  "claude-cowork",
  "google-antigravity",
  "claude-cowork-vs-google-antigravity",
  "llama-5-avocado",
]);

const REVIEW_PENDING_POST_SLUGS = new Set([
  "google-antigravity-vs-claude-4-6",
]);

const NOINDEX_STATIC_ROUTES = new Set([
  "compare/claude-vs-antigravity",
  "compare/gemini-vs-claude-2026",
]);

interface HasSlug {
  slug: string;
}

interface EditorialToolLike extends HasSlug {
  verified?: boolean;
  rating?: number;
  last_updated?: string;
  title?: string;
}

function parseDate(value?: string): number {
  if (!value) {
    return 0;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function isReviewPendingToolSlug(slug: string): boolean {
  return REVIEW_PENDING_TOOL_SLUGS.has(slug);
}

export function isReviewPendingPostSlug(slug: string): boolean {
  return REVIEW_PENDING_POST_SLUGS.has(slug);
}

export function isNoIndexStaticRoute(route: string): boolean {
  return NOINDEX_STATIC_ROUTES.has(route);
}

export function shouldShowToolInEditorialLists(tool: HasSlug): boolean {
  return !isReviewPendingToolSlug(tool.slug);
}

export function shouldShowPostInEditorialLists(post: HasSlug): boolean {
  return !isReviewPendingPostSlug(post.slug);
}

export function filterToolList<T extends HasSlug>(tools: T[]): T[] {
  return tools.filter(shouldShowToolInEditorialLists);
}

export function filterPostList<T extends HasSlug>(posts: T[]): T[] {
  return posts.filter(shouldShowPostInEditorialLists);
}

export function sortToolsForEditorialLists<T extends EditorialToolLike>(a: T, b: T): number {
  if (Boolean(a.verified) !== Boolean(b.verified)) {
    return a.verified ? -1 : 1;
  }

  if ((a.rating ?? 0) !== (b.rating ?? 0)) {
    return (b.rating ?? 0) - (a.rating ?? 0);
  }

  const updatedDelta = parseDate(b.last_updated) - parseDate(a.last_updated);
  if (updatedDelta !== 0) {
    return updatedDelta;
  }

  return (a.title ?? "").localeCompare(b.title ?? "");
}

export function buildCompareQuery(slugs: string[]): string {
  const cleaned = Array.from(
    new Set(
      slugs
        .map((slug) => slug.trim())
        .filter(Boolean)
    )
  ).slice(0, 4);

  return cleaned.length > 0 ? `?tools=${cleaned.join(",")}` : "";
}

export function getEditorialToolStatus(
  tool: Pick<ToolMetadata, "slug" | "verified">
): "reviewed" | "pending_review" | "archived" {
  if (isReviewPendingToolSlug(tool.slug)) {
    return "archived";
  }

  if (tool.verified) {
    return "reviewed";
  }

  return "pending_review";
}
