"use client";

import { Twitter, Facebook, Linkedin, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { sendGAEvent } from "@/lib/analytics";

interface ShareButtonsProps {
  url: string;
  title: string;
  twitterText?: string;
}

export function ShareButtons({ url, title, twitterText }: ShareButtonsProps) {
  const t = useTranslations("ShareButtons");

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedTwitterText = twitterText
    ? encodeURIComponent(twitterText)
    : encodedTitle;

  const shareLinks = [
    {
      name: "X",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTwitterText}`,
      label: t("shareOnX"),
      color: "hover:text-black dark:hover:text-white",
    },
    {
      name: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      label: t("shareOnFacebook"),
      color: "hover:text-blue-600",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      label: t("shareOnLinkedIn"),
      color: "hover:text-blue-700",
    },
    {
      name: "Email",
      icon: Mail,
      href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
      label: t("shareOnEmail"),
      color: "hover:text-gray-600 dark:hover:text-gray-300",
    },
  ];

  return (
    <div className="flex gap-4">
      {shareLinks.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.label}
          className={`text-zinc-400 transition-colors duration-200 ${link.color}`}
          onClick={() => {
            sendGAEvent("share", {
              method: link.name,
              content_type: "tool",
              item_id: title,
            });
          }}
        >
          <link.icon className="h-5 w-5" />
        </a>
      ))}
    </div>
  );
}
