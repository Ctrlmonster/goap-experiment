// =========================================================================================

export type BaseAgentStateType = Record<string, boolean | number | string>;
export type ActionRequirements<T extends BaseAgentStateType> = Partial<T>;
export type ActionEffects<T extends BaseAgentStateType> = Partial<T>;

export interface AgentAction<T extends BaseAgentStateType> {
  requirements: ActionRequirements<T>;
  effects: ActionEffects<T>;
}

function spliceWithoutInserting(array: Array<any>, startIndex: number, endIndex: number) {
  return array.splice(startIndex, endIndex - startIndex);
}

// =========================================================================================


export class AgentPlanner<T extends BaseAgentStateType> {
  static #nameByAction = new WeakMap();

  static registerAction<T extends BaseAgentStateType>(name: string, action: AgentAction<T>) {
    AgentPlanner.#nameByAction.set(action, name);
    return Object.freeze(action);
  }

  static getActionName(action: AgentAction<any>): string | undefined {
    return AgentPlanner.#nameByAction.get(action);
  }

  // ____________________________________________________________________

  _debug = false;

  constructor(public actions: AgentAction<T>[]) {
    // validate that each action has a unique name
    const usedNames = new Set();
    this.actions.forEach(action => {
      const name = AgentPlanner.getActionName(action);
      if (usedNames.has(name)) {
        throw new Error(`name '${name}' exists more than once in list of action that was passed for construction`);
      }
      usedNames.add(name);
    });
  }

  // ____________________________________________________________________


  generatePlan(goalState: Partial<T>, currentState: Partial<T>, iterationTimeout = 1000): {
    resultState: Partial<T>,
    path: AgentAction<T>[]
  } | null {
    const maxIter = iterationTimeout;
    const now = performance.now();

    const startState: Readonly<Partial<T>> = Object.assign({}, currentState);

    const stateStack: { state: Partial<T>; path: AgentAction<T>[], stateProgression: Partial<T>[] }[] = [{
      state: startState,
      path: [],
      stateProgression: [startState]
    }];
    //const visitedStates = new WeakSet();
    const goalEntries = Object.entries(goalState);
    let result: { resultState: Partial<T>, path: AgentAction<T>[], stateProgression: Partial<T>[] } | null = null;


    let i = 0;
    while (i < maxIter && stateStack.length) {
      const {state: currentState, path: actionPath, stateProgression} = stateStack.pop()!;

      // todo: this is impossible since we create new state objects – think about a different way of encoding for reaching the same state
      //if (visitedStates.has(currentState)) continue;
      //visitedStates.add(currentState);


      if (this._debug) console.log("Current State:", currentState);


      // check if we found the goal state
      const isGoalState = goalEntries.every(
        ([key, value]) => currentState[key as keyof T] === value);

      // yay, we found a path!
      if (isGoalState) {
        if (this._debug) console.log("found path:");
        if (this._debug) console.log(actionPath.map(action => AgentPlanner.getActionName(action)!));
        //console.log(`found path in ${performance.now() - now} ms`);
        result = {path: actionPath, resultState: currentState, stateProgression};
        break;
      }


      // ~ keep searching ~


      // find all actions leaving this state (we shuffle to prevent infinite loops)
      const currentActions = this.actions
        .sort(() => Math.random() - 0.5)
        .filter(action => this.checkIfActionPossible(action, currentState));


      if (this._debug) console.log("current actions:", currentActions.map(action => AgentPlanner.getActionName(action)!));


      // use each action to calculate a new state
      // Use each action to calculate a new state
      currentActions.forEach(action => {
        const newState = Object.assign({}, currentState, action.effects);
        stateStack.push({
          state: newState,
          path: [...actionPath, action],
          stateProgression: [...stateProgression, newState]
        });
      });

      i++;
    }

    // -------------------------------------------------------------------------------------------
    // we check if we can prune the plan, i.e. remove unnecessary steps

    if (result) {

      this._pruneGeneratedPath(result.stateProgression, result.path, result);

      // after the new –pruned– path has been found, we compute the new resultState
      // by transforming init state to result state once:
      let finalState = Object.assign({}, startState);
      result.path.forEach(action => {

        // test that the requirements are satisfied as a last check
        // to find out if we've built an invalid path!

        if (!this.checkIfActionPossible(action, finalState)) {
          console.error(result!.path.map(action => AgentPlanner.getActionName(action)!));
          console.error(result!.path);
          throw new Error(`Build invalid path! see above`)
        }

        Object.assign(finalState, action.effects);
      });
      result.resultState = finalState;
    }

    // -------------------------------------------------------------------------------------------

    if (result === null && this._debug) console.log(`No path found! - took ${performance.now() - now} ms to search`);
    return result;
  }


  _pruneGeneratedPath(stateProgression: Partial<T>[], actionHistory: AgentAction<T>[], result: {
    resultState: Partial<T>,
    path: AgentAction<T>[],
    stateProgression: Partial<T>[]
  }): void {
    if (this._debug) console.log("=====================");

    const originalLen = actionHistory.length;

    for (let stateIdx = stateProgression.length - 1; stateIdx >= 1; stateIdx--) {
      const actionWeTookToReachThisState = actionHistory[stateIdx - 1];


      // search for the earliest index where this action would actually have been possible
      if (this._debug) console.log(actionHistory[stateIdx - 1], stateIdx);
      if (this._debug) console.log(`Testing action: ${AgentPlanner.getActionName(actionWeTookToReachThisState)} - stateIdx: ${stateIdx}`);


      const requirementEntries = Object.entries(actionWeTookToReachThisState.requirements);
      let stateIdxWithRequirementsUnfulfilled = -1;

      for (let testStateIdx = 0; testStateIdx < stateIdx - 1; testStateIdx++) {
        // find the previous action that enabled this action by finding the first state
        // where it's possible to execute this action
        const earlierState = stateProgression[testStateIdx];
        const ownRequirementsSatisfied = requirementEntries.every(([key, value]) => earlierState[key] === value);


        // second test - it's not enough to check our own requirements, which may be satisfied
        // way earlier in the plan (but serve as a good first heuristic). To make sure, we have
        // to take if it's possible to go from the proposed action index all the way to the end
        // and satisfy all requirements along the way
        let secondTestPassed = true;
        if (ownRequirementsSatisfied && (testStateIdx + 1) !== stateIdx) {
          let testState = Object.assign({}, stateProgression[testStateIdx], actionHistory[stateIdx - 1].effects);


          if (this._debug)
            console.log(`%cdoing second test:
              trying move action ${AgentPlanner.getActionName(actionHistory[stateIdx - 1])}:
              from idx: ${stateIdx - 1}
              to idx: ${testStateIdx} (test: ${AgentPlanner.getActionName(actionHistory[testStateIdx])})`, "color: violet");

          // applying actions from action[stateIdx] until the end
          for (let j = stateIdx; j < actionHistory.length; j++) {
            const nextAction = actionHistory[j];
            /*const allGiven = Object.entries(nextAction.requirements)
              .every(([key, value]) => testState[key] === value);*/

            const allGiven = this.checkIfActionPossible(nextAction, testState);

            if (this._debug)
              console.log(`test if ${AgentPlanner.getActionName(nextAction)} is possible from state[${(testStateIdx + 1)}]: ${allGiven}
              `, testState, `
              `, nextAction.requirements);

            // in that case apply the action
            if (allGiven) {
              Object.assign(testState, nextAction.effects);
            } else {
              secondTestPassed = false;
              if (this._debug) console.log("%c========SECOND TEST FAILED===========", "color: red");
              break;
            }
          }
          if (this._debug && secondTestPassed) console.log("%c========SECOND TEST PASSED===========", "color: violet");
        }

        if (ownRequirementsSatisfied && secondTestPassed && (testStateIdx + 1) !== stateIdx) {
          if (this._debug) console.log(`found the first state that fulfilled these requirements: 
            action idx: ${testStateIdx} ${AgentPlanner.getActionName(actionHistory[testStateIdx])} – state idx: ${stateIdx}`);
          /*console.log("the state that failed the requirements was:", Object.assign({}, earlierState));
          console.log("the requirements are:", Object.assign({}, actionWeTookToReachThisState.requirements));
          console.log("----");*/
          if (this._debug) console.log("----")

          stateIdxWithRequirementsUnfulfilled = testStateIdx;
          break;
        }
      }


      if (stateIdxWithRequirementsUnfulfilled !== -1) {
        if (this._debug) console.log("%c!!!!!", "color: green");
        if (this._debug) console.log(`new state Idx:${stateIdxWithRequirementsUnfulfilled} - old state stateIdx was ${stateIdx}`);

        spliceWithoutInserting(actionHistory, stateIdxWithRequirementsUnfulfilled, stateIdx - 1);
        if (this._debug) console.log("updated actions:");
        if (this._debug) console.log(actionHistory.slice().map(action => AgentPlanner.getActionName(action)));

        spliceWithoutInserting(stateProgression, stateIdxWithRequirementsUnfulfilled + 1, stateIdx);
        if (this._debug) console.log("updated states:");
        if (this._debug) console.log(stateProgression.slice());

        stateIdx = stateIdxWithRequirementsUnfulfilled + 1;
      }
    }

    const newLen = result.path.length;
    //console.log(`Pruned path from original length ${originalLen} to ${newLen}`);

    if (this._debug) console.log("pruned path:");
    if (this._debug) console.log(result.path.map(action => AgentPlanner.getActionName(action)!));
  }


  checkIfActionPossible(action: AgentAction<T>, state: Partial<T>): boolean {
    return Object.entries(action.requirements).every(([key, value]) => state[key as keyof T] === value);
  }

}

































