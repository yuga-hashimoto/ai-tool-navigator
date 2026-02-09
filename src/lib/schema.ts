import { Tool } from "@/lib/tools";

export function generateToolSchema(tool: Tool) {
  const { metadata } = tool;

  const schema: any = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: metadata.title,
    description: metadata.description,
    applicationCategory: metadata.category,
    operatingSystem: "Web", 
  };

  if (metadata.affiliate_link) {
    schema.offers = {
      "@type": "Offer",
      url: metadata.affiliate_link,
    };
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
