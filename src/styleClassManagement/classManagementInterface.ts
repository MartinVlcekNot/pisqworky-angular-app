// Rozhranní 'IClassManagement' u objektu (komponentu) určuje, že styl daného objektu je ovlivněn mimo jiné dynamicky operovanými (css) třídami
//
// Dynamicky operované třídy viz './(class-mangement.service).ClassManagementService'.

export interface IClassManagement {

  // tato vlastnost by měla odkazovat na pole, kde jsou uložené dynamicky operované stylové třídy, s přístupem k čtení i zapisování
  // pole samotné není součástí tohoto rozhranní
  get classes(): Array<string>;
  set classes(value: Array<string>);

  // tato metoda by měla upravt hodnotu atributu 'class' daného objektu (komponentu), aby všechny dynamicky operované stylové třídy seděly
  // jejich aktuálnímu výčtu
  toggleClasses(): void;
}
