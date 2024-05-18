import { IClassManagement } from "./classManagementInterface";

export interface IOneRoundClass extends IClassManagement {

  addOneRoundClasses(classes: Array<string>): void;
}
