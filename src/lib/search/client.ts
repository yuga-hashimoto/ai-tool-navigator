import { Client } from '@elastic/elasticsearch';

const globalForElastic = global as unknown as { elasticClient: Client };

export const elasticClient =
  globalForElastic.elasticClient ||
  new Client({
    node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
    auth: {
        username: process.env.ELASTICSEARCH_USERNAME,
        password: process.env.ELASTICSEARCH_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

if (process.env.NODE_ENV !== 'production') globalForElastic.elasticClient = elasticClient;
