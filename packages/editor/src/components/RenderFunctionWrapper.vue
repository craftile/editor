<script setup lang="ts">
  import type { CraftileEditor } from '../editor';

  interface Props {
    renderFn: ((context?: { editor: CraftileEditor }) => HTMLElement) | (() => HTMLElement);
    context?: { editor: CraftileEditor };
    class?: string;
  }

  const props = defineProps<Props>();

  const containerRef = ref<HTMLElement>();

  const renderContent = () => {
    if (!containerRef.value || !props.renderFn) {
      return;
    }

    containerRef.value.innerHTML = '';

    const element = props.renderFn(props.context);

    containerRef.value.appendChild(element);
  };

  onMounted(() => {
    renderContent();
  });

  watch(() => props.context, () => {
    renderContent();
  }, { deep: true });
</script>

<template>
  <div
    ref="containerRef"
    :class="props.class"
  />
</template>
