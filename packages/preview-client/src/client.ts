import type { WindowMessages } from '@craftile/types';
import { createParentMessenger, WindowMessenger } from '@craftile/messenger';
import { EventBus } from '@craftile/event-bus';
import { Inspector } from './inspector';

export class PreviewClient extends EventBus {
  private messenger: WindowMessenger<WindowMessages>;
  public inspector: Inspector;

  constructor() {
    super();

    this.messenger = createParentMessenger(window.origin);
    this.inspector = new Inspector(this.messenger);

    this.initialize();
  }

  private initialize() {
    window.addEventListener('load', () => {
      this.messenger.send('craftile.preview.ready', {});
      setTimeout(() => {
        this.sendPageData();
      }, 0);
    });

    this.messenger.registerFallbackHandler((data: any) => {
      const { type, payload } = data;
      this.emit(type, payload);
    });
  }

  private sendPageData() {
    const pageDataElement = document.getElementById('page-data');

    if (!pageDataElement) {
      return;
    }

    try {
      const pageData = JSON.parse(pageDataElement.textContent || '{}');
      this.messenger.send('craftile.preview.page-data', { pageData });
    } catch (error) {
      console.error('Failed to parse page data:', error);
    }
  }
}
