import { GridComponent } from "./grid.component";

export interface IGridCell {

  get grid(): GridComponent | undefined;
}
