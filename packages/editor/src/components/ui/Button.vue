<script setup lang="ts">
  const variantClasses = {
    default: 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-200',
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
    accent: 'bg-accent text-accent-foreground hover:bg-accent/90',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
  } as const

  const sizeClasses = {
    sm: 'h-6 px-3 text-xs',
    md: 'h-8 px-4',
    lg: 'h-10 px-6 text-base',
  } as const

  const squareSizeClasses = {
    sm: 'w-6 h-6 text-xs p-0',
    md: 'w-8 h-8 p-0',
    lg: 'w-10 h-10 text-base p-0',
  } as const

  type Variant = keyof typeof variantClasses
  type Size = keyof typeof sizeClasses

  const props = withDefaults(defineProps<{
    variant?: Variant
    size?: Size
    type?: "button" | "submit" | "reset" | undefined
    disabled?: boolean
    fullWidth?: boolean
    square?: boolean
  }>(), {
    variant: 'default',
    size: 'md',
    type: 'button',
    disabled: false,
    fullWidth: false,
    square: false
  })
</script>

<template>
  <button
    class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
    :class="[
      variantClasses[variant],
      props.square ? squareSizeClasses[size] : sizeClasses[size],
      fullWidth && 'w-full'
    ]"
    :type="type"
    :disabled="props.disabled"
  >
    <slot></slot>
  </button>
</template>
