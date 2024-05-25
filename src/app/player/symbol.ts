import { Cell } from "../cell/cell";
import { GridComponent } from "../grid/grid.component";
import { IPlayable } from "./playableInterface";
import { ActionFunc, Action, SymbolAction, Actions, ClsSymbAct } from "./action";

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
  debris,
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
  public action?: ClsSymbAct;

  constructor(represent: Symbol, forOpt: Array<Owner>, clsToken: ClassifierToken, textOut: string, src?: string, odds?: number, action?: ClsSymbAct) {
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

  public symbEquals(other: ClassifiedSymbol): boolean {
    return this.represent === other.represent;
  }

  public valueEquals(other: ClassifiedSymbol): boolean {
    return this.symbEquals(other) && this.clsToken === other.clsToken && this.odds === other.odds;
  }
}

export type OwnerSymbol = {
  represent: Symbol;
  owner: Owner;
  textOut: string;
  src: string;
}

export class Symbols {

  public static symbEquals(symb1: OwnerSymbol, symb2: OwnerSymbol): boolean {
    return symb1.represent === symb2.represent;
  }

  public static valueEquals(symb1: OwnerSymbol, symb2: OwnerSymbol): boolean {
    return this.symbEquals(symb1, symb2) && symb1.owner === symb2.owner;
  }

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
      'B',
      undefined,
      10,
      Actions.bomb
    ),
    new ClassifiedSymbol(
      Symbol.rogue,
      [Owner.nobody, ...this.players],
      ClassifierToken.special,
      'R',
      '$symbol+_o_+$owner',
      6,
      Actions.rogue
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
      Actions.patch
    ),
    new ClassifiedSymbol(
      Symbol.turret,
      [Owner.nobody],
      ClassifierToken.special,
      'T',
      undefined,
      3,
      Actions.turret
    ),
    new ClassifiedSymbol(
      Symbol.debris,
      [Owner.nobody],
      ClassifierToken.special,
      'D',
      '$symbol',
      0,
      Actions.debris
    ),
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

  public static getDistribution(grid?: GridComponent): number {
    let distribution = 0;
    let allowedSymbs: Array<ClassifiedSymbol> = this.specials;

    if (grid)
      allowedSymbs = grid.playerDirector.symbolQueue.allowedSpecials;

    allowedSymbs.forEach((clsSymbol) => clsSymbol.odds !== undefined ? distribution += clsSymbol.odds : false);
    return distribution;
  }

  public static getOdds(grid?: GridComponent): Array<{ symbol: ClassifiedSymbol, odds: number }> {
    let symbArr: Array<{ symbol: ClassifiedSymbol, odds: number }> = [];

    let allowedSymbs: Array<ClassifiedSymbol> = this.specials;
    let distribution = this.getDistribution(grid);

    if (grid)
      allowedSymbs = grid.playerDirector.symbolQueue.allowedSpecials;
      

    if (distribution !== 0) {
      allowedSymbs.forEach((clsSymb) => {
        symbArr.push({ symbol: clsSymb, odds: clsSymb.odds !== undefined ? clsSymb.odds / distribution : 0 });
      });
    }

    return symbArr;
  }

  public static get oddsString() {
    let str = "";
    this.getOdds().forEach((chance) => {
      str += `${Symbol[chance.symbol.represent]}: ${chance.odds * 100} %\n`;
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
}
