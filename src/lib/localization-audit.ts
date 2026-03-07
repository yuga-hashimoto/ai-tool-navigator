import fs from "fs";
import path from "path";

export interface LocalizationCoverageItem {
  totalEn: number;
  totalJa: number;
  missingJa: string[];
  coveragePercent: number;
}

export interface LocalizationCoverageReport {
  generatedAt: string;
  tools: LocalizationCoverageItem;
  posts: LocalizationCoverageItem;
}

function getMarkdownFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs.readdirSync(dir).filter((file) => file.endsWith(".md")).sort();
}

function buildCoverage(contentType: "tools" | "posts"): LocalizationCoverageItem {
  const enFiles = getMarkdownFiles(path.join(process.cwd(), "content", contentType, "en"));
  const jaFiles = getMarkdownFiles(path.join(process.cwd(), "content", contentType, "ja"));
  const jaSet = new Set(jaFiles);
  const missingJa = enFiles.filter((file) => !jaSet.has(file));

  return {
    totalEn: enFiles.length,
    totalJa: jaFiles.length,
    missingJa,
    coveragePercent: enFiles.length > 0 ? Math.round(((enFiles.length - missingJa.length) / enFiles.length) * 100) : 100,
  };
}

export function getLocalizationCoverageReport(): LocalizationCoverageReport {
  return {
    generatedAt: new Date().toISOString(),
    tools: buildCoverage("tools"),
    posts: buildCoverage("posts"),
  };
}
