import { EventEmitter } from "@angular/core";
import { Square } from "./grid";

export class Enemy {
    currentSquare!: Square;
    timeline!: gsap.core.Timeline;

    currentSquareChanged: EventEmitter<void> = new EventEmitter();
    directionChanged: EventEmitter<void> = new EventEmitter();
    reachedEnd: EventEmitter<void> = new EventEmitter(); 

    //speed: number of tiles per second
    constructor(public id: number, public type: EnemyType, public speed: number) {

    }

    toString() {
        return JSON.stringify({
            id: this.id,
            type: EnemyType[this.type]
        });
    }
}

export class EnemyFactory {
    static enemyIdCounter: number = 0;
    static fromType(type: EnemyType):Enemy {
        this.enemyIdCounter++;
        
        switch (type) {
            case EnemyType.NORMAL:
                return new Enemy(this.enemyIdCounter, type, 0.5);
        }
    }
}

export enum EnemyType {
    NORMAL
}