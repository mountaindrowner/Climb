// Per-climb content: lays out each flight on demand (src/world/layout.js) and builds its meshes once.
import { scene } from '../render/renderer.js';
import { setFlight, setAllFlights } from './stair.js';
import { buildFlightMeshes } from './props.js';
import { layoutFlight } from './layout.js';
const THREE = window.THREE;

export let runSeed = 1;
export const content = new Map();
// Everything built for the current climb lives in this group so a new climb can clear it in one go.
export const dyn = new THREE.Group(); scene.add(dyn);

export function flight(k){
  let c = content.get(k);
  if (!c){ c = layoutFlight(runSeed, k); content.set(k, c); buildFlightMeshes(c); setFlight(k); }
  return c;
}
export function newRun(seed){
  runSeed = seed == null ? (Math.random() * 1e9) | 0 : seed;
  content.clear();
  while (dyn.children.length) dyn.remove(dyn.children[0]);
  setAllFlights();
}
