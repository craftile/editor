<script setup lang="ts">
import { CRAFTILE_EDITOR_SYMBOL } from '../constants';
import type { CraftileEditor } from '../editor';
import type { HeaderAction } from '../types/ui';
import { isComponentString, isHtmlRenderFunction, isVueComponent } from '../utils';

defineProps<{
  action: HeaderAction;
}>();

const editor = inject<CraftileEditor>(CRAFTILE_EDITOR_SYMBOL)!;
</script>

<template>
  <KeepAlive>
    <UiButton v-if="action.button" :variant="action.button.variant || 'default'" @click="action.button.onClick">
      {{ action.button.text }}
    </UiButton>
    <component
      v-else-if="isVueComponent(action.render) || isComponentString(action.render)"
      :is="action.render"
      :editor="editor"
    />
    <RenderFunctionWrapper v-else-if="isHtmlRenderFunction(action.render)" :render-fn="action.render" />
  </KeepAlive>
</template>
