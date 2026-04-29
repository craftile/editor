---
'@craftile/editor': patch
---

Fix the selection toolbar staying visible (and snapping to the top-left of the canvas) after deleting the selected block from the layer panel or context menu. The editor now listens to the engine's `block:remove` event and clears the UI selection when the removed block was selected, so every delete path (layers panel, context menu, future plugin/keyboard removals) properly tears down the toolbar and the preview client's selection observers.
