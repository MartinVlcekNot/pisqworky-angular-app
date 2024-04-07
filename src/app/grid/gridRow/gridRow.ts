import { GridService } from '../grid.service';
import { Cell } from '../../cell/cell';
import { GridComponent } from "../grid.component";
import { CellService } from "../../cell/cell.service";
import { Event } from "../../../eventHandler/event";
import { IPos } from "../../position/posInterface";
import { Pos } from "../../position/posClass";
import { IParent } from "../../parent/parentInterface";
import { Parent } from "../../parent/parentClass";
import { ClassManagementService } from "../../../styleClassManagement/class-management.service";

// Třída 'GridRow' slouží jako pomocný kontejner obsahující pole (řádek) instancí '../../cell/cell.Cell'.
// N instancí 'GridRow' je generováno v případě, že dojde ke změně výšky mřížky '../grid/(grid.component).GridComponent' a tato změna
// vyžaduje přidání nových řádků, nikoli jejich odebrání.
//
// Implementuje rozhraní
//    '../../position/posInterface.IPos<Rpos>' viz '../../position/posInterface.IPos'
//    '../../parent/parentInterface.IParent<../(grid.component).GridComponent>' viz '../../parent/parentInterface.IParent'

export class GridRow implements IPos<Rpos>, IParent<GridComponent> {

  // šířka řádku, tj kolik buněk '../../cell/cell.Cell' obsahuje
  private _width: number = 0;
  public get width() { return this._width; }
  public set width(value: number) {
    let previous = this._width;

    this._width = value;

    if (this.width !== previous)
      this.widthChanged(this.width);
  }

  // událost, která nastane tehdy, když se změní hodnota 'this._width' skrze vlasnost 'this.width'
  public widthChange: Event<{ widthValue: number }> = new Event();
  private widthChanged(curWidth: number) {
    this.widthChange.invoke(this, { widthValue: curWidth });
  }
  private onWidthChanged = (sender: object | undefined, args: { widthValue: number }) => {
    this.gridService.adjustRow<Cell, GridRow>(this.row, this.width, this.cellService.CellComponentFactory, this);
  }

  // přídavná metoda pro eventhandler v komponentu '../(grid.component).GridComponent'
  // může externě nastavit 'this.width'
  public setWidthExt = (sender: object | undefined, args: { widthValue: number }) => {
    this.width = args.widthValue;
  }

  // viz '../../position/posInterface.IPos'
  private _posObj: Pos<Rpos> = new Pos(new Rpos());
  public get posObj(): Pos<Rpos> { return this._posObj; }

  // viz '../../parent/parentInterface.IParent'
  public parentObj: Parent<GridComponent> = new Parent();

  // zavolá se tehdy, když nastane událost 'this.parentObj.parentChange'
  // provede změny v souvislosti s novým rodičovským objektem
  private onParentChanged = (sender: object | undefined, args: { parentValue: GridComponent | undefined }) => {
    if (args.parentValue !== undefined) {
      this.width = args.parentValue.width;
      args.parentValue.widthChange.addSubscriber(this.setWidthExt);
    }
  }

  // pole instancí '../../cell/cell.Cell'
  private _row: Array<Cell> = [];
  public get row() { return this._row; }
  private set row(value: Array<Cell>) { this._row = value; }

  constructor(public gridService: GridService, public cmService: ClassManagementService, private cellService: CellService) {
    this.widthChange.addSubscriber(this.onWidthChanged);
    this.parentObj.parentChange.addSubscriber(this.onParentChanged);
  }
}

// typ souřadnic používaný v 'GridRow'
class Rpos {

  private _row: number | undefined;
  public get row(): number | undefined { return this._row; }
  public set row(value: number | undefined) {
    let previous = this._row;

    this._row = value;

    if (this.row !== previous)
      this.rowChanged(this.row);
  }

  public rowChange: Event<{ rowValue: number | undefined }> = new Event();
  private rowChanged(curRow: number | undefined) {
    this.rowChange.invoke(this, { rowValue: curRow });
  }

  constructor() {
    this._row = undefined;
  }
}
