---
"@craftile/editor": minor
---

Make visibility rule evaluation viewport-aware for responsive properties. When evaluating `visibleIf` conditions, the system now checks the device-specific value of responsive properties based on the current viewport, rather than the entire responsive object. This allows fields to show/hide dynamically based on responsive property values as users switch between device breakpoints.
