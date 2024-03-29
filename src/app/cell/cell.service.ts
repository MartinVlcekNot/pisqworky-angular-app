import { Injectable } from '@angular/core';
import { Owner } from '../player/owner';
import { GridRow } from '../grid/gridRow/gridRow';
import { Cell, CheckWinManager, Cpos } from './cell';
import { GridComponent } from '../grid/grid.component';
import { RowProvider } from '../grid/grid.service';
import { Pos } from '../position/posClass';
import { IPos } from '../position/posInterface';

// Servis 'CellService' obsahuje řadu metod z největší části pro takové operace s datovými schránkami './cell.Cell',
// které jsou mimo záležitosti samotné buňky. Také je zde místo pro konstantní pole, týkající se vlastnosti buněk, používaná napříč celou aplikací.

@Injectable({
  providedIn: 'root'
})
export class CellService {

  // stylové třídy před uživatelskou interakcí
  public readonly defaultClasses = ["inactive"];

  // velikost buňky v px
  public readonly cellBounds = 32;

  // vrátí symbol reprezentující vlastníka buňky
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

  // vrátí stylovou třídu podle vlastníka buňky
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

  // továrna na vytváření instancí './cell.Cell'
  // parent: řádek v mřížce typu '../grid/gridRow/gridRow.GridRow', do kterého bude buňka přiřazena
  // rowProvider: objekt '../grid/(grid.service).RowProvider' určuje index v řadě
  public CellComponentFactory = (parent: GridRow, rowProvider: RowProvider): Cell => {
    let cellComponent = new Cell(this, parent.gridService, parent.cmService);
    cellComponent.parentObj.parent = parent;
    cellComponent.posObj.pos.column = rowProvider.rowPos;

    return cellComponent;
  }

  // vrátí pravdu, jestliže jsou dva objekty typu '../position/posInterface.IPos<./cell.CPos>' stejné
  public evaluatePosEquals(pos1: IPos<Cpos>, pos2: IPos<Cpos>): boolean {
    if (pos1.posObj.pos.row === pos2.posObj.pos.row && pos1.posObj.pos.column === pos2.posObj.pos.column)
      return true;

    return false;
  }

  // vrátí rodičovský komponent '../grid/(grid.component).GridComponent' v případě, že existuje
  // vrátí undefined, když neexistuje
  public getGridByCell(cell: Cell): GridComponent | undefined {
    let gridRow = cell.parentObj.parent;

    if (gridRow !== undefined) {
      let grid = gridRow.parentObj.parent;

      return grid;
    }

    return undefined;
  } 

  // vrátí id rodičovského komponentu '../grid/(grid.component).GridComponent' v případě, že existuje
  // vrátí -1, když rodičovský komponent neexistuje
  public getParentGridId(cell: Cell): number {
    let grid = this.getGridByCell(cell);

    if (grid !== undefined)
      return grid.id;

    return -1;
  }

  // přepne hráče v rodičovské mřížce buňky, pokud rodičovský komponent existuje
  public switchGridPlayer(cell: Cell) {
    this.getGridByCell(cell)?.switchPlayer();
  }

  // nastaví hráče v rodičovské mřížce buňky na výchozí hodnotu, pokud rodičovský komponent existuje
  public resetGridPlayer(cell: Cell) {
    this.getGridByCell(cell)?.resetPlayer();
  }

  // vrátí hráče typu '../player/owner.Owner' z rodičovské mřížky buňky, pokud rodičovský komponent existuje
  // vrátí undefined, pokud rodičovský komponent neexistuje
  public getGridPlayer(cell: Cell): Owner | undefined {
    return this.getGridByCell(cell)?.player.player;
  }

  // vrátí pravdu, jesliže některá z dceřiných buněk komponentu '../grid/(grid.component).GridComponent' leží na daných souřadnicích
  // typu '../position/posInterface.IPos<./cell.CPos>', tj. dané souřadnice neukazují na místo mimo mřížku.
  // grid: komponent mřížky typu '../grid/(grid.component).GridComponent'
  // pos: souřadnice typu '../position/posInterface.IPos<./cell.CPos>'
  public isInBounds(grid: GridComponent, pos: IPos<Cpos>): boolean {
    if (pos.posObj.pos.row !== undefined && pos.posObj.pos.column !== undefined) 
      if (pos.posObj.pos.row <= grid.height - 1 && pos.posObj.pos.row >= 0 && pos.posObj.pos.column <= grid.width - 1 && pos.posObj.pos.column >= 0)
        return true;

    return false;
  }

  // <metody rozhodující o vítězství>

  // vrátí pole stejných symbolů jdoucích v daném směru neprodleně za sebou
  // posCell: buňka typu './cell.Cell', na které je počáteční pozice
  // direction: směr typu 'Dir', kterým se bude kontrola symbolů ubírat
  // inLine: počet buněk (včetně té počáteční), na kterém se kontrola symbolů zastaví a vrátí výsledek
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

  // vrátí pole stejných symbolů jdoucích v daném směru neprodleně za sebou, přidá k němu výsledné pole podle stejných pravidel, ale opačného směru,
  // a přidá počáteční buňku
  // posCell: buňka typu './cell.Cell', na které je počáteční pozice
  // direction: směr typu 'Dir', kterým se bude kontrola symbolů ubírat
  // inLine: počet buněk (včetně té počáteční), na kterém se kontrola symbolů zastaví a vrátí výsledek
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

  // množina vektorů; základní směry, ve kterých se kontrolují symboly jdoucí za sebou
  public readonly directions: Array<Dir> = [
    { down: -1, right: 0 },
    { down: -1, right: 1 },
    { down: 0, right: 1 },
    { down: 1, right: 1 }
  ];

  // pomocí vynásobení vektoru vec*(-1) se dá dostat všech osm směrů
  private invertDirection(direction: Dir): Dir {
    return { down: -direction.down, right: -direction.right };
  }

  // vrátí takové pole stejných symbolů jdoucích v daném směru neprodleně za sebou, kde délka pole je větší nebo rovna minimálnímu počtu symbolů
  // za sebou jdoucích
  // vrátí pole posledního kontrolovaného směru, pokud nenajde pole splňující podmínku prvního a druhého řádku tohoto komentáře
  // posCell: buňka typu './cell.Cell', na které je počáteční pozice
  // directions: pole základních směrů, kde směr je typu 'Dir', kterými se bude kontrola symbolů ubírat
  // inLine: minimální počet buněk (včetně té počáteční) se stejnými symboly jdoucí za sebou potřebný k vítězství
  public checkDirections(posCell: Cell, directions: Array<Dir>, inLine: number): Cell[] {
    let line: Array<Cell> = [];

    for (let i = 0; i < directions.length; i++) {
      line = this.getInLine(posCell, directions[i], inLine)

      if (line.length >= inLine)
        return line;
    }

    return line;
  }

  // </metody rozhodující o vítězství>
}

export type Dir = {
  down: number;
  right: number;
}
