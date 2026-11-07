import { setRoutes } from './path.js';
// Per-climb content: lays out each flight on demand (src/world/layout.js) and builds its meshes once.
// The first time a player meets a threat type, that instance carries its first-sight hint.
import { scene } from '../render/renderer.js';
import { ST } from '../core/state.js';
import { S } from '../save/store.js';
import { setFlight, setAllFlights } from './stair.js';
import { buildFlightMeshes } from './props.js';
import { layoutFlight } from './layout.js';
import { ENTITIES } from '../entities/registry.js';
import { setOaths } from './oaths.js';
const THREE = window.THREE;

export let runSeed = 1;
export const content = new Map();
// Everything built for the current climb lives in this group so a new climb can clear it in one go.
export const dyn = new THREE.Group(); scene.add(dyn);
const hinted = new Set();

export function flight(k){
  let c = content.get(k);
  if (!c){
    c = layoutFlight(runSeed, k, { only: ST.practice });
    for (const o of c.obs){
      const e = ENTITIES[o.type];
      if (!o.hint && e.hint && !hinted.has(o.type) && (ST.practice || !S.seen.includes(o.type))){ o.hint = e.hint; hinted.add(o.type); }
    }
    content.set(k, c); buildFlightMeshes(c); setFlight(k);
  }
  return c;
}
export function newRun(seed){
  runSeed = seed == null ? (Math.random() * 1e9) | 0 : seed;
  setRoutes(runSeed);                                  // which forks are open this climb
  content.clear(); hinted.clear();
  while (dyn.children.length) dyn.remove(dyn.children[0]);
  setOaths(runSeed, dyn);                              // where this climb's oath stones stand
  setAllFlights();
}
