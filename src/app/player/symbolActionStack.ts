import { CellService } from "../cell/cell.service";
import { GridComponent } from "../grid/grid.component";
import { GridService } from "../grid/grid.service";
import { Owner, Symbol } from "./symbol";
import { Cell } from "../cell/cell";
import { Actions, SymbolAction } from "./action";
import { Event } from "../../eventHandler/event";
import { SymbolQueue } from "./symbolQueue";
import { before } from "node:test";

export class SymbolActionStack {

  protected grid: GridComponent;
  protected readonly gridService: GridService;

  protected stack: Array<SymbolAction> = [];
  protected requestStack: Array<SymbolAction> = [];
  protected stackStash: Array<SymbolAction> = [];

  public placeOnTop(symbAct: SymbolAction) {
    if (!this.invoking)
      this.stack.push(symbAct);
    else {
      this.stackStash.push(symbAct);

      if (this.invokingFinish.subscribers.length <= 0)
        this.invokingFinish.addSubscriber(this.onInvokingFinished);
    }
  }

  public requestAction(symbAct: SymbolAction) {
    this.requestStack.push(symbAct);
  }

  public registerActions() {
    this.stack.push(...this.requestStack.splice(0));
  }

  private _invoking = false;
  public get invoking() { return this._invoking; }
  private set invoking(value: boolean) {
    let previous = this._invoking;

    this._invoking = value;

    if (!this.invoking && previous)
      this.invokingFinished(this.invoking);
  }

  public invokingFinish: Event<{ invoking: boolean }> = new Event();
  private invokingFinished(invoking: boolean) {
    this.invokingFinish.invoke(this, { invoking: invoking });
  }
  private onInvokingFinished = (sender: object | undefined, args: { invoking: boolean }) => {
    this.stack.push(...this.stackStash);
    const stashLength = this.stackStash.length;
    this.stackStash = [];
    this.invokingFinish.clearSubscribers();

    this.invokeStack(this.stack.length - stashLength);
  }

  public invokeStack(startIndex?: number) {
    this.invoking = true;

    let remove: Array<SymbolAction> = [];

    const startI = startIndex !== undefined ? startIndex : 0;

    for (let i = startI; i < this.stack.length; i++) {
      let symbAct = this.stack[i];

      if (symbAct && this.stack.includes(symbAct)) {
        if (SymbolActionStack.invokeAction(symbAct))
          remove.push(symbAct);
      }
    }

    this.stack = this.stack.filter((symbAct) => !remove.includes(symbAct));
    this.orderSymbolActions();

    this.invoking = false;

    this.grid.gridService.checkGridWin(this.grid);
  }

  // vrací true/false indikující, jestli životní cyklus akce skončil
  public static invokeAction(symbolAction: SymbolAction, decay: boolean = true): boolean {
    let invoke = true;
    let remove = false;

    if (decay) {
      if (typeof symbolAction.decayIn === "number") {
        let decayIn = symbolAction.decayIn as number;
        decayIn--;

        if (decayIn <= 0) {
          remove = true;
          if (decayIn < 0)
            invoke = false;
        }

        symbolAction.decayIn = decayIn;
      }
    }

    if (invoke) {
      symbolAction.args = symbolAction.action(symbolAction.obj, symbolAction.decayIn, symbolAction.args);
    }

    return remove;
  }  

  public removeSymbAct(cell: Cell, includeRequest: boolean = true, includeStash: boolean = true): Array<SymbolAction> {
    let result = this.stack.filter((symbAct) => symbAct.obj === cell && !symbAct.immutable);
    this.stack = this.stack.filter((symbAct) => symbAct.obj !== cell || symbAct.immutable);

    if (includeRequest) {
      result.push(...this.requestStack.filter((symbAct) => symbAct.obj === cell && !symbAct.immutable));
      this.requestStack = this.requestStack.filter((symbAct) => symbAct.obj !== cell || symbAct.immutable);
    }
    if (includeStash) {
      result.push(...this.stackStash.filter((symbAct) => symbAct.obj === cell && !symbAct.immutable));
      this.stackStash = this.stackStash.filter((symbAct) => symbAct.obj !== cell || symbAct.immutable);
    }

    return result;
  }

  public clearStack(invokeOneRoundCls?: boolean) {
    if (invokeOneRoundCls === true) {
      this.stack.forEach((symbAct) => {
        if (symbAct.action === Actions.oneRoundClass.action)
          SymbolActionStack.invokeAction(symbAct);
      });
    }

    this.stack = [];
  }

  public orderSymbolActions() {
    let patchSymbActions = this.stack.filter((patchSymbAct) => patchSymbAct.forSymbol?.represent === Symbol.patch);
    let output: Array<SymbolAction> = [];

    this.stack = this.stack.filter((symbAct) => !patchSymbActions.includes(symbAct));

    const symbQueue = this.grid.playerDirector.symbolQueue;

    for (let i = 0; i <= symbQueue.decayBeforePlacement(SymbolQueue.desiredLength - 1); i++) {
      let psa = patchSymbActions.find((patchSymbAct) => patchSymbAct.decayIn === i);
      if (psa)
        output.push(psa);
    }

    this.stack.push(...output);
  }

  protected onPlayerSwitched = (sender: object | undefined, args: { player: Owner }) => {
    this.invokeStack();
  }

  public constructor(grid: GridComponent) {
    this.grid = grid;
    this.gridService = this.grid.gridService;

    this.grid.playerDirector.playerSwitch.addSubscriber(this.onPlayerSwitched, 2);
  }
}
