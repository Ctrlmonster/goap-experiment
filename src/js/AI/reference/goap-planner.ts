import {Action} from "./action";
import {WorldState} from "../world-state";
import {Goal} from "../goal";


export class GOAPPlanner {
  private actions: Action[];

  constructor() {
    this.actions = [];
  }

  addAction(action: Action): void {
    this.actions.push(action);
  }

  plan(goal: Goal, worldState: WorldState): Action[] | null {
    const validActions: Action[] = this.actions.filter(action => action.canExecute(worldState));

    // Create a plan by chaining valid actions
    let currentState = { ...worldState };
    const plan: Action[] = [];
    let goalAchieved = false;

    while (!goalAchieved && validActions.length > 0) {
      const action = validActions.pop();
      if (action) {
        plan.push(action);
        action.applyEffects(currentState);
        goalAchieved = this.goalAchieved(goal, currentState);
      }
    }

    return goalAchieved ? plan : null;
  }

  private goalAchieved(goal: Goal, worldState: WorldState): boolean {
    switch (goal.name) {
      case 'Eat':
        return worldState.hunger === 0;
      case 'Fight':
        return worldState.energy === 0;
      case 'Heal':
        return worldState.health === 100;
      default:
        return false;
    }
  }
}
