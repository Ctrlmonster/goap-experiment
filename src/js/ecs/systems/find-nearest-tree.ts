import {Entity, World} from "koota";
import {ClosestTreeTarget, IsLumberJack, IsTree, Position} from "../../react-components/planner-scene/planner-scene";


export const FindNearestTree = ({world}: { world: World }) => {
  const allTrees = world.query(Position, IsTree);

  // every lumberjack needs to find the tree closest to them
  world.query(Position, ClosestTreeTarget, IsLumberJack).updateEach(([jackPos, treeTarget]) => {
    const closestTree = {dist: Infinity, entity: -1 as Entity, pos: {x: 0, z: 0}};

    // find tree
    allTrees.useStores(([treePos], entities) => {
      for (const entity of entities) {
        const eid = entity.id();
        const treePosX = treePos.x[eid];
        const treePosZ = treePos.z[eid];

        const dist = Math.hypot(
          treePosX - jackPos.x,
          treePosZ - jackPos.z,
        );

        if (dist < closestTree.dist) {
          closestTree.dist = dist;
          closestTree.entity = entity;
          closestTree.pos.x = treePosX;
          closestTree.pos.z = treePosZ;
        }
      }
    });

    // we always assign, if we can't find a tree -1 represents the "none" value
    treeTarget.entity = closestTree.entity;

  }, {
    passive: true
  });
}

