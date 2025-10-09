import type { CraftileEditorPlugin } from '@craftile/editor';
import type { Block, UpdatesEvent } from '@craftile/types';

// Import the HTML preview client CDN code
import previewClientCode from '@craftile/preview-client-html/html.cdn.js?raw';

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

    editor.events.on('updates', handleUpdates);
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
<script>
${previewClientCode}
window.HtmlPreviewClient.init();
</script>
</body>
</html>
      `.trim();
    }

    function hasChanges(updates: UpdatesEvent): boolean {
      return (
        updates.changes.added.length > 0 ||
        updates.changes.updated.length > 0 ||
        updates.changes.removed.length > 0 ||
        Object.keys(updates.changes.moved || {}).length > 0
      );
    }

    function handleUpdates(updates: UpdatesEvent) {
      if (!hasChanges(updates)) {
        return;
      }

      // Compute HTML effects for changed blocks
      const effects = computeEffects(updates);

      // Send effects to preview client
      editor.preview.sendMessage('updates.effects', { ...updates, effects });
    }

    function computeEffects(updates: UpdatesEvent) {
      const dirtyBlocks = [...updates.changes.added, ...updates.changes.updated];

      if (dirtyBlocks.length === 0) {
        return { html: {} };
      }

      const blocks = editor.engine.getPage().blocks;
      const effects: { html: Record<string, string> } = {
        html: {},
      };

      updates.changes.removed.forEach((blockId: string) => {
        clearBlockFromCache(blockId);
      });

      // Track parent blocks that need re-rendering for repeated blocks
      const parentsToRerender = new Set<string>();

      dirtyBlocks.forEach((blockId: string) => {
        const block = blocks[blockId];

        if (block) {
          effects.html[blockId] = renderBlock(block, blocks);

          // If this block or any ancestor is repeated, mark parent for re-render
          // This ensures all repeated instances get updated
          let currentBlock: Block | undefined = block;
          while (currentBlock) {
            if (currentBlock.repeated && currentBlock.parentId) {
              parentsToRerender.add(currentBlock.parentId);
              break;
            }
            currentBlock = currentBlock.parentId ? blocks[currentBlock.parentId] : undefined;
          }
        }
      });

      // Generate HTML for parent blocks of repeated blocks
      parentsToRerender.forEach((parentId) => {
        const parent = updates.blocks[parentId];
        if (parent && !effects.html[parentId]) {
          effects.html[parentId] = renderBlock(parent, blocks);
        }
      });

      return effects;
    }

    function clearBlockFromCache(blockId: string) {
      for (const key of renderCache.keys()) {
        if (key.startsWith(`${blockId}:`)) {
          renderCache.delete(key);
        }
      }
    }
  };
};
