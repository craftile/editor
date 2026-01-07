---
"@craftile/editor": patch
---

fix(editor): add guard to clearSelectedBlock to prevent unnecessary events

Add early return in `clearSelectedBlock()` when no block is selected, preventing unnecessary event emissions and state updates.
