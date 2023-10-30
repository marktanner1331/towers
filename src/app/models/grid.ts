import { EventEmitter } from "@angular/core";
import { Enemy } from "./enemy";
import { SquareType } from "./square-type";
import { Tower, TowerType } from "./tower";

/*
getGridsInRange()
*/

export class Square {
    squareTypeChanged: EventEmitter<void> = new EventEmitter();

    type: SquareType;
    tower: Tower | null = null;

    /// the square that is next in the path
    nextSquare!: Square;

    /// the angle of the path to the next square
    /// expressed as (clockwise angle in degrees from up / 45)
    bearing!: number;

    distanceToEnd!: number;

    enemies: Enemy[] = [];

    constructor(public x: number, public y: number, public offset: number) {
        this.type = SquareType.EMPTY;
    }

    addEnemy(enemy: Enemy) {
        this.enemies.push(enemy);
    }

    removeEnemy(enemy: Enemy) {
        this.enemies = this.enemies.filter(x => x.id != enemy.id);
    }

    isEmpty(): boolean {
        return this.type == SquareType.EMPTY || this.type == SquareType.RESERVED;
    }

    toString() {
        return JSON.stringify({
            x: this.x,
            y: this.y
        });
    }
}

export class Grid {
    origin!: Square;

    squares: Square[];
    gridChanged: EventEmitter<void> = new EventEmitter();

    constructor(
        public width: number,
        public height: number,
        public startX: number,
        public startY: number,
        public originX: number,
        public originY: number,
        public endX: number,
        public endY: number) {
        this.squares = new Array(width * height);

        if (this.isEmpty()) {
            return;
        }

        this.origin = new Square(originX, originY, 0);
        this.origin.type = SquareType.RESERVED;

        let offset = 0;
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                this.squares[offset] = new Square(x, y, offset);
                offset++;
            }
        }

        this.createOuterWall();
        this.regeneratePaths();
    }

    createOuterWall() {
        for (let i = 0; i < this.width; i++) {
            this.squareAt(i, 0).type = SquareType.WALL;
            this.squareAt(i, this.height - 1).type = SquareType.WALL;
        }

        for (let j = 0; j < this.height; j++) {
            this.squareAt(0, j).type = SquareType.WALL;
            this.squareAt(this.width - 1, j).type = SquareType.WALL;
        }

        this.squareAt(this.endX, this.endY).type = SquareType.EMPTY;
        this.squareAt(this.startX, this.startY).type = SquareType.EMPTY;
    }

    static empty(): Grid {
        return new Grid(0, 0, 0, 0, 0, 0, 0, 0);
    }

    /// returns a list of unreachable squares if a tower is placed at the given coordinates
    // getUnreachableSquares(potentialTowerX: number, potentialTowerY: number): number[] {
    //     let potentialOffset = this.toOffset(potentialTowerX, potentialTowerY);

    //     let reachable: { [key: number]: boolean } = {};
    //     let explored: { [key: number]: boolean } = {};
    //     let queue: number[] = [];

    //     let initial = this.toOffset(this.endX, this.endY);;
    //     queue.push(initial);
    //     explored[initial] = true;

    //     let addSquare = (dest: number) => {
    //         if (dest != potentialOffset) {
    //             if (!explored[dest]) {
    //                 explored[dest] = true;

    //                 if (this.squares[dest] == SquareType.EMPTY || this.squares[dest] == SquareType.RESERVED) {
    //                     reachable[dest] = true;
    //                     queue.push(dest);
    //                 }
    //             }
    //         }
    //     }

    //     while (queue.length > 0) {
    //         let offset = queue.pop()!;
    //         let coords = this.fromOffset(offset);

    //         if (coords.x > 0) {
    //             let other = offset - this.height;
    //             addSquare(other);
    //         }

    //         if (coords.y > 0) {
    //             let other = offset - 1;
    //             addSquare(other);
    //         }

    //         if (coords.x < this.width - 1) {
    //             let other = offset + this.height;
    //             addSquare(other);
    //         }

    //         if (coords.y < this.height - 1) {
    //             let other = offset + 1;
    //             addSquare(other);
    //         }
    //     }

    //     let unreachable: number[] = [];
    //     for (let i = 0; i < this.width * this.height; i++) {
    //         if (!reachable[i]) {
    //             unreachable.push(i);
    //         }
    //     }

    //     return unreachable;
    // }

    emptySquaresInRange(square: Square, range: number): Square[] {
        let squares: Square[] = [];

        //iterate through all pixels in the bounding box
        let minX = Math.max(0, square.x - range);
        let maxX = Math.min(this.width - 1, square.x + range);
        let minY = Math.max(0, square.y - range);
        let maxY = Math.min(this.height - 1, square.y + range);

        let squareRange = range * range;
        
        for(let i = minX;i < maxX;i++) {
            for(let j = minY;j < maxY;j++) {
                let target = this.squareAt(i, j);

                if(!target.isEmpty()) {
                    continue;
                }

                let distanceSquared = (square.x - i) * (square.x - i) + (square.y - j) * (square.y - j);
                if(distanceSquared < squareRange) {
                    squares.push(target);
                }
            }
        }

        return squares;
    }

    isEmpty(): boolean {
        return this.width == 0 && this.height == 0;
    }

    getStart(): Square {
        return this.squareAt(this.startX, this.startY);
    }

    getEnd(): Square {
        return this.squareAt(this.endX, this.endY);
    }

    regeneratePaths() {
        let explored: { [key: number]: boolean } = {};
        let queue: Square[] = [];

        let initial = this.squareAt(this.endX, this.endY);
        initial.distanceToEnd = 0;
        queue.push(initial);
        explored[initial.offset] = true;

        let addToQueue = (item: Square) => {
            let index = 0;
            for (let square of queue) {
                if (square.distanceToEnd < item.distanceToEnd) {
                    index++;
                } else {
                    break;
                }
            }
            queue.splice(index, 0, item);
        };

        let addSquare = (source: Square, dest: Square, isDiagonal: boolean) => {
            if (!explored[dest.offset]) {
                explored[dest.offset] = true;

                dest.nextSquare = source;
                if (isDiagonal) {
                    dest.distanceToEnd = source.distanceToEnd + 1.4;
                } else {
                    dest.distanceToEnd = source.distanceToEnd + 1;
                }

                switch (source.x - dest.x) {
                    case -1:
                        switch (source.y - dest.y) {
                            case -1:
                                dest.bearing = 5;
                                break;
                            case 0:
                                dest.bearing = 6;
                                break;
                            case 1:
                                dest.bearing = 7;
                                break;
                        }
                        break;
                    case 0:
                        switch (source.y - dest.y) {
                            case -1:
                                dest.bearing = 0;
                                break;
                            case 1:
                                dest.bearing = 4;
                                break;
                        }
                        break;
                    case 1:
                        switch (source.y - dest.y) {
                            case -1:
                                dest.bearing = 1;
                                break;
                            case 0:
                                dest.bearing = 2;
                                break;
                            case 1:
                                dest.bearing = 3;
                                break;
                        }
                        break;
                }

                addToQueue(dest);
            }
        }

        while (queue.length > 0) {
            let square = queue.shift()!;

            let left: Square | undefined = undefined;
            let right: Square | undefined = undefined;
            let up: Square | undefined = undefined;
            let down: Square | undefined = undefined;

            if (square.x > 0) {
                left = this.squares[square.offset - this.height];
                if (!left.isEmpty()) {
                    left = undefined;
                }
            }

            if (square.y > 0) {
                up = this.squares[square.offset - 1];
                if (!up.isEmpty()) {
                    up = undefined;
                }
            }

            if (square.x < this.width - 1) {
                right = this.squares[square.offset + this.height];
                if (!right.isEmpty()) {
                    right = undefined;
                }
            }

            if (square.y < this.height - 1) {
                down = this.squares[square.offset + 1];
                if (!down.isEmpty()) {
                    down = undefined;
                }
            }

            if (left) {
                addSquare(square, left, false);
            }

            if (right) {
                addSquare(square, right, false);
            }

            if (up) {
                addSquare(square, up, false);
            }

            if (down) {
                addSquare(square, down, false);
            }

            if (left && up) {
                let leftUp = this.squares[square.offset - this.height - 1];
                if (leftUp.isEmpty()) {
                    addSquare(square, leftUp, true);
                }
            }

            if (left && down) {
                let leftDown = this.squares[square.offset - this.height + 1];
                if (leftDown.isEmpty()) {
                    addSquare(square, leftDown, true);
                }
            }

            if (right && up) {
                let rightUp = this.squares[square.offset + this.height - 1];
                if (rightUp.isEmpty()) {
                    addSquare(square, rightUp, true);
                }
            }

            if (right && down) {
                let rightDown = this.squares[square.offset + this.height + 1];
                if (rightDown.isEmpty()) {
                    addSquare(square, rightDown, true);
                }
            }
        }

        let start: Square = this.squareAt(this.startX, this.startY);
        this.origin.nextSquare = start;
        this.origin.distanceToEnd = start.distanceToEnd + 1;
        this.origin.bearing = start.bearing;
    }

    addTower(x: number, y: number, type: TowerType) {
        let square = this.squareAt(x, y);
        square.type = SquareType.TOWER;
        square.tower = Tower.fromType(type, x, y);
        this.regeneratePaths();
        this.gridChanged.next();
        square.squareTypeChanged.next();
    }

    addWall(x: number, y: number) {
        let square = this.squareAt(x, y);
        square.type = SquareType.WALL;
        this.regeneratePaths();
        this.gridChanged.next();
        square.squareTypeChanged.next();
    }

    toOffset(x: number, y: number): number {
        return x * this.height + y;
    }

    fromOffset(offset: number): { x: number, y: number } {
        return {
            x: Math.floor(offset / this.height),
            y: offset % this.height
        };
    }

    squareAt(x: number, y: number): Square {
        return this.squares[this.toOffset(x, y)];
    }

    squareTypeAt(x: number, y: number): SquareType {
        return this.squareAt(x, y).type;
    }

    towerAt(x: number, y: number): Tower | null {
        return this.squareAt(x, y).tower;
    }
}
