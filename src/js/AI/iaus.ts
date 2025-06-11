import {Goal} from "./goal";
import {WorldState} from "./world-state";

export class IAUS {
  private readonly goals: Goal[];

  constructor() {
    this.goals = [];
  }

  addGoal(goal: Goal): void {
    this.goals.push(goal);
  }

  evaluate(worldState: WorldState): Goal {
    let highestPriority = -Infinity;
    let selectedGoal: Goal | null = null;

    for (const goal of this.goals) {
      const priority = goal.evaluate(worldState);  // Each goal calculates its own priority
      if (priority > highestPriority) {
        highestPriority = priority;
        selectedGoal = goal;
      }
    }

    return selectedGoal!;
  }
}

