<script setup lang="ts">
import { Accordion } from '@ark-ui/vue/accordion';
import type { BlockSchemaOption } from '../composables/blocks-popover';

interface Props {
  blocksByCategory: Record<string, BlockSchemaOption[]>;
  searchQuery: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  blockSelect: [option: BlockSchemaOption];
}>();

const { t } = useI18n();

const sortedCategories = computed(() => {
  return Object.keys(props.blocksByCategory).sort((a, b) => a.localeCompare(b));
});

const hoveredOption = ref<BlockSchemaOption | null>(null);

const handleHover = (option: BlockSchemaOption) => {
  hoveredOption.value = option;
};

const clearHover = () => {
  hoveredOption.value = null;
};
</script>

<template>
  <div v-if="Object.keys(blocksByCategory).length === 0" class="text-center text-gray-500 py-8">
    <p v-if="searchQuery.trim()">{{ t('blocksPopover.noBlocksFound') }} "{{ searchQuery }}"</p>
    <p v-else>{{ t('blocksPopover.noBlocksAvailable') }}</p>
  </div>
  <div v-else class="h-full flex">
    <div class="w-60 border-r overflow-y-auto">
      <Accordion.Root class="w-full" :defaultValue="sortedCategories" multiple>
        <Accordion.Item
          v-for="category in sortedCategories"
          :key="category"
          :value="category"
          class="border-b border-gray-100 last:border-b-0"
        >
          <Accordion.ItemTrigger
            class="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-gray-50 transition-colors"
          >
            <span class="text-xs font-medium text-gray-700">{{ category }}</span>
            <Accordion.ItemIndicator class="transition-transform duration-200">
              <icon-chevron-down class="w-3 h-3 text-gray-500" />
            </Accordion.ItemIndicator>
          </Accordion.ItemTrigger>
          <Accordion.ItemContent class="overflow-hidden">
            <div class="pb-1">
              <button
                v-for="option in blocksByCategory[category]"
                :key="option.blockType + '-' + (option.presetIndex ?? 'default')"
                @click="emit('blockSelect', option)"
                @mouseenter="handleHover(option)"
                @mouseleave="clearHover"
                class="flex items-center gap-2 px-3 py-2 w-full hover:bg-gray-50 transition-colors text-left"
                :class="{ 'bg-gray-50': hoveredOption === option }"
              >
                <div
                  class="flex-none w-5 h-5 flex items-center justify-center text-gray-600 text-sm"
                  v-html="option.icon || ''"
                ></div>
                <div class="flex-1 min-w-0">
                  <div class="text-xs text-gray-900 truncate">
                    {{ option.name }}
                  </div>
                </div>
              </button>
            </div>
          </Accordion.ItemContent>
        </Accordion.Item>
      </Accordion.Root>
    </div>

    <div class="flex-1 p-2 bg-gray-50">
      <div v-if="hoveredOption" class="h-full flex flex-col">
        <div class="flex items-start gap-2 mb-2">
          <div
            class="flex-none w-12 h-12 flex items-center justify-center text-gray-600 text-2xl bg-white rounded border"
            v-html="hoveredOption.icon || ''"
          ></div>
          <div class="flex-1">
            <h3 class="font-semibold text-base text-gray-900">{{ hoveredOption.name }}</h3>
            <p v-if="hoveredOption.description" class="text-xs text-gray-600">
              {{ hoveredOption.description }}
            </p>
          </div>
        </div>

        <div class="flex-1 bg-white rounded overflow-hidden flex items-center justify-center">
          <img
            v-if="hoveredOption.previewImageUrl"
            :src="hoveredOption.previewImageUrl"
            :alt="`Preview of ${hoveredOption.name}`"
            class="w-full h-full object-contain"
          />
          <div v-else class="text-center text-gray-400 text-sm p-4">
            <div class="mb-2">{{ t('blocksPopover.noPreviewAvailable') }}</div>
            <div class="text-xs">{{ hoveredOption.blockType }}</div>
          </div>
        </div>
      </div>
      <div v-else class="h-full flex items-center justify-center text-gray-400 text-sm">
        {{ t('blocksPopover.hoverToSeeDetails') }}
      </div>
    </div>
  </div>
</template>
