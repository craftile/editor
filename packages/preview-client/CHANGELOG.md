# @craftile/preview-client

## 0.11.0

## 0.10.0

## 0.9.0

### Patch Changes

- [`7d4c00a`](https://github.com/craftile/editor/commit/7d4c00a702a86ccfcf2dfd5da66096a02997d6d4) Thanks [@eldomagan](https://github.com/eldomagan)! - Fix position update timing when block DOM elements are replaced. Use requestAnimationFrame to defer position measurement until after browser layout is complete.

## 0.8.1

### Patch Changes

- [`6c542eb`](https://github.com/craftile/editor/commit/6c542ebd5e2269888cad98c3f4480f99b4dfa6e6) Thanks [@eldomagan](https://github.com/eldomagan)! - Prevent click events on first block selection in inspector. When a clickable element (link, button, accordion) inside a block is clicked while inspector is active, the first click selects the block and prevents the action from executing. The second click (when block is already selected) allows the click to execute normally.

## 0.8.0

## 0.7.3

## 0.7.2

## 0.7.1

### Patch Changes

- [`959a468`](https://github.com/craftile/editor/commit/959a468208e1ab8a69a4f895a07859f9845a8918) Thanks [@eldomagan](https://github.com/eldomagan)! - Improve inspector performance by properly managing observers lifecycle. ResizeObserver and MutationObserver are now disconnected when inspector is disabled and reconnected when re-enabled.

## 0.7.0

## 0.6.3

## 0.6.2

## 0.6.1

## 0.6.0

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

### Patch Changes

- [`4e9652c`](https://github.com/craftile/editor/commit/4e9652c57214b72e8f7b8519fac8aead14297a4c) Thanks [@eldomagan](https://github.com/eldomagan)! - Fix block deselection sync issue

## 0.1.4

### Patch Changes

- [`6fbf803`](https://github.com/craftile/editor/commit/6fbf803067b4bc7b6a56e9813fcb30b8ea7dc564) Thanks [@eldomagan](https://github.com/eldomagan)! - Sync block selection between layers panel and preview

## 0.1.3

## 0.1.2

### Patch Changes

- [`0a482b9`](https://github.com/craftile/editor/commit/0a482b9e3af559ead260d9d82d8752ed34eb8e25) Thanks [@eldomagan](https://github.com/eldomagan)! - send page data message in load event instead of DOMContentLoaded

## 0.1.1

### Patch Changes

- [`6bd1a87`](https://github.com/craftile/editor/commit/6bd1a87e50486464b177901ef7324380c750c4de) Thanks [@eldomagan](https://github.com/eldomagan)! - Move preview ready signal from window load to DOMContentLoaded event

  This ensures the preview client signals readiness earlier in the page lifecycle, improving initialization timing and reliability of the preview system.
