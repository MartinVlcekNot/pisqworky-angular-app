import { Component, EventEmitter, Output } from '@angular/core';
import { Event } from '../../eventHandler/event';

@Component({
  selector: 'switch-button',
  templateUrl: './switch-button.component.html',
  styleUrl: './switch-button.component.css'
})
export class SwitchButtonComponent {

  private _on: boolean = false;
  public get on() { return this._on; }
  public set on(value: boolean) {
    let previous = this._on;

    this._on = value;

    if (this.on !== previous)
      this.switched(this.on);
  }

  public switchE: Event<{ on: boolean }> = new Event();
  protected switched(on: boolean) {
    this.switchE.invoke(this, { on: on });
  }
  protected onSwitched = (sender: object | undefined, args: { on: boolean }) => {
    this.switchEvent.emit({ sender: sender, args: args });
  }

  @Output() public switchEvent = new EventEmitter<SwitchEvent>();

  public constructor() {
    this.switchE.addSubscriber(this.onSwitched);
  }

  public switch() {
    this.on = !this.on;
  }
}

export type SwitchEvent = {
  sender: object | undefined;
  args: {
    on: boolean;
  }
}
