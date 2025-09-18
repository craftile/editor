import type { UIManager } from '../managers/ui';
import type { UiRenderFunctionContext } from '../types/ui';

const handleUndo = ({ editor }: UiRenderFunctionContext) => {
  const engine = editor.engine;
  if (engine && engine.canUndo()) {
    engine.undo();
  }
};

const handleRedo = ({ editor }: UiRenderFunctionContext) => {
  const engine = editor.engine;
  if (engine && engine.canRedo()) {
    engine.redo();
  }
};

export function registerDefaultKeyboardShortcuts(ui: UIManager) {
  // Undo shortcuts - support both Ctrl (Windows/Linux) and Cmd (macOS)
  ui.registerKeyboardShortcut({
    key: 'ctrl+z',
    handler: handleUndo,
  });

  ui.registerKeyboardShortcut({
    key: 'meta+z',
    handler: handleUndo,
  });

  // Redo shortcuts - support both Ctrl+Y and Ctrl+Shift+Z patterns
  ui.registerKeyboardShortcut({
    key: 'ctrl+y',
    handler: handleRedo,
  });

  ui.registerKeyboardShortcut({
    key: 'ctrl+shift+z',
    handler: handleRedo,
  });

  ui.registerKeyboardShortcut({
    key: 'meta+shift+z',
    handler: handleRedo,
  });
}
