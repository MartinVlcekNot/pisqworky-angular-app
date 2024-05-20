import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SwitchEvent } from '../switch-button/switch-button.component';

@Component({
  selector: 'switchable-option',
  templateUrl: './switchable-option.component.html',
  styleUrl: './switchable-option.component.css'
})
export class SwitchableOptionComponent {

  // povinné
  @Input() public labelText!: string;

  @Output() public switchEvent: EventEmitter<SwitchEvent> = new EventEmitter();

  protected onSwitched = (event: SwitchEvent) => {
    this.switchEvent.emit(event);
  }
}
