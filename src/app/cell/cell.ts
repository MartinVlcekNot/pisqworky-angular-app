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
import { IGridCell } from '../grid/gridCellInterface';
import { GridComponent } from '../grid/grid.component';

// Třída 'Cell' slouží jako schránka pro data a operace potřebné pro chod komponentu './cell-shell/cell-shell.component.CellShellComponent'.
// N instancí 'Cell' je generováno v případě, že dojde ke změně šířky mřížky '../grid/(grid.component).GridComponent' a tato změna
// vyžaduje přidání nových buněk, nikoli jejich odebrání.
//
// Implementuje rozhraní
//    '../position/posInterface.IPos<Cpos>' viz '../position/posInterface.IPos'
//    '../parent/parentInterface.IChildOf<../grid/gridRow/gridRow.GridRow>' viz '../parent/parentInterface.IChildOf'
//    viz '../../styleClassManagement/classManagementInterface.IClassManagement'
//    viz 'IPlayable'

export class Cell implements IPos<CPos>, IChildOf<GridRow>, IClassManagement, IPlayable, IGridCell {

  // komponent './cell-shell/cell-shell.component.CellShellComponent', který v sobě tento objekt zapouzdří
  private _shell: CellShellComponent | undefined;
  public get shell(): CellShellComponent | undefined { return this._shell }
  public set shell(value: CellShellComponent | undefined) {
    let previous = this._shell;

    this._shell = value;

    if (this.shell !== previous)
      this.attachedToShell(this.shell);
  }

  // událost nastávající tehdy, když se změní hodnota 'this._shell' skrze set vlastnost 'this.shell'
  public shellAttach: Event<{ shellValue: CellShellComponent | undefined }> = new Event();
  protected attachedToShell(curShell: CellShellComponent | undefined) {
    this.shellAttach.invoke(this, { shellValue: curShell });
  }
  protected onAttachedToShell = (sender: object | undefined, args: { shellValue: CellShellComponent | undefined }) => {
    if (args.shellValue)
      args.shellValue.onClick = this.onShellClick;

    this.toggleClasses();
    this.userInteraction = true;
  }

  // vlastník této buňky typu '../player/symbol.ClassifiedSymbol'
  // vlastnost set nastaví i symbol schránky
  private _symbol: OwnerSymbol = Symbols.N;
  public get symbol() { return this._symbol; }
  public set symbol(value: OwnerSymbol) {
    this._symbol = value;

    if (this.shell)
      this.decodeSymbolSrc();

    this.grid?.symbolActionStack.removeSymbAct(this);
  }

  public decodeSymbolSrc() {
    if (this.shell) {
      this.shell.srcRef = Symbols.decodeSrc(this.symbol);

      this.shell.symbol = this.symbol.textOut;
    }
  }

  public readonly classManagementService: ClassManagementService;

  public get gridPlayerD(): PlayerDirector | undefined {
    return this.cellService.getGridPlayerD(this);
  }

  public get infer(): OwnerSymbol {
    if (this.gridPlayerD)
      return Symbols.getPrimary(this.gridPlayerD.player);

    return Symbols.N;
  }

  public registerSymbolAction() {
    this.grid?.symbolActionStack.removeSymbAct(this);

    let symbAct = Symbols.getSymbolActionCell(this);

    if (symbAct)
      this.grid?.symbolActionStack.placeOnTop(symbAct);
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
      this.addClasses(["inactive"]);
    }
    else {
      this.removeClasses(["inactive"]);
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

  // pole v reálném čase obsahující stylové třídy, které se mají aplikovat
  private _classes: Array<string> = [];
  // viz '../../styleClassManagement/classManagementInterface.IClassManagement'
  public get classes() { return [...this._classes] }
  // viz '../../styleClassManagement/classManagementInterface.IClassManagement'
  protected set classes(value: Array<string>) {
    this._classes = value;
  }

  // stylové třídy zformátuje a uloží je do pole 'this.shell.classString'
  // viz '../../styleClassManagement/classManagementInterface.IClassManagement'
  public toggleClasses(): boolean {
    if (this.shell !== undefined) {
      this.shell.classString = this.classManagementService.formatClasses(this.classes);

      return true;
    }

    return false;
  }

  // <operace se stylovými třídami>
  public addClasses(classes: Array<string>) {
    this.classManagementService.addClasses(this, classes);
  }

  public removeClasses(classes: Array<string>) {
    this.classManagementService.removeClasses(this, classes);
  }

  public clearClasses() {
    this.classManagementService.clearClasses(this);
  }
  // </operace se stylovými třídami>

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

        this.gridService.setClassesExceptOf(line, ["inactive"], false);
        this.gridService.setClassesExceptOf(line, ["irrelevant"], true);
      }

      return true;
    }
    else      
      return false;
  }

  public constructor(public readonly cellService: CellService, public readonly gridService: GridService, cmService: ClassManagementService) {
    this.symbol = Symbols.N;
    this.classManagementService = cmService;

    this.parentObj.parentChange.addSubscriber(this.onParentChanged);
    this.shellAttach.addSubscriber(this.onAttachedToShell);

    this.classes = this.cellService.defaultClasses;
  }

  public onShellClick = () => {
    if (this.userInteraction) {
      this.gridPlayerD?.play(this);

      this.removeClasses(["inactive"]);

      if (this.grid) {
        let checkWinManager = this.gridService.createChWM(this.grid);
        checkWinManager.winFound = this.checkWin();
      }
      /*else
        this.checkWin();*/

      this.addClasses(["active"]);
      if (this.grid)
        this.gridService.setClassesExceptOf([this], ["active"], false);
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
