<script setup lang="ts">
  import { computed } from 'vue';

  interface Props {
    disabled?: boolean;
    title?: string;
    variant?: 'default' | 'danger';
  }

  const props = withDefaults(defineProps<Props>(), {
    disabled: false,
    variant: 'default'
  });

  defineEmits<{
    click: [event: MouseEvent];
  }>();

  const buttonClasses = computed(() => {
    const baseClasses = "w-6 h-6 flex items-center justify-center border-0 bg-transparent rounded-md cursor-pointer relative disabled:text-gray-600 disabled:cursor-not-allowed [&>svg]:w-3.5 &[&>svg]:h-3.5";

    const variantClasses = {
      default: "text-gray-400 hover:enabled:bg-gray-500 hover:enabled:text-gray-100 active:enabled:bg-gray-600",
      danger: "text-gray-400 hover:enabled:bg-red-800 hover:enabled:text-red-200 active:enabled:bg-gray-600"
    };

    return `${baseClasses} ${variantClasses[props.variant]}`;
  });
</script>

<template>
  <button
    :disabled="disabled"
    :title="title"
    :class="buttonClasses"
    @click.stop="$emit('click', $event)"
  >
    <slot />
  </button>
</template>
