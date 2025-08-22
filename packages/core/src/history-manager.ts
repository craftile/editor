import type { Command } from './types';

export class HistoryManager {
  private history: Command[] = [];
  private currentIndex = -1;

  /**
   * @param maxHistorySize Max number of commands to retain in memory.
   */
  private readonly maxHistorySize: number;

  constructor(maxHistorySize = 100) {
    this.maxHistorySize = maxHistorySize;
  }

  /**
   * Add command to the history.
   * The command is expected to be executed by the caller.
   */
  addCommand(cmd: Command): void {
    if (this.currentIndex < this.history.length - 1) {
      this.history.splice(this.currentIndex + 1);
    }

    if (this.history.length >= this.maxHistorySize) {
      this.history.shift();
      this.currentIndex--;
    }

    this.history.push(cmd);
    this.currentIndex++;
  }

  undo(): Command | null {
    if (!this.canUndo()) {
      return null;
    }

    const cmd = this.history[this.currentIndex];
    cmd.revert();
    this.currentIndex--;

    return cmd;
  }

  redo(): Command | null {
    if (!this.canRedo()) {
      return null;
    }

    this.currentIndex++;
    const cmd = this.history[this.currentIndex];
    cmd.apply();

    return cmd;
  }

  canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  getHistorySize(): number {
    return this.history.length;
  }
}
