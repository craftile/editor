---
"@craftile/preview-client": patch
---

Move preview ready signal from window load to DOMContentLoaded event

This ensures the preview client signals readiness earlier in the page lifecycle, improving initialization timing and reliability of the preview system.