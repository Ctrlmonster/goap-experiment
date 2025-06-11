import {World} from "koota";
import {IsEquipped, IsLumberJack, MeshRef, Position} from "../../react-components/planner-scene/planner-scene";
import {IsAxe} from "../../react-components/planner-scene/equipment";
import {Color, MeshStandardMaterial} from "three";


export const SyncEquipmentTransforms = ({world}: { world: World }) => {

  // all equipped axes
  world.query(Position, MeshRef, IsEquipped("*"), IsAxe).updateEach(([axePos, {ref: mesh}], e) => {

    const carrier = e.targetFor(IsEquipped)!;

    // making sure this is the correct relation
    if (carrier.has(IsLumberJack)) {
      const carrierPos = carrier.get(Position);
      axePos.x = carrierPos.x;
      axePos.y = 1;
      axePos.z = carrierPos.z - 1.3;

      (mesh.material as MeshStandardMaterial).color.set("violet");
    }

  });

}