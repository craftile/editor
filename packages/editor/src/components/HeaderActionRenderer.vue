<script setup lang="ts">
import { CRAFTILE_EDITOR_SYMBOL } from '../constants';
import type { CraftileEditor } from '../editor';
import type { HeaderAction } from '../types/ui';
import { isComponentString, isHtmlRenderFunction, isVueComponent } from '../utils';

const props = defineProps<{
  action: HeaderAction;
}>();

const editor = inject<CraftileEditor>(CRAFTILE_EDITOR_SYMBOL)!;

const loading = ref(false);

const toggleLoading = () => {
  loading.value = !loading.value;
};

const handleButtonClick = (event: MouseEvent) => {
  if (props.action.button) {
    props.action.button.onClick(event, { toggleLoading, editor });
  }
};
</script>

<template>
  <KeepAlive>
    <UiButton
      v-if="action.button"
      :variant="action.button.variant || 'default'"
      :loading="loading"
      @click="handleButtonClick"
    >
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
