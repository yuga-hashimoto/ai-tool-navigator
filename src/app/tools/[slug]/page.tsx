import { getToolBySlug, getToolSlugs } from "@/lib/tools";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Star, CheckCircle2, XCircle, ExternalLink, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export async function generateStaticParams() {
  const slugs = getToolSlugs();
  return slugs;
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    return {
      title: 'Tool Not Found',
    }
  }

  return {
    title: `${tool.metadata.title} - AI Tool Navigator`,
    description: tool.metadata.description,
  }
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    notFound();
  }

  const { metadata, content } = tool;

  return (
    <div className="bg-white dark:bg-black min-h-screen py-12 transition-colors duration-300">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 mb-8 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tools
        </Link>

        <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-900/5 dark:bg-zinc-900 dark:ring-white/10">
            <div className="px-6 py-8 sm:px-12 sm:py-12 lg:px-16">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-x-3">
                             <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
                                {metadata.title}
                            </h1>
                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30">
                                {metadata.category}
                            </span>
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                             <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`h-5 w-5 ${
                                            i < Math.round(metadata.rating)
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "fill-gray-200 text-gray-200 dark:fill-zinc-700 dark:text-zinc-700"
                                        }`}
                                    />
                                ))}
                            </div>
                            <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                {metadata.rating}
                            </span>
                        </div>
                    </div>
                    <a
                        href={metadata.affiliate_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all transform hover:scale-105"
                    >
                        Try this Tool <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
                    <div className="rounded-2xl bg-green-50/50 p-6 ring-1 ring-green-600/10 dark:bg-green-500/5 dark:ring-green-500/20">
                        <h3 className="flex items-center text-sm font-semibold text-green-700 dark:text-green-400 mb-4">
                            <CheckCircle2 className="mr-2 h-5 w-5" /> Pros
                        </h3>
                        <ul className="space-y-3">
                            {metadata.pros.map((pro, idx) => (
                                <li key={idx} className="flex items-start text-sm text-zinc-700 dark:text-zinc-300">
                                    <span className="mr-2">•</span> {pro}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="rounded-2xl bg-red-50/50 p-6 ring-1 ring-red-600/10 dark:bg-red-500/5 dark:ring-red-500/20">
                        <h3 className="flex items-center text-sm font-semibold text-red-700 dark:text-red-400 mb-4">
                            <XCircle className="mr-2 h-5 w-5" /> Cons
                        </h3>
                        <ul className="space-y-3">
                            {metadata.cons.map((con, idx) => (
                                <li key={idx} className="flex items-start text-sm text-zinc-700 dark:text-zinc-300">
                                    <span className="mr-2">•</span> {con}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-12 prose prose-zinc dark:prose-invert max-w-none">
                    <ReactMarkdown>{content}</ReactMarkdown>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
