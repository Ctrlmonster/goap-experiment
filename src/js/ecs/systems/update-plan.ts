import {World} from "koota";
import {CurrentState, GoalState, Planner} from "../../react-components/planner-scene/planner-scene";

export const UpdatePlan = ({world}: { world: World }) => {


  world.query(Planner, GoalState, CurrentState)
    .updateEach(([planner, goalState, currentState], entity) => {

      planner.timeout -= (1 / 60);
      if (planner.timeout <= 0) {
        planner.timeout = planner.maxWait;

        // ~ Time to make new Plans! ~
        const result = planner.ref.generatePlan(goalState, currentState);
        if (result !== null) {

          // we might want to do some checking whether we want to adopt the new plan or not
          planner.currentPlan.length = 0;
          planner.currentPlan.push(...result.path);
        }
      }


    });

};