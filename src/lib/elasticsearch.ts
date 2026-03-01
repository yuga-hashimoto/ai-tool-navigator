import { Client } from '@elastic/elasticsearch';

const ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL;
const ELASTICSEARCH_API_KEY = process.env.ELASTICSEARCH_API_KEY;

export const elasticClient = ELASTICSEARCH_URL
  ? new Client({
      node: ELASTICSEARCH_URL,
      auth: ELASTICSEARCH_API_KEY ? { apiKey: ELASTICSEARCH_API_KEY } : undefined,
    })
  : null;

export const INDEX_NAME = 'search-index';
