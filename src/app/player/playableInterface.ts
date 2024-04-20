import { PlayerDirector } from "./playerDirector";
import { OwnerSymbol } from "./symbol";

export interface IPlayable {

  get symbol(): OwnerSymbol;
  set symbol(symb: OwnerSymbol);

  get gridPlayerD(): PlayerDirector | undefined;

  get infer(): OwnerSymbol;
}
