import { getContentBasedRecommendations } from '../src/lib/recommendations';

// Mock ToolMetadata
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockTools: any[] = [
  { slug: 'tool1', title: 'Tool 1', category: 'Cat1', description: '', rating: 4.5, affiliate_link: '' },
  { slug: 'tool2', title: 'Tool 2', category: 'Cat1', description: '', rating: 4.8, affiliate_link: '' },
  { slug: 'tool3', title: 'Tool 3', category: 'Cat1', description: '', rating: 4.2, affiliate_link: '' },
  { slug: 'tool4', title: 'Tool 4', category: 'Cat2', description: '', rating: 5.0, affiliate_link: '' },
  { slug: 'current', title: 'Current', category: 'Cat1', description: '', rating: 4.0, affiliate_link: '' },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const current: any = { slug: 'current', title: 'Current', category: 'Cat1', description: '', rating: 4.0, affiliate_link: '' };

async function test() {
  console.log('Running recommendation test...');
  const recs = getContentBasedRecommendations(current, mockTools, 2);

  console.log('Recommendations:', recs.map(t => `${t.slug} (${t.rating})`));

  if (recs.length !== 2) throw new Error(`Wrong number of recommendations: ${recs.length}`);
  if (recs[0].slug !== 'tool2') throw new Error(`First recommendation should be tool2 (highest rating), got ${recs[0].slug}`);
  if (recs[1].slug !== 'tool1') throw new Error(`Second recommendation should be tool1, got ${recs[1].slug}`);

  console.log('Test passed!');
}

test().catch(e => {
  console.error(e);
  process.exit(1);
});
