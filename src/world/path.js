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
// ---- Surfaces. A flight's rise is fixed (its landings stay put), but not how it is climbed: a run of steps, a slope
// of worn rock, a slope broken by one tall step, or broad steps twice the length and height. Long runs of identical
// short steps read as constant bumping, so the regions mix them: the Deep is mostly rough slopes, the caverns add broad
// runs, the dwarf halls are built stairs. The tutorial's first flights stay plain steps; flat galleries are flat.
export const SURFACES = ['steps', 'slope', 'tall', 'broad'];
// each region's rotation, dealt in order to the flights it can vary (not the tutorial's, not flat galleries)
const SURF_DEAL = [['slope', 'tall', 'slope', 'broad', 'slope', 'steps', 'tall'], ['slope', 'broad', 'steps', 'slope', 'broad', 'tall'], ['steps', 'broad', 'steps', 'tall', 'broad', 'steps', 'slope']];
export function surfaceOf(k){
  const r = riseOf(k);
  if (k < 5 || r === 0) return 'steps';
  const z = Math.floor(k / ZF), deal = SURF_DEAL[Math.min(2, z)];
  let n = 0; for (let j = z * ZF; j < k; j++) if (j >= 5 && riseOf(j) !== 0) n++;
  let pick = deal[(n + z) % deal.length];
  if ((pick === 'tall' || pick === 'broad') && r > 0.45) pick = 'slope';   // no step taller than about 0.9
  return pick;
}
const SURF = []; for (let k = 0; k <= MAXK + 1; k++) SURF.push(surfaceOf(k));
// the top of flight k's surface t into it (0..F), above the flight's base
export function surfTop(k, t){
  const r = riseOf(k), kind = SURF[Math.max(0, Math.min(SURF.length - 1, k))];
  if (kind === 'slope') return r * t;
  if (kind === 'tall') return t < 4 ? 0.75 * r * t : 5 * r + 0.75 * r * (t - 4);
  if (kind === 'broad') return (Math.floor(t / 2) + 1) * 2 * r;
  return (Math.floor(t) + 1) * r;
}
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
  if (s >= HALL_BASE) return hallPos(s);
  if (s >= BR_BASE) return spurOf(s) ? spurPos(s) : branchPos(s);
  if (s < 0) s = 0;
  const k = Math.floor(s / FL), t = s - k * FL, base = flightY(k), rise = riseOf(k), a = s * OMEGA;
  if (t < F){
    const i = Math.floor(t), fr = t - i;
    if (SURF[k] === 'broad'){ const v = t / 2, j = Math.floor(v), e = smooth(Math.min(1, (v - j) / 0.42)); return { k, t, i, fr, a, y: base + 2 * rise * (j + e), land: false, rise, r: R, surface: 'broad' }; }
    if (SURF[k] !== 'steps') return { k, t, i, fr, a, y: base + surfTop(k, t), land: false, rise, r: R, surface: SURF[k] };
    const e = smooth(Math.min(1, fr / 0.42));
    return { k, t, i, fr, a, y: base + rise * (i + e), land: false, rise, r: R };
  }
  return { k, t, i: -1, fr: 0, a, y: base + F * rise, land: true, u: (t - F) / LAND, rise, r: R };
}
// Height of the step surface under distance s.
export function topAt(s){
  if (s >= HALL_BASE){ const h = hallOf(s); return hallTop(h, Math.max(0, Math.min(h.len, s - h.s0))); }
  if (s >= BR_BASE){ const sp = spurOf(s); if (sp) return spurTop(sp, s - sp.s0); const b = branchOf(s); return roadTop(b, Math.max(0, s - b.s0)); }
  const k = Math.floor(s / FL), t = s - k * FL;
  return t < F ? flightY(k) + surfTop(k, t) : flightY(k + 1);
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
// Two forks a zone are built: an early one from landing 3 (it skips the lift and comes out at the rest stop) and a late
// one from landing 9. Which are open changes from run to run (setRoutes): a closed fork's spur is a heap of rubble.
export const BR_BASE = 100000, BRANCH_R = R + 2.9, SPUR_R = R + 1.75, FORKS = [[3, 8], [9, 14]];
// the spur's steps; the leap (the foot is `lip` above the spur's end, its landing window gapFrom..gapTo past it); the
// collapse (step i falls `delay` after he first stands on it plus its distance over `speed`: he runs 3.8)
export const SPUR = { steps: 6, stepL: 1.0, rise: 0.5, lip: 1.1, gapFrom: 0.6, gapTo: 2.6, footL: 2.2,
  collapse: { delay: 0.55, speed: 3.2, shake: 0.35, regrow: 0.8, rest: 1.6 } };
export const BRANCHES = [], SPURS = [];
export const BRANCH_MAX_RISE = 0.75;   // no steeper than the steepest main flight
for (let z = 0; z < ZONES.length; z++) for (const [fFrom, fTo] of FORKS){
  // rejoin at its landing if that is climbable, else lower (a shorter skip: a longer, gentler high road)
  for (let kB = z * ZF + fTo; kB > z * ZF + fFrom + 1; kB--){
    const kA = z * ZF + fFrom; if (kB >= MAXK) break;
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
    const b = { j, z, early: fFrom < 6, open: true, kA, kB, s0: BR_BASE + j * 1000, len, flat, footL, aA: aFoot, yA: yF, yB, nSteps, stepL, rise, r: BRANCH_R, spur: sp };
    sp.road = b; BRANCHES.push(b); SPURS.push(sp);
    break;
  }
}
const blockOf = s => Math.floor((s - BR_BASE) / 1000), offOf = s => s - BR_BASE - blockOf(s) * 1000;
export const branchOf = s => s >= BR_BASE && s < HALL_BASE && offOf(s) < 500 ? BRANCHES[blockOf(s)] || null : null;
export const spurOf = s => s >= BR_BASE && s < HALL_BASE && offOf(s) >= 500 ? SPURS[blockOf(s)] || null : null;
export const forkFrom = k => BRANCHES.find(b => b.kA === k && b.open) || null;
// Which forks are open this run: in each zone the late one, the early one, or both, drawn from the run's seed. Every
// zone keeps at least one way across.
export function setRoutes(seed){
  for (let z = 0; z < ZONES.length; z++){
    const h = Math.sin((seed + 1) * 12.9898 + z * 78.233) * 43758.5453, u = h - Math.floor(h);
    const pick = u < 0.4 ? 'late' : u < 0.75 ? 'early' : 'both', mine = BRANCHES.filter(b => b.z === z);
    for (const b of mine) b.open = pick === 'both' || (pick === 'early') === b.early;
    if (mine.length && !mine.some(b => b.open)) mine[0].open = true;
    // and which of the zone's hidden halls is there this time (the other is solid wall); none broken, none looted
    const hs = HALLS.filter(h => h.z === z), v = (h * 7.31) - Math.floor(h * 7.31);
    hs.forEach((hl, i) => { hl.open = i === Math.floor(v * hs.length); hl.broken = false; hl.looted = false; hl.hits = 0; });
  }
}
// a high road's walking line, without its steps (the camera and the carved wall follow it)
export function roadLine(b, u){ return u < b.footL ? b.yA : u < b.len - b.flat ? b.yA + b.rise * ((u - b.footL) / b.stepL) : b.yB; }

// ---- Hidden halls. At one landing in each zone (which one changes from run to run) the wall behind the landing is
// cracked, with a little lamplight showing through. Three blows break it open. Behind is a hall cut into the rock: a
// short flat, a stair climbing to a chamber with a chest (gold, and the flask filled) and a carving (a line of the
// mountain's history), and then the hall breaks out of the rock onto a ledge above the next landing: walk off it and
// drop down onto the stair again. So a hall is a detour that pays and brings him out a flight on, never a dead end.
// A hall's positions live at HALL_BASE + 1000 j + u, u along it, rightward like the main stair: u = MOUTH sits straight
// behind the middle of its landing.
export const HALL_BASE = 200000, HALL_R = R + 3.4, HALL = { entry: 1.8, chamber: 3.0, ledge: 1.4, drop: 1.8, mouth: 0.8, reach: 1.3, hits: 3 };
export const HALLS = [];
// a hall's walking line, without its steps
export function hallLine(h, u){ return u < h.entry ? h.yA : u < h.entry + h.run ? h.yA + h.rise * (u - h.entry) / h.stepL : h.yTop; }
export const hallA = (h, u) => h.a0 + (u - HALL.mouth) / h.r;
// Is the band a route or a hall would cut through the wall (angle, height) clear of every high road and spur?
function clearOfRoutes(a, y0, y1){
  const turn = 2 * Math.PI;
  for (const b of BRANCHES){
    let da = ((b.aA - a) % turn + turn) % turn; const du = da * b.r;
    if (du > b.len + 1 && da < turn - 0.2) continue;
    const yb = roadLine(b, Math.min(du, b.len)); if (y1 > yb - 1.6 && y0 < yb + 5) return false;
  }
  for (const sp of SPURS){
    let da = ((a - sp.a0) % turn + turn) % turn; const du = da * sp.r;
    if (du > sp.len + 1 && da < turn - 0.2) continue;
    const yb = sp.yA + sp.rise * Math.min(du, sp.len) / sp.stepL; if (y1 > yb - 1.6 && y0 < yb + 4.5) return false;
  }
  return true;
}
// the landings a hall can open from: never the tutorial's, a fork's, the lift's or the rest stop's, nor (with the
// Wardens on) in a Warden's stretch; and the next landing must be low enough for the hall to climb above it
for (let z = 0; z < ZONES.length; z++){
  const mine = [];
  for (const l of [6, 1, 11, 10, 12]){
    const kH = z * ZF + l;
    if (kH < 5 || kH + 1 >= MAXK || mine.some(o => Math.abs(o.kH - kH) < 2)) continue;
    if (FEATURES.wardens && (arenaOf(kH) >= 0 || arenaOf(kH + 1) >= 0)) continue;
    const r = HALL_R, len = HALL.mouth + (FL - 0.2) * r / R, run = len - HALL.entry - HALL.chamber - HALL.ledge;
    const nSteps = Math.floor(run), stepL = run / nSteps, yA = landingY(kH), drop = landingY(kH + 1) + HALL.drop - yA, rise = drop / nSteps;
    if (rise > BRANCH_MAX_RISE || rise <= 0) continue;
    const h = { j: HALLS.length, z, kH, s0: HALL_BASE + HALLS.length * 1000, a0: landingS(kH) * OMEGA, r, yA, yTop: yA + drop, entry: HALL.entry, run, nSteps, stepL, rise, len,
      chestU: len - HALL.ledge - 0.7, tabletU: HALL.entry + run + 0.9, sOut: landingS(kH) + (len - HALL.mouth) * R / r, open: false, broken: false, looted: false, hits: 0 };
    let ok = true;
    for (let u = -0.5; u <= len + 0.5 && ok; u += 0.25) ok = clearOfRoutes(hallA(h, u), hallLine(h, Math.max(0, Math.min(len, u))) - 1.2, hallLine(h, Math.max(0, Math.min(len, u))) + 4.1);
    if (!ok) continue;
    HALLS.push(h); mine.push(h);
    if (mine.length === 2) break;
  }
}
export const hallOf = s => s >= HALL_BASE ? HALLS[Math.floor((s - HALL_BASE) / 1000)] || null : null;
// which way he is on: the main stair (null), or a high road, a spur or a hall
export const routeOf = s => s < BR_BASE ? null : hallOf(s) || spurOf(s) || branchOf(s);
// the open hall whose mouth is behind the landing at main-stair distance s (broken or not), if he is close enough
export function hallAt(s){
  if (s >= BR_BASE) return null;
  for (const h of HALLS) if (h.open && Math.abs(s - landingS(h.kH)) < HALL.reach) return h;
  return null;
}
function hallTop(h, u){ return u < h.entry ? h.yA : u < h.entry + h.run ? h.yA + (Math.min(h.nSteps - 1, Math.floor((u - h.entry) / h.stepL)) + 1) * h.rise : h.yTop; }
function hallPos(s){
  const h = hallOf(s), u = Math.max(0, Math.min(h.len, s - h.s0)), a = hallA(h, u), base = { k: h.kH, t: u, a, rise: h.rise, r: h.r, hall: h };
  if (u < h.entry || u >= h.entry + h.run) return { ...base, i: -1, fr: 0, y: hallTop(h, u), land: true };
  const v = (u - h.entry) / h.stepL, i = Math.min(h.nSteps - 1, Math.floor(v)), fr = v - i, e = smooth(Math.min(1, fr / 0.42));
  return { ...base, i, fr, y: h.yA + h.rise * (i + e), land: false };
}
// +1 where pressing right climbs (the main stair, the spur, a hall), -1 where it goes back down (a high road winds the other way)
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
  const b = branchOf(s), sp = b ? null : spurOf(s), hl = hallOf(s);
  const a0 = s - 0.5, a1 = s + 0.5, cuts = [a0, a1];
  const lo = b ? b.s0 : sp ? sp.s0 : hl ? hl.s0 : 0, hi = b ? b.s0 + b.len : sp ? sp.s0 + sp.len - 1e-6 : hl ? hl.s0 + hl.len : Infinity;
  if (hl){ for (let i = 0; i <= hl.nSteps; i++){ const x = hl.s0 + hl.entry + i * hl.stepL; if (x > a0 && x < a1) cuts.push(x); } }
  else if (b){ for (let i = 0; b.s0 + b.footL + i * b.stepL < a1 && i <= b.nSteps; i++){ const x = b.s0 + b.footL + i * b.stepL; if (x > a0) cuts.push(x); } }
  else if (sp){ for (let i = 1; i < sp.steps; i++){ const x = sp.s0 + i * sp.stepL; if (x > a0 && x < a1) cuts.push(x); } }
  else for (let k = Math.floor(a0 / FL); k * FL <= a1; k++) for (let i = 0; i <= F; i++){ const x = k * FL + i; if (x > a0 && x < a1) cuts.push(x); }   // step edges, and where a slope meets its landing
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
  if (p.hall) return hallLine(p.hall, p.t);
  if (p.spur){ const sp = p.spur; return sp.yA + sp.rise * Math.min(p.t, sp.len) / sp.stepL; }
  if (p.land) return p.y;
  if (p.branch){ const b = p.branch; return b.yA + b.rise * (p.t - b.footL) / b.stepL; }
  return flightY(p.k) + p.rise * p.t;
}
// The path position near sRef (on the same route) at a world angle: for a foot or a blade tip beside him.
export function sAt(sRef, angle){
  const p = posOf(sRef); let da = angle - p.a; da = Math.atan2(Math.sin(da), Math.cos(da));
  const b = branchOf(sRef); return sRef + da * (b ? -b.r : p.spur ? p.spur.r : p.hall ? p.hall.r : R);
}
// Where to put him back after a fall through a hole: never on a spur (its steps may be gone); there, back on the fork
// landing.
export function safeSpot(s){ const sp = spurOf(s); return sp ? landingS(sp.kA) : s; }
