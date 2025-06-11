import {createAdded, Not, trait, World} from "koota";
import {MeshRef, Position, YukaSteering} from "../../react-components/planner-scene/planner-scene";
import {YukaEntityManager} from "../../main";
import {Vector3} from "yuka";


const Added = createAdded();

export const UpdateYuka = ({world}: { world: World }) => {
  const yukaManager = world.get(YukaEntityManager).ref

  // -------------------------------------------------------------

  // handle freshly spawned yuka vehicles
  world.query(Added(YukaSteering), Position, MeshRef).updateEach(([steering, pos], entity, idx) => {
    const {vehicle, seekBehavior, wanderBehavior} = steering;
    vehicle.steering.add(seekBehavior);
    seekBehavior.active = false;

    vehicle.steering.add(wanderBehavior);
    vehicle.maxSpeed = 2;
    vehicle.maxTurnRate = Math.PI / 4;

    // copy the initial position to yuka
    vehicle.position.x = pos.x;
    vehicle.position.z = pos.z;

    yukaManager.add(vehicle);
  }, {
    passive: true
  });

  // -------------------------------------------------------------

  // update yuka
  yukaManager.update(1 / 60);

  // -------------------------------------------------------------

  // sync from yuka back to our position trait
  world.query(YukaSteering, Position, MeshRef).updateEach(([{vehicle}, pos], entity) => {
    pos.x = vehicle.position.x;
    pos.z = vehicle.position.z;
  }, {
    passive: true
  });
}



