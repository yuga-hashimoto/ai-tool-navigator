import { getAllTools } from "@/lib/tools";
import { ToolGrid } from "@/components/ToolGrid";
import { ToolCard } from "@/components/ToolCard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "AI Tool Navigator",
  description: "Discover and compare the best AI tools for your workflow.",
};

export default function Home() {
  const tools = getAllTools();
  const editorsChoiceSlugs = ['speechify', 'mixo', 'copy-ai', 'basedlabs', 'homesage'];
  const editorsChoiceTools = tools.filter(tool => editorsChoiceSlugs.includes(tool.slug));

  return (
    <div className="bg-white dark:bg-black min-h-screen transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-6xl dark:text-zinc-50">
            Premium AI Tool Comparison
          </h1>
          <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Find the perfect AI tool for your needs. Unbiased reviews, pros & cons, and detailed comparisons.
          </p>
        </div>

        {/* Featured Comparison Banner */}
        <div className="mb-16">
          <Link href="/tools/claude-cowork-vs-google-antigravity" className="block group">
            <div className="relative overflow-hidden rounded-3xl bg-zinc-900 px-6 py-10 sm:px-12 sm:py-16 shadow-2xl transition-all hover:scale-[1.01] dark:bg-zinc-800">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-left max-w-xl">
                  <span className="inline-flex items-center rounded-full bg-blue-500/10 px-3 py-1 text-sm font-semibold text-blue-400 ring-1 ring-inset ring-blue-500/20 mb-6">
                    Featured Comparison
                  </span>
                  <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    Claude Cowork vs. Google Antigravity
                  </h2>
                  <p className="mt-4 text-lg text-zinc-400">
                    Which "AI Colleague" wins in 2026? We break down the performance, pricing, and capabilities of the two biggest agentic platforms.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="rounded-full bg-white/10 p-4 ring-1 ring-white/20 group-hover:bg-white/20 transition-colors">
                    <ArrowLeft className="h-8 w-8 text-white rotate-180" />
                  </div>
                </div>
              </div>
              {/* Background Glow */}
              <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
              <div className="absolute -left-24 -bottom-24 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
            </div>
          </Link>
        </div>

        {/* Featured Tool Sponsorship Section */}
        <div className="mb-16">
          <div className="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 p-1">
            <div className="flex flex-col md:flex-row items-center justify-between rounded-xl bg-white p-6 dark:bg-zinc-900">
              <div className="flex-1">
                <div className="flex items-center gap-x-2">
                  <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10 dark:bg-indigo-400/10 dark:text-indigo-400 dark:ring-indigo-400/20">
                    Featured Tool
                  </span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">Sponsored</span>
                </div>
                <h3 className="mt-2 text-xl font-bold text-zinc-900 dark:text-white">
                  SuperScale AI
                </h3>
                <p className="mt-2 text-base text-zinc-600 dark:text-zinc-300">
                  Automate your entire marketing workflow with one click. The most advanced AI agent for growth teams.
                </p>
                <div className="mt-4 flex items-center gap-x-4">
                  <a
                    href="#"
                    className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Try for Free
                  </a>
                  <Link href="/advertise" className="text-sm font-semibold leading-6 text-zinc-900 dark:text-white hover:text-indigo-500 transition-colors">
                    Advertise with us <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
              <div className="mt-6 md:mt-0 md:ml-8 flex-shrink-0">
                <div className="h-32 w-32 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                   <span className="text-4xl">🚀</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Editor's Choice Section */}
        {editorsChoiceTools.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-6 flex items-center gap-2">
              <span className="text-yellow-500">★</span> Editor's Choice
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {editorsChoiceTools.map((tool) => (
                <div key={tool.slug} className="flex flex-col h-full">
                  <ToolCard tool={tool} />
                </div>
              ))}
            </div>
          </div>
        )}

        <ToolGrid tools={tools} />
      </div>
    </div>
  );
}
