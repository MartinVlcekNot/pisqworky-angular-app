import { Event } from "../../eventHandler/event";
import { ClassManagementService } from "../../styleClassManagement/class-management.service";
import { IClassManagement } from "../../styleClassManagement/classManagementInterface";
import { IOneRoundClass } from "../../styleClassManagement/oneRoundClassInterface";
import { OwnerSymbol, Symbol, Symbols } from "../player/symbol";
import { CellShellComponent } from "./cell-shell/cell-shell.component";

export class DeadCell implements IClassManagement {

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
    this.decodeSymbolSrc();
  }

  // vlastník této buňky typu '../player/symbol.ClassifiedSymbol'
  // vlastnost set nastaví i symbol schránky
  private _symbol: OwnerSymbol = Symbols.N;
  public get symbol() { return this._symbol; }
  public set symbol(value: OwnerSymbol) {
    this._symbol = value;

    this.decodeSymbolSrc();
  }

  public decodeSymbolSrc() {
    if (this.shell) {
      this.shell.srcRef = Symbols.decodeSrc(this.symbol);

      this.shell.symbol = this.symbol.textOut;
    }
  }

  public readonly classManagementService: ClassManagementService;

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

  public constructor(cmService: ClassManagementService) {
    this.classManagementService = cmService;

    this.shellAttach.addSubscriber(this.onAttachedToShell);
  }
}
