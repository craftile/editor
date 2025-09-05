import type { Component } from 'vue';

export interface SidebarPanel {
  id?: string;
  title: string;
  render: Component | string | (() => HTMLElement);
  icon?: Component | string | (() => HTMLElement);
  order?: number;
}

export interface HeaderActionButton {
  text: string;
  variant?: 'default' | 'primary' | 'destructive' | 'secondary' | 'accent';
  onClick: () => void;
}

export interface HeaderAction {
  id?: string;
  slot: 'left' | 'center' | 'right';
  render?: Component | string | (() => HTMLElement);
  button?: HeaderActionButton;
  order?: number;
}

export interface ConfigurationPanel {
  id: string;
  title: string;
  icon?: Component | string | (() => HTMLElement);
  render: Component | string | (() => HTMLElement);
  order?: number;
}
