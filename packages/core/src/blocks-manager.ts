import type { BlockSchema } from '@craftile/types';

export class BlocksManager {
  protected schemas: Map<string, BlockSchema> = new Map();
  private patternCache = new Map<string, RegExp>();

  /**
   * Register a new block schema
   */
  register(type: string, schema: BlockSchema): void {
    if (this.schemas.has(type)) {
      throw new Error(`Block type '${type}' is already registered`);
    }

    this.schemas.set(type, schema);
  }

  /**
   * Register multiple block schemas at once
   */
  registerMany(schemas: Record<string, BlockSchema>): void {
    for (const [type, schema] of Object.entries(schemas)) {
      this.register(type, schema);
    }
  }

  /**
   * Unregister a block schema
   */
  unregister(type: string): boolean {
    return this.schemas.delete(type);
  }

  /**
   * Get a block schema by type
   */
  get(type: string): BlockSchema | undefined {
    return this.schemas.get(type);
  }

  /**
   * Check if a block type is registered
   */
  has(type: string): boolean {
    return this.schemas.has(type);
  }

  /**
   * Get all registered schemas as a record
   */
  getAll(): Record<string, BlockSchema> {
    const result: Record<string, BlockSchema> = {};

    for (const [type, schema] of this.schemas.entries()) {
      result[type] = schema;
    }

    return result;
  }

  /**
   * Find block types that match a predicate
   */
  find(predicate: (type: string, schema: BlockSchema) => boolean): string[] {
    const result: string[] = [];

    for (const [type, schema] of this.schemas.entries()) {
      if (predicate(type, schema)) {
        result.push(type);
      }
    }

    return result;
  }

  /**
   * Validate if a block type can be a child of another type
   * Private blocks can only be children if explicitly listed in parent's accepts array (no pattern matching)
   */
  canBeChild(childType: string, parentType: string): boolean {
    const parentSchema = this.get(parentType);

    if (!parentSchema || !parentSchema.accepts) {
      return false;
    }

    const childSchema = this.get(childType);
    const isPrivate = childSchema?.private === true;

    // Private blocks: only exact matches allowed (no patterns)
    if (isPrivate) {
      return parentSchema.accepts.includes(childType);
    }

    // Non-private blocks: existing pattern matching behavior
    return parentSchema.accepts.some((pattern) => this.matchesPattern(childType, pattern));
  }

  /**
   * Get all registered block types
   */
  getTypes(): string[] {
    return Array.from(this.schemas.keys());
  }

  /**
   * Check if a child type matches a pattern from the accepts list
   * Supports glob-style wildcards: '*', '@theme/*', '*-button', '*type*', etc.
   */
  private matchesPattern(childType: string, pattern: string): boolean {
    if (pattern === '*') {
      return true;
    }

    if (!this.patternCache.has(pattern)) {
      const withPlaceholders = pattern.replace(/\*/g, '__WILDCARD__');
      const escapedPattern = withPlaceholders.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
      const regexPattern = '^' + escapedPattern.replace(/__WILDCARD__/g, '.*') + '$';

      this.patternCache.set(pattern, new RegExp(regexPattern));
    }

    return this.patternCache.get(pattern)!.test(childType);
  }
}
