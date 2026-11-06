// The spiral path: where a distance `s` along the stair sits in the world, and the fixed landmarks on it.
import { F, LAND, FL, ZF, ZH, MPU, OMEGA, GRADE, MAXK, LIFT_FLIGHT, CAMP_FLIGHT, BOSS_FLIGHT, ARENA_FLIGHTS } from '../config/constants.js';
import { ZONES } from '../config/zones.js';
import { smooth } from '../core/math.js';
import { S } from '../save/store.js';
import { FEATURES } from '../config/features.js';

export const zoneOf = k => Math.min(ZONES.length - 1, Math.max(0, Math.floor(k / ZF)));
export function special(k){
  const l = k % ZF;
  return l === LIFT_FLIGHT ? 'lift' : l === CAMP_FLIGHT ? 'camp' : l === BOSS_FLIGHT ? 'boss' : null;
}
export const bossFlight = z => z * ZF + BOSS_FLIGHT;
// The Warden's flight if k lies in its stretch, else -1. The stretch is the ARENA_FLIGHTS flights ending at the gate.
export function arenaOf(k){ const l = k % ZF; return l > BOSS_FLIGHT - ARENA_FLIGHTS && l <= BOSS_FLIGHT ? k - l + BOSS_FLIGHT : -1; }
export const landingS = k => k * FL + F + LAND * 0.5;   // path distance of the middle of flight k's landing
// The grade: flight k's rise per step (the zone's pattern, rotated by zone), and the height its first step starts from.
export const riseOf = k => { const z = Math.max(0, Math.floor(k / ZF)), l = ((k % ZF) + ZF) % ZF; return GRADE[(l + z * 4) % ZF]; };
const BASE = new Float64Array(MAXK + 2);
for (let k = 0; k <= MAXK; k++) BASE[k + 1] = BASE[k] + F * riseOf(k);
export const flightY = k => k <= 0 ? 0 : k <= MAXK + 1 ? BASE[k] : BASE[MAXK + 1] + (k - MAXK - 1) * ZH / ZF;
export const landingY = k => flightY(k + 1);            // height of flight k's landing (the top of its last step)
// The flight whose climb a height falls in (the inverse of flightY).
export function kAtY(y){
  if (y <= 0) return 0;
  let lo = 0, hi = MAXK + 1;
  while (lo < hi){ const m = (lo + hi + 1) >> 1; if (BASE[m] <= y) lo = m; else hi = m - 1; }
  return lo;
}
export const meters = y => Math.max(0, Math.floor(y * MPU));

// Position on the path at distance s: flight k, step i, fraction fr through that step, angle a, height y.
export function posOf(s){
  if (s < 0) s = 0;
  const k = Math.floor(s / FL), t = s - k * FL, base = flightY(k), rise = riseOf(k), a = s * OMEGA;
  if (t < F){
    const i = Math.floor(t), fr = t - i, e = smooth(Math.min(1, fr / 0.42));
    return { k, t, i, fr, a, y: base + rise * (i + e), land: false, rise };
  }
  return { k, t, i: -1, fr: 0, a, y: base + F * rise, land: true, u: (t - F) / LAND, rise };
}
// Height of the step surface under distance s.
export function topAt(s){
  const k = Math.floor(s / FL), t = s - k * FL;
  return t < F ? flightY(k) + (Math.floor(t) + 1) * riseOf(k) : flightY(k + 1);
}
// The first unbeaten Warden's flight. Everything above it is hidden in darkness.
export function gateK(){
  if (!FEATURES.wardens) return Infinity;   // with the Wardens parked, the whole shaft is open
  for (let z = 0; z < ZONES.length; z++){ const k = bossFlight(z); if (!S.bosses.includes(k)) return k; }
  return Infinity;
}
