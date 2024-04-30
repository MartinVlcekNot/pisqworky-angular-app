import { PlayerDirector } from "./playerDirector";
import { OwnerSymbol } from "./symbol";
import { SymbolActionStack } from "./symbolActionStack";

export interface IPlayable {

  get symbol(): OwnerSymbol;
  set symbol(symb: OwnerSymbol);

  get gridPlayerD(): PlayerDirector | undefined;

  get infer(): OwnerSymbol;

  registerSymbolAction(): void;

  get userInteraction(): boolean;
  set userInteraction(value: boolean);
}
