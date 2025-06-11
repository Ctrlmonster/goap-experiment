

// Setup world state
import {WorldState} from "../world-state";
import {IAUS} from "../iaus";
import {Goal} from "../goal";
import {GOAPPlanner} from "./goap-planner";
import {Action} from "./action";
import {Agent} from "./agent";

const worldState = new WorldState({
  hunger: 50,
  health: 90,
  ammo: 3,
  energy: 10,
}); // hunger: 50, health: 80, danger: 10, ammo: 3

// Setup IAUS (Infinite Axis Utility System)
const iaus = new IAUS();

// Define dynamic goals with priority functions
iaus.addGoal(new Goal('Eat', (ws: WorldState) => ws.hunger * 10));
iaus.addGoal(new Goal('Fight', (ws: WorldState) => ws.energy * ws.ammo * 8));
iaus.addGoal(new Goal('Heal', (ws: WorldState) => (100 - ws.health) * 5));

// Setup GOAPPlanner (Goal-Oriented Action Planning)
const goapPlanner = new GOAPPlanner();

const findFood = new Action('Find Food', 1);
findFood.addPrecondition('hunger', 50);
findFood.addEffect('hunger', 0);
goapPlanner.addAction(findFood);

const fightEnemy = new Action('Fight Enemy', 3);
fightEnemy.addPrecondition('ammo', 1);
fightEnemy.addEffect('danger', 0);
goapPlanner.addAction(fightEnemy);

const findMedkit = new Action('Find Medkit', 2);
findMedkit.addPrecondition('health', 80);
findMedkit.addEffect('health', 100);
goapPlanner.addAction(findMedkit);

// Setup Agent
const agent = new Agent(iaus, goapPlanner, worldState);

// Run update cycle
agent.update(); // Evaluates IAUS, picks goal, and executes GOAP plan
