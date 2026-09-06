# @craftile/preview-client-html

## 1.2.0

### Patch Changes

- [`3db8abb`](https://github.com/craftile/editor/commit/3db8abb4137e73a3efeb4c4fb06ce463c7d4418f) Thanks [@eldomagan](https://github.com/eldomagan)! - Fix block inserts and moves landing outside the children markers when a sibling anchor is a static block rendered outside the `BEGIN children` / `END children` range. Anchors are now only used when they sit between the markers, otherwise the block falls back to the next valid anchor or the end marker.

## 1.1.2

## 1.1.1

## 1.1.0

### Patch Changes

- [`1b565ad`](https://github.com/craftile/editor/commit/1b565ad03a916a078a48ee1301583209d86b51e1) Thanks [@eldomagan](https://github.com/eldomagan)! - Execute JS effects by cloning parsed script HTML into fresh script elements before injecting them into the preview document.

## 1.0.9

## 1.0.8

### Patch Changes

- [`8aca6d7`](https://github.com/craftile/editor/commit/8aca6d7077c3b6b45fbf14249eb51dd8b0eda82a) Thanks [@eldomagan](https://github.com/eldomagan)! - Include block data in preview lifecycle events. Preview clients now cache editor block updates for selection events, remove lifecycle events include block payloads when available, and editor update payloads preserve removed block snapshots for preview consumers.

- [`e6f1685`](https://github.com/craftile/editor/commit/e6f16859d57c0276c721f043d90c01c81796fcd9) Thanks [@eldomagan](https://github.com/eldomagan)! - Rebuild child insertion comment caches after HTML effect batches and skip redundant child HTML effects when the parent effect already contains the child subtree.

## 1.0.7

## 1.0.6

## 1.0.5

## 1.0.4

### Patch Changes

- [`36f9a37`](https://github.com/craftile/editor/commit/36f9a373cf59dd5da74d7e4882ba8b0efd5e2532) Thanks [@eldomagan](https://github.com/eldomagan)! - Fix block insert/move/re-enable landing in the wrong DOM slot when preceded by disabled siblings. Disabled blocks are excluded from the preview DOM but still occupy a slot in the data tree, so positioning by raw data-tree index produced an off-by-N error. The editor now resolves sibling refs (`afterId`/`beforeId`) from the full engine state, skipping disabled blocks, and ships them in `UpdatesEvent.changes.positions`. The preview client uses these refs to anchor inserts and moves, so DOM order matches data-tree intent regardless of disabled siblings.

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
