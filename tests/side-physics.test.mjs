// The side view's region, played with the real motor: from every place he can stand, the inputs a player has (walk,
// jump, jump and double jump at several moments, jump straight up then steer, crouch-walk, drop through a ledge) run
// through stepPlayer at its fixed step, and where he comes to rest is somewhere he can get to. Nothing guessed about
// how high or far he goes. Checks every room, the shrine, the Warden's stage and the way out are reached from the
// spawn without a hurt, and that nowhere he can reach is a place he cannot get back out of toward the stage.
import { clock } from './helpers/browser.mjs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
const { LEVEL, LEVELS, loadLevel, T, tileAt, ROCK, LEDGE, PHASE } = await import('../src/side/level.js');
const M = await import('../src/side/motor.js');
const I = await import('../src/core/input.js');
const H120 = 1 / 120;
M.CAN.breaker = M.CAN.dash = M.CAN.glide = true;   // he is played with everything the keepers teach
PHASE.all = true;                                   // star-glass is waited for: here it is always there
let W, H, marks, rooms;   // of the region being played

// one input program from where he stands; returns where he came to rest, by tile (grounded, not hurt). Places are
// kept as where he really stood, not tile centres: a tile's centre can be inside a wall for a body 0.68 wide
function run(x, y, prog, frames = 150){
  I.release(); clock.t += 10;
  const P = M.newPlayer(x, y), hp0 = P.hp, out = new Map();
  let t = 0, left = false;
  for (let f = 0; f < frames; f++){
    prog(t, I, P);
    for (let s = 0; s < 2; s++){ M.stepPlayer(P, H120); clock.t += H120; t += H120; }
    I.endFrame(); P.events.length = 0;
    if (P.hp < hp0) return out;
    if (!P.grounded) left = true;
    if (P.grounded && P.vy === 0){ const ci = Math.floor(P.x / T), cj = Math.round(P.y / T), k = cj * W + ci; if (!out.has(k)) out.set(k, [P.x, P.y]); if (left && f > 20) break; }
  }
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
// under the scarf: jump, jump again, and a third press held (a glide); and jump held from the ground (it opens in rising air)
const LONG = [];
for (const d of ['left', 'right']){
  LONG.push((t, I) => { I.hold(d, true); for (const at of [0, 0.3, 0.6]) if (Math.abs(t - at) < 0.008) I.tap('jump'); I.hold('jump', t < 0.32 || t > 0.6); });
  for (const steer of [0.3, 1.0, 1.8]) LONG.push((t, I) => { I.hold(d, t > steer); if (t < 0.01) I.tap('jump'); I.hold('jump', true); });
}
PROGS.push((t, I) => { I.hold('down', true); if (t < 0.01) I.tap('jump'); });                                   // drop through a ledge
PROGS.push((t, I) => { if (t < 0.01 || Math.abs(t - 0.3) < 0.008) I.tap('jump'); I.hold('jump', t < 0.8); });  // straight up through a ledge

for (let N = 0; N < LEVELS.length; N++){
const NAME = LEVELS[N].name;
let GRAPH;
function graph(){
  ({ W, H, marks, rooms } = loadLevel(N));
  if (GRAPH) return GRAPH;
  const sp = marks.find(m => m.type === 'spawn'), start = sp.y * W + sp.x, pos = new Map([[start, [(sp.x + 0.5) * T, sp.y * T]]]);
  const seen = new Set([start]), q = [start], edges = new Map();
  while (q.length){
    const k = q.pop(), [x, y] = pos.get(k), nx = new Set();
    for (const p of PROGS) for (const [c, at] of run(x, y, p)) if (c !== k){ nx.add(c); if (!pos.has(c)) pos.set(c, at); }
    if (LEVEL.updrafts.length) for (const p of LONG) for (const [c, at] of run(x, y, p, 420)) if (c !== k){ nx.add(c); if (!pos.has(c)) pos.set(c, at); }   // where there is rising air to ride
    edges.set(k, nx);
    for (const c of nx) if (!seen.has(c)){ seen.add(c); q.push(c); }
  }
  return GRAPH = { seen, edges };
}
const nearSeen = (seen, mx, my, r = 4) => { for (let a = -r; a <= r; a++) for (let b = -2; b <= r; b++) if (seen.has((my + b) * W + mx + a)) return true; return false; };

test(`${NAME}, played with the real motor: every room, the shrine, the stage and the way out are reached from the spawn`, () => {
  const { seen } = graph();
  for (const r of rooms){ let any = false; for (const k of seen){ const i = k % W, j = (k - i) / W; if (i >= r.tx0 && i < r.tx1 && j >= r.ty0 && j < r.ty1){ any = true; break; } } assert.ok(any, `room ${r.name} is not reached`); }
  for (const t of ['shrine', 'boss', 'exit']){ const m = marks.find(k => k.type === t); if (m || t !== 'boss') assert.ok(m && nearSeen(seen, m.x, m.y), `${t} is not reached`); }
});
test(`${NAME}, played with the real motor: from anywhere he gets to, he can still get to where the region leads`, () => {
  const { seen, edges } = graph(), back = new Map();
  for (const [a, nx] of edges) for (const b of nx){ if (!back.has(b)) back.set(b, []); back.get(b).push(a); }
  const boss = marks.find(m => m.type === 'boss') || marks.find(m => m.type === 'exit'), ok = new Set(), q = [];
  for (const k of seen){ const i = k % W, j = (k - i) / W; if (Math.abs(i - boss.x) < 12 && Math.abs(j - boss.y) < 2){ ok.add(k); q.push(k); } }
  while (q.length){ const k = q.pop(); for (const p of back.get(k) || []) if (!ok.has(p)){ ok.add(p); q.push(p); } }
  const stuck = [...seen].filter(k => !ok.has(k)).map(k => { const i = k % W, j = (k - i) / W, r = rooms.find(r => i >= r.tx0 && i < r.tx1 && j >= r.ty0 && j < r.ty1); return `${r ? r.name : '?'} ${i},${j}`; });
  assert.equal(stuck.length, 0, `${stuck.length} places he gets to but not out of, e.g. ${stuck.slice(0, 6).join('; ')}`);
});
}
