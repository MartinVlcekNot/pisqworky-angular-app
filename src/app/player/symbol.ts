// Výčet 'Owner' je souhrn hodnot, kterých může nabývat majitel určité buňky (viz '../cell.cell.Cell').
// 'cross' -> křížek
// 'circle' -> kolečko
// 'nobody' -> buňka je prázdná

export enum Owner {
  cross,
  circle,
  nobody
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
}

export enum ClassifierToken {
  primary,
  special
}

export class ClassifiedSymbol {
  public represent: Symbol;
  public forOpt: Array<Owner>;
  public clsToken: ClassifierToken;
  public textOut: string;
  public src?: string;

  constructor(represent: Symbol, forOpt: Array<Owner>, clsToken: ClassifierToken, textOut: string, src?: string) {
    this.represent = represent;
    this.forOpt = forOpt;
    this.clsToken = clsToken;
    this.textOut = textOut;
    this.src = src;
  }

  public toOwnerSymbol(owner?: Owner): OwnerSymbol {
    if (this.forOpt.length > 0) {
      if (owner && this.forOpt.includes(owner)) {
        let symbol = this.toOwnerSymbol();
        symbol.for = owner;

        return symbol;
      }
      else
        return { represent: this.represent, for: this.forOpt[0], textOut: this.textOut, src: this.src };
    }

    return Symbols.N;
  }
}

export type OwnerSymbol = {
  represent: Symbol;
  for: Owner;
  textOut: string;
  src?: string;
}

export class Symbols {

  public static get none(): ClassifiedSymbol {
    return this.symbFrom(Symbol.none);
  }

  public static get N(): OwnerSymbol { return this.none.toOwnerSymbol(); }

  public static readonly symbArr: Array<ClassifiedSymbol> = [
    new ClassifiedSymbol(
      Symbol.none,
      [Owner.nobody],
      ClassifierToken.primary,
      "",
    ),
    new ClassifiedSymbol(
      Symbol.cross,
      [Owner.cross],
      ClassifierToken.primary,
      "X",
    ),
    new ClassifiedSymbol(
      Symbol.circle,
      [Owner.circle],
      ClassifierToken.primary,
      "O"
    ),
    new ClassifiedSymbol(
      Symbol.wall,
      [Owner.nobody],
      ClassifierToken.special,
      "="
    ),
    new ClassifiedSymbol(
      Symbol.bomb,
      [Owner.nobody],
      ClassifierToken.special,
      "¤"
    ),
    new ClassifiedSymbol(
      Symbol.rogue,
      [Owner.cross, Owner.circle, Owner.nobody],
      ClassifierToken.special,
      "8"
    ),
    new ClassifiedSymbol(
      Symbol.disguise,
      [Owner.cross, Owner.circle],
      ClassifierToken.special,
      "Q"
    ),
    new ClassifiedSymbol(
      Symbol.patch,
      [Owner.cross, Owner.circle],
      ClassifierToken.special,
      "§"
    )
  ];

  public static symbFrom(symbol: Symbol): ClassifiedSymbol {
    let symb = this.symbArr.find((s) => {
      return s.represent === symbol;
    });

    if (symb)
      return symb;

    return this.none;
  }

  public static getPrimary(owner: Owner): OwnerSymbol {
    let symbol = this.symbArr.find((symb) => {
      return symb.clsToken === ClassifierToken.primary && symb.forOpt.includes(owner)
    });

    if (symbol)
      return symbol.toOwnerSymbol();

    return this.N;
  }

  public static obtainSrcFor(symbol: OwnerSymbol): string {
    symbol.src = Symbol[symbol.represent];

    if (this.symbFrom(symbol.represent).forOpt.length > 1)
      symbol.src += `_o_${Symbol[symbol.for]}`;

    return symbol.src;
  }
}
