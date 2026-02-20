import { indexAllTools } from '../src/lib/search/index-tools';

async function main() {
  console.log('Starting indexing...');
  await indexAllTools();
  console.log('Indexing complete.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
