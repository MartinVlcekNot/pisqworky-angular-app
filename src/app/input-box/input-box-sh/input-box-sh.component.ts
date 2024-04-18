import { Component, Input } from '@angular/core';
import { IBValueChangeArgs, InputBoxComponent } from '../input-box.component';

@Component({
  selector: 'app-input-box-sh',
  templateUrl: '../input-box.component.html',
  styleUrl: '../input-box.component.css'
})
export class InputBoxShComponent<T> extends InputBoxComponent<T> {

  @Input() public set data(value: InputBoxElem<T>) {
    this.labelText = value.labelText;
    this.defValue = value.defValue;
    this.useId = value.usedId;

    if (value.subscriberFuncs) this.subscriberFuncs = value.subscriberFuncs;
    if (value.additionalArgsFactory) this.additionalArgsFactory = value.additionalArgsFactory;
    if (value.valueValidationFunc) this.valueValidationFunc = value.valueValidationFunc;
    if (value.converterFunc) this.converterFunc = value.converterFunc;
    if (value.inputTextValidationFunc) this.inputTextValidationFunc = value.inputTextValidationFunc;
  }
}

export class InputBoxElem<T> {

  // povinné
  labelText: string;
  defValue: string;
  usedId: string;

  // nepovinné
  subscriberFuncs?: Array<(sender: object | undefined, args: IBValueChangeArgs<T>) => void>;
  additionalArgsFactory?: () => any;
  valueValidationFunc?: (value: T | undefined) => boolean;
  converterFunc?: (value: string) => T | undefined;
  inputTextValidationFunc?: (value: string) => boolean;

  constructor(labelText: string, defValue: string, usedId: string) {
    this.labelText = labelText;
    this.defValue = defValue;
    this.usedId = usedId;
  }
}
