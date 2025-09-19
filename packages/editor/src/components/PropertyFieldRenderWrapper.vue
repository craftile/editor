<script setup lang="ts">
import type { FieldRenderProps } from '../types/ui';

interface Props {
  renderFn: (props: FieldRenderProps) => HTMLElement;
  field: any;
  value: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  class?: string;
}

const props = defineProps<Props>();
const containerRef = ref<HTMLElement>();

const renderField = () => {
  if (containerRef.value && props.renderFn) {
    containerRef.value.innerHTML = '';

    const element = props.renderFn({
      field: props.field,
      value: props.value,
      onChange: props.onChange,
      onBlur: props.onBlur,
    });

    containerRef.value.appendChild(element);
  }
};

onMounted(() => {
  renderField();
});

// Re-render when value changes
watch(
  () => props.value,
  () => {
    renderField();
  }
);
</script>

<template>
  <div ref="containerRef" :class="props.class" />
</template>
