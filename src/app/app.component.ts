import { Component, ViewChild } from '@angular/core';
import { IBoundsStyle } from './boundsStyle/boundsStyleInterface';
import { GridService } from './grid/grid.service';
import { GridComponent } from './grid/grid.component';
import { CellService } from './cell/cell.service';
import { IBValueChangeArgs } from './input-box/input-box.component';
import { CheckWinManager } from './cell/cell';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements IBoundsStyle {

  @ViewChild(GridComponent, { static: true }) gridChild!: GridComponent;

  public get grid(): GridComponent | undefined {
    return this.gridChild;
  }

  public get gridId() {
    if (this.grid === undefined)
      return -1;

    return this.grid.id;
  }

  public get setGridWidthFuncs(): Array<(sender: object | undefined, args: IBValueChangeArgs<number>) => void> {
    if (this.grid !== undefined)
      return [this.grid.setWidthExt];
    else
      return [(sender: object | undefined, args: IBValueChangeArgs<number>) => { }];
  }

  public get setGridHeightFuncs(): Array<(sender: object | undefined, args: IBValueChangeArgs<number>) => void> {
    if (this.grid !== undefined)
      return [this.grid.setHeightExt];
    else
      return [(sender: object | undefined, args: IBValueChangeArgs<number>) => { }];
  }

  public get setInRowFuncs(): Array<(sender: object | undefined, args: IBValueChangeArgs<number>) => void> {
    if (this.grid !== undefined)
      return this.gridService.getInRowSetFuncs(this.grid);

    return [];
  }

  public createChWM = () => {
    if (this.grid !== undefined)
      return this.gridService.createChWM(this.grid);

    return undefined;
  }

  public get pxWidth(): number {
    let pxw = GridService.getGridById(this.gridId)?.pxWidth;

    if (pxw !== undefined)
      return pxw;
    else
      return 481;
  }

  public get boundsStyle() {
    return "width: " + this.pxWidth + "px;";
  }

  constructor(protected gridService: GridService, private cellService: CellService) {

  }
}
