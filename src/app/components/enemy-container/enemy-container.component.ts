import { Component, ElementRef, OnInit, ViewEncapsulation } from '@angular/core';
import { gsap } from 'gsap';
import { Enemy, EnemyType } from 'src/app/models/enemy';
import { GameCommandType } from 'src/app/models/GameCommand';
import { Square } from 'src/app/models/grid';
import { CurrentGameService } from 'src/app/services/current-game.service';
import { GameResizeService } from 'src/app/services/game-resize.service';

@Component({
  selector: 'app-enemy-container',
  templateUrl: './enemy-container.component.html',
  styleUrls: ['./enemy-container.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EnemyContainerComponent implements OnInit {
  enemyModels: { [key: number]: Enemy } = {};
  enemyElements: { [key: number]: Element } = {};

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private currentGameService: CurrentGameService,
    private gameResizeService: GameResizeService) { }

  ngOnInit(): void {
    this.currentGameService.subscribe(command => {
      switch (command.type) {
        case GameCommandType.ENEMY_CREATED:
          this.enemyCreated(command.data);
          break;
      }
    });
  }

  enemyCreated(enemy: Enemy) {
    this.enemyModels[enemy.id] = enemy;

    let html = this.enemyHtmlFactory(enemy.type);
    this.elementRef.nativeElement.insertAdjacentHTML('beforeend', html);

    let enemyElement = this.elementRef.nativeElement.querySelector("* > div:last-of-type")!;
    this.enemyElements[enemy.id] = enemyElement;

    let x = enemy.currentSquare.x * this.gameResizeService.singleSquareWidth;
    let y = enemy.currentSquare.y * this.gameResizeService.singleSquareHeight;
    gsap.set(enemyElement, {
      x: x,
      y: y
    });

    this.animateEnemy(enemy.id);
  }

  animateEnemy(id: number) {
    let enemy: Enemy = this.enemyModels[id];
    enemy.timeline = gsap.timeline();
    
    let currentSquare: Square = enemy.currentSquare;
    while(currentSquare.nextSquare) {
      let distance: number = currentSquare.distanceToEnd - currentSquare.nextSquare.distanceToEnd;

      let x = currentSquare.nextSquare.x * this.gameResizeService.singleSquareWidth;
      let y = currentSquare.nextSquare.y * this.gameResizeService.singleSquareHeight;

      enemy.timeline.to(this.enemyElements[id]!, {
        x: x,
        y: y,
        ease: "none",
        duration: enemy.speed * distance
      });

      enemy.timeline.call(this.tweenFinished, [enemy]);

      currentSquare = currentSquare.nextSquare;
    }

    enemy.timeline.call(this.timelineFinished, [enemy]);
  }

  tweenFinished(enemy: Enemy) {
    let bearing: number = enemy.currentSquare.bearing;
    enemy.currentSquare.removeEnemy(enemy);
    enemy.currentSquare = enemy.currentSquare.nextSquare;
    enemy.currentSquare.addEnemy(enemy);
    enemy.currentSquareChanged.next();
    
    if(enemy.currentSquare.nextSquare && enemy.currentSquare.bearing != bearing) {
      enemy.directionChanged.next();
    } 
  }

  timelineFinished(enemy: Enemy) {
    enemy.reachedEnd.next();
  }

  enemyHtmlFactory(enemyType: EnemyType): string {
    switch (enemyType) {
      case EnemyType.NORMAL:
        return '<div class="normal"></div>';
    }
  }
}
