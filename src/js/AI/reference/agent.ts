import {IAUS} from "../iaus";
import {GOAPPlanner} from "./goap-planner";
import {WorldState} from "../world-state";


export class Agent {
  private iaus: IAUS;
  private goapPlanner: GOAPPlanner;
  private readonly worldState: WorldState;

  constructor(iaus: IAUS, goapPlanner: GOAPPlanner, worldState: WorldState) {
    this.iaus = iaus;
    this.goapPlanner = goapPlanner;
    this.worldState = worldState;
  }

  update(): void {
    // Step 1: Use IAUS to select the highest priority goal
    const goal = this.iaus.evaluate(this.worldState);

    // Step 2: Use GOAP to generate a plan to achieve that goal
    const plan = this.goapPlanner.plan(goal, this.worldState);

    if (plan) {
      console.log(`Executing plan for goal: ${goal.name}`);
      plan.forEach(action => {
        console.log(`Performing action: ${action.name}`);
        action.applyEffects(this.worldState);
      });
    } else {
      console.log(`No plan could be created for goal: ${goal.name}`);
    }
  }
}
