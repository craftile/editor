import type { Component } from 'vue';
import type { VisibilityRule, VisibilityCondition, VisibilityLogicGroup, BlockProperties } from '@craftile/types';
import { getDeviceValue, isResponsiveValue } from './utils/responsive';

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

/**
 * Type guard to check if a rule is a VisibilityCondition
 */
function isVisibilityCondition(rule: VisibilityRule): rule is VisibilityCondition {
  return 'field' in rule && 'operator' in rule;
}

/**
 * Type guard to check if a rule is a VisibilityLogicGroup
 */
function isVisibilityLogicGroup(rule: VisibilityRule): rule is VisibilityLogicGroup {
  return 'and' in rule || 'or' in rule;
}

/**
 * Evaluate a single visibility condition against a context object
 */
function evaluateCondition(condition: VisibilityCondition, context: BlockProperties, currentDevice?: string): boolean {
  const { field, operator, value } = condition;
  let fieldValue = context?.[field];

  if (currentDevice && isResponsiveValue(fieldValue)) {
    fieldValue = getDeviceValue(fieldValue, currentDevice);
  }

  switch (operator) {
    case 'equals':
      return fieldValue === value;

    case 'not_equals':
      return fieldValue !== value;

    case 'in':
      if (!Array.isArray(value)) return false;
      return value.includes(fieldValue);

    case 'not_in':
      if (!Array.isArray(value)) return true;
      return !value.includes(fieldValue);

    case 'contains':
      // if fieldValue is array -> includes; if string -> substring; else false
      if (Array.isArray(fieldValue)) return fieldValue.includes(value);
      if (typeof fieldValue === 'string' && typeof value === 'string') {
        return fieldValue.includes(value);
      }
      return false;

    case 'greater_than': {
      const a = Number(fieldValue);
      const b = Number(value);
      if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
      return a > b;
    }

    case 'less_than': {
      const a = Number(fieldValue);
      const b = Number(value);
      if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
      return a < b;
    }

    case 'truthy':
      return Boolean(fieldValue);

    case 'falsy':
      return !Boolean(fieldValue);

    default:
      // Unknown operator -> false (conservative)
      return false;
  }
}

/**
 * Evaluate a JSON visibility rule against a context object (block properties).
 *
 * @param rule - Rule object, logic group, or array (array === implicit AND)
 * @param context - Block properties object
 * @param currentDevice - Optional current device ID for evaluating responsive properties
 * @returns boolean indicating whether the field should be visible
 *
 * @example
 * ```ts
 * // Simple condition
 * evaluateVisibilityRule(
 *   { field: 'layout', operator: 'equals', value: 'grid' },
 *   { layout: 'grid' }
 * ) // true
 *
 * // Logical AND
 * evaluateVisibilityRule(
 *   { and: [
 *     { field: 'type', operator: 'equals', value: 'image' },
 *     { field: 'status', operator: 'equals', value: 'published' }
 *   ]},
 *   { type: 'image', status: 'published' }
 * ) // true
 *
 * // Responsive property condition
 * evaluateVisibilityRule(
 *   { field: 'fontSize', operator: 'equals', value: '2xl' },
 *   { fontSize: { _default: '3xl', tablet: '2xl' } },
 *   'tablet'
 * ) // true
 * ```
 */
export function evaluateVisibilityRule(
  rule: VisibilityRule | VisibilityRule[],
  context: BlockProperties = {},
  currentDevice?: string
): boolean {
  // Array treated as implicit AND of conditions
  if (Array.isArray(rule)) {
    return rule.every((r) => evaluateVisibilityRule(r, context, currentDevice));
  }

  if (!rule || typeof rule !== 'object') return true;

  // Handle logic groups
  if (isVisibilityLogicGroup(rule)) {
    if (rule.and) {
      if (!Array.isArray(rule.and)) return true;
      return rule.and.every((r) => evaluateVisibilityRule(r, context, currentDevice));
    }

    if (rule.or) {
      if (!Array.isArray(rule.or)) return false;
      return rule.or.some((r) => evaluateVisibilityRule(r, context, currentDevice));
    }
  }

  // Handle single condition
  if (isVisibilityCondition(rule)) {
    return evaluateCondition(rule, context, currentDevice);
  }

  return true;
}
