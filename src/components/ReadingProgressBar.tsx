"use client";

import { useEffect, useState } from "react";

export function ReadingProgressBar() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    let requestFrame: number;

    const calculateProgress = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;

      const totalScroll = documentHeight - windowHeight;

      if (totalScroll <= 0) {
        setWidth(0);
        return;
      }

      const currentProgress = (scrollTop / totalScroll) * 100;
      setWidth(Math.min(100, Math.max(0, currentProgress)));
    };

    const handleScrollOrResize = () => {
      cancelAnimationFrame(requestFrame);
      requestFrame = requestAnimationFrame(calculateProgress);
    };

    // Initial calculation
    calculateProgress();

    window.addEventListener("scroll", handleScrollOrResize);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize);
      window.removeEventListener("resize", handleScrollOrResize);
      cancelAnimationFrame(requestFrame);
    };
  }, []);

  return (
    <div
      className="fixed top-0 left-0 h-1 bg-blue-600 z-[60] transition-all duration-150 ease-out"
      style={{ width: `${width}%` }}
    />
  );
}
