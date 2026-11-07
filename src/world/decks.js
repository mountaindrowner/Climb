// Platforming on the stair's own lane: ledges (decks) at the stair's radius, in the same distance `s` as the stair
// beneath them, each a flat top over a span of s. One-way, as in a side-scroller: he lands on one from above and jumps up
// through it from below; and he can catch a ledge's edge and haul himself up (motor.js, the mantle: hands reach MANTLE
// above his feet), which is how a ledge can hang high enough for a man to walk under it and still be reached.
//
// What is built from them, drawn anew for each climb (setDecks):
//  - Platforming flights: on a flight or two of each region the stair is gone; ledges cross the gap from one landing to
//    the next, some of them crumbling under him. Fall and you drop to whatever is below.
//  - Switchbacks, the forks: from a fork landing a ledge hangs overhead; catch it, and a run of ledges climbs back the
//    other way over the stair you came up, to come out through a broken gap in the stair a turn above.
// Holes in the stair itself (a platforming flight's missing steps, the gap a switchback comes up through) are listed here
// too; ground.js reports them like any broken step, and stair.js leaves their steps out.
// Pure: no page. Seeded, so a climb can be replayed and tests can check every ledge can be reached.
import { F, FL, ZF, MAXK, OMEGA } from '../config/constants.js';
import { FEATURES } from '../config/features.js';
import { flightY, landingY, landingS, topAt, special, arenaOf, BRANCHES, HALLS } from './path.js';

export const TURN = 2 * Math.PI / OMEGA;           // the distance along the stair of one full turn
export const MANTLE = 2.0;                         // how far above his feet he can catch an edge and pull up
export const LEDGE = { thick: 0.45, headroom: 2.3 };   // a ledge's thickness; the clear height a man needs under one
export const DECKS = [], HOLES = [];
let byFlight = new Map();
const rng = seed => { let h = (seed >>> 0) || 1; return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 100000) / 100000; }; };
const blockBottom = s => topAt(s + TURN) - 1.4;    // the underside of the stair a turn above (its blocks are 1.4 deep)

// ---- the platforming flights of a climb: one or two a region, never near a fork, a landmark or the tutorial
const PLAT_L = [5, 6, 11, 12, 13];
export function platformFlights(seed, practice){
  if (practice) return [];
  const out = [];
  for (let z = 0; z * ZF < MAXK; z++){
    const r = rng(seed * 7 + z * 131 + 11), pool = PLAT_L.map(l => z * ZF + l).filter(k => k >= 5 && k < MAXK - 1 && !(FEATURES.wardens && arenaOf(k) >= 0));
    const n = 1 + (r() < 0.5 ? 1 : 0);
    for (let i = 0; i < n && pool.length; i++){ const k = pool.splice(Math.floor(r() * pool.length), 1)[0]; if (!out.some(o => Math.abs(o - k) < 2)) out.push(k); }
  }
  return out.sort((a, b) => a - b);
}
// The ledges across flight k, from the landing below it (at flightY(k)) to its own landing: each one reachable from
// the last by a running jump (a gap up to 1.2, a rise up to 1.0) or, for a bigger rise, by a jump and a haul up from
// close by.
export function platformLedges(seed, k){
  const r = rng(seed * 31 + k * 977 + 5), y0 = flightY(k), y1 = landingY(k), s0 = k * FL, out = [];
  let x = 0.15, y = y0;                                         // the step off the landing below
  for (let guard = 0; guard < 12 && x < F - 1.6; guard++){
    const left = F - x, gap = 0.7 + r() * 0.45, len = Math.min(left - gap - 0.6, 0.9 + r() * 0.6);
    if (len < 0.8) break;
    const need = (y1 - y) / Math.max(1, Math.round(left / 2.2));    // what is left to climb, spread over what is left to cross
    const rise = Math.max(-0.4, Math.min(need > 1.0 ? Math.min(2.2, need) : 1.0, need + (r() - 0.5) * 0.6));
    const big = rise > 1.0;                                       // a haul up: then the gap is short
    const g = big ? 0.35 + r() * 0.2 : gap;
    out.push({ s0: s0 + x + g, s1: s0 + x + g + len, top: y + rise, kind: out.length && r() < 0.35 ? 'crumble' : 'ledge' });
    x += g + len; y += rise;
  }
  // the last ledge reaches to within a jump of the landing (a short step if the landing is well above it)
  const last = out[out.length - 1];
  if (last){ const want = y1 - last.top > 1.0 ? 0.45 : 0.9; if (F - (last.s1 - s0) > want) last.s1 = s0 + F - want; }
  return out;
}
// ---- the switchbacks. From fork landing kA a ledge hangs over the landing's near end, high enough to walk under, low
// enough to catch from a jump; then ledges climb leftward over the stair below, each catchable from the last, until one
// waits under a gap broken in the stair a turn above: jump up through it and he is on that stair, far up the shaft.
export function switchback(kA){
  const sL = kA * FL + F, yA = landingY(kA), out = [];
  out.push({ s0: sL - 0.35, s1: sL + 1.05, top: yA + 2.9, kind: 'switch' });
  let cur = out[0];
  for (let guard = 0; guard < 40; guard++){
    // close enough under the stair above: the last ledge, under a gap broken in it
    const sF1 = cur.s0 - 0.45, sF0 = sF1 - 1.2, topF = topAt(sF1 + 0.4 + TURN) - 1.15;
    const h0 = sF0 - 0.1 + TURN, h1 = sF1 + 0.3 + TURN, hk = Math.floor(h0 / FL), t0 = h0 - hk * FL, t1 = h1 - hk * FL;
    const onSteps = t0 > 0.6 && t1 < F - 0.6 && !special(hk) && !special(hk - 1);   // the gap breaks a flight's steps, never a landing
    if (topF - cur.top <= MANTLE + 1.3 && onSteps){
      out.push({ s0: sF0, s1: sF1, top: topF, kind: 'switch', last: true });
      return { kA, ledges: out, hole: { s0: h0, s1: h1 } };
    }
    const gap = 0.75 + (guard % 3) * 0.15, len = 1.3 + (guard % 2) * 0.3, s1 = cur.s0 - gap, s0 = s1 - len;
    let room = Infinity; for (let x = s0; x <= s1 + 1e-6; x += 0.1) room = Math.min(room, blockBottom(x) - LEDGE.headroom);   // a man standing on it must clear the stair above
    const top = Math.min(cur.top + 0.95, room);                              // up, or level (or down a little) where the stair above comes low
    if (s0 < 1) return null;
    cur = { s0, s1, top, kind: 'switch' }; out.push(cur);
  }
  return null;
}
const SWITCH = new Map();   // kA -> switchback, built once (the stair does not change between climbs)
for (const b of BRANCHES){ const sw = switchback(b.kA); if (sw) SWITCH.set(b.kA, sw); }
export const switchbackOf = kA => SWITCH.get(kA) || null;

// ---- this climb's decks and holes
const add = d => { d.id = DECKS.length; d.t = 0; d.gone = 0; DECKS.push(d); for (let f = Math.floor(d.s0 / FL); f <= Math.floor(d.s1 / FL); f++){ (byFlight.get(f) || byFlight.set(f, []).get(f)).push(d); } return d; };
export function setDecks(seed, practice){
  DECKS.length = 0; HOLES.length = 0; byFlight = new Map();
  const forkHoleK = new Set();
  if (!practice) for (const b of BRANCHES){
    const sw = SWITCH.get(b.kA); if (!sw || !b.open) continue;
    for (const d of sw.ledges) add({ ...d, k: b.kA, owner: 'fork', fork: b });
    HOLES.push({ ...sw.hole, k: Math.floor(sw.hole.s0 / FL), fork: b }); forkHoleK.add(Math.floor(sw.hole.s0 / FL));
  }
  for (const k of platformFlights(seed, practice)){
    if (forkHoleK.has(k)) continue;                                 // a switchback comes up through this flight: it keeps its steps
    HOLES.push({ s0: k * FL, s1: k * FL + F, k, platform: true });
    for (const d of platformLedges(seed, k)) add({ ...d, k, owner: 'flight' });
  }
  HOLES.sort((a, b) => a.s0 - b.s0);
}
// a closed fork opened mid-climb (the ram): its ledges and its gap, now; returns the new ledges
export function openFork(b){
  const sw = SWITCH.get(b.kA); if (!sw) return [];
  const out = sw.ledges.map(d => add({ ...d, k: b.kA, owner: 'fork', fork: b }));
  HOLES.push({ ...sw.hole, k: Math.floor(sw.hole.s0 / FL), fork: b }); HOLES.sort((p, q) => p.s0 - q.s0);
  return out;
}
export const isPlatformFlight = k => HOLES.some(h => h.platform && h.k === k);
// the stair's own holes: where its steps are missing for good this climb
export const stairHole = s => { for (const h of HOLES) if (s > h.s0 && s < h.s1) return h; return null; };
export const holeFlights = () => new Set(HOLES.map(h => Math.floor(h.s0 / FL)).concat(HOLES.map(h => Math.floor((h.s1 - 1e-6) / FL))));
// the ledges over s (still standing)
export function decksAt(s){ const l = byFlight.get(Math.floor(s / FL)); return l ? l.filter(d => !d.gone && s >= d.s0 && s <= d.s1) : []; }
export const decksNear = (s0, s1) => { const out = new Set(); for (let f = Math.floor(s0 / FL); f <= Math.floor(s1 / FL); f++) for (const d of byFlight.get(f) || []) if (!d.gone && d.s1 >= s0 && d.s0 <= s1) out.add(d); return [...out]; };
