<script setup lang="ts">
import { Tooltip } from '@ark-ui/vue/tooltip';

defineProps<{ title: string }>();
</script>

<template>
  <Tooltip.Root :open-delay="100" :positioning="{ placement: 'top' }">
    <Tooltip.Trigger>
      <slot />
    </Tooltip.Trigger>
    <Tooltip.Positioner>
      <Tooltip.Content
        class="relative w-max bg-white border border-gray-300/60 rounded-md shadow-sm text-sm font-medium px-2 py-1 text-gray-700 data-[state=open]:animate-enter data-[state=closed]:animate-exit"
      >
        <Tooltip.Arrow style="--arrow-size: 12px; --arrow-background: white">
          <Tooltip.ArrowTip class="border-l border-t border-gray-300/60" />
        </Tooltip.Arrow>
        {{ title }}
      </Tooltip.Content>
    </Tooltip.Positioner>
  </Tooltip.Root>
</template>
