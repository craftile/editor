<script setup lang="ts">
  const props = defineProps<{ blockId: string }>();

  const { open: openBlocksPopover, getInsertionContext } = useBlocksPopover();

  const el = ref<HTMLElement | null>(null);

  function onClick() {
    if (el.value) {
      openBlocksPopover({
        anchor: el.value,
        context: getInsertionContext(props.blockId, 'after')
      });
    }
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
