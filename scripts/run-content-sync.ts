import { runContentSync } from "../src/lib/content-sync";

function getArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : undefined;
}

function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

async function main() {
  const locale = getArg("locale") || "en";
  const slugs = getArg("slugs")
    ?.split(",")
    .map((slug) => slug.trim())
    .filter(Boolean);
  const limitArg = getArg("limit");
  const limit = limitArg ? Number.parseInt(limitArg, 10) : undefined;
  const force = hasFlag("force");
  const useLlm = !hasFlag("no-llm");

  const report = await runContentSync({
    locale,
    slugs,
    limit: typeof limit === "number" && !Number.isNaN(limit) ? limit : undefined,
    force,
    useLlm,
  });

  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error("[run-content-sync] Failed:", error);
  process.exit(1);
});
