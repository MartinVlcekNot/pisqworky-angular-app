import { Injectable } from '@angular/core';
import { IClassManagement } from './classManagementInterface';

@Injectable({
  providedIn: 'root'
})
export class ClassManagementService {

  constructor() { }

  public addClasses(component: IClassManagement, classes: Array<string>): void {
    let notIncluded = classes.filter((currentClass) => {
      if (component.classes.includes(currentClass))
        return false;
      else
        return true;
    });

    let newArr = [...component.classes, ...notIncluded];

    component.classes = newArr;
  }

  public removeClasses(component: IClassManagement, classes: Array<string>): void {
    let newArr = component.classes.filter((currentClass) => {
      if (classes.includes(currentClass))
        return false;
      else
        return true;
    });

    component.classes = newArr;
  }

  public clearClasses(component: IClassManagement): void {
    component.classes = [];
  }

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
