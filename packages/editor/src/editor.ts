import type { BlockSchema, Page } from '@craftile/types';
import { Engine } from '@craftile/core';
import { createApp, h, provide, type App } from 'vue';
import Editor from './components/Editor.vue';
import { CRAFTILE_EDITOR_SYMBOL } from './constants';

export interface CraftileEditorOptions {
  blockSchemas?: BlockSchema[];
  initialPage?: Page;
}

export class CraftileEditor {
  public readonly engine: Engine;

  private vueApp: App | null = null;

  constructor(options: CraftileEditorOptions = {}) {
    this.engine = new Engine({ blockSchemas: options.blockSchemas, page: options.initialPage });
    this.setup();
  }

  private setup() {
    this.vueApp = createApp({
      setup() {
        provide(CRAFTILE_EDITOR_SYMBOL, this);
        return () => h(Editor);
      },
    });
  }

  mount(element: string | HTMLElement): void {
    this.vueApp!.mount(element);
  }
}
