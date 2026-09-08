---
'@craftile/editor': patch
'@craftile/plugin-common-properties': patch
---

Use `@theme inline reference` so theme variables are not emitted into the built CSS, and fix `--color-gray-950` falling back to the misspelled `--color-gray-050`.
