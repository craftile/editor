import { createIframeMessenger, type TypedMessage, type WindowMessenger } from '@craftile/messenger';
import type { WindowMessages } from '@craftile/types';

export interface PreviewState {
  previewUrl: string;
  previewFrame: HTMLIFrameElement | null;
  isIframeReady: boolean;
  messageQueue: TypedMessage[];
}

export class PreviewManager {
  public readonly state: PreviewState;
  private messenger!: WindowMessenger<WindowMessages>;
  private readyListenerInitialized = false;

  constructor() {
    this.state = reactive({
      previewUrl: 'about:blank',
      previewFrame: null,
      isIframeReady: false,
      messageQueue: [],
    });
  }

  loadUrl(url: string): void {
    this.state.previewUrl = url;
  }

  loadFromHtml(html: string): void {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    this.state.previewUrl = url;

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  reload(): void {
    if (this.state.previewFrame) {
      this.state.previewFrame.contentWindow?.location.reload();
    }
  }

  getFrame(): HTMLIFrameElement | null {
    return this.state.previewFrame;
  }

  _registerFrame(frame: HTMLIFrameElement): void {
    this.state.previewFrame = frame;
    this.messenger = createIframeMessenger(frame);

    if (!this.readyListenerInitialized) {
      this.messenger.listen('craftile.preview.ready', () => {
        this.state.isIframeReady = true;
        this.flushMessageQueue();
      });

      this.readyListenerInitialized = true;
    }
  }

  sendMessage<T extends keyof WindowMessages>(type: T, payload: WindowMessages[T]) {
    if (this.state.isIframeReady) {
      this.messenger.send(type, payload);
    } else {
      this.state.messageQueue.push({ type, payload });
    }
  }

  onMessage<T extends keyof WindowMessages>(type: T, handler: (data: WindowMessages[T], event: MessageEvent) => void) {
    return this.messenger.listen(type, handler);
  }

  private flushMessageQueue(): void {
    if (this.state.isIframeReady && this.state.previewFrame?.contentWindow) {
      while (this.state.messageQueue.length > 0) {
        const message = this.state.messageQueue.shift()!;
        this.messenger.send(message.type as keyof WindowMessages, message.payload);
      }
    }
  }
}
