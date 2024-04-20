import { Parent } from "./parentClass";

// Rozhraní 'IChildOf' u objektu určuje a zaručuje, že daný objekt má rodiče typu 'TParent'.

export interface IChildOf<TParent> {

  // rodičovský objekt typu './parentClass.Parent<TParent>'
  parentObj: Parent<TParent>;
}
