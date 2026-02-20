import { Client } from '@elastic/elasticsearch';

const ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';
const ELASTICSEARCH_USERNAME = process.env.ELASTICSEARCH_USERNAME;
const ELASTICSEARCH_PASSWORD = process.env.ELASTICSEARCH_PASSWORD;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const clientConfig: any = {
  node: ELASTICSEARCH_URL,
};

if (ELASTICSEARCH_USERNAME && ELASTICSEARCH_PASSWORD) {
  clientConfig.auth = {
    username: ELASTICSEARCH_USERNAME,
    password: ELASTICSEARCH_PASSWORD,
  };
}

export const esClient = new Client(clientConfig);
