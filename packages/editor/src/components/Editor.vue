<script setup lang="ts">
  import { useBreakpoints } from '../composables/breakpoints';
  import '../index.css';

  const { isExtraExtraLarge } = useBreakpoints();
  const hasSelection = ref(false);
</script>

<template>
  <div
    class="__craftile"
    style="height: 100%; width: 100%"
  >
    <div class="h-full w-full flex flex-col overflow-hidden">
      <Header />
      <main class="flex-1 flex overflow-hidden relative">
        <Sidebar />
        <Panels />
        <div
          v-if="hasSelection && !isExtraExtraLarge"
          class="absolute left-14 top-0 h-full w-75 z-10"
        >
          <ConfigurationPanels />
        </div>

        <div class="flex-1 p-3 bg-gray-100 overflow-auto preview-container flex justify-center">
          <div class="">Preview Caanvas</div>
        </div>

        <aside
          v-if="isExtraExtraLarge"
          class="h-full flex-none overflow-y-hidden w-75 border-l"
        >
          <ConfigurationPanels />
        </aside>
      </main>
    </div>
  </div>
</template>
