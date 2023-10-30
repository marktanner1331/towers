import { ChangeDetectorRef, Component, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { EnemyType } from 'src/app/models/enemy';
import { GameCommandType } from 'src/app/models/GameCommand';
import { Square } from 'src/app/models/grid';
import { SquareType } from 'src/app/models/square-type';
import { TowerType } from 'src/app/models/tower';
import { CurrentGameService } from 'src/app/services/current-game.service';

@Component({
  selector: 'app-game-info-panel',
  templateUrl: './game-info-panel.component.html',
  styleUrls: ['./game-info-panel.component.scss']
})
export class GameInfoPanelComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  currentSquareType: SquareType = SquareType.EMPTY;
  currentTowerType: TowerType = TowerType.CANNON;

  TowerType: typeof TowerType = TowerType;
  SquareType: typeof SquareType = SquareType;

  constructor(
    private currentGameService: CurrentGameService,
    private cdr: ChangeDetectorRef) { }
  
  ngOnInit(): void {
    this.cdr.detach();

    this.subscription = this.currentGameService.subscribe(x => {
      switch (x.type) {
        case GameCommandType.EMPTY_SQUARE_CLICK:
          let square: Square = x.data;
          switch(this.currentSquareType) {
            case SquareType.WALL:
              this.currentGameService.currentGrid.addWall(square.x, square.y);
              break;
            case SquareType.TOWER:
              this.currentGameService.currentGrid.addTower(square.x, square.y, this.currentTowerType);
              break;
          }
      }
    })
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onWallClick() {
    this.currentSquareType = SquareType.WALL;
    this.cdr.detectChanges();
  }

  onTowerClick() {
    this.currentSquareType = SquareType.TOWER;
    this.currentTowerType = TowerType.CANNON;
    this.cdr.detectChanges();
  }

  onSendClick() {
    this.currentGameService.createEnemy(EnemyType.NORMAL);
  }
}
