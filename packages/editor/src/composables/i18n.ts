import { CRAFTILE_EDITOR_SYMBOL } from '../constants';
import type { CraftileEditor } from '../editor';
import { en } from '../locales/en';
import type { I18n, I18nConfig, TranslationKey } from '../types';

/**
 * Deep merge two objects, with the second object overriding the first
 */
function deepMerge(target: I18n, source: I18nConfig): I18n {
  const result = { ...target };

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const sourceValue = source[key as keyof I18nConfig];
      const targetValue = result[key as keyof I18n];

      if (
        sourceValue &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        (result as any)[key] = { ...targetValue, ...sourceValue };
      } else if (sourceValue !== undefined) {
        (result as any)[key] = sourceValue;
      }
    }
  }

  return result;
}

function getNestedValue(obj: I18n, path: string): string | undefined {
  return path.split('.').reduce((current: any, key: string) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

/**
 * Create a merged i18n configuration from default and user overrides
 */
export function createI18n(userConfig?: I18nConfig): I18n {
  return userConfig ? deepMerge(en, userConfig) : en;
}

export function createTranslationFunction(i18n: I18n) {
  return function t(key: TranslationKey): string {
    const value = getNestedValue(i18n, key);

    if (value === undefined) {
      console.warn(`Translation key "${key}" not found, returning key as fallback`);
      return key;
    }

    if (typeof value !== 'string') {
      console.warn(`Translation key "${key}" does not point to a string value`);
      return key;
    }

    return value;
  };
}

export function useI18n() {
  const editor = inject<CraftileEditor>(CRAFTILE_EDITOR_SYMBOL);

  if (!editor) {
    throw new Error('useI18n must be used within a component that has access to CraftileEditor');
  }

  return { t: createTranslationFunction(editor.i18n) };
}
