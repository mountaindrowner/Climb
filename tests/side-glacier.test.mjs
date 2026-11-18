// The Glacier Galleries (phase 11, docs/phase11-sheet.md): the Spires' east wing. Its rooms and their gate are held by
// the region tests (none of it is reached without the Toll's step; the way out is not a way in). These hold what is its
// own: the ice a fire melts, the brazier, one who sat, the Seated, the relic.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './helpers/browser.mjs';
const R = await import('./helpers/reach.mjs');
const LV = await import('../src/side/level.js');
const GL = await import('../src/side/regions/glacier.js');
const { RELICS } = await import('../src/side/state.js');
const L = { ...R.loadLevel(2) }, room = n => L.rooms.find(r => r.name === n), NAMES = ['shelter', 'sitters', 'deepice', 'seated', 'meltwater'];
const inRoom = (m, r) => m.x >= r.tx0 && m.x < r.tx1 && m.y >= r.ty0 && m.y < r.ty1;

test('ten screens east of the horn, behind a pane of thin ice in it: the Toll\'s step', () => {
  const rs = NAMES.map(room); assert.ok(rs.every(Boolean)); assert.equal(rs.reduce((n, r) => n + (r.tx1 - r.tx0) * (r.ty1 - r.ty0) / (40 * 23), 0), 10);
  assert.ok(rs.every(r => r.gate === 'dash' && r.title === 'THE GLACIER GALLERIES' && r.look === 'glacier' && r.tx0 >= room('teeth').tx1));
  const te = room('teeth'), pane = []; for (let y = 38; y <= 43; y++) pane.push(L.tiles[(te.ty0 + y) * L.W + te.tx1 - 4]); assert.ok(pane.every(t => t === LV.VELLUM), 'the pane in the horn');
});
test('ice a fire melts: rock while its brazier is cold, gone when that one is lit, and only that one', () => {
  R.graph(2, [...R.GIFTS, 'unlit']); const W = LV.LEVEL.W, sh = room('shelter'), fires = L.marks.filter(m => m.type === 'brazier' && inRoom(m, sh)).map(m => m.x + ',' + m.y); assert.equal(fires.length, 2);
  const tiles = []; for (let k = 0; k < LV.LEVEL.tiles.length; k++) if (LV.LEVEL.tiles[k] === LV.MELT && inRoom({ x: k % W, y: Math.floor(k / W) }, sh)) tiles.push(k);
  const of = key => tiles.filter(k => LV.LEVEL.meltOf.get(k) === key), at = k => LV.tileAt(k % W, Math.floor(k / W)); assert.ok(of(fires[0]).length && of(fires[1]).length && of(fires[0]).length + of(fires[1]).length === tiles.length, 'every piece answers to one of the two');
  assert.ok(tiles.every(k => at(k) === LV.ROCK), 'cold: all of it holds'); LV.RULE.lit.add(fires[0]);
  assert.ok(of(fires[0]).every(k => at(k) === LV.EMPTY)); assert.ok(of(fires[1]).every(k => at(k) === LV.ROCK), 'the other fire\'s ice is not touched'); LV.RULE.lit.clear();
  assert.ok(L.marks.filter(m => m.type === 'brazier').length >= 9); assert.ok(L.marks.filter(m => m.ice).every(m => m.fire), 'whoever is in the ice answers to a fire');
});
test('with no fire lit the way on is shut at the shelter; the way out is not a way in', () => {
  const cold = R.graph(2, [...R.GIFTS, 'unlit']); assert.ok(R.reached(cold.seen, room('shelter'), cold.W)); for (const n of ['sitters', 'deepice', 'seated']) assert.ok(!R.reached(cold.seen, room(n), cold.W), n);
  const lit = R.graph(2, R.GIFTS); for (const n of NAMES) assert.ok(R.reached(lit.seen, room(n), lit.W), n);
  const noStep = R.graph(2, R.GIFTS.filter(g => g !== 'dash')); for (const n of NAMES) assert.ok(!R.reached(noStep.seen, room(n), noStep.W), n + ' without the step');
});
// a creature's turn, with what the game gives its code stubbed
const ctx = (e, P, RULE, over = {}) => { const ev = [], hurts = []; return { ev, hurts, c: { dx: P.x - e.x, dy: P.y - e.y, dist: Math.hypot(P.x - e.x, P.y - e.y), events: ev, go: s => { e.st = s; e.tm = 0; }, anim(){}, fx: { burst(){}, dust(){} }, E: { scene: { add(){} }, R: null }, RULE, T: 0.5, rooms: [], marks: [{ type: 'brazier', x: 1, y: 0 }, { type: 'brazier', x: 2, y: 0 }, { type: 'brazier', x: 3, y: 0 }],
  hurt: (Q, n, x, w) => { hurts.push([n, w]); return true; }, isRollInv: () => false, ground: () => 0, solidAt: () => false, ...over } }; };
const mk = (type, x, more = {}) => ({ type, d: GL.enemies[type], x, y: 0, home: { x, y: 0 }, st: 'idle', tm: 0, age: 0, face: -1, dirn: -1, flash: 0, hp: GL.enemies[type].hp, ...more });
const turn = (e, P, RULE, secs) => { const all = { ev: [], hurts: [] }; for (let t = 0; t < secs; t += 1 / 60){ const K = ctx(e, P, RULE); e.tm += 1 / 60; e.age += 1 / 60; if (!GL.ai[e.d.ai]) break; GL.ai[e.d.ai](e, P, 1 / 60, K.c); all.ev.push(...K.ev); all.hurts.push(...K.hurts); } return all; };
const rule = (...keys) => ({ lit: new Set(keys), litAll: false });

test('a brazier is not a creature: a blow lights it, once, and it cannot be broken or aimed at', () => {
  const d = GL.enemies.brazier, e = mk('brazier', 0, { mk: { x: 5, y: 2 } }), RULE = rule(); assert.ok(d.prop && d.own); assert.equal(d.guard(e), true);
  const a = turn(e, { x: 1, y: 0, h: 2.4 }, RULE, 0.1); assert.deepEqual(a.ev.filter(v => v.type === 'thaw').map(v => v.key), ['5,2']);
  RULE.lit.add('5,2'); d.guard(e); const b = turn(e, { x: 1, y: 0, h: 2.4 }, RULE, 0.1); assert.equal(b.ev.length, 0, 'lit already: nothing more'); e.hp = 1; d.onHit(e, 9); assert.equal(e.hp, d.hp);
});
test('one who sat: in the ice he is a shape, and a blow does nothing; his fire lit, he shakes it off and is one of the Stopped', () => {
  const d = GL.enemies.sitter, e = mk('sitter', 0, { mk: { fire: '5,2' } }), P = { x: 3, y: 0, h: 2.4 }, RULE = rule();
  const a = turn(e, P, RULE, 2); assert.equal(e.st, 'idle'); assert.equal(e.d.ai, 'sitter'); assert.equal(a.hurts.length, 0); assert.equal(d.guard(e), true); e.hp = 1; d.onHit(e, 1); assert.equal(e.hp, 2);
  RULE.lit.add('5,2'); const b = turn(e, P, RULE, 1); assert.ok(b.ev.some(v => v.type === 'notice'), 'he is seen to wake'); assert.equal(e.d.ai, 'wraith', 'and then he fights as the Stopped do'); assert.equal(d.guard(e), false);
});
test('the Seated: wholly in the ice he does nothing and a blow does nothing; each fire frees more of him, and a blow counts for more', () => {
  const d = GL.enemies.seated, S = GL.SEATED, near = { x: -3, y: 0, h: 2.4 };
  const cold = mk('seated', 0), a = turn(cold, near, rule(), 4); assert.equal(a.hurts.length, 0); assert.equal(cold.lit, 0); assert.equal(d.guard(cold), true, 'the blade rings off the ice');
  const one = mk('seated', 0), b = turn(one, near, rule('1,0'), 3); assert.equal(one.lit, 1); assert.ok(b.ev.some(v => v.type === 'tell'), 'a warning'); assert.deepEqual(b.hurts[0], [2, 'Swept aside'], 'his arm, along the floor'); assert.equal(d.guard(one), false);
  const over = mk('seated', 0), c = turn(over, { x: -3, y: 2.2, h: 2.4 }, rule('1,0'), 3); assert.equal(c.hurts.length, 0, 'over the sweep: nothing');
  const far = mk('seated', 0), f1 = turn(far, { x: -12, y: 0, h: 2.4 }, rule('1,0'), 6); assert.equal(f1.hurts.length, 0, 'one fire, standing off: he cannot reach');
  const two = mk('seated', 0), f2 = turn(two, { x: -12, y: 0, h: 2.4 }, rule('1,0', '2,0'), 6); assert.ok(f2.hurts.some(h => h[1] === 'Struck by ice'), 'two fires: the ice he calls down falls where he stands'); assert.equal(two.x, 0, 'and he is seated still');
  const three = mk('seated', 0); turn(three, { x: -12, y: 0, h: 2.4 }, rule('1,0', '2,0', '3,0'), 4); assert.ok(three.x < -1, 'three fires: he gets up and comes');
  for (const [lit, takes] of [[1, 0.5], [2, 1], [3, 1.5]]){ const e = mk('seated', 0, { lit }); e.hp -= 2; d.onHit(e, 2); assert.equal(d.hp - e.hp, 2 * takes); }
  assert.ok(S.windup >= 0.5 && S.warn >= 0.6, 'warned for long enough'); assert.ok(d.hp >= 24 && d.hp <= 36);
});
test('the Climber\'s Flint is a relic, kept in the last fire\'s ice behind the Seated; the meltwater is quiet', () => {
  assert.ok(RELICS.flint && RELICS.flint.line.length <= 110 && RELICS.flint.lore); const se = room('seated'), chest = L.marks.find(m => m.type === 'chest' && m.holds === 'relic:flint'); assert.ok(chest && inRoom(chest, se));
  assert.equal(L.tiles[chest.y * L.W + chest.x], LV.MELT, 'in the ice'); assert.ok(GL.QUIET.includes('meltwater'));
});
