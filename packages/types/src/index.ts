// types
export interface BlockProperties {
  [key: string]: any;
}

export type VisibilityOperator =
  | 'equals'
  | 'not_equals'
  | 'in'
  | 'not_in'
  | 'contains'
  | 'greater_than'
  | 'less_than'
  | 'truthy'
  | 'falsy';

export interface VisibilityCondition {
  field: string;
  operator: VisibilityOperator;
  value?: any;
}

export interface VisibilityLogicGroup {
  and?: VisibilityRule[];
  or?: VisibilityRule[];
}

export type VisibilityRule = VisibilityCondition | VisibilityLogicGroup;

// Responsive property value type
export interface ResponsiveValue<T = any> {
  _default: T;
  [deviceId: string]: T;
}

export interface Block {
  type: string;
  id: string;
  name?: string; // Custom display name for the block
  semanticId?: string;
  properties: BlockProperties;
  disabled?: boolean;
  static?: boolean; // Block cannot be moved or removed
  repeated?: boolean; // Block is part of a repeating pattern/list
  ghost?: boolean; // Block exists in data but is not rendered in preview (data holder only)
  parentId?: string; // ID of parent block (undefined for top-level blocks)
  children: string[]; // Ordered array of child block IDs
}

export interface PropertyField {
  id: string;
  type: string;
  label?: string;
  info?: string;
  default?: any;
  group?: string; // Optional group name for organizing properties in UI
  visibleIf?: VisibilityRule; // Conditional visibility based on other property values
  responsive?: boolean; // Enable breakpoint-specific values for this property
  [key: string]: any;
}

export interface BlockStructure extends Omit<Block, 'children' | 'parentId' | 'id'> {
  id?: string;
  children?: BlockStructure[];
}

export interface BlockPreset {
  name: string;
  properties?: Record<string, any>;
  children?: BlockStructure[];
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
  private?: boolean; // Private blocks can only be children if explicitly listed in parent's accepts array
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
