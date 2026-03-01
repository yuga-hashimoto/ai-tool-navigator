"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { ToolMetadata } from '@/lib/tools';
import { useQuickAdd } from '@/hooks/useQuickAdd';
import { useAvailability } from '@/hooks/useAvailability';
import { useCompare } from '@/context/CompareContext';
import { Rating } from '@/components/Rating';
import { cn } from '@/lib/utils';
import { sendGAEvent } from '@/lib/analytics';
import { Check, X, Star, Share2, Heart, ShoppingCart } from 'lucide-react';
import Image from 'next/image';

interface QuickViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  tool: ToolMetadata | null;
}

export function QuickViewModal({ isOpen, onClose, tool }: QuickViewModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'pricing'>('overview');
  const { addToCart, isAdding, addedItems } = useQuickAdd();
  const { checkAvailability, availabilityCache } = useAvailability();
  const { selectedSlugs, toggleTool, isSelected } = useCompare();
  const [isAdded, setIsAdded] = useState(false);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Check availability when modal opens
  useEffect(() => {
    if (isOpen && tool) {
      checkAvailability(tool.slug);
      sendGAEvent('quick_view_open', {
        tool_slug: tool.slug,
        tool_name: tool.title,
      });
    }
  }, [isOpen, tool, checkAvailability]);

  // Handle click outside
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!tool) return;
    
    const success = await addToCart(tool);
    if (success) {
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  // Handle compare toggle
  const handleCompareToggle = () => {
    if (!tool) return;
    toggleTool(tool.slug);
  };

  if (!isOpen || !tool) return null;

  const isInCompare = selectedSlugs.includes(tool.slug);
  const availability = availabilityCache[tool.slug];
  const isOutOfStock = availability === false;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-view-title"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 dark:bg-zinc-800/80 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
          aria-label="Close quick view"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 h-full max-h-[90vh] overflow-hidden">
          {/* Image Section */}
          <div className="relative h-64 md:h-auto bg-zinc-100 dark:bg-zinc-800">
            {tool.image && (
              <Image
                src={tool.image}
                alt={tool.title}
                fill
                className={cn(
                  "object-cover transition-opacity duration-300",
                  isImageLoaded ? "opacity-100" : "opacity-0"
                )}
                onLoad={() => setIsImageLoaded(true)}
              />
            )}
            {!isImageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            )}
            
            {/* Quick Actions */}
            <div className="absolute top-4 left-4 flex gap-2">
              {availability !== undefined && (
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium",
                  availability
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                )}>
                  {availability ? 'Available Now' : 'Currently Unavailable'}
                </span>
              )}
              {tool.featured && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                  Featured
                </span>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="overflow-y-auto max-h-[calc(90vh-200px)] md:max-h-[90vh]">
            <div className="p-6">
              {/* Header */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    {tool.category}
                  </span>
                  {tool.sponsored && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      Sponsored
                    </span>
                  )}
                </div>
                
                <h2 id="quick-view-title" className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {tool.title}
                </h2>
                
                <div className="flex items-center gap-3 mt-2">
                  <Rating rating={tool.rating} />
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {tool.rating} / 5.0
                  </span>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-zinc-200 dark:border-zinc-800 mb-4">
                <nav className="flex gap-6">
                  {(['overview', 'features', 'pricing'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "pb-3 text-sm font-medium border-b-2 transition-colors capitalize",
                        activeTab === tab
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="mb-6">
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {tool.description}
                    </p>
                    
                    {/* Quick Specs */}
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      {tool.pricing && (
                        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 block">Pricing</span>
                          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 capitalize">
                            {tool.pricing}
                          </span>
                        </div>
                      )}
                      {tool.price && (
                        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 block">Price</span>
                          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {tool.price}
                          </span>
                        </div>
                      )}
                      {tool.platform && (
                        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 block">Platform</span>
                          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {tool.platform.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'features' && (
                  <div className="space-y-4">
                    {tool.pros && tool.pros.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                          Key Benefits
                        </h3>
                        <ul className="space-y-2">
                          {tool.pros.map((pro, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                              <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {tool.cons && tool.cons.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                          Considerations
                        </h3>
                        <ul className="space-y-2">
                          {tool.cons.map((con, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                              <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'pricing' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                            {tool.pricing ? tool.pricing.charAt(0).toUpperCase() + tool.pricing.slice(1) : 'Contact'}
                          </span>
                          {tool.price && (
                            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                              {tool.price}
                            </div>
                          )}
                        </div>
                        {tool.discount && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-medium">
                            {tool.discount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                {/* Primary Action */}
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding || isOutOfStock}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all",
                    isAdded
                      ? "bg-green-600 text-white"
                      : isOutOfStock
                      ? "bg-zinc-300 text-zinc-500 cursor-not-allowed dark:bg-zinc-700 dark:text-zinc-400"
                      : "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/25"
                  )}
                >
                  {isAdding ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Adding...
                    </>
                  ) : isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      Added to Cart
                    </>
                  ) : isOutOfStock ? (
                    'Out of Stock'
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </>
                  )}
                </button>

                {/* Secondary Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleCompareToggle}
                    disabled={isInCompare && selectedSlugs.length >= 4}
                    className={cn(
                      "flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium transition-colors",
                      isInCompare
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    )}
                  >
                    {isInCompare ? (
                      <>
                        <Check className="w-4 h-4" />
                        In Compare
                      </>
                    ) : (
                      <>
                        <Star className="w-4 h-4" />
                        Compare
                      </>
                    )}
                  </button>
                  
                  <a
                    href={tool.affiliate_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors"
                    onClick={() => sendGAEvent('affiliate_click', {
                      tool_slug: tool.slug,
                      tool_name: tool.title,
                      position: 'quick_view',
                    })}
                  >
                    Visit Site
                  </a>
                </div>

                {/* Tertiary Actions */}
                <div className="flex justify-center gap-4 pt-2">
                  <button
                    className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                    aria-label="Add to favorites"
                  >
                    <Heart className="w-5 h-5" />
                  </button>
                  <button
                    className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                    aria-label="Share"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: tool.title,
                          text: tool.description,
                          url: window.location.origin + `/tools/${tool.slug}`,
                        });
                      }
                    }}
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
