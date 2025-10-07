---
'@craftile/types': minor
'@craftile/editor': minor
---

Add responsive breakpoint support for property fields

Implement responsive breakpoint functionality that allows property fields to have different values for different device presets. This enables users to customize block properties based on viewport sizes.

Usage:
```ts
{
  id: 'fontSize',
  type: 'select',
  label: 'Font Size',
  responsive: true, // Enable responsive mode
  default: '3xl',
  options: [...]
}
```

Values are stored in responsive format:
```ts
{
  _default: '3xl',  // Base value
  tablet: '2xl',    // Tablet override
  mobile: 'xl'      // Mobile override
}
```