import type { CraftileEditorPlugin } from '@craftile/editor';
import type { Block } from '@craftile/types';

export interface BlockRenderer {
  (props: { id: string; props: Record<string, any>; block: Block; editorAttributes: string; children: string }): string;
}

export interface StaticBlocksRendererOptions {
  styles?: string[];
  scripts?: string[];
  blockRenderers?: Record<string, BlockRenderer>;
}

export default (options: StaticBlocksRendererOptions = {}): CraftileEditorPlugin => {
  return ({ editor }) => {
    const renderCache = new Map<string, string>();

    loadInitialPreview();

    function generateEditorAttributes(blockId: string): string {
      return `data-block="${blockId}"`;
    }

    function loadInitialPreview() {
      editor.preview.loadFromHtml(buildPreviewHtml(editor.engine.getPage()));
    }

    function renderBlock(block: Block, blocks: Record<string, Block>): string {
      const cacheKey = `${block.id}:${JSON.stringify(block.properties)}:${block.children.join(',')}`;

      if (renderCache.has(cacheKey)) {
        return renderCache.get(cacheKey)!;
      }

      let renderer: BlockRenderer;

      if (options.blockRenderers?.[block.type]) {
        renderer = options.blockRenderers[block.type];
      } else {
        // Fallback to schema renderer or default
        const schema = editor.engine.getBlockSchema(block.type);
        renderer =
          typeof schema?.meta?.render === 'function'
            ? schema.meta.render
            : ({ block, editorAttributes }) =>
                `<div ${editorAttributes}><em>Unknown block type: ${block.type}</em></div>`;
      }

      const children = Array.isArray(block.children)
        ? block.children.map((childId: string) => renderBlock(blocks[childId], blocks)).join('')
        : '';

      const editorAttributes = generateEditorAttributes(block.id);

      let html: string;
      try {
        html = renderer({ id: block.id, props: block.properties, block, editorAttributes, children });
      } catch (error) {
        console.warn(`Render error for block ${block.id}:`, error);
        html = `<div ${editorAttributes} class="render-error">
        <em>⚠️ Render Error: ${error instanceof Error ? error.message : 'Unknown error'}</em>
      </div>`;
      }

      renderCache.set(cacheKey, html);

      return html;
    }

    function buildPreviewHtml(page: {
      regions: Array<{ name: string; blocks: string[] }>;
      blocks: Record<string, Block>;
    }) {
      const regionsHtml = (page.regions ?? [])
        .map((region) => {
          const blocksHtml = region.blocks
            .map((blockId: string) => renderBlock(page.blocks[blockId], page.blocks))
            .join('\n');

          return `<!--BEGIN region: ${region.name}-->\n${blocksHtml}\n<!--END region: ${region.name}-->`;
        })
        .join('\n');

      const customStyles = (options.styles || [])
        .map((styleUrl) => `  <link rel="stylesheet" href="${styleUrl}" />`)
        .join('\n');

      const customScripts = (options.scripts || [])
        .map((scriptUrl) => `<script src="${scriptUrl}"></script>`)
        .join('\n');

      return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
${customStyles}
</head>
<body>
${regionsHtml}

${customScripts}
</body>
</html>
      `.trim();
    }
  };
};
