import { Event } from "../../eventHandler/event";
import { GridComponent } from "../grid/grid.component";
import { Actions, ClsSymbAct } from "./action";
import { PlayerDirector } from "./playerDirector";
import { ClassifiedSymbol, Owner, OwnerSymbol, Symbol, Symbols } from "./symbol";

export class SymbolQueue {

  public static readonly desiredLength = 5;

  public get queueLength(): number {
    if (this.queue.length > 0)
      return this.queue[0].symbols.length;

    return 0;
  }

  public get allowedSpecials(): Array<ClassifiedSymbol> {
    return Symbols.specials.filter((symb) => !this.isRestriction(symb, this.symbolRestrictions));
  }

  public symbolRestrictions: Array<ClassifiedSymbol> = [];

  protected isRestriction(restrict: ClassifiedSymbol, arr: Array<ClassifiedSymbol>): boolean {
    return arr.find((rest) => rest.symbEquals(restrict)) !== undefined;
  }

  public modifyRestricts(restricts: ClassifiedSymbol[], add: boolean): boolean {
    let modified = false;

    if (add) {
      restricts.forEach((restrict) => {
        if (!this.isRestriction(restrict, this.symbolRestrictions)) {
          this.symbolRestrictions.push(restrict);
          modified = true;
        }
      });
    }
    else {
      const symbRest = this.symbolRestrictions;
      this.symbolRestrictions = this.symbolRestrictions.filter((restrict) => !this.isRestriction(restrict, restricts));

      if (symbRest !== this.symbolRestrictions)
        modified = true;
    }

    return modified;
  }

  public modRestExt = (sender: object | undefined, args: { restrictions: Array<ClassifiedSymbol>, add: boolean }) => {
    this.modifyRestricts(args.restrictions, args.add);
  }

  protected grid: GridComponent;
  protected queue: Array<QueueRow> = [];

  public queueRowUpdate: Event<{ row: QueueRow }> = new Event();
  protected queueRowUpdated(row: QueueRow) {
    this.queueRowUpdate.invoke(this, { row: row });
  }

  public findRow(player: Owner): QueueRow | undefined {
    return this.queue.find((row) => row.player === player);
  }

  public fetchSymbol(player: Owner): OwnerSymbol {
    this.updateQueue(player, true);

    let row = this.findRow(player);

    if (row) {
      let symbol = row.symbols.shift();

      this.updateQueue(player);

      if (symbol)
        return symbol;
    }

    return Symbols.N;
  }

  public pickSymbol(player: Owner): ClassifiedSymbol {
    let symbol: ClassifiedSymbol = Symbols.none;
    let playPrimary = Math.random() * 2;
    const distribution = Symbols.getDistribution(this.grid);

    if (playPrimary <= 1 || distribution <= 0)
      symbol = Symbols.getPrimaryCls(player);
    else {
      const specials = this.allowedSpecials;
      const specialsLength = specials.length;

      let odds = Math.random() * distribution;

      let separator = 0;
      for (let i = 0; i < specialsLength; i++) {
        let symbOdds = specials[i].odds;
        if (symbOdds !== undefined) {
          separator += symbOdds;

          if (odds <= separator) {
            symbol = specials[i];
            break;
          }
        }
      }
    }

    return symbol;
  }

  public rollDice(player: Owner, index?: number, beforeShift?: boolean): OwnerSymbol {
    let symbol = this.pickSymbol(player);

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
    let row = this.findRow(player);

    if (row) {
      let changes = false;

      for (let i = row.symbols.length; i < SymbolQueue.desiredLength; i++) {
        row.symbols.push(this.rollDice(player, i, beforeShift));
        changes = true;
      }

      if (row.symbols.length > SymbolQueue.desiredLength) {
        row.symbols.splice(SymbolQueue.desiredLength);
        changes = true;
      }

      if (changes)
        this.queueRowUpdated(row);
    }
  }

  public resetQueue(update?: boolean) {
    this.queue.forEach((row) => {
      row.symbols = [];

      if (update === true)
        this.updateQueue(row.player, true);
      else
        this.queueRowUpdated(row);
    });
  }

  public constructor(grid: GridComponent, players: Array<Owner>) {
    this.grid = grid;

    players.forEach((player) => {
      this.queue.push({ player: player, symbols: [] });
    });
  }
}

export type QueueRow = {
  player: Owner;
  symbols: Array<OwnerSymbol>;
}
