import {useQuery} from "koota/react";
import {Entity, trait} from "koota";
import {MeshRef, Position} from "./planner-scene";
import {useEffect, useMemo, useRef} from "react";
import {Mesh} from "three";
import {useEquipmentActions} from "../action-stores/action-stores";


export const IsAxe = trait();



export function Equipment() {
  const axes = useQuery(IsAxe, Position);
  const {spawnAxe, removeAxe} = useEquipmentActions();


  useEffect(() => {
    spawnAxe();
    spawnAxe();
    spawnAxe();
    spawnAxe();
    spawnAxe();
    return removeAxe;
  }, []);

  return (
    <>
      {axes.map(entity => <Axe key={entity} entity={entity as Entity}/>)}
    </>
  )

}


function Axe({entity}: { entity: Entity }) {
  const initPosition = useMemo(() => entity.get(Position), [entity]);
  const meshRef = useRef<Mesh>(null!);

  useEffect(() => {
    entity.add(MeshRef({ref: meshRef.current}));
    return () => entity.remove(MeshRef);
  }, [entity]);


  return (
    <mesh ref={meshRef} position-x={initPosition.x} position-z={initPosition.z}>
      <boxGeometry args={[0.05, 0.4, 0.05]}/>
      <meshStandardMaterial color={"brown"}/>

      <mesh position-y={0.3} rotation-x={-Math.PI / 2}>
        <cylinderGeometry args={[0.2, 0.2, 0.01]}/>
        <meshStandardMaterial color={"silver"}/>
      </mesh>
    </mesh>
  )
}