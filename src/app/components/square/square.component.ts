import { AfterViewInit, Component, ComponentRef, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Square } from 'src/app/models/grid';
import { SquareType } from 'src/app/models/square-type';
import { TowerType } from 'src/app/models/tower';
import { CurrentGameService } from 'src/app/services/current-game.service';
import { CannonComponent } from '../cannon/cannon.component';
import { EmptySquareComponent } from '../empty-square/empty-square.component';
import { ISquareComponent } from '../interfaces/ISquareComponent';
import { WallComponent } from '../wall/wall.component';

@Component({
  selector: 'app-square',
  templateUrl: './square.component.html',
  styleUrls: ['./square.component.scss']
})
export class SquareComponent implements OnInit, AfterViewInit {
  @Input() x: number = 0;
  @Input() y: number = 0;
  square!: Square;

  @ViewChild('viewContainer', { read: ViewContainerRef }) viewContainer!: ViewContainerRef;

  constructor(
    public currentGameService: CurrentGameService) { }

  ngAfterViewInit(): void {

    this.square = this.currentGameService.currentGrid.squareAt(this.x, this.y);

    this.square.squareTypeChanged.subscribe(() => this.refreshSquare());
    this.refreshSquare();
  }

  refreshSquare() {
    this.viewContainer.clear();
    let squareComponent: ComponentRef<ISquareComponent>;

    switch (this.square.type) {
      case SquareType.EMPTY:
        squareComponent = this.viewContainer.createComponent(EmptySquareComponent);
        break;
      case SquareType.WALL:
        squareComponent = this.viewContainer.createComponent(WallComponent);
        break;
      case SquareType.TOWER:
        switch (this.square.tower!.type) {
          case TowerType.CANNON:
            squareComponent = this.viewContainer.createComponent(CannonComponent);
            break;
          default:
            throw new Error("cannot create tower with type: " + TowerType[this.square.tower!.type]);
        }
        break;
      default:
        throw new Error("cannot create square for type: " + SquareType[this.square.type]);
    }

    squareComponent.instance.square = this.square;

    squareComponent.changeDetectorRef.detectChanges();
    squareComponent.onDestroy(() => {
      squareComponent.changeDetectorRef.detach();
    });
  }

  ngOnInit(): void {
  }
}
