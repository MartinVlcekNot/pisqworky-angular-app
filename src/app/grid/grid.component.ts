import { Component, Input } from '@angular/core';
import { GridService } from './grid.service';
import { GridRow } from './gridRow/gridRow';
import { Event } from '../../eventHandler/event';
import { IBoundsStyle } from '../boundsStyle/boundsStyleInterface';
import { CellService } from '../cell/cell.service';
import { PlayerDirector } from '../player/playerDirector';
import { ClassManagementService } from '../../styleClassManagement/class-management.service';
import { IBValueChangeArgs } from '../input-box/input-box.component';
import { SymbolActionStack } from '../player/symbolActionStack';

// Komponent 'GridComponent' je tabulka (dále používáno spíše "mřížka") komponentů '../cell/cell-shell/(cell-shell.component).CellShellComponent'
// sloužící jako hrací pole.
// Je reprezentována značkou '<grid>' použitou v souboru '../app.component.html'.
//
// Implementuje rozhraní
//    viz '../boundsStyleInterface.IBoundsStyle'.

@Component({
  selector: 'grid',
  templateUrl: './grid.component.html',
  styleUrl: './grid.component.css'
})
export class GridComponent implements IBoundsStyle {

  // id přiřazené této mřížce
  public get id() {
    return GridService.getGridId(this);
  }

  // počet sloupců mřížky
  private _width: number | undefined;
  public get width(): number {
    if (this._width === undefined) {
      this.width = this.gridService.defaultWidth;
    }

    if (this._width !== undefined)
      return this._width;

    return 0;
  }
  public set width(value: number | undefined) {
    let previous = this._width;

    this._width = value;

    if (this.width !== previous)
      this.widthChanged(this.width);
  }

  // událost nastávající tehdy, když se změní hodnota 'this._width' skrze set vlastnost 'this.width'
  public widthChange: Event<{ widthValue: number }> = new Event();
  protected widthChanged(curWidth: number) {
    this.widthChange.invoke(this, { widthValue: curWidth });
  }

  // přídavná metoda pro eventhandler v komponentu '../input-box/(input-box.component).InputBoxComponent'
  // může externě nastavit 'this.width'
  public setWidthExt = (sender: object | undefined, args: IBValueChangeArgs<number>) => {
    this.width = args.value;
  }

  // šířka komponentu v pixelech
  public get pxWidth() {
    return this.width * this.cellService.cellBounds + 1;
  }

  // počet řádků mřížky
  private _height: number | undefined;
  public get height(): number {
    if (this._height === undefined) {
      this.height = this.gridService.defaultHeight;
    }

    if (this._height !== undefined)
      return this._height;

    return 0;
  }
  public set height(value: number | undefined) {
    let previous = this._height;

    this._height = value;

    if (this.height !== previous) {
      this.heightChanged(this.height);
    }
  }

  // událost nastávající tehdy, když se změní hodnota 'this._height' skrze set vlasnost 'this.height'
  public heightChange: Event<{ heightValue: number }> = new Event();
  protected heightChanged(curHeight: number) {
    this.heightChange.invoke(this, { heightValue: curHeight });
  }
  protected onHeightChanged = (sender: object | undefined, args: { heightValue: number }) => {
    this.gridService.adjustRow<GridRow, GridComponent>(this.grid, args.heightValue, this.gridService.gridRowFactory, this);
  }

  // přídavná metoda pro eventhandler v komponentu '../input-box/(input-box.component).InputBoxComponent'
  // může externě nastavit 'this.height'
  public setHeightExt = (sender: object | undefined, args: IBValueChangeArgs<number>) => {
    this.height = args.value;
  }

  // výška komponentu v pixelech
  public get pxHeight() {
    return this.height * this.cellService.cellBounds + 1;
  }

  // zápis stylu šířky a výšky do řetězce, který může být předán jako hodnota atributu 'style' v HTML kontextu
  // viz '../boundsStyle.boundsStyleInterface.IBoundsStyle'
  public get boundsStyle() {
    return "width: " + this.pxWidth + "px; height: " + this.pxHeight + "px;";
  }

  // mřížka chápaná jako množina řádků mřížky './gridRow/gridRow.GridRow'
  private _grid: Array<GridRow> = [];
  public get grid() { return this._grid; }
  protected set grid(value: Array<GridRow>) { this._grid = value; }

  // hráč na tahu v konkrétní mřížce
  public readonly playerDirector: PlayerDirector;

  public readonly symbolActionStack: SymbolActionStack;

  // přepne hráče na tahu
  public switchPlayer() {
    this.playerDirector.switchPlayer();
  }

  // nastaví hráče na tahu na výchozí hodnotu viz '../player/player.Player';
  public resetPlayer() {
    this.playerDirector.resetPlayer();
  }

  public constructor(public gridService: GridService, public cellService: CellService, public cmService: ClassManagementService) {
    // vygeneruje unikátní id pro konkrétní mřížku a registruje ji
    let id = this.gridService.uniqueId;
    GridService.idGridBase.push({ id: id, inst: this });
    //

    this.playerDirector = new PlayerDirector(this);
    this.symbolActionStack = new SymbolActionStack(this);

    this.heightChange.addSubscriber(this.onHeightChanged);

    this.width = gridService.defaultWidth;
    this.height = gridService.defaultHeight;
    this.playerDirector.setUp();
  }
}
