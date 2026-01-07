import { getRegionId } from '@craftile/core';
import { CRAFTILE_EDITOR_SYMBOL } from '../constants';
import type { CraftileEditor } from '../editor';

export function useLayersPanel() {
  const editor = inject<CraftileEditor>(CRAFTILE_EDITOR_SYMBOL);

  if (!editor) {
    throw new Error('useLayersPanel must be used within a component that has access to CraftileEditor');
  }

  const expandedBlocks = computed(() => editor.ui.state.layersPanel.expandedBlocks);

  const setExpanded = (blockId: string, expanded: boolean) => {
    if (expanded) {
      editor.ui.state.layersPanel.expandedBlocks.add(blockId);
    } else {
      editor.ui.state.layersPanel.expandedBlocks.delete(blockId);
    }
  };

  const isExpanded = (blockId: string) => {
    return editor.ui.state.layersPanel.expandedBlocks.has(blockId);
  };

  const toggleExpanded = (blockId: string) => {
    const expanded = !isExpanded(blockId);
    setExpanded(blockId, expanded);
    return expanded;
  };

  const expandAll = (blockIds: string[]) => {
    blockIds.forEach((blockId) => {
      editor.ui.state.layersPanel.expandedBlocks.add(blockId);
    });
  };

  const collapseAll = (blockIds: string[]) => {
    blockIds.forEach((blockId) => {
      editor.ui.state.layersPanel.expandedBlocks.delete(blockId);
    });
  };

  const collapseRegion = (regionId: string) => {
    const page = editor.engine.getPage();
    const region = page.regions.find((r: any) => getRegionId(r) === regionId);

    if (!region) {
      return;
    }

    const getAllChildIds = (blockId: string): string[] => {
      const block = page.blocks[blockId];
      if (!block || !block.children) {
        return [];
      }

      let childIds: string[] = [];

      block.children.forEach((childId: string) => {
        childIds.push(childId);
        childIds.push(...getAllChildIds(childId));
      });

      return childIds;
    };

    region.blocks.forEach((blockId: string) => {
      const ids = [blockId, ...getAllChildIds(blockId)];
      collapseAll(ids);
    });
  };

  const expandAncestors = (blockId: string) => {
    const page = editor.engine.getPage();
    const block = page.blocks[blockId];

    if (!block) {
      return;
    }

    // Expand all ancestors
    let currentParentId = block.parentId;
    while (currentParentId) {
      editor.ui.state.layersPanel.expandedBlocks.add(currentParentId);
      const parentBlock = page.blocks[currentParentId];
      currentParentId = parentBlock?.parentId;
    }
  };

  return {
    expandedBlocks,

    setExpanded,
    isExpanded,
    toggleExpanded,
    expandAll,
    collapseAll,
    collapseRegion,
    expandAncestors,
  };
}
