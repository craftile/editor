import { EventBus } from '@craftile/event-bus';
import type { EngineEvents } from './types';

export class Engine extends EventBus<EngineEvents> {}
