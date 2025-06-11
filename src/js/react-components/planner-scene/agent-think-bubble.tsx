import React, {useMemo, useRef} from "react";
import {Html} from "@react-three/drei";
import {Entity} from "koota";
import {ChopLog, CollectBranches, DeliverBranches, GetAxe, SearchTree, WalkHome} from "./lumberjack";
import {useObserve} from "koota/react";
import {Planner} from "./planner-scene";
import {AgentPlanner} from "../../AI/planner";
import {useFrame} from "@react-three/fiber";


// (can use multiple emojis per state)
const EMOJI_DICTIONARY = {
  ["WalkHome"]: "🏠",
  ["GetAxe"]: "🪓",
  ["SearchTree"]: "🌲",
  ["ChopLog"]: "🪓🌲",
  ["CollectBranches"]: "🪵",
  ["DeliverBranches"]: "🚚🪵",
}


export function AgentThinkBubble({entity}: { entity: Entity }) {

  const {currentPlan} = useObserve(entity, Planner);
  const nextStep = useMemo(() => currentPlan[0] ?? "", [currentPlan]);
  const bubbleRef = useRef<HTMLDivElement>(null!);

  useFrame(() => {
    if (bubbleRef.current)
      bubbleRef.current.innerHTML = `${AgentPlanner.getActionName(currentPlan[0]) 
        ? EMOJI_DICTIONARY[(AgentPlanner.getActionName(currentPlan[0]) as keyof typeof EMOJI_DICTIONARY)] 
        : ""}`;
  });

  return (
    <Html>
      <div className={`border rounded-3xl bg-amber-50 p-5 text-3xl opacity-70`}>
        Thinking: <div ref={bubbleRef}>{AgentPlanner.getActionName(nextStep)}</div>
      </div>
    </Html>
  )

}