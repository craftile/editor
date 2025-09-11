export interface TypedMessage<T = any> {
  type: string;
  payload: T | undefined;
}

export class WindowMessenger<Messages extends Record<string, any>> {
  private handlers = new Map<keyof Messages, Function[]>();
  private targetWindow: Window;
  private targetOrigin: string;
  private fallbackHandler?: (data: any, event: MessageEvent) => void;

  constructor(targetWindow: Window, targetOrigin: string = '*') {
    this.targetWindow = targetWindow;
    this.targetOrigin = targetOrigin;

    window.addEventListener('message', this.handleMessage.bind(this));
  }

  private handleMessage(event: MessageEvent) {
    const message = event.data as TypedMessage;

    if (!message.type) {
      return;
    }

    const handlers = this.handlers.get(message.type);

    if (handlers) {
      handlers.forEach((handler) => handler(message.payload, event));
    } else if (this.fallbackHandler) {
      this.fallbackHandler(event.data, event);
    }
  }

  send<K extends keyof Messages>(type: K, payload?: Messages[K]): void {
    const message: TypedMessage<Messages[K]> = { type: type as string, payload };
    this.targetWindow.postMessage(message, this.targetOrigin);
  }

  listen<K extends keyof Messages>(type: K, handler: (data: Messages[K], event: MessageEvent) => void): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }

    this.handlers.get(type)!.push(handler);

    return () => {
      const handlers = this.handlers.get(type);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  registerFallbackHandler(handler: (data: any, event: MessageEvent) => void) {
    this.fallbackHandler = handler;
  }
}

export function createIframeMessenger<T extends Record<string, any>>(iframe: HTMLIFrameElement, targetOrigin = '*') {
  return new WindowMessenger<T>(iframe.contentWindow!, targetOrigin);
}

export function createParentMessenger<T extends Record<string, any>>(targetOrigin = '*') {
  if (window.parent === window) {
    throw new Error('Not inside an iframe');
  }
  return new WindowMessenger<T>(window.parent, targetOrigin);
}
