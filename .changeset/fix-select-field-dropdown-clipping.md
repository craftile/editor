---
'@craftile/plugin-common-properties': patch
---

Fix Select field dropdown getting clipped when the field is rendered inside an `overflow: hidden` ancestor (e.g. an `Accordion.ItemContent` for grouped properties). `Select.Positioner` now teleports to `.__craftile` so the dropdown escapes the clipping ancestor.
