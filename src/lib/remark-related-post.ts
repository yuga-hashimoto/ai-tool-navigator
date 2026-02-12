import { visit } from 'unist-util-visit';

export function remarkRelatedPost() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (tree: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    visit(tree, (node: any) => {
      if (
        node.type === 'textDirective' ||
        node.type === 'leafDirective'
      ) {
        if (node.name !== 'related-post') return;

        const data = node.data || (node.data = {});
        const attributes = node.attributes || {};
        const slug = attributes.slug;

        if (!slug) return;

        data.hName = 'related-post';
        data.hProperties = { slug };
      }
    });
  };
}
