<script setup lang="ts">
  import { Dialog } from '@ark-ui/vue';
  import { isVueComponent, isComponentString, isHtmlRenderFunction } from '../utils';
  import type { CraftileEditor } from '../editor';
  import { CRAFTILE_EDITOR_SYMBOL } from '../constants';

  const editor = inject<CraftileEditor>(CRAFTILE_EDITOR_SYMBOL)!;
  const { openModals, modals: registeredModals, closeModal } = useUI();

  const modals = computed(() => {
    return openModals.value.reduce((acc: Record<string, any>, id: string) => {
      const modal = registeredModals.value.find(modal => modal.id === id);
      if (modal) {
        acc[id] = modal;
      }
      return acc;
    }, {});
  });

  const getSizeClasses = (size?: string) => {
    const sizeMap = {
      xs: 'max-w-xs',
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      full: 'max-w-[calc(100vw-2rem)] w-full max-h-[calc(100vh-2rem)] h-full',
    };
    return sizeMap[size as keyof typeof sizeMap] || 'max-w-md';
  };

  const handleOpenChange = (details: { open: boolean }, modalId: string) => {
    if (!details.open) {
      closeModal(modalId);
    }
  };
</script>

<template>
  <!-- Render each open modal as separate Dialog instances -->
  <template
    v-for="modalId in openModals"
    :key="modalId"
  >
    <Dialog.Root
      v-if="modals[modalId]"
      :open="true"
      @open-change="handleOpenChange($event, modalId)"
      :modal="true"
    >
      <Dialog.Backdrop class="fixed inset-0 bg-black/50 z-50" />
      <Dialog.Positioner class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Dialog.Content
          :class="`relative bg-white rounded-lg shadow-xl ${getSizeClasses(modals[modalId]?.size)} ${modals[modalId]?.size !== 'full' ? 'max-h-[90vh]' : ''} overflow-auto`"
        >
          <!-- Close button for modals without title -->
          <Dialog.CloseTrigger
            v-if="!modals[modalId].title"
            class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1 z-10"
            @click="closeModal(modalId)"
          >
            <icon-x-mark class="w-5 h-5" />
          </Dialog.CloseTrigger>

          <!-- Optional modal title -->
          <div
            v-if="modals[modalId].title"
            class="border-b px-6 py-4 flex items-center justify-between"
          >
            <Dialog.Title class="text-lg font-semibold text-gray-900">
              {{ modals[modalId].title }}
            </Dialog.Title>
            <Dialog.CloseTrigger
              class="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
              @click="closeModal(modalId)"
            >
              <icon-x-mark class="w-5 h-5" />
            </Dialog.CloseTrigger>
          </div>

          <!-- Smart modal content rendering (no KeepAlive for fresh state) -->
          <component
            v-if="isVueComponent(modals[modalId].render) || isComponentString(modals[modalId].render)"
            :is="modals[modalId].render"
            :modal-id="modalId"
            :editor="editor"
          />
          <RenderFunctionWrapper
            v-else-if="isHtmlRenderFunction(modals[modalId].render)"
            :render-fn="modals[modalId].render"
          />
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  </template>
</template>