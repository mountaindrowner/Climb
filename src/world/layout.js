// Pure, seeded layout of one flight: which threats, where, and where the gold is. No rendering, no state.
// Deterministic for (seed, k, opts), so a climb can be replayed and tests can check it.
//   opts.only     a threat id: a Practice run, every flight from 1 to 9 holds that threat and nothing else
//   opts.wardens  whether the Warden's stretch is reserved for its fight (defaults to the feature switch)
import { FL } from '../config/constants.js';
import { TUNE } from '../config/tuning.js';
import { FEATURES } from '../config/features.js';
import { rng } from '../core/math.js';
import { ZONES } from '../zones/index.js';
import { TUTORIAL } from '../zones/tutorial.js';
import { catalogById } from '../entities/catalog.js';
import { zoneOf, special, arenaOf, riseOf } from './path.js';

// Threats that need a gentle enough flight: a full jump must clear a hole going uphill, and a swing's uphill arc must
// pass over a crouch. Elsewhere the layout draws another threat (or leaves the slot empty).
export const MAX_RISE_FOR = { gap: 0.6, swing: 0.6 };
export const suits = (type, k) => !(type in MAX_RISE_FOR) || riseOf(k) <= MAX_RISE_FOR[type];

export const PRACTICE_FLIGHTS = 9;

export function layoutFlight(seed, k, opts = {}){
  const wardens = opts.wardens == null ? FEATURES.wardens : opts.wardens;
  const r = rng(seed * 7919 + k * 104729);
  const c = { k, obs: [], gold: [], gaps: new Set(), sp: special(k), extras: [] };
  const base = k * FL, z = zoneOf(k);
  const add = (type, t, extra) => {
    if (type === 'gap' || type === 'beam' || type === 'rockfall' || type === 'swing' || type === 'burrower') t = Math.floor(t) + (type === 'gap' ? 0.25 : 0.5);
    const o = Object.assign({ type, s: base + t, k, alive: true, done: false, st: 'idle', tm: 0, hp: 1, flash: 0, dead: 0 }, extra || {});
    if (type === 'gap') c.gaps.add(Math.floor(t));
    c.obs.push(o); return o;
  };
  const hpFor = ty => ty === 'crawler' ? (z >= TUNE.crawler.hpFromZone ? 2 : 1) : 1;
  // place up to n threats drawn from `types`, spaced so their tells never overlap
  const scatter = (n, types) => {
    let t = 1.2;
    for (let j = 0; j < n; j++){
      t += 0.8 + r() * 1.4;
      if (t > 7.2) break;
      const ok = types.filter(ty => suits(ty, k)), pick = (r() * types.length) | 0;
      if (!ok.length) break;
      const ty = suits(types[pick], k) ? types[pick] : ok[pick % ok.length];
      add(ty, t, { hp: hpFor(ty) });
      t += 1.5 + (catalogById(ty) ? catalogById(ty).space : 0);
    }
  };
  if (opts.only){
    if (k >= 1 && k <= PRACTICE_FLIGHTS && c.sp !== 'camp') scatter(2, [opts.only]);   // two a flight: flights too steep for it are skipped
  } else if (k < TUTORIAL.length){
    const tut = TUTORIAL[k]; if (tut) add(tut.type, tut.t, { hint: tut.hint });
  } else if (wardens && arenaOf(k) >= 0){
    // the Warden's stretch: it is the only threat here
  } else {
    scatter(1 + (r() < 0.55 ? 1 : 0) + (z > 0 ? 1 : 0), ZONES[z].threats);
  }
  const ng = 1 + ((r() * 2) | 0);
  for (let j = 0; j < ng; j++){
    const i = 1 + ((r() * 6) | 0);
    if (!c.gaps.has(i)) c.gold.push({ s: base + i + 0.6, taken: false });
  }
  return c;
}
