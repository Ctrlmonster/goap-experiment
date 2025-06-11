import {World} from "koota";
import {
  CurrentState,
  IsLumberJack,
  LumberJackHomeMesh,
  Position
} from "../../react-components/planner-scene/planner-scene";


const AT_HOME_THRESHOLD = 2;

export const checkIfNearHome = ({world}: { world: World }) => {

  world.query(Position, LumberJackHomeMesh, CurrentState, IsLumberJack)
    .updateEach(([jackPos, {ref: homeMesh}, currentState], entity) => {


      const distToHome = homeMesh.position.distanceTo(jackPos);
      currentState.atHome = (distToHome < AT_HOME_THRESHOLD);


    });


};