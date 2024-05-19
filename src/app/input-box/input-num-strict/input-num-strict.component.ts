import { Component } from '@angular/core';
import { InputNumberComponent } from '../input-number/input-number.component';

@Component({
  selector: 'input-num-strict',
  templateUrl: '../input-box.component.html',
  styleUrl: '../input-box.component.css'
})
export class InputNumStrictComponent extends InputNumberComponent {

  // viz '../(input-box.component).InputBoxComponent'
  public override readonly valueRegulations = { bottomExcl: 0, topIncl: 40 };

  // viz '../(input-box.component).InputBoxComponent'
  public override valueValidationFunc = (value: number | undefined) => {
    if (value !== undefined) {
      if (value > this.valueRegulations.bottomExcl && value <= this.valueRegulations.topIncl)
        return true;
    }

    return false;
  }
}
