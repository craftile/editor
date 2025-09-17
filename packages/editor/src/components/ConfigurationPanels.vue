<script setup lang="ts">
  import { Tabs } from '@ark-ui/vue';
  import { isComponentString, isHtmlRenderFunction, isVueComponent } from '../utils';
  import type { CraftileEditor } from '../editor';
  import { CRAFTILE_EDITOR_SYMBOL } from '../constants';

  interface Props {
    isOverlay?: boolean;
  }

  withDefaults(defineProps<Props>(), {
    isOverlay: false
  });

  const editor = inject<CraftileEditor>(CRAFTILE_EDITOR_SYMBOL);
  const { t } = useI18n();
  const { configurationPanels } = useUI();
  const { hasSelection } = useSelectedBlock();

  const activePanelId = ref('properties');
  const showTabs = computed(() => configurationPanels.value.length >= 2);

  const activePanel = computed(() => {
    if (hasSelection.value && configurationPanels.value.length > 0) {
      return configurationPanels.value[0];
    }

    return null;
  });
</script>

<template>
  <div class="h-full w-full flex flex-col bg-white">
    <ConfigurationHeader
      :is-overlay="isOverlay"
      class="flex-none"
    />
    <template v-if="hasSelection">
      <Tabs.Root
        v-if="showTabs"
        v-model="activePanelId"
        class="flex-1 flex flex-col overflow-y-hidden"
      >
        <Tabs.List class="flex border-b flex-none">
          <Tabs.Trigger
            v-for="panel in configurationPanels"
            :key="panel.id"
            :value="panel.id"
            class="flex items-center gap-0.5 px-1.5 py-2 text-xs font-medium transition-colors text-gray-500 data-selected:border-b-2 data-selected:border-accent data-selected:text-accent hover:text-gray-700"
          >
            <component
              v-if="panel.icon && (isVueComponent(panel.icon) || isComponentString(panel.icon))"
              :is="panel.icon"
              :editor="editor"
              class="w-3 h-3"
            />
            <RenderFunctionWrapper
              v-else-if="panel.icon && isHtmlRenderFunction(panel.icon)"
              :render-fn="panel.icon"
              :context="{ editor! }"
              class="w-3 h-3"
            />
            {{ panel.title }}
          </Tabs.Trigger>
        </Tabs.List>
        <div class="flex-1 overflow-y-auto">
          <Tabs.Content
            v-for="panel in configurationPanels"
            :key="panel.id"
            :value="panel.id"
          >
            <component
              v-if="isVueComponent(panel.render) || isComponentString(panel.render)"
              :is="panel.render"
              :editor="editor"
              :key="panel.id"
            />
            <RenderFunctionWrapper
              v-else-if="isHtmlRenderFunction(panel.render)"
              :render-fn="panel.render"
              :context="{ editor! }"
              class="h-full"
            />
          </Tabs.Content>
        </div>
      </Tabs.Root>

      <div
        v-else-if="activePanel"
        class="flex-1 overflow-y-auto"
      >
        <component
          v-if="isVueComponent(activePanel.render) || isComponentString(activePanel.render)"
          :is="activePanel.render"
          :editor="editor"
        />

        <RenderFunctionWrapper
          v-else-if="isHtmlRenderFunction(activePanel.render)"
          :render-fn="activePanel.render"
          :context="{ editor! }"
        />
      </div>
    </template>

    <!-- Empty State - No block selected -->
    <div
      v-else
      class="h-full flex flex-col items-center justify-center p-6 text-center"
    >
      <div class="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
        <icon-adjustments-horizontal class="w-8 h-8 text-gray-400" />
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">{{ t('configPanels.properties') }}</h3>
      <p class="text-sm text-gray-500 max-w-xs">
        {{ t('configPanels.selectedBlock') }}
      </p>
    </div>
  </div>
</template>
