import { DebugElement, Injectable, inject } from '@angular/core';
import { Owner } from '../player/owner';
import { GridRow } from '../grid/gridRow/gridRow';
import { Cell, CheckWinManager, Cpos } from './cell';
import { GridComponent } from '../grid/grid.component';
import { RowProvider } from '../grid/grid.service';
import { Pos } from '../position/posClass';
import { IPos } from '../position/posInterface';

@Injectable({
  providedIn: 'root'
})
export class CellService {

  public defaultClasses = ["inactive"];

  public cellBounds = 32;

  constructor() { }

  getSymbol(owner: Owner): string {
    switch (owner) {
      case Owner.cross:
        return 'X';
      case Owner.circle:
        return 'O';
      default:
        return '';
    }
  }

  public getOwnerClass(owner: Owner): string {
    switch (owner) {
      case Owner.cross:
        return "owner-cross";
      case Owner.circle:
        return "owner-circle";
      case Owner.nobody:
        return "owner-neutral";
    }
  }

  public CellComponentFactory = (parent: GridRow, rowProvider: RowProvider): Cell => {
    let cellComponent = new Cell(this, parent.gridService, parent.cmService);
    cellComponent.parentObj.parent = parent;
    cellComponent.posObj.pos.column = rowProvider.rowPos;

    return cellComponent;
  }

  public evaluatePosEquals(pos1: IPos<Cpos>, pos2: IPos<Cpos>): boolean {
    if (pos1.posObj.pos.row === pos2.posObj.pos.row && pos1.posObj.pos.column === pos2.posObj.pos.column)
      return true;

    return false;
  }

  public getGridByCell(cell: Cell): GridComponent | undefined {
    let gridRow = cell.parentObj.parent;

    if (gridRow !== undefined) {
      let grid = gridRow.parentObj.parent;

      return grid;
    }

    return undefined;
  } 

  public getParentGridId(cell: Cell) {
    let grid = this.getGridByCell(cell);

    if (grid !== undefined)
      return grid.id;

    return -1;
  }

  public switchGridPlayer(cell: Cell) {
    this.getGridByCell(cell)?.switchPlayer();
  }

  public resetGridPlayer(cell: Cell) {
    this.getGridByCell(cell)?.resetPlayer();
  }

  public getGridPlayer(cell: Cell): Owner | undefined {
    return this.getGridByCell(cell)?.player.player;
  }

  public isInBounds(grid: GridComponent, pos: IPos<Cpos>): boolean {
    if (pos.posObj.pos.row !== undefined && pos.posObj.pos.column !== undefined) 
      if (pos.posObj.pos.row <= grid.height - 1 && pos.posObj.pos.row >= 0 && pos.posObj.pos.column <= grid.width - 1 && pos.posObj.pos.column >= 0)
        return true;

    return false;
  }

  private getDirection(posCell: Cell, direction: Dir, inLine: number): Cell[] {
    let grid = this.getGridByCell(posCell);
    let line: Array<Cell> = [];

    if (grid !== undefined) {
      let owner = posCell.owner;

      if (owner !== Owner.nobody) {
        for (let i = 1; i <= inLine - 1; i++) {
          if (posCell.posObj.pos.column !== undefined && posCell.posObj.pos.row !== undefined) {
            let column = posCell.posObj.pos.column - i * direction.down;
            let row = posCell.posObj.pos.row - i * direction.right;

            if (this.isInBounds(grid, new Pos(new Cpos(row, column)))) {
              let cell = grid.grid[row].row[column];

              if (cell.owner === owner) {
                line.push(cell);
              }
              else
                break;
            }
            else
              break;
          }
        }
      }
    }

    return line;
  }

  private invertDirection(direction: Dir): Dir {
    return { down: -direction.down, right: -direction.right };
  }

  private getInLine(posCell: Cell, direction: Dir, inLine: number): Cell[] {
    let line: Array<Cell> = [];

    if (posCell.owner !== Owner.nobody)
      line.push(posCell);

    line = [...line, ...this.getDirection(posCell, direction, inLine)]
    line = [...line, ...this.getDirection(posCell, this.invertDirection(direction), inLine)];

    if (line.length < inLine)
      line = [];

    return line;
  }

  public directions: Array<Dir> = [
    { down: -1, right: 0 },
    { down: -1, right: 1 },
    { down: 0, right: 1 },
    { down: 1, right: 1 }
  ];

  public checkDirections(posCell: Cell, directions: Array<Dir>, inLine: number): Cell[] {
    let line: Array<Cell> = [];

    for (let i = 0; i < directions.length; i++) {
      line = this.getInLine(posCell, directions[i], inLine)

      if (line.length >= inLine)
        return line;
    }

    return line;
  }

  public createChWM: () => CheckWinManager = () => {
    return new CheckWinManager();
  }
}

export type Dir = {
  down: number;
  right: number;
}
