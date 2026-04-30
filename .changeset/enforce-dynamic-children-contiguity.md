---
'@craftile/core': patch
'@craftile/editor': patch
---

Constrain dynamic block children to a single contiguous slot. A parent's dynamic children (children without `static: true`) must now form one uninterrupted run. Once the user places a dynamic block in a particular gap relative to the parent's static children, further dynamic blocks have to land in that same gap. Insertion between two adjacent static siblings is rejected outright. The rule is enforced in `InsertBlockCommand`, `InsertBlockFromPresetCommand`, and `MoveBlockCommand` with validate before mutate semantics, so a rejected operation leaves the page untouched (no orphaned blocks in `page.blocks`, no preset subtree leak, no event emitted). The same check drives the editor UI: disallowed `+` buttons in the layers panel, the right click context menu's insert and move items, and the popover's allowed schemas all hide or disable on slot violations. Engine throws are caught at the popover, drag end, paste after, and context menu call sites and surfaced as error toasts.
