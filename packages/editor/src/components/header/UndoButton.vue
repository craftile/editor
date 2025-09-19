<script setup lang="ts">
const { t } = useI18n();
const { undo, canUndo } = useCraftileEngine();

const handleUndo = () => {
  undo();
};
</script>

<template>
  <UiButton square :disabled="!canUndo" @click="handleUndo" :title="t('header.undo')">
    <icon-arrow-uturn-left />
  </UiButton>
</template>
