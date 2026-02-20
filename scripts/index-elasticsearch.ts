import { getAllToolsRaw, getToolBySlugRaw } from '../src/lib/tools';
import { getAllPostsRaw, getPostBySlugRaw } from '../src/lib/posts';
import { getElasticClient } from '../src/lib/elasticsearch';

const indexTools = async (client: any, dryRun: boolean) => {
  console.log('Fetching tools...');
  const tools = await getAllToolsRaw();
  console.log(`Found ${tools.length} tools.`);

  const bulkOperations: any[] = [];

  for (const tool of tools) {
    const fullTool = await getToolBySlugRaw(tool.slug);
    if (!fullTool) continue;

    const doc = {
      slug: tool.slug,
      title: tool.title,
      description: tool.description,
      content: fullTool.content,
      category: tool.category,
      tags: tool.tags || [],
      pricing: tool.pricing,
      price: tool.price,
      rating: tool.rating,
      platform: tool.platform,
      last_updated: tool.last_updated,
      type: 'tool'
    };

    bulkOperations.push({ index: { _index: 'tools', _id: tool.slug } });
    bulkOperations.push(doc);
  }

  if (dryRun) {
    console.log(`[DRY RUN] Would index ${tools.length} tools.`);
    if (bulkOperations.length > 0) {
      console.log('Sample document:', JSON.stringify(bulkOperations[1], null, 2));
    }
  } else {
    if (client) {
        console.log(`Indexing ${tools.length} tools...`);
        // Check if index exists, if not create it with mappings
        const indexExists = await client.indices.exists({ index: 'tools' });
        if (!indexExists) {
            await client.indices.create({
                index: 'tools',
                mappings: {
                    properties: {
                        slug: { type: 'keyword' },
                        title: { type: 'text', boost: 3 },
                        description: { type: 'text', boost: 2 },
                        content: { type: 'text' },
                        category: { type: 'keyword' },
                        tags: { type: 'keyword' },
                        pricing: { type: 'keyword' },
                        rating: { type: 'float' },
                        last_updated: { type: 'date' }
                    }
                }
            });
        }

        const result = await client.bulk({ body: bulkOperations });
        if (result.errors) {
            console.error('Errors occurred during bulk indexing:', JSON.stringify(result.items.filter((item: any) => item.index && item.index.error), null, 2));
        } else {
            console.log(`Successfully indexed ${tools.length} tools.`);
        }
    } else {
        console.error('Elasticsearch client not initialized.');
    }
  }
};

const indexPosts = async (client: any, dryRun: boolean) => {
  console.log('Fetching posts...');
  const posts = await getAllPostsRaw();
  console.log(`Found ${posts.length} posts.`);

  const bulkOperations: any[] = [];

  for (const post of posts) {
    const fullPost = await getPostBySlugRaw(post.slug);
    if (!fullPost) continue;

    const doc = {
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      content: fullPost.content,
      author: post.author,
      date: post.date,
      tags: post.tags || [],
      readingTime: post.readingTime,
      type: 'post'
    };

    bulkOperations.push({ index: { _index: 'posts', _id: post.slug } });
    bulkOperations.push(doc);
  }

  if (dryRun) {
    console.log(`[DRY RUN] Would index ${posts.length} posts.`);
    if (bulkOperations.length > 0) {
      console.log('Sample document:', JSON.stringify(bulkOperations[1], null, 2));
    }
  } else {
    if (client) {
        console.log(`Indexing ${posts.length} posts...`);
         const indexExists = await client.indices.exists({ index: 'posts' });
        if (!indexExists) {
            await client.indices.create({
                index: 'posts',
                mappings: {
                    properties: {
                        slug: { type: 'keyword' },
                        title: { type: 'text', boost: 3 },
                        excerpt: { type: 'text', boost: 2 },
                        content: { type: 'text' },
                        author: { type: 'keyword' },
                        tags: { type: 'keyword' },
                        date: { type: 'date' }
                    }
                }
            });
        }

        const result = await client.bulk({ body: bulkOperations });
        if (result.errors) {
             console.error('Errors occurred during bulk indexing:', JSON.stringify(result.items.filter((item: any) => item.index && item.index.error), null, 2));
        } else {
            console.log(`Successfully indexed ${posts.length} posts.`);
        }
    } else {
        console.error('Elasticsearch client not initialized.');
    }
  }
};

const main = async () => {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  const client = getElasticClient();

  if (!client && !dryRun) {
    console.error('Elasticsearch client could not be initialized. Set ELASTICSEARCH_URL or use --dry-run.');
    process.exit(1);
  }

  try {
    await indexTools(client, dryRun);
    await indexPosts(client, dryRun);
  } catch (error) {
    console.error('An error occurred:', error);
    process.exit(1);
  }
};

main();
