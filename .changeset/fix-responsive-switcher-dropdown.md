---
'@craftile/editor': patch
---

Fix responsive property switcher dropdown opening at wrong position. The `Select.Positioner` is now teleported to `.__craftile` so Floating UI computes coordinates against the editor root instead of the in-tree absolute container, which caused the dropdown to open at the viewport top-left.
