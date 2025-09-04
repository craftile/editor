import type { BlockSchema } from '@craftile/types';
import { CRAFTILE_EDITOR_SYMBOL } from '../constants';
import type { CraftileEditor } from '../editor';

export interface InsertBlockContext {
  parentId?: string;
  index?: number;
  regionName?: string;
}

interface UseBlocksPopoverReturn {
  open: (args: { anchor: HTMLElement; context?: InsertBlockContext }) => void;
  close: () => void;
  getAllowedBlockSchemas: (context: InsertBlockContext) => BlockSchema[];
}

export function useBlocksPopover(): UseBlocksPopoverReturn {
  const editor = inject<CraftileEditor>(CRAFTILE_EDITOR_SYMBOL);

  if (!editor) {
    throw new Error('useBlocksPopover must be used within a component that has access to CraftileEditor');
  }

  const { engine, getBlockById } = useCraftileEngine();

  // Emit events to communicate with BlocksPopover component
  const open = ({ anchor, context }: { anchor: HTMLElement; context?: InsertBlockContext }) => {
    editor.events.emit('blocks-popover:open', { anchor, context });
  };

  const close = () => {
    editor.events.emit('blocks-popover:close');
  };

  const getAllowedBlockSchemas = (context: InsertBlockContext): BlockSchema[] => {
    const blocksManager = engine.getBlocksManager();
    const allSchemas = Object.values(blocksManager.getAll());

    if (context.parentId) {
      const parentBlock = getBlockById(context.parentId);
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

  return {
    open,
    close,
    getAllowedBlockSchemas,
  };
}
