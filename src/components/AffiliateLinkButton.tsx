"use client";

import { sendGAEvent } from "@/lib/analytics";
import { ReactNode } from "react";

interface AffiliateLinkButtonProps {
  href: string;
  toolSlug: string;
  toolName: string;
  className?: string;
  children: ReactNode;
  position?: string;
}

export function AffiliateLinkButton({
  href,
  toolSlug,
  toolName,
  className,
  children,
  position = "tool_page",
}: AffiliateLinkButtonProps) {
  const handleClick = () => {
    sendGAEvent("affiliate_click", {
      tool_slug: toolSlug,
      tool_name: toolName,
      location: window.location.pathname,
      position,
    });
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
