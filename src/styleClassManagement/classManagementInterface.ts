export interface IClassManagement {

  get classes(): Array<string>;
  // tato set valstnost by zároveň měla obsahovat logiku, která dané třídy předá do atributu "class" daného komponentu
  set classes(value: Array<string>);

  toggleClasses(): void;
}
