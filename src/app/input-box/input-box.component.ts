import { Component, Input } from '@angular/core';
import { Event } from '../../eventHandler/event';
import { IClassManagement } from '../../styleClassManagement/classManagementInterface';
import { ClassManagementService } from '../../styleClassManagement/class-management.service';
import { GridService } from '../grid/grid.service';

@Component({
  selector: 'input-box',
  templateUrl: './input-box.component.html',
  styleUrl: './input-box.component.css',
})
// povinné atributy:
//    [defValue]: string
//    [labelText]: string
//    [usedId]: string
//
// nepovinné atributy:
//    [subscriberFunc]: (sender: object | undefined, args: { inRowValue: T | undefined, additionalArgs: AddArgs }) => void
//    [additionalArgsFactory]: () => AArgs | undefined
//    [valueValidationFunc]: (value: T | undefined) => boolean
//    [converterFunc]: (value: string) => T | undefined
//    [inputTextValidationFunc]: (value: string) => boolean
export class InputBoxComponent<T> implements IClassManagement {

  @Input() public defValue!: string;

  public displayMessage(message: string) {
    this.defValue = message;
  }

  private _labelText: string = '';
  public get labelText() { return this._labelText; }
  @Input() public set labelText(value: string) { this._labelText = value; }

  private _useId: string = '';
  public get useId() { return this._useId; }
  @Input() public set useId(value: string) { this._useId = value; }

  private _classes: Array<string> = [];
  public get classes() { return [...this._classes]; }
  private set classes(value: Array<string>) {
    this._classes = value;

    this.toggleClasses();
  }

  public toggleClasses() {
    this.classString = this.cmService.formatClasses(this.classes);
  }

  protected classString = "";

  public invalidate() {
    this.cmService.addClasses(this, ["input-num-invalid"]);
    this.cmService.removeClasses(this, ["input-num-valid"]);
  }

  public validate() {
    this.cmService.addClasses(this, ["input-num-valid"]);
    this.cmService.removeClasses(this, ["input-num-invalid"]);
  }

  public static readonly valueRange = { bottomExcl: 0, topIncl: 40 };

  private _value: T | undefined;
  public get value() { return this._value; }
  private set value(value: T | undefined) {
    let previous = this._value;

    this._value = value;

    if (this.value !== previous)
      this.valueChanged({ value: this.value, additionalArgs: this.additionalArgsFactory()});
  }

  public valueChange: Event<IBValueChangeArgs<T>> = new Event();
  private valueChanged(args: IBValueChangeArgs<T>) {
    this.valueChange.invoke(this, args);
  }

  private _subscriberFuncs: Array<(sender: object | undefined, args: IBValueChangeArgs<T>) => void> = []
  public get subscriberFuncs() { return this._subscriberFuncs; }
  // může být předána skrze atribut
  @Input() public set subscriberFuncs(value: Array<(sender: object | undefined, args: IBValueChangeArgs<T>) => void>) {
    this.valueChange.removeSubscribers(this.subscriberFuncs);

    this._subscriberFuncs = value;

    this.valueChange.addSubscribers(this.subscriberFuncs);
  };

  // může být předána skrze atribut
  @Input() public additionalArgsFactory: () => any = () => {
    return undefined;
  }

  // může být předána skrze atribut
  @Input() public valueValidationFunc: (value: T | undefined) => boolean = (value: T | undefined) => { return true; }

  // může být předána skrze atribut
  @Input() public converterFunc: (value: string) => T | undefined = (value: string) => { return undefined; };

  private _checkedText: string = '';
  public get checkedText() { return this._checkedText; }
  private set checkedText(value: string) {
    this._checkedText = value;

    this.value = this.converterFunc(this.checkedText);
  }

  public check() {
    if (this.isValid)
      this.validate();
    else
      this.invalidate();
  }

  private _text: string = '';
  public get text() { return this._text; }
  public set text(value: string) {
    this._text = value;

    if (this.isValid) {
      this.validate();
      this.checkedText = this.text;
    }
    else {
      this.invalidate();
    }
  }

  // může být předána skrze atribut
  @Input() public inputTextValidationFunc: (value: string) => boolean = (value: string) => { return true; };

  public get isValid() {
    if (this.inputTextValidationFunc(this.text) && this.valueValidationFunc(this.converterFunc(this.text)))
      return true;

    return false;
  }

  public onKeyUp = (target: EventTarget | null) => {
    if (target !== null) {
      const elem = target as HTMLInputElement;
      let value = elem.value;
      this.text = value;
    }
  }

  public constructor(private cmService: ClassManagementService) {
    this.cmService.addClasses(this, ["input-num-valid"]);
  }
}

export type IBValueChangeArgs<T> = {
  value: T | undefined,
  additionalArgs: any
}
