---
'@craftile/preview-client': patch
---

Expose block selection lifecycle events from the preview client event bus. Consumers can now listen for `block.select` and `block.deselect` on `PreviewClient`, receiving the selected or deselected block ID and DOM element.
