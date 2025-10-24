import { PreviewClient } from '@craftile/preview-client';
import type { Block, MoveInstruction, Region, UpdatesEvent, WindowMessages } from '@craftile/types';
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

interface PositionInfo {
  parentId?: string;
  regionName?: string;
  position?: number;
  afterId?: string;
  beforeId?: string;
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
        const regionName = text.substring('BEGIN region: '.length);
        pendingRegions.set(regionName, node);
      } else if (text.startsWith('END region: ')) {
        const regionName = text.substring('END region: '.length);
        const beginComment = pendingRegions.get(regionName);
        if (beginComment) {
          this.regionCommentsCache.set(regionName, {
            begin: beginComment,
            end: node,
          });
          pendingRegions.delete(regionName);
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
      this.moveBlockUsingDOM(block, moveInstruction);
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
    const { blocks, regions } = updates;

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
        // Block not in DOM - insert it
        const positionInfo = this.calculatePosition(block, regions, blocks);
        this.insertBlock(block, html, positionInfo);
      } else {
        // Block exists in DOM - update it
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

  private moveBlockUsingDOM(block: Block, moveInstruction: MoveInstruction) {
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

    if (toParent) {
      const parentElement = this.getElementCached(toParent);

      if (!parentElement) {
        console.error(`Parent element ${toParent} not found for move operation`);
        return;
      }

      this.insertElementInContainer(blockElement, parentElement, block.id, toIndex);
    } else if (toRegion) {
      const insertionPoint = this.findRegionInsertionPoint(toRegion, toIndex, undefined, undefined, block.id);

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

  private insertElementInContainer(
    element: HTMLElement,
    container: HTMLElement,
    elementId: string,
    index?: number
  ): void {
    const blockId = container.getAttribute('data-block');
    const comments = blockId ? this.childrenCommentsCache.get(blockId) : null;

    if (comments) {
      const insertionPoint = this.findPositionBetweenComments(comments.begin, comments.end, index, elementId);
      insertionPoint.parent.insertBefore(element, insertionPoint.before);
    } else {
      const children = Array.from(container.children);
      const otherChildren = children.filter((child) => child.getAttribute('data-block') !== elementId);
      const insertBefore = index !== undefined && index < otherChildren.length ? otherChildren[index] : null;

      container.insertBefore(element, insertBefore);
    }
  }

  private insertBlock(block: Block, html: string, positionInfo: PositionInfo): void {
    if (this.getElementCached(block.id)) {
      return;
    }

    this.previewClient.emit('block.insert.before', {
      blockId: block.id,
      blockType: block.type,
      block,
      html,
      positionInfo,
    });

    const newElement = this.parseHtmlElement(html, block.id);
    if (!newElement) {
      return;
    }

    const { parentId, regionName, position, afterId, beforeId } = positionInfo;

    if (parentId) {
      const parentElement = this.getElementCached(parentId);

      if (!parentElement) {
        console.error(`Parent element ${parentId} not found for block ${block.id}`);
        return;
      }

      this.insertElementByPosition(newElement, parentElement, position, afterId, beforeId);
    } else if (regionName) {
      const insertionPoint = this.findRegionInsertionPoint(regionName, position, afterId, beforeId);
      if (!insertionPoint) {
        console.error(`Failed to find insertion point for region: ${regionName}`);
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
      html,
      positionInfo,
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

  private insertElementByPosition(
    element: HTMLElement,
    parentElement: HTMLElement,
    position?: number,
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
      } else if (typeof position === 'number') {
        const insertionPoint = this.findPositionBetweenComments(comments.begin, comments.end, position);
        comments.begin.parentNode!.insertBefore(element, insertionPoint.before);
        return;
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
      } else if (typeof position === 'number') {
        const children = Array.from(parentElement.children);
        insertBefore = children[position] || null;
      }

      parentElement.insertBefore(element, insertBefore);
    }
  }

  private findRegionInsertionPoint(
    regionName: string,
    position?: number,
    afterId?: string,
    beforeId?: string,
    excludeBlockId?: string
  ): InsertionPoint | null {
    const regionComments = this.regionCommentsCache.get(regionName);
    if (!regionComments) {
      console.error(`Region comments not found for region: ${regionName}`);
      return null;
    }

    const { begin: beginComment, end: endComment } = regionComments;

    let insertBefore: Node | null = null;

    if (beforeId) {
      // Insert before specific block
      const beforeElement = this.getElementCached(beforeId);
      if (beforeElement) {
        insertBefore = beforeElement;
      }
    } else if (afterId) {
      // Insert after specific block
      const afterElement = this.getElementCached(afterId);
      if (afterElement && afterElement.nextSibling) {
        insertBefore = afterElement.nextSibling;
      }
    } else if (typeof position === 'number') {
      // Insert at specific position
      insertBefore = this.findPositionInRegion(beginComment, endComment, position, excludeBlockId);
    }

    // If no specific insertion point found, insert before the end comment
    if (!insertBefore) {
      insertBefore = endComment;
    }

    return {
      parent: beginComment.parentNode!,
      before: insertBefore,
    };
  }

  private findPositionInRegion(
    beginComment: Comment,
    endComment: Comment,
    position: number,
    excludeBlockId?: string
  ): Node | null {
    const regionBlocks: Element[] = [];
    let currentNode = beginComment.nextSibling;

    while (currentNode && currentNode !== endComment) {
      if (currentNode.nodeType === Node.ELEMENT_NODE && (currentNode as Element).hasAttribute('data-block')) {
        const blockId = (currentNode as Element).getAttribute('data-block');
        if (!excludeBlockId || blockId !== excludeBlockId) {
          regionBlocks.push(currentNode as Element);
        }
      }

      currentNode = currentNode.nextSibling;
    }

    return position < regionBlocks.length ? regionBlocks[position] : null;
  }

  private findPositionBetweenComments(
    beginComment: Comment,
    endComment: Comment,
    index?: number,
    excludeBlockId?: string
  ): InsertionPoint {
    let insertBefore: Node | null = null;

    if (typeof index === 'number') {
      // Find all blocks between comments
      const blocks: Element[] = [];
      let currentNode = beginComment.nextSibling;

      while (currentNode && currentNode !== endComment) {
        if (currentNode.nodeType === Node.ELEMENT_NODE && (currentNode as Element).hasAttribute('data-block')) {
          const blockId = (currentNode as Element).getAttribute('data-block');
          if (!excludeBlockId || blockId !== excludeBlockId) {
            blocks.push(currentNode as Element);
          }
        }
        currentNode = currentNode.nextSibling;
      }

      // Insert at the specified index
      insertBefore = index < blocks.length ? blocks[index] : null;
    }

    // If no specific position, insert before end comment
    if (!insertBefore) {
      insertBefore = endComment;
    }

    return {
      parent: beginComment.parentNode!,
      before: insertBefore,
    };
  }

  private calculatePosition(block: Block, regions: Region[], blocks: Record<string, Block>): PositionInfo {
    if (block.parentId) {
      const parentBlock = blocks[block.parentId];
      if (!parentBlock) {
        console.warn(`Block data not found for block ${block.id}`);
      }

      const position = parentBlock.children.indexOf(block.id);
      if (position === -1) {
        console.warn(`Block ${block.id} not found in parent ${block.parentId} children`);
        return { parentId: block.parentId };
      }

      const { afterId, beforeId } = this.findAdjacentSiblings(parentBlock.children, position, blocks);

      return {
        parentId: block.parentId,
        position,
        afterId,
        beforeId,
      };
    } else {
      // Block is at region level - find position in region
      for (const region of regions) {
        const position = region.blocks.indexOf(block.id);
        if (position !== -1) {
          const { afterId, beforeId } = this.findAdjacentSiblings(region.blocks, position, blocks);
          return {
            regionName: region.name,
            position,
            afterId,
            beforeId,
          };
        }
      }

      return {};
    }
  }

  private findAdjacentSiblings(
    siblings: string[],
    currentIndex: number,
    blocks: Record<string, Block>
  ): { afterId?: string; beforeId?: string } {
    let afterId: string | undefined;
    let beforeId: string | undefined;

    // find the first enabled block before current block
    for (let i = currentIndex - 1; i >= 0; i--) {
      const siblingBlock = blocks[siblings[i]];
      if (siblingBlock && !siblingBlock.disabled) {
        afterId = siblings[i];
        break;
      }
    }

    // find the first enabled block after current block
    for (let i = currentIndex + 1; i < siblings.length; i++) {
      const siblingBlock = blocks[siblings[i]];
      if (siblingBlock && !siblingBlock.disabled) {
        beforeId = siblings[i];
        break;
      }
    }

    return { afterId, beforeId };
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
