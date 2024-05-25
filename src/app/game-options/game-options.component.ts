import { Component, Input } from '@angular/core';
import { AppComponent } from '../app.component';
import { Gamemode } from './gamemode';
import { InputNumElem } from '../input-box/input-number/input-number.component';
import { SwitchEvent } from '../switch-button/switch-button.component';
import { Owner, Symbols } from '../player/symbol';
import { IGridDependent } from '../grid/gridCellInterface';
import { GridComponent } from '../grid/grid.component';
import { GridService } from '../grid/grid.service';
import { Event } from '../../eventHandler/event';

@Component({
  selector: 'game-options',
  templateUrl: './game-options.component.html',
  styleUrl: './game-options.component.css'
})
export class GameOptionsComponent implements IGridDependent {

  private _gridId!: number;
  public get gridId(): number { return this._gridId; }
  @Input() public set gridId(value: number) {
    this._gridId = value;

    // volání kvůli nastavení symbolů v 'this.grid?.playerDirector.symbolQueue.symbolRestrictions'
    this.gamemodeSwitched(this.gamemode);
  }

  public get grid(): GridComponent | undefined {
    return GridService.getGridById(this.gridId);
  }

  @Input() public optionsObj!: Array<OptionsElem>;

  protected get players(): Array<Owner> {
    return Symbols.players;
  }

  protected getInpMunElemByName(name: string): InputNumElem {
    let inputElem = this.optionsObj.find((optElem) => {
      return optElem.name === name;
    })?.inputNumElemObj;

    if (!inputElem)
      return new InputNumElem("name", "not found", "");

    return inputElem;
  }

  protected readonly queueVisibleInit = true;
  public queueVisible = this.queueVisibleInit;

  protected switchQueueVisibility = (event: SwitchEvent) => {
    this.queueVisible = event.args.on;
  }

  private _gamemode: Gamemode = Gamemode.normal;
  public get gamemode(): Gamemode {
    return this._gamemode;
  }
  public set gamemode(value: Gamemode) {
    let previous = this._gamemode;

    this._gamemode = value;

    if (this.gamemode !== previous)
      this.gamemodeSwitched(this.gamemode);
  }

  public gamemodeSwitch: Event<{ gamemode: Gamemode }> = new Event();
  protected gamemodeSwitched(gamemode: Gamemode) {
    this.gamemodeSwitch.invoke(this, { gamemode: gamemode });
  }
  protected onGamemodeSwitched = (sender: object | undefined, args: { gamemode: Gamemode }) => {
    if (this.grid)
      this.grid.playerDirector.symbolQueue.modRestExt(this, { restrictions: Symbols.specials, add: this.gamemode === Gamemode.normal })
  }

  protected switchGamemode = (event: SwitchEvent) => {
    if (event.args.on)
      this.gamemode = Gamemode.enhanced;
    else
      this.gamemode = Gamemode.normal;
  }

  protected get isNormal(): boolean { return this.gamemode === Gamemode.normal; }
  protected get isEnhanced(): boolean { return this.gamemode === Gamemode.enhanced; }

  public constructor() {
    this.gamemodeSwitch.addSubscriber(this.onGamemodeSwitched);
  }
}

export type OptionsElem = {
  name: string;
  inputNumElemObj: InputNumElem;
}
