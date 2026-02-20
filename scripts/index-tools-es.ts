import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { esClient } from '@/lib/elasticsearch';

const toolsDirectory = path.join(process.cwd(), 'content/tools');
const INDEX_NAME = 'tools';

async function indexTools() {
  const enDirectory = path.join(toolsDirectory, 'en');
  if (!fs.existsSync(enDirectory)) {
    console.log('No tools found in content/tools/en');
    return;
  }

  const fileNames = fs.readdirSync(enDirectory);
  console.log(`Found ${fileNames.length} files to index.`);

  // Check if index exists
  const indexExists = await esClient.indices.exists({ index: INDEX_NAME });

  if (!indexExists) {
    console.log(`Creating index: ${INDEX_NAME}`);
    await esClient.indices.create({
      index: INDEX_NAME,
      body: {
        mappings: {
          properties: {
            slug: { type: 'keyword' },
            title: { type: 'text', analyzer: 'standard' },
            description: { type: 'text', analyzer: 'standard' },
            category: { type: 'keyword' },
            tags: { type: 'keyword' },
            rating: { type: 'float' },
            pros: { type: 'text', analyzer: 'standard' },
            cons: { type: 'text', analyzer: 'standard' },
            image: { type: 'keyword' },
            affiliate_link: { type: 'keyword' },
            pricing: { type: 'keyword' },
            platform: { type: 'keyword' },
            promoted: { type: 'boolean' },
            featured: { type: 'boolean' },
            sponsored: { type: 'boolean' },
            tool_of_the_week: { type: 'boolean' },
            verified: { type: 'boolean' },
          },
        },
      },
    });
  }

  const bulkOperations = [];

  for (const fileName of fileNames) {
    if (!fileName.endsWith('.md')) continue;

    const slug = fileName.replace(/\.md$/, '');
    const fullPath = path.join(enDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data } = matter(fileContents);

    const doc = {
      slug,
      title: data.title,
      description: data.description,
      category: data.category,
      tags: data.tags || [],
      rating: data.rating,
      pros: data.pros || [],
      cons: data.cons || [],
      image: data.image,
      affiliate_link: data.affiliate_link,
      pricing: data.pricing,
      platform: data.platform || [],
      promoted: data.promoted || false,
      featured: data.featured || false,
      sponsored: data.sponsored || false,
      tool_of_the_week: data.tool_of_the_week || false,
      verified: data.verified || false,
    };

    bulkOperations.push({ index: { _index: INDEX_NAME, _id: slug } });
    bulkOperations.push(doc);
  }

  if (bulkOperations.length > 0) {
    console.log(`Indexing ${bulkOperations.length / 2} documents...`);
    const bulkResponse = await esClient.bulk({ refresh: true, body: bulkOperations });

    if (bulkResponse.errors) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const erroredDocuments: any[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      bulkResponse.items.forEach((action: any, i: number) => {
        const operation = Object.keys(action)[0];
        if (action[operation].error) {
          erroredDocuments.push({
            status: action[operation].status,
            error: action[operation].error,
            operation: bulkOperations[i * 2],
            document: bulkOperations[i * 2 + 1],
          });
        }
      });
      console.error('Some documents failed to index:', erroredDocuments);
    } else {
      console.log('Successfully indexed all documents.');
    }
  } else {
    console.log('No documents to index.');
  }
}

indexTools()
  .catch((e) => {
    console.error('Error indexing tools:', e);
    process.exit(1);
  });
