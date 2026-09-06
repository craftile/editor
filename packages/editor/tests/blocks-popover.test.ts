import { describe, expect, it } from 'vitest';
import { resolveOpenCategories } from '../src/composables/blocks-popover';

describe('resolveOpenCategories', () => {
  const categories = ['Content', 'Layout', 'Media'];

  it('opens only the first category when there is no query', () => {
    expect(resolveOpenCategories('', categories)).toEqual(['Content']);
  });

  it('treats a whitespace-only query as no query', () => {
    expect(resolveOpenCategories('   ', categories)).toEqual(['Content']);
  });

  it('opens every category when a query is active', () => {
    expect(resolveOpenCategories('hero', categories)).toEqual(['Content', 'Layout', 'Media']);
  });

  it('returns an empty list when there are no categories', () => {
    expect(resolveOpenCategories('', [])).toEqual([]);
    expect(resolveOpenCategories('hero', [])).toEqual([]);
  });

  it('does not return the same array instance it was given', () => {
    const result = resolveOpenCategories('hero', categories);
    expect(result).not.toBe(categories);
  });
});
