import { CellService } from "../cell/cell.service";
import { GridComponent } from "../grid/grid.component";
import { GridService } from "../grid/grid.service";
import { Owner } from "./symbol";

export class SymbolActionStack {

  protected grid: GridComponent;

  public stack: Array<SymbolAction> = [];

  public callStack() {
    let remove: Array<SymbolAction> = [];

    this.stack.forEach((item) => {
      item.action(this.gridService, this.cellService);
      item.lastFor--;

      if (item.lastFor <= 0)
        remove.push(item);
    });

    this.stack = this.stack.filter((value) => !remove.includes(value));
  }

  protected onPlayerSwitched = (sender: object | undefined, args: { playerValue: Owner }) => {
    this.callStack();
  }

  public constructor(protected readonly gridService: GridService, protected readonly cellService: CellService, grid: GridComponent) {
    this.grid = grid;

    this.gridService.getGridPlayerD(this.grid).playerSwitch.addSubscriber(this.onPlayerSwitched);
  }
}

export type SymbolAction = {
  action: (gridService: GridService, cellService: CellService) => void;
  lastFor: number;
}
