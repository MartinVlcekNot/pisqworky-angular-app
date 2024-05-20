import { CPos, Cell } from "../cell/cell";
import { GridComponent } from "../grid/grid.component";
import { Owner, OwnerSymbol, Symbol, Symbols } from "./symbol";

export class Action {

  private static blast(cell: Cell) {
    if (cell.symbol.represent !== Symbol.wall) {
      if (cell.symbol.represent !== Symbol.none) {
        cell.symbol = Symbols.symbFrom(Symbol.debris).toOwnerSymbol();
        cell.requestNewSymbAct();

        cell.userInteraction = true;
      }

      cell.addOneRoundClasses(["blasted"]);
    }
  }

  public static bombAction: ActionFunc = (cell, decayIn) => {
    if (cell instanceof Cell) {
      if (decayIn === 0) {
        const cellPos = cell.posObj;
        const grid = cell.grid;
        const directions = cell.cellService.getAllDirections();

        directions.forEach((direction) => {
          let newPos = cell.cellService.addToPos(cellPos, direction.down, direction.right);

          if (grid && cell.cellService.isInBounds(grid, newPos)) {
            let gridCell = cell.gridService.getCellByPos(grid, newPos);

            if (gridCell)
              this.blast(gridCell);
          }
        });

        cell.symbol = Symbols.N;
        cell.addOneRoundClasses(["blasted"]);
      }
    }
  }

  public static rogueAction: ActionFunc = (cell) => {
    if (cell instanceof Cell) {
      let symbNum = Math.random() * 3;

      if (symbNum < 1 && cell.symbol.represent === Symbol.rogue) {
        cell.symbolWRA = Symbols.symbFrom(Symbol.rogue).toOwnerSymbol(Owner.nobody);
      } else if (symbNum < 2 && cell.symbol.represent === Symbol.rogue) {
        cell.symbolWRA = Symbols.symbFrom(Symbol.rogue).toOwnerSymbol(Owner.cross);
      } else if (symbNum <= 3 && cell.symbol.represent === Symbol.rogue) {
        cell.symbolWRA = Symbols.symbFrom(Symbol.rogue).toOwnerSymbol(Owner.circle);
      }
    }
  }

  public static patchAction: ActionFunc = (grid, decayIn, args) => {
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

  public static turretAction: ActionFunc = (cell) => {
    if (cell instanceof Cell) {
      let odds = Math.random() * 5;

      if (odds <= 1) {
        const directions = cell.cellService.getHorVertDirs();

        directions.forEach((dir) => {
          if (cell.grid) {
            const cellPos = cell.posObj;
            let newPos = cell.cellService.addToPos(cellPos, dir.down, dir.right);

            while (cell.cellService.isInBounds(cell.grid, newPos)) {
              let gridCell = cell.gridService.getCellByPos(cell.grid, newPos);

              if (gridCell) {
                if (gridCell.symbol.represent === Symbol.wall)
                  break;
                else if (gridCell.symbol.represent === Symbol.bomb) {
                  const actStack = gridCell.grid?.symbolActionStack;
                  const symbActs = actStack?.removeSymbAct(gridCell);

                  if (symbActs) {
                    const bombAct = symbActs.find((symbAct) => symbAct.forSymbol?.represent === Symbol.bomb);
                    if (bombAct) {
                      let detonate = bombAct;
                      detonate.decayIn = 1;
                      actStack?.placeOnTop(detonate);
                    }
                  }
                }
                else
                  this.blast(gridCell);
              }

              newPos = cell.cellService.addToPos(newPos, dir.down, dir.right);
            }
          }
        });

        cell.addOneRoundClasses(["active"]);
      }
    }
  }

  public static debrisAction: ActionFunc = (cell) => {
    if (cell instanceof Cell) {
      
    }
  }

  public static oneRoundClass: ActionFunc = (cell, decayIn, classes) => {
    if (cell instanceof Cell) {
      const cls = classes as Array<string>;

      if (decayIn === 1) 
        cell.addClasses(cls);
      else if (decayIn === 0) 
        cell.removeClasses(cls);

      return cls;
    }

    return undefined;
  }
}

export type AFArgs = any;
export type CellOrGrid = Cell | GridComponent;
export type ActionFunc = (obj: CellOrGrid, decayIn: number | null, args?: AFArgs) => AFArgs;

export type SymbolAction = {
  action: ActionFunc;
  obj: CellOrGrid;
  decayIn: number | null;
  immutable: boolean;
  forSymbol?: OwnerSymbol;
  args?: AFArgs;
}

export class ClsSymbAct {
  action: ActionFunc;
  decayIn: number | null | undefined;
  decayOpt?: string;

  public constructor(action: ActionFunc, decayIn: number | undefined, decayOpt?: string) {
    this.action = action;
    this.decayIn = decayIn;
    this.decayOpt = decayOpt;
  }

  public toSymbolActionCell(cell: Cell, args?: AFArgs, immutable?: boolean): SymbolAction {
    Actions.decodeDecayOptOf(this);

    return {
      action: this.action,
      obj: cell,
      decayIn: this.decayIn !== undefined ? this.decayIn : 0,
      immutable: immutable ? immutable : false,
      forSymbol: cell.symbol,
      args: args,
    }
  }

  public toSymbolActionGrid(grid: GridComponent, symbol?: OwnerSymbol, args?: AFArgs, immutable?: boolean): SymbolAction {
    Actions.decodeDecayOptOf(this);

    return {
      action: this.action,
      obj: grid,
      decayIn: this.decayIn !== undefined ? this.decayIn : 0,
      immutable: immutable ? immutable : false,
      forSymbol: symbol,
      args: args
    }
  }
}

export class Actions {

  public static bomb = new ClsSymbAct(Action.bombAction, undefined, '$random 8');
  public static rogue = new ClsSymbAct(Action.rogueAction, undefined, '$forever');
  public static patch = new ClsSymbAct(Action.patchAction, undefined, '$before_placement');
  public static turret = new ClsSymbAct(Action.turretAction, undefined, '$forever');
  public static debris = new ClsSymbAct(Action.debrisAction, 1);

  public static oneRoundClass = new ClsSymbAct(Action.oneRoundClass, 2);

  public static actFrom(symbol: Symbol): ClsSymbAct | undefined {
    return Symbols.symbFrom(symbol).action;
  }

  public static decodeDecayOpt(decayOpt: string | undefined): number | null | undefined {
    if (decayOpt) {
      let com = decayOpt.split(' ');

      switch (com[0]) {
        case '$random':
          return Math.ceil(Math.random() * Number(com[1]));
        case '$before_placement':
          return 0;
        case '$forever':
          return null;
      }
    }

    return undefined;
  }

  public static decodeDecayOptOf(clsSymbAct: ClsSymbAct): number | null | undefined {
    if (clsSymbAct.decayOpt) {
      let decayIn = this.decodeDecayOpt(clsSymbAct.decayOpt);

      if (decayIn !== undefined) {
        clsSymbAct.decayIn = decayIn;

        return decayIn;
      }
    }

    return undefined;
  }
}
