"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface CompareContextType {
  selectedSlugs: string[];
  addTool: (slug: string) => void;
  removeTool: (slug: string) => void;
  toggleTool: (slug: string) => void;
  clearSelection: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem("compare_tools");
    if (saved) {
      try {
        setSelectedSlugs(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse compare_tools", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      // Save to localStorage on change
      localStorage.setItem("compare_tools", JSON.stringify(selectedSlugs));
    }
  }, [selectedSlugs, isLoaded]);

  const addTool = (slug: string) => {
    if (!selectedSlugs.includes(slug)) {
      if (selectedSlugs.length >= 4) {
          alert("You can compare up to 4 tools at a time.");
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
