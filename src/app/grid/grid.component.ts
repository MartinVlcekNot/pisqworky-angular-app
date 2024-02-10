import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { GridService } from './grid.service';
import { GridRow } from './gridRow/gridRow';
import { Event } from '../../eventHandler/event';
import { IBoundsStyle } from '../boundsStyleInterface';
import { CellService } from '../cell/cell.service';
import { Player } from '../player/player';
import { Owner } from '../player/owner';
import { ClassManagementService } from '../../styleClassManagement/class-management.service';
import { IBValueChangeArgs } from '../input-box/input-box.component';

@Component({
  selector: 'grid',
  templateUrl: './grid.component.html',
  styleUrl: './grid.component.css'
})
export class GridComponent implements IBoundsStyle {

  public get id() {
    return GridService.getGridId(this);
  }

  private _width: number | undefined;
  public get width(): number {
    if (this._width === undefined) {
      this.width = this.gridService.defaultWidth;
    }

    if (this._width !== undefined)
      return this._width;

    return 0;
  }
  public set width(value: number | undefined) {
    let previous = this._width;

    this._width = value;

    if (this.width !== previous)
      this.widthChanged(this.width);
  }

  public widthChange: Event<{ widthValue: number }> = new Event();
  private widthChanged(curWidth: number) {
    this.widthChange.invoke(this, { widthValue: curWidth });
  }

  // přídavná metoda pro eventhandler ve třídě InputBoxComponent
  public setWidthExt = (sender: object | undefined, args: IBValueChangeArgs<number>) => {
    this.width = args.value;
  }

  public get pxWidth() {
    return this.width * this.cellService.cellBounds + 1;
  }

  private _height: number | undefined;
  public get height(): number {
    if (this._height === undefined) {
      this.height = this.gridService.defaultHeight;
    }

    if (this._height !== undefined)
      return this._height;

    return 0;
  }
  public set height(value: number | undefined) {
    let previous = this._height;

    this._height = value;

    if (this.height !== previous) {
      this.heightChanged(this.height);
    }
  }

  public heightChange: Event<{ heightValue: number }> = new Event();
  private heightChanged(curHeight: number) {
    this.heightChange.invoke(this, { heightValue: curHeight });
  }
  private onHeightChanged = (sender: object | undefined, args: { heightValue: number }) => {
    this.gridService.adjustRow<GridRow, GridComponent>(this.grid, args.heightValue, this.gridService.gridRowFactory, this);
  }

  // přídavná metoda pro eventhandler ve třídě InputBoxComponent
  public setHeightExt = (sender: object | undefined, args: IBValueChangeArgs<number>) => {
    this.height = args.value;
  }

  public get pxHeight() {
    return this.height * this.cellService.cellBounds + 1;
  }

  public get boundsStyle() {
    return "width: " + this.pxWidth + "px; height: " + this.pxHeight + "px;";
  }

  private _grid: Array<GridRow> = [];
  public get grid() { return this._grid; }
  private set grid(value: Array<GridRow>) { this._grid = value; }

  private _player: Player = new Player();
  public get player() { return this._player; }

  public switchPlayer() {
    this.player.switchPlayer();
  }

  public resetPlayer() {
    this.player.resetPlayer();
  }

  constructor(private gridService: GridService, public cellService: CellService, public cmService: ClassManagementService) {
    let id = this.gridService.generateId;
    GridService.idGridBase.push({ id: id, inst: this });

    this.heightChange.addSubscriber(this.onHeightChanged);

    this.width = gridService.defaultWidth;
    this.height = gridService.defaultHeight;
    this.player.setUp();
  }
}
