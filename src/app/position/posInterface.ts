import { Pos } from "./posClass";

export interface IPos<Tpos> {

  get posObj(): Pos<Tpos>;
}
