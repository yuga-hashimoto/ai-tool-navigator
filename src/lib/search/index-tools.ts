import { elasticClient } from './client';
import { getAllToolsRaw } from '@/lib/tools';

const INDEX_NAME = 'tools';

export async function createIndex() {
  try {
    const indexExists = await elasticClient.indices.exists({ index: INDEX_NAME });

    if (!indexExists) {
      await elasticClient.indices.create({
        index: INDEX_NAME,
        body: {
          settings: {
            analysis: {
              analyzer: {
                autocomplete: {
                  tokenizer: 'autocomplete',
                  filter: ['lowercase'],
                },
                autocomplete_search: {
                  tokenizer: 'lowercase',
                },
              },
              tokenizer: {
                autocomplete: {
                  type: 'edge_ngram',
                  min_gram: 2,
                  max_gram: 10,
                  token_chars: ['letter', 'digit'],
                },
              },
            },
          },
          mappings: {
            properties: {
              title: {
                type: 'text',
                analyzer: 'autocomplete',
                search_analyzer: 'autocomplete_search',
                fields: {
                  keyword: { type: 'keyword' }
                }
              },
              description: { type: 'text' },
              category: { type: 'keyword' },
              tags: { type: 'keyword' },
              slug: { type: 'keyword' },
              pricing: { type: 'keyword' },
              platform: { type: 'keyword' },
              rating: { type: 'float' },
              pros: { type: 'text' },
              cons: { type: 'text' },
              featured: { type: 'boolean' },
              sponsored: { type: 'boolean' },
              promoted: { type: 'boolean' },
              discount: { type: 'keyword' },
              image: { type: 'text', index: false },
              affiliate_link: { type: 'text', index: false }
            },
          },
        },
      });
      console.log(`Index ${INDEX_NAME} created.`);
    }
  } catch (error) {
    console.error('Error creating index:', error);
    // Don't throw, allow app to proceed (e.g. if ES is down)
  }
}

export async function indexAllTools() {
  try {
    await createIndex();

    const tools = await getAllToolsRaw('en');

    if (tools.length === 0) {
      console.log('No tools found to index.');
      return;
    }

    const operations = tools.flatMap((tool) => [
      { index: { _index: INDEX_NAME, _id: tool.slug } },
      {
        title: tool.title,
        description: tool.description,
        category: tool.category,
        tags: tool.tags || [],
        slug: tool.slug,
        pricing: tool.pricing,
        platform: tool.platform || [],
        rating: tool.rating || 0,
        pros: tool.pros || [],
        cons: tool.cons || [],
        featured: !!tool.featured,
        sponsored: !!tool.sponsored,
        promoted: !!tool.promoted,
        discount: tool.discount,
        image: tool.image,
        affiliate_link: tool.affiliate_link
      },
    ]);

    const bulkResponse = await elasticClient.bulk({ refresh: true, operations });

    if (bulkResponse.errors) {
      const erroredDocuments: any[] = [];
      bulkResponse.items.forEach((action: any, i) => {
        const operation = Object.keys(action)[0];
        if (action[operation].error) {
          erroredDocuments.push({
            status: action[operation].status,
            error: action[operation].error,
            id: operations[i * 2],
          });
        }
      });
      console.log('Some documents failed to index:', erroredDocuments);
    } else {
      console.log(`Successfully indexed ${tools.length} tools.`);
    }
  } catch (error) {
    console.error('Error indexing tools:', error);
  }
}
