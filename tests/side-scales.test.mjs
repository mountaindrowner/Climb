// The Ossuary's scales (build 113; docs/bare-wings-sheet.md): a door there is a grave-slab hung on a chain, and the chain
// comes down somewhere else to the pan of a scale. These hold where the slabs, pans and stacks are, what each slab shuts,
// that a slab goes up by as much as lies in its pan, his own weight, the stack, and the Tallyman who takes it back.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './helpers/browser.mjs';
const R = await import('./helpers/reach.mjs');
const LV = await import('../src/side/level.js');
const OS = await import('../src/side/regions/ossuary.js');
const L = { ...R.loadLevel(0) }, room = n => L.rooms.find(r => r.name === n), roomOf = m => L.rooms.find(r => m.x >= r.tx0 && m.x < r.tx1 && m.y >= r.ty0 && m.y < r.ty1);
const gates = L.marks.filter(m => m.type === 'gate' && ['yard', 'count'].includes(m.key)), ours = m => ['yard', 'count'].includes(m.key) /* (the Unsorted's scale, past the niches, is held in side-edges) */, pans = L.marks.filter(m => m.type === 'pan' && ours(m)), stacks = L.marks.filter(m => m.type === 'bonestack' && ours(m));

test('two scales: each slab\'s pan is in another room, and its stack is over the pan', () => {
  assert.deepEqual(gates.map(g => g.key).sort(), ['count', 'yard']); assert.deepEqual(pans.map(g => g.key).sort(), ['count', 'yard']); assert.deepEqual(stacks.map(g => g.key).sort(), ['count', 'yard']);
  for (const g of gates){ const p = pans.find(q => q.key === g.key), s = stacks.find(q => q.key === g.key);
    assert.notEqual(roomOf(p).name, roomOf({ x: g.x + (g.key === 'yard' ? -1 : 0), y: g.y }).name === 'yard' ? 'yard' : '-', `the ${g.key} pan is not in the room its slab shuts`);
    assert.equal(roomOf(p).name, roomOf(s).name, 'the stack is in the pan\'s room'); assert.ok(s.y > p.y + 4, 'over it'); assert.ok(Math.abs(s.x - p.x) <= 6, 'and near enough to go over into it');
    for (let y = g.y; y < g.y + g.h; y++) for (let x = g.x; x < g.x + g.w; x++) assert.equal(L.tiles[y * L.W + x], LV.SLUICE); }
  assert.equal(roomOf(pans.find(q => q.key === 'yard')).name, 'sorting'); assert.equal(roomOf(pans.find(q => q.key === 'count')).name, 'niches');
  assert.ok(OS.enemies.pan.harmless && OS.enemies.pan.prop && OS.enemies.bonestack.prop, 'things, not creatures');
});
test('a slab goes up by as much as lies in its pan: a third of its height a piece; one that lies across a hole, only for all three', () => {
  R.loadLevel(0); LV.setGates(); const y = gates.find(g => g.key === 'yard'), c = gates.find(g => g.key === 'count');
  const open = g => { let n = 0; for (let b = g.y; b < g.y + g.h; b++) if (LV.tileAt(g.x, b) === LV.EMPTY) n++; return n; };
  assert.equal(y.h, 6); assert.equal(open(y), 0, 'empty: down');
  for (const [load, rows] of [[1, 2], [2, 4], [3, 6]]){ LV.setPan('yard', load); assert.equal(open(y), rows, `${load} in the pan`); assert.equal(LV.tileAt(y.x, y.y), LV.EMPTY, 'it goes up from its foot'); }
  LV.setPan('yard', 0, 3); assert.equal(open(y), 6, 'his own weight: all of it, with nothing in the pan'); assert.equal(LV.RULE.pan.yard, 0); LV.setPan('yard', 0); assert.equal(open(y), 0, 'and down again when he steps off');
  for (const [load, rows] of [[1, 0], [2, 0], [3, 1]]){ LV.setPan('count', load); assert.equal(open(c), rows); }
  LV.setGates({}, { yard: 2 }); assert.equal(LV.RULE.pan.yard, 2, 'his save keeps what lies in each pan'); assert.equal(open(y), 4); LV.setGates();
});
// a pan's or a stack's turn, with what the game gives it stubbed
const turn = (type, key, P, secs, load, others = []) => { LV.setGates({}, { [key]: load }); const e = { type, d: OS.enemies[type], x: 10, y: 2, st: 'idle', mk: { key } }, ev = [];
  for (let t = 0; t < secs; t += 1 / 60){ OS.ai[type](e, P, 1 / 60, { RULE: LV.RULE, events: ev, E: { list: others, scene: { add(){} } } }); for (const v of ev.splice(0)){ LV.setPan(v.key, v.load, v.eff == null ? v.load : v.eff); (e.log = e.log || []).push(v); } }
  return e; };
test('his own weight lifts the slab while he stands in the pan, and is not kept; the stack, struck, goes over into it and stays', () => {
  R.loadLevel(0);
  const on = turn('pan', 'yard', { x: 10.2, y: 2, grounded: true }, 0.5, 0); assert.equal(LV.RULE.lift.yard, 6); assert.equal(LV.RULE.pan.yard, 0); assert.ok(on.log.every(v => v.kept === false), 'not written to his save');
  const off = turn('pan', 'yard', { x: 14, y: 2, grounded: true }, 0.5, 0); assert.equal(LV.RULE.lift.yard, 0, 'beside it: nothing'); assert.ok(!off.log);
  const air = turn('pan', 'yard', { x: 10.2, y: 2.2, grounded: false }, 0.5, 0); assert.equal(LV.RULE.lift.yard, 0, 'leaping over it: nothing');
  LV.setGates(); const st = { type: 'bonestack', d: OS.enemies.bonestack, x: 9, y: 6, st: 'idle', mk: { key: 'yard' } }, ev = []; OS.enemies.bonestack.onHit(st);
  OS.ai.bonestack(st, { x: 0, y: 0 }, 1 / 60, { RULE: LV.RULE, events: ev, E: { list: [], scene: { add(){} } } }); assert.equal(ev.length, 1); assert.ok(ev[0].fell && ev[0].load === 3 && ev[0].kept !== false);
  LV.setPan('yard', 3); OS.enemies.bonestack.onHit(st); st.cool = 0; const ev2 = []; OS.ai.bonestack(st, { x: 0, y: 0 }, 1 / 60, { RULE: LV.RULE, events: ev2, E: { list: [], scene: { add(){} } } }); assert.equal(ev2.length, 0, 'struck again with nothing left on the ledge: nothing');
  LV.setGates();
});
test('a Tallyman at a pan with bones in it takes them back a piece at a time; dead, or away, or with nothing in it, he does not', () => {
  R.loadLevel(0); const away = { x: 30, y: 2, grounded: true }, tally = (x, alive = true) => [{ type: 'acolyte', alive, x, y: 2 }];
  turn('pan', 'yard', away, OS.PAN.take * 2 + 0.2, 3, tally(10.5)); assert.equal(LV.RULE.pan.yard, 1, 'two pieces gone in two turns of his'); assert.equal(LV.RULE.lift.yard, 2);
  turn('pan', 'yard', away, OS.PAN.take * 4, 3, tally(10.5)); assert.equal(LV.RULE.pan.yard, 0, 'and all of it in time'); assert.equal(LV.RULE.lift.yard, 0);
  turn('pan', 'yard', away, OS.PAN.take * 3, 3, tally(10.5, false)); assert.equal(LV.RULE.pan.yard, 3, 'a dead one takes nothing');
  turn('pan', 'yard', away, OS.PAN.take * 3, 3, tally(16)); assert.equal(LV.RULE.pan.yard, 3, 'nor one that is not at the pan');
  assert.ok(OS.PAN.take >= 2, 'slow enough to be stopped');
  const so = room('sorting'), p = pans.find(q => q.key === 'yard'); assert.ok(L.marks.some(m => m.type === 'acolyte' && roomOf(m) === so && Math.abs(m.x - p.x) <= 8), 'a Tallyman keeps the sorting room\'s pan'); LV.setGates();
});
test('with the Warden\'s hammer and no stack knocked down, the yard and the count are shut; one who plays it through opens both', () => {
  const shut = R.graph(0, ['breaker', 'shut', 'gate:hall', 'gate:cells', 'gate:culvert']); for (const n of ['aisle', 'sorting', 'niches']) assert.ok(R.reached(shut.seen, room(n), shut.W), n);
  for (const n of ['yard', 'count']) assert.ok(!R.reached(shut.seen, room(n), shut.W), n + ' is shut');
  const one = R.graph(0, ['breaker', 'shut', 'gate:hall', 'gate:cells', 'gate:culvert', 'gate:yard']); assert.ok(R.reached(one.seen, room('yard'), one.W)); assert.ok(!R.reached(one.seen, room('count'), one.W), 'the count wants its own');
  const all = R.graph(0, ['breaker']); for (const n of ['yard', 'count']) assert.ok(R.reached(all.seen, room(n), all.W), n); assert.ok(all.gates.includes('yard') && all.gates.includes('count'));
});
