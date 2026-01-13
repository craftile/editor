# @craftile/preview-client-html

## 1.0.3

### Patch Changes

- [`e1d0387`](https://github.com/craftile/editor/commit/e1d03877e683b5d308a827c541330d232cad4507) Thanks [@eldomagan](https://github.com/eldomagan)! - Add element reference to block.insert.after event payload for consistency with block.update.after event

## 1.0.2

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

### Minor Changes

- [`3a83938`](https://github.com/craftile/editor/commit/3a839385af461944b668eafc74556cd98d7a9f04) Thanks [@eldomagan](https://github.com/eldomagan)! - Add CSS and JS effects injection with deduplication and execution tracking. CSS styles/links and JS scripts are injected only once, preventing duplicates. Script execution is tracked and a 'scripts.execution.complete' event is emitted with success/failure stats when all scripts finish loading.

## 0.8.1

## 0.8.0

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

### Minor Changes

- [`7b7d9b9`](https://github.com/craftile/editor/commit/7b7d9b9eea8b166aea81bbad42c97772c43682c4) Thanks [@eldomagan](https://github.com/eldomagan)! - Support children comment markers for blocks with nested DOM structures. Block renderers can now use `<!--BEGIN children: {blockId}-->` and `<!--END children: {blockId}-->` comments to specify where children should be inserted, enabling blocks with complex internal wrapper hierarchies to properly position their children.

## 0.5.0

## 0.4.2

### Patch Changes

- [`d05cb1c`](https://github.com/craftile/editor/commit/d05cb1c9d33a60d1a47112780419f1509b3227fd) Thanks [@eldomagan](https://github.com/eldomagan)! - Fix inspector element tracking when block root tag changes during updates. When morphdom replaces the root element (e.g., changing from h1 to h2), the inspector now properly updates its element references and re-attaches observers to track the new element.

## 0.4.1

## 0.4.0

## 0.3.1

## 0.3.0

### Patch Changes

- [`f5ada99`](https://github.com/craftile/editor/commit/f5ada994be1072d6bbc775ed2186fc41e8a77191) Thanks [@eldomagan](https://github.com/eldomagan)! - Add automatic scroll to selected block in preview

  When a block is selected in the editor, the preview now automatically scrolls to keep the selected block visible using smooth scroll behavior with 'nearest' positioning to minimize unnecessary scrolling.

## 0.2.1

## 0.2.0

## 0.1.6

## 0.1.5

## 0.1.4

## 0.1.3

## 0.1.2

## 0.1.1
