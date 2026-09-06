---
'@craftile/preview-client-html': patch
---

Fix block inserts and moves landing outside the children markers when a sibling anchor is a static block rendered outside the `BEGIN children` / `END children` range. Anchors are now only used when they sit between the markers, otherwise the block falls back to the next valid anchor or the end marker.
