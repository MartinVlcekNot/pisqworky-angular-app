import { AfterViewInit, Component } from '@angular/core';
import { IBoundsStyle } from './boundsStyleInterface';
import { GridService } from './grid/grid.service';
import { GridComponent } from './grid/grid.component';
import { CellService } from './cell/cell.service';
import { CheckWinManager } from './cell/cell';
import { IBValueChangeArgs } from './input-box/input-box.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements IBoundsStyle {
  title = 'pisqapp';

  private _gridId = 0;
  public get gridId() {
    return this._gridId;
  }

  public get grid() {
    return GridService.getGridById(this.gridId);
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
    return this.gridService.getInRowSetFuncs(this.gridId);
  }

  public createChWM: () => any = this.cellService.createChWM;

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
