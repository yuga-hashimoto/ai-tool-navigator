"use client";

import { useState, useCallback } from 'react';
import { ToolMetadata } from '@/lib/tools';

interface UseQuickViewReturn {
  selectedTool: ToolMetadata | null;
  openQuickView: (tool: ToolMetadata) => void;
  closeQuickView: () => void;
  isQuickViewOpen: boolean;
}

export function useQuickView(): UseQuickViewReturn {
  const [selectedTool, setSelectedTool] = useState<ToolMetadata | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const openQuickView = useCallback((tool: ToolMetadata) => {
    setSelectedTool(tool);
    setIsQuickViewOpen(true);
  }, []);

  const closeQuickView = useCallback(() => {
    setIsQuickViewOpen(false);
    // Clear selected tool after animation
    setTimeout(() => {
      setSelectedTool(null);
    }, 200);
  }, []);

  return {
    selectedTool,
    openQuickView,
    closeQuickView,
    isQuickViewOpen,
  };
}
