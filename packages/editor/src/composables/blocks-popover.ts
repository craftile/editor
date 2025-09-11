import type { BlockSchema } from '@craftile/types';
import { CRAFTILE_EDITOR_SYMBOL } from '../constants';
import type { CraftileEditor } from '../editor';

export interface InsertBlockContext {
  parentId?: string;
  index?: number;
  regionName?: string;
}

export function useBlocksPopover() {
  const editor = inject<CraftileEditor>(CRAFTILE_EDITOR_SYMBOL);

  if (!editor) {
    throw new Error('useBlocksPopover must be used within a component that has access to CraftileEditor');
  }

  // Emit events to communicate with BlocksPopover component
  const open = ({ anchor, context }: { anchor: HTMLElement; context?: InsertBlockContext }) => {
    editor.events.emit('blocks-popover:open', { anchor, context });
  };

  const close = () => {
    editor.events.emit('blocks-popover:close');
  };

  const getAllowedBlockSchemas = (context: InsertBlockContext): BlockSchema[] => {
    const blocksManager = editor.engine.getBlocksManager();
    const allSchemas = Object.values(blocksManager.getAll());

    if (context.parentId) {
      const parentBlock = editor.engine.getBlockById(context.parentId);
      if (!parentBlock) {
        return [];
      }

      let allowedBlocks = allSchemas.filter((schema) => blocksManager.canBeChild(schema.type, parentBlock.type));

      if (editor.blockFilterFunction) {
        allowedBlocks = allowedBlocks.filter((schema) => {
          return editor.blockFilterFunction!(schema, context);
        });
      }

      return allowedBlocks;
    }

    // Inserting in region
    if (editor.blockFilterFunction) {
      return allSchemas.filter((schema) => {
        return editor.blockFilterFunction!(schema, context);
      });
    }

    return allSchemas;
  };

  /**
   * Helper function to get insertion context for before/after positions
   */
  const getInsertionContext = (targetBlockId: string, position: 'before' | 'after'): InsertBlockContext => {
    const targetBlock = editor.engine.getBlockById(targetBlockId);

    if (!targetBlock) {
      return { regionName: 'main' };
    }

    // If the block has a parent, insert as sibling
    if (targetBlock.parentId) {
      const parent = editor.engine.getBlockById(targetBlock.parentId);
      if (parent) {
        const siblingIndex = parent.children.indexOf(targetBlockId);
        const insertIndex = position === 'before' ? siblingIndex : siblingIndex + 1;
        return {
          parentId: targetBlock.parentId,
          index: insertIndex,
        };
      }
    }

    // Otherwise, find which region contains this block
    for (const region of editor.engine.getPage().regions) {
      const blockIndex = region.blocks.indexOf(targetBlockId);
      if (blockIndex !== -1) {
        const insertIndex = position === 'before' ? blockIndex : blockIndex + 1;
        return {
          regionName: region.name,
          index: insertIndex,
        };
      }
    }

    // Fallback: insert at end of main region
    return { regionName: 'main' };
  };

  return {
    open,
    close,
    getAllowedBlockSchemas,
    getInsertionContext,
  };
}
