import { beforeEach, describe, it, expect } from 'vitest';
import { Engine } from '../src/engine';
import type { BlockSchema } from '@craftile/types';

// Test block schemas
const testSchemas: BlockSchema[] = [
  {
    type: 'Container',
    meta: {
      name: 'Container',
      category: 'Layout',
    },
    properties: [],
    accepts: ['Button'],
  },
  {
    type: 'Button',
    meta: {
      name: 'Button',
      category: 'Interactive',
    },
    properties: [
      {
        id: 'text',
        type: 'text',
        label: 'Text',
        default: 'Click me',
      },
    ],
    accepts: [],
  },
  {
    type: 'Text',
    meta: {
      name: 'Text',
      category: 'Content',
    },
    properties: [
      {
        id: 'content',
        type: 'text',
        label: 'Content',
        default: 'Hello',
      },
    ],
    accepts: [],
  },
];

describe('Copy and Paste', () => {
  let engine: Engine;

  beforeEach(() => {
    engine = new Engine({
      blockSchemas: testSchemas,
    });
  });

  it('should export a simple block as nested structure', () => {
    const blockId = engine.insertBlock('Button');
    const structure = engine.exportBlockAsNestedStructure(blockId);

    expect(structure).toMatchObject({
      type: 'Button',
      id: blockId,
      properties: { text: 'Click me' },
      children: [],
    });
  });

  it('should export a block with children as nested structure', () => {
    const containerId = engine.insertBlock('Container');
    const button1Id = engine.insertBlock('Button', { parentId: containerId });
    const button2Id = engine.insertBlock('Button', { parentId: containerId });

    const structure = engine.exportBlockAsNestedStructure(containerId);

    expect(structure.type).toBe('Container');
    expect(structure.id).toBe(containerId);
    expect(structure.children).toHaveLength(2);
    expect(structure.children?.[0].type).toBe('Button');
    expect(structure.children?.[0].id).toBe(button1Id);
    expect(structure.children?.[1].type).toBe('Button');
    expect(structure.children?.[1].id).toBe(button2Id);
  });

  it('should include disabled field in exported structure', () => {
    const blockId = engine.insertBlock('Button');
    engine.toggleBlock(blockId, true); // Disable the block

    const structure = engine.exportBlockAsNestedStructure(blockId);

    expect(structure.disabled).toBe(true);
  });

  it('should paste a block structure', () => {
    const originalId = engine.insertBlock('Button');
    engine.setBlockProperty(originalId, 'text', 'Custom Text');

    const structure = engine.exportBlockAsNestedStructure(originalId);
    const pastedId = engine.pasteBlock(structure);

    expect(pastedId).not.toBe(originalId);

    const pastedBlock = engine.getBlockById(pastedId);
    expect(pastedBlock).toBeDefined();
    expect(pastedBlock?.type).toBe('Button');
    expect(pastedBlock?.properties.text).toBe('Custom Text');
  });

  it('should paste a block with children', () => {
    const containerId = engine.insertBlock('Container');
    engine.insertBlock('Button', { parentId: containerId });
    engine.insertBlock('Button', { parentId: containerId });

    const structure = engine.exportBlockAsNestedStructure(containerId);
    const pastedId = engine.pasteBlock(structure);

    const pastedBlock = engine.getBlockById(pastedId);
    expect(pastedBlock?.children).toHaveLength(2);

    const child1 = engine.getBlockById(pastedBlock!.children[0]);
    const child2 = engine.getBlockById(pastedBlock!.children[1]);

    expect(child1?.type).toBe('Button');
    expect(child2?.type).toBe('Button');
  });

  it('should paste block with disabled state', () => {
    const originalId = engine.insertBlock('Button');
    engine.toggleBlock(originalId, true);

    const structure = engine.exportBlockAsNestedStructure(originalId);
    const pastedId = engine.pasteBlock(structure);

    const pastedBlock = engine.getBlockById(pastedId);
    expect(pastedBlock?.disabled).toBe(true);
  });

  it('should paste block at specific index', () => {
    const containerId = engine.insertBlock('Container');
    const button1Id = engine.insertBlock('Button', { parentId: containerId });
    const button2Id = engine.insertBlock('Button', { parentId: containerId });

    const structure = engine.exportBlockAsNestedStructure(button1Id);
    const pastedId = engine.pasteBlock(structure, { parentId: containerId, index: 1 });

    const container = engine.getBlockById(containerId);
    expect(container?.children).toHaveLength(3);
    expect(container?.children[0]).toBe(button1Id);
    expect(container?.children[1]).toBe(pastedId);
    expect(container?.children[2]).toBe(button2Id);
  });

  it('should preserve semanticId when pasting', () => {
    const originalId = engine.insertBlock('Button');
    const originalBlock = engine.getBlockById(originalId)!;

    // Set a semantic ID
    originalBlock.semanticId = 'my-button';

    const structure = engine.exportBlockAsNestedStructure(originalId);
    const pastedId = engine.pasteBlock(structure);

    const pastedBlock = engine.getBlockById(pastedId);
    expect(pastedBlock?.semanticId).toBe('my-button');
  });

  it('should error when pasting incompatible block type', () => {
    const textId = engine.insertBlock('Text');
    const containerId = engine.insertBlock('Container');

    const structure = engine.exportBlockAsNestedStructure(textId);

    // Text cannot be pasted as child of Container since Container doesn't accept Text
    expect(() => {
      engine.pasteBlock(structure, { parentId: containerId });
    }).toThrow();
  });

  it('should support undo/redo for paste operation', () => {
    const originalId = engine.insertBlock('Button');
    const structure = engine.exportBlockAsNestedStructure(originalId);

    const pastedId = engine.pasteBlock(structure);

    expect(engine.getBlockById(pastedId)).toBeDefined();

    engine.undo();
    expect(engine.getBlockById(pastedId)).toBeUndefined();

    engine.redo();
    expect(engine.getBlockById(pastedId)).toBeDefined();
  });
});
