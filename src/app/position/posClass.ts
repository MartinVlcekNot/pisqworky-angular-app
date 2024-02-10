import { IPos } from "./posInterface";

export class Pos<Tpos> implements IPos<Tpos> {

  private _pos: Tpos;

  public get pos(): Tpos {
    return this._pos;
  }
  public set pos(posVal: Tpos) {
    this._pos = posVal;
  }

  public get posObj(): Pos<Tpos> { return this; }

  public evaluatePosEquals(pos: IPos<Tpos>): boolean {
    if (this.pos === pos)
      return true;

    return false;
  }

  constructor(posInst: Tpos) {
    this._pos = posInst;
  }
}
