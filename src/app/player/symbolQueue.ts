import { GridComponent } from "../grid/grid.component";
import { Actions, ClsSymbAct } from "./action";
import { PlayerDirector } from "./playerDirector";
import { ClassifiedSymbol, Owner, OwnerSymbol, Symbol, Symbols } from "./symbol";

export class SymbolQueue {

  public readonly queueLength = 5;

  protected grid: GridComponent;

  protected queue: Array<{ player: Owner, symbols: Array<OwnerSymbol> }> = [];

  public fetchSymbol(player: Owner): OwnerSymbol {
    this.updateQueue(player, true);

    let row = this.queue.find((row) => row.player === player);

    if (row) {
      let symbol = row.symbols.shift();

      this.updateQueue(player);

      let stringRepre = " ";
      row.symbols.forEach((symbol) => {
        stringRepre += Symbol[symbol.represent] + "; ";
      });
      console.log(`player ${Owner[player]}:\n{${stringRepre}}`);

      if (symbol)
        return symbol;
    }

    return Symbols.N;
  }

  public static pickSymbol(player: Owner): ClassifiedSymbol {
    let symbol: ClassifiedSymbol = Symbols.none;

    let playPrimary = Math.random() * 2;

    if (playPrimary <= 1)
      symbol = Symbols.getPrimaryCls(player);
    else {
      const specials = Symbols.specials.length;
      let odds = Math.random() * Symbols.distribution;

      let separator = 0;
      for (let i = 0; i < specials; i++) {
        let symbOdds = Symbols.specials[i].odds;
        if (symbOdds !== undefined) {
          separator += symbOdds;

          if (odds <= separator) {
            symbol = Symbols.specials[i];
            break;
          }
        }
      }
    }

    return symbol;
  }

  public rollDice(player: Owner, index?: number, beforeShift?: boolean): OwnerSymbol {
    let symbol = SymbolQueue.pickSymbol(player);

    if (Actions.actFrom(symbol.represent)?.decayOpt === '$before_placement') {
      let clsSymbAct = Actions.actFrom(symbol.represent);

      if (clsSymbAct) {
        Actions.decodeDecayOptOf(clsSymbAct);

        let symbAct = clsSymbAct.toSymbolActionGrid(this.grid, symbol.toOwnerSymbol(player));

        if (symbAct.decayIn !== null && index !== undefined) {
          symbAct.decayIn += this.decayBeforePlacement(index, beforeShift);
        }

        this.grid.symbolActionStack.placeOnTop(symbAct);
      }
    }

    return symbol.toOwnerSymbol(player);
  }

  public decayBeforePlacement(index: number, beforeShift?: boolean) {
    let afNum = 1;
    if (beforeShift !== undefined && beforeShift)
      afNum = 0;

    return (index + afNum) * Symbols.players.length + 1;
  }

  public updateQueue(player: Owner, beforeShift?: boolean) {
    let row = this.queue.find((row) => row.player === player);

    if (row) {
      for (let i = row.symbols.length; i < this.queueLength; i++) {
        row.symbols.push(this.rollDice(player, i, beforeShift));
      }

      if (row.symbols.length > this.queueLength) {
        row.symbols.splice(this.queueLength);
      }
    }
  }

  public constructor(grid: GridComponent, players: Array<Owner>) {
    this.grid = grid;

    players.forEach((player) => {
      this.queue.push({ player: player, symbols: [] });
    });
  }
}
