import { IPlayable } from './playableInterface';
import { Owner, Symbol, Symbols } from './symbol';

// Třída 'PlayerDirector' poskytuje funkcionalitu spojenou s hráčem na tahu v hracím poli.
// Nezávislí hráči (např. jiných hracích polí) nesmí být stejné instance

export class PlayerDirector {

  // hráč na tahu
  private _player = Owner.cross;
  public get player() { return this._player; }
  private set player(value: Owner) { this._player = value; }

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
    let chance = Math.random() * 5

    if (chance < 1)
      cell.symbol = Symbols.symbFrom(Symbol.wall).toOwnerSymbol();
    else
      cell.symbol = cell.infer;

    cell.gridPlayerD?.switchPlayer();
  }
}
