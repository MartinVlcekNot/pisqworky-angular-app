import { Event } from "../../eventHandler/event";

// Třída 'Parent' slouží jako schránka pro rodičovský objekt, se kterým se tak dá snadněji operovat díky funkcionalitám jako např. podchycení situací,
// kdy je hodnota změněna, skrze vestavěný eventhandler.
//
// TParent: typ rodičovského objektu

export class Parent<TParent> {

  // rodičovský objekt typu 'TParent'
  // možnost nabýhat hodnoty undefined pro případ, kdy rodič není
  private _parent: TParent | undefined;
  public get parent(): TParent | undefined { return this._parent; }
  public set parent(value: TParent | undefined) {
    let previous = this._parent;

    this._parent = value;

    if (this.parent !== previous) {
      this.parentChanged(this.parent);
    }
  }

  // událost nastávající tehdy, když se změní hodnota 'this._parent' skrze set vlastnost 'this.parent'
  public parentChange: Event<{ parentValue: TParent | undefined }> = new Event();
  private parentChanged(curParent: TParent | undefined) {
    this.parentChange.invoke(this, { parentValue: curParent });
  }
}
