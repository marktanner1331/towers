import { ChangeDetectorRef, Component, HostBinding, HostListener, Input, OnChanges, OnInit, SimpleChanges, SkipSelf } from '@angular/core';
import { GameCommandType } from 'src/app/models/GameCommand';
import { Square } from 'src/app/models/grid';
import { CurrentGameService } from 'src/app/services/current-game.service';
import { ISquareComponent } from '../interfaces/ISquareComponent';

@Component({
  selector: 'app-empty-square',
  templateUrl: './empty-square.component.html',
  styleUrls: ['./empty-square.component.scss']
})
export class EmptySquareComponent implements ISquareComponent, OnInit {
  square?: Square;

  // @HostBinding("style.background-color") get backgroundColor(): string {
  //   if (this.square) {
  //     return `rgb(${this.square.distanceToEnd * 10}, ${this.square.distanceToEnd * 10}, ${this.square.distanceToEnd * 10})`;
  //   } else {
  //     return "#000000";
  //   }
  // }

  constructor(
    //@SkipSelf() private parentCdr: ChangeDetectorRef,
    private currentGameService: CurrentGameService) { }

  ngOnInit(): void {
    // this.parentCdr.detach();
    // this.currentGameService.currentGrid.gridChanged.subscribe(() => {
    //   this.parentCdr.detectChanges();
    // });
  }

  @HostListener('click')
  onClick() {
    this.currentGameService.addEvent(GameCommandType.EMPTY_SQUARE_CLICK, this.square);
  }
}
