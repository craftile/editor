import { describe, it, expect, beforeEach } from 'vitest';
import { HistoryManager } from '../src/history-manager';

class MockCommand {
  private target: { value: number };
  private delta: number;

  constructor(target: { value: number }, delta: number) {
    this.target = target;
    this.delta = delta;
  }

  apply() {
    this.target.value += this.delta;
  }

  revert() {
    this.target.value -= this.delta;
  }
}

describe('HistoryManager', () => {
  let history: HistoryManager;
  let counter: { value: number };

  beforeEach(() => {
    counter = { value: 0 };
    history = new HistoryManager(3);
  });

  it('adds and undoes a command', () => {
    const cmd = new MockCommand(counter, 10);
    cmd.apply();
    history.addCommand(cmd);

    expect(counter.value).toBe(10);
    history.undo();
    expect(counter.value).toBe(0);
    expect(history.canUndo()).toBe(false);
  });

  it('redoes a command after undo', () => {
    const cmd = new MockCommand(counter, 5);
    cmd.apply();
    history.addCommand(cmd);

    history.undo();
    expect(counter.value).toBe(0);

    history.redo();
    expect(counter.value).toBe(5);
  });

  it('clears redo history when a new command is added', () => {
    const cmd1 = new MockCommand(counter, 2);
    const cmd2 = new MockCommand(counter, 3);

    cmd1.apply();
    history.addCommand(cmd1);

    history.undo(); // value: 0

    cmd2.apply();
    history.addCommand(cmd2); // redo history of cmd1 should be gone

    expect(history.canRedo()).toBe(false);
    expect(counter.value).toBe(3);
  });

  it('enforces max history size', () => {
    const cmds = [
      new MockCommand(counter, 1),
      new MockCommand(counter, 2),
      new MockCommand(counter, 3),
      new MockCommand(counter, 4),
    ];

    cmds.forEach((cmd) => {
      cmd.apply();
      history.addCommand(cmd);
    });

    expect(history.getHistorySize()).toBe(3);
    expect(history.canUndo()).toBe(true);

    history.undo();
    history.undo();
    history.undo(); // should only undo 3 most recent
    expect(counter.value).toBe(1);
    expect(history.canUndo()).toBe(false);
  });

  it('clear() resets all history', () => {
    const cmd = new MockCommand(counter, 100);
    cmd.apply();
    history.addCommand(cmd);

    history.clear();
    expect(history.getHistorySize()).toBe(0);
    expect(history.canUndo()).toBe(false);
    expect(history.canRedo()).toBe(false);
  });
});
