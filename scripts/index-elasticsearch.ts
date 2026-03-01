import { elasticClient, INDEX_NAME } from '../src/lib/elasticsearch';
import { getAllToolsRaw, getToolBySlugRaw } from '../src/lib/tools';
import { getAllPostsRaw, getPostBySlugRaw } from '../src/lib/posts';

async function main() {
  if (!elasticClient) {
    console.log('ELASTICSEARCH_URL is not set. Skipping indexing.');
    return;
  }

  try {
    const exists = await elasticClient.indices.exists({ index: INDEX_NAME });
    if (exists) {
      console.log(`Index ${INDEX_NAME} exists. Deleting...`);
      await elasticClient.indices.delete({ index: INDEX_NAME });
    }

    console.log(`Creating index ${INDEX_NAME}...`);
    await elasticClient.indices.create({
      index: INDEX_NAME,
      mappings: {
        properties: {
          title: { type: 'text', analyzer: 'standard' },
          slug: { type: 'keyword' },
          description: { type: 'text', analyzer: 'standard' },
          content: { type: 'text', analyzer: 'standard' },
          category: { type: 'keyword' },
          rating: { type: 'float' },
          pricing: { type: 'keyword' },
          tags: { type: 'keyword' },
          locale: { type: 'keyword' },
          type: { type: 'keyword' }, // 'tool' or 'post'
          created_at: { type: 'date' },
        },
      },
    });

    const locales = ['en', 'ja'];
    const bulkBody: any[] = [];

    for (const locale of locales) {
      console.log(`Fetching tools for locale: ${locale}...`);
      const tools = await getAllToolsRaw(locale);

      for (const tool of tools) {
        // Fetch full content including body
        const fullTool = await getToolBySlugRaw(tool.slug, locale);
        if (!fullTool) continue;

        bulkBody.push({
            index: { _index: INDEX_NAME, _id: `tool-${tool.slug}-${locale}` }
        });
        bulkBody.push({
            title: fullTool.metadata.title,
            slug: fullTool.metadata.slug,
            description: fullTool.metadata.description,
            content: fullTool.content,
            category: fullTool.metadata.category,
            rating: fullTool.metadata.rating,
            pricing: fullTool.metadata.pricing,
            locale: locale,
            type: 'tool',
            image: fullTool.metadata.image,
        });
      }

      console.log(`Fetching posts for locale: ${locale}...`);
      const posts = await getAllPostsRaw(locale);

      for (const post of posts) {
         // Fetch full content including body
         const fullPost = await getPostBySlugRaw(post.slug, locale);
         if (!fullPost) continue;

         bulkBody.push({
             index: { _index: INDEX_NAME, _id: `post-${post.slug}-${locale}` }
         });
         bulkBody.push({
             title: fullPost.metadata.title,
             slug: fullPost.metadata.slug,
             description: fullPost.metadata.excerpt,
             content: fullPost.content,
             tags: fullPost.metadata.tags,
             locale: locale,
             type: 'post',
             created_at: fullPost.metadata.date,
             image: fullPost.metadata.image,
         });
      }
    }

    if (bulkBody.length > 0) {
      console.log(`Indexing ${bulkBody.length / 2} documents...`);
      const bulkResponse = await elasticClient.bulk({ refresh: true, body: bulkBody });

      if (bulkResponse.errors) {
        const erroredDocuments: any[] = [];
        bulkResponse.items.forEach((action: any, i: number) => {
          const operation = Object.keys(action)[0];
          if (action[operation].error) {
            erroredDocuments.push({
              status: action[operation].status,
              error: action[operation].error,
              operation: bulkBody[i * 2],
              document: bulkBody[i * 2 + 1],
            });
          }
        });
        console.error('Bulk index errors:', erroredDocuments);
      } else {
        console.log('Indexing completed successfully.');
      }
    } else {
        console.log('No documents to index.');
    }

  } catch (error) {
    console.error('Error indexing documents:', error);
    process.exit(1);
  }
}

main();
