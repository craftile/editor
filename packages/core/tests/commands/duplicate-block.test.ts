import { beforeEach, describe, expect, it } from 'vitest';
import { DuplicateBlockCommand } from '../../src/commands/duplicate-block';
import type { Page } from '@craftile/types';

const testPage: Page = {
  blocks: {
    'block-1': {
      id: 'block-1',
      type: 'button',
      properties: { text: 'Click me', variant: 'primary' },
      children: [],
    },
    'block-2': {
      id: 'block-2',
      type: 'box',
      properties: { className: 'container' },
      children: ['child-1'],
    },
    'child-1': {
      id: 'child-1',
      type: 'text',
      properties: { value: 'Child Text 1' },
      parentId: 'block-2',
      children: [],
    },
  },
  regions: [{ name: 'main', blocks: ['block-1', 'block-2'] }],
};

describe('DuplicateBlockCommand', () => {
  let page: Page;
  let emittedEvents: Array<{ event: string; data: any }> = [];
  const mockEmit = (event: string, ...args: any[]) => {
    emittedEvents.push({ event, data: args[0] });
  };

  beforeEach(() => {
    page = structuredClone(testPage);
    emittedEvents = [];
  });

  it('should duplicate a block', () => {
    const command = new DuplicateBlockCommand(() => page, {
      blockId: 'block-1',
      emit: mockEmit,
    });

    const initialBlockCount = Object.keys(page.blocks).length;
    const initialRegionLength = page.regions[0].blocks.length;

    command.apply();

    expect(Object.keys(page.blocks)).toHaveLength(initialBlockCount + 1);
    expect(page.regions[0].blocks).toHaveLength(initialRegionLength + 1);

    const duplicatedId = command.getDuplicatedBlockId();
    const duplicatedBlock = page.blocks[duplicatedId];

    expect(duplicatedBlock).toBeDefined();
    expect(duplicatedBlock.type).toBe('button');
    expect(duplicatedBlock.properties.text).toBe('Click me');
    expect(duplicatedBlock.id).toBe(duplicatedId);

    expect(emittedEvents).toHaveLength(1);
    expect(emittedEvents[0].event).toBe('block:duplicate');
    expect(emittedEvents[0].data.originalBlockId).toBe('block-1');
    expect(emittedEvents[0].data.newBlockId).toBe(duplicatedId);
  });

  it('should duplicate block with nested children', () => {
    // Add a grandchild to make structure more complex
    const childBlock = page.blocks['child-1'];
    page.blocks['grandchild-1'] = {
      id: 'grandchild-1',
      type: 'button',
      properties: { text: 'Grandchild' },
      parentId: 'child-1',
      children: [],
    };
    childBlock.children = ['grandchild-1'];

    const command = new DuplicateBlockCommand(() => page, {
      blockId: 'child-1',
      emit: mockEmit,
    });

    command.apply();

    const duplicatedId = command.getDuplicatedBlockId();
    const duplicatedBlock = page.blocks[duplicatedId];

    expect(duplicatedBlock.children).toHaveLength(1);

    // Check that the grandchild was also duplicated with new ID
    const duplicatedGrandchildId = duplicatedBlock.children[0];
    const duplicatedGrandchild = page.blocks[duplicatedGrandchildId];
    expect(duplicatedGrandchild).toBeDefined();
    expect(duplicatedGrandchild.type).toBe('button');
    expect(duplicatedGrandchild.properties.text).toBe('Grandchild');
    expect(duplicatedGrandchild.parentId).toBe(duplicatedId);
  });

  it('should revert a block duplication', () => {
    const command = new DuplicateBlockCommand(() => page, {
      blockId: 'block-1',
      emit: mockEmit,
    });

    const initialBlockCount = Object.keys(page.blocks).length;
    const initialRegionBlocks = [...page.regions[0].blocks];

    command.apply();
    const duplicatedId = command.getDuplicatedBlockId();
    expect(page.blocks[duplicatedId]).toBeDefined();

    command.revert();
    expect(Object.keys(page.blocks)).toHaveLength(initialBlockCount);
    expect(page.blocks[duplicatedId]).toBeUndefined();
    expect(page.regions[0].blocks).toEqual(initialRegionBlocks);
  });

  it('should duplicate a root block in a region whose id differs from its name', () => {
    page.regions[0] = {
      id: 'main',
      name: 'Main Content',
      blocks: ['block-1', 'block-2'],
    };

    const command = new DuplicateBlockCommand(() => page, {
      blockId: 'block-1',
      emit: mockEmit,
    });

    command.apply();

    const duplicatedId = command.getDuplicatedBlockId();
    expect(page.regions).toHaveLength(1);
    expect(page.regions[0].blocks).toEqual(['block-1', duplicatedId, 'block-2']);

    command.revert();

    expect(page.regions).toHaveLength(1);
    expect(page.regions[0].blocks).toEqual(['block-1', 'block-2']);
  });

  it('should emit block:remove and restore the page when reverting', () => {
    page.blocks['child-2'] = {
      id: 'child-2',
      type: 'text',
      properties: { value: 'Child Text 2' },
      parentId: 'block-2',
      children: [],
    };
    page.blocks['block-2'].children = ['child-1', 'child-2'];
    const pageBefore = structuredClone(page);

    const command = new DuplicateBlockCommand(() => page, {
      blockId: 'child-1',
      emit: mockEmit,
    });

    command.apply();
    const duplicatedId = command.getDuplicatedBlockId();
    expect(page.blocks['block-2'].children).toEqual(['child-1', duplicatedId, 'child-2']);

    command.revert();

    expect(emittedEvents).toHaveLength(2);
    expect(emittedEvents[1].event).toBe('block:remove');
    expect(emittedEvents[1].data.blockId).toBe(duplicatedId);
    expect(emittedEvents[1].data.block.id).toBe(duplicatedId);
    expect(emittedEvents[1].data.parentId).toBe('block-2');
    expect(page).toEqual(pageBefore);
  });

  it('should restore the same ids on redo', () => {
    page.blocks['grandchild-1'] = {
      id: 'grandchild-1',
      type: 'button',
      properties: { text: 'Grandchild' },
      parentId: 'child-1',
      children: [],
    };
    page.blocks['child-1'].children = ['grandchild-1'];

    const command = new DuplicateBlockCommand(() => page, {
      blockId: 'block-2',
      emit: mockEmit,
    });

    command.apply();
    const duplicatedId = command.getDuplicatedBlockId();
    const pageAfterApply = structuredClone(page);

    command.revert();
    command.apply();

    expect(command.getDuplicatedBlockId()).toBe(duplicatedId);
    expect(page).toEqual(pageAfterApply);
    expect(emittedEvents[2].event).toBe('block:duplicate');
    expect(emittedEvents[2].data.newBlockId).toBe(duplicatedId);
  });

  it('should fully revert a duplicate with nested children', () => {
    page.blocks['grandchild-1'] = {
      id: 'grandchild-1',
      type: 'button',
      properties: { text: 'Grandchild' },
      parentId: 'child-1',
      children: [],
    };
    page.blocks['child-1'].children = ['grandchild-1'];
    const pageBefore = structuredClone(page);

    const command = new DuplicateBlockCommand(() => page, {
      blockId: 'block-2',
      emit: mockEmit,
    });

    command.apply();
    const duplicatedId = command.getDuplicatedBlockId();
    expect(Object.keys(page.blocks)).toHaveLength(Object.keys(pageBefore.blocks).length + 3);

    command.revert();

    expect(page).toEqual(pageBefore);

    const removeEvents = emittedEvents.filter((e) => e.event === 'block:remove');
    expect(removeEvents).toHaveLength(1);
    expect(removeEvents[0].data.blockId).toBe(duplicatedId);
    expect(removeEvents[0].data.regionId).toBe('main');
    expect(removeEvents[0].data.parentId).toBeUndefined();
  });
});
