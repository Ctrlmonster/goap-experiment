import {WorldState} from "../world-state";

export class Action {
  name: string;
  preconditions: Map<string, any>;
  effects: Map<string, any>;
  cost: number;

  constructor(name: string, cost: number) {
    this.name = name;
    this.preconditions = new Map();
    this.effects = new Map();
    this.cost = cost;
  }

  addPrecondition(key: string, value: any): void {
    this.preconditions.set(key, value);
  }

  addEffect(key: string, value: any): void {
    this.effects.set(key, value);
  }

  // Check if action can be run
  canExecute(worldState: WorldState): boolean {
    for (let [key, value] of this.preconditions) {
      if ((worldState as any)[key] !== value) {
        return false;
      }
    }
    return true;
  }

  // Apply action effects to the world state
  applyEffects(worldState: WorldState): void {
    for (let [key, value] of this.effects) {
      (worldState as any)[key] = value;
    }
  }
}
