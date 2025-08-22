import { beforeEach, describe, expect, it } from 'vitest';
import { BlocksManager } from '../src/blocks-manager';
import type { BlockSchema } from '@craftile/types';

const testSchemas: Record<string, BlockSchema> = {
  button: {
    type: 'button',
    properties: [
      { id: 'text', type: 'text', label: 'Text', default: 'Button' },
      { id: 'variant', type: 'select', label: 'Variant', options: ['primary', 'secondary'], default: 'primary' },
    ],
    accepts: [],
  },
  box: {
    type: 'box',
    properties: [{ id: 'className', type: 'text', label: 'Class Name', default: '' }],
    accepts: ['*'], // Allow any child blocks
  },
  text: {
    type: 'text',
    properties: [{ id: 'value', type: 'text', label: 'Value', default: 'Text' }],
    accepts: [],
  },
  section: {
    type: 'section',
    properties: [{ id: 'title', type: 'text', label: 'Title', default: 'Section' }],
    accepts: ['button', 'text'], // Exact matches only
  },
  themeContainer: {
    type: 'theme-container',
    properties: [{ id: 'theme', type: 'text', label: 'Theme', default: 'default' }],
    accepts: ['@theme/*'], // Only @theme/ prefixed blocks
  },
  visualWrapper: {
    type: 'visual-wrapper',
    properties: [{ id: 'layout', type: 'text', label: 'Layout', default: 'flex' }],
    accepts: ['visual-*'], // Only visual-suffixed blocks
  },
};

const ALL_TYPES = Object.keys(testSchemas);

describe('BlocksManager', () => {
  let manager: BlocksManager;

  beforeEach(() => {
    manager = new BlocksManager();
  });

  describe('Schema Registration', () => {
    it('should register a single schema', () => {
      manager.register('button', testSchemas.button);
      expect(manager.has('button')).toBe(true);
      expect(manager.get('button')).toEqual(testSchemas.button);
    });

    it('should register multiple schemas', () => {
      manager.registerMany(testSchemas);
      expect(manager.getTypes()).toEqual(ALL_TYPES);
    });

    it('should throw error when registering duplicate type', () => {
      manager.register('button', testSchemas.button);
      expect(() => {
        manager.register('button', testSchemas.button);
      }).toThrow("Block type 'button' is already registered");
    });
  });

  describe('Schema Retrieval', () => {
    beforeEach(() => {
      manager.registerMany(testSchemas);
    });

    it('should get schema by type', () => {
      const buttonSchema = manager.get('button');
      expect(buttonSchema).toEqual(testSchemas.button);
    });

    it('should return undefined for non-existent type', () => {
      const schema = manager.get('nonexistent');
      expect(schema).toBeUndefined();
    });

    it('should get all schemas', () => {
      const allSchemas = manager.getAll();
      expect(allSchemas).toEqual(testSchemas);
    });

    it('should get all types', () => {
      const types = manager.getTypes();
      expect(types).toEqual(ALL_TYPES);
    });
  });

  describe('Schema Management', () => {
    beforeEach(() => {
      manager.registerMany(testSchemas);
    });

    it('should unregister schema', () => {
      expect(manager.has('button')).toBe(true);
      const result = manager.unregister('button');
      expect(result).toBe(true);
      expect(manager.has('button')).toBe(false);
    });
  });

  describe('Pattern Matching - canBeChild', () => {
    beforeEach(() => {
      manager.registerMany(testSchemas);
    });

    describe('Wildcard patterns (*)', () => {
      it('should accept any child when parent accepts "*"', () => {
        expect(manager.canBeChild('button', 'box')).toBe(true);
        expect(manager.canBeChild('text', 'box')).toBe(true);
        expect(manager.canBeChild('@theme/dark', 'box')).toBe(true);
        expect(manager.canBeChild('visual-card', 'box')).toBe(true);
        expect(manager.canBeChild('custom-component', 'box')).toBe(true);
      });
    });

    describe('Exact match patterns', () => {
      it('should accept children with exact type match', () => {
        expect(manager.canBeChild('button', 'section')).toBe(true);
        expect(manager.canBeChild('text', 'section')).toBe(true);
      });

      it('should reject children without exact type match', () => {
        expect(manager.canBeChild('box', 'section')).toBe(false);
        expect(manager.canBeChild('custom-button', 'section')).toBe(false);
        expect(manager.canBeChild('button-custom', 'section')).toBe(false);
      });
    });

    describe('Prefix patterns (@theme/*)', () => {
      it('should accept children matching prefix pattern', () => {
        expect(manager.canBeChild('@theme/dark', 'themeContainer')).toBe(true);
        expect(manager.canBeChild('@theme/light', 'themeContainer')).toBe(true);
        expect(manager.canBeChild('@theme/custom', 'themeContainer')).toBe(true);
      });

      it('should reject children not matching prefix pattern', () => {
        expect(manager.canBeChild('button', 'themeContainer')).toBe(false);
        expect(manager.canBeChild('text', 'themeContainer')).toBe(false);
        expect(manager.canBeChild('theme/dark', 'themeContainer')).toBe(false);
        expect(manager.canBeChild('visual-card', 'themeContainer')).toBe(false);
      });
    });

    describe('Suffix patterns (visual-*)', () => {
      it('should accept children matching suffix pattern', () => {
        expect(manager.canBeChild('visual-card', 'visualWrapper')).toBe(true);
        expect(manager.canBeChild('visual-button', 'visualWrapper')).toBe(true);
        expect(manager.canBeChild('visual-text', 'visualWrapper')).toBe(true);
      });

      it('should reject children not matching suffix pattern', () => {
        expect(manager.canBeChild('button', 'visualWrapper')).toBe(false);
        expect(manager.canBeChild('text', 'visualWrapper')).toBe(false);
        expect(manager.canBeChild('card-visual', 'visualWrapper')).toBe(false);
        expect(manager.canBeChild('@theme/visual', 'visualWrapper')).toBe(false);
      });
    });
  });
});
