import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GridComponent } from './grid/grid.component';
import { GridService } from './grid/grid.service';
import { CellService } from './cell/cell.service';
import { CellShellComponent } from './cell/cell-shell/cell-shell.component';
import { RestartComponent } from './restart/restart.component';
import { InputBoxComponent } from './input-box/input-box.component';
import { InputNumberComponent } from './input-box/input-number/input-number.component';
import { GameOptionsComponent } from './game-options/game-options.component';
import { ClassManagementService } from '../styleClassManagement/class-management.service';
import { InputBoxShComponent } from './input-box/input-box-sh/input-box-sh.component';

@NgModule({
  declarations: [
    AppComponent,
    GridComponent,
    CellShellComponent,
    RestartComponent,
    InputBoxComponent,
    InputNumberComponent,
    GameOptionsComponent,
    InputBoxShComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    provideClientHydration(),
    GridService,
    CellService,
    ClassManagementService
  ],
  bootstrap: [AppComponent]
})

export class AppModule {

}
