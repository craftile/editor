export type EventListener<T = any> = (data: T) => void;
export type EventMap = {
  [event: string]: any;
};

/**
 * Type-safe EventBus with generic event map support
 *
 * @template T Event map interface that defines the events and their data types
 */
export class EventBus<T extends EventMap = EventMap> {
  private listeners: Map<keyof T, Set<EventListener<any>>> = new Map();

  /**
   * Add an event listener
   *
   * @param event Event name
   * @param listener Event listener function
   *
   * @returns Cleanup function to remove the listener
   */
  on<K extends keyof T>(event: K, listener: EventListener<T[K]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(listener);

    return () => {
      this.off(event, listener);
    };
  }

  /**
   * Remove an event listener
   *
   * @param event Event name
   * @param listener Event listener function to remove
   */
  off<K extends keyof T>(event: K, listener: EventListener<T[K]>): void {
    const eventListeners = this.listeners.get(event);

    if (eventListeners) {
      eventListeners.delete(listener);

      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * Add a one-time event listener
   *
   * @param event Event name
   * @param listener Event listener function
   */
  once<K extends keyof T>(event: K, listener: EventListener<T[K]>): void {
    const onceWrapper = (data: T[K]) => {
      listener(data);
      this.off(event, onceWrapper);
    };

    this.on(event, onceWrapper);
  }

  /**
   * Emit an event
   *
   * @param event Event name
   * @param args Event data (optional, depending on event type)
   */
  emit<K extends keyof T>(event: K, ...args: T[K] extends void ? [] : [T[K]]): void {
    const eventListeners = this.listeners.get(event);

    if (eventListeners) {
      const data = args[0];
      eventListeners.forEach((listener) => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in event listener for '${String(event)}':`, error);
        }
      });
    }
  }

  /**
   * Remove all listeners for an event, or all listeners if no event specified
   *
   * @param event Optional event name. If not provided, removes all listeners
   */
  removeAllListeners<K extends keyof T>(event?: K): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}
