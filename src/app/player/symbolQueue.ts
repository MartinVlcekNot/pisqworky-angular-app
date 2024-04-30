import { GridComponent } from "../grid/grid.component";
import { PlayerDirector } from "./playerDirector";
import { ClassifiedSymbol, Owner, OwnerSymbol, Symbol, Symbols } from "./symbol";

export class SymbolQueue {

  public readonly queueLength = 5;

  protected grid: GridComponent;

  protected queue: Array<{ player: Owner, symbols: Array<OwnerSymbol> }> = [];

  public fetchSymbol(player: Owner): OwnerSymbol {
    this.updateQueue(player, false);

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

  public rollDice(player: Owner, index?: number, afterFetch?: boolean): OwnerSymbol {
    let symbol: ClassifiedSymbol;

    // vybere symbol
    let primarySymbs = 3;
    let special = Symbols.symbArr.length - primarySymbs;
    let primary = special;
    let chance = Math.random() * (primary + special);

    if (chance < primary)
      symbol = Symbols.getPrimaryCls(player);
    else if (chance >= special) {
      let enumIndex = Math.floor(chance) - primary + primarySymbs;

      symbol = Symbols.symbFrom(enumIndex as Symbol);   
    }
    else
      symbol = Symbols.none;
    //

    let decayIn = Symbols.decodeDecayOpt(symbol.decayOpt);
    if (decayIn !== null && decayIn !== undefined && decayIn <= 0) {
      let symbolAction = Symbols.getSymbolActionGrid(this.grid, symbol.toOwnerSymbol(player));

      if (symbolAction) {
        Symbols.decodeDecayOptFor(symbolAction);

        if (symbolAction.decayIn !== null && index !== undefined) {
          symbolAction.decayIn += this.decayBeforePlacement(index, afterFetch);
        }

        this.grid.symbolActionStack.placeOnTop(symbolAction);
      }
    }

    return symbol.toOwnerSymbol(player);
  }

  public decayBeforePlacement(index: number, afterFetch?: boolean) {
    let afNum = 1;
    if (afterFetch !== undefined && !afterFetch)
      afNum = 0;

    return (index + afNum) * Symbols.players.length + 1;
  }

  public updateQueue(player: Owner, afterFetch?: boolean) {
    let row = this.queue.find((row) => row.player === player);

    if (row) {
      for (let i = row.symbols.length; i < this.queueLength; i++) {
        row.symbols.push(this.rollDice(player, i, afterFetch));
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
