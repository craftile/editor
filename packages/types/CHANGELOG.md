# @craftile/types

## 0.4.0

### Minor Changes

- [`76e3dbe`](https://github.com/craftile/editor/commit/76e3dbe736887a90005a8d5366f833730f86f974) Thanks [@eldomagan](https://github.com/eldomagan)! - Add responsive breakpoint support for property fields

  Implement responsive breakpoint functionality that allows property fields to have different values for different device presets. This enables users to customize block properties based on viewport sizes.

  Usage:

  ```ts
  {
    id: 'fontSize',
    type: 'select',
    label: 'Font Size',
    responsive: true, // Enable responsive mode
    default: '3xl',
    options: [...]
  }
  ```

  Values are stored in responsive format:

  ```ts
  {
    _default: '3xl',  // Base value
    tablet: '2xl',    // Tablet override
    mobile: 'xl'      // Mobile override
  }
  ```

## 0.3.1

## 0.3.0

### Minor Changes

- [`61eefa4`](https://github.com/craftile/editor/commit/61eefa45d358abbfdc9c0c2a9d52263a436e170c) Thanks [@eldomagan](https://github.com/eldomagan)! - Add support for custom block names

- [`f2f0ecd`](https://github.com/craftile/editor/commit/f2f0ecd68a0b3eaadf8676622788058f5fdc422d) Thanks [@eldomagan](https://github.com/eldomagan)! - Add conditional property field visibility with visibleIf rules

  **Example usage:**

  ```typescript
  {
    id: 'linkUrl',
    type: 'text',
    label: 'Link URL',
    visibleIf: {
      field: 'enableLink',
      operator: 'truthy'
    }
  }

  // Complex example with logical groups
  {
    id: 'borderRadius',
    type: 'number',
    label: 'Border Radius',
    visibleIf: {
      and: [
        { field: 'advancedOptions', operator: 'truthy' },
        { field: 'layout', operator: 'not_equals', value: 'simple' }
      ]
    }
  }
  ```

## 0.2.1

## 0.2.0

### Minor Changes

- [`01f3243`](https://github.com/craftile/editor/commit/01f3243a863a540deee4c62afa36c4ce06121a5d) Thanks [@eldomagan](https://github.com/eldomagan)! - Add support for block presets - predefined configurations with properties and nested children

  **New Features:**
  - Block schemas can now define presets with custom properties and nested children
  - Presets appear as separate options in the blocks popover
  - Preset properties override schema defaults
  - Support for nested block hierarchies in presets
  - Optional preset metadata overrides (icon, category, description)

  **Changes:**
  - Added `BlockPreset` and `PresetChild` interfaces to `@craftile/types`
  - Added `presets` field to BlockSchema
  - New `InsertBlockFromPresetCommand` for preset-based insertion
  - New `insertBlockFromPreset()` method on Engine and useBlocksEngine
  - Updated BlocksPopover to expand presets into individual options
  - BlocksList now handles BlockSchemaOption instead of BlockSchema directly
  - Updated engine updates watcher to include all descendants when inserting blocks with children

  **Example Usage:**

  ```typescript
  {
    type: 'container',
    properties: [...],
    presets: [
      {
        name: 'Heading and Text',
        description: 'Container with a heading and description',
        properties: { gap: 12 },
        children: [
          {
            type: 'text',
            id: 'heading',
            properties: { content: '<h2>Title</h2>' }
          },
          {
            type: 'text',
            id: 'description',
            properties: { content: '<p>Description</p>' }
          }
        ]
      }
    ]
  }
  ```

- [`2cef7d1`](https://github.com/craftile/editor/commit/2cef7d1c9d555045c6ecac054607923f435febdb) Thanks [@eldomagan](https://github.com/eldomagan)! - Improve blocks popover with split preview layout
  - Implement split preview panel design with compact list on left and preview area on right
  - Display preview images when available in the preview area

## 0.1.6

## 0.1.5

### Patch Changes

- [`4e9652c`](https://github.com/craftile/editor/commit/4e9652c57214b72e8f7b8519fac8aead14297a4c) Thanks [@eldomagan](https://github.com/eldomagan)! - Fix block deselection sync issue

## 0.1.4

### Patch Changes

- [`6fbf803`](https://github.com/craftile/editor/commit/6fbf803067b4bc7b6a56e9813fcb30b8ea7dc564) Thanks [@eldomagan](https://github.com/eldomagan)! - Sync block selection between layers panel and preview

## 0.1.3

## 0.1.2

## 0.1.1
