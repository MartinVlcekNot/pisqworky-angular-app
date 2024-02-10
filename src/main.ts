import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

import { Player } from './app/player/player';
import { GridComponent } from './app/grid/grid.component';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

declare global {
  var player: Player;
  var grid: GridComponent | undefined;
}

globalThis.player = new Player();
