<script setup lang="ts">
import { useBreakpoints } from '../composables/breakpoints';
import type { CraftileEditor } from '../editor';
import { CRAFTILE_EDITOR_SYMBOL } from '../constants';
import '../index.css';

const { isExtraExtraLarge } = useBreakpoints();
const { hasSelection } = useSelectedBlock();
const { keyboardShortcuts } = useUI();
const editor = inject<CraftileEditor>(CRAFTILE_EDITOR_SYMBOL)!;

const handleKeyDown = (event: KeyboardEvent) => {
  const shortcutKey = [
    event.ctrlKey && 'ctrl',
    event.metaKey && 'meta',
    event.shiftKey && 'shift',
    event.altKey && 'alt',
    event.key.toLowerCase(),
  ]
    .filter(Boolean)
    .join('+');

  const shortcut = keyboardShortcuts.value.get(shortcutKey);
  if (shortcut) {
    event.preventDefault();
    event.stopPropagation();
    shortcut.handler({ editor });
  }
};
</script>

<template>
  <div class="__craftile" style="height: 100%; width: 100%" tabindex="0" @keydown="handleKeyDown">
    <div class="h-full w-full flex flex-col overflow-hidden">
      <Header />
      <main class="flex-1 flex overflow-hidden relative">
        <Sidebar />
        <Panels />
        <div v-if="hasSelection && !isExtraExtraLarge" class="absolute left-14 top-0 h-full w-75 z-50">
          <ConfigurationPanels is-overlay />
        </div>

        <div class="flex-1 p-3 bg-gray-100 overflow-auto preview-container flex justify-center">
          <PreviewCanvas />
        </div>

        <aside v-if="isExtraExtraLarge" class="h-full flex-none overflow-y-hidden w-75 border-l">
          <ConfigurationPanels />
        </aside>
      </main>
    </div>

    <BlocksPopover />
    <Toasts />
    <Modals />
  </div>
</template>
