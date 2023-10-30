import { EventEmitter, Injectable } from '@angular/core';
import { CurrentGameService } from './current-game.service';
import { StyleSheet } from '../models/StyleSheet';

@Injectable({
  providedIn: 'root'
})
export class GameResizeService {
  public gridWidth: number = 0;
  public gridHeight: number = 0;

  public singleSquareWidth: number = 0;
  public singleSquareHeight: number = 0;

  private stylesheet: StyleSheet = new StyleSheet();

  onResize: EventEmitter<void> = new EventEmitter();

  constructor(private currentGameService: CurrentGameService) {
  }

  gridResized(width: number, height: number) {
    this.gridWidth = width;
    this.gridHeight = height;

    this.singleSquareWidth = width / this.currentGameService.currentGrid.width;
    this.singleSquareHeight = height / this.currentGameService.currentGrid.height;

    this.stylesheet.addVariable("--singleSquareWidth", this.singleSquareWidth + "px");
    this.stylesheet.addVariable("--singleSquareHeight", this.singleSquareHeight + "px");
  }
}
