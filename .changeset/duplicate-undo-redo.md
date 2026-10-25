---
'@craftile/core': patch
---

Undoing a duplicate now emits `block:remove`, so the preview and persisted updates drop the copy. Redoing a duplicate restores the copy with the same block IDs.
