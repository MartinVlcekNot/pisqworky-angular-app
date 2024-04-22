import { ClassManagementService } from "./class-management.service";

// Dynamicky operované třídy viz './(class-mangement.service).ClassManagementService'.

export interface IClassManagement {

  // tato vlastnost by měla odkazovat na pole, kde jsou uložené dynamicky operované stylové třídy, s přístupem k čtení i zapisování
  // pole samotné není součástí tohoto rozhraní
  get classes(): Array<string>;
  set classes(value: Array<string>);

  // tato metoda by měla upravit hodnotu atributu 'class' daného objektu (komponentu), aby všechny dynamicky operované stylové třídy seděly
  // jejich aktuálnímu výčtu
  toggleClasses(): void;

  readonly classManagementService: ClassManagementService;
}
