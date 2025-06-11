import {Not, World} from "koota";
import {IsStatic, MeshRef, Position} from "../../react-components/planner-scene/planner-scene";


export const SyncToThree = ({world}: { world: World }) => {
  world.query(Position, MeshRef, Not(IsStatic)).updateEach(([pos, {ref: mesh}]) => {
    mesh.position.copy(pos);
  }, {
    passive: true
  });
}