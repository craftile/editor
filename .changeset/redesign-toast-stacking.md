---
'@craftile/editor': patch
---

Redesign toast notifications with stacked, decreasing-width layout matching the Ark UI docs aesthetic. The previous implementation wrapped Ark UI's `Toast.Root` in a styled `<div>`, which prevented the `--x / --y / --scale / --z-index / --height / --opacity` CSS variables (set by the toast machine) from taking effect, so multiple toasts didn't visually stack. Styles now live directly on `Toast.Root`, enabling the smooth translate/scale transitions when toasts enter, swap positions, or close. Type theming switches to filled colored surfaces for `success` / `warning` / `error` and a clean white surface for `info`, with a single `--toast-bg / --toast-fg / --toast-border` variable pattern.
