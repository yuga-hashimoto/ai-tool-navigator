"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface CopyCodeButtonProps {
  text: string;
  className?: string;
}

export function CopyCodeButton({ text, className }: CopyCodeButtonProps) {
  const [copied, setCopied] = useState(false);
  const t = useTranslations("BlogPage");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
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
        "absolute top-2 right-2 p-2 rounded-md transition-all duration-200",
        "bg-zinc-700/50 hover:bg-zinc-700 text-zinc-200",
        "opacity-0 group-hover:opacity-100 focus:opacity-100",
        copied && "text-green-400",
        className
      )}
      aria-label={t("copyCode")}
      title={t("copyCode")}
    >
      {copied ? (
        <Check className="h-4 w-4" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </button>
  );
}
