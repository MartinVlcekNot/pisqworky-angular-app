import { Event } from "../../eventHandler/event";

export class Parent<Tparent> {
  private _parent: Tparent | undefined;
  public get parent(): Tparent | undefined { return this._parent; }
  public set parent(value: Tparent | undefined) {
    let previous = this._parent;

    this._parent = value;

    if (this.parent !== previous) {
      this.parentChanged(this.parent);
    }
  }

  public parentChange: Event<{ parentValue: Tparent | undefined }> = new Event();
  private parentChanged(curParent: Tparent | undefined) {
    this.parentChange.invoke(this, { parentValue: curParent });
  }
}
