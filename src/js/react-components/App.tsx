import {CanvasContainer} from './CanvasContainer'
import {useState} from "react";
import {useForestActions, useLumberjackActions} from "./action-stores/action-stores";


function App() {
  const [planner, setPlanner] = useState(true);

  const {destroyForest, spawnTrees} = useForestActions();
  const {removeOne, spawnOne} = useLumberjackActions();


  return (
    <div className="Container" id={"app"}>
      <CanvasContainer planner={planner}/>

      <div className={"absolute left-0 bottom-0 p-10"}>
        {/*styled like buttons*/}
        <div className={`${planner ? "btn-gray" : "btn-green"} btn`} onClick={() => setPlanner(false)}>
          IAUS
        </div>
        <div className={`${!planner ? "btn-gray" : "btn-green"} btn`} onClick={() => setPlanner(true)}>
          Planner
        </div>
        <div className={`btn-blue btn`} onClick={() => {
          destroyForest();
          spawnTrees(10);
        }}>
          Re-Forest
        </div>
        <div className={`btn-yellow btn`} onClick={spawnOne}>
          Add Lumberjack
        </div>
        <div className={`btn-red btn`} onClick={removeOne}>
          Remove Lumberjack
        </div>
      </div>
    </div>
  )
}

export default App
