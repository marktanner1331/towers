import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CurrentGameService } from 'src/app/services/current-game.service';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent implements OnInit {

  constructor(
    public currentGameService: CurrentGameService,
    public cdr: ChangeDetectorRef) { 
    }

  ngOnInit(): void {
    this.cdr.detach();
    this.cdr.detectChanges();
  }

  gridWidth():number {
     return this.currentGameService.currentGrid.width;
  }

  gridHeight():number {
    return this.currentGameService.currentGrid.height;
 }

  range(n:number):number[] {
    let array:number[] = [];
    
    for(let i = 0;i < n;i++) {
      array.push(i);
    }

    return array;
  }
}
