---
'@craftile/editor': patch
---

Persist user-saved custom devices to localStorage so they survive page reloads. The `savedCustomDevices` array on `DevicesManager` was previously reset to `[]` on every editor construction; it now restores from `localStorage` under the key `craftile-editor:custom-devices` and writes through on add / remove. Loaded entries are shape-validated (id, label, width, optional icon).