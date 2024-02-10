import { Injectable } from '@angular/core';
import { GridComponent } from './grid.component';
import { GridRow } from './gridRow/gridRow';
import { Cell, CheckWinManager, Cpos } from '../cell/cell';
import { Pos } from '../position/posClass';
import { Owner } from '../player/owner';
import { IBValueChangeArgs } from '../input-box/input-box.component';

@Injectable({
  providedIn: 'root'
})
export class GridService {

  public defaultWidth = 15;
  public defaultHeight = 15;
  public defaultInRow = 5;

  private static _idGridBase: Array<{ id: number, inst: GridComponent }> = [];
  public static get idGridBase(): Array<{ id: number, inst: GridComponent }> { return this._idGridBase; }

  constructor() { }

  public static getGridById(id: number): GridComponent | undefined {
    let grid: GridComponent | undefined = undefined;

    this.idGridBase.forEach((pair) => {
      if (pair.id === id) {
        grid = pair.inst;
        return;
      }
    });

    return grid;
  }

  public static getGridId(grid: GridComponent): number {
    let id = -1;

    this.idGridBase.forEach((pair) => {
      if (pair.inst === grid) {
        id = pair.id;
        return;
      }
    });

    return id;
  }

  public get generateId() {
    let ids: Array<number> = [];

    GridService.idGridBase.forEach((pair) => {
      ids.push(pair.id);
    });

    let findNewId = (startId: number) => {
      if (!ids.includes(startId))
        return startId;

      return findNewId(startId + 1);
    }

    return findNewId(0);
  }

  public adjustRow<T, P>(arr: Array<T>, desiredLength: number, factory: (parent: P, rowProvider: RowProvider) => T, parent: P) {
    const lack = desiredLength - arr.length;
    const startIndex = arr.length;
    const endIndex = startIndex + lack - 1;

    if (lack > 0) {
      for (let i = startIndex; i <= endIndex; i++) {
        arr.push(factory(parent, { rowPos: i }));
      }
    }
    else if (lack < 0) {
      const startIndex = arr.length + lack;

      arr.splice(startIndex, -lack);
    }
  }

  public gridRowFactory = (parent: GridComponent, rowProvider: RowProvider): GridRow => {
    let gridRow = new GridRow(this, parent.cmService, parent.cellService);
    gridRow.parentObj.parent = parent;
    gridRow.posObj.pos.row = rowProvider.rowPos

    return gridRow;
  }

  public getAllCells(gridId: number): Array<Cell> {
    let cells: Array<Cell> = [];
    let grid = GridService.getGridById(gridId);

    if (grid !== undefined) {
      grid.grid.forEach((row) => {
        row.row.forEach((cell) => {
          cells.push(cell);
        });
      });
    }

    return cells;
  }

  public setClassesExceptOf(gridId: number, excCells: Array<Cell>, classes: Array<string>, add: boolean) {
    this.getAllCells(gridId).forEach((cell) => {
      if (excCells.includes(cell))
        var exceptional = true;
      else
        var exceptional = false

      if (!exceptional) {
        if (add)
          cell.addClasses(classes);
        else
          cell.removeClasses(classes);
      }
    });
  }

  public setClassesOf(cells: Array<Cell>, classes: Array<string>, add: boolean) {
    cells.forEach((cell) => {
      if (add)
        cell.addClasses(classes);
      else
        cell.removeClasses(classes);
    });
  }

  private setCellsClick(gridId: number, enabled: boolean) {
    this.getAllCells(gridId).forEach((cell) => {
      if (cell.shell !== undefined) {
        if (enabled)
          cell.enableInteraction();
        else
          cell.disableInteraction();
      }
    });
  }

  public disableAllCells(gridId: number) {
    this.setCellsClick(gridId, false);
  }

  public enableAllCells(gridId: number) {
    this.setCellsClick(gridId, true);
  }


  public getInRowSetFuncs(gridId: number): Array<(sender: object | undefined, args: IBValueChangeArgs<number>) => void> {
    let funcs: Array<(sender: object | undefined, args: IBValueChangeArgs<number>) => void> = []

    this.getAllCells(gridId).forEach((cell) => {
      funcs.push(cell.setInRowExt);
    });

    return funcs;
  }

  public getCellByPos(gridId: number, pos: Pos<Cpos>): Cell | undefined {
    let wantedCell: Cell | undefined;

    this.getAllCells(gridId).forEach((cell) => {
      if (pos.evaluatePosEquals(cell)) {
        wantedCell = cell;

        return;
      }
    });

    return wantedCell;
  }

  public clearAndSetUpGrid(gridId: number) {
    this.getAllCells(gridId).forEach((cell) => {
      cell.clearAndSetUp();
    });

    this.resetPlayer(gridId);
  }

  public switchPlayer(gridId: number) {
    GridService.getGridById(gridId)?.switchPlayer();
  }

  public resetPlayer(gridId: number) {
    GridService.getGridById(gridId)?.resetPlayer();
  }

  public getGridPlayer(gridId: number): Owner | undefined {
    return GridService.getGridById(gridId)?.player.player;
  }
}

export type RowProvider = {
  rowPos: number;
}
