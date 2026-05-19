// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import RawHtmlRenderer from '../src/index';
import type { Block, UpdatesEvent, WindowMessages } from '@craftile/types';

class FakePreviewClient {
  public inspector = {
    updateTrackedElement: vi.fn(),
  };

  public emit = vi.fn();

  on = vi.fn(() => {
    return () => {};
  });
}

function installDom(html: string) {
  document.body.innerHTML = html;
  Object.defineProperty(globalThis.HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn(),
  });
}

function makeBlock(id: string, children: string[] = []): Block {
  return {
    id,
    type: 'test',
    properties: {},
    children,
  };
}

function makeUpdates(
  html: Record<string, string>,
  blocks: Record<string, Block>,
  changes: Partial<UpdatesEvent['changes']>
): WindowMessages['updates.effects'] {
  return {
    effects: { html },
    blocks,
    regions: [{ id: 'main', name: 'main', blocks: [] }],
    changes: {
      added: [],
      updated: [],
      removed: [],
      moved: {},
      ...changes,
    },
  };
}

function findComment(root: Node, text: string): Comment | undefined {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_COMMENT);
  let node: Comment | null;

  while ((node = walker.nextNode() as Comment | null)) {
    if (node.textContent?.trim() === text) {
      return node;
    }
  }
}

describe('RawHtmlRenderer child comment cache', () => {
  let renderer: RawHtmlRenderer;

  beforeEach(() => {
    installDom('<!--BEGIN region: main--><!--END region: main-->');
    renderer = new RawHtmlRenderer(new FakePreviewClient() as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('rebuilds nested children comments after an HTML effect batch', () => {
    (renderer as any).handleEffects(
      makeUpdates(
        {
          root: `
            <div data-block="root">
              <div>
                <!--BEGIN children: root-->
                <div data-block="nested">
                  <section>
                    <!--BEGIN children: nested-->
                    <div data-block="existing-child"></div>
                    <!--END children: nested-->
                  </section>
                </div>
                <!--END children: root-->
              </div>
            </div>
          `,
        },
        {
          root: makeBlock('root', ['nested']),
        },
        {
          added: ['root'],
          positions: {
            root: { regionId: 'main' },
          },
        }
      )
    );

    expect((renderer as any).childrenCommentsCache.has('root')).toBe(true);
    expect((renderer as any).childrenCommentsCache.has('nested')).toBe(true);

    (renderer as any).handleEffects(
      makeUpdates(
        {
          'new-child': '<p data-block="new-child">New child</p>',
        },
        {
          'new-child': makeBlock('new-child'),
        },
        {
          added: ['new-child'],
          positions: {
            'new-child': { parentId: 'nested' },
          },
        }
      )
    );

    const nestedElement = document.querySelector('[data-block="nested"]')!;
    const newChild = document.querySelector('[data-block="new-child"]')!;
    const endComment = findComment(nestedElement, 'END children: nested');

    expect(endComment).toBeDefined();
    expect(newChild.parentNode).toBe(endComment!.parentNode);
    expect(newChild.nextSibling).toBe(endComment);
  });

  it('clears stale nested children comments after an HTML update removes them', () => {
    (renderer as any).handleEffects(
      makeUpdates(
        {
          root: `
            <div data-block="root">
              <!--BEGIN children: root-->
              <div data-block="nested">
                <!--BEGIN children: nested-->
                <!--END children: nested-->
              </div>
              <!--END children: root-->
            </div>
          `,
        },
        {
          root: makeBlock('root', ['nested']),
        },
        {
          added: ['root'],
          positions: {
            root: { regionId: 'main' },
          },
        }
      )
    );

    expect((renderer as any).childrenCommentsCache.has('nested')).toBe(true);

    (renderer as any).handleEffects(
      makeUpdates(
        {
          root: `
            <div data-block="root">
              <!--BEGIN children: root-->
              <div data-block="nested"></div>
              <!--END children: root-->
            </div>
          `,
        },
        {
          root: makeBlock('root', ['nested']),
        },
        {
          updated: ['root'],
        }
      )
    );

    expect((renderer as any).childrenCommentsCache.has('root')).toBe(true);
    expect((renderer as any).childrenCommentsCache.has('nested')).toBe(false);
  });

  it('skips a child HTML effect when the parent HTML effect already contains it', () => {
    (renderer as any).handleEffects(
      makeUpdates(
        {
          parent: `
            <div data-block="parent">
              <!--BEGIN children: parent-->
              <span data-block="child">from parent</span>
              <!--END children: parent-->
            </div>
          `,
          child: '<span data-block="child">from child</span>',
        },
        {
          parent: makeBlock('parent', ['child']),
          child: { ...makeBlock('child'), parentId: 'parent' },
        },
        {
          added: ['parent', 'child'],
          positions: {
            parent: { regionId: 'main' },
            child: { parentId: 'parent' },
          },
        }
      )
    );

    expect(document.querySelector('[data-block="child"]')?.textContent).toBe('from parent');
    expect(document.querySelectorAll('[data-block="child"]')).toHaveLength(1);
  });

  it('applies a descendant HTML effect when only a grandparent has an HTML effect', () => {
    (renderer as any).handleEffects(
      makeUpdates(
        {
          grandparent: `
            <section data-block="grandparent">
              <!--BEGIN children: grandparent-->
              <div data-block="parent">
                <!--BEGIN children: parent-->
                <span data-block="child">from grandparent</span>
                <!--END children: parent-->
              </div>
              <!--END children: grandparent-->
            </section>
          `,
          child: '<span data-block="child">from child</span>',
        },
        {
          grandparent: makeBlock('grandparent', ['parent']),
          parent: { ...makeBlock('parent', ['child']), parentId: 'grandparent' },
          child: { ...makeBlock('child'), parentId: 'parent' },
        },
        {
          added: ['grandparent', 'child'],
          positions: {
            grandparent: { regionId: 'main' },
            child: { parentId: 'parent' },
          },
        }
      )
    );

    expect(document.querySelector('[data-block="child"]')?.textContent).toBe('from child');
    expect(document.querySelectorAll('[data-block="child"]')).toHaveLength(1);
  });

  it('applies a child HTML effect when ancestry data is missing', () => {
    (renderer as any).handleEffects(
      makeUpdates(
        {
          parent: `
            <div data-block="parent">
              <!--BEGIN children: parent-->
              <!--END children: parent-->
            </div>
          `,
          child: '<span data-block="child">from child</span>',
        },
        {
          parent: makeBlock('parent', ['child']),
          child: makeBlock('child'),
        },
        {
          added: ['parent', 'child'],
          positions: {
            parent: { regionId: 'main' },
            child: { parentId: 'parent' },
          },
        }
      )
    );

    expect(document.querySelector('[data-block="child"]')?.textContent).toBe('from child');
    expect(document.querySelectorAll('[data-block="child"]')).toHaveLength(1);
  });
});
