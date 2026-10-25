---
'@craftile/core': patch
---

`block:move` now reports the resolved index instead of the requested one. Appending a block reports its real final index instead of `undefined` (which updates turned into `toIndex: 0`), and undoing a move reports the position the block actually moved to.
