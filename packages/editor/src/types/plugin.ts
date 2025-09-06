import type { App } from 'vue';
import type { CraftileEditor } from '../editor';

export interface PluginContext {
  vueApp: App;
  editor: CraftileEditor;
}

export type CraftileEditorPlugin = (context: PluginContext) => void;
