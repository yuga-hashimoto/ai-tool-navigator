import { esClient } from '@/lib/elasticsearch';
import { ToolMetadata } from '@/lib/tools';

const INDEX_NAME = 'tools';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function searchTools(query: string, _locale: string = 'en'): Promise<ToolMetadata[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const searchQuery: any = {
      bool: {
        must: [
          {
            multi_match: {
              query: query,
              fields: [
                'title^3',
                'description^2',
                'category',
                'tags',
                'pros',
                'cons',
              ],
              fuzziness: 'AUTO',
            },
          },
        ],
      },
    };

    const response = await esClient.search({
      index: INDEX_NAME,
      query: searchQuery,
    });

    const hits = response.hits.hits;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return hits.map((hit: any) => {
      const source = hit._source;
      return {
        slug: source.slug,
        title: source.title,
        description: source.description,
        category: source.category,
        tags: source.tags,
        rating: source.rating,
        pros: source.pros,
        cons: source.cons,
        image: source.image,
        affiliate_link: source.affiliate_link,
        pricing: source.pricing,
        platform: source.platform,
        promoted: source.promoted,
        featured: source.featured,
        sponsored: source.sponsored,
        tool_of_the_week: source.tool_of_the_week,
        verified: source.verified,
        // Add other fields as necessary
      } as ToolMetadata;
    });
  } catch (error) {
    console.error('Error searching tools:', error);
    // Return empty array or throw, depending on preference.
    // Given the page logic, returning empty array is safer to avoid crashing the page.
    return [];
  }
}
