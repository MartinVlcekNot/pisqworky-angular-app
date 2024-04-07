import { Component, Input } from '@angular/core';
import { AppComponent } from '../app.component';
import { Gamemode } from './gamemode';

@Component({
  selector: 'game-options',
  templateUrl: './game-options.component.html',
  styleUrl: './game-options.component.css'
})
export class GameOptionsComponent {

  // povinnost nastavit skrze stejnojmenný atribut tohoto komponentu (dynamická hodnota)
  @Input() protected parent!: AppComponent;

  public gamemode: Gamemode = Gamemode.normal;
}
