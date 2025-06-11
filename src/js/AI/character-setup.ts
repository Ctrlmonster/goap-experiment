import {proxy, ref} from "valtio/vanilla";
import {WorldState} from "./world-state";
import {Goal} from "./goal";
import {IAUS} from "./iaus";
import {mapLinear} from "three/src/math/MathUtils";
import {SeekBehavior, Vector3, Vehicle, WanderBehavior} from "yuka";

export const NULL_GOAL = new Goal(Symbol("None"));
export const EAT_BEHAVIOR_SYMBOL = Symbol("eat");
export const REST_BEHAVIOR_SYMBOL = Symbol("rest");
export const EXPLORE_BEHAVIOR_SYMBOL = Symbol("explore");

export function setupCharacterIAUS() {
  const characterState = proxy<WorldState & { currentGoal: Goal }>({
    hunger: 20,
    energy: 95,
    health: 100,
    boredom: 0,
    currentGoal: ref(NULL_GOAL),
  });

  const iaus = new IAUS();
  const goal_eat = new Goal(EAT_BEHAVIOR_SYMBOL);
  goal_eat.addConsideration((worldState: WorldState) => {
    return mapLinear(worldState.hunger, 0, 100, 0, 100);
  });
  goal_eat.addConsideration((worldState: WorldState) => {
    return (worldState.hunger < 30) ? 0.1 : 1;
  });


  const goal_rest = new Goal(REST_BEHAVIOR_SYMBOL);
  goal_rest.addConsideration(worldState => {
    return mapLinear(worldState.energy, 0, 100, 100, 0);
  });
  goal_rest.addConsideration(worldState => {
    return worldState.currentGoal.name === goal_rest.name ? 3 : 1;
  });
  goal_rest.addConsideration(worldState => {
    return (worldState.energy < 30) ? 1 : 0.2;
  });


  const goal_explore = new Goal(EXPLORE_BEHAVIOR_SYMBOL);//, (worldState: WorldState) => 3.5 * (2 + worldState.boredom));
  goal_explore.addConsideration(worldState => {
    return 10;
    //return mapLinear(worldState.boredom, 0, 100, 0, 1);
  });

  iaus.addGoal(goal_eat);
  iaus.addGoal(goal_rest);
  iaus.addGoal(goal_explore);

  return {
    iaus, characterState,
    goals: {
      [EAT_BEHAVIOR_SYMBOL]: goal_eat,
      [REST_BEHAVIOR_SYMBOL]: goal_rest,
      [EXPLORE_BEHAVIOR_SYMBOL]: goal_explore
    }
  };
}


export function setupCharacterSteering(startPos: { x: number, y: number, z: number }) {
  const characterVehicle = new Vehicle();
  characterVehicle.position.copy(startPos as Vector3);
  characterVehicle.maxSpeed = 3;
  const seekBehavior = new SeekBehavior();
  const wanderBehavior = new WanderBehavior();

  characterVehicle.steering.add(seekBehavior);
  characterVehicle.steering.add(wanderBehavior);
  //yukaEntityManager.add(characterVehicle);

  return {
    seekBehavior,
    wanderBehavior,
    characterVehicle
  }
}