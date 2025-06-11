import {OrbitControls} from "@react-three/drei";
import {useFrame, useThree} from "@react-three/fiber";
import {SceneLights} from "./SceneLights";
import {ViewportHelper} from "../helper/ViewportHelper";
import React from "react";
import {proxy} from "valtio/vanilla";
import {useSnapshot} from "valtio/react";
import {EntityManager} from "yuka";
import {Character} from "../AI/character";
import {PlannerScene} from "./planner-scene/planner-scene";
import {AgentPlanner} from "../AI/planner";


// ================================================================================================================
// ================================================================================================================
// ================================================================================================================


export const yukaEntityManager = new EntityManager();


export const posProxy = proxy(
  Array.from({length: 10}).map(() => ({x: Math.random() * 40 - 20, y: 0, z: Math.random() * 40 - 20}))
);

function Foods() {
  const pos = useSnapshot(posProxy);

  return (
    <>
      {pos.map(({x, y, z}, i) => (
        <mesh key={i} position={[x, y, z]} scale={0.3}>
          <sphereGeometry/>
          <meshStandardMaterial color={"green"}/>
        </mesh>
      ))}
    </>
  )
}


export function SceneContainer({planner}: { planner: boolean }) {

  useFrame((state, delta) => {
    yukaEntityManager.update(delta);
  })


  return (
    <>
      {
        planner ? <PlannerScene/> : <IAUSScene/>
      }

      <ViewportHelper showGizmo={true} showGrid={true}/>
      <OrbitControls/>
      <SceneLights/>
    </>
  )
}


function IAUSScene() {


  return (
    <>
      <Character/>
      <Foods/>

      <mesh castShadow={true} receiveShadow={true} rotation-x={-Math.PI / 2} position={[0, 0, 0]}>
        <planeGeometry args={[50, 50]}/>
        <meshPhongMaterial color="navy"/>
      </mesh>
    </>
  )
}























