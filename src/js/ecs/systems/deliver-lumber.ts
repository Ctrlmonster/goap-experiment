import {Not, trait, World} from "koota";
import {
  CurrentState,
  GoalState,
  LumberJackHomeMesh,
  YukaSteering
} from "../../react-components/planner-scene/planner-scene";
import {CarriesBranches} from "./reach-tree";



export const DroppedOffBranches = trait();

export const ResetTimer = trait({
  max: 2,
  current: 2
});

export const DeliverLumber = ({world}: { world: World }) => {


  world.query(CurrentState, GoalState, LumberJackHomeMesh, CarriesBranches, Not(DroppedOffBranches))
    .updateEach(([currentState, goalState, {ref: home}], lumberjack) => {

      if (currentState.atHome) {
        console.log("goal reached!!");
        currentState.carryingBranches = false;
        currentState.fireWoodAtHome = true;
        currentState.treeIsChopped = false;
        lumberjack.add(DroppedOffBranches);
        lumberjack.remove(CarriesBranches);

        lumberjack.add(ResetTimer);
      }

    });


  world.query(ResetTimer, CurrentState)
    .updateEach(([timer, currentState], e) => {

      timer.current -= (1 / 60);

      if (timer.current <= 0) {
        e.remove(DroppedOffBranches);
        e.remove(ResetTimer);
        currentState.fireWoodAtHome = false;
        currentState.treeIsChopped = false;
      }

    });

}