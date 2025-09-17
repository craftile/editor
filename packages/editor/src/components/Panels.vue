<script setup lang="ts">
  import { CRAFTILE_EDITOR_SYMBOL } from '../constants';
  import type { CraftileEditor } from '../editor';
  import { isComponentString, isHtmlRenderFunction, isVueComponent } from '../utils';
  import RenderFunctionWrapper from './RenderFunctionWrapper.vue';

  const editor = inject<CraftileEditor>(CRAFTILE_EDITOR_SYMBOL);
  const { activeSidebarPanel, sidebarPanels } = useUI();
  const activePanel = computed(() => sidebarPanels.value.find(panel => panel.id === activeSidebarPanel.value));
</script>

<template>
  <aside class="h-full w-75 border-r flex-none relative">
    <LayersPanel
      v-if="activeSidebarPanel === 'layers'"
      class="h-full"
    />

    <template v-else-if="activePanel">
      <KeepAlive>
        <component
          v-if="isVueComponent(activePanel.render) || isComponentString(activePanel.render)"
          :is="activePanel.render"
          :editor="editor"
          class="h-full"
        />
        <RenderFunctionWrapper
          v-else-if="isHtmlRenderFunction(activePanel.render)"
          :render-fn="activePanel.render"
          :context="{ editor! }"
          class="h-full"
        />
      </KeepAlive>
    </template>
  </aside>
</template>
