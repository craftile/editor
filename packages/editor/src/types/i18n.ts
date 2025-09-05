/**
 * Internationalization (i18n) grouped string definitions for the editor
 */
export interface I18n {
  header: {
    undo: string;
    redo: string;
    auto: string;
    apply: string;
    devicePreview: string;
    customDeviceSize: string;
    deviceWidthPx: string;
    savedCustomDevices?: string;
  };
  block: {
    show: string;
    hide: string;
    duplicate: string;
    remove: string;
  };
  layers: {
    title: string;
    header: string;
    collapseAll: string;
    addBlockToBlock: string;
  };
  blocksPopover: {
    searchPlaceholder: string;
    tabBlocks: string;
    tabSaved: string;
    noBlocksAvailable: string;
    noBlocksFound: string;
  };
  common: {
    custom: string;
  };
}

/**
 * Deep partial type for nested i18n configuration
 */
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Partial i18n configuration - allows users to override only specific strings
 */
export type I18nConfig = DeepPartial<I18n>;

/**
 * Type for translation keys using dot notation
 */
export type TranslationKey =
  | `header.${keyof I18n['header']}`
  | `block.${keyof I18n['block']}`
  | `layers.${keyof I18n['layers']}`
  | `blocksPopover.${keyof I18n['blocksPopover']}`
  | `common.${keyof I18n['common']}`;
