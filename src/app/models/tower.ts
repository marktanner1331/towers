export abstract class Tower {
    constructor(public type: TowerType, public x:number, public y:number) {}

    static fromType(type:TowerType, x:number, y:number) {
        switch(type) {
            case TowerType.CANNON:
                return new Cannon(x, y);
            default:
                throw new Error("unknown tower type: " + TowerType[type]);
        }
    }
}

export class Cannon extends Tower {
    range: number = Math.floor(Math.random() * 5) + 1;
    speed: number = 1;
    power: number = Math.floor(Math.random() * 5) + 1;

    constructor(x:number, y:number) {
        super(TowerType.CANNON, x, y);
    }
}

export enum TowerType {
    CANNON
}