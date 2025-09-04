import type { EventBus } from '@craftile/event-bus';
import type { CraftileEditor } from '../editor';
import { CRAFTILE_EDITOR_SYMBOL } from '../constants';

export function useEventBus(): EventBus {
  const editor = inject<CraftileEditor>(CRAFTILE_EDITOR_SYMBOL);

  if (!editor) {
    throw new Error('useEventBus must be used within a component that has access to CraftileEditor');
  }

  return editor.events;
}
