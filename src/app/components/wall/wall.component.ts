import { Component, Input, OnInit } from '@angular/core';
import { Square } from 'src/app/models/grid';
import { ISquareComponent } from '../interfaces/ISquareComponent';

@Component({
  selector: 'app-wall',
  templateUrl: './wall.component.html',
  styleUrls: ['./wall.component.scss']
})
export class WallComponent implements ISquareComponent, OnInit {
  square?: Square;
  
  constructor() { }

  ngOnInit(): void {
  }

}
