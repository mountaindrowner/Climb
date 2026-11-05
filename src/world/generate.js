// Procedural content per flight: hazards, enemies and gold, seeded per climb. The first five flights are the tutorial.
import { FL, ZF } from '../config/constants.js';
import { TUNE } from '../config/tuning.js';
import { rng } from '../core/math.js';
import { scene } from '../render/renderer.js';
import { zoneOf, special } from './path.js';
import { setFlight, setAllFlights } from './stair.js';
import { buildFlightMeshes } from './props.js';
const THREE = window.THREE;

export let runSeed = 1;
export const content = new Map();
// Everything built for the current climb lives in this group so a new climb can clear it in one go.
export const dyn = new THREE.Group(); scene.add(dyn);

export function flight(k){
  let c = content.get(k);
  if (!c){ c = gen(k); content.set(k, c); buildFlightMeshes(c); setFlight(k); }
  return c;
}
export function newRun(){
  runSeed = (Math.random() * 1e9) | 0;
  content.clear();
  while (dyn.children.length) dyn.remove(dyn.children[0]);
  setAllFlights();
}

const TUTORIAL = [
  null,
  { type: 'gap',     t: 4.3, hint: 'Tap ▲ to jump the broken step' },
  { type: 'beam',    t: 4.5, hint: 'Tap ▼ to duck under the beam' },
  { type: 'crawler', t: 5.3, hint: 'Tap A before it lunges. Late? Tap B to block it, then strike.' },
  { type: 'spitter', t: 4.6, hint: 'Tap B to block. Tap it right as the spit lands to parry.' },
];
// Which threats a zone draws from. Later zones add their own spawns here (see docs/design/direction.md, Environmental spawns).
const POOL_BY_ZONE = z => z === 0 ? ['gap', 'beam', 'crawler', 'crawler', 'spitter'] : ['gap', 'beam', 'crawler', 'crawler', 'spitter', 'spitter'];

function gen(k){
  const r = rng(runSeed * 7919 + k * 104729);
  const c = { k, obs: [], gold: [], gaps: new Set(), sp: special(k), extras: [] };
  const base = k * FL, z = zoneOf(k);
  const add = (type, t, extra) => {
    if (type === 'gap' || type === 'beam') t = Math.floor(t) + (type === 'gap' ? 0.25 : 0.5);
    const o = Object.assign({ type, s: base + t, k, alive: true, done: false, st: 'idle', tm: 0, hp: 1, flash: 0, dead: 0 }, extra || {});
    if (type === 'gap') c.gaps.add(Math.floor(t));
    c.obs.push(o); return o;
  };
  if (k < TUTORIAL.length){
    const tut = TUTORIAL[k]; if (tut) add(tut.type, tut.t, { hint: tut.hint });
  } else if (c.sp === 'boss'){
    add('crawler', 3.4, { hp: 1 });
  } else {
    const n = 1 + (r() < 0.55 ? 1 : 0) + (z > 0 ? 1 : 0), types = POOL_BY_ZONE(z);
    let t = 1.2;
    for (let j = 0; j < n; j++){
      t += 0.8 + r() * 1.4;
      if (t > 7.2) break;
      const ty = types[(r() * types.length) | 0];
      add(ty, t, { hp: ty === 'crawler' ? (z >= TUNE.crawler.hpFromZone ? 2 : 1) : 1 });
      t += 1.5;
    }
  }
  const ng = 1 + ((r() * 2) | 0);
  for (let j = 0; j < ng; j++){
    const i = 1 + ((r() * 6) | 0);
    if (!c.gaps.has(i)) c.gold.push({ s: base + i + 0.6, taken: false });
  }
  return c;
}
