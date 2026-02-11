import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';
import GithubSlugger from 'github-slugger';

export interface Heading {
  id: string;
  text: string;
  level: number;
}

// Helper to extract text from MDAST node
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getNodeText(node: any): string {
  if (node.type === 'text' || node.type === 'inlineCode') {
    return node.value || '';
  }
  if (node.children) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return node.children.map((child: any) => getNodeText(child)).join('');
  }
  return '';
}

export function extractHeadings(markdown: string): Heading[] {
  const headings: Heading[] = [];
  const slugger = new GithubSlugger();

  const tree = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .parse(markdown);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  visit(tree, 'heading', (node: any) => {
    const text = getNodeText(node);
    const id = slugger.slug(text);
    headings.push({ id, text, level: node.depth });
  });

  return headings;
}
