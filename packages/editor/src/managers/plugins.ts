import type { App } from 'vue';
import type { CraftileEditor } from '../editor';
import type { CraftileEditorPlugin } from '../types/plugin';

export class PluginsManager {
  private editor: CraftileEditor;
  private plugins: Set<CraftileEditorPlugin> = new Set();

  constructor(editor: CraftileEditor) {
    this.editor = editor;
  }

  setupPlugins(vueApp: App) {
    this.plugins.forEach((plugin) => {
      plugin({ vueApp, editor: this.editor });
    });
  }

  register(plugin: CraftileEditorPlugin): PluginsManager {
    this.plugins.add(plugin);
    return this;
  }

  unregister(plugin: CraftileEditorPlugin): PluginsManager {
    this.plugins.delete(plugin);
    return this;
  }

  getAllPlugins(): CraftileEditorPlugin[] {
    return Array.from(this.plugins.values());
  }
}
