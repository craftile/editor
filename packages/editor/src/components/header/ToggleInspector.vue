<script setup lang="ts">
const { t } = useI18n();
const { isEnabled, toggle } = useInspector();
</script>

<template>
  <UiButton
    @click="toggle"
    :variant="isEnabled ? 'sutble' : 'default'"
    square
    :title="isEnabled ? t('header.disableInspector') : t('header.enableInspector')"
  >
    <icon-cursor-arrow-rays class="w-4 h-4" />
  </UiButton>
</template>
