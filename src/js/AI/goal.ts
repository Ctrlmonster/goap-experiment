import {WorldState} from "./world-state";


export class Goal {
  name: symbol;
  considerations: Array<(worldState: WorldState) => number>;

  constructor(name: symbol) {
    this.name = name;
    this.considerations = [];
  }

  addConsideration(consideration: (worldState: WorldState) => number) {
    this.considerations.push(consideration);
  }

  evaluate(worldState: WorldState): number {
    let res = 1;
    for (const consider of this.considerations) {
      res *= consider(worldState);
      if (res === 0) break;
    }
    //console.log(res);
    return res;
  }
}
