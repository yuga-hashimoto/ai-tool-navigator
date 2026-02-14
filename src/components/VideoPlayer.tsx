"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { YouTubeEmbed } from "./YouTubeEmbed";

interface VideoPlayerProps {
  src: string; // URL or YouTube ID
  type: 'local' | 'youtube';
  poster?: string;
  captions?: string;
  title?: string;
  monetization?: {
    enabled: boolean;
    type: 'ad' | 'premium';
    adTimestamps?: number[];
  };
  isPremiumUser?: boolean; // Mocked for now. In a real app, this would come from an auth context.
}

export function VideoPlayer({
  src,
  type,
  poster,
  captions,
  title,
  monetization,
  isPremiumUser = false
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showAd, setShowAd] = useState(false);

  // Premium Content Check
  // This logic simulates a premium lock. Real implementation would verify user subscription status.
  const isPremiumLocked = monetization?.enabled && monetization.type === 'premium' && !isPremiumUser;

  useEffect(() => {
    if (monetization?.enabled && monetization.type === 'ad' && isPlaying && !showAd) {
      const timestamps = monetization.adTimestamps || [5]; // Default to 5s if no timestamps

      const shouldShowAd = timestamps.some(t => currentTime >= t && currentTime < t + 0.5);

      if (shouldShowAd) {
        setShowAd(true);
        if (videoRef.current) videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [currentTime, monetization, isPlaying, showAd]);

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

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const skipAd = () => {
    setShowAd(false);
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  if (type === 'youtube') {
    // Basic YouTube Embed doesn't support custom controls/ads easily without API
    // Using existing YouTubeEmbed for simplicity, but wrapping for Premium check
    if (isPremiumLocked) {
      return (
        <div className="relative w-full aspect-video bg-black flex items-center justify-center text-white">
          <div className="text-center p-6 bg-gray-900/80 rounded-xl">
            <h3 className="text-xl font-bold mb-2">Premium Content</h3>
            <p className="mb-4">Subscribe to watch this video.</p>
            <button className="bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700">
              Subscribe Now
            </button>
          </div>
        </div>
      );
    }
    return <YouTubeEmbed videoId={src} title={title} />;
  }

  return (
    <div
      className="relative w-full aspect-video bg-black rounded-xl overflow-hidden group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* HTML5 Video */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onClick={togglePlay}
      >
        {captions && <track kind="captions" src={captions} label="English" default />}
      </video>

      {/* Premium Lock Overlay */}
      {isPremiumLocked && (
        <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center text-white">
          <div className="text-center p-6 bg-gray-800 rounded-xl shadow-2xl border border-gray-700">
            <h3 className="text-2xl font-bold mb-2">Premium Content</h3>
            <p className="mb-6 text-gray-300">This video is available for subscribers only.</p>
            <button className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-semibold">
              Unlock Access
            </button>
          </div>
        </div>
      )}

      {/* Ad Overlay */}
      {showAd && (
        <div className="absolute inset-0 bg-black/90 z-40 flex items-center justify-center text-white">
          <div className="text-center w-full max-w-lg p-6">
            <div className="bg-white text-black p-8 rounded-lg mb-4">
              <h3 className="text-xl font-bold mb-2">Sponsored Ad</h3>
              <p className="text-gray-600">This is a simulated ad advertisement.</p>
              <div className="mt-4 h-2 bg-gray-200 rounded overflow-hidden">
                <div className="h-full bg-blue-500 animate-pulse w-full"></div>
              </div>
            </div>
            <button
              onClick={skipAd}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm transition-colors border border-white/40"
            >
              Skip Ad
            </button>
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      {!isPremiumLocked && (
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 flex flex-col justify-end p-4",
          showControls ? "opacity-100" : "opacity-0"
        )}>
          {/* Progress Bar */}
          <div className="w-full h-1 bg-gray-600 mb-4 rounded-full cursor-pointer relative group/progress">
            <div
              className="h-full bg-indigo-500 rounded-full relative"
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={togglePlay} className="text-white hover:text-indigo-400 transition-colors">
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </button>

              <div className="flex items-center space-x-2 group/volume">
                <button onClick={toggleMute} className="text-white hover:text-indigo-400 transition-colors">
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-0 group-hover/volume:w-20 transition-all duration-300 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                />
              </div>

              <span className="text-white text-sm font-medium">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <button className="text-white hover:text-indigo-400 transition-colors">
                <Settings className="h-5 w-5" />
              </button>
              <button
                onClick={() => videoRef.current?.requestFullscreen()}
                className="text-white hover:text-indigo-400 transition-colors"
              >
                <Maximize className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}
