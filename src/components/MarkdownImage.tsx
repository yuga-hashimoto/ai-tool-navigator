"use client";

import Image from "next/image";

interface MarkdownImageProps {
  src?: string;
  alt?: string;
}

export function MarkdownImage({ src, alt }: MarkdownImageProps) {
  if (!src) return null;

  return (
    <span className="block relative w-full my-4" style={{ aspectRatio: "16/9" }}>
      <Image
        src={src}
        alt={alt || ""}
        fill
        loading="lazy"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
        className="object-contain rounded-lg"
      />
    </span>
  );
}
