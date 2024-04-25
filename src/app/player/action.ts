import { Cell } from "../cell/cell";
import { GridComponent } from "../grid/grid.component";
import { Owner, Symbol, Symbols } from "./symbol";

export class Actions {

  public static bombAction: ActionFunc<Cell | GridComponent> = (cell) => {
    if (cell instanceof Cell) {

    }
  }

  public static rogueAction: ActionFunc<Cell | GridComponent> = (cell) => {
    if (cell instanceof Cell) {
      let symbNum = Math.random() * 3;

      if (symbNum < 1) {
        cell.symbol = Symbols.symbFrom(Symbol.rogue).toOwnerSymbol(Owner.nobody);
      } else if (symbNum < 2) {
        cell.symbol = Symbols.symbFrom(Symbol.rogue).toOwnerSymbol(Owner.cross);
      } else if (symbNum <= 3) {
        cell.symbol = Symbols.symbFrom(Symbol.rogue).toOwnerSymbol(Owner.circle);
      }

      cell.registerSymbolAction();
    }
  }

  public static patchAction: ActionFunc<Cell | GridComponent> = (grid, decayIn, args) => {
    if (grid instanceof GridComponent) {
      if (decayIn === 1) {
        let affecedCells: Array<Cell> = [];

        grid.gridService.forEachCell(grid, (cell) => {
          if (!cell.userInteraction && cell.symbol.represent !== Symbol.wall) {
            cell.userInteraction = true;
            affecedCells.push(cell);
          }
        });
        console.log(affecedCells);
        return affecedCells;
      }
      else if (decayIn === 0 && args) {
        let affectedCells = args as Array<Cell>;

        affectedCells.forEach((cell) => {
          cell.userInteraction = false;
        });

        return undefined;
      }
    }

    return undefined;
  }
}

export type ActionFunc<TObj> = (obj: TObj, decayIn: number | null, args?: AFArgs) => AFArgs;
export type AFArgs = any;

export type SymbolAction<TObj> = {
  action: ActionFunc<TObj>
  obj: TObj;
  decayIn: number | null;
  decayOpt?: string;
  args?: AFArgs
}
