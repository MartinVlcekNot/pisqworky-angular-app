import { Injectable } from '@angular/core';
import { GridComponent } from './grid.component';
import { GridRow } from './gridRow/gridRow';
import { Cell, CheckWinManager, Cpos } from '../cell/cell';
import { Pos } from '../position/posClass';
import { IBValueChangeArgs } from '../input-box/input-box.component';

// Servis 'GridService' obsahuje řadu metod z největší části pro operace s hracími poli './(grid.component).GridComponent' a pro hledání datových
// schránek '../cell/cell.Cell' buněk podle určitých požadavků.
// Také je zde místo pro konstantní pole, týkající se vlastnosti mřížky, a statická databáze registrovaných hracích polí.

@Injectable({
  providedIn: 'root'
})
export class GridService {

  // výchozí hodnoty pro počet sloupců, počet řádků, počet za sebou jdoucích znaků potřebných k výhře
  public defaultWidth = 15;
  public defaultHeight = 15;
  public defaultInRow = 5;

  // databáze na registrování a ukládání mřížek './(grid.component).GridComponent'
  private static _idGridBase: Array<{ id: number, inst: GridComponent }> = [];
  public static get idGridBase(): Array<{ id: number, inst: GridComponent }> { return this._idGridBase; }

  // vrátí takovou mřížku './(grid.component).GridComponent', jejíž id se shoduje se zadaným id
  // vrátí undefined, když není nalezena žádná shoda
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

  // vrátí id zadané mřížky './(grid.component).GridComponent'
  // vrátí -1 v případě, že mřížka není registrována v databázi GridService.idGridBase
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

  // vždy unikátní id
  public get originalId() {
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

  // generická metoda schopna ubrat nebo vytvořit a přidat prvky daného pole, splňujícího určitá kritéria, podle jejích argumentů
  // volána, když dojde ke změně počtů řádků nebo sloupců v mřížce './(grid.component).GridComponent', aby bylo nové hodnoty dosáhnuto
  // využívána pro upravování počtu řádků './gridRow/gridRow.GridRow' mřížky './(grid.component).GridComponent', buněk '../cell/cell.Cell'
  // v řádcích './gridRow/gridRow.GridRow'
  // typ T: typ prvku pole
  // typ P: typ rodičovského objektu
  // arr: pole prvků typu T, se kterým se bude operovat
  // desiredLength: konečné číslo množství prvků pole
  // factory: továrna pro případ, kdy bude zapotřebí vytvořit nové prvky pole
  // parent: rodičovský objekt typu P
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

  // továrna na vytváření instancí './gridRow/gridRow.GridRow'
  // parent: mřížka typu './(grid.component).GridComponent', do které bude řádek přiřazen
  // rowProvider: objekt '../grid/(grid.service).RowProvider' určuje index v řadě
  public gridRowFactory = (parent: GridComponent, rowProvider: RowProvider): GridRow => {
    let gridRow = new GridRow(this, parent.cmService, parent.cellService);
    gridRow.parentObj.parent = parent;
    gridRow.posObj.pos.row = rowProvider.rowPos

    return gridRow;
  }

  // vrátí všechny buňky '../cell/cell.Cell' v mřížce './(grid.component).GridComponent', jejíž id se shoduje se zadaným id
  // vrátí prázdné pole, když není nalezena mřížka s id shodným se zadaným id
  public getAllCellsById(gridId: number): Array<Cell> {
    let grid = GridService.getGridById(gridId);

    if (grid !== undefined) {
      return this.getAllCells(grid);
    }

    return [];
  }

  // vrátí všechny buňky '../cell/cell.Cell' v zadané mřížce './(grid.component).GridComponent'
  public getAllCells(grid: GridComponent) {
    let cells: Array<Cell> = [];

    grid.grid.forEach((row) => {
      row.row.forEach((cell) => {
        cells.push(cell);
      });
    });

    return cells;
  }

  // předaná funkce callBackFunc se provede právě jednou pro každou buňku '../cell/cell.Cell' v zadané mřížce './(grid.component).GridComponent'
  public forEachCell(grid: GridComponent, callBackFunc: (cell: Cell) => void) {
    this.getAllCells(grid).forEach(callBackFunc);
  }

  // nastaví stylové třídy všech buněk '../cell/cell.Cell' vyjma zadaných buněk v zadané mřížce './(grid.component).GridComponent'
  // add: true -> přidá třídy; false -> odebere třídy
  public setClassesExceptOf(grid: GridComponent, excCells: Array<Cell>, classes: Array<string>, add: boolean) {
    this.forEachCell(grid, (cell) => {
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

  // nastaví stylové třídy všech zadaných buněk '../cell/cell.Cell'
  // add: true -> přidá třídy; false -> odebere třídy
  public setClassesOf(cells: Array<Cell>, classes: Array<string>, add: boolean) {
    cells.forEach((cell) => {
      if (add)
        cell.addClasses(classes);
      else
        cell.removeClasses(classes);
    });
  }

  // nastaví hodnotu pole '../cell/cell.Cell.interactable' všech buněk '../cell/cell.Cell' v zadané mřížce './(grid.component).GridComponent'
  private setCellsInteraction(grid: GridComponent, enabled: boolean) {
    this.forEachCell(grid, (cell) => {
      if (cell.shell !== undefined) {
        if (enabled)
          cell.enableInteraction();
        else
          cell.disableInteraction();
      }
    });
  }

  // viz 'this.setCellsInteraction'
  // nastaví interakci na false
  public disableAllCells(grid: GridComponent) {
    this.setCellsInteraction(grid, false);
  }

  // viz 'this.setCellsInteraction'
  // nastaví interakci na true
  public enableAllCells(grid: GridComponent) {
    this.setCellsInteraction(grid, true);
  }

  // vrátí pole funkcí viz '../cell/cell.Cell.setInRowExt' každé buňky '../cell/cell.Cell' v zadané mřížce './(grid.component).GridComponent'
  public getInRowSetFuncs(grid: GridComponent): Array<(sender: object | undefined, args: IBValueChangeArgs<number>) => void> {
    let funcs: Array<(sender: object | undefined, args: IBValueChangeArgs<number>) => void> = []

    this.forEachCell(grid, (cell) => {
      funcs.push(cell.setInRowExt);
    });

    return funcs;
  }

  // vrátí buňku '../cell/cell.Cell' v zadané mřížce './(grid.component).GridComponent' podle zadaných souřadnic
  public getCellByPos(grid: GridComponent, pos: Pos<Cpos>): Cell | undefined {
    let wantedCell: Cell | undefined = undefined;

    this.forEachCell(grid, (cell) => {
      if (pos.evaluatePosEquals(cell)) {
        wantedCell = cell;

        return;
      }
    });

    return wantedCell;
  }

  // uvede hrací pole './(grid.component).GridComponent' do takového stavu, v jakém bylo před první interakcí uživatele
  public clearAndSetUpGrid(grid: GridComponent) {
    this.forEachCell(grid, (cell) => {
      cell.clearAndSetUp();
    });

    grid.resetPlayer();
  }

  // továrna na vytváření instancí '../cell/cell.CheckWinManager', když je zapotřebí zkontrolovat, zdali aktuální stav hry není výherní
  public createChWM = (grid: GridComponent): CheckWinManager => {
    let checkWinManager = new CheckWinManager();

    checkWinManager.onWinFound = () => {
      this.forEachCell(grid, (cell) => {
        cell.allowCheckingWin = false;
      });
    }

    return checkWinManager;
  }
}

// pomocný typ pro továrnu viz 'GridService.adjustRow'
// zapouzdřuje souřadnice potřebné pro vytváření instancí skrze výše zmíněnou továrnu
export type RowProvider = {
  rowPos: number;
}
