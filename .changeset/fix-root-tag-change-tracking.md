---
"@craftile/preview-client": patch
"@craftile/preview-client-html": patch
---

Fix inspector element tracking when block root tag changes during updates. When morphdom replaces the root element (e.g., changing from h1 to h2), the inspector now properly updates its element references and re-attaches observers to track the new element.
