<script setup lang="ts">
const variantClasses = {
  default: 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-200',
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
  accent: 'bg-accent text-accent-foreground hover:bg-accent/90',
  sutble: 'bg-accent-foreground text-accent',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
} as const;

const sizeClasses = {
  sm: 'h-6 px-3 text-xs',
  md: 'h-8 px-4',
  lg: 'h-10 px-6 text-base',
} as const;

const squareSizeClasses = {
  sm: 'w-6 h-6 text-xs p-0',
  md: 'w-8 h-8 p-0',
  lg: 'w-10 h-10 text-base p-0',
} as const;

type Variant = keyof typeof variantClasses;
type Size = keyof typeof sizeClasses;

const props = withDefaults(
  defineProps<{
    variant?: Variant;
    size?: Size;
    type?: 'button' | 'submit' | 'reset' | undefined;
    disabled?: boolean;
    fullWidth?: boolean;
    square?: boolean;
    loading?: boolean;
  }>(),
  {
    variant: 'default',
    size: 'md',
    type: 'button',
    disabled: false,
    fullWidth: false,
    square: false,
    loading: false,
  }
);

const isDisabled = computed(() => props.disabled || props.loading);
</script>

<template>
  <button
    class="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer relative"
    :class="[
      variantClasses[variant],
      props.square ? squareSizeClasses[size] : sizeClasses[size],
      fullWidth && 'w-full',
    ]"
    :type="type"
    :disabled="isDisabled"
  >
    <svg
      v-if="loading"
      class="animate-spin h-4 w-4 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    <span class="inline-flex items-center gap-2" :class="{ invisible: loading }">
      <slot></slot>
    </span>
  </button>
</template>
