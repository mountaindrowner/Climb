// The spiral path: where a distance `s` along the stair sits in the world, and the fixed landmarks on it.
import { F, RISE, LAND, FL, FH, ZF, MPU, OMEGA, LIFT_FLIGHT, CAMP_FLIGHT, BOSS_FLIGHT } from '../config/constants.js';
import { ZONES } from '../config/zones.js';
import { smooth } from '../core/math.js';
import { S } from '../save/store.js';

export const zoneOf = k => Math.min(ZONES.length - 1, Math.max(0, Math.floor(k / ZF)));
export function special(k){
  const l = k % ZF;
  return l === LIFT_FLIGHT ? 'lift' : l === CAMP_FLIGHT ? 'camp' : l === BOSS_FLIGHT ? 'boss' : null;
}
export const bossFlight = z => z * ZF + BOSS_FLIGHT;
export const landingS = k => k * FL + F + LAND * 0.5;   // path distance of the middle of flight k's landing
export const landingY = k => k * FH + FH;               // height of flight k's landing
export const meters = y => Math.max(0, Math.floor(y * MPU));

// Position on the path at distance s: flight k, step i, fraction fr through that step, angle a, height y.
export function posOf(s){
  if (s < 0) s = 0;
  const k = Math.floor(s / FL), t = s - k * FL, base = k * FH, a = s * OMEGA;
  if (t < F){
    const i = Math.floor(t), fr = t - i, e = smooth(Math.min(1, fr / 0.42));
    return { k, t, i, fr, a, y: base + RISE * (i + e), land: false };
  }
  return { k, t, i: -1, fr: 0, a, y: base + FH, land: true, u: (t - F) / LAND };
}
// Height of the step surface under distance s.
export function topAt(s){
  const k = Math.floor(s / FL), t = s - k * FL;
  return t < F ? k * FH + (Math.floor(t) + 1) * RISE : k * FH + FH;
}
// The first unbeaten Warden's flight. Everything above it is hidden in darkness.
export function gateK(){
  for (let z = 0; z < ZONES.length; z++){ const k = bossFlight(z); if (!S.bosses.includes(k)) return k; }
  return Infinity;
}
