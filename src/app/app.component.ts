import { Component, ViewChild } from '@angular/core';
import { IBoundsStyle } from './boundsStyle/boundsStyleInterface';
import { GridService } from './grid/grid.service';
import { GridComponent } from './grid/grid.component';
import { CellService } from './cell/cell.service';
import { IBValueChangeArgs } from './input-box/input-box.component';

// Komponent 'AppComponent' je kontejnerem celého uživatelského rozhraní.
//
// implementuje rozhraní
//    viz './boundsStyle/boundsStyleInterface.IBoundsStyle'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements IBoundsStyle {

  // zpřístupní hrací pole, aby se k němu dalo přistupovat i v dětských komponentech
  // výchozí je hodnota undefined (bezpečnější je ke komponentu přistupovat skrze vlastnost 'this.grid'); komponent je zde uložen
  // okamžitě po jeho inicializaci
  @ViewChild(GridComponent, { static: true }) gridChild!: GridComponent | undefined;

  // objekt hracího pole
  public get grid(): GridComponent | undefined {
    return this.gridChild;
  }

  // id hracího pole
  // nabývá hodnoty -1, pokud je objekt undefined
  public get gridId() {
    if (this.grid === undefined)
      return -1;

    return this.grid.id;
  }

  // pole funkcí, které mohou externě nastavit šířku hracího pole './grid/(grid.component).GridComponent'
  public get setGridWidthFuncs(): Array<(sender: object | undefined, args: IBValueChangeArgs<number>) => void> {
    if (this.grid !== undefined)
      return [this.grid.setWidthExt];
    else
      return [(sender: object | undefined, args: IBValueChangeArgs<number>) => { }];
  }

  // pole funkcí, které mohou externě nastavit výšku hracího pole './grid/(grid.component).GridComponent'
  public get setGridHeightFuncs(): Array<(sender: object | undefined, args: IBValueChangeArgs<number>) => void> {
    if (this.grid !== undefined)
      return [this.grid.setHeightExt];
    else
      return [(sender: object | undefined, args: IBValueChangeArgs<number>) => { }];
  }

  // pole funkcí, které mohou externě nastavit počet znaků jdoucích za sebou potřebných k výhře v hracím poli './grid/(grid.component).GridComponent'
  public get setInRowFuncs(): Array<(sender: object | undefined, args: IBValueChangeArgs<number>) => void> {
    if (this.grid !== undefined)
      return this.gridService.getInRowSetFuncs(this.grid);

    return [];
  }

  // továrna na './cell/cell.CheckWinManager' viz './grid/(grid.service).GridService.createChWM'
  public createChWM = () => {
    if (this.grid !== undefined)
      return this.gridService.createChWM(this.grid);

    return undefined;
  }

  // šířka hrací plochy v pixelech (plocha zahrnující hrací pole a tlačítko restart)
  public get PlayAreaPxWidth(): number {
    let pxw = GridService.getGridById(this.gridId)?.pxWidth;

    if (pxw !== undefined)
      return pxw;
    else
      return 481;
  }

  // zápis stylu šířky do řetězce, který může být předán jako hodnota atributu 'style' v HTML kontextu
  public get boundsStyle() {
    return "width: " + this.PlayAreaPxWidth + "px;";
  }

  constructor(protected gridService: GridService, private cellService: CellService) {

  }
}
