import {createActions} from "koota/react";
import {World} from "koota";
import {
  ClosestTreeTarget, ColorTrait,
  CurrentState,
  destroyAtEndOfFrame,
  GoalState,
  IsLumberJack,
  IsStatic,
  IsTree,
  MeshRef,
  PickupTarget,
  Planner,
  Position,
  YukaSteering
} from "../planner-scene/planner-scene";
import {AgentPlanner} from "../../AI/planner";
import {SeekBehavior, Vehicle, WanderBehavior} from "yuka";
import {YukaEntityManager} from "../../main";
import {lumberJackActions} from "../planner-scene/lumberjack";
import {IsAxe} from "../planner-scene/equipment";
import {Color} from "three";

export const useLumberjackActions = createActions((world: World) => ({
  spawnOne() {
    world.spawn(IsLumberJack,
      Position({
        x: Math.random() * 25 - 12.5,
        y: 0,
        z: Math.random() * 25 - 12.5
      }),
      PickupTarget,
      ClosestTreeTarget,
      Planner({
        ref: new AgentPlanner(lumberJackActions)
      }),
      ColorTrait({
        ref: new Color(`hsl(${Math.random() * 360}, 100%, 50%)`)
      }),
      YukaSteering({
        vehicle: new Vehicle(),
        wanderBehavior: new WanderBehavior(),
        seekBehavior: new SeekBehavior(),
      }),
      GoalState({
        fireWoodAtHome: true
      }),
      CurrentState({
        atHome: true,
        hasAxe: false,
        closeToTree: false,
        carryingBranches: false,
        fireWoodAtHome: false,
        treeIsChopped: false
      }));
  },
  removeOne() {
    const r = world.query(IsLumberJack, MeshRef, YukaSteering);
    if (r.length > 0) {
      const first = r[r.length - 1];
      destroyAtEndOfFrame(first, (entity, world) => {
        const yukaManager = world.get(YukaEntityManager).ref;
        yukaManager.remove(entity.get(YukaSteering).vehicle);
      })
    }
  }
}));


export const useEquipmentActions = createActions((world: World) => ({

  spawnAxe: () => {
    world.spawn(
      IsAxe,
      Position({x: Math.random() * 40 - 20, y: 0, z: Math.random() * 40 - 20})
    );
  },

  removeAxe: () => {
    const r = world.query(MeshRef, IsAxe);
    if (r.length > 0) {
      const first = r[r.length - 1];
      destroyAtEndOfFrame(first);
    }
  }

}));


export const useForestActions = createActions((world: World) => ({
  spawnTrees: (N: number) => {
    const randomPositions = Array.from({length: N}).map(() => ({
      x: Math.random() * 40 - 20,
      y: 0,
      z: Math.random() * 40 - 20
    }));

    randomPositions.forEach(({x, y, z}, i) => {
      world.spawn(IsTree, Position({x, y, z}), IsStatic);
    });
  },

  destroyForest: () => {
    world.query(IsTree).forEach(entity => {
      entity.destroy();
    });
  }
}));