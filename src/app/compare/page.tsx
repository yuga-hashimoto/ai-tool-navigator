import { getAllTools } from "@/lib/tools";
import { CompareView } from "@/components/CompareView";
import { Metadata } from "next";

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

        <CompareView tools={tools} />
      </div>
    </div>
  );
}
