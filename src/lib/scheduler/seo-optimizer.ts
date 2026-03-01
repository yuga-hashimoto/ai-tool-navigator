/**
 * Tool of the Week SEO Optimizer
 * 
 * Provides SEO utilities and keyword research for Tool of the Week content.
 */

export interface SEOKeywords {
  primary: string[];
  secondary: string[];
  longTail: string[];
  related: string[];
  brandKeywords: string[];
}

export interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  canonicalUrl?: string;
  structuredData?: Record<string, unknown>;
}

/**
 * Generate SEO keywords for a tool based on its metadata
 */
export function generateKeywordsForTool(tool: {
  title: string;
  category: string;
  description: string;
  rating: number;
  pros?: string[];
}): SEOKeywords {
  const titleLower = tool.title.toLowerCase();
  const categoryLower = tool.category.toLowerCase();
  
  return {
    primary: [
      `${tool.title} review`,
      `${tool.title}`,
      `${categoryLower} tool`,
      `best ${categoryLower} tool`,
    ],
    secondary: [
      `${tool.title} pricing`,
      `${tool.title} alternatives`,
      `${tool.title} vs competitors`,
      `AI ${categoryLower}`,
      `generative ${categoryLower}`,
    ],
    longTail: [
      `is ${tool.title} worth it`,
      `${tool.title} for beginners`,
      `${tool.title} tutorial`,
      `how to use ${tool.title}`,
      `${tool.title} commercial use`,
    ],
    related: [
      ...extractKeywordsFromPros(tool.pros || []),
      categoryLower,
      'AI tools',
      'productivity tools',
      'automation tools',
    ],
    brandKeywords: [
      'AI Tool Navigator',
      'tool of the week',
      'featured tools',
    ],
  };
}

/**
 * Extract keywords from pros list
 */
function extractKeywordsFromPros(pros: string[]): string[] {
  const keywords: string[] = [];
  const stopWords = ['the', 'and', 'for', 'with', 'that', 'this', 'are', 'has', 'can', 'you'];
  
  pros.forEach(pro => {
    const words = pro.toLowerCase().split(/\s+/).filter(w => 
      w.length > 3 && !stopWords.includes(w)
    );
    keywords.push(...words);
  });
  
  return [...new Set(keywords)];
}

/**
 * Generate meta title for Tool of the Week post
 */
export function generateMetaTitle(
  toolTitle: string,
  category: string,
  includeDate: boolean = false
): string {
  const date = includeDate ? `[${new Date().toLocaleDateString()}] ` : '';
  return `${date}${toolTitle}: Tool of the Week Review | AI Tool Navigator`;
}

/**
 * Generate meta description
 */
export function generateMetaDescription(
  tool: { title: string; description: string; rating?: number; category?: string }
): string {
  const rating = tool.rating ? `${tool.rating}/5 rated ` : '';
  return `Discover ${tool.title}, ${rating}a powerful ${tool.category?.toLowerCase() || 'AI tool'}. Read our in-depth review and see why it's our Tool of the Week. ${tool.description?.substring(0, 60)}...`;
}

/**
 * Generate Open Graph tags
 */
export function generateOpenGraphTags(
  tool: { title: string; description: string; rating: number; category?: string },
  url: string
): Record<string, string> {
  return {
    'og:title': generateMetaTitle(tool.title, tool.category || ''),
    'og:description': generateMetaDescription(tool),
    'og:type': 'article',
    'og:url': url,
    'og:image': `/images/tools/${tool.title.toLowerCase().replace(/\s+/g, '-')}.png`,
    'og:image:width': '1200',
    'og:image:height': '630',
    'og:site_name': 'AI Tool Navigator',
    'article:section': 'Tool of the Week',
    'article:published_time': new Date().toISOString(),
    'article:author': 'AI Tool Navigator Team',
  };
}

/**
 * Generate Twitter Card tags
 */
export function generateTwitterCardTags(
  tool: { title: string; description: string; category?: string }
): Record<string, string> {
  return {
    'twitter:card': 'summary_large_image',
    'twitter:title': generateMetaTitle(tool.title, tool.category || ''),
    'twitter:description': generateMetaDescription(tool),
    'twitter:image': `/images/tools/${tool.title.toLowerCase().replace(/\s+/g, '-')}.png`,
    'twitter:site': '@aitoolnav',
  };
}

/**
 * Generate structured data (JSON-LD) for Tool of the Week
 */
export function generateStructuredData(tool: {
  title: string;
  description: string;
  rating: number;
  category?: string;
  affiliate_link?: string;
  image?: string;
  pros?: string[];
  cons?: string[];
  aggregateOffer?: { url?: string };
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    name: `${tool.title} Review - Tool of the Week`,
    description: tool.description,
    itemReviewed: {
      '@type': 'SoftwareApplication',
      name: tool.title,
      applicationCategory: tool.category || 'DeveloperApplication',
      operatingSystem: 'Web, iOS, Android',
      offers: {
        '@type': 'Offer',
        url: tool.aggregateOffer?.url || tool.affiliate_link,
        priceCurrency: 'USD',
      },
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: tool.rating,
      bestRating: '5',
      worstRating: '1',
    },
    author: {
      '@type': 'Organization',
      name: 'AI Tool Navigator',
      url: 'https://aitoolnav.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'AI Tool Navigator',
      logo: {
        '@type': 'ImageObject',
        url: 'https://aitoolnav.com/logo.png',
      },
    },
    datePublished: new Date().toISOString().split('T')[0],
    inLanguage: 'en',
  };
}

/**
 * Generate internal linking suggestions
 */
export function generateInternalLinks(
  tool: { title: string; category: string; slug: string }
): Array<{ text: string; url: string; anchor: string }> {
  return [
    {
      text: `${tool.category} category`,
      url: `/tools/category/${tool.category.toLowerCase().replace(/\s+/g, '-')}`,
      anchor: 'category',
    },
    {
      text: `All ${tool.category} tools`,
      url: `/tools?category=${encodeURIComponent(tool.category)}`,
      anchor: 'category',
    },
    {
      text: 'featured tools',
      url: '/tools/featured',
      anchor: 'featured',
    },
    {
      text: 'Tool of the Week archive',
      url: '/posts/category/tool-of-the-week',
      anchor: 'archive',
    },
  ];
}

/**
 * Check content SEO score
 */
export function analyzeContentSEO(content: string, keywords: SEOKeywords): {
  score: number;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 100;
  const contentLower = content.toLowerCase();
  
  // Check keyword density
  const primaryKeyword = keywords.primary[0];
  if (primaryKeyword) {
    const keywordCount = (contentLower.match(new RegExp(primaryKeyword, 'gi')) || []).length;
    const wordCount = content.split(/\s+/).length;
    const density = (keywordCount / wordCount) * 100;
    
    if (density < 0.5) {
      issues.push('Primary keyword density too low (< 0.5%)');
      score -= 10;
    } else if (density > 3) {
      issues.push('Primary keyword density too high (> 3%)');
      score -= 10;
    }
  }
  
  // Check heading structure
  if (!content.includes('## ')) {
    suggestions.push('Add H2 headings to improve content structure');
    score -= 5;
  }
  
  // Check internal links
  const internalLinkPattern = /\[\]\(\/|\[.*?\]\(\/tools|\[.*?\]\(\/posts/;
  if (!internalLinkPattern.test(content)) {
    issues.push('No internal links found');
    score -= 10;
  }
  
  // Check content length
  const wordCount = content.split(/\s+/).length;
  if (wordCount < 500) {
    issues.push('Content too short (< 500 words)');
    score -= 15;
  } else if (wordCount < 1000) {
    suggestions.push('Consider expanding content to 1000+ words for better SEO');
    score -= 5;
  }
  
  // Check for images
  if (!content.includes('![')) {
    suggestions.push('Add images with alt text for better SEO');
    score -= 5;
  }
  
  // Check for lists
  if (!content.includes('- ') && !content.includes('* ') && !content.includes('1. ')) {
    suggestions.push('Add bullet or numbered lists to improve readability');
    score -= 5;
  }
  
  return {
    score: Math.max(0, score),
    issues,
    suggestions,
  };
}

/**
 * Generate SEO report for a tool
 */
export function generateSEOReport(
  tool: { title: string; category: string; description: string; rating: number },
  content: string
): {
  keywords: SEOKeywords;
  meta: SEOConfig;
  analysis: ReturnType<typeof analyzeContentSEO>;
} {
  const keywords = generateKeywordsForTool(tool);
  const meta: SEOConfig = {
    title: generateMetaTitle(tool.title, tool.category, true),
    description: generateMetaDescription(tool),
    keywords: [...keywords.primary, ...keywords.secondary],
  };
  const analysis = analyzeContentSEO(content, keywords);
  
  return {
    keywords,
    meta,
    analysis,
  };
}
