import {Entity, Not, trait, World} from "koota";
import {
  ClosestTreeTarget,
  CurrentState, destroyAtEndOfFrame, HasEquipped, IsChopping,
  IsLumberJack, MeshRef,
  Planner,
  Position, YukaSteering
} from "../../react-components/planner-scene/planner-scene";
import {MeshStandardMaterial} from "three";


const REACH_THRESHOLD = 1.5;
export const InRangeToChop = trait();

export const ReachTree = ({world}: { world: World }) => {

  world.query(ClosestTreeTarget, Position, CurrentState, IsLumberJack, Not(InRangeToChop))
    .updateEach(([treeTarget, jackPos, currentState], lumberjack) => {

      const treePos = treeTarget.entity.get(Position);
      const dist = Math.hypot(
        treePos.x - jackPos.x,
        treePos.z - jackPos.z,
      );

      // reached the tree
      if (dist <= REACH_THRESHOLD) {
        lumberjack.add(InRangeToChop);
        currentState.closeToTree = true;
      } else {
        lumberjack.remove(InRangeToChop);
        currentState.closeToTree = false;
      }
    });
};


export const IsBeingChopped = trait();
export const CarriesBranches = trait();

export const ProgressChopping = ({world}: { world: World }) => {

  world.query(IsChopping, ClosestTreeTarget, YukaSteering, CurrentState)
    .updateEach(([chopping, treeTarget, steering, currentState], lumberjack) => {

    chopping.timeLeft -= (1 / 60);

    if (chopping.timeLeft <= 0) {
      lumberjack.remove(IsChopping);
      lumberjack.add(CarriesBranches);

      steering.vehicle.maxSpeed = 2;
      currentState.treeIsChopped = true;
      currentState.carryingBranches = true;



      //todo:needs to drop axe next
      // mark the tree

      //const treeMesh = treeTarget.entity.get(MeshRef);
      treeTarget.entity.destroy();
      treeTarget.entity = -1 as Entity;

    }

  });

};

export const StartChopping = ({world}: { world: World }) => {

  world.query(ClosestTreeTarget, CurrentState, YukaSteering, InRangeToChop, HasEquipped("*"), Not(IsChopping))
    .updateEach(([treeTarget, currentState, steering], lumberjack) => {

      if (currentState.treeIsChopped) return;
      if (treeTarget.entity === -1) return;

      const treeMesh = treeTarget.entity.get(MeshRef).ref;
      (treeMesh.material as MeshStandardMaterial).color.set("red");

      lumberjack.add(IsChopping);
      treeTarget.entity.add(IsBeingChopped);
      steering.vehicle.maxSpeed = 0;


      /*
      if (!treeTarget.entity.has(IsBeingChopped)) {
        treeTarget.entity.add(IsBeingChopped);
        lumberjack.add(CarriesBranches);
        steering.wanderBehavior.active = false;
        steering.seekBehavior.active = false;
        steering.vehicle.maxSpeed = 0;

        setTimeout(() => {
          destroyAtEndOfFrame(treeTarget.entity);
          treeTarget.entity = -1 as Entity;

          currentState.treeIsChopped = true;
          currentState.carryingBranches = true;
        }, 1500);
      }*/
    });
};




















