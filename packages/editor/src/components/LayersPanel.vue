<script setup lang="ts">
import CollapseAllIcon from './CollapseAllIcon.vue';

const { t } = useI18n();
const { regions } = useCraftileEngine();
const { collapseRegion } = useLayersPanel();

// TODO: check the issue where region item is incorrectly inferred as true | Region
const regionList = computed(() => (Array.isArray(regions.value) ? regions.value : []));
</script>

<template>
  <div class="h-full flex flex-col overflow-y-hidden">
    <div class="flex-none h-12 flex items-center border-b px-4">
      <h2>{{ t('layers.header') }}</h2>
    </div>
    <div class="flex-1 overflow-y-auto">
      <div v-for="region in regionList" :key="region.name" class="not-last:border-b px-4 mt-2">
        <div class="flex items-center justify-between">
          <h3 class="text-sm capitalize">{{ region.name }}</h3>
          <button
            v-if="region.blocks.length > 0"
            class="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700 transition-colors"
            :title="t('layers.collapseAll')"
            @click="collapseRegion(region.name)"
          >
            <CollapseAllIcon class="w-4 h-4" />
          </button>
        </div>
        <div class="my-2">
          <BlockItem v-for="blockId in region.blocks" :key="blockId" :block-id="blockId" :level="0" />
        </div>
      </div>
    </div>
  </div>
</template>
