import { GridComponent } from "../grid/grid.component";
import { PlayerDirector } from "./playerDirector";
import { ClassifiedSymbol, Owner, OwnerSymbol, Symbol, Symbols } from "./symbol";

export class SymbolQueue {

  public readonly queueLength = 5;

  protected grid: GridComponent;

  protected queue: Array<{ player: Owner, symbols: Array<OwnerSymbol> }> = [];

  public fetchSymbol(player: Owner): OwnerSymbol {
    this.updateQueue(player);

    let row = this.queue.find((row) => row.player === player);

    if (row) {
      let symbol = row.symbols.shift();

      //
      if (player === Owner.cross) {
        let t = this.grid.symbolActionStack.stack.find((sa) => {
          if (sa.obj instanceof GridComponent && sa.decayIn === 2) return true; return false;
        })?.decayIn;
        if (this.queue[1].symbols[0]?.represent !== Symbol.patch && t === 2)
          console.error("symbol is not patch");
        else if (this.queue[1].symbols[0]?.represent === Symbol.patch && t === 2)
          console.error("symbol is patch");
      }
      else {
        let t = this.grid.symbolActionStack.stack.find((sa) => {
          if (sa.obj instanceof GridComponent && sa.decayIn === 2) return true; return false;
        })?.decayIn;
        if (this.queue[0].symbols[0]?.represent !== Symbol.patch && t === 2)
          console.error("symbol is not patch");
        else if (this.queue[0].symbols[0]?.represent === Symbol.patch && t === 2)
          console.error("symbol is patch");
      }
      //

      this.updateQueue(player);

      if (symbol)
        return symbol;
    }

    return Symbols.N;
  }

  public rollDice(player: Owner, index?: number): OwnerSymbol {
    let symbol: ClassifiedSymbol;

    // vybere symbol
    let primarySymbs = 3
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
          symbolAction.decayIn += (index + 1) * Symbols.players.length + 1;
        }

        this.grid.symbolActionStack.placeOnTop(symbolAction);
      }
    }

    return symbol.toOwnerSymbol(player);
  }

  public updateQueue(player: Owner) {
    let row = this.queue.find((row) => row.player === player);

    if (row) {
      for (let i = row.symbols.length; i < this.queueLength; i++) {
        row.symbols.push(this.rollDice(player, i));
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
