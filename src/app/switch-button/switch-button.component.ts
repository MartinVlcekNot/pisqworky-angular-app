import { Component } from '@angular/core';

@Component({
  selector: 'switch-button',
  templateUrl: './switch-button.component.html',
  styleUrl: './switch-button.component.css'
})
export class SwitchButtonComponent {

  public on: boolean = false;

  public switch() {
    this.on = !this.on;
  }
}
