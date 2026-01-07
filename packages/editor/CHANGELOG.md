# @craftile/editor

## 1.0.0

### Patch Changes

- [`b11cf71`](https://github.com/craftile/editor/commit/b11cf714d9e4d9fbb484a7a8e69355aa5f2f3016) Thanks [@eldomagan](https://github.com/eldomagan)! - fix(editor): add guard to clearSelectedBlock to prevent unnecessary events

  Add early return in `clearSelectedBlock()` when no block is selected, preventing unnecessary event emissions and state updates.

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

- Updated dependencies [[`668c3d9`](https://github.com/craftile/editor/commit/668c3d90abcbbf6835c78be991d0896bad020500)]:
  - @craftile/types@1.0.0
  - @craftile/core@1.0.0
  - @craftile/event-bus@1.0.0
  - @craftile/messenger@1.0.0

## 0.11.0

### Minor Changes

- [`8e0a7af`](https://github.com/craftile/editor/commit/8e0a7af1c72feb856e35eccc85123ea5e295885e) Thanks [@eldomagan](https://github.com/eldomagan)! - Make visibility rule evaluation viewport-aware for responsive properties. When evaluating `visibleIf` conditions, the system now checks the device-specific value of responsive properties based on the current viewport, rather than the entire responsive object. This allows fields to show/hide dynamically based on responsive property values as users switch between device breakpoints.

### Patch Changes

- [`97026bc`](https://github.com/craftile/editor/commit/97026bc650c540bd4631a6c6dad0aa5f890cd281) Thanks [@eldomagan](https://github.com/eldomagan)! - Fix ConfigurationHeader actions menu positioning.

- [`cd9d14d`](https://github.com/craftile/editor/commit/cd9d14de043a1cefc04dd574b9d001ca941c6488) Thanks [@eldomagan](https://github.com/eldomagan)! - Fix property field responsive device selector positioning.

- Updated dependencies []:
  - @craftile/core@0.11.0
  - @craftile/event-bus@0.11.0
  - @craftile/messenger@0.11.0
  - @craftile/types@0.11.0

## 0.10.0

### Minor Changes

- [`b4edf64`](https://github.com/craftile/editor/commit/b4edf64c5994c4b5341fb71604c24d89e9e0a27a) Thanks [@eldomagan](https://github.com/eldomagan)! - Add info field support to PropertyField. Property fields can now include an optional `info` property that displays helper text below the field to provide additional context and guidance to users.

### Patch Changes

- Updated dependencies [[`b4edf64`](https://github.com/craftile/editor/commit/b4edf64c5994c4b5341fb71604c24d89e9e0a27a)]:
  - @craftile/types@0.10.0
  - @craftile/core@0.10.0
  - @craftile/event-bus@0.10.0
  - @craftile/messenger@0.10.0

## 0.9.0

### Patch Changes

- Updated dependencies []:
  - @craftile/core@0.9.0
  - @craftile/event-bus@0.9.0
  - @craftile/messenger@0.9.0
  - @craftile/types@0.9.0

## 0.8.1

### Patch Changes

- [`b9a6a8e`](https://github.com/craftile/editor/commit/b9a6a8e489dcc68b81ec7a2d633935f19a61c26c) Thanks [@eldomagan](https://github.com/eldomagan)! - Clear selection and hover overlay state when preview page changes. When a new preview page loads (via loadFromHtml or URL change), both the selected block and hovered block states are now cleared to prevent stale overlays and references to blocks that no longer exist in the new preview.

- Updated dependencies []:
  - @craftile/core@0.8.1
  - @craftile/event-bus@0.8.1
  - @craftile/messenger@0.8.1
  - @craftile/types@0.8.1

## 0.8.0

### Minor Changes

- [`1e939d3`](https://github.com/craftile/editor/commit/1e939d305f2cb66d759413d3938ac3c371933b3d) Thanks [@eldomagan](https://github.com/eldomagan)! - Add support for ghost/data blocks - blocks that exist in the editor data structure but are not rendered in the live preview. Ghost blocks serve as data holders (e.g., collection items) and can be selected in the layers panel to edit their properties, but no overlay is displayed in the preview since they have no DOM representation.

### Patch Changes

- Updated dependencies [[`1e939d3`](https://github.com/craftile/editor/commit/1e939d305f2cb66d759413d3938ac3c371933b3d)]:
  - @craftile/types@0.8.0
  - @craftile/core@0.8.0
  - @craftile/event-bus@0.8.0
  - @craftile/messenger@0.8.0

## 0.7.3

### Patch Changes

- [`ded9149`](https://github.com/craftile/editor/commit/ded9149c616c75ce49b3702e6a4fad3395bc670a) Thanks [@eldomagan](https://github.com/eldomagan)! - Fix reactivity issue when updating block properties. Use toRaw() to unwrap Vue proxies before passing property values to the engine, preventing potential structuredClone errors.

- Updated dependencies []:
  - @craftile/core@0.7.3
  - @craftile/event-bus@0.7.3
  - @craftile/messenger@0.7.3
  - @craftile/types@0.7.3

## 0.7.2

### Patch Changes

- [`7e70822`](https://github.com/craftile/editor/commit/7e708225d7cb605c1966ff172d220cc256b5d689) Thanks [@eldomagan](https://github.com/eldomagan)! - Fix reactivity issue when updating block properties. Use toRaw() to unwrap Vue proxies before passing property values to the engine, preventing potential structuredClone errors.

- Updated dependencies []:
  - @craftile/core@0.7.2
  - @craftile/event-bus@0.7.2
  - @craftile/messenger@0.7.2
  - @craftile/types@0.7.2

## 0.7.1

### Patch Changes

- [`865d3e1`](https://github.com/craftile/editor/commit/865d3e1a6b28df019f346ebbeb31765d938c2702) Thanks [@eldomagan](https://github.com/eldomagan)! - Display loop icon for repeated blocks in layers panel. Repeated blocks now show an arrow-path icon instead of their default block icon, making it easier to identify blocks that are part of a repeating pattern.

- Updated dependencies [[`865d3e1`](https://github.com/craftile/editor/commit/865d3e1a6b28df019f346ebbeb31765d938c2702)]:
  - @craftile/types@0.7.1
  - @craftile/core@0.7.1
  - @craftile/event-bus@0.7.1
  - @craftile/messenger@0.7.1

## 0.7.0

### Minor Changes

- [`7d5f5f0`](https://github.com/craftile/editor/commit/7d5f5f03d1b370b7b2dd660efac854ab42aac606) Thanks [@eldomagan](https://github.com/eldomagan)! - Add context menu to block items in layers panel. Right-click on any block item to access all block actions including duplicate, enable/disable, move, insert blocks before/after, and remove.

- [`75548fa`](https://github.com/craftile/editor/commit/75548fabb5114441c52f0528feef00710cd3fc58) Thanks [@eldomagan](https://github.com/eldomagan)! - Add "Copy as JSON" option to block context menu. Blocks can now be exported as JSON to the system clipboard, making it easy to share block structures or use them in other tools.

- [`a18d794`](https://github.com/craftile/editor/commit/a18d794b83d71277b9d5d038b37fdbff19a22f0a) Thanks [@eldomagan](https://github.com/eldomagan)! - Add copy and paste functionality for blocks. Blocks can now be copied and pasted within the editor. The copied block persists across page changes and can be pasted at any compatible location using the context menu.

### Patch Changes

- Updated dependencies [[`a18d794`](https://github.com/craftile/editor/commit/a18d794b83d71277b9d5d038b37fdbff19a22f0a)]:
  - @craftile/core@0.7.0
  - @craftile/types@0.7.0
  - @craftile/event-bus@0.7.0
  - @craftile/messenger@0.7.0

## 0.6.3

### Patch Changes

- [`c9d6181`](https://github.com/craftile/editor/commit/c9d6181fb8c2cc6bb5ecbe2797133b02779f7b3e) Thanks [@eldomagan](https://github.com/eldomagan)! - Fix repeated blocks not updating in preview when edited. All instances of a repeated block now update correctly when the block or its descendants are modified.

- Updated dependencies []:
  - @craftile/core@0.6.3
  - @craftile/event-bus@0.6.3
  - @craftile/messenger@0.6.3
  - @craftile/types@0.6.3

## 0.6.2

### Patch Changes

- Updated dependencies [[`da52cd9`](https://github.com/craftile/editor/commit/da52cd98d6e66cdfc61f36989c6a00091089ed15)]:
  - @craftile/types@0.6.2
  - @craftile/core@0.6.2
  - @craftile/event-bus@0.6.2
  - @craftile/messenger@0.6.2

## 0.6.1

### Patch Changes

- [`d15e79e`](https://github.com/craftile/editor/commit/d15e79e04ec65e5acf948045b4a346d7ccb08387) Thanks [@eldomagan](https://github.com/eldomagan)! - Improve icon sizing and spacing consistency in BlockItem

- Updated dependencies []:
  - @craftile/core@0.6.1
  - @craftile/event-bus@0.6.1
  - @craftile/messenger@0.6.1
  - @craftile/types@0.6.1

## 0.6.0

### Patch Changes

- [`16df030`](https://github.com/craftile/editor/commit/16df0307e8fdba862c7fbb2c3901ecc5eb36334b) Thanks [@eldomagan](https://github.com/eldomagan)! - Show block schema icons in layers panel instead of generic squares-plus icon. Each block type now displays its custom icon from the schema metadata when available.

- Updated dependencies [[`75955f8`](https://github.com/craftile/editor/commit/75955f85852ae4a374799d6d781dd5c739ffb99d)]:
  - @craftile/types@0.6.0
  - @craftile/core@0.6.0
  - @craftile/event-bus@0.6.0
  - @craftile/messenger@0.6.0

## 0.5.0

### Minor Changes

- [`c5edbc6`](https://github.com/craftile/editor/commit/c5edbc69a7210ce8393444c68d18d6959b6c63f5) Thanks [@eldomagan](https://github.com/eldomagan)! - Enable cross-level block drag and drop in layers panel. Blocks can now be dragged to their grandparent or any ancestor block that accepts them, with automatic schema validation to prevent invalid parent-child relationships. Empty containers remain valid drop targets.

### Patch Changes

- [`d461adc`](https://github.com/craftile/editor/commit/d461adc60f862ff98eecc22bdca66aed9090c3e6) Thanks [@eldomagan](https://github.com/eldomagan)! - Fix z-index for responsive property field action buttons to ensure they appear above other elements

- Updated dependencies []:
  - @craftile/core@0.5.0
  - @craftile/event-bus@0.5.0
  - @craftile/messenger@0.5.0
  - @craftile/types@0.5.0

## 0.4.2

### Patch Changes

- Updated dependencies []:
  - @craftile/core@0.4.2
  - @craftile/event-bus@0.4.2
  - @craftile/messenger@0.4.2
  - @craftile/types@0.4.2

## 0.4.1

### Patch Changes

- [`6e6aa7d`](https://github.com/craftile/editor/commit/6e6aa7d0d64bdf959db55f14369430b8b79db3af) Thanks [@eldomagan](https://github.com/eldomagan)! - Move overlay configuration panel from Editor to LayersPanel for better positioning

- [`eea5c83`](https://github.com/craftile/editor/commit/eea5c83bdb654fb408268bee08fc5eee58de3470) Thanks [@eldomagan](https://github.com/eldomagan)! - Update property field transition to use smooth expand/collapse animation instead of slide

- [`b48ed79`](https://github.com/craftile/editor/commit/b48ed795c05c8acb98de360ea2ad51e7d752fd6a) Thanks [@eldomagan](https://github.com/eldomagan)! - Fix the issue where custom panels with render function does not update when the active panel change

- Updated dependencies []:
  - @craftile/core@0.4.1
  - @craftile/event-bus@0.4.1
  - @craftile/messenger@0.4.1
  - @craftile/types@0.4.1

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

### Patch Changes

- Updated dependencies [[`76e3dbe`](https://github.com/craftile/editor/commit/76e3dbe736887a90005a8d5366f833730f86f974)]:
  - @craftile/types@0.4.0
  - @craftile/core@0.4.0
  - @craftile/event-bus@0.4.0
  - @craftile/messenger@0.4.0

## 0.3.1

### Patch Changes

- [`6a98b46`](https://github.com/craftile/editor/commit/6a98b46a024f2796c3c08e2e9a1b7539814e15c5) Thanks [@eldomagan](https://github.com/eldomagan)! - Add support for block:update event in watch-engine-updates

  Handle the block:update event to properly track and propagate block metadata changes (like block name updates) to the preview for re-rendering.

- Updated dependencies []:
  - @craftile/core@0.3.1
  - @craftile/event-bus@0.3.1
  - @craftile/messenger@0.3.1
  - @craftile/types@0.3.1

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

### Patch Changes

- [`457248a`](https://github.com/craftile/editor/commit/457248a37cd55cbf2b91a9007d83ac1e3dd72847) Thanks [@eldomagan](https://github.com/eldomagan)! - Implement add first child block functionality in layers panel

- [`e6686f1`](https://github.com/craftile/editor/commit/e6686f1ef540ffe5c49b51d02bbc23f79950a65c) Thanks [@eldomagan](https://github.com/eldomagan)! - Add relative positioning to configuration panels container

- Updated dependencies [[`61eefa4`](https://github.com/craftile/editor/commit/61eefa45d358abbfdc9c0c2a9d52263a436e170c), [`f2f0ecd`](https://github.com/craftile/editor/commit/f2f0ecd68a0b3eaadf8676622788058f5fdc422d)]:
  - @craftile/types@0.3.0
  - @craftile/core@0.3.0
  - @craftile/event-bus@0.3.0
  - @craftile/messenger@0.3.0

## 0.2.1

### Patch Changes

- [`acf8afa`](https://github.com/craftile/editor/commit/acf8afa174abc19d4e6b4eb4c409b2cfbad6b3b3) Thanks [@eldomagan](https://github.com/eldomagan)! - Export PropertyField in @craftile/editor/ui component for plugin use

- Updated dependencies []:
  - @craftile/core@0.2.1
  - @craftile/event-bus@0.2.1
  - @craftile/messenger@0.2.1
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
