import { Component, Input } from '@angular/core';
import { Cell } from '../cell';
import { CellService } from '../cell.service';
import { IBoundsStyle } from '../../boundsStyle/boundsStyleInterface';

// Komponent 'CellShellComponent' je pomyslnou grafickou a interakční stránkou pro celek buňky. Obsahuje instanci ../cell.Cell, která zapouzdřuje
// data a operace potřebné pro fungování tohoto komponentu jako celku.
// 'CellShellComponent' je dynamicky generován pomocí direktivy *ngFor v souboru '../../grid/grid.component.html'.
//
// Pro každý prvek '../../grid/gridRow/gridRow.GridRow' pole 'grid' v '../../grid/(grid.component).GridComponent' se vygeneruje
// odpovídající řada 'CellShellComponent'.
//
// Pro každý prvek '../cell.Cell' pole 'row' v '../../grid/gridRow/gridRow.GridRow' se vygeneruje právě jeden 'CellShellComponent',
// ve kterém se po dobu jeho existence bude přechovávat daná instance '../cell.Cell'.
//
// Implementuje rozhraní viz '../../boundsStyleInterface.IBoundsStyle'.

@Component({
  selector: 'cell-shell',
  templateUrl: './cell-shell.component.html',
  styleUrl: './cell-shell.component.css'
})
export class CellShellComponent implements IBoundsStyle {

  // instance ../cell.Cell
  // nastavuje se jako hodnota atributu 'cell' v šabloně tohoto komponentu (dynamická hodnota)
  private _cell: Cell | undefined;
  public get cell(): Cell | undefined { return this._cell };
  @Input() public set cell(value: Cell | undefined) {
    this._cell = value;

    if (this.cell !== undefined)
      this.cell.shell = this;
  }

  // řetězec všech dynamicky operovaných tříd v reálném čase pro atribut 'class' v HTML kontextu
  // dynamicky operované třídy viz '../../../styleClassManagement/(class-management.service).ClassManagementService'
  public classString: string = "";

  // řetězec všech neměnných tříd pro atribut class v HTML kontextu
  public static readonly baseClassString: string = "grid-cell";

  // řetězec všech tříd, proměnlivých i neměnných pro atribut class v HTML kontextu
  // hodnota dynamicky předána atributu 'class' v šabloně tohoto komponentu
  public get classes() {
    return CellShellComponent.baseClassString + " " + this.classString;
  }

  // symbol, který se zobrazí uprostřed vizuální reprezentace tohoto komponentu
  // předáno v dynamickém kontextu v šabloně tohoto komponentu
  public symbol: string = '';

  // viz rozhraní '../../boundsStyleInterface.IBoundsStyle'
  public get bounds() {
    return this.cellService.cellBounds;
  }

  // viz rozhraní '../../boundsStyleInterface.IBoundsStyle'
  public get boundsStyle() {
    return "width: " + this.bounds + "px; height: " + this.bounds + "px;";
  }

  constructor(private cellService: CellService) {

  }

  // pole typu funkce pro metodu zavolanou po kliknutí
  // navázáno na událost 'click' v šabloně tohoto komponentu
  public onClick: () => void = () => { };
}
