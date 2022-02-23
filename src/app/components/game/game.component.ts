import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  constructor(public cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.cdr.detach();
    this.cdr.detectChanges();
  }
}
