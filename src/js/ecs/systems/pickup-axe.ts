import {Entity, Not, World} from "koota";
import {
  CurrentState,
  IsEquipped,
  HasEquipped,
  IsLumberJack,
  PickupTarget,
  Position
} from "../../react-components/planner-scene/planner-scene";
import {CarriesBranches} from "./reach-tree";

const PICKUP_THRESHOLD = 1;

export const PickupAxe = ({world}: { world: World }) => {

  world.query(PickupTarget, Position, CurrentState, Not(HasEquipped("*")), IsLumberJack, Not(CarriesBranches))
    .updateEach(([pickup, jackPos, currentState], lumberJack) => {

      const pickupPos = pickup.entity.get(Position);
      const dist = Math.hypot(
        pickupPos.x - jackPos.x,
        pickupPos.z - jackPos.z,
      );

      if (dist <= PICKUP_THRESHOLD) {
        lumberJack.add(HasEquipped(pickup.entity));
        pickup.entity.add(IsEquipped(lumberJack));

        // reset pickup target
        pickup.entity = -1 as Entity;

        // update agent state
        currentState.hasAxe = true;
        console.log("pick up axe!");
      }

    });

}