import {Html} from "@react-three/drei";
import Collapse from "rc-collapse";
import {AgentAction, AgentPlanner} from "../../AI/planner";
import React, {useState} from "react";
import {CombatAgentState} from "./lumberjack";
import {useObserve} from "koota/react";
import {CurrentState, GoalState, Planner} from "./planner-scene";
import {Entity} from "koota";


// (can use multiple emojis per state)
const EMOJI_DICTIONARY: Record<keyof CombatAgentState, string> = {
  atHome: "🙋‍♂️@🏠",
  hasAxe: "🪓",
  closeToTree: "📏🌲",
  treeIsChopped: "📏🪵",
  carryingBranches: "🚚🪵",
  fireWoodAtHome: "🔥@🏠"
}



export function AgentDashboard({entity}: {entity: Entity}) {
  const [isOpened, setIsOpened] = useState(false);

  const currentState = useObserve(entity, CurrentState);
  const targetState = useObserve(entity, GoalState);
  const planner = useObserve(entity, Planner);


  return (
    <Html sprite transform zIndexRange={[1000, 1]} position-y={2} style={{
      zIndex: isOpened ? 1000 : 1
    }}>
      <Collapse accordion={true} items={[
        {
          label: <div onClick={() => {
            console.log("is open:", !isOpened);
            setIsOpened(!isOpened)
          }}>Dashboard</div>,
          children: <>
            <div style={{}} className="text-3xl interaction-none flex">
              <div>
                <div className="text-yellow-300 w-56 mb-5 p-2 mr-5" style={{
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  borderRadius: "0.5rem",
                }}>Current State:
                  <div className={"text-xl text-white"}>{
                    Object.entries(currentState).map(([key, value]) => <div
                      className={`flex w-full justify-between pr-2.5`}
                      key={key}>
                      <div>– {EMOJI_DICTIONARY[key as keyof CombatAgentState]}:</div>
                      <div>{value ? "✅" : "❌"}</div>
                    </div>)
                  }</div>
                </div>

                <div className="text-green-500 w-56 mb-5 p-2" style={{
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  borderRadius: "0.5rem",
                }}>Goal State:
                  <div className={"text-xl text-white"}>{
                    Object.entries(targetState).map(([key, value]) => <div
                      className={`flex w-full justify-between pr-2.5`}
                      key={key}>
                      <div>– {EMOJI_DICTIONARY[key as keyof CombatAgentState]}:</div>
                      <div>{value ? "✅" : "❌"}</div>
                    </div>)
                  }</div>
                </div>
              </div>


              <div className="text-red-500 w-56 mb-5 p-2" style={{
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                borderRadius: "0.5rem",
              }}>Plan:
                <div className={"text-xl text-white"}>{
                  planner.currentPlan.map((step: AgentAction<CombatAgentState>) => <div
                    key={AgentPlanner.getActionName(step)}>– {AgentPlanner.getActionName(step)}</div>)
                }</div>
              </div>
            </div>
          </>
        }
      ]}/>
    </Html>
  )

}