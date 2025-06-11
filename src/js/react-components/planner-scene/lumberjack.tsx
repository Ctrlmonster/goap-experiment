import React, {memo, useEffect, useMemo, useRef} from "react";
import {AgentPlanner} from "../../AI/planner";
import {Color, Mesh} from "three";
import {ColorTrait, IsLumberJack, LumberJackHomeMesh, MeshRef, Position} from "./planner-scene";
import {useQuery} from "koota/react";
import {Entity} from "koota";
import {AgentDashboard} from "./agent-dashboard";
import {useLumberjackActions} from "../action-stores/action-stores";
import {AgentThinkBubble} from "./agent-think-bubble";


export type CombatAgentState = {
  fireWoodAtHome: boolean;
  hasAxe: boolean;
  closeToTree: boolean;
  treeIsChopped: boolean;
  carryingBranches: boolean;
  atHome: boolean;
}


export const ChopLog = AgentPlanner.registerAction<CombatAgentState>("ChopLog", {
  requirements: {
    closeToTree: true,
    hasAxe: true,
  },
  effects: {
    treeIsChopped: true,
  }
});


export const SearchTree = AgentPlanner.registerAction<CombatAgentState>("SearchTree", {
  requirements: {
    closeToTree: false,
    hasAxe: true,
  },
  effects: {
    closeToTree: true,
    atHome: false,
  }
});

export const GetAxe = AgentPlanner.registerAction<CombatAgentState>("GetAxe", {
  requirements: {
    hasAxe: false,
  },
  effects: {
    hasAxe: true,
  }
});

export const DropAxe = AgentPlanner.registerAction<CombatAgentState>("DropAxe", {
  requirements: {
    hasAxe: true,
  },
  effects: {
    hasAxe: false,
  }
});


export const CollectBranches = AgentPlanner.registerAction<CombatAgentState>("CollectBranches", {
  requirements: {
    treeIsChopped: true,
    hasAxe: false,
    closeToTree: true,
  },
  effects: {
    carryingBranches: true,
    treeIsChopped: false,
    closeToTree: false,
  }
});

export const WalkHome = AgentPlanner.registerAction<CombatAgentState>("WalkHome", {
  requirements: {
    atHome: false,
  },
  effects: {
    atHome: true,
    closeToTree: false,
  }
});

export const DeliverBranches = AgentPlanner.registerAction<CombatAgentState>("DeliverBranches", {
  requirements: {
    carryingBranches: true,
    atHome: true,
  },
  effects: {
    carryingBranches: false,
    fireWoodAtHome: true,
  }
});

export const lumberJackActions = [
  ChopLog, GetAxe, CollectBranches, DeliverBranches, WalkHome, SearchTree, DropAxe
];


const Lumberjack = memo(function Lumberjack({entity}: { entity: Entity }) {

  const initPosition = useMemo(() => entity.get(Position), [entity]);
  const color = useMemo(() => entity.get(ColorTrait), [entity]);

  useEffect(() => {
    entity.add(MeshRef({ref: charRef.current}));
    return () => entity.remove(MeshRef);
  }, [entity]);


  const charRef = useRef<Mesh>(null!);

  return (
    <mesh ref={charRef} position-x={initPosition.x} position-y={0.5} position-z={initPosition.z}>
      <boxGeometry/>
      <meshStandardMaterial color={color.ref}/>
      <AgentDashboard entity={entity}/>
      <AgentThinkBubble entity={entity}/>
    </mesh>
  )
});


export function Lumberjacks() {
  const {spawnOne, removeOne} = useLumberjackActions();
  const lumberjacks = useQuery(IsLumberJack, Position);

  useEffect(() => {
    console.log(`%cThere are now: ${lumberjacks.length} lumberjacks.`, "color: limegreen");
  }, [lumberjacks]);

  useEffect(() => {
    spawnOne();
    return removeOne;
  }, []);

  return (
    <>
      {lumberjacks.map((entity) => {
        return (
          <group key={entity}>
            <Lumberjack entity={entity as Entity}/>
            <LumberjackHome entity={entity as Entity}/>
          </group>
        )
      })}
    </>
  )
}


function LumberjackHome({entity}: { entity: Entity }) {
  const spawnPos = useMemo(() => entity.get(Position), [entity]);
  const color = useMemo(() => entity.get(ColorTrait), [entity]);
  const meshRef = useRef<Mesh>(null!);

  useEffect(() => {
    entity.add(LumberJackHomeMesh({ref: meshRef.current}));
    return () => entity.remove(LumberJackHomeMesh);
  }, [entity]);

  return (
    <mesh ref={meshRef} position={[spawnPos.x, 1, spawnPos.z]}>
      <boxGeometry args={[2, 2, 2]}/>
      <meshStandardMaterial transparent opacity={0.7} color={color.ref}/>
      <mesh position-y={1.5} rotation-y={Math.PI / 4}>
        <cylinderGeometry args={[0.01, 1.42, 1, 4, 1]}/>
        <meshStandardMaterial color={"red"} transparent opacity={0.7}/>
      </mesh>
    </mesh>
  )

}























