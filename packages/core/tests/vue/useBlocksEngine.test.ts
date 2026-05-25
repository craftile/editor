import { describe, expect, it } from 'vitest';
import { useBlocksEngine } from '../../src/vue';
import type { BlockSchema, Page } from '@craftile/types';

const testPage: Page = {
  blocks: {
    'block-1': {
      id: 'block-1',
      type: 'button',
      properties: { text: 'Click me' },
      children: [],
    },
  },
  regions: [{ name: 'main', blocks: ['block-1'] }],
};

const testSchemas: BlockSchema[] = [
  {
    type: 'button',
    properties: [{ type: 'text', label: 'Text', default: 'Button', id: 'text' }],
    accepts: [],
  },
  {
    type: 'text',
    properties: [{ type: 'text', label: 'Value', default: 'Text', id: 'value' }],
    accepts: [],
  },
];

describe('useBlocksEngine', () => {
  it('should expose undoable page replacement', () => {
    const blocksEngine = useBlocksEngine({
      page: structuredClone(testPage),
      blockSchemas: testSchemas,
      autoSync: false,
    });

    blocksEngine.replacePage({
      blocks: {
        'new-block': { id: 'new-block', type: 'text', properties: { value: 'New' }, children: [] },
      },
      regions: [{ name: 'main', blocks: ['new-block'] }],
    });

    expect(blocksEngine.blocks.value['new-block']).toBeDefined();
    expect(blocksEngine.undo()).toBe(true);
    expect(blocksEngine.blocks.value['block-1']).toBeDefined();

    blocksEngine.destroy();
  });

  it('should expose undoable region replacement', () => {
    const blocksEngine = useBlocksEngine({
      page: structuredClone(testPage),
      blockSchemas: testSchemas,
      autoSync: false,
    });

    blocksEngine.replaceRegion('main', [{ type: 'text', properties: { value: 'Region' }, children: [] }]);

    const newRootId = blocksEngine.regions.value[0].blocks[0];
    expect(blocksEngine.blocks.value['block-1']).toBeUndefined();
    expect(blocksEngine.blocks.value[newRootId].type).toBe('text');

    expect(blocksEngine.undo()).toBe(true);
    expect(blocksEngine.blocks.value['block-1']).toBeDefined();

    blocksEngine.destroy();
  });
});
