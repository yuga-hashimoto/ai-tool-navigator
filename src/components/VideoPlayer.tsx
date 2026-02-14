"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, Subtitles } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { VideoTranscript, VideoMetadata } from "@/lib/videos";

interface VideoPlayerProps {
  videoUrl: string;
  poster?: string;
  title?: string;
  transcripts?: VideoTranscript[];
  monetization?: VideoMetadata['monetization'];
  className?: string;
}

export function VideoPlayer({
  videoUrl,
  poster,
  title,
  transcripts,
  monetization,
  className
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isPremiumLocked, setIsPremiumLocked] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Basic YouTube ID extraction
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const youtubeId = getYouTubeId(videoUrl);

  useEffect(() => {
    // Check for premium content
    if (monetization?.isPremium) {
      // Mock check - in real app, check user subscription status
      const userHasAccess = false;
      if (!userHasAccess) {
        setIsPremiumLocked(true);
      }
    }
  }, [monetization]);

  const togglePlay = () => {
    if (isPremiumLocked) return;

    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // If YouTube, fall back to simple embed for now
  if (youtubeId) {
    return (
      <div className={cn("flex flex-col gap-4", className)}>
        <div className="relative w-full aspect-video overflow-hidden rounded-xl bg-black shadow-lg">
           {isPremiumLocked ? (
             <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 text-white p-6 text-center">
               <div className="bg-yellow-500/20 p-4 rounded-full mb-4">
                 <Settings className="w-8 h-8 text-yellow-500" />
               </div>
               <h3 className="text-xl font-bold mb-2">Premium Content</h3>
               <p className="text-gray-300 max-w-md mb-6">This video is available exclusively for premium members. Subscribe to unlock access.</p>
               <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-colors">
                 Unlock Now
               </button>
             </div>
           ) : null}

           <iframe
             src={`https://www.youtube.com/embed/${youtubeId}?autoplay=${isPlaying ? 1 : 0}`}
             title={title || "YouTube video"}
             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
             allowFullScreen
             className="absolute inset-0 w-full h-full border-0"
           />
        </div>

        {transcripts && transcripts.length > 0 && (
          <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                <Subtitles className="w-4 h-4" />
                Transcript
              </h3>
            </div>
            <div className="prose dark:prose-invert max-w-none text-sm h-64 overflow-y-auto custom-scrollbar">
              {transcripts[0].text}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="relative group overflow-hidden rounded-xl bg-black shadow-lg aspect-video">
        {/* Premium Overlay */}
        {isPremiumLocked && (
             <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 text-white p-6 text-center backdrop-blur-sm">
               <div className="bg-yellow-500/20 p-4 rounded-full mb-4">
                 <Settings className="w-8 h-8 text-yellow-500" />
               </div>
               <h3 className="text-xl font-bold mb-2">Premium Content</h3>
               <p className="text-gray-300 max-w-md mb-6">This video is available exclusively for premium members. Subscribe to unlock access.</p>
               <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-colors">
                 Unlock Now
               </button>
             </div>
        )}

        {/* Video Element */}
        <video
          ref={videoRef}
          src={videoUrl}
          poster={poster}
          className="w-full h-full object-cover"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onClick={togglePlay}
        >
          {transcripts?.map((t, i) => (
             t.src && <track key={i} kind="captions" src={t.src} srcLang={t.language} label={t.language} />
          ))}
        </video>

        {/* Custom Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
          {/* Progress Bar */}
          <div className="relative w-full h-1 bg-gray-600 rounded-full mb-4 cursor-pointer group/progress">
            <div
              className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
            <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity"
              style={{ left: `${(currentTime / duration) * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              <button onClick={togglePlay} className="hover:text-blue-400 transition-colors">
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>

              <div className="flex items-center gap-2 group/volume">
                <button onClick={toggleMute} className="hover:text-blue-400 transition-colors">
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              </div>

              <span className="text-xs font-medium font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className={cn("hover:text-blue-400 transition-colors", showTranscript && "text-blue-400")}
              >
                <Subtitles className="w-5 h-5" />
              </button>
              <button className="hover:text-blue-400 transition-colors">
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transcript Area */}
      {showTranscript && transcripts && transcripts.length > 0 && (
        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
              <Subtitles className="w-4 h-4" />
              Transcript
            </h3>
            {/* Language selector could go here */}
          </div>
          <div className="prose dark:prose-invert max-w-none text-sm h-64 overflow-y-auto custom-scrollbar p-2">
             {/* Simple text display for now. For advanced sync, we'd need to parse VTT or JSON */}
            {transcripts[0].text.split('\n').map((line, i) => (
              <p key={i} className="mb-2 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 p-1 rounded transition-colors cursor-pointer">
                {line}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
