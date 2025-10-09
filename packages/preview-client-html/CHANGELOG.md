# @craftile/preview-client-html

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
