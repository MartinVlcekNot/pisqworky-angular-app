import { CellService } from './cell.service';
import { ClassifiedSymbol, Owner, OwnerSymbol, Symbol, Symbols } from '../player/symbol';
import { GridRow } from '../grid/gridRow/gridRow';
import { IPos } from '../position/posInterface';
import { Pos } from '../position/posClass';
import { IChildOf } from '../parent/parentInterface';
import { Parent } from '../parent/parentClass';
import { CellShellComponent } from './cell-shell/cell-shell.component';
import { Event } from '../../eventHandler/event';
import { GridService } from '../grid/grid.service';
import { ClassManagementService } from '../../styleClassManagement/class-management.service';
import { IClassManagement } from '../../styleClassManagement/classManagementInterface';
import { IBValueChangeArgs } from '../input-box/input-box.component';
import { IPlayable } from '../player/playableInterface';
import { PlayerDirector } from '../player/playerDirector';
import { IGridDependent } from '../grid/gridCellInterface';
import { GridComponent } from '../grid/grid.component';
import { Actions } from '../player/action';
import { IOneRoundClass } from '../../styleClassManagement/oneRoundClassInterface';
import { DeadCell } from './deadCell';

// Třída 'Cell' slouží jako schránka pro data a operace potřebné pro chod komponentu './cell-shell/cell-shell.component.CellShellComponent'.
// N instancí 'Cell' je generováno v případě, že dojde ke změně šířky mřížky '../grid/(grid.component).GridComponent' a tato změna
// vyžaduje přidání nových buněk, nikoli jejich odebrání.
//
// Implementuje rozhraní
//    '../position/posInterface.IPos<Cpos>' viz '../position/posInterface.IPos'
//    '../parent/parentInterface.IChildOf<../grid/gridRow/gridRow.GridRow>' viz '../parent/parentInterface.IChildOf'
//    viz '../../styleClassManagement/classManagementInterface.IClassManagement'
//    viz 'IPlayable'

export class Cell extends DeadCell implements IPos<CPos>, IChildOf<GridRow>, IClassManagement, IOneRoundClass, IGridDependent {

  protected override onAttachedToShell = (sender: object | undefined, args: { shellValue: CellShellComponent | undefined }) => {
    this.decodeSymbolSrc();

    if (args.shellValue)
      args.shellValue.onClick = this.onShellClick;

    this.toggleClasses();
    this.userInteraction = true;
  }

  public override get symbol(): OwnerSymbol {
    return super.symbol;
  }

  public override set symbol(value: OwnerSymbol) {
    this.setSymbolWRA(value);
    this.grid?.symbolActionStack.removeSymbAct(this);
  }
  public setSymbolWRA(value: OwnerSymbol) {
    super.symbol = value;

    if (this.symbol.represent === Symbol.none)
      this.userInteraction = true;
  }

  public get gridPlayerD(): PlayerDirector | undefined {
    return this.cellService.getGridPlayerD(this);
  }

  public get infer(): OwnerSymbol {
    if (this.gridPlayerD)
      return Symbols.getPrimary(this.gridPlayerD.player);

    return Symbols.N;
  }

  public requestNewSymbAct() {
    this.grid?.symbolActionStack.removeSymbAct(this);

    this.requestSymbolAction();
  }

  public requestSymbolAction() {
    let symbAct = Actions.actFrom(this.symbol.represent)?.toSymbolActionCell(this);

    if (symbAct)
      this.grid?.symbolActionStack.requestAction(symbAct);
  }

  public get grid(): GridComponent | undefined {
    return this.cellService.getGridByCell(this);
  }

  // určuje, zda buňka reaguje na podněty ze strany uživatele

  private _userInteraction: boolean = false;
  public get userInteraction(): boolean { return this._userInteraction; }
  public set userInteraction(value: boolean) {
    this._userInteraction = value;

    if (this.userInteraction) {
      this.allowCheckingWin = true;
      this.addClasses(["enabled"]);
    }
    else {
      this.removeClasses(["enabled"]);
    }
  }

  // speciální případ interakce týkající se kontrolování vítězství
  public allowCheckingWin = true;

  // minimální počet stejných symbolů za sebou jdoucích potřebný na vítězství
  public inRow = this.gridService.defaultInRow;

  // přídavná metoda pro eventhandler v komponentu '../input-box/(input-box.component).InputBoxComponent'
  // může externě nastavit 'this.inRow'
  public setInRowExt = (sender: object | undefined, args: IBValueChangeArgs<number>) => {
    if (args.value)
      this.inRow = args.value;

    if (this.grid)
      this.gridService.checkWin(this, args.additionalArgs as CheckWinManager);
  }

  // viz '../position/posInterface.IPos'
  public posObj: Pos<CPos> = new Pos(new CPos());

  // viz '../parent/parentInterface.IChildOf'
  public parentObj: Parent<GridRow> = new Parent();

  // zavolá se tehdy, když nastane událost 'this.parentObj.parentChange'
  // provede změny v souvislosti s novým rodičovským objektem
  protected onParentChanged = (sender: object | undefined, args: { parentValue: GridRow | undefined }) => {
    if (args.parentValue !== undefined) {
      args.parentValue.posObj.pos.rowChange.addSubscriber(this.onParentRowChanged);
      this.posObj.pos.row = args.parentValue.posObj.pos.row;
    }
  }

  // zavolá se tehdy, když nastane událost 'this.parentObj.parent.posObj.pos.rowChange'
  // provede změny v souvislosti s novými souřadnicemi
  protected onParentRowChanged = (sender: object | undefined, args: { rowValue: number | undefined }) => {
    this.posObj.pos.row = args.rowValue;
  }

  public addOneRoundClasses(classes: Array<string>) {
    if (this.grid) 
      this.grid.symbolActionStack.placeOnTop(Actions.oneRoundClass.toSymbolActionCell(this, classes, true));
  }

  // nastaví buňku do počátečního stavu
  public clearAndSetUp() {
    this.userInteraction = true;

    this.symbol = Symbols.N;

    this.clearClasses();
    this.addClasses(this.cellService.defaultClasses);
  }

  // zjistí, zdali je aktuální stav hry výherní
  public checkWin(): boolean {
    let line = this.cellService.checkDirections(this, this.cellService.directions, this.inRow)

    if (line.length >= this.inRow) {
      if (this.grid) {
        this.gridService.disableAllCells(this.grid);

        console.log("vyhrává " + Owner[this.symbol.owner] + "!!!");

        this.gridService.setClassesExcluding(line, ["irrelevant"], true);
      }

      return true;
    }
    else      
      return false;
  }

  public constructor(public readonly cellService: CellService, public readonly gridService: GridService, cmService: ClassManagementService) {
    super(cmService);

    //this.symbol = Symbols.N;

    this.parentObj.parentChange.addSubscriber(this.onParentChanged);
    this.shellAttach.addSubscriber(this.onAttachedToShell);

    this.classes = this.cellService.defaultClasses;
  }

  public onShellClick = () => {
    if (this.userInteraction) {
      this.gridPlayerD?.play(this);

      this.removeClasses(["enabled"]);

      if (this.grid) {
        let checkWinManager = this.gridService.createChWM(this.grid);
        checkWinManager.winFound = this.checkWin();
      }
    }
  }
}

// typ souřadnic používaný v 'Cell'
export class CPos {

  private _row: number | undefined;
  public get row(): number | undefined { return this._row; }
  public set row(value: number | undefined) {
    this._row = value;
  }

  private _column: number | undefined;
  public get column(): number | undefined { return this._column; }
  public set column(value: number | undefined) {
    this._column = value;
  }

  public constructor(row?: number, column?: number) {
    this.row = row;
    this.column = column;
  }
}

// třída regulující dotazy na výhru, když se změní minimální počet symbolů v řadě 'Cell.inRow'
export class CheckWinManager {

  private _winFound = false;
  public get winFound() {
    return this._winFound;
  }
  public set winFound(value: boolean) {
    let previous = this._winFound;

    this._winFound = value;

    if (this.winFound !== previous && this.winFound)
      this.onWinFound();
  }

  public onWinFound: () => void = () => { };
}
