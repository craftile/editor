<script setup lang="ts">
  import type { InsertBlockContext } from '../composables/blocks-popover';

  const props = defineProps<{ blockId: string }>();

  const { getBlockById, regions } = useCraftileEngine();
  const { open: openBlocksPopover } = useBlocksPopover();

  const el = ref<HTMLElement | null>(null);

  function onClick() {
    if (el.value) {
      openBlocksPopover({
        anchor: el.value,
        context: getInsertionContext()
      });
    }
  }

  function getInsertionContext(): InsertBlockContext {
    const currentBlock = getBlockById(props.blockId);


    // If the block has a parent, insert as sibling after this block
    if (currentBlock && currentBlock.parentId) {
      const parent = getBlockById(currentBlock.parentId);
      if (parent) {
        const siblingIndex = parent.children.indexOf(props.blockId);
        return {
          parentId: currentBlock.parentId,
          index: siblingIndex + 1
        };
      }
    }

    // Otherwise, find which region contains this block and insert after it
    for (const region of regions.value) {
      const blockIndex = region.blocks.indexOf(props.blockId);
      if (blockIndex !== -1) {
        return {
          regionName: region.name,
          index: blockIndex + 1
        };
      }
    }

    // Fallback: insert at end of main region
    return { regionName: 'main' };
  }
</script>

<template>
  <div
    ref="el"
    class="relative flex items-center w-full h-1.5 transition-colors group rounded"
  >
    <div class="h-[2px] w-0 bg-accent/70 group-hover:w-full transition-[width] duration-100 absolute left-1/2 transform -translate-x-1/2"></div>
    <button
      class="bg-accent text-accent-foreground h-4 w-4 hidden group-hover:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2 rounded-full cursor-pointer hover:ring-2 hover:ring-accent/40"
      @click="onClick"
    >
      <icon-plus class="w-3 h-3" />
    </button>
  </div>
</template>
