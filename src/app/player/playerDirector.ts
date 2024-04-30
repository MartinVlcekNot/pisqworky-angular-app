import { Event } from '../../eventHandler/event';
import { Cell } from '../cell/cell';
import { GridComponent } from '../grid/grid.component';
import { IPlayable } from './playableInterface';
import { Owner, Symbol, Symbols } from './symbol';
import { SymbolQueue } from './symbolQueue';

// Třída 'PlayerDirector' poskytuje funkcionalitu spojenou s hráčem na tahu v hracím poli.
// Nezávislí hráči (např. jiných hracích polí) nesmí být stejné instance

export class PlayerDirector {

  // hráč na tahu
  private _player = Owner.cross;
  public get player() { return this._player; }
  private set player(value: Owner) {
    let previous = this._player;

    this._player = value;

    if (this.player !== previous)
      this.playerSwitched(this.player);
  }

  public playerSwitch: Event<{ playerValue: Owner }> = new Event();
  private playerSwitched(curPlayer: Owner) {
    this.playerSwitch.invoke(this, { playerValue: curPlayer });
  }

  protected grid: GridComponent;

  public readonly symbolQueue: SymbolQueue;

  public constructor(grid: GridComponent) {
    this.grid = grid;
    this.symbolQueue = new SymbolQueue(this.grid, Symbols.players);
  }

  // nastaví hráče na začínajícího hráče
  public setUp() {
    this.player = Owner.cross;
  }

  // resetuje hráče zpět na začínajícího hráče
  public resetPlayer() {
    this.player = Owner.cross;
  }

  // předá štafetu svému protějšku
  public switchPlayer() {
    if (this.player === Owner.circle)
      this.player = Owner.cross;
    else if (this.player === Owner.cross)
      this.player = Owner.circle;
  }

  public play(cell: IPlayable) {
    cell.symbol = this.symbolQueue.fetchSymbol(this.player);
    cell.userInteraction = false;

    cell.gridPlayerD?.switchPlayer();

    // až po přehození hráče
    cell.registerSymbolAction();
  }
}
