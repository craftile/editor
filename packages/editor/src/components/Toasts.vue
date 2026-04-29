<script setup lang="ts">
import { Toast, Toaster } from '@ark-ui/vue/toast';
const { t } = useI18n();
const { toaster } = useUI();
</script>

<template>
  <Toaster :toaster="toaster" v-slot="toast">
    <Toast.Root class="toast-root">
      <div class="toast-content">
        <Toast.Title class="text-sm font-medium leading-snug">
          {{ toast.title }}
        </Toast.Title>
        <Toast.Description v-if="toast.description" class="mt-1 text-sm leading-snug opacity-80">
          {{ toast.description }}
        </Toast.Description>
        <Toast.ActionTrigger v-if="toast.action" class="toast-action mt-2">
          {{ toast.action.label }}
        </Toast.ActionTrigger>
      </div>
      <Toast.CloseTrigger class="toast-close">
        <icon-x-mark class="h-4 w-4" />
        <span class="sr-only">{{ t('common.close') }}</span>
      </Toast.CloseTrigger>
    </Toast.Root>
  </Toaster>
</template>

<style>
[data-scope='toast'][data-part='root'] {
  --toast-bg: #ffffff;
  --toast-fg: var(--color-gray-800);
  --toast-border: var(--color-gray-200);
  --toast-trigger-bg: var(--color-gray-100);
  --toast-trigger-border: var(--color-gray-300);

  min-width: 22rem;
  max-width: 26rem;
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  position: relative;
  padding: 0.875rem 2.25rem 0.875rem 1rem;
  border-radius: 0.625rem;
  border: 1px solid var(--toast-border);
  background: var(--toast-bg);
  color: var(--toast-fg);
  box-shadow:
    0 4px 12px rgb(0 0 0 / 0.08),
    0 0 1px rgb(0 0 0 / 0.18);

  translate: var(--x) var(--y);
  scale: var(--scale);
  z-index: var(--z-index);
  height: var(--height);
  opacity: var(--opacity);
  will-change: translate, opacity, scale;
  transition:
    translate 400ms cubic-bezier(0.21, 1.02, 0.73, 1),
    scale 400ms cubic-bezier(0.21, 1.02, 0.73, 1),
    opacity 400ms cubic-bezier(0.21, 1.02, 0.73, 1),
    height 400ms cubic-bezier(0.21, 1.02, 0.73, 1),
    box-shadow 200ms;

  &[data-state='closed'] {
    transition:
      translate 400ms cubic-bezier(0.06, 0.71, 0.55, 1),
      scale 400ms cubic-bezier(0.06, 0.71, 0.55, 1),
      opacity 200ms cubic-bezier(0.06, 0.71, 0.55, 1);
  }

  &[data-type='success'],
  &[data-type='error'],
  &[data-type='warning'] {
    --toast-fg: #ffffff;
    --toast-border: transparent;
    --toast-trigger-bg: rgb(255 255 255 / 0.15);
    --toast-trigger-border: rgb(255 255 255 / 0.4);
  }

  &[data-type='success'] {
    --toast-bg: #16a34a;
  }
  &[data-type='error'] {
    --toast-bg: #dc2626;
  }
  &[data-type='warning'] {
    --toast-bg: #ea580c;
  }
}

.toast-content {
  flex: 1 1 auto;
  min-width: 0;
}

.toast-action {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1rem;
  border-radius: 0.3125rem;
  border: 1px solid var(--toast-trigger-border);
  background: transparent;
  color: inherit;
  cursor: pointer;
  transition:
    background 150ms,
    border-color 150ms;

  &:hover {
    background: var(--toast-trigger-bg);
  }
}

.toast-close {
  position: absolute;
  top: 0.5rem;
  inset-inline-end: 0.5rem;
  width: 1.5rem;
  height: 1.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  opacity: 0.65;
  border-radius: 0.3125rem;
  background: transparent;
  cursor: pointer;
  transition:
    opacity 150ms,
    background 150ms;

  &:hover {
    opacity: 1;
    background: var(--toast-trigger-bg);
  }
}
</style>
