<script setup lang="ts">
const { t } = useI18n();
const { redo, canRedo } = useCraftileEngine();

const handleRedo = () => {
  redo();
};
</script>

<template>
  <UiButton square :disabled="!canRedo" @click="handleRedo" :title="t('header.redo')">
    <icon-arrow-uturn-right />
  </UiButton>
</template>
