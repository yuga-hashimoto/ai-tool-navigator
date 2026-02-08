"use client";

import Link from "next/link";
import { useCompare } from "@/context/CompareContext";
import { usePathname } from "next/navigation";

export function CompareBar() {
  const { selectedSlugs, clearSelection } = useCompare();
  const pathname = usePathname();

  if (selectedSlugs.length === 0) {
    return null;
  }

  const isComparePage = pathname === "/compare";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {selectedSlugs.length} tool{selectedSlugs.length !== 1 ? "s" : ""} selected
          </span>
          <button
            onClick={clearSelection}
            className="text-sm text-zinc-500 hover:text-zinc-700 underline dark:text-zinc-400 dark:hover:text-zinc-300"
          >
            Clear all
          </button>
        </div>
        <div className="flex items-center gap-4">
          {!isComparePage && (
            <Link
              href="/compare"
              className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
            >
              Compare Now
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
