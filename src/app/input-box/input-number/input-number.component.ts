import { Component } from '@angular/core';
import { InputBoxComponent } from '../input-box.component';

@Component({
  selector: 'input-number',
  templateUrl: '../input-box.component.html',
  styleUrl: '../input-box.component.css'
})
export class InputNumberComponent extends InputBoxComponent<number> {

  public override valueValidationFunc = (value: number | undefined) => {
    if (value !== undefined) {
      if (value > InputBoxComponent.valueRange.bottomExcl && value <= InputBoxComponent.valueRange.topIncl)
        return true;
    }

    return false;
  }

  public override converterFunc = (value: string) => {
    let num = parseInt(value);

    if (num === Number.NaN)
      return undefined;

    return num;
  }

  public override inputTextValidationFunc = (value: string) => {
    let digits: Array<string> = [];

    for (let i = 0; i <= 9; i++) {
      digits.push(i.toString());
    } // digits = ['0', '1', ... '9'];

    let syl = value.split(' ')
    let str: Array<string> = [];
    if (syl.length > 0)
      str = syl[0].split('');

    let junk = str.filter((char) => {
      if (digits.includes(char))
        return false;

      return true;
    });

    if (str.length < 1 || junk.length > 0)
      return false;

    return true;
  }
}
