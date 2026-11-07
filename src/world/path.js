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
// Steps per unit of stair. Until 0.26 a step was a whole unit, up to 0.75 high on a 2-unit man, more than a third of
// his height (real risers are about a tenth), so every step was a high-knee lift. Now each unit is two steps; 'broad'
// steps are the old whole-unit ones, on gentle flights only.
export const HALF = 2;
// the top of flight k's surface t into it (0..F), above the flight's base
export function surfTop(k, t){
  const r = riseOf(k), kind = SURF[Math.max(0, Math.min(SURF.length - 1, k))];
  if (kind === 'slope') return r * t;
  if (kind === 'tall') return t < 4 ? 0.75 * r * t : 5 * r + 0.75 * r * (t - 4);
  if (kind === 'broad') return (Math.floor(t) + 1) * r;
  return (Math.floor(t * HALF) + 1) * r / HALF;   // two steps to a unit: each rise a tenth or so of his height, as real stairs are
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
  if (s < 0) s = 0;
  const k = Math.floor(s / FL), t = s - k * FL, base = flightY(k), rise = riseOf(k), a = s * OMEGA;
  if (t < F){
    const i = Math.floor(t), fr = t - i;
    if (SURF[k] === 'broad'){ const e = smooth(Math.min(1, fr / 0.42)); return { k, t, i, fr, a, y: base + rise * (i + e), land: false, rise, r: R, surface: 'broad' }; }
    if (SURF[k] !== 'steps') return { k, t, i, fr, a, y: base + surfTop(k, t), land: false, rise, r: R, surface: SURF[k] };
    const v = t * HALF, j = Math.floor(v), e = smooth(Math.min(1, (v - j) / 0.42));
    return { k, t, i, fr, a, y: base + rise / HALF * (j + e), land: false, rise, r: R };
  }
  return { k, t, i: -1, fr: 0, a, y: base + F * rise, land: true, u: (t - F) / LAND, rise, r: R };
}
// Height of the step surface under distance s.
export function topAt(s){
  if (s >= HALL_BASE){ const h = hallOf(s); return hallTop(h, Math.max(0, Math.min(h.len, s - h.s0))); }
  const k = Math.floor(s / FL), t = s - k * FL;
  return t < F ? flightY(k) + surfTop(k, t) : flightY(k + 1);
}
// The first unbeaten Warden's flight. Everything above it is hidden in darkness.
export function gateK(){
  if (!FEATURES.wardens) return Infinity;   // with the Wardens parked, the whole shaft is open
  for (let z = 0; z < ZONES.length; z++){ const k = bossFlight(z); if (!S.bosses.includes(k)) return k; }
  return Infinity;
}

// ---- Routes. Forks: at two landings a region (3 and 9) a switchback climbs back the other way over the stair you came
// up, a run of ledges on the stair's own lane, and comes out through a broken gap in the stair a turn above: a shortcut
// that skips the rest of the turn. Which forks are open changes from run to run (setRoutes); a closed fork's ledge has
// fallen and lies in a heap of rubble on its landing (the ram can clear it). The ledges themselves: decks.js.
// Routes off the stair (the hidden halls) live in their own range of s, from BR_BASE up.
export const BR_BASE = 100000, FORKS = [[3, 8], [9, 14]];
export const BRANCHES = [];
for (let z = 0; z < ZONES.length; z++) for (const [fFrom] of FORKS){
  const kA = z * ZF + fFrom; if (kA >= MAXK - 4) continue;
  BRANCHES.push({ j: BRANCHES.length, z, early: fFrom < 6, open: true, kA });
}
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
    if (rise > 0.75 || rise <= 0) continue;   // no steeper than the steepest flight
    const h = { j: HALLS.length, z, kH, s0: HALL_BASE + HALLS.length * 1000, a0: landingS(kH) * OMEGA, r, yA, yTop: yA + drop, entry: HALL.entry, run, nSteps, stepL, rise, len,
      chestU: len - HALL.ledge - 0.7, tabletU: HALL.entry + run + 0.9, sOut: landingS(kH) + (len - HALL.mouth) * R / r, open: false, broken: false, looted: false, hits: 0 };
    HALLS.push(h); mine.push(h);
    if (mine.length === 2) break;
  }
}
export const hallOf = s => s >= HALL_BASE ? HALLS[Math.floor((s - HALL_BASE) / 1000)] || null : null;
// which way he is on: the main stair (null) or a hall
export const routeOf = s => s < BR_BASE ? null : hallOf(s);
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
// +1 where pressing right climbs: everywhere now (the high roads that wound the other way are gone)
export const routeSign = () => 1;
// The height his body rides at s: the step tops averaged over one step's length around him. Up a flight that is a
// line through the middle of each step, easing into the landings, so he climbs on a slope while his feet (foot IK)
// land on the real steps, instead of his whole body popping up a step each time a foot arrives. On a route the window
// stays on that route.
export function walkY(s){
  const hl = hallOf(s);
  const a0 = s - 0.5, a1 = s + 0.5, cuts = [a0, a1];
  const lo = hl ? hl.s0 : 0, hi = hl ? hl.s0 + hl.len : Infinity;
  if (hl){ for (let i = 0; i <= hl.nSteps; i++){ const x = hl.s0 + hl.entry + i * hl.stepL; if (x > a0 && x < a1) cuts.push(x); } }
  else for (let k = Math.floor(a0 / FL); k * FL <= a1; k++) for (let i = 0; i <= F * HALF; i++){ const x = k * FL + i / HALF; if (x > a0 && x < a1) cuts.push(x); }   // step edges, and where a slope meets its landing
  cuts.sort((p, q) => p - q);
  let sum = 0;
  for (let i = 1; i < cuts.length; i++) sum += (cuts[i] - cuts[i - 1]) * topAt(Math.min(hi, Math.max(lo, (cuts[i - 1] + cuts[i]) / 2)));
  return sum;
}
// The line up the stair's slope under s: no steps in it, from landing to landing (the camera follows this, so it rises
// smoothly instead of hopping a step at a time).
export function rampY(s){
  const p = posOf(s);
  if (p.hall) return hallLine(p.hall, p.t);
  if (p.land) return p.y;
  return flightY(p.k) + p.rise * p.t;
}
// The path position near sRef (on the same route) at a world angle: for a foot or a blade tip beside him.
export function sAt(sRef, angle){
  const p = posOf(sRef); let da = angle - p.a; da = Math.atan2(Math.sin(da), Math.cos(da));
  return sRef + da * (p.hall ? p.hall.r : R);
}
// Where to put him back after a fall through a hole in a practice run (a real climb drops him to what is below).
export const safeSpot = s => s;
