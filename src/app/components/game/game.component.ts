import { AfterContentInit, ChangeDetectorRef, Component, ComponentRef, ElementRef, HostBinding, HostListener, OnChanges, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { debounce, debounceTime, Subject } from 'rxjs';
import { Grid } from 'src/app/models/grid';
import { CurrentGameService } from 'src/app/services/current-game.service';
import { GameResizeService } from 'src/app/services/game-resize.service';
import { EnemyContainerComponent } from '../enemy-container/enemy-container.component';
import { GameInfoPanelComponent } from '../game-info-panel/game-info-panel.component';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, AfterContentInit {
  _left: number = 0;
  _top: number = 0;
  _width: number = 0;
  _height: number = 0;

  private resizeSubject: Subject<void> = new Subject();

  @ViewChild("gridContainer", { read: ElementRef }) gridContainer!: ElementRef<HTMLElement>;
  @ViewChild('panelContainer', { read: ViewContainerRef }) panelContainer!: ViewContainerRef;
  @ViewChild('panelContainer', { read: ElementRef }) panelContainerElement!: ElementRef<HTMLElement>;

  currentPanel: PanelType = PanelType.GAME_INFO;

  constructor(
    public elementRef: ElementRef<HTMLElement>,
    public cdr: ChangeDetectorRef,
    private currentGameService: CurrentGameService,
    private gameResizeService: GameResizeService) {
  }

  ngAfterContentInit(): void {
    this.onResize();
    this.changePanelType(PanelType.GAME_INFO);
  }

  changePanelType(newPanelType: PanelType) {
    this.panelContainer.clear();

    let component: ComponentRef<OnInit>;
    switch (newPanelType) {
      case PanelType.GAME_INFO:
        component = this.panelContainer.createComponent(GameInfoPanelComponent);
        break;
      default:
        throw new Error("unknown panel type: " + PanelType[newPanelType]);
    }

    component.instance.ngOnInit();
    this.onResize();
  }

  @HostListener('window:resize')
  windowResize() {
    this.resizeSubject.next();
  }

  onResize() {
    let gridContainerRect: DOMRect = this.elementRef.nativeElement.getBoundingClientRect();
    let panel = this.elementRef.nativeElement.children[this.elementRef.nativeElement.children.length - 1];
    let panelRect = panel.getBoundingClientRect();
    
    gridContainerRect.width -= panelRect.width;
    let currentGrid: Grid = this.currentGameService.currentGrid;

    let gridRatio = currentGrid.width / currentGrid.height;
    let containerRatio = gridContainerRect.width / gridContainerRect.height;

    if(gridRatio > containerRatio) {
      this._width = gridContainerRect.width;
      this._left = 0;
      this._height = this._width / gridRatio;
      this._top = (gridContainerRect.height - this._height) / 2;

      this.gridContainer.nativeElement.style.width = this._width + "px";
    } else {
      this._height = gridContainerRect.height;
      this._top = 0;
      this._width = this._height * gridRatio;
      this._left = 0;

      this.gridContainer.nativeElement.style.width = this._width + "px";
    }

    this.gameResizeService.gridResized(this._width, this._height);
    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    this.resizeSubject
      .pipe(debounceTime(50))
      .subscribe(x => this.onResize());

    this.cdr.detach();
    this.cdr.detectChanges();
  }
}

enum PanelType {
  GAME_INFO
}