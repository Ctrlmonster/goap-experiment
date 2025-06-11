import {World} from "koota";
import {MarkedForDestruction} from "../../react-components/planner-scene/planner-scene";

export const DestroyEntities = ({world}: { world: World }) => {
  world.query(MarkedForDestruction).updateEach(([{destructionCb}], entity) => {
    destructionCb.cb(entity, world);
    entity.destroy();
  });
};