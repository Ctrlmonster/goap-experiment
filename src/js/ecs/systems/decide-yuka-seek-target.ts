import {World} from "koota";
import {
  ClosestTreeTarget, LumberJackHomeMesh,
  PickupTarget,
  Planner, Position,
  YukaSteering
} from "../../react-components/planner-scene/planner-scene";
import {AgentPlanner} from "../../AI/planner";
import {GetAxe, SearchTree, WalkHome} from "../../react-components/planner-scene/lumberjack";
import {Vector3} from "yuka";

export const DecideYukaSeekTarget = ({world}: { world: World }) => {

  world.query(ClosestTreeTarget, PickupTarget, Planner, YukaSteering, LumberJackHomeMesh)
    .updateEach(([treeTarget, pickupTarget, planner, steering, {ref: home}], e) => {

      // we're linking plan step to world action via name for now
      // this linking should be done in a different way

      const canFindTree = treeTarget.entity !== -1;
      const canFindPickup = pickupTarget.entity !== -1;
      const canFindSth = canFindTree || canFindPickup;


      if (canFindSth) {
        if (planner.currentPlan.length > 0) {
          const currentStep = AgentPlanner.getActionName(planner.currentPlan[0]);

          switch (currentStep) {
            case AgentPlanner.getActionName(GetAxe):
              if (canFindPickup) {
                steering.seekBehavior.active = true;
                steering.wanderBehavior.active = false;
                steering.seekBehavior.target.copy(pickupTarget.entity.get(Position) as Vector3);
              }
              break;

            case AgentPlanner.getActionName(SearchTree):
              if (canFindTree) {
                steering.seekBehavior.active = true;
                steering.wanderBehavior.active = false;
                steering.seekBehavior.target.copy(treeTarget.entity.get(Position) as Vector3);
              }
              break;

            case AgentPlanner.getActionName(WalkHome):
              steering.seekBehavior.active = true;
              steering.wanderBehavior.active = false;
              steering.seekBehavior.target.copy(home.position as unknown as Vector3);
              break;

            default:
              // if we aren't inside a "target" step we'll turn off the behavior
              steering.seekBehavior.active = false;
              steering.wanderBehavior.active = true;
              break;
          }
        }
        // if we have no plan we'll turn off the seek behavior as well
        else {
          steering.seekBehavior.active = false;
          steering.wanderBehavior.active = true;
        }
      }

      // same if neither target can be found currently in the world
      else {
        steering.seekBehavior.active = false;
        steering.wanderBehavior.active = true;
      }
    });


}