import { Component, Input } from '@angular/core';
import { Owner, OwnerSymbol, Symbols } from '../player/symbol';
import { QueueRow, SymbolQueue } from '../player/symbolQueue';
import { DeadCell } from '../cell/deadCell';
import { ClassManagementService } from '../../styleClassManagement/class-management.service';
import { IGridDependent } from '../grid/gridCellInterface';
import { GridComponent } from '../grid/grid.component';
import { GridService } from '../grid/grid.service';
import { SymbolQueueEntity } from './symbolQueueEntity';

@Component({
  selector: 'symbol-queue',
  templateUrl: './symbol-queue.component.html',
  styleUrl: './symbol-queue.component.css'
})
export class SymbolQueueComponent implements IGridDependent {

  private _entity: SymbolQueueEntity | undefined;
  public get entity(): SymbolQueueEntity | undefined {
    return this._entity;
  }
  @Input() public set entity(value: SymbolQueueEntity) {
    this._entity = value;

    if (this.entity)
      this.entity.shell = this;
  }

  public get grid(): GridComponent | undefined {
    return this.entity?.grid;
  }

  public get cells(): Array<DeadCell> {
    if (this.entity)
      return this.entity.cells;

    return [];
  }
}
