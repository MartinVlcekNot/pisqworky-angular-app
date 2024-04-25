import { CellService } from "../cell/cell.service";
import { GridComponent } from "../grid/grid.component";
import { GridService } from "../grid/grid.service";
import { Owner } from "./symbol";
import { Cell } from "../cell/cell";
import { SymbolAction } from "./action";

export class SymbolActionStack {

  protected grid: GridComponent;
  protected readonly gridService: GridService;

  // protected
  public stack: Array<SymbolAction<Cell | GridComponent>> = [];

  public placeOnTop(symbAct: SymbolAction<Cell | GridComponent>) {
    this.stack.push(symbAct);
    console.log(this.stack);
  }

  public callStack() {
    let remove: Array<SymbolAction<Cell | GridComponent>> = [];

    this.stack.forEach((symbAct) => {
      let invoke = true;

      if (typeof symbAct.decayIn === "number") {
        let decayIn = symbAct.decayIn as number;
        decayIn--;

        if (decayIn === 0)
          remove.push(symbAct);
        else if (decayIn < 0) {
          remove.push(symbAct);
          invoke = false;
        }

        symbAct.decayIn = decayIn;
      }

      if (invoke)
        symbAct.args = symbAct.action(symbAct.obj, symbAct.decayIn, symbAct.args);
    });

    this.grid.gridService.checkGridWin(this.grid);

    this.stack = this.stack.filter((symbAct) => !remove.includes(symbAct));
  }

  public removeSymbAct(cell: Cell) {
    this.stack = this.stack.filter((symbAct) => symbAct.obj !== cell);
  }

  public clearStack() {
    this.stack = [];
  }

  //TODO metoda na systematické seřazení funkcí v 'this.stack'

  protected onPlayerSwitched = (sender: object | undefined, args: { playerValue: Owner }) => {
    this.callStack();
  }

  public constructor(grid: GridComponent) {
    this.grid = grid;
    this.gridService = this.grid.gridService;

    this.gridService.getGridPlayerD(this.grid).playerSwitch.addSubscriber(this.onPlayerSwitched);
  }
}
