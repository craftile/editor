<script setup lang="ts">
import { Accordion } from '@ark-ui/vue/accordion';
import type { BlockSchema } from '@craftile/types';

interface Props {
  blocksByCategory: Record<string, BlockSchema[]>;
  searchQuery: string;
}

defineProps<Props>();
const emit = defineEmits<{
  blockSelect: [blockType: string];
}>();

const { t } = useI18n();

const getBlockSchemaDisplayName = (schema: BlockSchema) => {
  return schema.meta?.name || schema.type.replace(/-/g, ' ').replace(/\b\w/g, (char: string) => char.toUpperCase());
};
</script>

<template>
  <div v-if="Object.keys(blocksByCategory).length === 0" class="text-center text-gray-500 py-8">
    <p v-if="searchQuery.trim()">{{ t('blocksPopover.noBlocksFound') }} "{{ searchQuery }}"</p>
    <p v-else>{{ t('blocksPopover.noBlocksAvailable') }}</p>
  </div>
  <div v-else class="h-full overflow-y-auto">
    <Accordion.Root class="w-full" :defaultValue="Object.keys(blocksByCategory)" multiple>
      <Accordion.Item
        v-for="(blocks, category) in blocksByCategory"
        :key="category"
        :value="category"
        class="border-b border-gray-100 last:border-b-0"
      >
        <Accordion.ItemTrigger
          class="flex w-full items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
        >
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
                @click="emit('blockSelect', block.type)"
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
</template>
