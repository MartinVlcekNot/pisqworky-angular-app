import { Component, Input } from '@angular/core';
import { AppComponent } from '../app.component';
import { Gamemode } from './gamemode';
import { InputNumElem } from '../input-box/input-number/input-number.component';
import { SwitchEvent } from '../switch-button/switch-button.component';
import { Owner, Symbols } from '../player/symbol';
import { IGridDependent } from '../grid/gridCellInterface';
import { GridComponent } from '../grid/grid.component';
import { GridService } from '../grid/grid.service';

@Component({
  selector: 'game-options',
  templateUrl: './game-options.component.html',
  styleUrl: './game-options.component.css'
})
export class GameOptionsComponent implements IGridDependent {

  // povinnost nastavit skrze stejnojmenný atribut tohoto komponentu (dynamická hodnota)
  @Input() public gridId!: number;

  public get grid(): GridComponent | undefined {
    return GridService.getGridById(this.gridId);
  }

  // povinnost nastavit skrze stejnojmenný atribut tohoto komponentu (dynamická hodnota)
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

  public gamemode: Gamemode = Gamemode.normal;

  protected switchGamemode = (event: SwitchEvent) => {
    if (event.args.on)
      this.gamemode = Gamemode.enhanced;
    else
      this.gamemode = Gamemode.normal;
  }

  protected get isNormal(): boolean { return this.gamemode === Gamemode.normal; }
  protected get isEnhanced(): boolean { return this.gamemode === Gamemode.enhanced; }
}

export type OptionsElem = {
  name: string;
  inputNumElemObj: InputNumElem;
}
