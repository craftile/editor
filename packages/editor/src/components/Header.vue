<script setup lang="ts">
  const { headerActions } = useUI();

  const leftActions = computed(() => headerActions.value.filter(action => action.slot === 'left'));
  const centerActions = computed(() => headerActions.value.filter(action => action.slot === 'center'));
  const rightActions = computed(() => headerActions.value.filter(action => action.slot === 'right'));
</script>

<template>
  <header class="h-14 flex items-center justify-between relative z-50 px-4 border-b bg-white">
    <div class="flex items-center gap-3">
      <HeaderActionRenderer
        v-for="action in leftActions"
        :key="action.id"
        :action="action"
      />
    </div>

    <div class="flex items-center gap-3">
      <HeaderActionRenderer
        v-for="action in centerActions"
        :key="action.id"
        :action="action"
      />
    </div>

    <div class="flex items-center gap-3">
      <HeaderActionRenderer
        v-for="action in rightActions"
        :key="action.id"
        :action="action"
      />
    </div>
  </header>
</template>
