import { Tool } from "@/lib/tools";
import { Post } from "@/lib/posts";

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

export function generateToolSchema(tool: Tool) {
  const { metadata } = tool;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: metadata.title,
    description: metadata.description,
    applicationCategory: APPLICATION_CATEGORY_MAP[metadata.category] || metadata.category || "Application",
    operatingSystem: "Web",
  };

  if (metadata.last_updated) {
    schema.dateModified = metadata.last_updated;
  }

  if (metadata.pros && metadata.pros.length > 0) {
    schema.featureList = metadata.pros;
  }

  if (metadata.affiliate_link) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const offer: any = {
      "@type": "Offer",
      url: metadata.affiliate_link,
      price: "0",
      priceCurrency: "USD",
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
      ratingValue: metadata.rating,
      ratingCount: 1,
      bestRating: bestRating,
      worstRating: "1",
    };

    schema.review = {
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: metadata.rating,
        bestRating: bestRating,
        worstRating: "1",
      },
      author: {
        "@type": "Organization",
        name: "AI Tool Navigator",
      },
      reviewBody: metadata.description,
    };
  }

  return schema;
}

export function generateBlogPostSchema(post: Post, url: string) {
  const { metadata } = post;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: metadata.title,
    description: metadata.excerpt,
    datePublished: metadata.date,
    dateModified: metadata.date,
    author: {
      "@type": "Person",
      name: metadata.author,
    },
    publisher: {
      "@type": "Organization",
      name: "AI Tool Navigator",
    },
    url: url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  if (metadata.image) {
    schema.image = metadata.image;
  }

  return schema;
}
