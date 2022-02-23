import { SquareType } from "./square-type";
import { Tower, TowerType } from "./tower";

/*
getGridsInRange()
*/

export class Square {
    type!: SquareType;
    tower: Tower | null = null;

    /// the square that is next in the path
    path!: Square;
    
    /// the angle of the path to the next square
    /// expressed as (clockwise angle in degrees from up / 45)
    bearing!:number;

    distanceToEnd!: number;

    constructor(public x: number, public y: number, public offset: number) {
    }

    isEmpty(): boolean {
        return this.type == SquareType.EMPTY || this.type == SquareType.RESERVED;
    }
}

export class Grid {
    squares: Square[];

    constructor(public width: number, public height: number, public startX: number, public startY: number, public endX: number, public endY: number) {
        this.squares = new Array(width * height);

        let offset = 0;
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                this.squares[offset] = new Square(x, y, offset);
                offset++;
            }
        }

        this.regeneratePaths();
    }

    static empty(): Grid {
        return new Grid(0, 0, 0, 0, 0, 0);
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

                dest.path = source;
                if (isDiagonal) {
                    dest.distanceToEnd = source.distanceToEnd + 1.4;
                } else {
                    dest.distanceToEnd = source.distanceToEnd + 1;
                }

                switch(dest.x - source.x) {
                    case -1:
                        switch(dest.y - source.y) {
                            case -1:
                                break;
                            case 0:
                                break;
                            case 1:
                                break;
                        }
                        break;
                    case 0:
                        switch(dest.y - source.y) {
                            case -1:
                                dest.bearing = 0;
                                break;
                            case 1:
                                dest.bearing = 4;
                                break;
                        }
                        break;
                    case 1:
                        switch(dest.y - source.y) {
                            case -1:
                                dest.bearing = 1;
                                break;
                            case 0:
                                dest.bearing = 2;
                                break;
                            case 1:
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
                    left = undefined;
                }
            }

            if (square.x < this.width - 1) {
                right = this.squares[square.offset + this.height];
                if (!right.isEmpty()) {
                    left = undefined;
                }
            }

            if (square.y < this.height - 1) {
                down = this.squares[square.offset + 1];
                if (!down.isEmpty()) {
                    left = undefined;
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
    }

    addTower(x: number, y: number, type: TowerType) {
        let square = this.squareAt(x, y);
        square.type = SquareType.TOWER;
        square.tower = Tower.fromType(type, x, y);
        this.regeneratePaths();
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
