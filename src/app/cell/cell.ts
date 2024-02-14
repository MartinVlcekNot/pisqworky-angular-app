import { CellService } from './cell.service';
import { Owner } from '../player/owner';
import { GridRow } from '../grid/gridRow/gridRow';
import { IPos } from '../position/posInterface';
import { Pos } from '../position/posClass';
import { IParent } from '../parent/parentInterface';
import { Parent } from '../parent/parentClass';
import { CellShellComponent } from './cell-shell/cell-shell.component';
import { Event } from '../../eventHandler/event';
import { GridService } from '../grid/grid.service';
import { ClassManagementService } from '../../styleClassManagement/class-management.service';
import { IClassManagement } from '../../styleClassManagement/classManagementInterface';
import { IBValueChangeArgs } from '../input-box/input-box.component';

// Třída 'Cell' slouží jako schránka pro data a operace potřebné pro chod komponentu './cell-shell/cell-shell.component.CellShellComponent'.
// N instancí 'Cell' je generováno v případě, že dojde ke změně šířky mřížky '../grid/(grid.component).GridComponent' a tato změna
// vyžaduje přidání nových buněk, nikoli jejich odebrání.
//
// Implementuje rozhranní
//    '../position/posInterface.IPos<Cpos>' viz '../position/posInterface.IPos'
//    '../parent/parentInterface.IParent<../grid/gridRow/gridRow.GridRow>' viz '../parent/parentInterface.IParent'
//    viz '../../styleClassManagement/classManagementInterface'

export class Cell implements IPos<Cpos>, IParent<GridRow>, IClassManagement {

  // komponent './cell-shell/cell-shell.component.CellShellComponent', který v sobě tento objekt zapouzdří
  private _shell: CellShellComponent | undefined;
  public get shell(): CellShellComponent | undefined { return this._shell }
  public set shell(value: CellShellComponent | undefined) {
    let previous = this._shell;

    this._shell = value;

    if (this.shell !== previous)
      this.shellChanged(this.shell);
  }

  // událost nastávající tehdy, když se změní hodnota 'this._shell'
  public shellChange: Event<{ shellValue: CellShellComponent | undefined }> = new Event;
  private shellChanged(curShell: CellShellComponent | undefined) {
    this.shellChange.invoke(this, { shellValue: curShell });
  }
  private onShellChanged = (sender: object | undefined, args: { shellValue: CellShellComponent | undefined }) => {
    this.toggleClasses();

    this.enableInteraction();
  }

  // symbol reprezentující vlastníka této buňky
  // při každém přiřazení se jeho hodnota propíše do pole 'this.shell.symbol'
  private _symbol: string = '';
  public get symbol() { return this._symbol; }
  private set symbol(value: string) {
    this._symbol = value;

    if (this.shell !== undefined)
      this.shell.symbol = this.symbol;
  }

  // vlastník této buňky typu '../player/owner.Owner'
  private _owner = Owner.nobody;
  public get owner() { return this._owner; }
  public set owner(value: Owner) {
    this._owner = value;
  }

  // nastaví vlastníka této buňky a zároveň odpovídající symbol
  public setOwner(value: Owner) {
    this.owner = value;

    this.symbol = this.cellService.getSymbol(this.owner);
  }

  // určuje, zda buňka reaguje na podněty ze strany uživatele
  private _interactable = true;
  public get interactable() { return this._interactable; }
  public set interactable(value: boolean) {
    this._interactable = value;
  }

  // povolí interakci ze strany uživatele
  public enableInteraction() {
    if (this.shell !== undefined)
      this.shell.onClick = this.clickEnabled;

    this.interactable = true;
  }

  // zakáže interakci ze strany uživatele
  public disableInteraction() {
    if (this.shell !== undefined)
      this.shell.onClick = this.clickDisabled;

    this.interactable = false;
  }

  // minimální počet stejných symbolů za sebou jdoucích potřebný na vítězství
  public inRow = this.gridService.defaultInRow;

  // přídavná metoda pro eventhandler v komponentu '../input-box/(input-box.component).InputBoxComponent'
  // může externě nastavit 'this.inRow'
  public setInRowExt = (sender: object | undefined, args: IBValueChangeArgs<number>) => {
    if (args.value !== undefined)
      this.inRow = args.value;

    if (this.interactable) {
      let checkWinManager = args.additionalArgs as CheckWinManager;
      if (!checkWinManager.winFound)
        checkWinManager.winFound = this.checkWin();
    }
  }

  // viz '../position/posInterface.IPos'
  private _posObj: Pos<Cpos> = new Pos(new Cpos());
  public get posObj(): Pos<Cpos> { return this._posObj; }

  // viz '../parent/parentInterface.IParent'
  public parentObj: Parent<GridRow> = new Parent();

  // zavolá se tehdy, když nastane událost 'this.parentObj.parentChange'
  // provede změny v souvislosti s novým rodičovským objektem
  private onParentChanged = (sender: object | undefined, args: { parentValue: GridRow | undefined }) => {
    if (args.parentValue !== undefined) {
      args.parentValue.posObj.pos.rowChange.addSubscriber(this.onParentRowChanged);
      this.posObj.pos.row = args.parentValue.posObj.pos.row;
    }
  }

  // zavolá se tehdy, když nastane událost 'this.parentObj.parent.posObj.pos.rowChange'
  // provede změny v souvislosti s novými souřadnicemi
  private onParentRowChanged = (sender: object | undefined, args: { rowValue: number | undefined }) => {
    this.posObj.pos.row = args.rowValue;
  }

  // pole v reálném čase obsahující stylové třídy, které se mají aplikovat
  private _classes: Array<string> = [];
  public get classes() { return [...this._classes] }
  private set classes(value: Array<string>) {
    this._classes = [...value];

    this.toggleClasses();
  }

  // stylové třídy zformátuje a uloží je do pole 'this.shell.classString'
  public toggleClasses(): boolean {
    if (this.shell !== undefined) {
      this.shell.classString = this.cmService.formatClasses(this.classes);

      return true;
    }

    return false;
  }

  // <operace se stylovými třídami>
  public addClasses(classes: Array<string>) {
    this.cmService.addClasses(this, classes);
  }

  public removeClasses(classes: Array<string>) {
    this.cmService.removeClasses(this, classes);
  }

  public clearClasses() {
    this.cmService.clearClasses(this);
  }
  // </operace se stylovými třídami>

  // nastaví buňku do počátečního stavu
  public clearAndSetUp() {
    this.enableInteraction();

    // nastaví i symbol
    this.setOwner(Owner.nobody);

    this.clearClasses();
    this.addClasses(this.cellService.defaultClasses);
  }

  // zjistí, zdali je aktuální stav hry výherní
  public checkWin(): boolean {
    let line = this.cellService.checkDirections(this, this.cellService.directions, this.inRow)
    
    if (line.length >= this.inRow) {
      this.gridService.disableAllCells(this.cellService.getParentGridId(this));
      console.log("vyhrává " + this.symbol + "!!!");

      // vizualizace
      this.addClasses([this.cellService.getOwnerClass(this.owner)]);
      this.gridService.setClassesExceptOf(this.cellService.getParentGridId(this), line, ["owner-cross", "owner-circle", "inactive"], false);
      this.gridService.setClassesExceptOf(this.cellService.getParentGridId(this), line, ["owner-neutral"], true);
      // konec vizualizace

      return true;
    }
    else      
      return false;
  }

  constructor(private cellService: CellService, private gridService: GridService, private cmService: ClassManagementService) {
    this.parentObj.parentChange.addSubscriber(this.onParentChanged);
    this.shellChange.addSubscriber(this.onShellChanged);

    this.classes = this.cellService.defaultClasses;
    this.enableInteraction();
  }

  // volá se při kliknutí do buňky, když je buňka ve stavu, kdy reaguje na podněty ze strany uživatele
  clickEnabled = () => {
    let owner = this.cellService.getGridPlayer(this);

    if (owner !== undefined)
      this.setOwner(owner);

    this.cellService.switchGridPlayer(this);

    // vizualizace
    //
    // třídy této buňky =
    // { "inactive" }
    //
    // třídy ostatních buněk =
    // { ("inactive" | "active"); *"owner-{symbol}" }
    //
    this.removeClasses(["inactive"]);

    this.checkWin();

    this.addClasses(["active", this.cellService.getOwnerClass(this.owner)]);
    this.gridService.setClassesExceptOf(this.cellService.getParentGridId(this), [this], ["active"], false);
    //
    // třídy této buňky =
    // { "active"; "owner-{symbol}" }
    //
    // třídy ostatních buněk =
    // { "inactive"; *"owner-{symbol}" }
    //
    // konec vizualizace

    this.disableInteraction();
  }

  // volá se při kliknutí do buňky, když je buňka ve stavu, kdy nereaguje na podněty ze strany uživatele
  clickDisabled = () => {
    // nic se nestane
  }
}

// typ souřadnic používaný v 'Cell'
export class Cpos {

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

  constructor(row?: number, column?: number) {
    this.row = row;
    this.column = column;
  }
}

// třída regulující dotazy na výhru, když se změní minimální počet symbolů v řadě 'Cell.inRow'
export class CheckWinManager {

  public winFound: boolean;

  public constructor() {
    this.winFound = false;
  }
}
