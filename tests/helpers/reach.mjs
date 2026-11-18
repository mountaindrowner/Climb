// A region played with the real motor, with a given set of gifts: from every place he can stand, the inputs a player has
// (walk, jump, jump and double jump at several moments, jump straight up then steer, crouch-walk, drop through a ledge;
// under the scarf, a glide) run through stepPlayer at its fixed step, and where he comes to rest is somewhere he can get
// to. Nothing guessed about how high or far he goes. Shared by tests/side-physics.test.mjs and tools/gifts-report.mjs.
//   graph(N, gifts) -> { seen, edges, pos, W, H, marks, rooms }   gifts: the keepers' gifts he has, by CAN key
//                       ('breaker': the Warden's weight, so cracked stone is broken; 'dash': the Toll's step; 'glide':
//                       the Wyrm's wind). 'fallen' is not a gift: the region's keeper has fallen, so what it held is let go
//                       (level.js RULE: holds gone, given planks there). Doors on the bell are open: he waits. Kept per region and gift set.
//   arrival(N)       -> the gifts he has when he first comes to region N (the keepers below it; the Deep: none yet)
//   GIFTS, giftName  -> the gifts in the order he is given them, and what each is called
//   reached(seen, room, W), goalOf(marks), nearGoal(goal), runback(...)
import { clock } from './browser.mjs';
const { LEVEL, LEVELS, loadLevel, T, PHASE, REGION_DATA, RULE } = await import('../../src/side/level.js');
const M = await import('../../src/side/motor.js');
const I = await import('../../src/core/input.js');
const { TEACH } = await import('../../src/side/state.js');
const H120 = 1 / 120;
PHASE.all = true;   // star-glass is waited for: here it is always there
export { LEVELS, loadLevel, LEVEL, T };

export const GIFTS = TEACH.map(t => t.can).filter(Boolean);                        // ['breaker', 'dash', 'glide']
export const giftName = c => (TEACH.find(t => t.can === c) || { name: c }).name;
export const arrival = N => REGION_DATA[N] && REGION_DATA[N].deep ? [] : TEACH.slice(0, N).map(t => t.can).filter(Boolean);

let W = 0;
// one input program from where he stands; returns where he came to rest, by tile (grounded, not hurt). Places are kept
// as where he really stood, not tile centres: a tile's centre can be inside a wall for a body 0.68 wide
function run(x, y, prog, frames = 150){
  I.release(); clock.t += 10;
  const P = M.newPlayer(x, y), hp0 = P.hp, out = new Map();
  // a place he comes to rest counts once he has stood there a frame unhurt (what hurts whoever stands on it, spikes or
  // a live gantry, hurts on the frame after he lands)
  let t = 0, left = false, pend = null, stop = false;
  for (let f = 0; f < frames; f++){
    prog(t, I, P);
    for (let s = 0; s < 2; s++){ M.stepPlayer(P, H120); clock.t += H120; t += H120; }
    I.endFrame(); P.events.length = 0;
    if (P.hp < hp0) return out;
    if (pend){ if (!out.has(pend[0])) out.set(pend[0], pend[1]); pend = null; if (stop) break; }
    if (!P.grounded) left = true;
    if (P.grounded && P.vy === 0 && !(P.roll > 0) && !(P.dashT > 0) && !P.mantle){ const ci = Math.floor(P.x / T), cj = Math.round(P.y / T), k = cj * W + ci; pend = [k, [P.x, P.y]]; if (left && f > 20) stop = true; }   // (mid-roll is not a rest: nothing touches him then)
  }
  if (pend && !out.has(pend[0])) out.set(pend[0], pend[1]);
  I.release();
  return out;
}
const PROGS = [];
for (const d of ['left', 'right']){
  PROGS.push((t, I) => { I.hold(d, true); });                                                                   // walk
  PROGS.push((t, I) => { I.hold(d, true); I.hold('down', true); });                                             // crouch-walk
  PROGS.push((t, I) => { I.hold(d, true); if (t < 0.01) I.tap('jump'); I.hold('jump', t < 0.5); });             // a jump
  for (const dj of [0.15, 0.3, 0.45]) PROGS.push((t, I) => { I.hold(d, true); if (t < 0.01 || Math.abs(t - dj) < 0.008) I.tap('jump'); I.hold('jump', t < dj + 0.45); });   // and a double jump
  for (const steer of [0.2, 0.35]) PROGS.push((t, I) => { I.hold(d, t > steer); if (t < 0.01 || Math.abs(t - 0.3) < 0.008) I.tap('jump'); I.hold('jump', t < 0.8); });   // straight up, then over
  PROGS.push((t, I) => { I.hold(d, t > 0.1 && t < 0.25); });                                                   // a step off an edge
}
// the Toll's step: a jump, and a roll begun in the air (it flies level), at the top or on the way down
const DASH = [];
for (const d of ['left', 'right']) for (const at of [0.3, 0.55, 0.75]) DASH.push((t, I) => { I.hold(d, true); if (t < 0.01 || Math.abs(t - 0.28) < 0.008) I.tap('jump'); I.hold('jump', t < 0.7); if (Math.abs(t - at) < 0.008) I.tap('roll'); });
// under the scarf: jump, jump again, and a third press held (a glide); and jump held from the ground (it opens in rising air)
const LONG = [];
for (const d of ['left', 'right']){
  LONG.push((t, I) => { I.hold(d, true); for (const at of [0, 0.3, 0.6]) if (Math.abs(t - at) < 0.008) I.tap('jump'); I.hold('jump', t < 0.32 || t > 0.6); });
  for (const steer of [0.3, 1.0, 1.8]) LONG.push((t, I) => { I.hold(d, t > steer); if (t < 0.01) I.tap('jump'); I.hold('jump', true); });
}
PROGS.push((t, I) => { I.hold('down', true); if (t < 0.01) I.tap('jump'); });                                   // drop through a ledge
PROGS.push((t, I) => { if (t < 0.01 || Math.abs(t - 0.3) < 0.008) I.tap('jump'); I.hold('jump', t < 0.8); });  // straight up through a ledge

export { run, PROGS, DASH, LONG };   // for the stuck-finder (tests/helpers/stuck.mjs)
const CACHE = new Map();
export function graph(N, gifts = []){
  const key = N + ':' + [...gifts].sort().join(',');
  const L = loadLevel(N); W = L.W;
  const has = new Set(gifts);
  M.CAN.breaker = has.has('breaker'); M.CAN.dash = has.has('dash'); M.CAN.glide = has.has('glide');
  RULE.fallen = has.has('fallen'); RULE.shut = false; RULE.ring = 0; RULE.still = has.has('still') || has.has('fallen');   // 'still': the Bell-Foundry's Cracked Bell has fallen (its grates are up)
  if (has.has('breaker')) LEVEL.tiles = LEVEL.tiles.map(t => t === 4 ? 0 : t);
  if (has.has('dash')) LEVEL.tiles = LEVEL.tiles.map(t => t === 11 ? 0 : t);   // vellum torn (the Toll's step goes through it)   // the cracked stone broken (a copy: the next load is whole again)
  const base = { W: L.W, H: L.H, marks: L.marks, rooms: L.rooms };
  if (CACHE.has(key)) return { ...base, ...CACHE.get(key) };
  const sp = L.marks.find(m => m.type === 'spawn'), start = sp.y * W + sp.x, pos = new Map([[start, [(sp.x + 0.5) * T, sp.y * T]]]);
  const seen = new Set([start]), q = [start], edges = new Map();
  const progs = has.has('dash') ? PROGS.concat(DASH) : PROGS;
  while (q.length){
    const k = q.pop(), [x, y] = pos.get(k), nx = new Map();
    const take = (c, at) => { if (c === k) return; if (!nx.has(c)) nx.set(c, Math.hypot(at[0] - x, at[1] - y)); if (!pos.has(c)) pos.set(c, at); };
    for (const p of progs) for (const [c, at] of run(x, y, p)) take(c, at);
    if (has.has('glide') && (LEVEL.updrafts.length || (RULE.fallen && (LEVEL.gusts || []).length))) for (const p of LONG) for (const [c, at] of run(x, y, p, 420)) take(c, at);   // where there is rising air to ride
    edges.set(k, nx);
    for (const c of nx.keys()) if (!seen.has(c)){ seen.add(c); q.push(c); }
  }
  CACHE.set(key, { seen, edges, pos });
  return { ...base, seen, edges, pos };
}

export const reached = (seen, r, W) => { for (const k of seen){ const i = k % W, j = (k - i) / W; if (i >= r.tx0 && i < r.tx1 && j >= r.ty0 && j < r.ty1) return true; } return false; };
export const goalOf = marks => marks.find(m => m.type === 'boss') || marks.find(m => m.type === 'exit') || marks.find(m => m.type === 'pass');
// where he counts as at the goal: a passage is jumped into, not stood in (to three below its foot counts)
export const nearGoal = g => g.type === 'pass' ? (i, j) => i >= g.x - 6 && i <= g.x + (g.w || 2) + 6 && j >= g.y - 3 && j <= g.y + (g.h || 2) : (i, j) => Math.abs(i - g.x) < 12 && Math.abs(j - g.y) < 2;

// the way back: from a flame to the goal, the shortest way he can go (each move's length, in units, along the graph), and
// that as seconds at a run (he runs at about 7.6 units a second; jumps and falls are counted by the ground they cover)
export const RUN = 7.6;
export function runback(G, from, near){
  const { seen, edges, W } = G; let start = null, best = 1e9;
  for (const k of seen){ const i = k % W, j = (k - i) / W, d = Math.abs(i - from.x) + Math.abs(j - from.y) * 2; if (d < best){ best = d; start = k; } }
  if (start === null || best > 12) return null;
  // a small binary heap, nearest first
  const heap = [], push = (d, k) => { heap.push([d, k]); let i = heap.length - 1; while (i > 0){ const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } };
  const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length){ heap[0] = last; let i = 0; for (;;){ const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return top; };
  const dist = new Map([[start, 0]]); push(0, start);
  while (heap.length){
    const [d, k] = pop(); if (d > dist.get(k)) continue;
    const i = k % W, j = (k - i) / W; if (near(i, j)) return { units: d, secs: d / RUN };
    for (const [c, w] of edges.get(k) || []){ const nd = d + w + 0.2; if (nd < (dist.has(c) ? dist.get(c) : 1e9)){ dist.set(c, nd); push(nd, c); } }
  }
  return null;
}
