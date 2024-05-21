import { GridComponent } from "./grid.component";

export interface IGridDependent {

  get grid(): GridComponent | undefined;
}
