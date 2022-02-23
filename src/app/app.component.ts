import { Component, OnInit } from '@angular/core';
import { Grid } from './models/grid';
import { CurrentGameService } from './services/current-game.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'towers';

  constructor(public currentGameService: CurrentGameService) {

  }

  ngOnInit(): void {
    this.currentGameService.newGame(new Grid(10, 10, 0, 0, 9, 9));
  }
}
