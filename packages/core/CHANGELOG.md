# @craftile/core

## 1.0.1

### Patch Changes

- Updated dependencies []:
  - @craftile/event-bus@1.0.1
  - @craftile/types@1.0.1

## 1.0.0

### Major Changes

- [`668c3d9`](https://github.com/craftile/editor/commit/668c3d90abcbbf6835c78be991d0896bad020500) Thanks [@eldomagan](https://github.com/eldomagan)! - feat: add region id support with name as display label

  This release adds support for optional `id` field on regions, allowing regions to have a unique identifier separate from their display name.

  ## Breaking Changes
  - **@craftile/core**: Renamed `regionName` to `regionId` in all engine events (`block:insert`, `block:move`, `block:duplicate`, `block:remove`)
  - **@craftile/core**: Engine methods now use `regionId` parameter instead of `regionName`
  - **@craftile/types**: `EngineEvents` interfaces now use `regionId` and `sourceRegionId` fields

  ## New Features
  - **@craftile/types**: Added optional `id` field to `Region` interface
  - **@craftile/core**: Added `getRegionId()` helper function that returns `region.id || region.name`
  - Regions now support both `id` (unique identifier) and `name` (display label)
  - Automatic fallback to `name` when `id` is not provided for backward compatibility

  ## Migration Guide

  If you have custom code using the engine API:

  ```typescript
  // Before
  engine.insertBlock(block, { regionName: 'main' });

  // After
  engine.insertBlock(block, { regionId: 'main' });
  ```

  If you're listening to engine events:

  ```typescript
  // Before
  engine.on('block:insert', ({ regionName }) => {
    console.log(regionName);
  });

  // After
  engine.on('block:insert', ({ regionId }) => {
    console.log(regionId);
  });
  ```

  If you're defining regions in your page data:

  ```typescript
  // Before (still works)
  regions: [{ name: 'main', blocks: [] }];

  // After (recommended)
  regions: [{ id: 'main', name: 'Main Content', blocks: [] }];
  ```

### Patch Changes

- Updated dependencies [[`668c3d9`](https://github.com/craftile/editor/commit/668c3d90abcbbf6835c78be991d0896bad020500)]:
  - @craftile/types@1.0.0
  - @craftile/event-bus@1.0.0

## 0.11.0

### Patch Changes

- Updated dependencies []:
  - @craftile/event-bus@0.11.0
  - @craftile/types@0.11.0

## 0.10.0

### Patch Changes

- Updated dependencies [[`b4edf64`](https://github.com/craftile/editor/commit/b4edf64c5994c4b5341fb71604c24d89e9e0a27a)]:
  - @craftile/types@0.10.0
  - @craftile/event-bus@0.10.0

## 0.9.0

### Patch Changes

- Updated dependencies []:
  - @craftile/event-bus@0.9.0
  - @craftile/types@0.9.0

## 0.8.1

### Patch Changes

- Updated dependencies []:
  - @craftile/event-bus@0.8.1
  - @craftile/types@0.8.1

## 0.8.0

### Minor Changes

- [`1e939d3`](https://github.com/craftile/editor/commit/1e939d305f2cb66d759413d3938ac3c371933b3d) Thanks [@eldomagan](https://github.com/eldomagan)! - Add support for ghost/data blocks - blocks that exist in the editor data structure but are not rendered in the live preview. Ghost blocks serve as data holders (e.g., collection items) and can be selected in the layers panel to edit their properties, but no overlay is displayed in the preview since they have no DOM representation.

### Patch Changes

- Updated dependencies [[`1e939d3`](https://github.com/craftile/editor/commit/1e939d305f2cb66d759413d3938ac3c371933b3d)]:
  - @craftile/types@0.8.0
  - @craftile/event-bus@0.8.0

## 0.7.3

### Patch Changes

- Updated dependencies []:
  - @craftile/event-bus@0.7.3
  - @craftile/types@0.7.3

## 0.7.2

### Patch Changes

- Updated dependencies []:
  - @craftile/event-bus@0.7.2
  - @craftile/types@0.7.2

## 0.7.1

### Patch Changes

- Updated dependencies [[`865d3e1`](https://github.com/craftile/editor/commit/865d3e1a6b28df019f346ebbeb31765d938c2702)]:
  - @craftile/types@0.7.1
  - @craftile/event-bus@0.7.1

## 0.7.0

### Minor Changes

- [`a18d794`](https://github.com/craftile/editor/commit/a18d794b83d71277b9d5d038b37fdbff19a22f0a) Thanks [@eldomagan](https://github.com/eldomagan)! - Add copy and paste functionality for blocks. Blocks can now be copied and pasted within the editor. The copied block persists across page changes and can be pasted at any compatible location using the context menu.

### Patch Changes

- Updated dependencies [[`a18d794`](https://github.com/craftile/editor/commit/a18d794b83d71277b9d5d038b37fdbff19a22f0a)]:
  - @craftile/types@0.7.0
  - @craftile/event-bus@0.7.0

## 0.6.3

### Patch Changes

- Updated dependencies []:
  - @craftile/event-bus@0.6.3
  - @craftile/types@0.6.3

## 0.6.2

### Patch Changes

- [`da52cd9`](https://github.com/craftile/editor/commit/da52cd98d6e66cdfc61f36989c6a00091089ed15) Thanks [@eldomagan](https://github.com/eldomagan)! - Preserve child block metadata (name, static) when adding blocks from presets

  ```

  ```

- Updated dependencies [[`da52cd9`](https://github.com/craftile/editor/commit/da52cd98d6e66cdfc61f36989c6a00091089ed15)]:
  - @craftile/types@0.6.2
  - @craftile/event-bus@0.6.2

## 0.6.1

### Patch Changes

- Updated dependencies []:
  - @craftile/event-bus@0.6.1
  - @craftile/types@0.6.1

## 0.6.0

### Minor Changes

- [`75955f8`](https://github.com/craftile/editor/commit/75955f85852ae4a374799d6d781dd5c739ffb99d) Thanks [@eldomagan](https://github.com/eldomagan)! - Add support for private blocks that can only be children if explicitly listed

  This is useful for blocks that should only be used in specific contexts, such as:
  - `accordion-row` blocks that should only be children of `accordion` blocks
  - Tab panels that should only be children of tab containers
  - List items that should only be children of list containers

  Example:

  ```typescript
  {
    type: 'accordion',
    accepts: ['accordion-row'], // Explicitly accepts accordion-row
  }

  {
    type: 'accordion-row',
    private: true, // Can only be child of blocks that explicitly list 'accordion-row'
    accepts: ['*'], // But can accept any children itself
  }
  ```

### Patch Changes

- Updated dependencies [[`75955f8`](https://github.com/craftile/editor/commit/75955f85852ae4a374799d6d781dd5c739ffb99d)]:
  - @craftile/types@0.6.0
  - @craftile/event-bus@0.6.0

## 0.5.0

### Patch Changes

- Updated dependencies []:
  - @craftile/event-bus@0.5.0
  - @craftile/types@0.5.0

## 0.4.2

### Patch Changes

- Updated dependencies []:
  - @craftile/event-bus@0.4.2
  - @craftile/types@0.4.2

## 0.4.1

### Patch Changes

- Updated dependencies []:
  - @craftile/event-bus@0.4.1
  - @craftile/types@0.4.1

## 0.4.0

### Patch Changes

- Updated dependencies [[`76e3dbe`](https://github.com/craftile/editor/commit/76e3dbe736887a90005a8d5366f833730f86f974)]:
  - @craftile/types@0.4.0
  - @craftile/event-bus@0.4.0

## 0.3.1

### Patch Changes

- Updated dependencies []:
  - @craftile/event-bus@0.3.1
  - @craftile/types@0.3.1

## 0.3.0

### Minor Changes

- [`61eefa4`](https://github.com/craftile/editor/commit/61eefa45d358abbfdc9c0c2a9d52263a436e170c) Thanks [@eldomagan](https://github.com/eldomagan)! - Add support for custom block names

### Patch Changes

- Updated dependencies [[`61eefa4`](https://github.com/craftile/editor/commit/61eefa45d358abbfdc9c0c2a9d52263a436e170c), [`f2f0ecd`](https://github.com/craftile/editor/commit/f2f0ecd68a0b3eaadf8676622788058f5fdc422d)]:
  - @craftile/types@0.3.0
  - @craftile/event-bus@0.3.0

## 0.2.1

### Patch Changes

- Updated dependencies []:
  - @craftile/event-bus@0.2.1
  - @craftile/types@0.2.1

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

### Patch Changes

- Updated dependencies [[`01f3243`](https://github.com/craftile/editor/commit/01f3243a863a540deee4c62afa36c4ce06121a5d), [`2cef7d1`](https://github.com/craftile/editor/commit/2cef7d1c9d555045c6ecac054607923f435febdb)]:
  - @craftile/types@0.2.0
  - @craftile/event-bus@0.2.0

## 0.1.6

### Patch Changes

- Updated dependencies []:
  - @craftile/event-bus@0.1.6
  - @craftile/types@0.1.6

## 0.1.5

### Patch Changes

- Updated dependencies [[`4e9652c`](https://github.com/craftile/editor/commit/4e9652c57214b72e8f7b8519fac8aead14297a4c)]:
  - @craftile/types@0.1.5
  - @craftile/event-bus@0.1.5

## 0.1.4

### Patch Changes

- Updated dependencies [[`6fbf803`](https://github.com/craftile/editor/commit/6fbf803067b4bc7b6a56e9813fcb30b8ea7dc564)]:
  - @craftile/types@0.1.4
  - @craftile/event-bus@0.1.4

## 0.1.3

### Patch Changes

- Updated dependencies []:
  - @craftile/event-bus@0.1.3
  - @craftile/types@0.1.3

## 0.1.2

### Patch Changes

- Updated dependencies []:
  - @craftile/event-bus@0.1.2
  - @craftile/types@0.1.2

## 0.1.1

### Patch Changes

- Updated dependencies []:
  - @craftile/event-bus@0.1.1
  - @craftile/types@0.1.1
