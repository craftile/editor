<script setup lang="ts">
import { Popover } from '@ark-ui/vue/popover';
import { usePopover } from '@ark-ui/vue/popover';
import { Field } from '@ark-ui/vue/field';
import { Tabs } from '@ark-ui/vue/tabs';

import type { InsertBlockContext } from '../composables/blocks-popover';
import type { BlockSchema } from '@craftile/types';

const { t } = useI18n();
const eventBus = useEventBus();
const { engine, insertBlock } = useCraftileEngine();
const { getAllowedBlockSchemas } = useBlocksPopover();
const { setExpanded } = useLayersPanel();

const anchorEl = ref<HTMLElement | null>(null);
const insertionContext = ref<InsertBlockContext | null>(null);
const searchQuery = ref('');

// TODO: Implement saved blocks functionality
const savedBlocks = ref<BlockSchema[]>([]);
const hasSavedBlocks = computed(() => savedBlocks.value.length > 0);

const popover = usePopover({
  id: 'blocks-popover',
  portalled: true,
  closeOnInteractOutside: true,
  positioning: {
    placement: 'left-start',
    strategy: 'fixed',
    slide: true,
    offset: { crossAxis: -32 },
    flip: ['left', 'right'],
    fitViewport: true,
    getAnchorRect: () => anchorEl.value?.getBoundingClientRect() ?? null,
  },
});

const filteredBlockSchemas = computed(() => {
  if (!insertionContext.value) {
    return [];
  }

  return getAllowedBlockSchemas(insertionContext.value);
});

const blocksByCategory = computed(() => {
  const categories: Record<string, BlockSchema[]> = {};

  filteredBlockSchemas.value.forEach((schema) => {
    const category = schema.meta?.category || 'Other';

    if (!categories[category]) {
      categories[category] = [];
    }

    categories[category].push(schema);
  });

  return categories;
});

const filteredBlocksByCategory = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();

  if (!query) {
    return blocksByCategory.value;
  }

  const filtered: Record<string, BlockSchema[]> = {};

  Object.entries(blocksByCategory.value).forEach(([category, blocks]) => {
    const matchingBlocks = blocks.filter((block) => {
      const name = (block.meta?.name || block.type).toLowerCase();
      const description = (block.meta?.description || '').toLowerCase();
      return name.includes(query) || description.includes(query);
    });

    if (matchingBlocks.length > 0) {
      filtered[category] = matchingBlocks;
    }
  });

  return filtered;
});

const handleBlockSelect = (blockType: string) => {
  if (!insertionContext.value) {
    return;
  }

  const blockId = insertBlock(blockType, {
    parentId: insertionContext.value.parentId!,
    regionName: insertionContext.value.regionName!,
    index: insertionContext.value.index!,
  });

  // Auto-expand blocks that can have children
  const schema = engine.getBlocksManager().get(blockType);

  if (schema?.accepts && schema.accepts.length > 0) {
    setExpanded(blockId, true);
  }

  close();
};

// Event handlers
const handleOpen = ({ anchor, context }: { anchor: HTMLElement; context?: InsertBlockContext }) => {
  anchorEl.value = anchor;
  insertionContext.value = context || null;
  popover.value.setOpen(true);
  popover.value.reposition();
};

const close = () => {
  popover.value.setOpen(false);
  insertionContext.value = null;
  anchorEl.value = null;
};

// Lifecycle
onMounted(() => {
  eventBus.on('blocks-popover:open', handleOpen);
  eventBus.on('blocks-popover:close', close);
});

onUnmounted(() => {
  eventBus.off('blocks-popover:open', handleOpen);
  eventBus.off('blocks-popover:close', close);
});
</script>

<template>
  <Popover.RootProvider :value="popover">
    <Popover.Positioner class="!z-[1100]">
      <Popover.Content class="bg-white shadow rounded-md w-md h-[480px] border flex flex-col">
        <Field.Root class="flex-none p-2">
          <Field.Input
            v-model="searchQuery"
            class="rounded border w-full text-sm h-8 px-3 focus-visible:ring-2 focus-visible:border-transparent focus-visible:ring-accent focus-visible:outline-none"
            :placeholder="t('blocksPopover.searchPlaceholder')"
          />
        </Field.Root>

        <Tabs.Root v-if="hasSavedBlocks" class="flex-1 flex flex-col overflow-hidden mt-2" :defaultValue="'blocks'">
          <Tabs.List class="flex flex-none bg-gray-100 p-[2px] rounded mx-2">
            <Tabs.Trigger value="blocks" class="flex-1 py-1.5 rounded data-selected:bg-white data-selected:shadow">
              {{ t('blocksPopover.tabBlocks') }}
            </Tabs.Trigger>
            <Tabs.Trigger value="saved" class="flex-1 py-1.5 rounded data-selected:bg-white data-selected:shadow">
              {{ t('blocksPopover.tabSaved') }}
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="blocks" class="flex-1 overflow-hidden mt-2">
            <BlocksList
              :blocks-by-category="filteredBlocksByCategory"
              :search-query="searchQuery"
              @block-select="handleBlockSelect"
            />
          </Tabs.Content>
        </Tabs.Root>

        <!-- Show blocks directly when no saved blocks -->
        <div v-else class="flex-1 mt-2 overflow-hidden">
          <BlocksList
            :blocks-by-category="filteredBlocksByCategory"
            :search-query="searchQuery"
            @block-select="handleBlockSelect"
          />
        </div>
      </Popover.Content>
    </Popover.Positioner>
  </Popover.RootProvider>
</template>
