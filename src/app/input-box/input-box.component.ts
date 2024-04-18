import { Component, Input } from '@angular/core';
import { Event } from '../../eventHandler/event';
import { IClassManagement } from '../../styleClassManagement/classManagementInterface';
import { ClassManagementService } from '../../styleClassManagement/class-management.service';

// Komponent 'InputBoxComponent' je základem komponentu vstupního textového řádku, do kterého se dá vložit hodnota ze strany uživatele
// a následně jde provést kontrolu validity vložené hodnoty.
//
// Tento komponent je generický, a tudíž jeho použití v této základní formě nemá smysl. Slouží jako základ odvozeným komponentům, kreré nabývají
// na významu tehdy, když je specifikován typ hodnoty, jež budou přijímat, a funkce pro ověřování a převod hodnoty ve formě vstupního textu.
//
// T: typ hodnoty, pro kterou je komponent určen
//
// implementuje rozhraní
//    viz '../../styleClassManagement/classManagementInterface'
//
// povinné atributy:
//    [defValue]: string
//    [labelText]: string
//    [usedId]: string
//
// nepovinné atributy:
//    [subscriberFuncs]: Array<(sender: object | undefined, args: IBValueChangeArgs<T>) => void>
//    [additionalArgsFactory]: () => any
//    [valueValidationFunc]: (value: T | undefined) => boolean
//    [converterFunc]: (value: string) => T | undefined
//    [inputTextValidationFunc]: (value: string) => boolean

@Component({
  selector: 'input-box',
  templateUrl: './input-box.component.html',
  styleUrl: './input-box.component.css',
})
export class InputBoxComponent<T> implements IClassManagement {

  // hodnota, která je na zašátku zobrazena na místě textového vstupu
  // povinnost nastavit skrze stejnojmenný atribut tohoto komponentu (dynamická hodnota)
  // hodnota dynamicky předána atributu 'value' v šabloně tohoto komponentu
  // když je změněna, aktuální hodnota přepíše, cokoli je aktuální zobrazenou textovou hodnotou (která mohla být nastavena uživatelem)
  @Input() public defValue!: string;

  // zobrazí text do vstupního textového řádku
  public displayMessage(message: string) {
    this.defValue = message;
  }

  // štítek pro komponentu
  // povinnost nastavit skrze stejnojmenný atribut tohoto komponentu (dynamická hodnota)
  // použito v dynamickém kontextu jako text štítku pro input element v šabloně tohoto komponentu
  private _labelText: string = '';
  public get labelText() { return this._labelText; }
  @Input() public set labelText(value: string) { this._labelText = value; }

  // atribut id pro dvojici štítku a inputu
  // povinnost nastavit skrze stejnojmenný atribut tohoto komponentu (dynamická hodnota)
  // hodnota dynamicky předána atributu 'for' štítku a 'id' inputu v šabloně tohoto komponentu
  private _useId: string = '';
  public get useId() { return this._useId; }
  @Input() public set useId(value: string) { this._useId = value; }

  // pole v reálném čase obsahující stylové třídy, které se mají aplikovat
  private _classes: Array<string> = [];
  // viz '../../styleClassManagement/classManagementInterface.IClassManagement'
  public get classes() { return [...this._classes]; }
  // viz '../../styleClassManagement/classManagementInterface.IClassManagement'
  private set classes(value: Array<string>) {
    this._classes = value;
  }

  // stylové třídy zformátuje a uloží je do pole 'this.classString'
  // viz '../../styleClassManagement/classManagementInterface.IClassManagement'
  public toggleClasses() {
    this.classString = this.cmService.formatClasses(this.classes);
  }

  // řetězec všech dynamicky operovaných tříd v reálném čase pro atribut 'class' v HTML kontextu
  protected classString = "";

  // učiní komponent nevalidním (hlavně z vizuálního hlediska)
  public invalidate() {
    this.cmService.addClasses(this, ["input-num-invalid"]);
    this.cmService.removeClasses(this, ["input-num-valid"]);
  }

  // učiní komponent validním (hlavně z vizuálního hlediska)
  public validate() {
    this.cmService.addClasses(this, ["input-num-valid"]);
    this.cmService.removeClasses(this, ["input-num-invalid"]);
  }

  // pole pro objekt s pravidly pro validaci zadané hodnoty
  // může být přepsáním specifikován a použit v odvozených komponentech
  public readonly valueRegulations: any = null;

  // pole s aktuální zadanou, validovanou a převedenou hodnotou
  private _value: T | undefined;
  public get value() { return this._value; }
  private set value(value: T | undefined) {
    let previous = this._value;

    this._value = value;

    if (this.value !== previous)
      this.valueChanged({ value: this.value, additionalArgs: this.additionalArgsFactory()});
  }

  // událost nastávající tehdy, když se změní hodnota 'this._value' skrze set vlasnost 'this.value'
  public valueChange: Event<IBValueChangeArgs<T>> = new Event();
  private valueChanged(args: IBValueChangeArgs<T>) {
    this.valueChange.invoke(this, args);
  }

  // pole funkcí které se volají, když nastane událost 'this.valueChange'
  // k registraci změny dojde pouze, když je hodnota nastavena skrze set vlastnost 'this.subscriberFuncs'
  private _subscriberFuncs: Array<(sender: object | undefined, args: IBValueChangeArgs<T>) => void> = []
  public get subscriberFuncs() { return this._subscriberFuncs; }
  // možnost nastavit skrze stejnojmenný atribut tohoto komponentu (dynamická hodnota)
  @Input() public set subscriberFuncs(value: Array<(sender: object | undefined, args: IBValueChangeArgs<T>) => void>) {
    this.valueChange.removeSubscribers(this.subscriberFuncs);

    this._subscriberFuncs = value;

    this.valueChange.addSubscribers(this.subscriberFuncs);
  };

  // továrna na vytváření argumentů pro vlastnost 'additionalArgs' parametru 'args' funkcí 'this.subscriberFuncs' 
  // možnost nastavit skrze stejnojmenný atribut tohoto komponentu (dynamická hodnota)
  @Input() public additionalArgsFactory: () => any = () => {
    return { };
  }

  // metoda pro validaci dříve textové hodnoty nyní převedené do typu 'T' metodou 'this.converterFunc'
  // může být přepsáním specifikována a použita v odvozených komponentech
  // možnost nastavit skrze stejnojmenný atribut tohoto komponentu (dynamická hodnota)
  @Input() public valueValidationFunc: (value: T | undefined) => boolean = (value: T | undefined) => { return true; }

  // metoda pro převod z už ověřené textové hodnoty do hodnoty typu 'T'
  // může být přepsáním specifikována a použita v odvozených komponentech
  // možnost nastavit skrze stejnojmenný atribut tohoto komponentu (dynamická hodnota)
  @Input() public converterFunc: (value: string) => T | undefined = (value: string) => { return undefined; };

  // metoda, pro validaci surového textu, propouštějící pouze ty hodnoty, které mohou být převedeny na hodnotu typu 'T' metodou 'this.converterFunc'
  // může být přepsáním specifikována a použita v odvozených komponentech
  // možnost nastavit skrze stejnojmenný atribut tohoto komponentu (dynamická hodnota)
  @Input() public inputTextValidationFunc: (value: string) => boolean = (value: string) => { return true; };

  // textová hodnota, která už prošla procesem kontroly; metodou 'this.inputTextValidationFunc'
  private _checkedText: string = '';
  public get checkedText() { return this._checkedText; }
  private set checkedText(value: string) {
    this._checkedText = value;

    this.value = this.converterFunc(this.checkedText);
  }

  // zkontroluje surovou textovou hodnotu a podle výsledku provede odpovídající akce
  // validní -> viz 'this.validate'
  // nevalidní -> viz 'this.invalidate'
  public check() {
    if (this.isValid)
      this.validate();
    else
      this.invalidate();
  }

  // surová textová hodnota v reálném čase odpovídající vstupní textové hodnotě zadané uživatelem
  // při každé změně projde procesem validace a případně se ve své převedené formě propíše do 'this.value'
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

  // vlastnost určující, zdali je hodnota způsobilá projít procesem kontroly, převodu na typ 'T' a zapsání do 'this.value'
  public get isValid() {
    if (this.inputTextValidationFunc(this.text) && this.valueValidationFunc(this.converterFunc(this.text)))
      return true;

    return false;
  }

  // volá se pokaždé, když uživatel uvolní klávesu; tzn. provede změnu ve vstupní hodnotě
  // dynamicky navázána na událost 'keyup' v šabloně tohoto komponentu
  public onKeyUp = (target: EventTarget | null) => {
    if (target !== null) {
      const elem = target as HTMLInputElement;
      let value = elem.value;
      this.text = value;
    }
  }

  public constructor(protected cmService: ClassManagementService) {
    this.cmService.addClasses(this, ["input-num-valid"]);
  }
}

// pomocný typ používaný pro zapouzdření argumentů pro parametr 'args' funkcí 'InputBoxComponent.subscriberFuncs'
export type IBValueChangeArgs<T> = {
  value: T | undefined,
  additionalArgs: any
}
