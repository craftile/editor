<script setup lang="ts">
import type { InsertBlockContext } from '../composables/blocks-popover';

const props = defineProps<{
  context: InsertBlockContext;
  label: string;
  variant?: 'accent' | 'muted';
}>();

const { open: openBlocksPopover } = useBlocksPopover();

const isAccent = computed(() => props.variant === 'accent');

function onClick(event: Event) {
  openBlocksPopover({
    anchor: event.currentTarget as HTMLElement,
    context: props.context,
  });
}
</script>

<template>
  <button
    @click="onClick"
    class="flex w-full items-center rounded transition-colors cursor-pointer"
    :class="
      isAccent
        ? 'gap-2 px-2 py-1 text-sm text-accent/90 hover:text-accent hover:bg-accent-foreground rounded-lg'
        : 'gap-1.5 p-1.5 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50'
    "
  >
    <icon-plus :class="isAccent ? 'w-4 h-4' : 'w-3 h-3'" />
    <span>{{ label }}</span>
  </button>
</template>
