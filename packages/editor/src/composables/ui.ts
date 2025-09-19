import type { CraftileEditor } from '../editor';
import { CRAFTILE_EDITOR_SYMBOL } from '../constants';

export function useUI() {
  const editor = inject<CraftileEditor>(CRAFTILE_EDITOR_SYMBOL);

  if (!editor) {
    throw new Error('useUI must be used within a component that has access to CraftileEditor');
  }

  const setActiveSidebarPanel = (panel: string) => {
    editor.ui.state.activeSidebarPanel = panel;
  };

  return {
    toaster: editor.ui.toaster,
    sidebarPanels: computed(() =>
      Array.from(editor.ui.state.sidebarPanels.values()).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    ),
    activeSidebarPanel: computed(() => editor.ui.state.activeSidebarPanel),
    registerSidebarPanel: editor.ui.registerSidebarPanel.bind(editor.ui),
    removeSidebarPanel: editor.ui.removeSidebarPanel.bind(editor.ui),
    setActiveSidebarPanel,

    headerActions: computed(() =>
      Array.from(editor.ui.state.headerActions.values()).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    ),
    registerHeaderAction: editor.ui.registerHeaderAction.bind(editor.ui),
    removeHeaderAction: editor.ui.removeHeaderAction.bind(editor.ui),

    configurationPanels: computed(() =>
      Array.from(editor.ui.state.configurationPanels.values()).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    ),
    registerConfigurationPanel: editor.ui.registerConfigurationPanel.bind(editor.ui),
    removeConfigurationPanel: editor.ui.removeConfigurationPanel.bind(editor.ui),

    modals: computed(() => editor.ui.state.modals),
    openModals: computed(() => editor.ui.state.openModals),
    openModal: editor.ui.openModal.bind(editor.ui),
    closeModal: editor.ui.closeModal.bind(editor.ui),

    propertyFields: computed(() => editor.ui.state.propertyFields),
    registerPropertyField: editor.ui.registerPropertyField.bind(editor.ui),
    removePropertyField: editor.ui.removePropertyField.bind(editor.ui),

    keyboardShortcuts: computed(() => editor.ui.state.keyboardShortcuts),
    registerKeyboardShortcut: editor.ui.registerKeyboardShortcut.bind(editor.ui),
    removeKeyboardShortcut: editor.ui.removeKeyboardShortcut.bind(editor.ui),
  };
}
