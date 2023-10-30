import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GridComponent } from './components/grid/grid.component';
import { EnemyContainerComponent } from './components/enemy-container/enemy-container.component';
import { BulletContainerComponent } from './components/bullet-container/bullet-container.component';
import { GameComponent } from './components/game/game.component';
import { EmptySquareComponent } from './components/empty-square/empty-square.component';
import { SquareComponent } from './components/square/square.component';
import { WallComponent } from './components/wall/wall.component';
import { GameInfoPanelComponent } from './components/game-info-panel/game-info-panel.component';
import { CannonComponent } from './components/cannon/cannon.component';

@NgModule({
  declarations: [
    AppComponent,
    GridComponent,
    EnemyContainerComponent,
    BulletContainerComponent,
    GameComponent,
    EmptySquareComponent,
    SquareComponent,
    WallComponent,
    GameInfoPanelComponent,
    CannonComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
