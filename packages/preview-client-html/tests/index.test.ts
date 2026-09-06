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

function makeDirectUpdates(
  blocks: Record<string, Block>,
  changes: Partial<UpdatesEvent['changes']>
): WindowMessages['craftile.editor.updates'] {
  return {
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

describe('RawHtmlRenderer static siblings outside children markers', () => {
  let renderer: RawHtmlRenderer;

  beforeEach(() => {
    installDom('<!--BEGIN region: main--><!--END region: main-->');
    renderer = new RawHtmlRenderer(new FakePreviewClient() as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function renderParent(html: string, children: string[]) {
    (renderer as any).handleEffects(
      makeUpdates(
        { parent: html },
        { parent: makeBlock('parent', children) },
        {
          added: ['parent'],
          positions: {
            parent: { regionId: 'main' },
          },
        }
      )
    );
  }

  function insertChild(id: string, position: { afterId?: string; beforeId?: string }) {
    (renderer as any).handleEffects(
      makeUpdates(
        { [id]: `<p data-block="${id}">${id}</p>` },
        { [id]: makeBlock(id) },
        {
          added: [id],
          positions: {
            [id]: { parentId: 'parent', ...position },
          },
        }
      )
    );
  }

  it('inserts the first dynamic child between the markers when afterId is a static block outside the wrapper', () => {
    renderParent(
      `
        <section data-block="parent">
          <h2 data-block="title">Title</h2>
          <div class="items">
            <!--BEGIN children: parent-->
            <!--END children: parent-->
          </div>
        </section>
      `,
      ['title']
    );

    insertChild('item-1', { afterId: 'title' });

    const parentElement = document.querySelector('[data-block="parent"]')!;
    const item = document.querySelector('[data-block="item-1"]')!;
    const beginComment = findComment(parentElement, 'BEGIN children: parent')!;
    const endComment = findComment(parentElement, 'END children: parent')!;

    expect(item.parentNode).toBe(beginComment.parentNode);
    expect(beginComment.compareDocumentPosition(item) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(item.nextSibling).toBe(endComment);
  });

  it('inserts the first dynamic child between the markers when afterId is a static block before BEGIN in the same wrapper', () => {
    renderParent(
      `
        <section data-block="parent">
          <div class="items">
            <h2 data-block="title">Title</h2>
            <!--BEGIN children: parent-->
            <!--END children: parent-->
          </div>
        </section>
      `,
      ['title']
    );

    insertChild('item-1', { afterId: 'title' });

    const parentElement = document.querySelector('[data-block="parent"]')!;
    const item = document.querySelector('[data-block="item-1"]')!;
    const beginComment = findComment(parentElement, 'BEGIN children: parent')!;
    const endComment = findComment(parentElement, 'END children: parent')!;

    expect(item.parentNode).toBe(beginComment.parentNode);
    expect(beginComment.compareDocumentPosition(item) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(item.nextSibling).toBe(endComment);
  });

  it('falls back to afterId when beforeId is a static block after END', () => {
    renderParent(
      `
        <section data-block="parent">
          <div class="items">
            <!--BEGIN children: parent-->
            <p data-block="item-1">item-1</p>
            <!--END children: parent-->
            <footer data-block="footer">Footer</footer>
          </div>
        </section>
      `,
      ['item-1', 'footer']
    );

    insertChild('item-2', { afterId: 'item-1', beforeId: 'footer' });

    const parentElement = document.querySelector('[data-block="parent"]')!;
    const item1 = document.querySelector('[data-block="item-1"]')!;
    const item2 = document.querySelector('[data-block="item-2"]')!;
    const endComment = findComment(parentElement, 'END children: parent')!;

    expect(item1.nextSibling).toBe(item2);
    expect(item2.compareDocumentPosition(endComment) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});

describe('RawHtmlRenderer block removal events', () => {
  let previewClient: FakePreviewClient;
  let renderer: RawHtmlRenderer;

  beforeEach(() => {
    previewClient = new FakePreviewClient();
    installDom('<!--BEGIN region: main--><div data-block="removed">Removed</div><!--END region: main-->');
    renderer = new RawHtmlRenderer(previewClient as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('includes block data on remove lifecycle events', () => {
    const block = makeBlock('removed');
    const element = document.querySelector('[data-block="removed"]')!;

    (renderer as any).handleDirectUpdates(
      makeDirectUpdates(
        {
          removed: block,
        },
        {
          removed: ['removed'],
        }
      )
    );

    expect(previewClient.emit).toHaveBeenCalledWith('block.remove.before', {
      blockId: 'removed',
      blockType: 'test',
      block,
      element,
    });
    expect(previewClient.emit).toHaveBeenCalledWith('block.remove.after', {
      blockId: 'removed',
      blockType: 'test',
      block,
      element,
    });
    expect(document.querySelector('[data-block="removed"]')).toBeNull();
  });

  it('includes block data when a disabled block is removed from the DOM', () => {
    const block = { ...makeBlock('removed'), disabled: true };
    const element = document.querySelector('[data-block="removed"]')!;

    (renderer as any).handleDirectUpdates(
      makeDirectUpdates(
        {
          removed: block,
        },
        {
          updated: ['removed'],
        }
      )
    );

    expect(previewClient.emit).toHaveBeenCalledWith('block.remove.before', {
      blockId: 'removed',
      blockType: 'test',
      block,
      element,
    });
    expect(previewClient.emit).toHaveBeenCalledWith('block.remove.after', {
      blockId: 'removed',
      blockType: 'test',
      block,
      element,
    });
    expect(document.querySelector('[data-block="removed"]')).toBeNull();
  });
});

describe('RawHtmlRenderer JS effects', () => {
  let previewClient: FakePreviewClient;
  let renderer: RawHtmlRenderer;
  let createdScripts: WeakSet<HTMLScriptElement>;

  function installExecutableScriptHarness() {
    createdScripts = new WeakSet();
    const createElement = document.createElement.bind(document);
    const appendChild = document.head.appendChild.bind(document.head);
    const replaceChild = document.head.replaceChild.bind(document.head);
    const executeIfFreshScript = (node: Node) => {
      if (node instanceof HTMLScriptElement && !node.src && createdScripts.has(node)) {
        new Function('window', node.textContent || '')(window);
      }
    };

    vi.spyOn(document, 'createElement').mockImplementation(((tagName: string, options?: ElementCreationOptions) => {
      const element = createElement(tagName, options);

      if (tagName.toLowerCase() === 'script') {
        createdScripts.add(element as HTMLScriptElement);
      }

      return element;
    }) as typeof document.createElement);

    vi.spyOn(document.head, 'appendChild').mockImplementation(((node: Node) => {
      const appended = appendChild(node);
      executeIfFreshScript(node);

      return appended;
    }) as typeof document.head.appendChild);

    vi.spyOn(document.head, 'replaceChild').mockImplementation(((newChild: Node, oldChild: Node) => {
      const replaced = replaceChild(newChild, oldChild);
      executeIfFreshScript(newChild);

      return replaced;
    }) as typeof document.head.replaceChild);
  }

  beforeEach(() => {
    previewClient = new FakePreviewClient();
    installDom('');
    document.head.innerHTML = '';
    delete (window as any).__craftileEffectCount;
    installExecutableScriptHarness();
    renderer = new RawHtmlRenderer(previewClient as any);
  });

  afterEach(() => {
    delete (window as any).__craftileEffectCount;
    vi.restoreAllMocks();
  });

  it('executes inline JS effects from a fresh script element', () => {
    (renderer as any).handleJsEffects([
      '<script>window.__craftileEffectCount = (window.__craftileEffectCount || 0) + 1;</script>',
    ]);

    expect((window as any).__craftileEffectCount).toBe(1);
    expect(previewClient.emit).toHaveBeenCalledWith('scripts.execution.complete', {
      total: 1,
      completed: 1,
      failed: 0,
      success: true,
    });
  });

  it('appends external JS effects as fresh scripts with their attributes', () => {
    (renderer as any).handleJsEffects([
      '<script src="https://example.test/effect.js" defer data-effect="hero"></script>',
    ]);

    const script = document.head.querySelector('script[src="https://example.test/effect.js"]') as HTMLScriptElement;

    expect(script).toBeInstanceOf(HTMLScriptElement);
    expect(createdScripts.has(script)).toBe(true);
    expect(script.src).toBe('https://example.test/effect.js');
    expect(script.defer).toBe(true);
    expect(script.getAttribute('data-effect')).toBe('hero');

    script.dispatchEvent(new Event('load'));

    expect(previewClient.emit).toHaveBeenCalledWith('scripts.execution.complete', {
      total: 1,
      completed: 1,
      failed: 0,
      success: true,
    });
  });

  it('does not execute duplicate inline JS effects twice', () => {
    const scriptHtml = '<script>window.__craftileEffectCount = (window.__craftileEffectCount || 0) + 1;</script>';

    (renderer as any).handleJsEffects([scriptHtml]);
    (renderer as any).handleJsEffects([scriptHtml]);

    expect((window as any).__craftileEffectCount).toBe(1);
    expect(document.head.querySelectorAll('script:not([src]):not([id])')).toHaveLength(1);
    expect(previewClient.emit).toHaveBeenLastCalledWith('scripts.execution.complete', {
      total: 1,
      completed: 1,
      failed: 0,
      success: true,
    });
  });

  it('does not append duplicate external JS effects twice', () => {
    const scriptHtml = '<script src="https://example.test/effect.js"></script>';

    (renderer as any).handleJsEffects([scriptHtml]);
    document.head.querySelector('script[src="https://example.test/effect.js"]')!.dispatchEvent(new Event('load'));

    (renderer as any).handleJsEffects([scriptHtml]);

    expect(document.head.querySelectorAll('script[src="https://example.test/effect.js"]')).toHaveLength(1);
    expect(previewClient.emit).toHaveBeenLastCalledWith('scripts.execution.complete', {
      total: 1,
      completed: 1,
      failed: 0,
      success: true,
    });
  });

  it('replaces same-id scripts and executes the replacement as a fresh script', () => {
    (renderer as any).handleJsEffects(['<script id="craftile-effect">window.__craftileEffectCount = 1;</script>']);

    const firstScript = document.getElementById('craftile-effect');

    (renderer as any).handleJsEffects(['<script id="craftile-effect">window.__craftileEffectCount = 2;</script>']);

    const replacementScript = document.getElementById('craftile-effect');

    expect((window as any).__craftileEffectCount).toBe(2);
    expect(replacementScript).toBeInstanceOf(HTMLScriptElement);
    expect(replacementScript).not.toBe(firstScript);
    expect(document.head.querySelectorAll('script#craftile-effect')).toHaveLength(1);
    expect(previewClient.emit).toHaveBeenLastCalledWith('scripts.execution.complete', {
      total: 1,
      completed: 1,
      failed: 0,
      success: true,
    });
  });
});
