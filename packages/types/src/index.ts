// types
export interface BlockProperties {
  [key: string]: any;
}

export interface Block {
  type: string;
  id: string;
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

export interface BlockSchema {
  type: string; // Unique identifier for the block type
  properties: PropertyField[];
  accepts?: string[]; // Allowed children types
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
