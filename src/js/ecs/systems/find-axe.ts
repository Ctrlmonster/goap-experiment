import {Entity, Not, World} from "koota";
import {
  IsEquipped,
  HasEquipped,
  IsLumberJack,
  PickupTarget,
  Position
} from "../../react-components/planner-scene/planner-scene";
import {IsAxe} from "../../react-components/planner-scene/equipment";

export const FindAxe = ({world}: { world: World }) => {

  const allAxes = world.query(Position, IsAxe, Not(IsEquipped("*")));

  // every lumberjack that doesn't have one, needs to know about the closest axe to them
  world.query(Position, PickupTarget, IsLumberJack, Not(HasEquipped("*")))
    .updateEach(([jackPos, pickupTarget]) => {
      const closestAxe = {dist: Infinity, entity: -1 as Entity, pos: {x: 0, z: 0}};

      // find tree
      allAxes.useStores(([axePos], entities) => {
        for (const entity of entities) {
          const eid = entity.id();
          const axePosX = axePos.x[eid];
          const axePosZ = axePos.z[eid];

          const dist = Math.hypot(
            axePosX - jackPos.x,
            axePosZ - jackPos.z,
          );

          if (dist < closestAxe.dist) {
            closestAxe.dist = dist;
            closestAxe.entity = entity;
            closestAxe.pos.x = axePosX;
            closestAxe.pos.z = axePosZ;
          }
        }
      });

      // we always assign, if we can't find an axe -1 represents the "none" value
      pickupTarget.entity = closestAxe.entity;

    }, {
      passive: true
    });

}