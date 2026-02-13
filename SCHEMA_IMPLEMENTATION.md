# Schema.org JSON-LD Implementation Guide

This document describes the comprehensive Schema.org JSON-LD implementation for AI Tool Navigator.

## Overview

All pages include structured data markup using Schema.org vocabulary to enhance search engine visibility and enable rich snippets in search results.

## Schema Types Implemented

### 1. Organization Schema
- **Location**: Global (layout.tsx)
- **Purpose**: Defines the website organization for Google Knowledge Graph
- **Fields**: name, url, logo, description, foundingDate, sameAs links, contactPoint

### 2. WebSite + SearchAction Schema
- **Location**: Global (layout.tsx)
- **Purpose**: Enables sitelinks search box in search results
- **Fields**: name, url, potentialAction for search

### 3. WebApplication Schema
- **Location**: Homepage (page.tsx)
- **Purpose**: Identifies the platform as a web application
- **Fields**: name, description, applicationCategory, operatingSystem, offers, potentialAction

### 4. SoftwareApplication Schema
- **Location**: Individual tool pages (tools/[slug]/page.tsx)
- **Purpose**: Rich snippets for AI tool listings
- **Fields**: name, description, applicationCategory, operatingSystem, features, offers, aggregateRating, reviews

### 5. Product Schema
- **Location**: Individual tool pages (tools/[slug]/page.tsx)
- **Purpose**: Alternative rich snippets for products/tools
- **Fields**: name, description, brand, category, image, offers, aggregateRating, featureList

### 6. Article Schema
- **Location**: Blog post pages (blog/[slug]/page.tsx)
- **Purpose**: Rich snippets for blog articles
- **Fields**: headline, description, datePublished, dateModified, author, publisher, url, image, keywords

### 7. AboutPage Schema
- **Location**: About page (about/page.tsx)
- **Purpose**: Structured data for the about page
- **Fields**: name, description, url, mainEntity (Organization)

### 8. CollectionPage Schema
- **Location**: Category pages (category/[slug]/page.tsx)
- **Purpose**: Structured data for category/listing pages
- **Fields**: name, description, url, itemCount, mainEntity (ItemList)

### 9. BreadcrumbList Schema
- **Location**: All pages with breadcrumbs
- **Purpose**: Navigation breadcrumb rich snippets
- **Fields**: position, name, item (URL)

## Additional Schema Functions Available

### FAQ Schema
```typescript
import { generateFAQSchema } from "@/lib/schema";

const faqSchema = generateFAQSchema([
  { question: "What is AI?", answer: "AI is..." },
  { question: "How much does it cost?", answer: "It depends..." }
]);
```

### HowTo Schema
```typescript
import { generateHowToSchema } from "@/lib/schema";

const howToSchema = generateHowToSchema({
  title: "How to Use ChatGPT",
  description: "A step-by-step guide",
  totalTime: "PT10M",
  steps: [
    { name: "Step 1", text: "Open the website" },
    { name: "Step 2", text: "Sign up for an account" }
  ],
  image: "/images/howto.jpg"
});
```

### Review Schema
```typescript
import { generateReviewSchema } from "@/lib/schema";

const reviewSchema = generateReviewSchema({
  itemReviewed: "ChatGPT",
  ratingValue: 4.5,
  bestRating: 5,
  reviewBody: "Great tool for...",
  author: "John Doe",
  datePublished: "2024-01-15"
});
```

### AggregateReview Schema
```typescript
import { generateAggregateReviewSchema } from "@/lib/schema";

const aggregateSchema = generateAggregateReviewSchema({
  name: "ChatGPT",
  description: "AI chatbot by OpenAI",
  aggregateRating: {
    ratingValue: 4.5,
    reviewCount: 1500,
    bestRating: 5
  },
  image: "/images/chatgpt.jpg"
});
```

### Comparison Schema
```typescript
import { generateComparisonSchema } from "@/lib/schema";

const comparisonSchema = generateComparisonSchema([
  { name: "ChatGPT", description: "OpenAI's chatbot", url: "/tools/chatgpt", rating: 4.5 },
  { name: "Claude", description: "Anthropic's AI", url: "/tools/claude", rating: 4.7 }
]);
```

## Usage in Pages

### Basic Usage
```typescript
import { generateToolSchema, generateBreadcrumbSchema } from "@/lib/schema";

export default async function ToolPage({ params }) {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Tools", href: "/tools" },
    { label: "ChatGPT" }
  ];
  
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems, locale);
  const toolSchema = generateToolSchema(tool);

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }}
      />
      {/* Page content */}
    </div>
  );
}
```

## Testing and Validation

### Google Rich Results Test
1. Deploy your changes to a staging environment
2. Use the [Google Rich Results Test](https://search.google.com/test/rich-results)
3. Enter your page URL to verify schema markup
4. Check for any errors or warnings

### Schema.org Validator
Use the [Schema.org Validator](https://validator.schema.org/) to verify your markup.

## Best Practices

1. **Multiple Schema Types**: It's okay to include multiple related schema types (e.g., both SoftwareApplication and Product)
2. **JSON-LD Format**: Always use JSON-LD format (not microdata or RDFa)
3. **Placement**: Place schema scripts in the `<head>` or beginning of `<body>`
4. **Validation**: Test each page type after implementation
5. **Updates**: Keep schema updated when page content changes

## Environment Variables

The schemas use the following environment variable:
- `NEXT_PUBLIC_SITE_URL`: The base URL of your site (defaults to `https://ai-tool-navigator.vercel.app`)

## SEO Impact

Proper Schema.org implementation can result in:
- Rich snippets in search results (star ratings, pricing, etc.)
- Knowledge Graph panels for the organization
- Sitelinks search box in search results
- Better content understanding by search engines
- Potential for voice search optimization
