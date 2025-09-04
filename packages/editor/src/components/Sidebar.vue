<script setup lang="ts">
  import { useUI } from '../composables/ui';
  import { useI18n } from '../composables/i18n';
  import { isComponentString, isHtmlRenderFunction, isVueComponent } from '../utils';

  const { t } = useI18n();
  const { activeSidebarPanel, setActiveSidebarPanel, sidebarPanels } = useUI();
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

      <button
        v-for="panel in sidebarPanels"
        :key="panel.id"
        @click="setActiveSidebarPanel(panel.id!)"
        :class="[
          'aspect-square flex items-center justify-center rounded-md cursor-pointer transition-colors text-sm font-medium',
          activeSidebarPanel === panel.id
            ? 'bg-accent-foreground text-accent'
            : 'hover:bg-gray-100 text-gray-700'
        ]"
        :title="panel.title"
      >
        <component
          v-if="panel.icon && (isVueComponent(panel.icon) || isComponentString(panel.icon))"
          :is="panel.icon"
          class="w-5 h-5"
        />
        <RenderFunctionWrapper
          v-else-if="panel.icon && isHtmlRenderFunction(panel.icon)"
          :render-fn="panel.icon"
          class="w-5 h-5"
        />

        <!-- Fallback to first letter if no icon -->
        <span v-else>{{ panel.title.charAt(0).toUpperCase() }}</span>
      </button>
    </div>
  </div>
</template>
