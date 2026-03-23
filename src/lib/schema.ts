import { Tool } from "@/lib/tools";
import { Post } from "@/lib/posts";
import { BreadcrumbItem } from "@/components/Breadcrumbs";

const APPLICATION_CATEGORY_MAP: Record<string, string> = {
  "Video Generation": "MultimediaApplication",
  "Writing": "BusinessApplication",
  "Copywriting": "BusinessApplication",
  "Code": "DeveloperApplication",
  "Coding": "DeveloperApplication",
  "Coding Agent": "DeveloperApplication",
  "Coding Assistant": "DeveloperApplication",
  "LLM": "BusinessApplication",
  "Search": "UtilitiesApplication",
  "AI Comparisons": "UtilitiesApplication",
  "AI Coworker": "BusinessApplication",
  "Automation": "BusinessApplication",
  "Business Automation": "BusinessApplication",
  "Comparison": "UtilitiesApplication",
  "LLM/Chatbot": "CommunicationApplication",
  "Marketing": "BusinessApplication",
  "Real Estate": "BusinessApplication",
  "Security": "SecurityApplication",
  "Text-to-Speech": "MultimediaApplication",
  "Upcoming LLM": "BusinessApplication",
  "Website Builder": "DesignApplication",
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-tools-nav.com';

// =====================================================
// ORGANIZATION SCHEMA
// =====================================================
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "AI Tool Navigator",
    "url": SITE_URL,
    "logo": `${SITE_URL}/logo.png`,
    "description": "Discover and compare the best AI tools for writing, coding, image generation, and more. Find the perfect AI solution for your workflow.",
    "foundingDate": "2024",
    "sameAs": [
      "https://twitter.com/aitoolnav",
      "https://github.com/aitoolnav",
      "https://linkedin.com/company/aitoolnav"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "url": `${SITE_URL}/support`,
      "availableLanguage": ["English", "Japanese"]
    }
  };
}

// =====================================================
// LOCAL BUSINESS SCHEMA (for geo targeting)
// =====================================================
export function generateLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "AI Tool Navigator",
    "url": SITE_URL,
    "description": "Discover and compare the best AI tools for writing, coding, image generation, and more. Find the perfect AI solution for your workflow.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${SITE_URL}/?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
}

// =====================================================
// PRODUCT SCHEMA (improved version)
// =====================================================
export function generateProductSchema(tool: Tool) {
  const { metadata } = tool;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": metadata.title,
    "description": metadata.description,
    "brand": {
      "@type": "Brand",
      "name": metadata.title
    },
    "category": metadata.category,
    "image": metadata.image ? `${SITE_URL}${metadata.image}` : undefined,
    "url": `${SITE_URL}/tools/${metadata.slug}`,
    "sku": `tool-${metadata.slug}`,
    "mpn": metadata.slug
  };

  if (metadata.pricing === "free") {
    schema.offers = {
      "@type": "Offer",
      "url": metadata.affiliate_link || `${SITE_URL}/tools/${metadata.slug}`,
      "priceCurrency": "USD",
      "price": "0",
      "availability": "https://schema.org/InStock",
      "validFrom": metadata.last_updated || new Date().toISOString()
    };
  }

  if (metadata.rating) {
    const bestRating = metadata.rating > 5 ? "10" : "5";
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": metadata.rating,
      "reviewCount": metadata.rating_breakdown ? Object.values(metadata.rating_breakdown).reduce((a, b) => a + b, 0) : 1,
      "bestRating": bestRating,
      "worstRating": "1"
    };

    schema.review = {
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": metadata.rating,
        "bestRating": bestRating,
        "worstRating": "1"
      },
      "author": {
        "@type": "Organization",
        "name": "AI Tool Navigator"
      },
      "reviewBody": metadata.description,
      "datePublished": metadata.last_updated || new Date().toISOString()
    };
  }

  if (metadata.pros && metadata.pros.length > 0) {
    schema.featureList = metadata.pros;
  }

  if (metadata.last_updated) {
    schema.releaseDate = metadata.last_updated;
    schema.dateModified = metadata.last_updated;
  }

  return schema;
}

// =====================================================
// SOFTWARE APPLICATION SCHEMA (existing - improved)
// =====================================================
export function generateToolSchema(tool: Tool) {
  const { metadata } = tool;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": metadata.title,
    "description": metadata.description,
    "applicationCategory": APPLICATION_CATEGORY_MAP[metadata.category] || metadata.category || "Application",
    "operatingSystem": "Web, iOS, Android",
    "permissions": "internet-access",
    "version": "1.0",
    "softwareRequirements": "modern-web-browser",
    "image": metadata.image ? `${SITE_URL}${metadata.image}` : undefined,
    "url": `${SITE_URL}/tools/${metadata.slug}`,
    "dateModified": metadata.last_updated || new Date().toISOString()
  };

  if (metadata.pros && metadata.pros.length > 0) {
    schema.featureList = metadata.pros.join(", ");
  }

  if (metadata.affiliate_link && metadata.pricing === "free") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const offer: any = {
      "@type": "Offer",
      "url": metadata.affiliate_link,
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    };
    if (metadata.discount) {
      offer.description = metadata.discount;
    }
    schema.offers = offer;
  }

  if (metadata.rating) {
    const bestRating = metadata.rating > 5 ? "10" : "5";
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": metadata.rating,
      "ratingCount": metadata.rating_breakdown ? Object.values(metadata.rating_breakdown).reduce((a, b) => a + b, 0) : 1,
      "bestRating": bestRating,
      "worstRating": "1"
    };

    schema.review = {
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": metadata.rating,
        "bestRating": bestRating,
        "worstRating": "1"
      },
      "author": {
        "@type": "Organization",
        "name": "AI Tool Navigator"
      },
      "reviewBody": metadata.description,
      "datePublished": metadata.last_updated || new Date().toISOString()
    };
  }

  return schema;
}

// =====================================================
// ARTICLE / BLOG POST SCHEMA (improved)
// =====================================================
export function generateBlogPostSchema(post: Post, url: string) {
  const { metadata } = post;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": metadata.title,
    "description": metadata.excerpt,
    "datePublished": metadata.date,
    "dateModified": metadata.date,
    "author": [{
      "@type": "Person",
      "name": metadata.author,
      "url": `${SITE_URL}/about`
    }],
    "publisher": {
      "@type": "Organization",
      "name": "AI Tool Navigator",
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/logo.png`
      }
    },
    "url": url,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    },
    "articleSection": "Blog",
    "inLanguage": metadata.locale || "en",
    "wordCount": metadata.readingTime ? metadata.readingTime * 200 : 1000
  };

  if (metadata.image) {
    schema.image = {
      "@type": "ImageObject",
      "url": `${SITE_URL}${metadata.image}`,
      "width": "1200",
      "height": "630"
    };
  }

  if (metadata.tags && metadata.tags.length > 0) {
    schema.keywords = metadata.tags.join(", ");
    schema.articleSection = metadata.tags[0];
  }

  return schema;
}

// =====================================================
// ARTICLE SCHEMA (alternative)
// =====================================================
export function generateArticleSchema(article: {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  readingTime?: number;
  tags?: string[];
  locale?: string;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.description,
    "datePublished": article.datePublished,
    "dateModified": article.dateModified || article.datePublished,
    "author": [{
      "@type": "Person",
      "name": article.author,
      "url": `${SITE_URL}/about`
    }],
    "publisher": {
      "@type": "Organization",
      "name": "AI Tool Navigator",
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/logo.png`
      }
    },
    "url": article.url,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": article.url
    },
    "articleSection": "Blog",
    "inLanguage": article.locale || "en",
    "wordCount": article.readingTime ? article.readingTime * 200 : 1000
  };

  if (article.image) {
    schema.image = {
      "@type": "ImageObject",
      "url": `${SITE_URL}${article.image}`,
      "width": "1200",
      "height": "630"
    };
  }

  if (article.tags && article.tags.length > 0) {
    schema.keywords = article.tags.join(", ");
    schema.articleSection = article.tags[0];
  }

  return schema;
}

// =====================================================
// FAQ SCHEMA
// =====================================================
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  const items = faqs.map((faq, index) => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer,
      "upvoteCount": 1
    },
    "position": index + 1
  }));

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": items
  };
}

// =====================================================
// HOWTO SCHEMA
// =====================================================
export function generateHowToSchema(howTo: {
  title: string;
  description: string;
  steps: Array<{ name: string; text: string; url?: string }>;
  totalTime?: string;
  image?: string;
  videoUrl?: string;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": howTo.title,
    "description": howTo.description,
    "totalTime": howTo.totalTime || "PT15M",
    "step": howTo.steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text,
      "url": step.url ? `${SITE_URL}${step.url}` : undefined
    }))
  };

  if (howTo.image) {
    schema.image = `${SITE_URL}${howTo.image}`;
  }

  if (howTo.videoUrl) {
    schema.video = {
      "@type": "VideoObject",
      "name": howTo.title,
      "description": howTo.description,
      "thumbnailUrl": [howTo.image ? `${SITE_URL}${howTo.image}` : `${SITE_URL}/og-image.png`],
      "contentUrl": howTo.videoUrl,
      "embedUrl": howTo.videoUrl.replace('watch?v=', 'embed/')
    };
  }

  return schema;
}

// =====================================================
// REVIEW SCHEMA (standalone)
// =====================================================
export function generateReviewSchema(review: {
  itemReviewed: string;
  ratingValue: number;
  bestRating?: number;
  reviewBody: string;
  author: string;
  datePublished?: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    "itemReviewed": {
      "@type": "Product",
      "name": review.itemReviewed,
      "image": review.image ? `${SITE_URL}${review.image}` : undefined
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": review.ratingValue,
      "bestRating": review.bestRating || "5",
      "worstRating": "1"
    },
    "author": {
      "@type": "Person",
      "name": review.author
    },
    "reviewBody": review.reviewBody,
    "datePublished": review.datePublished || new Date().toISOString(),
    "publisher": {
      "@type": "Organization",
      "name": "AI Tool Navigator"
    }
  };
}

// =====================================================
// AGGREGATE REVIEW SCHEMA
// =====================================================
export function generateAggregateReviewSchema(item: {
  name: string;
  description: string;
  aggregateRating: {
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
    worstRating?: number;
  };
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": item.name,
    "description": item.description,
    "image": item.image ? `${SITE_URL}${item.image}` : undefined,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": item.aggregateRating.ratingValue,
      "reviewCount": item.aggregateRating.reviewCount,
      "bestRating": item.aggregateRating.bestRating || "5",
      "worstRating": item.aggregateRating.worstRating || "1"
    }
  };
}

// =====================================================
// BREADCRUMB SCHEMA (existing)
// =====================================================
export function generateBreadcrumbSchema(items: BreadcrumbItem[], locale: string) {
  const itemListElement = items.map((item, index) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const schemaItem: any = {
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label
    };

    if (item.href) {
      // If href is present, construct full URL
      const path = item.href === '/' ? '' : item.href;
      // Ensure path starts with / if not empty
      const normalizedPath = path.startsWith('/') ? path : `/${path}`;
      // Note: next-intl routing typically handles locale prefixing in Link component,
      // but for schema URL we need absolute URL including locale.
      schemaItem.item = `${SITE_URL}/${locale}${normalizedPath === '/' ? '' : normalizedPath}`;
    }

    return schemaItem;
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": itemListElement
  };
}

// =====================================================
// PLATFORM/WEB APPLICATION SCHEMA (existing - improved)
// =====================================================
export function generatePlatformSchema(description: string, locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "AI Tool Navigator",
    "url": `${SITE_URL}/${locale}`,
    "description": description,
    "applicationCategory": "SearchApplication",
    "applicationSubCategory": "AI Tool Directory",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${SITE_URL}/${locale}?search={search_term_string}`,
        "actionPlatform": [
          "https://schema.org/DesktopWebPlatform",
          "https://schema.org/MobileWebPlatform"
        ]
      },
      "query-input": "required name=search_term_string"
    },
    "softwareVersion": "1.0.0",
    "author": {
      "@type": "Organization",
      "name": "AI Tool Navigator",
      "url": SITE_URL
    }
  };
}

// =====================================================
// WEBPAGE SCHEMA
// =====================================================
export function generateWebPageSchema(page: {
  title: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": page.title,
    "description": page.description,
    "url": page.url,
    "datePublished": page.datePublished || new Date().toISOString(),
    "dateModified": page.dateModified || new Date().toISOString(),
    "image": page.image ? `${SITE_URL}${page.image}` : `${SITE_URL}/og-image.png`,
    "inLanguage": "en",
    "isPartOf": {
      "@type": "WebSite",
      "name": "AI Tool Navigator",
      "url": SITE_URL
    }
  };
}

// =====================================================
// COLLECTION PAGE SCHEMA
// =====================================================
export function generateCollectionPageSchema(collection: {
  name: string;
  description: string;
  url: string;
  itemCount: number;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": collection.name,
    "description": collection.description,
    "url": collection.url,
    "image": collection.image ? `${SITE_URL}${collection.image}` : `${SITE_URL}/og-image.png`,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": collection.itemCount,
      "itemListOrder": "https://schema.org/ItemListUnordered"
    },
    "isPartOf": {
      "@type": "WebSite",
      "name": "AI Tool Navigator",
      "url": SITE_URL
    }
  };
}

// =====================================================
// NAVIGATION MENU SCHEMA
// =====================================================
export function generateSiteNavigationSchema(navItems: Array<{ label: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "SiteNavigationElement",
    "name": "Main Navigation",
    "url": SITE_URL,
    "hasMenuSection": navItems.map((item, index) => ({
      "@type": "MenuSection",
      "name": item.label,
      "url": `${SITE_URL}${item.url}`,
      "position": index + 1
    }))
  };
}

// =====================================================
// SITELINK SEARCH BOX SCHEMA
// =====================================================
export function generateSearchBoxSchema(locale: string = 'en') {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "AI Tool Navigator",
    "url": `${SITE_URL}/${locale}`,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${SITE_URL}/${locale}?search={search_term_string}`,
        "actionPlatform": [
          "https://schema.org/DesktopWebPlatform",
          "https://schema.org/MobileWebPlatform"
        ]
      },
      "query-input": "required name=search_term_string"
    }
  };
}

// =====================================================
// COMPARISON TABLE SCHEMA
// =====================================================
export function generateComparisonSchema(products: Array<{
  name: string;
  description: string;
  url: string;
  image?: string;
  rating?: number;
  price?: string;
}>) {
  return {
    "@context": "https://schema.org",
    "@type": "Table",
    "about": "AI Tools Comparison",
    "description": "Comparison of AI tools including features, pricing, and ratings",
    "associatedMedia": {
      "@type": "MediaObject",
      "name": "AI Tools Comparison"
    },
    "hasPart": products.map((product, index) => ({
      "@type": "WebPage",
      "name": product.name,
      "description": product.description,
      "url": product.url,
      "position": index + 1
    }))
  };
}

// =====================================================
// SPONSORED CONTENT SCHEMA
// =====================================================
export function generateSponsoredContentSchema(content: {
  name: string;
  description: string;
  url: string;
  sponsorName: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "name": content.name,
    "description": content.description,
    "url": content.url,
    "image": content.image ? `${SITE_URL}${content.image}` : `${SITE_URL}/og-image.png`,
    "publisher": {
      "@type": "Organization",
      "name": content.sponsorName
    },
    "isNativeAdvertising": true,
    "isPartOf": {
      "@type": "WebSite",
      "name": "AI Tool Navigator",
      "url": SITE_URL
    }
  };
}

// =====================================================
// NEWS ARTICLE SCHEMA (for news/blog posts)
// =====================================================
export function generateNewsArticleSchema(article: {
  headline: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  publisher?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.headline,
    "description": article.description,
    "url": article.url,
    "datePublished": article.datePublished,
    "dateModified": article.dateModified || article.datePublished,
    "author": [{
      "@type": "Person",
      "name": article.author
    }],
    "publisher": {
      "@type": "Organization",
      "name": article.publisher || "AI Tool Navigator",
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/logo.png`
      }
    },
    "image": article.image ? `${SITE_URL}${article.image}` : `${SITE_URL}/og-image.png`,
    "articleSection": "News",
    "inLanguage": "en",
    "isPartOf": {
      "@type": "WebSite",
      "name": "AI Tool Navigator",
      "url": SITE_URL
    }
  };
}

// =====================================================
// PERSON SCHEMA
// =====================================================
export function generatePersonSchema(person: {
  name: string;
  url?: string;
  jobTitle?: string;
  worksFor?: string;
  description?: string;
  image?: string;
  sameAs?: string[];
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": person.name,
    "url": person.url || SITE_URL
  };

  if (person.jobTitle) {
    schema.jobTitle = person.jobTitle;
  }

  if (person.worksFor) {
    schema.worksFor = {
      "@type": "Organization",
      "name": person.worksFor,
      "url": SITE_URL
    };
  }

  if (person.description) {
    schema.description = person.description;
  }

  if (person.image) {
    schema.image = `${SITE_URL}${person.image}`;
  }

  if (person.sameAs && person.sameAs.length > 0) {
    schema.sameAs = person.sameAs;
  }

  return schema;
}

// =====================================================
// AboutPage Organization Schema
// =====================================================
export function generateAboutPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About AI Tool Navigator",
    "description": "AI Tool Navigator helps you discover and compare the best AI tools for your workflow.",
    "url": `${SITE_URL}/about`,
    "mainEntity": {
      "@type": "Organization",
      "name": "AI Tool Navigator",
      "url": SITE_URL,
      "logo": `${SITE_URL}/logo.png`,
      "description": "Discover and compare the best AI tools for writing, coding, image generation, and more.",
      "foundingDate": "2024",
      "sameAs": [
        "https://twitter.com/aitoolnav",
        "https://github.com/aitoolnav"
      ]
    }
  };
}

// =====================================================
// DYNAMIC SCHEMA GENERATION HELPERS
// =====================================================

/**
 * Generates all applicable schemas for a given page type
 * Useful for comprehensive schema coverage
 */
export function generatePageSchemas(pageType: string, data: Record<string, unknown>, locale: string = 'en') {
  switch (pageType) {
    case 'homepage':
      return [
        generateOrganizationSchema(),
        generateSearchBoxSchema(locale),
        generatePlatformSchema(typeof data.description === 'string' ? data.description : '', locale)
      ];
    case 'tool':
      return [
        generateToolSchema(data.tool as Tool),
        generateProductSchema(data.tool as Tool),
        generateBreadcrumbSchema(data.breadcrumbItems as BreadcrumbItem[], locale)
      ];
    case 'blog':
      return [
        generateBlogPostSchema(data.post as Post, data.url as string),
        generateBreadcrumbSchema(data.breadcrumbItems as BreadcrumbItem[], locale)
      ];
    case 'category':
      return [
        generateCollectionPageSchema(data.collection as { name: string; description: string; url: string; itemCount: number; image?: string }),
        generateBreadcrumbSchema(data.breadcrumbItems as BreadcrumbItem[], locale)
      ];
    case 'about':
      return [
        generateAboutPageSchema(),
        generateOrganizationSchema()
      ];
    default:
      return [];
  }
}

/**
 * Validates basic schema structure
 * Returns array of validation errors (empty if valid)
 */
export function validateSchema(schema: Record<string, unknown>): string[] {
  const errors: string[] = [];

  if (!schema['@context']) {
    errors.push('Missing @context');
  }

  if (!schema['@type']) {
    errors.push('Missing @type');
  }

  // Check for @context validity
  if (schema['@context'] && schema['@context'] !== 'https://schema.org') {
    errors.push('Invalid @context value');
  }

  return errors;
}
