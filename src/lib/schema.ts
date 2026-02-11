import { Tool } from "@/lib/tools";

const APPLICATION_CATEGORY_MAP: Record<string, string> = {
  "Video Generation": "Multimedia",
  "Writing": "Productivity",
  "Copywriting": "Business",
  "Code": "Developer",
  "Coding": "Developer",
  "Coding Agent": "Developer",
  "LLM": "Productivity",
  "Search": "Utilities",
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
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: metadata.rating,
      ratingCount: 1,
      bestRating: "5",
      worstRating: "1",
    };
  }

  return schema;
}
