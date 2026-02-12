import { visit } from 'unist-util-visit';

interface Options {
  slot: string;
  interval?: number;
}

export default function rehypeGoogleAdsense(options: Options) {
  const { slot, interval = 4 } = options;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (tree: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    visit(tree, 'root', (node: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newChildren: any[] = [];
      let pCount = 0;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      node.children.forEach((child: any) => {
        newChildren.push(child);
        if (child.type === 'element' && child.tagName === 'p') {
          pCount++;
          if (pCount > 0 && pCount % interval === 0) {
            newChildren.push({
              type: 'element',
              tagName: 'google-adsense-slot',
              properties: { slot },
              children: [],
            });
          }
        }
      });

      node.children = newChildren;
    });
  };
}
