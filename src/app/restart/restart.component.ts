import { Component, HostListener, Input } from '@angular/core';
import { GridService } from '../grid/grid.service';

@Component({
  selector: 'restart',
  templateUrl: './restart.component.html',
  styleUrl: './restart.component.css'
})
// povinné atributy:
//    [gridId]: number
export class RestartComponent {

  // musí být nastaveno jako atribut
  @Input() public gridId!: number;

  protected innerHtml: string = "Restart";

  constructor(private gridService: GridService) {

  }

  @HostListener('click') onClick() {
    let grid = GridService.getGridById(this.gridId);

    if (grid !== undefined)
      this.gridService.clearAndSetUpGrid(grid);
  }
}
