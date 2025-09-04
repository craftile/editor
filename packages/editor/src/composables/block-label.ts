import type { Block, BlockSchema } from '@craftile/types';
import { CRAFTILE_EDITOR_SYMBOL } from '../constants';
import type { CraftileEditor } from '../editor';

/**
 * Default block label function
 * Uses schema.meta.name or block.type
 */
const defaultBlockLabelFunction = (block: Block, schema: BlockSchema | undefined): string => {
  if (schema?.meta?.name) {
    return schema.meta.name;
  }

  // Fallback: use title-cased block type (slug)
  return block.type.replace(/-/g, ' ').replace(/\b\w/g, (char: string) => char.toUpperCase());
};

export function useBlockLabel() {
  const editor = inject<CraftileEditor>(CRAFTILE_EDITOR_SYMBOL);
  const { engine, getBlockById } = useCraftileEngine();

  const labelFunction = editor?.blockLabelFunction || defaultBlockLabelFunction;

  /**
   * Get a block's display label by block ID
   * @param blockId The block ID
   * @returns The display label for the block
   */
  const getBlockLabel = (blockId: string): string => {
    const block = getBlockById(blockId);
    if (!block) {
      return 'Unknown Block';
    }

    const schema = engine.getBlockSchema(block.type);
    return labelFunction(block, schema);
  };

  /**
   * Get a block's display label from block and schema data directly
   * @param block The block data
   * @param schema The block schema (optional)
   * @returns The display label for the block
   */
  const getBlockLabelFromData = (block: Block, schema?: BlockSchema): string => {
    return labelFunction(block, schema);
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
    getBlockLabelFromData,
    getBlockLabelReactive,
  };
}
