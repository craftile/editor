<script setup lang="ts">
import { useBreakpoints } from '../composables/breakpoints';
import type { CraftileEditor } from '../editor';
import { CRAFTILE_EDITOR_SYMBOL } from '../constants';
import '../index.css';

const { isExtraExtraLarge, isUltraWide } = useBreakpoints();
const { keyboardShortcuts } = useUI();
const { hasSelection } = useSelectedBlock();
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

        <div class="flex-1 p-3 bg-gray-100 overflow-auto preview-container flex justify-center">
          <PreviewCanvas />
        </div>

        <Transition name="configuration-panel">
          <aside
            v-if="isExtraExtraLarge && (hasSelection || isUltraWide)"
            class="configuration-panel-aside h-full flex-none overflow-y-hidden border-l"
          >
            <ConfigurationPanels />
          </aside>
        </Transition>
      </main>
    </div>

    <BlocksPopover />
    <Toasts />
    <Modals />
  </div>
</template>
