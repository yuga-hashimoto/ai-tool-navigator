import { Client } from '@elastic/elasticsearch';

const ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';
const ELASTICSEARCH_API_KEY = process.env.ELASTICSEARCH_API_KEY;
const ELASTICSEARCH_USERNAME = process.env.ELASTICSEARCH_USERNAME;
const ELASTICSEARCH_PASSWORD = process.env.ELASTICSEARCH_PASSWORD;

const clientConfig: any = {
  node: ELASTICSEARCH_URL,
};

if (ELASTICSEARCH_API_KEY) {
  clientConfig.auth = { apiKey: ELASTICSEARCH_API_KEY };
} else if (ELASTICSEARCH_USERNAME && ELASTICSEARCH_PASSWORD) {
  clientConfig.auth = {
    username: ELASTICSEARCH_USERNAME,
    password: ELASTICSEARCH_PASSWORD,
  };
}

// Global client instance to prevent multiple connections in dev
declare global {
  // eslint-disable-next-line no-var
  var elasticClient: Client | undefined;
}

const client = global.elasticClient || new Client(clientConfig);

if (process.env.NODE_ENV !== 'production') {
  global.elasticClient = client;
}

export { client };
