"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
  className?: string;
}

export function YouTubeEmbed({ videoId, title = "YouTube video", className }: YouTubeEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!videoId) return null;

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-xl bg-gray-100 shadow-lg aspect-video",
        className
      )}
    >
      {!isPlaying ? (
        <button
          onClick={() => setIsPlaying(true)}
          className="group relative flex h-full w-full items-center justify-center"
          aria-label={`Play ${title}`}
        >
          {/* Thumbnail */}
          <img
            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-90"
            loading="lazy"
          />

          {/* Play Button Overlay */}
          <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-xl transition-transform duration-300 group-hover:scale-110">
            <Play className="h-6 w-6 fill-black text-black ml-1" />
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/10 transition-colors duration-300 group-hover:bg-black/20" />
        </button>
      ) : (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      )}
    </div>
  );
}
