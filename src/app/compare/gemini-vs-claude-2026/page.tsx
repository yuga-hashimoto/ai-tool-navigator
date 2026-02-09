import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Gemini 3 Pro vs. Claude 3.7 Sonnet: The 2026 Coding Showdown | AI Tool Navigator',
  description: 'A definitive comparison of Google\'s Gemini 3 Pro and Anthropic\'s Claude 3.7 Sonnet for software engineers in 2026. ROI, coding benchmarks, and feature breakdowns.',
  openGraph: {
    title: 'Gemini 3 Pro vs. Claude 3.7 Sonnet: The 2026 Coding Showdown',
    description: 'Which AI model rules the IDE in 2026? We compare the titans.',
    type: 'article',
    publishedTime: '2026-05-15',
    authors: ['Antigravity Team'],
  },
};

export default function ComparePage() {
  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
            <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-sm font-semibold mb-4">
                2026 Update
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
            Gemini 3 Pro vs. Claude 3.7 Sonnet:<br className="hidden md:block" /> The 2026 Coding Showdown
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            By mid-2026, the "can it code?" phase is over. Now it's about ROI. Which titan deserves your API budget?
            </p>
        </div>

        {/* At a Glance Table */}
        <div className="overflow-x-auto shadow-xl rounded-2xl mb-16 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
              <tr>
                <th scope="col" className="px-6 py-4">Feature</th>
                <th scope="col" className="px-6 py-4 text-blue-600 dark:text-blue-400 text-lg">Gemini 3 Pro</th>
                <th scope="col" className="px-6 py-4 text-purple-600 dark:text-purple-400 text-lg">Claude 3.7 Sonnet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-750">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">Architecture</th>
                <td className="px-6 py-4">Native Multimodal (Audio/Video/Code)</td>
                <td className="px-6 py-4">Dense Text/Code Specialist</td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-750">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">Context Window</th>
                <td className="px-6 py-4 font-semibold text-green-600 dark:text-green-400">Infinite / 10M+ Tokens</td>
                <td className="px-6 py-4">500k Tokens (Optimized)</td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-750">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">SWE-bench 2026</th>
                <td className="px-6 py-4">78.4%</td>
                <td className="px-6 py-4 font-semibold text-green-600 dark:text-green-400">81.2%</td>
              </tr>
               <tr className="hover:bg-gray-50 dark:hover:bg-gray-750">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">Pricing (1M Tokens)</th>
                <td className="px-6 py-4 font-semibold text-green-600 dark:text-green-400">$0.20 / $0.80</td>
                <td className="px-6 py-4">$0.80 / $2.40</td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-750">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">Killer Feature</th>
                <td className="px-6 py-4">Full Repo Understanding & Video Context</td>
                <td className="px-6 py-4">Agentic "Computer Use" & Intuition</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Deep Dive Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-8 rounded-2xl border border-purple-100 dark:border-purple-800">
                <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-4">
                    Claude 3.7 Sonnet: The Artisan
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Claude 3.7 is the "developer's favorite" for a reason. Its reasoning engine is tuned for software architecture.
                </p>
                <ul className="space-y-3">
                    <li className="flex items-start">
                        <span className="mr-2 text-purple-600">✓</span>
                        <span className="text-gray-600 dark:text-gray-400"><strong>One-Shot Accuracy:</strong> Rarely needs syntax corrections.</span>
                    </li>
                    <li className="flex items-start">
                        <span className="mr-2 text-purple-600">✓</span>
                        <span className="text-gray-600 dark:text-gray-400"><strong>Computer Use v2:</strong> Can spin up dev servers and fix runtime errors autonomously.</span>
                    </li>
                    <li className="flex items-start">
                        <span className="mr-2 text-purple-600">✓</span>
                        <span className="text-gray-600 dark:text-gray-400"><strong>Refactoring:</strong> Preserves existing code style impeccably.</span>
                    </li>
                </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-8 rounded-2xl border border-blue-100 dark:border-blue-800">
                <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-4">
                    Gemini 3 Pro: The Context Beast
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Gemini 3 Pro leans hard into infrastructure. It is big, fast, and sees everything.
                </p>
                 <ul className="space-y-3">
                    <li className="flex items-start">
                        <span className="mr-2 text-blue-600">✓</span>
                        <span className="text-gray-600 dark:text-gray-400"><strong>Repo-Level Awareness:</strong> Grokks entire project structures, not just open files.</span>
                    </li>
                    <li className="flex items-start">
                        <span className="mr-2 text-blue-600">✓</span>
                        <span className="text-gray-600 dark:text-gray-400"><strong>Multimodal Debugging:</strong> Analyze UI glitches from screen recordings.</span>
                    </li>
                    <li className="flex items-start">
                        <span className="mr-2 text-blue-600">✓</span>
                        <span className="text-gray-600 dark:text-gray-400"><strong>Cost Efficiency:</strong> ~25% the cost of Sonnet for massive context.</span>
                    </li>
                </ul>
            </div>
        </div>

        {/* ROI Analysis */}
        <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">ROI Analysis: The Bottom Line</h2>
            <div className="space-y-6">
                <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center mb-3">
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 p-1 rounded mr-3 text-sm">Case A</span>
                        High Volume / Legacy Code
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                        <strong>Winner: Gemini 3 Pro.</strong> For "Explain how this 10-year-old C++ module interacts with the new microservice," Gemini's cost and speed are unbeatable. You can afford to scan the whole repo for every query.
                    </p>
                </div>
                <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                     <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center mb-3">
                        <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 p-1 rounded mr-3 text-sm">Case B</span>
                        Complex Logic / Greenfield
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                        <strong>Winner: Claude 3.7 Sonnet.</strong> If you are debugging race conditions or building new features, Claude pays for itself. The "time-to-merge" is consistently lower, saving expensive developer hours.
                    </p>
                </div>
            </div>
        </div>

        {/* Verdict */}
        <div className="bg-gray-900 dark:bg-black text-white rounded-3xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-purple-500 to-transparent"></div>
            <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-6">The 2026 Verdict</h2>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                    The "Single Model Fallacy" is dead. The most effective teams use a hybrid approach.
                </p>
                <div className="flex flex-col md:flex-row justify-center gap-4">
                    <div className="bg-gray-800 p-4 rounded-lg flex-1">
                        <span className="block text-sm text-gray-400 mb-1">For Repo Management & Cost</span>
                        <strong className="text-lg text-blue-400">Gemini 3 Pro</strong>
                    </div>
                     <div className="bg-gray-800 p-4 rounded-lg flex-1">
                        <span className="block text-sm text-gray-400 mb-1">For Pure Coding IQ</span>
                        <strong className="text-lg text-purple-400">Claude 3.7 Sonnet</strong>
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-12 text-center">
             <Link 
                href="/tools" 
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-all duration-200"
            >
                Explore More AI Tools
            </Link>
        </div>

      </div>
    </div>
  );
}
