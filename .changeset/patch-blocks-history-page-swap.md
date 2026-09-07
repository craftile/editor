---
'@craftile/core': minor
'@craftile/editor': minor
---

Add `engine.patchBlocks(blocks)` to merge externally resolved blocks into the live page without touching history, emitting `blocks:patch`. Export `collectVanishedDescendants`. Commands now read the page through an accessor at apply and revert time, so undo and redo keep working after `replacePage()` or an external page swap.
