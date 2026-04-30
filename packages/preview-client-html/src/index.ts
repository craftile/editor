import { PreviewClient } from '@craftile/preview-client';
import type { Block, BlockPosition, MoveInstruction, UpdatesEvent, WindowMessages } from '@craftile/types';
import morphdom from 'morphdom';

type MorphdomFunction = typeof morphdom;
export type MorphdomOptions = Parameters<MorphdomFunction>[2];

interface InsertionPoint {
  parent: Node;
  before: Node | null;
}

interface RegionComments {
  begin: Comment;
  end: Comment;
}

export interface HtmlPreviewClientOptions {
  morphdom?: MorphdomOptions;
}

export default class RawHtmlRenderer {
  private previewClient: PreviewClient;
  private morphdomOptions: MorphdomOptions;
  private elementCache = new Map<string, HTMLElement>();
  private regionCommentsCache = new Map<string, RegionComments>();
  private childrenCommentsCache = new Map<string, RegionComments>();
  private pendingScripts = new Set<HTMLScriptElement>();
  private scriptExecutionCount = { total: 0, completed: 0, failed: 0 };

  constructor(previewClient?: PreviewClient, options?: HtmlPreviewClientOptions) {
    this.previewClient = previewClient || new PreviewClient();
    this.morphdomOptions = options?.morphdom || {};

    // Handle generated effects (HTML/CSS/JS updates)
    this.previewClient.on('updates.effects', this.handleEffects.bind(this));

    // Handle direct editor updates like move/disable/enable operations
    this.previewClient.on('craftile.editor.updates', this.handleDirectUpdates.bind(this));

    this.cacheRegionComments();
    this.cacheChildrenComments();
  }

  static init(previewClient?: PreviewClient, options?: HtmlPreviewClientOptions): RawHtmlRenderer {
    return new RawHtmlRenderer(previewClient, options);
  }

  private getElementCached(blockId: string): HTMLElement | null {
    if (this.elementCache.has(blockId)) {
      const element = this.elementCache.get(blockId)!;

      if (element.isConnected) {
        return element;
      }

      this.elementCache.delete(blockId);
    }

    const element = document.querySelector(`[data-block="${blockId}"]`) as HTMLElement;

    if (element) {
      this.elementCache.set(blockId, element);
    }

    return element;
  }

  private cacheRegionComments(): void {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_COMMENT, null);
    let node: Comment | null;
    const pendingRegions = new Map<string, Comment>();

    while ((node = walker.nextNode() as Comment)) {
      const text = node.textContent?.trim();
      if (!text) {
        continue;
      }

      if (text.startsWith('BEGIN region: ')) {
        const regionId = text.substring('BEGIN region: '.length);
        pendingRegions.set(regionId, node);
      } else if (text.startsWith('END region: ')) {
        const regionId = text.substring('END region: '.length);
        const beginComment = pendingRegions.get(regionId);
        if (beginComment) {
          this.regionCommentsCache.set(regionId, {
            begin: beginComment,
            end: node,
          });
          pendingRegions.delete(regionId);
        }
      }
    }
  }

  private cacheChildrenComments(): void {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_COMMENT, null);
    let node: Comment | null;
    const pendingChildren = new Map<string, Comment>();

    while ((node = walker.nextNode() as Comment)) {
      const text = node.textContent?.trim();
      if (!text) {
        continue;
      }

      if (text.startsWith('BEGIN children: ')) {
        const blockId = text.substring('BEGIN children: '.length);
        pendingChildren.set(blockId, node);
      } else if (text.startsWith('END children: ')) {
        const blockId = text.substring('END children: '.length);
        const beginComment = pendingChildren.get(blockId);
        if (beginComment) {
          this.childrenCommentsCache.set(blockId, {
            begin: beginComment,
            end: node,
          });
          pendingChildren.delete(blockId);
        }
      }
    }
  }

  private cacheChildrenCommentsForBlock(blockId: string): void {
    const blockElement = this.getElementCached(blockId);
    if (!blockElement) {
      return;
    }

    // Clear existing cache for this block
    this.childrenCommentsCache.delete(blockId);

    // Walk the block's subtree to find children comments
    const walker = document.createTreeWalker(blockElement, NodeFilter.SHOW_COMMENT, null);
    let node: Comment | null;
    let beginComment: Comment | null = null;

    while ((node = walker.nextNode() as Comment)) {
      const text = node.textContent?.trim();
      if (!text) {
        continue;
      }

      if (text === `BEGIN children: ${blockId}`) {
        beginComment = node;
      } else if (text === `END children: ${blockId}` && beginComment) {
        this.childrenCommentsCache.set(blockId, {
          begin: beginComment,
          end: node,
        });
        break;
      }
    }
  }

  private invalidateCache(changes: UpdatesEvent['changes']): void {
    [...changes.updated, ...changes.removed].forEach((blockId) => {
      this.elementCache.delete(blockId);
      this.childrenCommentsCache.delete(blockId);
    });
  }

  private handleEffects(data: WindowMessages['updates.effects']): void {
    const { effects, blocks, regions, changes } = data;

    if (!effects) {
      return;
    }

    this.invalidateCache(changes);

    if (effects.html) {
      this.handleHtmlEffects(effects.html, { blocks, regions, changes });
    }

    if (effects.css) {
      this.handleCssEffects(effects.css);
    }

    if (effects.js) {
      this.handleJsEffects(effects.js);
    }
  }

  private handleCssEffects(cssEffects: string[]): void {
    for (const styleHtml of cssEffects) {
      this.injectStyleElement(styleHtml);
    }
  }

  private injectStyleElement(styleHtml: string): void {
    const temp = document.createElement('div');
    temp.innerHTML = styleHtml;
    const styleElement = temp.firstElementChild as HTMLStyleElement | HTMLLinkElement;

    if (!styleElement || (styleElement.tagName !== 'STYLE' && styleElement.tagName !== 'LINK')) {
      console.warn('Invalid CSS element provided:', styleHtml);
      return;
    }

    const id = styleElement.id;

    // If element has ID and already exists, replace it
    if (id) {
      const existing = document.getElementById(id);
      if (existing && (existing.tagName === 'STYLE' || existing.tagName === 'LINK')) {
        existing.parentNode?.replaceChild(styleElement, existing);
        return;
      }
    }

    // For inline styles without ID, check for duplicate content
    if (styleElement.tagName === 'STYLE' && !id) {
      const content = styleElement.textContent?.trim();
      if (content) {
        const existingStyles = document.querySelectorAll('style:not([id])');
        for (const existing of existingStyles) {
          if (existing.textContent?.trim() === content) {
            return;
          }
        }
      }
    }

    // For link elements without ID, check for duplicate href+rel
    if (styleElement.tagName === 'LINK' && !id) {
      const href = styleElement.getAttribute('href');
      const rel = styleElement.getAttribute('rel');
      if (href) {
        const existingLinks = document.querySelectorAll('link:not([id])');
        for (const existing of existingLinks) {
          if (existing.getAttribute('href') === href && existing.getAttribute('rel') === rel) {
            return;
          }
        }
      }
    }

    document.head.appendChild(styleElement);
  }

  private handleJsEffects(jsElements: string[]): void {
    this.pendingScripts.clear();
    this.scriptExecutionCount = { total: 0, completed: 0, failed: 0 };

    const validScripts = jsElements.filter((jsHtml) => jsHtml?.trim());
    this.scriptExecutionCount.total = validScripts.length;

    if (validScripts.length === 0) {
      this.emitScriptExecutionComplete();
      return;
    }

    for (const jsHtml of validScripts) {
      this.injectScriptElement(jsHtml);
    }
  }

  private injectScriptElement(scriptHtml: string): void {
    const temp = document.createElement('div');
    temp.innerHTML = scriptHtml;
    const scriptElement = temp.firstElementChild as HTMLScriptElement;

    if (!scriptElement || scriptElement.tagName !== 'SCRIPT') {
      console.warn('Invalid script element provided:', scriptHtml);
      this.onScriptCompleted(false); // Count as failed
      return;
    }

    const id = scriptElement.id;

    // If script has ID and already exists, replace it
    if (id) {
      const existing = document.getElementById(id) as HTMLScriptElement;
      if (existing && existing.tagName === 'SCRIPT') {
        this.pendingScripts.delete(existing);
        existing.parentNode?.replaceChild(scriptElement, existing);
        this.trackScriptExecution(scriptElement);
        return;
      }
    }

    // For inline scripts without ID, check for duplicate content
    if (!scriptElement.src && !id) {
      const content = scriptElement.textContent?.trim();
      if (content) {
        const existingScripts = document.querySelectorAll('script:not([src]):not([id])');
        for (const existing of existingScripts) {
          if (existing.textContent?.trim() === content) {
            this.onScriptCompleted(true);
            return;
          }
        }
      }
    }

    // For external scripts without ID, check for duplicate src
    if (scriptElement.src && !id) {
      const src = scriptElement.src;
      const existingScripts = document.querySelectorAll('script[src]:not([id])') as NodeListOf<HTMLScriptElement>;
      for (const existing of existingScripts) {
        if (existing.src === src) {
          this.onScriptCompleted(true);
          return;
        }
      }
    }

    document.head.appendChild(scriptElement);
    this.trackScriptExecution(scriptElement);
  }

  private trackScriptExecution(scriptElement: HTMLScriptElement): void {
    if (scriptElement.src) {
      this.pendingScripts.add(scriptElement);

      const onLoad = () => {
        this.pendingScripts.delete(scriptElement);
        this.onScriptCompleted(true);
        scriptElement.removeEventListener('load', onLoad);
        scriptElement.removeEventListener('error', onError);
      };

      const onError = () => {
        this.pendingScripts.delete(scriptElement);
        this.onScriptCompleted(false);
        scriptElement.removeEventListener('load', onLoad);
        scriptElement.removeEventListener('error', onError);
      };

      scriptElement.addEventListener('load', onLoad);
      scriptElement.addEventListener('error', onError);
    } else {
      this.onScriptCompleted(true);
    }
  }

  private onScriptCompleted(success: boolean): void {
    if (success) {
      this.scriptExecutionCount.completed++;
    } else {
      this.scriptExecutionCount.failed++;
    }

    const totalProcessed = this.scriptExecutionCount.completed + this.scriptExecutionCount.failed;
    if (totalProcessed >= this.scriptExecutionCount.total) {
      this.emitScriptExecutionComplete();
    }
  }

  private emitScriptExecutionComplete(): void {
    this.previewClient.emit('scripts.execution.complete', {
      total: this.scriptExecutionCount.total,
      completed: this.scriptExecutionCount.completed,
      failed: this.scriptExecutionCount.failed,
      success: this.scriptExecutionCount.failed === 0,
    });
  }

  private handleDirectUpdates(data: WindowMessages['craftile.editor.updates']) {
    const { changes } = data;

    if (changes.moved) {
      this.handleMoves(data);
    }

    if (changes.updated.length > 0) {
      this.handleDisabledBlocks(data);
    }

    if (changes.removed.length > 0) {
      this.handleRemoves(data);
    }
  }

  private handleMoves(updates: UpdatesEvent) {
    const { blocks, changes } = updates;

    for (const [blockId, moveInstruction] of Object.entries(updates.changes.moved)) {
      // Skip move if target parent is being updated (parent html effect will contain the block at correct position)
      if (moveInstruction?.toParent && changes.updated?.includes(moveInstruction?.toParent)) {
        continue;
      }

      if (!this.isValidMoveInstruction(moveInstruction)) {
        console.warn(`Invalid move instruction for block ${blockId}:`, moveInstruction);
        continue;
      }

      const block = blocks[blockId];
      const position = changes.positions?.[blockId];
      this.moveBlockUsingDOM(block, moveInstruction, position);
    }
  }

  private handleDisabledBlocks(updates: UpdatesEvent): void {
    const { blocks, changes } = updates;

    for (const blockId of changes.updated) {
      const block = blocks[blockId];

      if (!block) {
        continue;
      }

      const blockElement = this.getElementCached(blockId);
      const isCurrentlyInDOM = !!blockElement;

      if (block.disabled && isCurrentlyInDOM) {
        // Block was disabled - remove from DOM immediately
        this.removeBlock(block.id);
      } else if (!block.disabled && !isCurrentlyInDOM) {
        // Block was enabled but not in DOM - will be handled by html effect
      }
    }
  }

  private handleRemoves(updates: UpdatesEvent): void {
    const { changes } = updates;

    for (const blockId of changes.removed) {
      this.removeBlock(blockId);
    }
  }

  private handleHtmlEffects(htmlEffects: Record<string, string>, updates: UpdatesEvent) {
    const { blocks, changes } = updates;

    for (const [blockId, html] of Object.entries(htmlEffects)) {
      if (!html) {
        continue;
      }

      const block = blocks[blockId];
      if (!block) {
        console.warn(`Block data not found for ${blockId}`);
        continue;
      }

      if (block.disabled) {
        console.debug(`Skipping disabled block ${blockId}`);
        continue;
      }

      const blockElement = this.getElementCached(blockId);
      const isCurrentlyInDOM = !!blockElement;

      if (!isCurrentlyInDOM) {
        const position = changes.positions?.[blockId];
        if (!position) {
          console.warn(`No position info for block ${blockId}`);
          continue;
        }
        this.insertBlock(block, html, position);
      } else {
        this.updateBlockHtml(block, html);
      }
    }
  }

  private isValidMoveInstruction(instruction: MoveInstruction): boolean {
    const hasTarget = !!(instruction.toParent || instruction.toRegion);
    const hasValidIndex = instruction.toIndex === undefined || instruction.toIndex >= 0;
    return hasTarget && hasValidIndex;
  }

  private removeBlock(blockId: string): void {
    const blockElement = this.getElementCached(blockId);

    if (blockElement) {
      this.previewClient.emit('block.remove.before', {
        blockId,
        element: blockElement,
      });

      blockElement.remove();
      this.elementCache.delete(blockId);

      this.previewClient.emit('block.remove.after', {
        blockId,
        element: blockElement,
      });
    } else {
      console.warn(`Block ${blockId} not found for removal`);
    }
  }

  private moveBlockUsingDOM(block: Block, moveInstruction: MoveInstruction, position?: BlockPosition) {
    const blockElement = this.getElementCached(block.id);
    const { toParent, toRegion, toIndex } = moveInstruction;

    if (!blockElement) {
      console.warn(`Block element ${block.id} not found for move operation`);
      return;
    }

    this.previewClient.emit('block.move.before', {
      blockId: block.id,
      blockType: block.type,
      block,
      element: blockElement,
      toParent,
      toRegion,
      toIndex,
    });

    const afterId = position?.afterId;
    const beforeId = position?.beforeId;

    if (toParent) {
      const parentElement = this.getElementCached(toParent);

      if (!parentElement) {
        console.error(`Parent element ${toParent} not found for move operation`);
        return;
      }

      this.insertElementInParent(blockElement, parentElement, afterId, beforeId);
    } else if (toRegion) {
      const insertionPoint = this.findRegionInsertionPoint(toRegion, afterId, beforeId);

      if (!insertionPoint) {
        console.error(`Failed to find insertion point for region: ${toRegion}`);
        return;
      }

      insertionPoint.parent.insertBefore(blockElement, insertionPoint.before);
    }

    this.previewClient.emit('block.move.after', {
      blockId: block.id,
      blockType: block.type,
      block,
      element: blockElement,
      toParent,
      toRegion,
      toIndex,
    });
  }

  private insertBlock(block: Block, html: string, position: BlockPosition): void {
    if (this.getElementCached(block.id)) {
      return;
    }

    this.previewClient.emit('block.insert.before', {
      blockId: block.id,
      blockType: block.type,
      block,
      html,
      positionInfo: position,
    });

    const newElement = this.parseHtmlElement(html, block.id);
    if (!newElement) {
      return;
    }

    const { parentId, regionId, afterId, beforeId } = position;

    if (parentId) {
      const parentElement = this.getElementCached(parentId);

      if (!parentElement) {
        console.error(`Parent element ${parentId} not found for block ${block.id}`);
        return;
      }

      this.insertElementInParent(newElement, parentElement, afterId, beforeId);
    } else if (regionId) {
      const insertionPoint = this.findRegionInsertionPoint(regionId, afterId, beforeId);
      if (!insertionPoint) {
        console.error(`Failed to find insertion point for region: ${regionId}`);
        return;
      }

      insertionPoint.parent.insertBefore(newElement, insertionPoint.before);
    } else {
      // Fallback to body (should not happen with proper data)
      console.warn(`No parent or region specified for block ${block.id}, inserting into body`);
      document.body.appendChild(newElement);
    }

    this.elementCache.set(block.id, newElement);
    this.cacheChildrenCommentsForBlock(block.id);

    newElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });

    this.previewClient.emit('block.insert.after', {
      blockId: block.id,
      blockType: block.type,
      block,
      element: newElement,
      html,
      positionInfo: position,
    });
  }

  private updateBlockHtml(block: Block, html: string): void {
    if (!html) {
      console.warn(`No HTML provided for block ${block.id}`);
      return;
    }

    const blockElement = this.getElementCached(block.id);
    if (!blockElement) {
      console.warn(`Block element ${block.id} not found for HTML update`);
      return;
    }

    this.previewClient.emit('block.update.before', {
      blockId: block.id,
      blockType: block.type,
      block,
      element: blockElement,
      html,
    });

    morphdom(blockElement, html, this.morphdomOptions);

    // Root tag may have changed after morphdom - invalidate cache and retrieve new element
    this.elementCache.delete(block.id);
    const updatedElement = this.getElementCached(block.id);

    if (!updatedElement) {
      console.error(`Block element ${block.id} not found after morphdom update`);
      return;
    }

    // Notify inspector if element reference changed (root tag changed)
    if (updatedElement !== blockElement) {
      this.previewClient.inspector.updateTrackedElement(block.id, updatedElement);
    }

    // Re-cache children comments after HTML update
    this.cacheChildrenCommentsForBlock(block.id);

    this.previewClient.emit('block.update.after', {
      blockId: block.id,
      blockType: block.type,
      block,
      element: updatedElement,
      html,
    });
  }

  private insertElementInParent(
    element: HTMLElement,
    parentElement: HTMLElement,
    afterId?: string,
    beforeId?: string
  ): void {
    const blockId = parentElement.getAttribute('data-block');
    const comments = blockId ? this.childrenCommentsCache.get(blockId) : null;

    if (comments) {
      let insertBefore: Node | null = null;

      if (beforeId) {
        insertBefore = this.getElementCached(beforeId);
      } else if (afterId) {
        const afterElement = this.getElementCached(afterId);
        if (afterElement && afterElement.nextSibling) {
          insertBefore = afterElement.nextSibling;
        }
      }

      if (!insertBefore) {
        insertBefore = comments.end;
      }

      comments.begin.parentNode!.insertBefore(element, insertBefore);
    } else {
      let insertBefore: Element | null = null;

      if (beforeId) {
        insertBefore = this.getElementCached(beforeId);
      } else if (afterId) {
        const afterElement = this.getElementCached(afterId);
        if (afterElement) {
          insertBefore = afterElement.nextElementSibling;
        }
      }

      parentElement.insertBefore(element, insertBefore);
    }
  }

  private findRegionInsertionPoint(regionId: string, afterId?: string, beforeId?: string): InsertionPoint | null {
    const regionComments = this.regionCommentsCache.get(regionId);
    if (!regionComments) {
      console.error(`Region comments not found for region: ${regionId}`);
      return null;
    }

    const { begin: beginComment, end: endComment } = regionComments;

    let insertBefore: Node | null = null;

    if (beforeId) {
      const beforeElement = this.getElementCached(beforeId);
      if (beforeElement) {
        insertBefore = beforeElement;
      }
    } else if (afterId) {
      const afterElement = this.getElementCached(afterId);
      if (afterElement && afterElement.nextSibling) {
        insertBefore = afterElement.nextSibling;
      }
    }

    if (!insertBefore) {
      insertBefore = endComment;
    }

    return {
      parent: beginComment.parentNode!,
      before: insertBefore,
    };
  }

  private parseHtmlElement(html: string, blockId: string): HTMLElement | null {
    if (!html.trim()) {
      console.error(`Empty HTML provided for block ${blockId}`);
      return null;
    }

    const temp = document.createElement('div');
    temp.innerHTML = html;
    const newElement = temp.firstElementChild as HTMLElement;

    if (!newElement) {
      console.error(`Invalid HTML for block ${blockId}: no element found`);
      return null;
    }

    return newElement;
  }
}
