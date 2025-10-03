---
'@craftile/types': minor
'@craftile/core': minor
'@craftile/editor': minor
---

Add support for block presets - predefined configurations with properties and nested children

**New Features:**
- Block schemas can now define presets with custom properties and nested children
- Presets appear as separate options in the blocks popover
- Preset properties override schema defaults
- Support for nested block hierarchies in presets
- Optional preset metadata overrides (icon, category, description)

**Changes:**
- Added `BlockPreset` and `PresetChild` interfaces to `@craftile/types`
- Added `presets` field to BlockSchema
- New `InsertBlockFromPresetCommand` for preset-based insertion
- New `insertBlockFromPreset()` method on Engine and useBlocksEngine
- Updated BlocksPopover to expand presets into individual options
- BlocksList now handles BlockSchemaOption instead of BlockSchema directly
- Updated engine updates watcher to include all descendants when inserting blocks with children

**Example Usage:**
```typescript
{
  type: 'container',
  properties: [...],
  presets: [
    {
      name: 'Heading and Text',
      description: 'Container with a heading and description',
      properties: { gap: 12 },
      children: [
        {
          type: 'text',
          id: 'heading',
          properties: { content: '<h2>Title</h2>' }
        },
        {
          type: 'text',
          id: 'description',
          properties: { content: '<p>Description</p>' }
        }
      ]
    }
  ]
}
```