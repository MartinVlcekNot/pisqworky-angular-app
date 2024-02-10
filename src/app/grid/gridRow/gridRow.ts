import { inject } from "@angular/core";
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

export class GridRow implements IPos<Rpos>, IParent<GridComponent> {
  private _width: number = 0;
  public get width() { return this._width; }
  public set width(value: number) {
    let previous = this._width;

    this._width = value;

    if (this.width !== previous)
      this.widthChanged(this.width);
  }

  public widthChange: Event<{ widthValue: number }> = new Event();
  private widthChanged(curWidth: number) {
    this.widthChange.invoke(this, { widthValue: curWidth });
  }
  private onWidthChanged = (sender: object | undefined, args: { widthValue: number }) => {
    this.gridService.adjustRow<Cell, GridRow>(this.row, this.width, this.cellService.CellComponentFactory, this);
  }

  // přídavná metoda pro eventhandler ve třídě GridComponent
  public setWidthExt = (sender: object | undefined, args: { widthValue: number }) => {
    this.width = args.widthValue;
  }

  private _posObj: Pos<Rpos> = new Pos(new Rpos());
  public get posObj(): Pos<Rpos> { return this._posObj; }

  public parentObj: Parent<GridComponent> = new Parent();

  private onParentChanged = (sender: object | undefined, args: { parentValue: GridComponent | undefined }) => {
    if (args.parentValue !== undefined) {
      this.width = args.parentValue.width;
      args.parentValue.widthChange.addSubscriber(this.setWidthExt);
    }
  }

  private _row: Array<Cell> = [];
  public get row() { return this._row; }
  private set row(value: Array<Cell>) { this._row = value; }

  constructor(public gridService: GridService, public cmService: ClassManagementService, private cellService: CellService) {
    this.widthChange.addSubscriber(this.onWidthChanged);
    this.parentObj.parentChange.addSubscriber(this.onParentChanged);
  }
}

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
