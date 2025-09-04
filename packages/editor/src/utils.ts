import type { Component } from 'vue';

/**
 * Check if a render value is a Vue component
 */
export function isVueComponent(render: any): render is Component {
  return (
    render &&
    typeof render === 'object' &&
    (render.setup || render.render || render.__vccOpts || render.name || render.__v_skip)
  );
}

export function isComponentString(render: any): render is string {
  return typeof render === 'string';
}

export function isHtmlRenderFunction(render: any): render is (context: any) => HTMLElement {
  return typeof render === 'function' && !isVueComponent(render);
}
