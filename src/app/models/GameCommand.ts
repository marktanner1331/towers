export class GameCommand {
    constructor(public type: GameCommandType, public data: any) {

    }
}




export enum GameCommandType {
  EMPTY_SQUARE_CLICK,
  ENEMY_CREATED
}