import { Component, ElementRef, HostBinding, OnInit, ViewChild } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { Square } from 'src/app/models/grid';
import { Cannon } from 'src/app/models/tower';
import { ISquareComponent } from '../interfaces/ISquareComponent';
import { gsap } from 'gsap';
import { CurrentGameService } from 'src/app/services/current-game.service';
import { Enemy } from 'src/app/models/enemy';

@Component({
  selector: 'app-cannon',
  templateUrl: './cannon.component.html',
  styleUrls: ['./cannon.component.scss']
})
export class CannonComponent implements OnInit, ISquareComponent {
  square?: Square;
  @HostBinding("style.background-color") backgroundColor:string = "";

  @ViewChild("turret") turret!: ElementRef<HTMLElement>;

  intervalSubscription!: Subscription;

  constructor(private currentGameService: CurrentGameService) { }

  ngOnInit(): void {
    let cannon: Cannon = this.square?.tower as Cannon;
    this.backgroundColor = CannonComponent.getCannonColor(cannon);

    this.intervalSubscription = interval(1000 / cannon.speed)
      .subscribe(() => this.fire());
  }

  static getCannonColor(cannon: Cannon): string {
    return `rgb(${cannon.power * 255 / 5}, ${cannon.range * 255 / 5}, ${cannon.speed * 255 / 5})`;
  }

  fire() {
    let cannon: Cannon = this.square?.tower as Cannon;

    let inRange: Square[] = this.currentGameService.currentGrid.emptySquaresInRange(this.square!, cannon.range * 5);
    inRange = inRange.filter(x => x.enemies.length > 0);
    
    if(!inRange.length) {
      return;
    }

    let target: Square = inRange[0].nextSquare;

    let angle = 57.296 * Math.atan2(target.y - this.square!.y, target.x - this.square!.x);
    
    gsap.set(this.turret.nativeElement, {
      rotation: angle,
      duration: 0.1,
      ease: "none"
    });

    this.reallyFire(inRange[0].enemies[0]);
  }

  reallyFire(enemy: Enemy) {
    this.currentGameService.fire(this.square!, enemy);
  }
}
