import { Owner } from './owner';

// Třída 'Player' poskytuje funkcionalitu spojenou s hráčem na tahu v hracím poli.
// Nezávislí hráči (např. jiných hracích polí) nesmí být stejné instance

export class Player {

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
}
