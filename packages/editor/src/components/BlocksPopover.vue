<script setup lang="ts">
  import { Popover } from '@ark-ui/vue/popover';
  import { usePopover } from '@ark-ui/vue/popover';
  import { Field } from '@ark-ui/vue/field';
  import { Tabs } from '@ark-ui/vue/tabs';
  import { Accordion } from '@ark-ui/vue/accordion';

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

  const getBlockSchemaDisplayName = (schema: BlockSchema) => {
    return schema.meta?.name || schema.type.replace(/-/g, ' ').replace(/\b\w/g, (char: string) => char.toUpperCase());
  };

  const filteredBlockSchemas = computed(() => {
    if (!insertionContext.value) {
      return [];
    }

    return getAllowedBlockSchemas(insertionContext.value);
  });

  const blocksByCategory = computed(() => {
    const categories: Record<string, BlockSchema[]> = {};

    filteredBlockSchemas.value.forEach(schema => {
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
      const matchingBlocks = blocks.filter(block => {
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
      <Popover.Content class="bg-white shadow rounded-md p-2 w-md h-[480px] border flex flex-col">
        <Field.Root class="flex-none">
          <Field.Input
            v-model="searchQuery"
            class="rounded border w-full text-sm h-8 px-3 focus-visible:ring-2 focus-visible:border-transparent focus-visible:ring-accent focus-visible:outline-none"
            :placeholder="t('blocksPopover.searchPlaceholder')"
          />
        </Field.Root>

        <Tabs.Root
          class="flex-1 mt-2 flex-col overflow-y-hidden"
          :defaultValue="'blocks'"
        >
          <Tabs.List class="flex flex-none bg-gray-100 p-0.5 rounded">
            <Tabs.Trigger
              value="blocks"
              class="flex-1 py-1.5 rounded data-selected:bg-white data-selected:shadow "
            >
              {{ t('blocksPopover.tabBlocks') }}
            </Tabs.Trigger>
            <Tabs.Trigger
              value="saved"
              class="flex-1 py-1.5 rounded data-selected:bg-white data-selected:shadow "
            >
              {{ t('blocksPopover.tabSaved') }}
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content
            value="blocks"
            class="flex-1 overflow-hidden"
          >
            <div
              v-if="Object.keys(filteredBlocksByCategory).length === 0"
              class="text-center text-gray-500 py-8"
            >
              <p v-if="searchQuery.trim()">{{ t('blocksPopover.noBlocksFound') }} "{{ searchQuery }}"</p>
              <p v-else>{{ t('blocksPopover.noBlocksAvailable') }}</p>
            </div>
            <div
              v-else
              class="h-full overflow-y-auto"
            >
              <Accordion.Root
                class="w-full"
                :defaultValue="Object.keys(filteredBlocksByCategory)"
                multiple
              >
                <Accordion.Item
                  v-for="(blocks, category) in filteredBlocksByCategory"
                  :key="category"
                  :value="category"
                  class="border-b border-gray-100 last:border-b-0"
                >
                  <Accordion.ItemTrigger class="flex w-full items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors">
                    <span class="text-sm font-medium text-gray-700">{{ category }}</span>
                    <Accordion.ItemIndicator class="transition-transform duration-200">
                      <icon-chevron-down class="w-4 h-4 text-gray-500" />
                    </Accordion.ItemIndicator>
                  </Accordion.ItemTrigger>
                  <Accordion.ItemContent class="overflow-hidden">
                    <div class="pb-2">
                      <div class="grid grid-cols-2 gap-2 px-3">
                        <button
                          v-for="block in blocks"
                          :key="block.type"
                          @click="handleBlockSelect(block.type)"
                          class="flex items-center gap-2 p-2 rounded border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors text-left"
                        >
                          <div
                            class="flex-none w-6 h-6 flex items-center justify-center text-gray-600"
                            v-html="block.meta?.icon || ''"
                          ></div>
                          <div class="flex-1 min-w-0">
                            <div class="font-medium text-sm text-gray-900 truncate">
                              {{ getBlockSchemaDisplayName(block) }}
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </Accordion.ItemContent>
                </Accordion.Item>
              </Accordion.Root>
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </Popover.Content>
    </Popover.Positioner>
  </Popover.RootProvider>
</template>
