import { visit } from 'unist-util-visit';

export function remarkComparisonTable() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (tree: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    visit(tree, (node: any) => {
      if (
        node.type === 'textDirective' ||
        node.type === 'leafDirective'
      ) {
        if (node.name !== 'comparison-table') return;

        const data = node.data || (node.data = {});
        const attributes = node.attributes || {};
        const tools = attributes.tools;

        if (!tools) return;

        data.hName = 'comparison-table';
        data.hProperties = { tools };
      }
    });
  };
}
