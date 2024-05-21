import { PlayerDirector } from "./playerDirector";
import { OwnerSymbol } from "./symbol";

export interface IPlayable {

  get symbol(): OwnerSymbol;
  set symbol(value: OwnerSymbol);

  setSymbolWRA(value: OwnerSymbol): void;

  get gridPlayerD(): PlayerDirector | undefined;

  get infer(): OwnerSymbol;

  requestSymbolAction(): void;
  requestNewSymbAct(): void;

  get userInteraction(): boolean;
  set userInteraction(value: boolean);
}
