<script setup lang="ts">
  import { useUI } from '../composables/ui';
  import { useI18n } from '../composables/i18n';

  const { t } = useI18n();
  const { activeSidebarPanel, setActiveSidebarPanel } = useUI();
</script>

<template>
  <div class="h-full w-14 border-r bg-white">
    <div class="flex flex-col gap-1 p-1.5">
      <!-- Default Layers Tab -->
      <button
        @click="setActiveSidebarPanel('layers')"
        :class="[
          'aspect-square flex items-center justify-center rounded-md cursor-pointer transition-colors',
          activeSidebarPanel === 'layers'
            ? 'bg-accent-foreground text-accent'
            : 'hover:bg-gray-100 text-gray-700'
        ]"
        :title="t('layers.title')"
      >
        <icon-square-3-stack-3d class="w-5" />
      </button>
    </div>
  </div>
</template>
