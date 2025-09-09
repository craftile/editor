import { CRAFTILE_EDITOR_SYMBOL } from '../constants';
import type { CraftileEditor } from '../editor';

export function usePreview() {
  const editor = inject<CraftileEditor>(CRAFTILE_EDITOR_SYMBOL);

  if (!editor) {
    throw new Error('usePreview must be used within a component that has access to CraftileEditor');
  }

  const currentPreviewUrl = computed(() => editor.preview.state.previewUrl);
  const isIframeReady = computed(() => editor.preview.state.isIframeReady);
  const previewFrame = computed(() => editor.preview.state.previewFrame);

  return {
    currentPreviewUrl,
    isIframeReady,
    previewFrame,

    registerFrame: editor.preview._registerFrame.bind(editor.preview),
    onMessage: editor.preview.onMessage.bind(editor.preview),
    sendMessage: editor.preview.sendMessage.bind(editor.preview),

    loadUrl: editor.preview.loadUrl.bind(editor.preview),
    loadFromHtml: editor.preview.loadFromHtml.bind(editor.preview),
    reload: editor.preview.reload.bind(editor.preview),
    getFrame: editor.preview.getFrame.bind(editor.preview),
  };
}
