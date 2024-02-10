import { Component, Input } from '@angular/core';
import { Cell } from '../cell';
import { CellService } from '../cell.service';
import { IBoundsStyle } from '../../boundsStyleInterface';

@Component({
  selector: 'cell-shell',
  templateUrl: './cell-shell.component.html',
  styleUrl: './cell-shell.component.css'
})
export class CellShellComponent implements IBoundsStyle {

  private _cell: Cell | undefined;
  public get cell(): Cell | undefined { return this._cell };
  @Input() public set cell(value: Cell | undefined) {
    this._cell = value;

    if (this.cell !== undefined)
      this.cell.shell = this;
  }

  public classString: string = "";

  public get classes() {
    return "grid-cell " + this.classString;
  }

  public symbol: string = '';

  public get bounds() {
    return this.cellService.cellBounds;
  }

  public get boundsStyle() {
    return "width: " + this.bounds + "px; height: " + this.bounds + "px;";
  }

  constructor(private cellService: CellService) {

  }

  public onClick: () => void = () => { };
}
