import { Component } from '@angular/core';
import { InputBoxComponent } from '../input-box.component';
import { ClassManagementService } from '../../../styleClassManagement/class-management.service';
import { InputBoxElem, InputBoxShComponent } from '../input-box-sh/input-box-sh.component';

// Komponent 'InputNumberComponent' je odvozený ze základního komponentu '../(input-box.component).InputBoxComponent'. Je utvořený speciálně
// pro zadávání čísel; jiná hodnota bude odfiltrována.

@Component({
  selector: 'input-number',
  templateUrl: '../input-box.component.html',
  styleUrl: '../input-box.component.css'
})
export class InputNumberComponent extends InputBoxShComponent<number> {

  // viz '../(input-box.component).InputBoxComponent'
  public override converterFunc = (value: string) => {
    let num = parseInt(value);

    if (num === Number.NaN)
      return undefined;

    return num;
  }

  // viz '../(input-box.component).InputBoxComponent'
  public override inputTextValidationFunc = (value: string) => {
    let digits: Array<string> = [];

    for (let i = 0; i <= 9; i++) {
      digits.push(i.toString());
    } // digits = ['0', '1', ... '9'];
    digits.push(...['+', '-', '.']);

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

export class InputNumElem extends InputBoxElem<number> { }
