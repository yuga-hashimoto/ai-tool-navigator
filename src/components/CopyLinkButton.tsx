"use client";

import { Link as LinkIcon, Check } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { sendGAEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export function CopyLinkButton({ className }: { className?: string }) {
  const [copied, setCopied] = useState(false);
  const t = useTranslations("ToolPage");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      sendGAEvent("share", {
        method: "copy_link",
        content_type: "tool",
        item_id: window.location.href,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center justify-center rounded-full border px-8 py-4 text-base font-semibold transition-all transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        copied
          ? "border-green-600 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
          : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700",
        className
      )}
      aria-label={t("copyLink")}
    >
      {copied ? (
        <>
          {t("copied")} <Check className="ml-2 h-4 w-4" />
        </>
      ) : (
        <>
          {t("copyLink")} <LinkIcon className="ml-2 h-4 w-4" />
        </>
      )}
    </button>
  );
}
