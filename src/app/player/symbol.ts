import { Cell } from "../cell/cell";
import { GridComponent } from "../grid/grid.component";
import { IPlayable } from "./playableInterface";
import { ActionFunc, Actions, SymbolAction } from "./action";

// Výčet 'Owner' je souhrn hodnot, kterých může nabývat majitel určité buňky (viz '../cell.cell.Cell').
// 'cross' -> křížek
// 'circle' -> kolečko
// 'nobody' -> buňka je prázdná

export enum Owner {
  nobody,
  cross,
  circle
}

export enum Symbol {
  cross,
  circle,
  none,
  wall,
  bomb,
  rogue,
  disguise,
  patch,
  turret,
}

export enum ClassifierToken {
  primary,
  special
}

export class ClassifiedSymbol {
  public represent: Symbol;
  public ownerOpt: Array<Owner>;
  public clsToken: ClassifierToken;
  public textOut: string;
  public src: string;
  public odds?: number;
  public action?: ActionFunc<Cell | GridComponent>;
  public decayIn: number;
  public decayOpt?: string;

  constructor(represent: Symbol, forOpt: Array<Owner>, clsToken: ClassifierToken, textOut: string, src?: string, odds?: number, action?: ActionFunc<Cell | GridComponent>, decayIn?: number, lastForOpt?: string) {
    this.represent = represent;
    this.ownerOpt = forOpt;
    this.clsToken = clsToken;
    this.textOut = textOut;

    if (src)
      this.src = src;
    else
      this.src = '$symbol';

    this.odds = odds;
    this.action = action;

    if (!decayIn)
      this.decayIn = 1;
    else
      this.decayIn = decayIn;

    this.decayOpt = lastForOpt;
  }

  public toOwnerSymbol(owner?: Owner): OwnerSymbol {
    if (this.ownerOpt.length > 0) {
      if (owner && this.ownerOpt.includes(owner)) {
        let symbol = this.toOwnerSymbol();
        symbol.owner = owner;

        return symbol;
      }
      else
        return { represent: this.represent, owner: this.ownerOpt[0], textOut: this.textOut, src: this.src };
    }

    return Symbols.N;
  }
}

export type OwnerSymbol = {
  represent: Symbol;
  owner: Owner;
  textOut: string;
  src: string;
}

export class Symbols {

  public static get none(): ClassifiedSymbol {
    return this.symbFrom(Symbol.none);
  }

  public static get N(): OwnerSymbol { return this.none.toOwnerSymbol(); }

  public static readonly players: Array<Owner> = [
    Owner.cross,
    Owner.circle,
  ]

  public static readonly symbList: Array<ClassifiedSymbol> = [
    new ClassifiedSymbol(
      Symbol.none,
      [Owner.nobody],
      ClassifierToken.primary,
      ''
    ),
    new ClassifiedSymbol(
      Symbol.cross,
      [Owner.cross],
      ClassifierToken.primary,
      'X'
    ),
    new ClassifiedSymbol(
      Symbol.circle,
      [Owner.circle],
      ClassifierToken.primary,
      'O'
    ),
    new ClassifiedSymbol(
      Symbol.wall,
      [Owner.nobody],
      ClassifierToken.special,
      'W',
      undefined,
      9
    ),
    new ClassifiedSymbol(
      Symbol.bomb,
      [Owner.nobody],
      ClassifierToken.special,
      '¤',
      undefined,
      10,
      Actions.bombAction,
      undefined,
      '$random 8'
    ),
    new ClassifiedSymbol(
      Symbol.rogue,
      [Owner.nobody, ...this.players],
      ClassifierToken.special,
      '8',
      '$symbol+_o_+$owner',
      6,
      Actions.rogueAction,
      1
    ),
    new ClassifiedSymbol(
      Symbol.disguise,
      this.players,
      ClassifierToken.special,
      'G',
      '$symbol+_o_+$owner',
      11
    ),
    new ClassifiedSymbol(
      Symbol.patch,
      this.players,
      ClassifierToken.special,
      'P',
      '$symbol+_o_+$owner',
      7,
      Actions.patchAction,
      undefined,
      '$before_placement'
    ),
    new ClassifiedSymbol(
      Symbol.turret,
      [Owner.nobody],
      ClassifierToken.special,
      'T',
      undefined,
      3,
      Actions.turretAction,
      undefined,
      '$forever'
    )
  ];

  public static symbFrom(symbol: Symbol): ClassifiedSymbol {
    let symb = this.symbList.find((s) => {
      return s.represent === symbol;
    });

    if (symb)
      return symb;

    return this.none;
  }

  public static getPrimaryCls(owner: Owner): ClassifiedSymbol {
    let symbol = this.symbList.find((symb) => {
      return symb.clsToken === ClassifierToken.primary && symb.ownerOpt.includes(owner)
    });

    if (symbol)
      return symbol;

    return this.none;
  }

  public static get specials(): Array<ClassifiedSymbol> {
    return this.symbList.filter((clsSymb) => clsSymb.clsToken === ClassifierToken.special);
  }

  public static get primaries(): Array<ClassifiedSymbol> {
    return this.symbList.filter((clsSymb) => clsSymb.clsToken === ClassifierToken.primary);
  }

  public static get distribution(): number {
    let distribution = 0;
    Symbols.specials.forEach((clsSymbol) => clsSymbol.odds !== undefined ? distribution += clsSymbol.odds : false);
    return distribution;
  }

  public static get odds(): Array<{ symbol: ClassifiedSymbol, odds: number }> {
    let symbArr: Array<{ symbol: ClassifiedSymbol, odds: number }> = [];
    this.specials.forEach((clsSymb) => {
      symbArr.push({ symbol: clsSymb, odds: clsSymb.odds !== undefined ? clsSymb.odds / this.distribution : 0 });
    });
    return symbArr;
  }

  public static get oddsString() {
    let str = "";
    this.odds.forEach((odd) => {
      str += `${Symbol[odd.symbol.represent]}: ${odd.odds * 100} %\n`;
    });
    return str;
  }

  public static getPrimary(owner: Owner): OwnerSymbol {
    return this.getPrimaryCls(owner).toOwnerSymbol();
  }

  public static decodeSrc(symbol: OwnerSymbol): string {
    let source = "";
    let portions = symbol.src.split('+');

    portions.forEach((srcItem) => {
      switch (srcItem) {
        case '$symbol':
          source += Symbol[symbol.represent];
          break;
        case '$owner':
          source += Owner[symbol.owner];
          break;
        case '$owner_primary':
          source += Symbol[this.getPrimary(symbol.owner).represent];
          break;
        default:
          source += srcItem;
          break;
      }
    });

    symbol.src = source;

    return source;
  }

  public static getSymbolActionCell(cell: Cell): SymbolAction<Cell | GridComponent> | undefined {
    let clsSymb = this.symbFrom(cell.symbol.represent);
    let action = clsSymb.action;
    let decayIn: number | null = clsSymb.decayIn;

    if (action) {
      let symbAct = {
        forSymbol: cell.symbol,
        action: action,
        obj: cell,
        decayIn: decayIn,
        decayOpt: clsSymb.decayOpt
      };

      this.decodeDecayOptFor(symbAct);

      if (symbAct.decayIn !== null && symbAct.decayIn <= 0)
        return undefined;

      return symbAct;
    }

    return undefined;
  }

  public static getSymbolActionGrid(grid: GridComponent, symbol: OwnerSymbol): SymbolAction<Cell | GridComponent> | undefined {
    let clsSymb = this.symbFrom(symbol.represent);
    let action = clsSymb.action;
    let decayIn = clsSymb.decayIn;

    if (action) {
      return {
        forSymbol: symbol,
        action: action,
        obj: grid,
        decayIn: decayIn,
        decayOpt: clsSymb.decayOpt
      }
    }

    return undefined;
  }

  public static decodeDecayOpt(decayOpt: string | undefined): number | null | undefined {
    if (decayOpt) {
      let com = decayOpt.split(' ');

      switch (com[0]) {
        case '$random':
          return Math.ceil(Math.random() * Number(com[1]));
        case '$before_placement':
          return 0;
        case '$forever':
          return null;
      }
    }

    return undefined;
  }

  public static decodeDecayOptFor<TObj>(symbolAction: SymbolAction<TObj>): number | null | undefined {
    if (symbolAction.decayOpt) {
      let decayIn = this.decodeDecayOpt(symbolAction.decayOpt);

      if (decayIn !== undefined) {
        symbolAction.decayIn = decayIn;

        return decayIn;
      }
    }

    return undefined;
  }
}
