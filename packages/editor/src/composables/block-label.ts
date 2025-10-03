import type { Block, BlockSchema } from '@craftile/types';
import { CRAFTILE_EDITOR_SYMBOL } from '../constants';
import type { CraftileEditor } from '../editor';

/**
 * Get the schema name for a block
 */
const getSchemaName = (block: Block, schema: BlockSchema | undefined): string => {
  if (schema?.meta?.name) {
    return schema.meta.name;
  }
  return block.type.replace(/-/g, ' ').replace(/\b\w/g, (char: string) => char.toUpperCase());
};

export function useBlockLabel() {
  const editor = inject<CraftileEditor>(CRAFTILE_EDITOR_SYMBOL);
  const { engine, getBlockById } = useCraftileEngine();

  const labelFunction = editor?.blockLabelFunction;

  /**
   * Get a block's custom label (from blockLabelFunction)
   * @param blockId The block ID
   * @returns The custom label for the block, or empty string if no custom label
   */
  const getBlockLabel = (blockId: string): string => {
    const block = getBlockById(blockId);
    if (!block || !labelFunction) {
      return '';
    }

    const schema = engine.getBlockSchema(block.type);
    return labelFunction(block, schema);
  };

  /**
   * Get a block's schema name
   * @param blockId The block ID
   * @returns The schema name for the block
   */
  const getBlockSchemaName = (blockId: string): string => {
    const block = getBlockById(blockId);
    if (!block) {
      return 'Unknown Block';
    }

    const schema = engine.getBlockSchema(block.type);
    return getSchemaName(block, schema);
  };

  /**
   * Reactive block label computed property for a specific block ID
   * @param blockId The block ID to watch
   * @returns Computed ref that updates when block or schema changes
   */
  const getBlockLabelReactive = (blockId: string) => {
    return computed(() => getBlockLabel(blockId));
  };

  return {
    getBlockLabel,
    getBlockSchemaName,
    getBlockLabelReactive,
  };
}
