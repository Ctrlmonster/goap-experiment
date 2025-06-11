import {Goal} from "./goal";
import {NULL_GOAL} from "../react-components/SceneContainer";

export interface IWorldState {
  hunger: number;
  health: number;
  energy: number;
  boredom: number;
  currentGoal: Goal;
}

export class WorldState implements IWorldState {
  energy: number;
  health: number;
  hunger: number;
  boredom: number;
  currentGoal: Goal;

  constructor(initState: IWorldState) {
    this.energy = initState.energy;
    this.health = initState.health;
    this.hunger = initState.hunger;
    this.boredom = initState.boredom;
    this.currentGoal = initState.currentGoal ?? NULL_GOAL;
  }

}