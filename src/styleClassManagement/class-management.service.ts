import { Injectable } from '@angular/core';
import { IClassManagement } from './classManagementInterface';

// Servis 'ClassManagementService' poskytuje metody pro operace s css třídami těch komponentů, které implementují rozhranní
// viz './classManagementInterface.IClassManagement'; metody pro snadné přidávání a odebírání stylových tříd z komponentů.
//
// dynamicky operované třídy = stylové (css) třídy, které se v čase často mění podle stavu komponentu

@Injectable({
  providedIn: 'root'
})
export class ClassManagementService {

  // upraví hodnotu atributu 'class' daného komponentu, aby všechny dynamicky operované stylové třídy seděly jejich aktuálnímu výčtu
  public toggleClasses(component: IClassManagement) {
    component.toggleClasses();
  }

  // přidá předané stylové třídy do daného komponentu;
  // třídy, co už v aktuálním výčtu jsou, se nepropíšou podruhé
  public addClasses(component: IClassManagement, classes: Array<string>, toggle: boolean = true): void {
    let notIncluded = classes.filter((currentClass) => {
      if (component.classes.includes(currentClass))
        return false;
      else
        return true;
    });

    let newArr = [...component.classes, ...notIncluded];

    component.classes = newArr;

    if (toggle)
      this.toggleClasses(component);
  }

  // odebere všechny výskyty předaných stylových tříd daného komponentu;
  // třídy, co už v aktuálním výčtu jsou, se nepropíšou podruhé
  public removeClasses(component: IClassManagement, classes: Array<string>, toggle: boolean = true): void {
    let newArr = component.classes.filter((currentClass) => {
      if (classes.includes(currentClass))
        return false;
      else
        return true;
    });

    component.classes = newArr;

    if (toggle)
      this.toggleClasses(component);
  }

  // odebere všechny dynamicky operované třídy daného komponentu;
  public clearClasses(component: IClassManagement, toggle: boolean = true): void {
    component.classes = [];

    if (toggle)
      this.toggleClasses(component);
  }

  // zformátuje pole tříd do řetězce, který vyhovuje formátu hodnoty atributu 'class'
  // "třída1 třída2 ..."
  public formatClasses(classes: Array<string>): string {
    let str = "";

    classes.forEach((classItem, index, arr) => {
      str += classItem;

      if (index < arr.length - 1)
        str += " ";
    });

    return str;
  }
}
