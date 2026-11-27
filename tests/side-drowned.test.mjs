// The Drowned Galleries (docs/drowned-sheet.md): the Roots' west wing. The region tests hold that its rooms are reached
// and nothing in them traps him, played at every height of the water. These hold what is its own: where it lies, the
// water that breathes, what only high water comes to, the way back through the pool, the relic, and the save's move.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './helpers/browser.mjs';
const R = await import('./helpers/reach.mjs');
const LV = await import('../src/side/level.js');
const DR = await import('../src/side/regions/drowned.js');
const M = await import('../src/side/motor.js');
const ST = await import('../src/side/state.js');
const L = { ...R.loadLevel(0) }, room = n => L.rooms.find(r => r.name === n), NAMES = ['waterstair', 'drownedhall', 'keepcells', 'weir', 'cuproom', 'culvert'];
const stoodIn = (seen, r, x0, y0, x1, y1) => { for (const k of seen){ const i = k % L.W - r.tx0, j = Math.floor(k / L.W) - r.ty0; if (i >= x0 && i <= x1 && j >= y0 && j <= y1) return true; } return false; };

test('twelve screens, west of the pool and lower than it, open from the first', () => {
  const rs = NAMES.map(room); assert.ok(rs.every(Boolean));
  assert.equal(rs.reduce((n, r) => n + (r.tx1 - r.tx0) * (r.ty1 - r.ty0) / (40 * 23), 0), 12);
  const st = room('start'); assert.ok(rs.every(r => r.title === 'THE DROWNED GALLERIES' && r.wing && !r.gate));
  for (const n of ['waterstair', 'drownedhall', 'keepcells', 'weir', 'cuproom']) assert.ok(room(n).tx1 <= st.tx0, n + ' is west of the pool room');
  for (const n of ['waterstair', 'drownedhall', 'keepcells', 'culvert']) assert.ok(room(n).ty0 < st.ty0, n + ' goes lower than the pool');
  assert.equal(room('culvert').tx0, st.tx0, 'the culvert is under the pool room'); assert.equal(room('culvert').ty1, st.ty0);
  for (let y = st.ty0 + 2; y <= st.ty0 + 6; y++) assert.equal(L.tiles[y * L.W + st.tx0], LV.EMPTY, 'a door in the pool room\'s west wall');
});
test('the water breathes: low, a slow rise, high, a fall, the same every time', () => {
  const B = LV.BREATH, all = B.low + B.rise + B.high + B.fall; B.hold = null;
  try {
    assert.equal(LV.breath(0), 0); assert.equal(LV.breath(B.low + B.rise + 1), 1); assert.equal(LV.breath(B.low + B.rise / 2), 0.5);
    for (let t = 0; t < all; t += 0.37){ const a = LV.breath(t), b = LV.breath(t + 1 / 60); assert.ok(a >= 0 && a <= 1); assert.ok(Math.abs(a - b) < 0.01, 'no jump in it'); assert.ok(Math.abs(LV.breath(t + all * 3) - a) < 1e-9, 'the same every time'); }
    assert.ok(B.rise >= 10 && B.fall >= 10 && B.high >= 4, 'slow enough to watch, and it stands long enough to be used');
  } finally { B.hold = 0; }
  const ws = L.waters.filter(w => w.key === 'breath'); assert.ok(ws.length >= 5);
  for (const w of ws.filter(w => w.gain === 1)) assert.equal(Math.round((w.y1 - w.lo) / LV.T), 16, 'sixteen tiles between low water and high: more than he can climb (fourteen and a half, with a second jump and his hands)');
  const w = ws.find(w => w.gain === 1); B.hold = 0; assert.equal(LV.waterTop(w), w.lo); B.hold = 1; assert.equal(LV.waterTop(w), w.y1); B.hold = 0.5; assert.equal(LV.waterTop(w), (w.lo + w.y1) / 2); B.hold = 0;
});
test('at low water he walks the hall\'s floor and no more; the galleries, the cells, the weir and the cup room want the rise', () => {
  const low = R.graph(0, ['lowwater', 'gate:hall']), hall = room('drownedhall'), stair = room('waterstair');   // (the hall's gate up: its windlass wants the rise too)
  assert.ok(stoodIn(low.seen, hall, 2, 8, 13, 8) && stoodIn(low.seen, hall, 60, 8, 77, 8), 'the hall\'s floor, end to end, on his feet');
  assert.ok(!stoodIn(low.seen, hall, 2, 24, 9, 25), 'not its west gallery'); assert.ok(!stoodIn(low.seen, hall, 70, 24, 77, 25), 'nor its east');
  assert.ok(!stoodIn(low.seen, stair, 2, 28, 5, 29), 'nor the ledge over the hall\'s door');
  for (const n of ['keepcells', 'weir', 'cuproom']) assert.ok(!R.reached(low.seen, room(n), low.W), n + ' is not come to at low water');
  const all = R.graph(0, []);
  assert.ok(stoodIn(all.seen, hall, 2, 24, 9, 25) && stoodIn(all.seen, hall, 70, 24, 77, 25) && stoodIn(all.seen, stair, 2, 28, 5, 29), 'the rise brings him to all three');
  for (const n of NAMES) assert.ok(R.reached(all.seen, room(n), all.W), n);
});
test('the thread is on the east gallery, where only the rise brings him; the weir\'s banks are climbed by their sills', () => {
  const hall = room('drownedhall'), we = room('weir'), th = L.marks.find(m => m.type === 'thread' && m.x >= hall.tx0 && m.x < hall.tx1 && m.y >= hall.ty0 && m.y < hall.ty1); assert.ok(th);
  assert.ok(th.x - hall.tx0 >= 70 && th.y - hall.ty0 >= DR.DROWNED.high, 'on the east gallery, where high water comes to');
  assert.equal(DR.DROWNED.high - DR.DROWNED.floor, 16); assert.equal(DR.DROWNED.weirHigh - DR.DROWNED.weirLow, 16);
  // the weir (since build 110): two sills on each bank's face. From the bed at low water each bank is climbed by them, and
  // not without them: straight up the middle of the pond there is nothing
  for (const x of [16, 30]) for (const y of [7, 13]) assert.equal(L.tiles[(we.ty0 + y) * L.W + we.tx0 + x], LV.ROCK, 'a sill');
  LV.BREATH.hold = 0; const climb = x0 => { let front = [[(we.tx0 + x0) * LV.T, (we.ty0 + 2) * LV.T]], top = 0; const seen = new Set();
    for (let hop = 0; hop < 4; hop++){ const next = []; for (const [x, y] of front) for (const p of R.PROGS) for (const [c, at] of R.run(x, y, p)){ top = Math.max(top, Math.floor(c / L.W) - we.ty0); if (!seen.has(c)){ seen.add(c); next.push(at); } } front = next.slice(0, 40); } return top; };
  assert.ok(climb(18.5) >= 19, 'up the west bank by its sills'); assert.ok(climb(29.5) >= 19, 'and the east');
});
test('the culvert: from the hall\'s drain, under the stair, and up through the boards in the pool he woke in; and down again', () => {
  const st = room('start'), cu = room('culvert'), sp = L.marks.find(m => m.type === 'spawn');
  for (let x = 3; x <= 6; x++) assert.equal(L.tiles[st.ty0 * L.W + st.tx0 + x], LV.LEDGE, 'boards in the pool\'s floor');
  assert.ok(sp.x > st.tx0 + 6, 'he does not wake on them');
  assert.equal(L.tiles.filter((t, k) => t === LV.LEDGE && k % L.W >= cu.tx0 && k % L.W < cu.tx1 && Math.floor(k / L.W) >= cu.ty0 && Math.floor(k / L.W) < cu.ty1).length, 12, 'three rungs in its shaft');
  // with the water held low, and the door in the pool room's wall never used, the boards are still a way down and back
  const low = R.graph(0, ['lowwater', 'shut']); assert.ok(stoodIn(low.seen, cu, 0, 2, 8, 2), 'the culvert\'s floor');
  LV.BREATH.hold = 0; let up = false; const from = [(cu.tx0 + 4.5) * LV.T, (cu.ty0 + 20) * LV.T];
  for (const p of R.PROGS) for (const [c] of R.run(from[0], from[1], p)) if (Math.floor(c / L.W) === st.ty0 + 1) up = true;
  assert.ok(up, 'from the top rung he comes up through the boards, into the pool');
});
test('the Keepers\' Cup: in the cup room, the wing\'s one relic; a drink more', () => {
  const cup = room('cuproom'), ch = L.marks.filter(m => m.type === 'chest' && /^relic:/.test(m.holds || '') && NAMES.map(room).some(r => m.x >= r.tx0 && m.x < r.tx1 && m.y >= r.ty0 && m.y < r.ty1));
  assert.equal(ch.length, 1); assert.equal(ch[0].holds, 'relic:cup'); assert.ok(ch[0].x >= cup.tx0 && ch[0].x < cup.tx1 && ch[0].y >= cup.ty0);
  assert.ok(ST.RELICS.cup && ST.RELICS.cup.line.length <= 110);
  const G = ST.G, was = { relics: G.relics, worn: G.worn, flasks: G.flasks };
  G.relics = []; G.worn = []; G.flasks = 0; const base = ST.maxFlask(); G.relics = ['cup']; G.worn = ['cup']; assert.equal(ST.maxFlask(), base + 1); Object.assign(G, was);
  assert.ok(!L.waters.some(w => w.x0 < cup.x1 && w.x1 > cup.x0 && w.y0 < cup.y1 && w.y1 > cup.y0), 'the cup room is dry always');
});
test('a save from before the wing: what it had found and broken in the Roots is moved with them, once', () => {
  assert.deepEqual(ST.WING_MOVED[0].slice(0, 2), [ST.ORG115[0][0], ST.ORG115[0][1] - ST.LIFT_MOVED], 'by as far as the Roots moved for the wing'); assert.deepEqual(ST.ORG115[0], [DR.wing.left * 40, DR.wing.down * 23 + LV.LIFT.base * 23]); assert.ok(L.X0 >= ST.ORG115[0][0] && L.Y0 >= ST.ORG115[0][1], 'what has been built past the wing since is the save\'s own to follow (state.js rebase)'); assert.equal(ST.LIFT_MOVED, LV.LIFT.base * 23, 'and every level 46 more, for the rows under it (build 115)');
  const store = {}; globalThis.localStorage = { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
  const old = { seamed: 1, joined: 1, winged: 4, can: {}, level: 0, top: 0, got: { 0: ['t24,13', 'c33,15'], 1: ['c200,80'] }, broke: { 0: ['10,5'] }, blocked: {}, relics: [], worn: [], wat: { 0: ['r', '20,10|the pool'], 6: ['r', '30,40|a level'] } };
  store['climb-side'] = JSON.stringify(old);
  const G = ST.loadSave();
  if (G.began){ assert.deepEqual(G.got[0], ['t184,105', 'c193,107']); assert.deepEqual(G.broke[0], ['170,97']); assert.deepEqual(G.got[1], ['c200,126'], 'the Cloister\'s is lifted, and not moved aside'); assert.equal(G.winged, 6); assert.deepEqual(G.wat[0], ['r', '180,102|the pool'], 'a leak he found to travel by moves with its place'); assert.deepEqual(G.wat[6], ['r', '30,86|a level']);
    store['climb-side'] = JSON.stringify(G); const again = ST.loadSave(); assert.deepEqual(again.got[0], ['t184,105', 'c193,107'], 'and not moved twice'); }
  else assert.fail('the save was not read: its key is not one this test knows');
  // a save from build 107 to 114 has the wing's move already, and is only lifted
  store['climb-side'] = JSON.stringify({ ...old, winged: 5, got: { 0: ['t184,59'], 7: ['c10,20'] } }); const late = ST.loadSave();
  assert.deepEqual(late.got[0], ['t184,105'], 'lifted, not moved aside again'); assert.deepEqual(late.got[7], ['c10,66'], 'the Deep as well');
});

// ---- the gates and their windlasses (build 108)
const gates = L.marks.filter(m => m.type === 'gate' && ['hall', 'cells', 'culvert'].includes(m.key)) /* the wing's three: not its hatch, nor the Ossuary's slabs */, lasses = L.marks.filter(m => m.type === 'windlass' && ['hall', 'cells', 'culvert'].includes(m.key)) /* (not the bucket-chain's, past the weir: build 116) */, roomOf = m => L.rooms.find(r => m.x >= r.tx0 && m.x < r.tx1 && m.y >= r.ty0 && m.y < r.ty1);
test('three gates of stone, each with a windlass that is somewhere else', () => {
  assert.deepEqual(gates.map(g => g.key).sort(), ['cells', 'culvert', 'hall']); assert.deepEqual(lasses.map(g => g.key).sort(), ['cells', 'culvert', 'hall']);
  for (const g of gates){ for (let y = g.y; y < g.y + g.h; y++) for (let x = g.x; x < g.x + g.w; x++){ assert.equal(L.tiles[y * L.W + x], LV.SLUICE); assert.equal(L.gateOf.get(y * L.W + x), g.key); }
    const w = lasses.find(q => q.key === g.key); assert.ok(Math.hypot(w.x - g.x, w.y - g.y) >= 14, `the ${g.key} windlass is not beside its gate`); }
  assert.equal(roomOf(lasses.find(q => q.key === 'hall')).name, 'waterstair'); assert.equal(roomOf(lasses.find(q => q.key === 'cells')).name, 'drownedhall'); assert.equal(roomOf(lasses.find(q => q.key === 'culvert')).name, 'cuproom');
  assert.ok(DR.enemies.windlass.prop && DR.enemies.windlass.own, 'a windlass is a thing, not a creature');
  // down, a gate is rock; up, nothing
  R.loadLevel(0); LV.setGates(); const g = gates.find(q => q.key === 'hall'); assert.equal(LV.tileAt(g.x, g.y), LV.ROCK); LV.RULE.gates.add('hall'); assert.equal(LV.tileAt(g.x, g.y), LV.EMPTY); LV.setGates();
});
test('as he finds it: every gate down. The hall is shut, and the drain under it is a dead end', () => {
  const G = R.graph(0, ['shut']), hall = room('drownedhall'), cu = room('culvert');
  assert.ok(!stoodIn(G.seen, hall, 2, 8, 63, 8) && !stoodIn(G.seen, hall, 2, 24, 77, 25), 'neither the hall\'s floor nor its galleries');
  assert.ok(stoodIn(G.seen, room('waterstair'), 2, 28, 5, 29), 'the ledge over the hall\'s gate, and its windlass: the rise brings him');
  const few = R.graph(0, ['shut', 'shallow']); assert.ok(!stoodIn(few.seen, room('waterstair'), 2, 28, 5, 29), 'and a quarter of the rise does not');
  assert.ok(stoodIn(G.seen, cu, 0, 2, 8, 2) && stoodIn(G.seen, hall, 68, 2, 79, 2), 'the drain, from the pool as far as under the grate');
});
test('the hall\'s gate up: the hall and its galleries; the cells\' pit stays dry, and its far side is not come to', () => {
  const G = R.graph(0, ['shut', 'gate:hall']), hall = room('drownedhall'), ce = room('keepcells');
  assert.ok(stoodIn(G.seen, hall, 2, 8, 13, 8) && stoodIn(G.seen, hall, 2, 24, 9, 25) && stoodIn(G.seen, hall, 70, 24, 77, 25));
  assert.ok(stoodIn(G.seen, ce, 26, 24, 39, 24) && stoodIn(G.seen, ce, 14, 8, 25, 8), 'the way in, and the pit\'s floor (he may drop in)');
  assert.ok(!stoodIn(G.seen, ce, 2, 24, 13, 25), 'not the top cell, across the pit'); for (const n of ['weir', 'cuproom']) assert.ok(!R.reached(G.seen, room(n), G.W), n);
  // the dry pit is not a trap: from its floor, on the far side of the hung wall, he gets back to the way in
  const start = [...G.seen].find(k => k % G.W - ce.tx0 >= 14 && k % G.W - ce.tx0 <= 18 && Math.floor(k / G.W) - ce.ty0 === 8); assert.ok(start != null);
  const seen = new Set([start]), q = [start]; let out = false;
  while (q.length && !out){ const k = q.pop(); for (const c of (G.edges.get(k) || new Map()).keys()) if (!seen.has(c)){ seen.add(c); q.push(c); const i = c % G.W - ce.tx0, j = Math.floor(c / G.W) - ce.ty0; if (i >= 26 && j === 24) out = true; } }
  assert.ok(out, 'out of the pit by the ladder in the rock');
});
test('the cells\' gate up: the water comes into the pit, and carries him up its far side to the cells, the weir and the cup room', () => {
  const G = R.graph(0, ['shut', 'gate:hall', 'gate:cells']), ce = room('keepcells');
  assert.ok(stoodIn(G.seen, ce, 2, 24, 13, 25), 'the top cell'); for (const n of ['weir', 'cuproom']) assert.ok(R.reached(G.seen, room(n), G.W), n);
  const dry = R.graph(0, ['shut', 'gate:hall', 'gate:cells', 'lowwater']); assert.ok(!stoodIn(dry.seen, ce, 2, 24, 13, 25), 'and not without the rise');
});
test('a gate that is down holds the water behind it; the cells\' is held dry until he raises it, and his save keeps how he left it', () => {
  R.loadLevel(0); const w = L.waters.find(q => q.held === 'cells'), g = gates.find(q => q.key === 'cells'); assert.ok(w && g.holds && g.at === 0);
  LV.setGates(); for (const b of [0, 0.5, 1]){ LV.BREATH.hold = b; assert.equal(LV.waterTop(w), w.lo, 'down: dry, whatever the rest does'); }
  LV.setGates({ cells: 1 }); LV.BREATH.hold = 1; assert.equal(LV.waterTop(w), w.y1, 'up: it breathes with the rest'); LV.BREATH.hold = 0; assert.equal(LV.waterTop(w), w.lo);
  LV.setGates({ cells: { held: 1 } }); assert.equal(LV.waterTop(w), w.y1, 'let down at high water: it stays full'); LV.BREATH.hold = 0.5; assert.equal(LV.waterTop(w), w.y1);
  LV.setGates({ hall: 1, culvert: { held: null } }); assert.ok(LV.RULE.gates.has('hall') && !LV.RULE.gates.has('culvert') && LV.RULE.held.cells === 0); LV.setGates(); LV.BREATH.hold = 0;
});
test('the one who plays it through turns all three, in their order: the hall\'s, the cells\', the culvert\'s', () => {
  const G = R.graph(0, []); assert.deepEqual([...G.gates].filter(k => k !== 'draw').sort(), ['cells', 'culvert', 'hall']);   // (and the bucket-chain past the weir, which is no gate)
  const cup = lasses.find(q => q.key === 'culvert'), shut = R.graph(0, ['shut', 'gate:hall']); assert.ok(![...shut.seen].some(k => Math.abs(k % shut.W - cup.x) <= 3 && Math.abs(Math.floor(k / shut.W) - cup.y) <= 2), 'the culvert\'s windlass is the last: behind the cells and the weir');
});

// ---- who lives in it (build 109)
const skim = (top, P, secs = 3) => { const d = DR.enemies.skimmer, e = { type: 'skimmer', d, x: 20, y: top + d.over, home: { x: 20, y: 6 }, st: 'idle', tm: 0, age: 0, face: 1, mk: { y: 6, span: 4 } }, ev = [], shots = [];   // (set over a pool whose bed is at row 6; it begins where it hangs)
  for (let t = 0; t < secs; t += 1 / 60){ e.tm += 1 / 60; e.age += 1 / 60; DR.ai.skimmer(e, P, 1 / 60, { T: 0.5, dx: P.x - e.x, dy: P.y - e.y, waterAt: (x, y) => y < top ? {} : null, go: s => { e.st = s; e.tm = 0; }, anim(){}, events: ev, E: {}, shoot: (E, q, at, lob) => shots.push({ at, lob, y: e.y }) }); }
  return { e, ev, shots, d }; };
test('the skimmer hangs over its own water, wherever that water\'s top is, and keeps to its pool', () => {
  for (const top of [4, 7.5, 12]){ const { e, d } = skim(top, { x: 60, y: 0 }); assert.ok(Math.abs(e.y - (top + d.over)) < 0.2, `over water at ${top}: it is at ${e.y.toFixed(2)}`); assert.ok(e.x >= 18 - 1e-6 && e.x <= 22 + 1e-6, 'within four tiles of where it was set'); }
  assert.equal(L.marks.filter(m => m.type === 'skimmer').length, 2); for (const m of L.marks.filter(m => m.type === 'skimmer')) assert.ok(LV.waterAt((m.x + 0.5) * LV.T, (m.y + 0.5) * LV.T), 'each is set over a pool that never empties');
  assert.ok(DR.enemies.skimmer.fly && DR.enemies.skimmer.hp === 2 && !DR.enemies.skimmer.reach, 'a flier, two blows, and it does not come at him');
});
test('it spits a bead in a flat line at one on his feet, after a warning; one who is afloat it leaves alone', () => {
  const walker = skim(4, { x: 25, y: 4 }); assert.ok(walker.ev.some(v => v.type === 'tell'), 'a warning'); assert.ok(walker.shots.length >= 1, 'and the bead');
  for (const s of walker.shots){ assert.equal(s.lob, false); assert.ok(Math.abs(s.at.y + 1.4 - (s.y + walker.d.mouthY)) < 1e-6, 'aimed level with its own mouth: flat'); }
  assert.ok(walker.d.charge >= 0.6, 'warned for long enough'); assert.ok(4 + walker.d.over + walker.d.mouthY > 4 + M.BODY.crouch - 0.2, 'and it goes over one who ducks');
  const afloat = skim(12, { x: 25, y: 12 - M.SWIM.float }); assert.equal(afloat.shots.length, 0, 'nothing at a swimmer'); assert.ok(12 + afloat.d.over + afloat.d.mouthY > 12 - M.SWIM.float + M.BODY.stand, 'its bead would pass over his head anyway');
  const far = skim(4, { x: 60, y: 4 }); assert.equal(far.shots.length, 0, 'nor at one far off');
});

// ---- the Squid (build 110 as a pike; build 111 as it is): the wing's fight
const pikeAt = (depth, P, secs = 4, st0 = 'idle') => { const d = DR.enemies.squid, bed = 1, e = { type: 'squid', d, x: 12, y: bed + 1, home: { x: 12, y: bed + 1 }, st: st0, tm: 0, age: 0, face: 1, mk: { y: bed * 2, span: 6 } }, ev = [], hits = [];
  for (let t = 0; t < secs; t += 1 / 60){ e.tm += 1 / 60; e.age += 1 / 60; DR.ai.squid(e, P, 1 / 60, { T: 0.5, dx: P.x - e.x, dy: P.y - e.y, waterAt: (x, y) => y < bed + depth ? {} : null, go: s => { e.st = s; e.tm = 0; }, anim(){}, events: ev,
    hit: (x0, y0, x1, y1) => { const h = P.x + 0.34 > x0 && P.x - 0.34 < x1 && P.y + 2.4 > y0 && P.y < y1; if (h) hits.push(t); return h; } }); }
  return { e, ev, hits, d, bed }; };
test('the Squid afloat: a blow glances off it, and it comes at whatever is in its water, after a warning; one on the bank it leaves', () => {
  const swim = pikeAt(8, { x: 14, y: 1 + 8 - M.SWIM.float }); assert.equal(swim.e.beached, false); assert.equal(swim.d.guard(swim.e), true, 'a blow is turned');
  assert.ok(swim.ev.some(v => v.type === 'tell'), 'a warning'); assert.ok(swim.hits.length >= 1, 'and it takes one who stays where he is');
  assert.ok(swim.d.windup >= 0.5, 'warned for long enough to move');
  const bank = pikeAt(8, { x: 14, y: 1 + 8.5 }); assert.equal(bank.hits.length, 0, 'nothing at one on the bank'); assert.ok(!bank.ev.some(v => v.type === 'tell'));
  for (const P of [{ x: 9.2, y: 4 }, { x: 14.8, y: 4 }]){ const q = pikeAt(8, P, 6); assert.ok(q.e.x >= q.e.pond.x0 + 1 && q.e.x <= q.e.pond.x1 - 1, 'it keeps to its pond'); assert.ok(q.e.y > 1 && q.e.y < 9, 'and to its water'); }
});
test('the Squid left on the bed: it can be struck; it lashes at one before its arms, and turns on one behind it', () => {
  const front = pikeAt(0.5, { x: 15.2, y: 1 }); assert.equal(front.e.beached, true); assert.equal(front.d.guard(front.e), false, 'a blow lands');
  assert.ok(front.ev.some(v => v.type === 'tell') && front.hits.length >= 1, 'it warns, and snaps');
  const behind = pikeAt(0.5, { x: 9.5, y: 1 }, 0.9); assert.equal(behind.hits.length, 0, 'behind it, nothing yet'); assert.equal(behind.e.face, 1, 'it has not turned in under a second');
  const later = pikeAt(0.5, { x: 9.5, y: 1 }, 4); assert.equal(later.e.face, -1, 'but it turns'); assert.ok(later.hits.length >= 1, 'and then snaps');
  const up = pikeAt(0.5, { x: 15.2, y: 9 }); assert.equal(up.hits.length, 0, 'one up on a sill or a bank is out of its reach');
  assert.equal(L.marks.filter(m => m.type === 'squid').length, 1); assert.equal(roomOf(L.marks.find(m => m.type === 'squid')).name, 'weir'); assert.ok(DR.enemies.squid.name === 'The Squid' && DR.enemies.squid.hp >= 12);
  assert.ok(!DR.enemies.pike && !L.marks.some(m => m.type === 'pike'), 'no fish in the weir (27 Nov: "not fish for the water")');
});

// ---- the undercroft (build 112): the keepers' store, under the hall's floor
test('the undercroft: two screens under the hall, always under water, for one who has the Seated\'s Wind', () => {
  const st = room('keepstore'), hall = room('drownedhall'); assert.ok(st && st.title === 'THE DROWNED GALLERIES' && st.wing && st.gate === 'glide');
  assert.equal((st.tx1 - st.tx0) * (st.ty1 - st.ty0) / (40 * 23), 2); assert.equal(st.ty1, hall.ty0, 'under the hall'); assert.equal(st.tx0, hall.tx0);
  R.loadLevel(0); for (const b of [0, 1]){ LV.BREATH.hold = b; assert.ok(LV.waterAt((st.tx0 + 30.5) * LV.T, (st.ty0 + 10) * LV.T), 'under water at low water and at high'); } LV.BREATH.hold = 0;
  const none = R.graph(0, []); assert.ok(!R.reached(none.seen, st, none.W), 'not come to without the wind: the water will not let him under');
  const all = R.graph(0, R.GIFTS); assert.ok(R.reached(all.seen, st, all.W), 'with it, down through the west pool');
  for (const [x0, x1] of [[2, 21], [24, 39], [42, 57]]) assert.ok(stoodIn(all.seen, st, x0, 2, x1, 14), 'each of its three bays');
  const th = L.marks.filter(m => m.type === 'thread' && m.x >= st.tx0 && m.x < st.tx1 && m.y >= st.ty0 && m.y < st.ty1); assert.equal(th.length, 1, 'its thread');
  assert.ok([...all.seen].some(k => Math.abs(k % all.W - th[0].x) <= 2 && Math.abs(Math.floor(k / all.W) - th[0].y) <= 2), 'which he comes to');
});
test('the hatch in the hall\'s floor: no chain, only a ring on its underside. It is lifted from below, and not from above', () => {
  const hall = room('drownedhall'), h = L.marks.find(m => m.type === 'gate' && m.key === 'hatch'), ring = L.marks.find(m => m.type === 'ring'); assert.ok(h && ring && ring.key === 'hatch');
  assert.equal(h.y - hall.ty0, 7, 'in the hall\'s floor'); assert.ok(ring.y < h.y && ring.x >= h.x && ring.x < h.x + h.w, 'the ring under it'); assert.ok(!L.marks.some(m => m.type === 'windlass' && m.key === 'hatch'), 'no windlass for it');
  for (let x = h.x; x < h.x + h.w; x++) assert.equal(L.tiles[h.y * L.W + x], LV.SLUICE);
  const none = R.graph(0, []); assert.ok(!none.gates.includes('hatch'), 'one without the wind never lifts it'); assert.ok(stoodIn(none.seen, hall, 34, 8, 37, 8), 'he walks over it');
  const all = R.graph(0, R.GIFTS); assert.ok(all.gates.includes('hatch'), 'one with it does');
  assert.ok(DR.enemies.ring.prop && DR.enemies.ring.ai === 'windlass');
});
