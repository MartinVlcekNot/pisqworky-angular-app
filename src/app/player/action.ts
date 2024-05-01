import { CPos, Cell } from "../cell/cell";
import { GridComponent } from "../grid/grid.component";
import { Pos } from "../position/posClass";
import { Owner, OwnerSymbol, Symbol, Symbols } from "./symbol";

export class Actions {

  public static bombAction: ActionFunc<Cell | GridComponent> = (cell, decayIn) => {
    if (cell instanceof Cell) {
      if (decayIn === 0) {
        const cellPos = cell.posObj;
        const grid = cell.grid;
        const directions = cell.cellService.getAllDirections();

        directions.forEach((direction) => {
          if (cellPos.pos.column !== undefined && cellPos.pos.row !== undefined) {
            let column = cellPos.pos.column + direction.right;
            let row = cellPos.pos.row + direction.down;

            if (grid && cell.cellService.isInBounds(grid, cellPos)) {
              let gridCell = cell.gridService.getCellByPos(grid, new Pos(new CPos(row, column)));

              if (gridCell && gridCell.symbol.represent !== Symbol.wall) {
                gridCell.symbol = Symbols.N;
                gridCell.userInteraction = true;
              }
            }
          }
        });

        cell.symbol = Symbols.N;
        cell.userInteraction = true;
      }
    }
  }

  public static rogueAction: ActionFunc<Cell | GridComponent> = (cell) => {
    if (cell instanceof Cell) {
      let symbNum = Math.random() * 3;

      if (symbNum < 1 && cell.symbol.represent === Symbol.rogue) {
        cell.symbol = Symbols.symbFrom(Symbol.rogue).toOwnerSymbol(Owner.nobody);
      } else if (symbNum < 2 && cell.symbol.represent === Symbol.rogue) {
        cell.symbol = Symbols.symbFrom(Symbol.rogue).toOwnerSymbol(Owner.cross);
      } else if (symbNum <= 3 && cell.symbol.represent === Symbol.rogue) {
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

  public static turretAction: ActionFunc<Cell | GridComponent> = (cell) => {

  }
}

export type ActionFunc<TObj> = (obj: TObj, decayIn: number | null, args?: AFArgs) => AFArgs;
export type AFArgs = any;

export type SymbolAction<TObj> = {
  forSymbol: OwnerSymbol;
  action: ActionFunc<TObj>
  obj: TObj;
  decayIn: number | null;
  decayOpt?: string;
  args?: AFArgs
}
