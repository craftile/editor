import type { Command } from '../types';

export class BatchCommand implements Command {
  private commands: Command[];

  constructor(commands: Command[]) {
    this.commands = commands;
  }

  apply(): void {
    this.commands.forEach((command) => command.apply());
  }

  revert(): void {
    for (let i = this.commands.length - 1; i >= 0; i--) {
      this.commands[i].revert();
    }
  }
}
