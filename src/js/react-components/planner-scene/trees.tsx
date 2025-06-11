import {Mesh} from "three";
import React, {useEffect, useMemo, useRef} from "react";
import {IsTree, MeshRef, Position} from "./planner-scene";
import {useQuery} from "koota/react";
import {Entity} from "koota";
import {useForestActions} from "../action-stores/action-stores";


export function Trees() {
  const trees = useQuery(IsTree);
  const {destroyForest, spawnTrees} = useForestActions();

  useEffect(() => {
    spawnTrees(5);
    return destroyForest;
  }, []);

  return (
    <>
      {trees.map((entity) => <Tree key={entity} entity={entity as Entity}/>)}
    </>
  )
}


function Tree({entity}: { entity: Entity }) {
  const ref = useRef<Mesh>(null!);
  const initPos = useMemo(() => entity.get(Position), []);

  useEffect(() => {
    entity.add(MeshRef({ref: ref.current}));
    return () => {
      entity.remove(MeshRef);
    }
  }, [entity]);

  return (
    <mesh ref={ref} position={[initPos.x, 1.5 / 2, initPos.z]}>
      <boxGeometry args={[.5, 1.5, .5]}/>
      <meshStandardMaterial color={"#d8973d"}/>

      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry/>
        <meshStandardMaterial color={"#43d313"}/>
      </mesh>
    </mesh>
  )
}
