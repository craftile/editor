// types
export interface BlockProperties {
  [key: string]: any;
}

export interface Block {
  type: string;
  id: string;
  semanticId?: string;
  properties: BlockProperties;
  disabled?: boolean;
  static?: boolean; // Block cannot be moved or removed
  parentId?: string; // ID of parent block (undefined for top-level blocks)
  children: string[]; // Ordered array of child block IDs
}

export interface PropertyField {
  id: string;
  type: string;
  label?: string;
  default?: any;
  group?: string; // Optional group name for organizing properties in UI
  [key: string]: any;
}

export interface PresetChild {
  type: string;
  id?: string;
  properties?: Record<string, any>;
  children?: PresetChild[];
}

export interface BlockPreset {
  name: string;
  properties?: Record<string, any>;
  children?: PresetChild[];
  icon?: string;
  category?: string;
  description?: string;
  previewImageUrl?: string;
}

export interface BlockSchema {
  type: string;
  properties: PropertyField[];
  accepts?: string[];
  presets?: BlockPreset[];
  meta?: Record<string, any>; // UI-specific metadata for editors
}

export interface Region {
  name: string;
  blocks: string[]; // Array of block IDs in this region
}

export interface Page {
  blocks: Record<string, Block>; // all blocks flatened by ID
  regions: Region[];
}

export interface MoveInstruction {
  toRegion?: string;
  toParent?: string;
  toIndex: number;
}

export interface UpdatesEvent {
  blocks: Record<string, Block>;
  regions: Region[];
  changes: {
    added: string[];
    updated: string[];
    removed: string[];
    moved: Record<string, MoveInstruction>;
  };
}

export interface WindowMessages {
  'craftile.preview.ready': {};

  'craftile.preview.page-data': {
    pageData: {
      blocks: Record<string, Block>;
      regions?: Region[];
    };
  };

  'craftile.editor.updates': UpdatesEvent;
  'updates.effects': UpdatesEvent & {
    effects?: {
      html?: Record<string, string>;
      css?: string[];
      js?: string[];
      moved?: Record<string, MoveInstruction>;
    };
  };

  'craftile.inspector.enable': void;
  'craftile.inspector.disable': void;
  'craftile.editor.select-block': { blockId: string };
  'craftile.editor.deselect-block': void;
  'craftile.preview.click': void;
  'craftile.preview.block-leave': void;
  'craftile.preview.block-hover': {
    blockId: string;
    blockRect: DOMRect;
    parentRect?: DOMRect;
    scrollTop: number;
    scrollLeft: number;
    parentFlexDirection: 'row' | 'column';
  };
  'craftile.preview.block-select': {
    blockId: string;
    blockRect: DOMRect;
    scrollTop: number;
    scrollLeft: number;
  };
  'craftile.preview.update-selected-block': {
    blockId: string;
    blockRect: DOMRect;
    scrollTop: number;
    scrollLeft: number;
  };
  'craftile.inspector.overlay-button-enter': { blockId: string };
  'craftile.inspector.overlay-button-leave': { blockId: string };
}
