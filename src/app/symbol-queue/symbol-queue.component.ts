import { Component, Input } from '@angular/core';
import { Owner, OwnerSymbol, Symbols } from '../player/symbol';
import { QueueRow, SymbolQueue } from '../player/symbolQueue';
import { DeadCell } from '../cell/deadCell';
import { ClassManagementService } from '../../styleClassManagement/class-management.service';
import { IGridDependent } from '../grid/gridCellInterface';
import { GridComponent } from '../grid/grid.component';
import { GridService } from '../grid/grid.service';

@Component({
  selector: 'symbol-queue',
  templateUrl: './symbol-queue.component.html',
  styleUrl: './symbol-queue.component.css'
})
export class SymbolQueueComponent implements IGridDependent {

  private _player!: Owner;
  public get player(): Owner { return this._player; }
  @Input() public set player(value: Owner) {
    this._player = value;

    this.initQueue();
  }

  private _gridId!: number;
  public get gridId(): number { return this._gridId; }
  @Input() public set gridId(value: number) {
    this._gridId = value;

    this.symbolQueue = this.grid?.playerDirector.symbolQueue;
    this.symbolQueue?.queueRowUpdate.addSubscriber(this.onQueueUpdated);

    this.initQueue();
  }

  protected initQueue() {
    if (this.symbolQueue) {
      if (this.player && this.symbolQueue.queueLength > 0) {
        let row = this.symbolQueue.findRow(this.player);

        if (row)
          this.createQueue(row);
      }
    }
  }

  public get grid(): GridComponent | undefined {
    return GridService.getGridById(this.gridId);
  }

  public symbolQueue: SymbolQueue | undefined;

  public cells: Array<DeadCell> = [];

  protected onQueueUpdated = (sender: object | undefined, args: { row: QueueRow }) => {
    console.log("updated");
    this.createQueue(args.row);
  }

  protected createQueue(row: QueueRow): void {
    if (row.player === this.player) {
      for (let i = 0; i < row.symbols.length; i++) {
        const symbol = row.symbols[i];

        if (i > this.cells.length - 1)
          this.cells.push(new DeadCell(this.cmService));

        this.cells[i].symbol = symbol;
      }

      if (this.symbolQueue && this.cells.length > this.symbolQueue.desiredLength)
        this.cells.splice(this.symbolQueue.desiredLength);
    }
  }

  public constructor(protected cmService: ClassManagementService) {
    for (let i = 0; i < 5; i++) {
      this.cells.push(new DeadCell(this.cmService));
    }
  }
}
