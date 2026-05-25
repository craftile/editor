import type { Page } from '@craftile/types';
import type { Command, EngineEmitFn } from '../types';

export class ReplacePageCommand implements Command {
  private previousPage: Page;
  private newPage: Page;
  private setPageState: (page: Page) => void;
  private emit: EngineEmitFn;

  constructor(previousPage: Page, newPage: Page, setPageState: (page: Page) => void, emit: EngineEmitFn) {
    this.previousPage = previousPage;
    this.newPage = newPage;
    this.setPageState = setPageState;
    this.emit = emit;
  }

  apply(): void {
    this.setPageState(this.newPage);

    this.emit('page:replace', {
      previousPage: structuredClone(this.previousPage),
      newPage: structuredClone(this.newPage),
    });
  }

  revert(): void {
    this.setPageState(this.previousPage);

    this.emit('page:replace', {
      previousPage: structuredClone(this.newPage),
      newPage: structuredClone(this.previousPage),
    });
  }
}
