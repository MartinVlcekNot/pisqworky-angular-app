import { CellService } from "../cell/cell.service";
import { GridComponent } from "../grid/grid.component";
import { GridService } from "../grid/grid.service";
import { Owner, Symbol } from "./symbol";
import { Cell } from "../cell/cell";
import { SymbolAction } from "./action";

export class SymbolActionStack {

  protected grid: GridComponent;
  protected readonly gridService: GridService;

  protected stack: Array<SymbolAction<Cell | GridComponent>> = [];

  public placeOnTop(symbAct: SymbolAction<Cell | GridComponent>) {
    this.stack.push(symbAct);
  }

  public invokeStack() {
    let remove: Array<SymbolAction<Cell | GridComponent>> = [];

    this.stack.forEach((symbAct) => {
      if (this.stack.includes(symbAct)) {
        let invoke = true;

        if (typeof symbAct.decayIn === "number") {
          let decayIn = symbAct.decayIn as number;
          decayIn--;

          if (decayIn <= 0) {
            remove.push(symbAct);
            if (decayIn < 0)
              invoke = false;
          }

          symbAct.decayIn = decayIn;
        }

        if (invoke)
          symbAct.args = symbAct.action(symbAct.obj, symbAct.decayIn, symbAct.args);
      }
    });

    this.stack = this.stack.filter((symbAct) => !remove.includes(symbAct));
    this.orderSymbolActions();
    console.log(this.stack);

    this.grid.gridService.checkGridWin(this.grid);
  }

  public removeSymbAct(cell: Cell) {
    this.stack = this.stack.filter((symbAct) => symbAct.obj !== cell);
  }

  public clearStack() {
    this.stack = [];
  }

  public orderSymbolActions() {
    let patchSymbActions = this.stack.filter((patchSymbAct) => patchSymbAct.forSymbol.represent === Symbol.patch);
    let output: Array<SymbolAction<Cell | GridComponent>> = [];

    this.stack = this.stack.filter((symbAct) => !patchSymbActions.includes(symbAct));

    let symbQueue = this.grid.playerDirector.symbolQueue;

    for (let i = symbQueue.decayBeforePlacement(symbQueue.queueLength - 1); i >= 0; i--) {
      let psa = patchSymbActions.find((patchSymbAct) => patchSymbAct.decayIn === i);
      if (psa)
        output.push(psa);
    }

    this.stack.push(...output);
  }

  protected onPlayerSwitched = (sender: object | undefined, args: { playerValue: Owner }) => {
    this.invokeStack();
  }

  public constructor(grid: GridComponent) {
    this.grid = grid;
    this.gridService = this.grid.gridService;

    this.gridService.getGridPlayerD(this.grid).playerSwitch.addSubscriber(this.onPlayerSwitched);
  }
}
