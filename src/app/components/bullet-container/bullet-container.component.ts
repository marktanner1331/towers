import { Component, ElementRef, OnInit, ViewEncapsulation } from '@angular/core';
import { Enemy } from 'src/app/models/enemy';
import { Square } from 'src/app/models/grid';
import { Cannon, Tower, TowerType } from 'src/app/models/tower';
import { CurrentGameService } from 'src/app/services/current-game.service';
import { GameResizeService } from 'src/app/services/game-resize.service';
import { CannonComponent } from '../cannon/cannon.component';
import { gsap } from 'gsap';

@Component({
  selector: 'app-bullet-container',
  templateUrl: './bullet-container.component.html',
  styleUrls: ['./bullet-container.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BulletContainerComponent implements OnInit {
  constructor(
    private currentGameService: CurrentGameService,
    private elementRef: ElementRef<HTMLElement>,
    private gameResizeService: GameResizeService) {
    currentGameService.bulletEmitter.subscribe(x => this.emitBullet(x.square, x.enemy));
  }

  ngOnInit(): void {
  }

  emitBullet(square: Square, enemy: Enemy) {
    let html = this.getBulletHtml(square.tower!);
    this.elementRef.nativeElement.insertAdjacentHTML('beforeend', html);

    let bulletElement = this.elementRef.nativeElement.querySelector("* > div:last-of-type")!;
    
    let x = (square.x + 0.5) * this.gameResizeService.singleSquareWidth;
    let y = (square.y + 0.5) * this.gameResizeService.singleSquareHeight;
    gsap.set(bulletElement, {
      x: x,
      y: y
    });

    x = (enemy.currentSquare.nextSquare.x + 0.5) * this.gameResizeService.singleSquareWidth;
    y = (enemy.currentSquare.nextSquare.y + 0.5) * this.gameResizeService.singleSquareHeight;

    gsap.to(bulletElement, {
      duration: 0.5,
      x: x,
      y: y,
      ease: "none"
    });
  }

  getBulletHtml(tower: Tower) {
    switch(tower.type) {
      case TowerType.CANNON:
        let color = CannonComponent.getCannonColor((tower as Cannon));
        return `<div class="bullet" style="background-color: ${color}"></div>`;
        break;
      default:
        throw new Error("Cannot create bullet for tower: " + TowerType[tower.type]);
    }
  }
}
