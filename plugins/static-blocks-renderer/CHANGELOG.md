# @craftile/plugin-static-blocks-renderer

## 1.0.1

## 1.0.0

### Patch Changes

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

## 0.11.0

## 0.10.0

## 0.9.0

## 0.8.1

## 0.8.0

### Minor Changes

- [`1e939d3`](https://github.com/craftile/editor/commit/1e939d305f2cb66d759413d3938ac3c371933b3d) Thanks [@eldomagan](https://github.com/eldomagan)! - Add support for ghost/data blocks - blocks that exist in the editor data structure but are not rendered in the live preview. Ghost blocks serve as data holders (e.g., collection items) and can be selected in the layers panel to edit their properties, but no overlay is displayed in the preview since they have no DOM representation.

## 0.7.3

## 0.7.2

## 0.7.1

## 0.7.0

## 0.6.3

### Patch Changes

- [`c9d6181`](https://github.com/craftile/editor/commit/c9d6181fb8c2cc6bb5ecbe2797133b02779f7b3e) Thanks [@eldomagan](https://github.com/eldomagan)! - Fix repeated blocks not updating in preview when edited. All instances of a repeated block now update correctly when the block or its descendants are modified.

## 0.6.2

## 0.6.1

## 0.6.0

## 0.5.0

## 0.4.2

## 0.4.1

## 0.4.0

## 0.3.1

## 0.3.0

## 0.2.1

## 0.2.0

## 0.1.6

## 0.1.5

## 0.1.4

## 0.1.3

## 0.1.2

## 0.1.1
