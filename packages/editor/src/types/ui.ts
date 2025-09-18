import { CraftileEditor } from './../editor';
import type { PropertyField } from '@craftile/types';
import type { Component } from 'vue';

export interface UiRenderFunctionContext {
  editor: CraftileEditor;
}

export type UiRenderFunction = Component | string | ((context: UiRenderFunctionContext) => HTMLElement);

export interface SidebarPanel {
  id?: string;
  title: string;
  render: UiRenderFunction;
  icon?: UiRenderFunction;
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
  render?: UiRenderFunction;
  button?: HeaderActionButton;
  order?: number;
}

export interface ConfigurationPanel {
  id?: string;
  title: string;
  icon?: UiRenderFunction;
  render: UiRenderFunction;
  order?: number;
}

export interface ModalConfig {
  id?: string;
  title?: string;
  render: UiRenderFunction;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export interface KeyboardShortcut {
  key: string;
  handler: (context: UiRenderFunctionContext) => void;
}

export interface FieldRenderProps {
  field: PropertyField;
  value: unknown;
  onChange: (value: unknown) => void;
  onBlur?: () => void;
}

export interface PropertyFieldConfig {
  type: string;
  render: string | Component | ((props: FieldRenderProps) => HTMLElement);
}
