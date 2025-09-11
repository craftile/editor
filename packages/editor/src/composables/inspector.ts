import type { CraftileEditor } from '../editor';
import { CRAFTILE_EDITOR_SYMBOL } from '../constants';

export function useInspector() {
  const editor = inject<CraftileEditor>(CRAFTILE_EDITOR_SYMBOL);

  if (!editor) {
    throw new Error('useInspector must be used within a component that has access to CraftileEditor');
  }

  const isEnabled = computed(() => editor.inspector.state.enabled);
  const hoveredBlockRect = computed(() => editor.inspector.state.hoveredBlockRect);
  const hoveredParentRect = computed(() => editor.inspector.state.hoveredParentRect);
  const hoveredBlockId = computed(() => editor.inspector.state.hoveredBlockId);
  const selectedBlockRect = computed(() => editor.inspector.state.selectedBlockRect);
  const parentFlexDirection = computed(() => editor.inspector.state.parentFlexDirection);
  const iframeRect = computed(() => editor.inspector.state.iframeRect);

  return {
    isEnabled,

    iframeRect,
    hoveredBlockId,
    hoveredBlockRect,
    hoveredParentRect,
    selectedBlockRect,
    parentFlexDirection,

    enable: () => editor.inspector.enable(),
    disable: () => editor.inspector.disable(),
    toggle: () => editor.inspector.toggle(),

    updateIframeRect: (rect: DOMRect) => editor.inspector.setIframeRect(rect),
  };
}
