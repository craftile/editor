<script setup lang="ts">
import { CRAFTILE_EDITOR_SYMBOL } from '../constants';
import type { CraftileEditor } from '../editor';

interface Props {
  renderFn: ((context?: { editor: CraftileEditor }) => HTMLElement) | (() => HTMLElement);
}

const editor = inject<CraftileEditor>(CRAFTILE_EDITOR_SYMBOL)!;
const props = defineProps<Props>();

const containerRef = ref<HTMLElement>();

const renderContent = () => {
  if (!containerRef.value || !props.renderFn) {
    return;
  }

  containerRef.value.innerHTML = '';

  const element = props.renderFn({ editor });

  containerRef.value.appendChild(element);
};

onMounted(() => {
  renderContent();
});

// watch(() => [editor.ui.state, editor.preview.state], () => {
//   renderContent();
// }, { deep: true });
</script>

<template>
  <div ref="containerRef" />
</template>
