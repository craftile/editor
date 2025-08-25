import { CraftileEditor, type CraftileEditorOptions } from './editor';

export interface CreateCraftileEditorOptions extends CraftileEditorOptions {
  el?: string | HTMLElement;
}

export function createCraftileEditor(options: CreateCraftileEditorOptions = {}): CraftileEditor {
  const { el, ...editorOptions } = options;

  const editor = new CraftileEditor(editorOptions);

  if (el) {
    editor.mount(el);
  }

  return editor;
}
