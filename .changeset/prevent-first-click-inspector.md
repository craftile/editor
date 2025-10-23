---
'@craftile/preview-client': patch
---

Prevent click events on first block selection in inspector. When a clickable element (link, button, accordion) inside a block is clicked while inspector is active, the first click selects the block and prevents the action from executing. The second click (when block is already selected) allows the click to execute normally.