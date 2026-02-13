
import { visit } from 'unist-util-visit';

export function rehypeAdInjection() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (tree: any) => {
    let paragraphCount = 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    visit(tree, 'element', (node: any, index: number | undefined, parent: any) => {
      if (node.tagName === 'p' && parent && typeof index === 'number' && Array.isArray(parent.children)) {
        // Skip specific parents
        if (parent.type === 'element' && ['blockquote', 'li', 'td', 'th', 'a'].includes(parent.tagName)) {
          return;
        }

        paragraphCount++;

        // Insert ad slot after every paragraph
        const adSlot = {
          type: 'element',
          tagName: 'ad-slot',
          properties: {
            index: paragraphCount,
          },
          children: [],
        };

        parent.children.splice(index + 1, 0, adSlot);

        // Skip the inserted node
        return index + 2;
      }
    });
  };
}
