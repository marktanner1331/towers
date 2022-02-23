import { Injectable } from '@angular/core';
import { Grid } from '../models/grid';

@Injectable({
  providedIn: 'root'
})
export class CurrentGameService {
  currentGrid: Grid;

  constructor() {
    this.currentGrid = Grid.empty();
  }

  newGame(grid: Grid) {
    this.currentGrid = grid;
  }
}
