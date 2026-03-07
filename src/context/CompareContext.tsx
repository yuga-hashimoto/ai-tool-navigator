"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";

interface CompareContextType {
  selectedSlugs: string[];
  addTool: (slug: string) => void;
  removeTool: (slug: string) => void;
  toggleTool: (slug: string) => void;
  clearSelection: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

function normalizeCompareSelection(slugs: unknown): string[] {
  if (!Array.isArray(slugs)) {
    return [];
  }

  return Array.from(
    new Set(
      slugs
        .map((slug) => String(slug).trim())
        .filter(Boolean)
    )
  ).slice(0, 4);
}

function haveSameSelection(current: string[], next: string[]): boolean {
  return current.length === next.length && current.every((slug, index) => slug === next[index]);
}

export function CompareProvider({ children }: { children: ReactNode }) {
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isJapanese = pathname?.startsWith("/ja");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoaded(true);
    // Load from localStorage on mount
    const saved = localStorage.getItem("compare_tools");
    if (saved) {
      try {
        setSelectedSlugs(normalizeCompareSelection(JSON.parse(saved)));
      } catch (e) {
        console.error("Failed to parse compare_tools", e);
      }
    }
  }, []);

  useEffect(() => {
    if (!pathname?.includes("/compare")) {
      return;
    }

    const toolsParam = searchParams.get("tools");
    if (!toolsParam) {
      return;
    }

    const querySelection = normalizeCompareSelection(toolsParam.split(","));
    if (querySelection.length === 0) {
      return;
    }

    const timerId = window.setTimeout(() => {
      setSelectedSlugs((current) =>
        haveSameSelection(current, querySelection) ? current : querySelection
      );
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [pathname, searchParams]);

  useEffect(() => {
    if (isLoaded) {
      // Save to localStorage on change
      localStorage.setItem("compare_tools", JSON.stringify(selectedSlugs));
    }
  }, [selectedSlugs, isLoaded]);

  const addTool = (slug: string) => {
    if (!selectedSlugs.includes(slug)) {
      if (selectedSlugs.length >= 4) {
          alert(isJapanese ? "最大4ツールまで比較できます。" : "You can compare up to 4 tools at a time.");
          return;
      }
      setSelectedSlugs((prev) => [...prev, slug]);
    }
  };

  const removeTool = (slug: string) => {
    setSelectedSlugs((prev) => prev.filter((s) => s !== slug));
  };

  const toggleTool = (slug: string) => {
    if (selectedSlugs.includes(slug)) {
      removeTool(slug);
    } else {
      addTool(slug);
    }
  };

  const clearSelection = () => {
    setSelectedSlugs([]);
  };

  return (
    <CompareContext.Provider
      value={{ selectedSlugs, addTool, removeTool, toggleTool, clearSelection }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
}
