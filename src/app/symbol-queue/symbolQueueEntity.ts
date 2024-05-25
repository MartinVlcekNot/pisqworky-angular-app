import { Event } from "../../eventHandler/event";
import { ClassManagementService } from "../../styleClassManagement/class-management.service";
import { DeadCell } from "../cell/deadCell";
import { GridComponent } from "../grid/grid.component";
import { GridService } from "../grid/grid.service";
import { Actions } from "../player/action";
import { Owner, Symbols } from "../player/symbol";
import { SymbolActionStack } from "../player/symbolActionStack";
import { QueueRow, SymbolQueue } from "../player/symbolQueue";
import { SymbolQueueComponent } from "./symbol-queue.component";

export class SymbolQueueEntity {

  private _shell: SymbolQueueComponent | undefined;
  public get shell(): SymbolQueueComponent | undefined { return this._shell; }
  public set shell(value: SymbolQueueComponent | undefined) {
    let previous = this._shell;

    this._shell = value;

    if (value !== previous)
      this.shellAttached(this.shell);
  }

  public shellAttach: Event<{ shell: SymbolQueueComponent | undefined }> = new Event();
  protected shellAttached(shell: SymbolQueueComponent | undefined) {
    this.shellAttach.invoke(this, { shell: this.shell });
  }

  public player: Owner;

  public grid: GridComponent;

  public readonly symbolQueue: SymbolQueue;

  public cells: Array<DeadCell> = [];

  protected onQueueUpdated = (sender: object | undefined, args: { row: QueueRow }) => {
    console.log("updated");
    this.createQueue(args.row);
  }

  protected onGridPlayerSwitched = (sender: object | undefined, args: { player: Owner }) => {
    if (args.player === this.player && this.grid) {
      if (this.cells.length >= 1) {
        this.makeActive();
      }
    }
  }

  protected initQueue() {
    if (this.symbolQueue) {
      if (this.symbolQueue.queueLength > 0) {
        let row = this.symbolQueue.findRow(this.player);

        if (row)
          this.createQueue(row);
      }
      else {
        for (let i = 0; i < SymbolQueue.desiredLength; i++) {
          this.cells.push(new DeadCell(this.cmService));
        }

        if (this.player === Owner.cross) {
          let symbAct = Actions.oneRoundClass.toSymbolActionCell(this.cells[0], ["active"], true);
          SymbolActionStack.invokeAction(symbAct);
          this.grid.symbolActionStack.placeOnTop(symbAct);
        }
      }
    }
  }

  protected createQueue(row: QueueRow): void {
    if (row.player === this.player) {
      for (let i = 0; i < row.symbols.length; i++) {
        const symbol = row.symbols[i];

        if (i > this.cells.length - 1)
          this.cells.push(new DeadCell(this.cmService));

        this.cells[i].symbol = symbol;
      }

      if (this.symbolQueue && this.cells.length > SymbolQueue.desiredLength)
        this.cells.splice(SymbolQueue.desiredLength);
      else if (row.symbols.length < this.cells.length) {
        for (let i = row.symbols.length; i < this.cells.length; i++) {
          this.cells[i].symbol = Symbols.N;
        }
      }
    }
  }

  protected makeActive() {
    this.cells[0].addOneRoundCls(this.grid, ["active"]);
  }

  public constructor(player: Owner, grid: GridComponent, protected cmService: ClassManagementService) {
    this.player = player;
    this.grid = grid;
    this.symbolQueue = this.grid.playerDirector.symbolQueue;

    this.symbolQueue.queueRowUpdate.addSubscriber(this.onQueueUpdated);
    this.grid.playerDirector.playerSwitch.addSubscriber(this.onGridPlayerSwitched, 1);

    this.initQueue();
  }
}
