import { getAllToolsRaw, ToolMetadata } from '@/lib/tools';
import { client } from '@/lib/elasticsearch';

const INDEX_NAME = 'tools';

async function createIndex() {
  const exists = await client.indices.exists({ index: INDEX_NAME });
  if (exists) {
    console.log(`Index ${INDEX_NAME} already exists. Deleting...`);
    await client.indices.delete({ index: INDEX_NAME });
  }

  console.log(`Creating index ${INDEX_NAME}...`);
  await client.indices.create({
    index: INDEX_NAME,
    mappings: {
      properties: {
        title: {
          type: 'text',
          analyzer: 'standard',
          fields: {
            keyword: {
              type: 'keyword',
              ignore_above: 256
            }
          }
        },
        description: { type: 'text', analyzer: 'standard' },
        category: { type: 'keyword' },
        year: { type: 'integer' },
        slug: { type: 'keyword' },
        rating: { type: 'float' },
        price: { type: 'keyword' }, // e.g., "Free", "$10/mo" - might want keyword for faceting
        pricing: { type: 'keyword' }, // 'free', 'freemium', 'paid'
        platform: { type: 'keyword' },
        locale: { type: 'keyword' },
        tags: { type: 'keyword' },
        // Add more fields as needed
        featured: { type: 'boolean' },
        sponsored: { type: 'boolean' },
        verified: { type: 'boolean' },
      },
    },
  });
}

async function indexTools() {
  const locales = ['en', 'ja'];

  for (const locale of locales) {
    console.log(`Fetching tools for locale: ${locale}`);
    const tools = await getAllToolsRaw(locale);

    if (tools.length === 0) {
      console.log(`No tools found for locale: ${locale}`);
      continue;
    }

    console.log(`Indexing ${tools.length} tools for locale: ${locale}`);

    const operations = tools.flatMap((tool) => {
      const year = tool.last_updated ? new Date(tool.last_updated).getFullYear() : new Date().getFullYear();
      return [
        { index: { _index: INDEX_NAME } },
        {
          ...tool,
          locale,
          year,
          // Ensure price is a string if it's not
          price: tool.price ? String(tool.price) : undefined,
        },
      ];
    });

    const bulkResponse = await client.bulk({ refresh: true, operations });

    if (bulkResponse.errors) {
      const erroredDocuments: any[] = [];
      bulkResponse.items.forEach((action: any, i: number) => {
        const operation = Object.keys(action)[0];
        if (action[operation].error) {
          erroredDocuments.push({
            status: action[operation].status,
            error: action[operation].error,
            operation: operations[i * 2],
            document: operations[i * 2 + 1],
          });
        }
      });
      console.log(erroredDocuments);
    } else {
        console.log(`Successfully indexed ${tools.length} documents for ${locale}.`);
    }
  }
}

async function main() {
  try {
    await createIndex();
    await indexTools();
    console.log('Indexing completed successfully.');
  } catch (error) {
    console.error('Indexing failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { indexTools, createIndex };
