<script setup lang="ts">
  const { activeSidebarPanel } = useUI();
</script>

<template>
  <aside class="h-full w-75 border-r flex-none relative">
    <LayersPanel
      v-if="activeSidebarPanel === 'layers'"
      class="h-full"
    />
  </aside>
</template>
