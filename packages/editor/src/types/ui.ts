import type { Component } from 'vue';

export interface SidebarPanel {
  id?: string;
  title: string;
  render: Component | string | (() => HTMLElement);
  icon?: Component | string | (() => HTMLElement);
  order?: number;
}
