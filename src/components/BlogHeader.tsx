"use client";

import { useState } from "react";
import { Link as LinkIcon, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlogHeaderProps extends React.HTMLAttributes<HTMLHeadingElement> {
  tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export function BlogHeader({ tag, children, className, id, ...props }: BlogHeaderProps) {
  const [copied, setCopied] = useState(false);
  const Tag = tag;

  const handleCopy = async () => {
    if (typeof window !== "undefined" && id) {
      const url = `${window.location.origin}${window.location.pathname}#${id}`;
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy link:", err);
      }
    }
  };

  if (!id) {
    return (
      <Tag className={cn("scroll-mt-24", className)} {...props}>
        {children}
      </Tag>
    );
  }

  return (
    <Tag
      id={id}
      className={cn("group flex items-center gap-2 scroll-mt-24", className)}
      {...props}
    >
      {children}
      <button
        onClick={handleCopy}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Copy link to section"
        title="Copy link to section"
        type="button"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <LinkIcon className="h-4 w-4" />
        )}
      </button>
    </Tag>
  );
}
