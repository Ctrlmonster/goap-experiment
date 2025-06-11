import {useSnapshot} from "valtio/react";
import React, {useMemo, useRef} from "react";
import {useFrame} from "@react-three/fiber";
import {Mesh} from "three";
import {Vector3} from "yuka";
import {Html} from "@react-three/drei";
import {posProxy, yukaEntityManager} from "../react-components/SceneContainer";
import {
  EAT_BEHAVIOR_SYMBOL,
  EXPLORE_BEHAVIOR_SYMBOL,
  REST_BEHAVIOR_SYMBOL,
  setupCharacterIAUS, setupCharacterSteering
} from "./character-setup";
import {WorldState} from "./world-state";

type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};


export function Character() {

  const randomStartPos = useMemo(() => ({x: Math.random() * 10 - 5, y: 0.5, z: Math.random() * 10 - 5}), []);
  const {wanderBehavior, seekBehavior, characterVehicle} = useMemo(() => setupCharacterSteering(randomStartPos), []);
  const {characterState, iaus, goals} = useMemo(() => setupCharacterIAUS(), []);
  const characterStateSnap = useSnapshot(characterState);
  const tick = useRef(0);
  const switchCooldown = useRef(1);

  useFrame(({clock}) => {
    if (tick.current % switchCooldown.current === 0) {
      characterState.currentGoal = iaus.evaluate(characterState);
    }

    // base stats tick up/down
    if (tick.current % 20 === 0) {
      characterState.hunger = Math.min(characterState.hunger + 1, 100);
      characterState.energy = Math.max(characterState.energy - 1, 0);
      characterState.boredom = Math.min(characterState.boredom + 1, 100);
    }

    //act based on the result
    switch (characterState.currentGoal?.name) {
      case EAT_BEHAVIOR_SYMBOL:
        /*if (tick.current % 2 === 0) {
          characterState.hunger = Math.max(characterState.hunger - 1, 0);
        }*/
        break;
      case REST_BEHAVIOR_SYMBOL:
        if (tick.current % 2 === 0) {
          characterState.energy = Math.min(characterState.energy + 1, 100);
        }
        break;

      case EXPLORE_BEHAVIOR_SYMBOL:
        if (tick.current % 2 === 0) {
          characterState.boredom = Math.max(characterState.boredom - 1, 0);
        }
        break;
    }

    tick.current++;
  });


  const charRef = useRef<Mesh>(null!);

  useFrame(({clock}, delta) => {

    // set behaviors
    wanderBehavior.active = characterState.currentGoal.name === EXPLORE_BEHAVIOR_SYMBOL;
    seekBehavior.active = characterState.currentGoal.name === EAT_BEHAVIOR_SYMBOL;

    // find the closest food
    const {i: closestIdx, dist} = posProxy.map((p, i) => ({
      i,
      dist: Math.hypot(characterVehicle.position.x - p.x, characterVehicle.position.z - p.z)
    })).sort((a, b) => a.dist - b.dist)[0];


    seekBehavior.target.copy(posProxy[closestIdx] as Vector3);


    // check if we found the target
    if (dist < 0.5) {
      posProxy[closestIdx].x = Math.random() * 40 - 20;
      posProxy[closestIdx].z = Math.random() * 40 - 20;

      characterState.hunger = Math.max(0, characterState.hunger - 70);
    }


    if (characterState.currentGoal.name === REST_BEHAVIOR_SYMBOL) {
      characterVehicle.velocity.set(0, 0, 0);
    }

    // sync
    charRef.current.position.x = characterVehicle.position.x;
    charRef.current.position.z = characterVehicle.position.z;
  });


  return (
    <mesh position={[randomStartPos.x, randomStartPos.y, randomStartPos.z]} ref={charRef}>
      <boxGeometry/>
      <meshStandardMaterial color="red"/>
      <Html sprite transform position-y={2}>
        <div className="text-3xl text-white interaction-none">
          <div className="text-red-500 w-96">Hunger: {characterStateSnap.hunger} -
            P:{goals[EAT_BEHAVIOR_SYMBOL].evaluate((characterStateSnap as Mutable<WorldState>)).toFixed(2)}</div>
          <div className="text-green-500 w-96">Energy: {characterStateSnap.energy} -
            P:{goals[REST_BEHAVIOR_SYMBOL].evaluate((characterStateSnap as Mutable<WorldState>)).toFixed(2)}</div>
          <div className="text-blue-500 w-96">Boredom: {characterStateSnap.boredom} -
            P:{goals[EXPLORE_BEHAVIOR_SYMBOL].evaluate((characterStateSnap as Mutable<WorldState>)).toFixed(2)}</div>
          <div className="text-violet-500 w-96">Goal: {characterStateSnap.currentGoal?.name.description ?? "none"}</div>
        </div>
      </Html>
    </mesh>
  )

}