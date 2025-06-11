import {AgentAction, AgentPlanner} from "../../AI/planner";
import React from "react";
import {useFrame} from "@react-three/fiber";
import {Color, Mesh} from "three";
import {Entity, relation, trait, World} from "koota";
import {Schedule} from "directed";
import {CombatAgentState, lumberJackActions, Lumberjacks} from "./lumberjack";
import {Trees} from "./trees";
import {UpdatePlan} from "../../ecs/systems/update-plan";
import {UpdateYuka} from "../../ecs/systems/update-yuka";
import {SeekBehavior, Vehicle, WanderBehavior} from "yuka";
import {FindNearestTree} from "../../ecs/systems/find-nearest-tree";
import {useWorld} from "koota/react";
import {SyncToThree} from "../../ecs/systems/sync-to-three";
import {DestroyEntities} from "../../ecs/systems/destroy-entities";
import {Equipment} from "./equipment";
import {FindAxe} from "../../ecs/systems/find-axe";
import {DecideYukaSeekTarget} from "../../ecs/systems/decide-yuka-seek-target";
import {PickupAxe} from "../../ecs/systems/pickup-axe";
import {SyncEquipmentTransforms} from "../../ecs/systems/sync-equipment-transforms";
import {StartChopping, ReachTree, ProgressChopping} from "../../ecs/systems/reach-tree";
import {checkIfNearHome} from "../../ecs/systems/check-if-near-home";
import {DeliverLumber} from "../../ecs/systems/deliver-lumber";
import {DropAxeOnGround} from "../../ecs/systems/drop-axe-on-ground";

// --------------------------------------------------------------------------

// --------------------------------------------------------------------------

export const Position = trait({x: 0, y: 0, z: 0});
export const Planner = trait({
  ref: () => new AgentPlanner(lumberJackActions),
  timeout: 0,
  maxWait: 0.3,
  currentPlan: ([] as AgentAction<CombatAgentState>[])
});
export const MeshRef = trait({ref: new Mesh()});
export const LumberJackHomeMesh = trait({ref: new Mesh()});
export const ColorTrait = trait({ref: new Color()});
export const IsTree = trait();
export const IsLumberJack = trait();
export const IsChopping = trait({
  duration: 2,
  timeLeft: 2
});
export const IsStatic = trait();
export const IsEquipped = relation({
  store: {
    test: "yo",
    number: -1
  }
});
export const GoalState = trait<Partial<CombatAgentState>>({
  fireWoodAtHome: true
});
export const CurrentState = trait<CombatAgentState>({
  atHome: false,
  hasAxe: false,
  closeToTree: false,
  carryingBranches: false,
  fireWoodAtHome: false,
  treeIsChopped: false
});
export const HasEquipped = relation();
export const PickupTarget = trait({
  entity: -1 as Entity
});
export const ClosestTreeTarget = trait({
  entity: -1 as Entity
});


export const YukaSteering = trait({
  vehicle: () => new Vehicle(),
  wanderBehavior: () => new WanderBehavior(),
  seekBehavior: () => new SeekBehavior(),
});


// --------------------------------------------------------------------------

export const gameplaySchedule = new Schedule<{ world: World }>();
gameplaySchedule.add(UpdateYuka);
gameplaySchedule.add(UpdatePlan, {before: [UpdateYuka]});
gameplaySchedule.add(SyncToThree, {after: [UpdateYuka]});
gameplaySchedule.add(FindNearestTree, {after: [SyncToThree]});
gameplaySchedule.add(FindAxe, {after: [SyncToThree]});
gameplaySchedule.add(DecideYukaSeekTarget, {before: [], after: [FindAxe, FindNearestTree]});
gameplaySchedule.add(PickupAxe, {after: [DecideYukaSeekTarget]});
gameplaySchedule.add(SyncEquipmentTransforms, {after: [PickupAxe]});
gameplaySchedule.add(ReachTree, {after: [PickupAxe]});
gameplaySchedule.add(StartChopping, {after: [ReachTree]});
gameplaySchedule.add(ProgressChopping, {after: [StartChopping]});
gameplaySchedule.add(DropAxeOnGround, {after: [ProgressChopping]});
gameplaySchedule.add(DeliverLumber, {after: [ProgressChopping, DropAxeOnGround]});
gameplaySchedule.add(checkIfNearHome, {after: [UpdateYuka]});

gameplaySchedule.build();


export const schedule = new Schedule<{ world: World }>();
const RunGameplay = ({world}: { world: World }) => {
  gameplaySchedule.run({world});
}
schedule.add(RunGameplay);
schedule.add(DestroyEntities, {after: RunGameplay});
schedule.build();

export const MarkedForDestruction = trait({
  destructionCb: {
    cb: (entity: Entity, world: World) => {
    }
  }
});

export function destroyAtEndOfFrame(entity: Entity, callBeforeDestruction = (entity: Entity, world: World) => {
}) {
  entity.add(MarkedForDestruction({
    destructionCb: {
      cb: callBeforeDestruction
    }
  }));
}


// --------------------------------------------------------------------------


export function PlannerScene() {
  const world = useWorld();

  useFrame(() => {
    schedule.run({world});
  });

  return (
    <>
      <Trees/>
      <Lumberjacks/>
      <Equipment/>
    </>
  )

}
















