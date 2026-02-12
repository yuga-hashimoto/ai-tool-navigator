import { visit } from 'unist-util-visit';

export function remarkYoutube() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (tree: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    visit(tree, (node: any) => {
      if (
        node.type === 'textDirective' ||
        node.type === 'leafDirective'
      ) {
        if (node.name !== 'youtube') return;

        const data = node.data || (node.data = {});
        const attributes = node.attributes || {};
        const videoId = attributes.id;
        const title = attributes.title;

        if (!videoId) return;

        data.hName = 'youtube-embed';
        data.hProperties = { videoId, title };
      }
    });
  };
}
