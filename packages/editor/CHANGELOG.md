# @craftile/editor

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

### Patch Changes

- [`1681768`](https://github.com/craftile/editor/commit/168176805bffccb3693c1c44b930a2eba18387c7) Thanks [@eldomagan](https://github.com/eldomagan)! - Sort block categories alphabetically in blocks popover

- Updated dependencies [[`01f3243`](https://github.com/craftile/editor/commit/01f3243a863a540deee4c62afa36c4ce06121a5d), [`2cef7d1`](https://github.com/craftile/editor/commit/2cef7d1c9d555045c6ecac054607923f435febdb)]:
  - @craftile/types@0.2.0
  - @craftile/core@0.2.0
  - @craftile/event-bus@0.2.0
  - @craftile/messenger@0.2.0

## 0.1.6

### Patch Changes

- [`8b97773`](https://github.com/craftile/editor/commit/8b9777382fe1ebe46b31927d014e71c564730905) Thanks [@eldomagan](https://github.com/eldomagan)! - Fix custom sidebar panel switching issue

- Updated dependencies []:
  - @craftile/core@0.1.6
  - @craftile/event-bus@0.1.6
  - @craftile/messenger@0.1.6
  - @craftile/types@0.1.6

## 0.1.5

### Patch Changes

- [`4e9652c`](https://github.com/craftile/editor/commit/4e9652c57214b72e8f7b8519fac8aead14297a4c) Thanks [@eldomagan](https://github.com/eldomagan)! - Fix block deselection sync issue

- Updated dependencies [[`4e9652c`](https://github.com/craftile/editor/commit/4e9652c57214b72e8f7b8519fac8aead14297a4c)]:
  - @craftile/types@0.1.5
  - @craftile/core@0.1.5
  - @craftile/event-bus@0.1.5
  - @craftile/messenger@0.1.5

## 0.1.4

### Patch Changes

- [`e0f6702`](https://github.com/craftile/editor/commit/e0f6702f3e6d0aad3c7268ba55db309f31bc1f9a) Thanks [@eldomagan](https://github.com/eldomagan)! - Show block schema name and custom label in layers panel

- [`6fbf803`](https://github.com/craftile/editor/commit/6fbf803067b4bc7b6a56e9813fcb30b8ea7dc564) Thanks [@eldomagan](https://github.com/eldomagan)! - Sync block selection between layers panel and preview

- Updated dependencies [[`6fbf803`](https://github.com/craftile/editor/commit/6fbf803067b4bc7b6a56e9813fcb30b8ea7dc564)]:
  - @craftile/types@0.1.4
  - @craftile/core@0.1.4
  - @craftile/event-bus@0.1.4
  - @craftile/messenger@0.1.4

## 0.1.3

### Patch Changes

- [`2fa84ab`](https://github.com/craftile/editor/commit/2fa84ab1f63ae9f6492969e02577566d428b17a5) Thanks [@eldomagan](https://github.com/eldomagan)! - Add loading state support for header action buttons with toggleLoading API

- [`e19e955`](https://github.com/craftile/editor/commit/e19e955fd0db37cee3e71796e69919486eb231a8) Thanks [@eldomagan](https://github.com/eldomagan)! - Hide tabs in blocks popover when there are no saved blocks and ensure tab content is scrollable

- [`a091023`](https://github.com/craftile/editor/commit/a091023eb43efca95db039618e819456be4dfb56) Thanks [@eldomagan](https://github.com/eldomagan)! - Show button to insert blocks when a region is empty

- [`3ac078f`](https://github.com/craftile/editor/commit/3ac078f0e875f634c3ef78edd38c3ce78b0c45b3) Thanks [@eldomagan](https://github.com/eldomagan)! - Add drag-and-drop sorting for region-level blocks

- Updated dependencies []:
  - @craftile/core@0.1.3
  - @craftile/event-bus@0.1.3
  - @craftile/messenger@0.1.3
  - @craftile/types@0.1.3

## 0.1.2

### Patch Changes

- Updated dependencies []:
  - @craftile/core@0.1.2
  - @craftile/event-bus@0.1.2
  - @craftile/messenger@0.1.2
  - @craftile/types@0.1.2

## 0.1.1

### Patch Changes

- Updated dependencies []:
  - @craftile/core@0.1.1
  - @craftile/event-bus@0.1.1
  - @craftile/messenger@0.1.1
  - @craftile/types@0.1.1
