import { Component, Input } from '@angular/core';
import { GridService } from '../grid/grid.service';
import { IGridDependent } from '../grid/gridCellInterface';
import { GridComponent } from '../grid/grid.component';

// Komponent 'RestartComponent' je tlačítko pužívané na restartování hry v hracím poli '../grid/(grid.component).GridComponent' určené podle
// jejího id uchovaného v tomto komponentu.
//
// povinné atributy:
//    [gridId]: number

@Component({
  selector: 'restart',
  templateUrl: './restart.component.html',
  styleUrl: './restart.component.css'
})
export class RestartComponent implements IGridDependent {

  // id hracího pole '../grid/(grid.component).GridComponent', kde bude prováděn restart hry
  // povinnost nastavit skrze stejnojmenný atribut tohoto komponentu (dynamická hodnota)
  @Input() public gridId!: number;

  public get grid(): GridComponent | undefined {
    return GridService.getGridById(this.gridId);
  }

  // text tlačítka
  // hodnota dynamicky předána do 'innerHTML' tlačítka v šabloně tohoto komponentu
  protected innerHtml: string = "Restart";

  constructor(private gridService: GridService) {

  }

  // navázáno na událost 'click' v šabloně tohoto komponentu
  protected onClick() {
    if (this.grid)
      this.gridService.clearAndSetUpGrid(this.grid);
  }
}
