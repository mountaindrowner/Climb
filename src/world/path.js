// The spiral path: where a distance `s` along the stair sits in the world, and the fixed landmarks on it.
import { F, LAND, FL, ZF, ZH, MPU, OMEGA, GRADE, MAXK, R, LIFT_FLIGHT, CAMP_FLIGHT, BOSS_FLIGHT, ARENA_FLIGHTS } from '../config/constants.js';
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
  if (s >= BR_BASE) return branchPos(s);
  if (s < 0) s = 0;
  const k = Math.floor(s / FL), t = s - k * FL, base = flightY(k), rise = riseOf(k), a = s * OMEGA;
  if (t < F){
    const i = Math.floor(t), fr = t - i, e = smooth(Math.min(1, fr / 0.42));
    return { k, t, i, fr, a, y: base + rise * (i + e), land: false, rise, r: R };
  }
  return { k, t, i: -1, fr: 0, a, y: base + F * rise, land: true, u: (t - F) / LAND, rise, r: R };
}
// Height of the step surface under distance s.
export function topAt(s){
  if (s >= BR_BASE){ const b = branchOf(s), u = s - b.s0; return u < b.len - b.flat ? b.yA + (Math.floor(Math.max(0, u) / b.stepL) + 1) * b.rise : b.yB; }
  const k = Math.floor(s / FL), t = s - k * FL;
  return t < F ? flightY(k) + (Math.floor(t) + 1) * riseOf(k) : flightY(k + 1);
}
// The first unbeaten Warden's flight. Everything above it is hidden in darkness.
export function gateK(){
  if (!FEATURES.wardens) return Infinity;   // with the Wardens parked, the whole shaft is open
  for (let z = 0; z < ZONES.length; z++){ const k = bossFlight(z); if (!S.bosses.includes(k)) return k; }
  return Infinity;
}

// ---- Routes. Forks: at a fork landing a second stair, the high road, climbs off the other way round the shaft, cut
// into the wall behind the main stair, and rejoins it at a landing higher up. It is shorter and steeper: a shortcut
// that skips the zone's lift and rest stop. You take it by jumping left from the fork landing.
// Positions on a high road live in their own range of s (BR_BASE + 1000 j + u, u the distance along it), so anything
// on one route is simply far away from anything on the other.
export const BR_BASE = 100000, BRANCH_R = R + 2.6, FORK_FROM = 9, FORK_TO = 14;
export const BRANCHES = [];
export const BRANCH_MAX_RISE = 0.75;   // no steeper than the steepest main flight
for (let z = 0; z < ZONES.length; z++){
  // rejoin at landing 14 if that is climbable, else lower (a shorter skip: a longer, gentler high road)
  for (let kB = z * ZF + FORK_TO; kB > z * ZF + FORK_FROM + 1; kB--){
    const kA = z * ZF + FORK_FROM; if (kB >= MAXK) break;
    const sA = landingS(kA), sB = landingS(kB), aA = sA * OMEGA, dMain = (sB - sA) * OMEGA;
    const len = (2 * Math.PI - dMain) * BRANCH_R, flat = 1.6, yA = landingY(kA), yB = landingY(kB);
    const nSteps = Math.max(1, Math.floor(len - flat)), stepL = (len - flat) / nSteps, rise = (yB - yA) / nSteps;
    if (rise > BRANCH_MAX_RISE) continue;
    BRANCHES.push({ j: BRANCHES.length, kA, kB, s0: BR_BASE + BRANCHES.length * 1000, len, flat, aA, yA, yB, nSteps, stepL, rise, r: BRANCH_R });
    break;
  }
}
export const branchOf = s => s >= BR_BASE ? BRANCHES[Math.floor((s - BR_BASE) / 1000)] || null : null;
export const forkFrom = k => BRANCHES.find(b => b.kA === k) || null;
// +1 where pressing right climbs (the main stair), -1 where it goes back down (a high road winds the other way)
export const routeSign = s => s >= BR_BASE ? -1 : 1;
function branchPos(s){
  const b = branchOf(s), u = Math.min(b.len, Math.max(0, s - b.s0)), a = b.aA - u / b.r;
  if (u < b.len - b.flat){
    const i = Math.floor(u / b.stepL), fr = u / b.stepL - i, e = smooth(Math.min(1, fr / 0.42));
    return { k: b.kA, t: u, i, fr, a, y: b.yA + b.rise * (i + e), land: false, rise: b.rise, r: b.r, branch: b };
  }
  return { k: b.kA, t: u, i: -1, fr: 0, a, y: b.yB, land: true, rise: b.rise, r: b.r, branch: b };
}
// The path position near sRef (on the same route) at a world angle: for a foot or a blade tip beside him.
export function sAt(sRef, angle){
  const p = posOf(sRef); let da = angle - p.a; da = Math.atan2(Math.sin(da), Math.cos(da));
  const b = branchOf(sRef); return sRef + da * (b ? -b.r : R);
}
