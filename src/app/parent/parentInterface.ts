import { Parent } from "./parentClass";

// Rozhranní 'IParent' u objektu určuje a zaručuje, že daný objekt má rodiče typu 'TParent'.

export interface IParent<TParent> {

  // rodičovský objekt typu './parentClass.Parent<TParent>'
  parentObj: Parent<TParent>;
}
