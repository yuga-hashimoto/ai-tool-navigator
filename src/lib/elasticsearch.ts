import { Client } from '@elastic/elasticsearch';

const ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL;
const ELASTICSEARCH_API_KEY = process.env.ELASTICSEARCH_API_KEY;

let client: Client | null = null;

export const getElasticClient = (): Client | null => {
  if (client) {
    return client;
  }

  if (!ELASTICSEARCH_URL) {
    // Only warn once in development, or maybe use debug logging
    // console.warn('ELASTICSEARCH_URL is not defined. Elasticsearch features will be disabled.');
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const config: any = {
      node: ELASTICSEARCH_URL,
    };

    if (ELASTICSEARCH_API_KEY) {
      config.auth = {
        apiKey: ELASTICSEARCH_API_KEY,
      };
    }

    client = new Client(config);
    return client;
  } catch (error) {
    console.error('Failed to initialize Elasticsearch client:', error);
    return null;
  }
};

export const isElasticsearchConfigured = (): boolean => {
  return !!ELASTICSEARCH_URL;
};
