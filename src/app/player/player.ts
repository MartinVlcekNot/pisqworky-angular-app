import { Owner } from './owner';

export class Player {

  private _player = Owner.cross;
  public get player() { return this._player; }
  private set player(value: Owner) { this._player = value; }

  public setUp() {
    this.player = Owner.cross;
  }

  public resetPlayer() {
    this.player = Owner.cross;
  }

  public switchPlayer() {
    if (this.player === Owner.circle)
      this.player = Owner.cross;
    else if (this.player === Owner.cross)
      this.player = Owner.circle;
  }
}
