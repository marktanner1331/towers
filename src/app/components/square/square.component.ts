import { AfterViewInit, Component, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { SquareType } from 'src/app/models/square-type';
import { CurrentGameService } from 'src/app/services/current-game.service';
import { EmptySquareComponent } from '../empty-square/empty-square.component';

@Component({
  selector: 'app-square',
  templateUrl: './square.component.html',
  styleUrls: ['./square.component.scss']
})
export class SquareComponent implements OnInit, AfterViewInit {
  @Input() x: number = 0;
  @Input() y: number = 0;

  @ViewChild('viewContainer', { read: ViewContainerRef }) viewContainer!: ViewContainerRef;

  constructor(
    public currentGameService: CurrentGameService) { }

  ngAfterViewInit(): void {
    this.viewContainer.clear();

    let squareType = this.currentGameService.currentGrid.squareTypeAt(this.x, this.y);
    switch (squareType) {
      case SquareType.EMPTY:
        {
          let componentRef = this.viewContainer.createComponent<EmptySquareComponent>(EmptySquareComponent);
        }
        break;
      default:
        throw new Error("cannot create square for type: " + SquareType[squareType]);
    }
  }

  ngOnInit(): void {
    console.log(`${this.x}, ${this.y}`);
  }
}
