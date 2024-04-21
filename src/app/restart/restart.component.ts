import { Component, Input } from '@angular/core';
import { GridService } from '../grid/grid.service';

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
export class RestartComponent {

  // id hracího pole '../grid/(grid.component).GridComponent', kde bude prováděn restart hry
  // povinnost nastavit skrze stejnojmenný atribut tohoto komponentu (dynamická hodnota)
  @Input() public gridId!: number;

  // text tlačítka
  // hodnota dynamicky předána do 'innerHTML' tlačítka v šabloně tohoto komponentu
  protected innerHtml: string = "Restart";

  constructor(private gridService: GridService) {

  }

  // navázáno na událost 'click' v šabloně tohoto komponentu
  protected onClick() {
    let grid = GridService.getGridById(this.gridId);
    console.log(grid);
    if (grid)
      this.gridService.clearAndSetUpGrid(grid);
  }
}
