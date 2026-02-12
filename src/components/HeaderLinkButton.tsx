"use client";

import { Link as LinkIcon, Check } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export function HeaderLinkButton({ id, className }: { id: string, className?: string }) {
  const [copied, setCopied] = useState(false);
  const t = useTranslations("ToolPage");

  const handleCopy = async () => {
    try {
      const url = `${window.location.origin}${window.location.pathname}#${id}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "inline-flex shrink-0 items-center justify-center p-1 rounded-md transition-all ml-2 opacity-0 group-hover:opacity-100 focus:opacity-100",
        copied ? "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400" : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800",
        className
      )}
      aria-label={t("copyLink")}
      title={t("copyLink")}
    >
      {copied ? (
        <Check className="h-4 w-4" />
      ) : (
        <LinkIcon className="h-4 w-4" />
      )}
    </button>
  );
}
