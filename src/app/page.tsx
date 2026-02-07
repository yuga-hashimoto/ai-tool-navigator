import { getAllTools } from "@/lib/tools";
import { ToolGrid } from "@/components/ToolGrid";

export const metadata = {
  title: "AI Tool Navigator",
  description: "Discover and compare the best AI tools for your workflow.",
};

export default function Home() {
  const tools = getAllTools();

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
        <ToolGrid tools={tools} />
      </div>
    </div>
  );
}
