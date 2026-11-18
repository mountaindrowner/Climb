// The side view's regions, played with the real motor (tests/helpers/reach.mjs): from every place he can stand, the
// inputs a player has run through stepPlayer, and where he comes to rest is somewhere he can get to. Each region is
// played with the gifts he has when he first comes to it (the keepers below it) and with every gift:
//   - with what he has on arrival: every room not behind a gate, the shrine, the stage and the way out are reached
//     without a hurt. (No region may need a gift he is only given above it.)
//   - with every gift: every room is reached
//   - a room behind a gate (a wing) is shut without that gift, every other gift in hand
//   - and both ways, nowhere he can get to is a place he cannot get back out of toward where the region leads
//   - a fall raises him at the region's raising water, near where he comes in; from it, its keeper (or the way on) is a
//     real walk back but not a punishing one: within RUNBACK seconds at a run (phase 2: one raising pool a region)
// (A keeper's own gift is never needed to reach it: the first test plays each region without it.) tools/gifts-report.mjs
// writes what each gift opens from the same graphs, to docs/gifts-report.md
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { graph, arrival, GIFTS, giftName, reached, goalOf, nearGoal, runback, LEVELS, loadLevel } from './helpers/reach.mjs';
const RUNBACK = 60;   // seconds at a run from the raising water to where the region leads (a keeper's retry), at most

const nearSeen = (seen, W, mx, my, r = 4) => { for (let a = -r; a <= r; a++) for (let b = -2; b <= r; b++) if (seen.has((my + b) * W + mx + a)) return true; return false; };
const said = gifts => gifts.length ? gifts.map(giftName).join(', ') : 'no gift';

for (let N = 0; N < LEVELS.length; N++){
  const NAME = LEVELS[N].name, ARR = arrival(N), ALL = GIFTS;
  const gates = [...new Set(loadLevel(N).rooms.filter(r => r.gate).map(r => r.gate))];

  test(`${NAME}, played with the real motor and what he has when he comes (${said(ARR)}): every open room, the raising water, the stage and the way out`, () => {
    const { seen, W, marks, rooms } = graph(N, ARR);
    // the way on past the keeper's hall is behind stone until the keeper falls (phase 9): never reached without the
    // stone broken, whatever else he has; reached with it
    const shut = graph(N, N === 0 ? ARR : ALL).seen, open = graph(N, [...ALL, 'fallen']).seen;   // every gift and the keeper standing (in the Roots, before the spade it leaves); and the keeper fallen
    for (const r of rooms){
      if (r.after){ assert.ok(!reached(shut, r, W), `room ${r.name} is reached past the keeper`); assert.ok(reached(open, r, W), `room ${r.name} is not reached once the keeper has fallen`); }
      else if (r.gate && !ARR.includes(r.gate)) assert.ok(!reached(seen, r, W), `room ${r.name} is reached before its gate (${giftName(r.gate)})`);
      else assert.ok(reached(seen, r, W), `room ${r.name} is not reached with ${said(ARR)}`);
    }
    const deep = !marks.some(k => k.type === 'exit');   // a section of the Deep: its passage back, not a way on
    for (const t of ['water', 'boss', deep ? 'pass' : 'exit']){ const m = t === 'water' ? (q => q && { ...q, x: q.x + Math.floor((q.w || 1) / 2) })(marks.find(k => k.type === 'pool' && !k.plain)) : marks.find(k => k.type === t); if (m || t !== 'boss'){ const sn = m && m.join ? open : seen; assert.ok(m && (nearSeen(sn, W, m.x, m.y) || nearSeen(sn, W, m.x + 2, m.y + 1)), `${t} is not reached with ${said(ARR)}`); } }
  });
  if (ALL.length > ARR.length) test(`${NAME}, played with the real motor and every gift: every room`, () => {
    const { seen, W, rooms } = graph(N, [...ALL, 'fallen']);
    for (const r of rooms) assert.ok(reached(seen, r, W), `room ${r.name} is not reached, even with every gift and its keeper fallen`);
  });
  for (const g of gates) test(`${NAME}, played with the real motor: what is behind ${giftName(g)} stays shut without it`, () => {
    const { seen, W, rooms } = graph(N, ALL.filter(x => x !== g));
    for (const r of rooms.filter(r => r.gate === g)) assert.ok(!reached(seen, r, W), `room ${r.name} is reached without ${giftName(g)}`);
  });
  test(`${NAME}, played with the real motor: its raising water near where he comes in, and where the region leads within ${RUNBACK} s of it`, () => {
    const G = graph(N, ARR), near = nearGoal(goalOf(G.marks)), pools = G.marks.filter(m => m.type === 'pool' && !m.plain), sp = G.marks.find(m => m.type === 'spawn');
    assert.equal(pools.length, 1, 'one raising pool');
    const P = pools[0], at = { x: P.x + Math.floor((P.w || 8) / 2), y: P.y };
    const d = Math.round(Math.hypot(at.x - sp.x, at.y - sp.y));   // a room or less, as the crow flies
    assert.ok(d <= 45, `the raising pool is ${d} tiles from where he comes in`);
    const r = runback(G, at, near);
    assert.ok(r && r.secs <= RUNBACK, `where the region leads is ${r ? r.secs.toFixed(0) + ' s' : 'not connected'} from the raising water`);
  });
  for (const gifts of ALL.length > ARR.length ? [ARR, ALL] : [ARR]) test(`${NAME}, played with the real motor (${said(gifts)}): from anywhere he gets to, he can still get to where the region leads`, () => {
    const { seen, edges, W, marks, rooms } = graph(N, gifts), back = new Map();
    for (const [a, nx] of edges) for (const b of nx.keys()){ if (!back.has(b)) back.set(b, []); back.get(b).push(a); }
    const near = nearGoal(goalOf(marks)), ok = new Set(), q = [];
    for (const k of seen){ const i = k % W, j = (k - i) / W; if (near(i, j)){ ok.add(k); q.push(k); } }
    while (q.length){ const k = q.pop(); for (const p of back.get(k) || []) if (!ok.has(p)){ ok.add(p); q.push(p); } }
    const stuck = [...seen].filter(k => !ok.has(k)).map(k => { const i = k % W, j = (k - i) / W, r = rooms.find(r => i >= r.tx0 && i < r.tx1 && j >= r.ty0 && j < r.ty1); return `${r ? r.name : '?'} ${i},${j}`; });
    assert.equal(stuck.length, 0, `${stuck.length} places he gets to but not out of, e.g. ${stuck.slice(0, 6).join('; ')}`);
  });
}
