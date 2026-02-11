import { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs, BreadcrumbItem } from "@/components/Breadcrumbs";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: 'Claude 3.5 Sonnet vs. Google Antigravity (Gemini 3 Pro): The IDE Battle of 2026',
  description: 'A comprehensive comparison of Claude 3.5 Sonnet and Google Antigravity (Gemini 3 Pro). Discover which AI model is best for your coding needs in 2026.',
};

export default async function ComparePage() {
  const tBreadcrumbs = await getTranslations('Breadcrumbs');
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: tBreadcrumbs('home'), href: '/' },
    { label: tBreadcrumbs('compare'), href: '/compare' },
    { label: "Claude 3.5 Sonnet vs. Google Antigravity" },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={breadcrumbItems} />
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8 text-center">
          Claude 3.5 Sonnet vs. Google Antigravity (Gemini 3 Pro): The IDE Battle of 2026
        </h1>

        <div className="prose dark:prose-invert max-w-none mb-12">
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 text-center">
            Choosing the right AI assistant can make or break your productivity. Here&apos;s how the top contenders stack up.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto shadow-md sm:rounded-lg mb-12 border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">Feature</th>
                <th scope="col" className="px-6 py-3 text-blue-600 dark:text-blue-400">Claude 3.5 Sonnet</th>
                <th scope="col" className="px-6 py-3 text-purple-600 dark:text-purple-400">Google Antigravity (Gemini 3 Pro)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white border-b dark:bg-gray-900 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">Speed</th>
                <td className="px-6 py-4">Fast (optimized for chat)</td>
                <td className="px-6 py-4 font-semibold text-green-500">Blazing Fast (IDE-integrated)</td>
              </tr>
              <tr className="bg-white border-b dark:bg-gray-900 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">Context Window</th>
                <td className="px-6 py-4">200k tokens</td>
                <td className="px-6 py-4 font-semibold text-green-500">2M+ tokens (Infinite Context)</td>
              </tr>
              <tr className="bg-white border-b dark:bg-gray-900 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">Reasoning</th>
                <td className="px-6 py-4">Excellent for nuance</td>
                <td className="px-6 py-4 font-semibold text-green-500">Superior (Agentic Step-by-Step)</td>
              </tr>
              <tr className="bg-white border-b dark:bg-gray-900 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">Cost</th>
                <td className="px-6 py-4">$15/million tokens</td>
                <td className="px-6 py-4 font-semibold text-green-500">Included in Pro Plan ($0 extra)</td>
              </tr>
              <tr className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">Primary Strength</th>
                <td className="px-6 py-4">Creative Writing & Analysis</td>
                <td className="px-6 py-4 font-semibold text-purple-500">Complex System Architecture</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Feature Highlight */}
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-xl p-8 mb-12 text-white shadow-xl">
          <h2 className="text-3xl font-bold mb-4">Why Antigravity Wins for Developers</h2>
          <p className="mb-6 text-lg text-purple-100">
            While Claude is a brilliant conversationalist, <strong>Google Antigravity</strong> is built for *building*. Its &quot;Agentic Coding&quot; engine doesn&apos;t just write snippets; it understands your entire repo, plans multi-file refactors, and executes them autonomously.
          </p>
          <ul className="list-disc list-inside space-y-2 mb-6 text-purple-200">
            <li>Self-healing code generation</li>
            <li>Real-time environment awareness</li>
            <li>Deep integration with cloud deployment pipelines</li>
          </ul>
        </div>

        {/* Conclusion */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Verdict: Which one is for you?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2 text-blue-600 dark:text-blue-400">Choose Claude 3.5 Sonnet if...</h3>
              <p className="text-gray-600 dark:text-gray-300">You need help with creative writing, marketing copy, or analyzing standalone documents where nuance is key.</p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg border-2 border-purple-500">
              <h3 className="text-xl font-semibold mb-2 text-purple-600 dark:text-purple-400">Choose Google Antigravity if...</h3>
              <p className="text-gray-600 dark:text-gray-300">You are a developer building complex applications. If you need an AI that acts like a senior engineer pair-programmer, Antigravity is the clear winner.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link 
            href="https://ai.google.dev/antigravity" 
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-full transition-colors duration-200 transform hover:scale-105 shadow-lg text-lg"
          >
            Try Google Antigravity Now
          </Link>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Experience the future of coding today.
          </p>
        </div>
      </div>
    </div>
  );
}
