// Pure, seeded layout of one flight: which threats, where, and where the gold is. No rendering, no state.
// Deterministic for (seed, k), so a climb can be replayed and tests can check it.
import { FL } from '../config/constants.js';
import { TUNE } from '../config/tuning.js';
import { rng } from '../core/math.js';
import { ZONES } from '../zones/index.js';
import { TUTORIAL } from '../zones/tutorial.js';
import { zoneOf, special, arenaOf } from './path.js';

export function layoutFlight(seed, k){
  const r = rng(seed * 7919 + k * 104729);
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
  } else if (arenaOf(k) >= 0){
    // the Warden's stretch: it is the only threat here
  } else {
    const n = 1 + (r() < 0.55 ? 1 : 0) + (z > 0 ? 1 : 0), types = ZONES[z].threats;
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
