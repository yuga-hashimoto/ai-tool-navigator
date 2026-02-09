import { getAllTools } from "@/lib/tools";
import { CompareView } from "@/components/CompareView";
import { Metadata } from "next";
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Compare AI Tools | AI Tool Navigator",
  description: "Compare features, pricing, pros, and cons of top AI tools side-by-side.",
};

export default function ComparePage() {
  const tools = getAllTools();

  return (
    <div className="bg-white dark:bg-black min-h-screen transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
            Compare AI Tools
          </h1>
          <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Side-by-side comparison to help you choose the right tool.
          </p>
        </div>

        <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Featured Showdowns</h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <Link href="/compare/claude-vs-antigravity" className="block p-6 bg-gray-50 dark:bg-gray-800 rounded-xl hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700 group">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-2">Claude 3.5 Sonnet vs. Google Antigravity</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Ideally suited for complex system architecture vs creative writing.</p>
                </Link>
                <Link href="/compare/gemini-vs-claude-2026" className="block p-6 bg-gray-50 dark:bg-gray-800 rounded-xl hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700 group">
                    <div className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded mb-2">New 2026</div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 mb-2">Gemini 3 Pro vs. Claude 3.7 Sonnet</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">The definitive coding showdown. ROI, benchmarks, and agentic workflows.</p>
                </Link>
            </div>
        </div>

        <CompareView tools={tools} />
      </div>
    </div>
  );
}
