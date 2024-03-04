import { Pos } from "./posClass";

// Rozhranní 'IPos' u objektu určuje, že se daný objekt mimo jiné identifikuje skrze pozice nebo souřadnic.

export interface IPos<TPos> {

  // objekt pozice nebo souřadnic typu './posClass.Pos<TPos>'
  get posObj(): Pos<TPos>;
}
