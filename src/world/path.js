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
  if (s >= BR_BASE) return spurOf(s) ? spurPos(s) : branchPos(s);
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
  if (s >= BR_BASE){ const sp = spurOf(s); if (sp) return spurTop(sp, s - sp.s0); const b = branchOf(s); return roadTop(b, Math.max(0, s - b.s0)); }
  const k = Math.floor(s / FL), t = s - k * FL;
  return t < F ? flightY(k) + (Math.floor(t) + 1) * riseOf(k) : flightY(k + 1);
}
// The first unbeaten Warden's flight. Everything above it is hidden in darkness.
export function gateK(){
  if (!FEATURES.wardens) return Infinity;   // with the Wardens parked, the whole shaft is open
  for (let z = 0; z < ZONES.length; z++){ const k = bossFlight(z); if (!S.bosses.includes(k)) return k; }
  return Infinity;
}

// ---- Routes. Forks: at a fork landing a short stair, the spur, climbs off to the right, cut into the wall behind the
// main stair. It is crumbling: once he is on it, its steps fall away behind him at nearly his running speed, so he
// cannot stop. It ends in a broken edge. Beside it, behind and higher (out of reach without a run-up), is the foot of
// the high road, which climbs the other way round the shaft and rejoins the main stair at a landing higher up: a
// shortcut that skips the zone's lift and rest stop. So: hop onto the spur, keep running, leap at its end.
// Positions on a route live in their own range of s (the high road at BR_BASE + 1000 j + u, its spur at
// BR_BASE + 1000 j + 500 + u, u the distance along it), so anything on one route is simply far from anything on another.
export const BR_BASE = 100000, BRANCH_R = R + 2.9, SPUR_R = R + 1.75, FORK_FROM = 9, FORK_TO = 14;
// the spur's steps; the leap (the foot is `lip` above the spur's end, its landing window gapFrom..gapTo past it); the
// collapse (step i falls `delay` after he first stands on it plus its distance over `speed`: he runs 3.8)
export const SPUR = { steps: 6, stepL: 1.0, rise: 0.5, lip: 1.1, gapFrom: 0.6, gapTo: 2.6, footL: 2.2,
  collapse: { delay: 0.55, speed: 3.2, shake: 0.35, regrow: 0.8, rest: 1.6 } };
export const BRANCHES = [], SPURS = [];
export const BRANCH_MAX_RISE = 0.75;   // no steeper than the steepest main flight
for (let z = 0; z < ZONES.length; z++){
  // rejoin at landing 14 if that is climbable, else lower (a shorter skip: a longer, gentler high road)
  for (let kB = z * ZF + FORK_TO; kB > z * ZF + FORK_FROM + 1; kB--){
    const kA = z * ZF + FORK_FROM; if (kB >= MAXK) break;
    const j = BRANCHES.length, sA = landingS(kA), sB = landingS(kB), yA = landingY(kA), yB = landingY(kB);
    // the spur: from the middle of the fork landing, climbing right
    const sp = { j, kA, s0: BR_BASE + j * 1000 + 500, a0: sA * OMEGA, yA, steps: SPUR.steps, stepL: SPUR.stepL, rise: SPUR.rise, len: SPUR.steps * SPUR.stepL, r: SPUR_R };
    sp.tipA = sp.a0 + sp.len / sp.r; sp.topY = yA + sp.steps * sp.rise;
    // the high road: its foot a flat ledge beyond the spur's broken end and above it; u runs leftward from the foot's
    // right end, along the foot and then up its steps round the shaft to landing kB
    const aFoot = sp.tipA + (SPUR.gapFrom / sp.r) + SPUR.footL / BRANCH_R, yF = sp.topY + SPUR.lip;
    const turn = 2 * Math.PI, aB = sB * OMEGA, dLeft = ((aFoot - aB) % turn + turn) % turn;
    const len = dLeft * BRANCH_R, flat = 1.6, footL = SPUR.footL, run = len - flat - footL;
    const nSteps = Math.max(1, Math.floor(run)), stepL = run / nSteps, rise = (yB - yF) / nSteps;
    if (rise > BRANCH_MAX_RISE || rise <= 0) continue;
    const b = { j, kA, kB, s0: BR_BASE + j * 1000, len, flat, footL, aA: aFoot, yA: yF, yB, nSteps, stepL, rise, r: BRANCH_R, spur: sp };
    sp.road = b; BRANCHES.push(b); SPURS.push(sp);
    break;
  }
}
const blockOf = s => Math.floor((s - BR_BASE) / 1000), offOf = s => s - BR_BASE - blockOf(s) * 1000;
export const branchOf = s => s >= BR_BASE && offOf(s) < 500 ? BRANCHES[blockOf(s)] || null : null;
export const spurOf = s => s >= BR_BASE && offOf(s) >= 500 ? SPURS[blockOf(s)] || null : null;
export const forkFrom = k => BRANCHES.find(b => b.kA === k) || null;
// +1 where pressing right climbs (the main stair, the spur), -1 where it goes back down (a high road winds the other way)
export const routeSign = s => branchOf(s) ? -1 : 1;
// Ground that moves: spur.js says which of a spur's steps have fallen.
export const DYN = { gone: null };
const spurGone = (sp, i) => !!(DYN.gone && DYN.gone(sp, i));
// a high road's step tops: its foot, its steps, the flat where it rejoins
function roadTop(b, u){ return u < b.footL ? b.yA : u < b.len - b.flat ? b.yA + (Math.floor((u - b.footL) / b.stepL) + 1) * b.rise : b.yB; }
// a spur's step tops as built (intact), and as they are (a fallen step, or beyond the broken end, is a long way down)
const spurBuilt = (sp, u) => sp.yA + (Math.floor(Math.max(0, Math.min(u, sp.len - 1e-6)) / sp.stepL) + 1) * sp.rise;
function spurTop(sp, u){ return u >= sp.len || spurGone(sp, Math.floor(Math.max(0, u) / sp.stepL)) ? sp.yA - 8 : spurBuilt(sp, u); }
export const spurHole = (sp, u) => u >= sp.len ? { top: sp.topY } : spurGone(sp, Math.floor(Math.max(0, u) / sp.stepL)) ? { top: spurBuilt(sp, u) } : null;
function branchPos(s){
  const b = branchOf(s), u = Math.min(b.len, Math.max(0, s - b.s0)), a = b.aA - u / b.r;
  if (u < b.footL) return { k: b.kA, t: u, i: -1, fr: 0, a, y: b.yA, land: true, rise: b.rise, r: b.r, branch: b };
  if (u < b.len - b.flat){
    const v = (u - b.footL) / b.stepL, i = Math.floor(v), fr = v - i, e = smooth(Math.min(1, fr / 0.42));
    return { k: b.kA, t: u, i, fr, a, y: b.yA + b.rise * (i + e), land: false, rise: b.rise, r: b.r, branch: b };
  }
  return { k: b.kA, t: u, i: -1, fr: 0, a, y: b.yB, land: true, rise: b.rise, r: b.r, branch: b };
}
function spurPos(s){
  const sp = spurOf(s), u = Math.max(0, s - sp.s0), a = sp.a0 + u / sp.r, v = Math.min(u, sp.len - 1e-6) / sp.stepL, i = Math.floor(v);
  return { k: sp.kA, t: u, i, fr: v - i, a, y: spurBuilt(sp, u), land: false, rise: sp.rise, r: sp.r, spur: sp };
}
// The height his body rides at s: the step tops averaged over one step's length around him. Up a flight that is a
// line through the middle of each step, easing into the landings, so he climbs on a slope while his feet (foot IK)
// land on the real steps, instead of his whole body popping up a step each time a foot arrives. On a route the window
// stays on that route, and a spur is averaged as built (its falling steps are holes, which ground.js reports).
export function walkY(s){
  const b = branchOf(s), sp = b ? null : spurOf(s);
  const a0 = s - 0.5, a1 = s + 0.5, cuts = [a0, a1];
  const lo = b ? b.s0 : sp ? sp.s0 : 0, hi = b ? b.s0 + b.len : sp ? sp.s0 + sp.len - 1e-6 : Infinity;
  if (b){ for (let i = 0; b.s0 + b.footL + i * b.stepL < a1 && i <= b.nSteps; i++){ const x = b.s0 + b.footL + i * b.stepL; if (x > a0) cuts.push(x); } }
  else if (sp){ for (let i = 1; i < sp.steps; i++){ const x = sp.s0 + i * sp.stepL; if (x > a0 && x < a1) cuts.push(x); } }
  else for (let k = Math.floor(a0 / FL); k * FL <= a1; k++) for (let i = 0; i < F; i++){ const x = k * FL + i; if (x > a0 && x < a1) cuts.push(x); }
  cuts.sort((p, q) => p - q);
  const top = x => sp ? spurBuilt(sp, x - sp.s0) : topAt(x);
  let sum = 0;
  for (let i = 1; i < cuts.length; i++) sum += (cuts[i] - cuts[i - 1]) * top(Math.min(hi, Math.max(lo, (cuts[i - 1] + cuts[i]) / 2)));
  return sum;
}
// The line up the stair's slope under s: no steps in it, from landing to landing (the camera follows this, so it rises
// smoothly instead of hopping a step at a time).
export function rampY(s){
  const p = posOf(s);
  if (p.spur){ const sp = p.spur; return sp.yA + sp.rise * Math.min(p.t, sp.len) / sp.stepL; }
  if (p.land) return p.y;
  if (p.branch){ const b = p.branch; return b.yA + b.rise * (p.t - b.footL) / b.stepL; }
  return flightY(p.k) + p.rise * p.t;
}
// The path position near sRef (on the same route) at a world angle: for a foot or a blade tip beside him.
export function sAt(sRef, angle){
  const p = posOf(sRef); let da = angle - p.a; da = Math.atan2(Math.sin(da), Math.cos(da));
  const b = branchOf(sRef); return sRef + da * (b ? -b.r : p.spur ? p.spur.r : R);
}
// Where to put him back after a fall through a hole: never on a spur (its steps may be gone); there, back on the fork
// landing.
export function safeSpot(s){ const sp = spurOf(s); return sp ? landingS(sp.kA) : s; }
