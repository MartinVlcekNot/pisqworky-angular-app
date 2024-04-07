import { IPos } from "./posInterface";

// Třída 'Pos' slouží jako schránka pro objekt pozice nebo souřadnic a poskytuje základní funkcionality jako např. porovnávání
// instance s jinou instancí této třídy.
//
// TPos: typ objektu pozice nebo souřadnic (typ a počet dimenzí v soustavě)
//
// implementuje rozhraní
//    '../position/posInterface.IPos<TPos>', aby byl sám považován za objekt odpovídající tvaru viz '../position/posInterface.IPos'

export class Pos<TPos> implements IPos<TPos> {

  // objekt pozice nebo souřadnic
  // nemůže nabývat hodnoty undefined; požadován v konstruktoru
  private _pos: TPos;
  public get pos(): TPos {
    return this._pos;
  }
  public set pos(posVal: TPos) {
    this._pos = posVal;
  }

  // přístup k instanci this
  // určen rozhraním viz '../position/posInterface.IPos'
  public get posObj(): Pos<TPos> { return this; }

  // porovnání dvou objektů pozice nebo souřadnic
  public evaluatePosEquals(pos: IPos<TPos>): boolean {
    if (this.pos === pos)
      return true;

    return false;
  }

  constructor(posInst: TPos) {
    this._pos = posInst;
  }
}
