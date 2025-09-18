<script setup lang="ts">
  import { Toast, Toaster } from '@ark-ui/vue/toast';
  const { t } = useI18n();
  const { toaster } = useUI();

  const getToastRootStyles = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'success':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'info':
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };


  const getActionStyles = (type: string) => {
    switch (type) {
      case 'error':
        return 'border-red-300 text-red-700 hover:bg-red-100';
      case 'warning':
        return 'border-amber-300 text-amber-700 hover:bg-amber-100';
      case 'success':
        return 'border-blue-300 text-blue-700 hover:bg-blue-100';
      case 'info':
      default:
        return 'border-gray-300 text-gray-700 hover:bg-gray-100';
    }
  };
</script>

<template>
  <Toaster
    :toaster="toaster"
    v-slot="toast"
  >
    <Toast.Root :class="getToastRootStyles(toast.type || 'info')">
      <div class="group pointer-events-auto relative flex w-full min-w-96 max-w-lg justify-between gap-4 overflow-hidden rounded-lg border p-3 shadow-lg transition-all">
        <!-- Content -->
        <div class="flex-1 min-w-0">
          <Toast.Title class="text-sm font-medium">
            {{ toast.title }}
          </Toast.Title>
          <Toast.Description
            v-if="toast.description"
            class="mt-1 text-sm opacity-90"
          >
            {{ toast.description }}
          </Toast.Description>

          <!-- Actions -->
          <div
            v-if="toast.action"
            class="mt-3 flex gap-2"
          >
            <Toast.ActionTrigger
              class="inline-flex items-center px-2 py-1 text-xs font-medium rounded border transition-colors"
              :class="getActionStyles(toast.type || 'info')"
            >
              {{ toast.action.label }}
            </Toast.ActionTrigger>
          </div>
        </div>

        <!-- Dismiss button -->
        <div class="flex items-start">
          <Toast.CloseTrigger class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md opacity-70 hover:opacity-100 transition-opacity">
            <icon-x-mark class="h-4 w-4" />
            <span class="sr-only">{{ t('common.close') }}</span>
          </Toast.CloseTrigger>
        </div>
      </div>
    </Toast.Root>
  </Toaster>
</template>
