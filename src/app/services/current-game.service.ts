import { EventEmitter, Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { Enemy, EnemyFactory, EnemyType } from '../models/enemy';
import { GameCommand, GameCommandType } from '../models/GameCommand';
import { Grid, Square } from '../models/grid';

@Injectable({
  providedIn: 'root'
})
export class CurrentGameService {
  currentGrid: Grid;

  private events: EventEmitter<GameCommand> = new EventEmitter();
  public bulletEmitter: EventEmitter<{ square: Square, enemy: Enemy }> = new EventEmitter();

  constructor() {
    this.currentGrid = Grid.empty();
  }

  fire(square: Square, enemy: Enemy) {
    this.bulletEmitter.next({
      square: square,
      enemy: enemy
    });
  }

  createEnemy(type: EnemyType) {
    const enemy: Enemy = EnemyFactory.fromType(type);
    
    const start: Square = this.currentGrid.origin;
    enemy.currentSquare = start;
    start.addEnemy(enemy);

    this.addEvent(GameCommandType.ENEMY_CREATED, enemy);
  }

  subscribe(callback: (value: GameCommand) => void): Subscription {
    return this.events.subscribe(callback);
  }

  addEvent(type: GameCommandType, data: any = undefined) {
    let dataString: string;
    if(data.toString) {
      dataString = data.toString();
    } else {
      dataString = JSON.stringify(data);
    }

    console.log("adding event: " + GameCommandType[type] + " " + dataString); 
    this.events.next(new GameCommand(type, data));
  }

  newGame(grid: Grid) {
    this.currentGrid = grid;
  }
}
