import {World} from "koota";
import {CurrentState, HasEquipped, IsEquipped} from "../../react-components/planner-scene/planner-scene";
import {CarriesBranches} from "./reach-tree";
import {IsAxe} from "../../react-components/planner-scene/equipment";

export const DropAxeOnGround = ({world}: { world: World }) => {

  world.query(CurrentState, HasEquipped("*"), CarriesBranches)
    .updateEach(([currentState], lumberJack) => {

      const axe = lumberJack.targetFor(HasEquipped)!;


      if (axe.has(IsAxe)) {

        currentState.hasAxe = false;


        console.log("drop axe");
        axe.remove(IsEquipped("*"));
        lumberJack.remove(HasEquipped("*"));

      }


    })


}