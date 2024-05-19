import { Component, Input } from '@angular/core';
import { AppComponent } from '../app.component';
import { Gamemode } from './gamemode';
import { InputNumElem } from '../input-box/input-number/input-number.component';

@Component({
  selector: 'game-options',
  templateUrl: './game-options.component.html',
  styleUrl: './game-options.component.css'
})
export class GameOptionsComponent {

  // povinnost nastavit skrze stejnojmenný atribut tohoto komponentu (dynamická hodnota)
  @Input() public parent!: AppComponent;

  // povinnost nastavit skrze stejnojmenný atribut tohoto komponentu (dynamická hodnota)
  @Input() public optionsObj!: Array<OptionsElem>;

  protected getInpMunElemByName(name: string): InputNumElem {
    let inputElem = this.optionsObj.find((optElem) => {
      return optElem.name === name;
    })?.inputNumElemObj;

    if (!inputElem)
      return new InputNumElem("name", "not found", "");

    return inputElem;
  }

  public gamemode: Gamemode = Gamemode.normal;

  protected get isNormal(): boolean { return this.gamemode === Gamemode.normal; }
  protected get isEnhanced(): boolean { return this.gamemode === Gamemode.enhanced; }
}

export type OptionsElem = {
  name: string;
  inputNumElemObj: InputNumElem;
}
