// The Keepers' Houses (phase 13, docs/phase13-sheet.md): the Gardens' east wing. Its rooms are held by the region
// tests (all of it reached, no place to be stranded). These hold what is its own: the settings, the door of his house,
// the Housekeeper and its servants' doors, the moths, the relic.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './helpers/browser.mjs';
const R = await import('./helpers/reach.mjs');
const LV = await import('../src/side/level.js');
const HO = await import('../src/side/regions/houses.js');
const ST = await import('../src/side/state.js');
const L = { ...R.loadLevel(4) }, room = n => L.rooms.find(r => r.name === n), NAMES = ['lane', 'longtable', 'house1', 'backway', 'house2', 'hishouse'], T = 0.5, ARR = R.arrival(4), K = HO.KEEPER;
const inRoom = (m, r) => m.x >= r.tx0 && m.x < r.tx1 && m.y >= r.ty0 && m.y < r.ty1;

test('eight screens east of the arbor; a servants\' door on every floor that has a setting; the Gardens no wider than they were', () => {
  const rs = NAMES.map(room); assert.ok(rs.every(Boolean)); assert.equal(rs.reduce((n, r) => n + (r.tx1 - r.tx0) * (r.ty1 - r.ty0) / (40 * 23), 0), 8);
  assert.ok(rs.every(r => r.wing && r.title === 'THE KEEPERS\' HOUSES' && r.tx0 >= room('arbor').tx1)); assert.equal(L.W, 320, 'no wider: a save is not moved');
  const sets = L.marks.filter(m => m.type === 'setting'), doors = L.marks.filter(m => m.type === 'deco' && m.kind === 'servdoor'); assert.ok(sets.length >= 20 && doors.length >= 10);
  for (const s of sets) assert.ok(doors.some(d => Math.abs(d.y - s.y) * T < K.floor && Math.abs(d.x - s.x) * T < 24), `no servants' door on the floor of the setting at ${s.x},${s.y}`);
  assert.ok(L.tiles.includes(LV.VELLUM), 'the gardeners\' gate'); assert.equal(L.marks.filter(m => m.type === 'housekeeper').length, 1);
});
test('the door of his house is rock while anything is out of its place, and open when nothing is, or when the Housekeeper is broken', () => {
  R.graph(4, ARR); const W = LV.LEVEL.W, k = LV.LEVEL.tiles.indexOf(LV.KEPT), i = k % W, j = Math.floor(k / W); assert.ok(k >= 0); assert.ok(inRoom({ x: i, y: j }, room('hishouse')));
  LV.RULE.upset = 0; LV.RULE.unkept = false; assert.equal(LV.tileAt(i, j), LV.EMPTY); LV.RULE.upset = 1; assert.equal(LV.tileAt(i, j), LV.ROCK); LV.RULE.still = true; assert.equal(LV.tileAt(i, j), LV.ROCK, 'the Lock open is not the Housekeeper broken'); LV.RULE.still = false; LV.RULE.unkept = true; assert.equal(LV.tileAt(i, j), LV.EMPTY, 'its keeper broken'); LV.RULE.upset = 0; LV.RULE.unkept = false;
});
test('one who has left the houses as he found them comes to all of it; with one thing out of its place, to all but his own house', () => {
  const calm = R.graph(4, ARR); for (const n of NAMES) assert.ok(R.reached(calm.seen, room(n), calm.W), n);
  const up = R.graph(4, [...ARR, 'upset']); for (const n of NAMES.slice(0, 5)) assert.ok(R.reached(up.seen, room(n), up.W), n); assert.ok(!R.reached(up.seen, room('hishouse'), up.W), 'his house is shut');
  const nodash = R.graph(4, ARR.filter(g => g !== 'dash')); assert.ok(R.reached(nodash.seen, room('backway'), nodash.W), 'the back way is a way in too, for one who finds it');
});
// a thing's turn, with what the game gives its code stubbed
const WING = [{ title: 'THE KEEPERS\' HOUSES', x0: -50, x1: 50, y0: -5, y1: 30 }];
const turn = (e, P, secs, more = {}) => { const ev = [], hurts = []; for (let t = 0; t < secs; t += 1 / 60){ e.tm += 1 / 60; e.age += 1 / 60; HO.ai[e.d.ai](e, P, 1 / 60, { dx: P.x - e.x, dy: P.y - e.y, dist: Math.hypot(P.x - e.x, P.y - e.y), events: ev, go: s => { e.st = s; e.tm = 0; }, anim(){}, RULE: { still: false, unkept: false }, T, marks: [], rooms: WING, E: { list: [] }, isRollInv: () => false, hurt: (Q, n, x, w) => { hurts.push(w); return true; }, ...more }); } return { ev, hurts }; };
const mk = (type, x, y = 0, more = {}) => ({ type, d: HO.enemies[type], x, y, home: { x, y }, st: 'idle', tm: 0, age: 0, face: 1, flash: 0, hp: HO.enemies[type].hp, alive: true, ...more });
const FAR = { x: 40, y: 0, h: 2.4 }, door = (x, y) => ({ type: 'deco', kind: 'servdoor', x: x / T - 0.5, y: y / T });
test('a setting is not a creature: a blow breaks it, once; set right, it is whole again', () => {
  const d = HO.enemies.setting, e = mk('setting', 0); assert.ok(d.prop && d.own); assert.equal(d.guard(e), true); const a = turn(e, FAR, 0.1); assert.deepEqual(a.ev.map(v => v.type), ['upset']); assert.ok(e.broken);
  d.guard(e); assert.equal(turn(e, FAR, 0.1).ev.length, 0, 'it cannot be broken twice'); e.right = true; assert.deepEqual(turn(e, FAR, 0.1).ev.map(v => v.type), ['setright']); assert.ok(!e.broken);
});
test('with everything in its place the Housekeeper walks its round, and does not look at him', () => {
  const marks = [door(-6, 0), door(6, 0)], e = mk('housekeeper', 0), a = turn(e, { x: 0.8, y: 0, h: 2.4 }, 12, { marks }); assert.equal(a.hurts.length, 0); assert.equal(a.ev.filter(v => v.type === 'tell').length, 0); assert.ok(e.st === 'round'); assert.ok(e.x >= -6.2 && e.x <= 6.2, 'between its doors');
});
test('a thing out of its place on its floor: it goes to it and sets it right; whoever is in its reach there, it strikes, after a warning', () => {
  const marks = [door(-6, 0), door(6, 0)], thing = mk('setting', 5, 0, { broken: true }), e = mk('housekeeper', -4), a = turn(e, FAR, 6, { marks, E: { list: [thing] } }); assert.ok(thing.right, 'set right'); assert.equal(a.hurts.length, 0, 'he was not near');
  const t2 = mk('setting', 5, 0, { broken: true }), e2 = mk('housekeeper', 2), b = turn(e2, { x: 3.4, y: 0, h: 2.4 }, 2.5, { marks, E: { list: [t2] } }); assert.ok(b.hurts.includes('Put out')); assert.ok(b.ev.some(v => v.type === 'tell')); assert.ok(K.wind >= 0.5);
  const t3 = mk('setting', 5, 0, { broken: true }), g = turn(mk('housekeeper', 2), { x: 3.4, y: 0, h: 2.4, blocking: true, face: -1 }, 2.5, { marks, E: { list: [t3] } }); assert.equal(g.hurts.length, 0, 'a guard turned to it'); assert.ok(g.ev.some(v => v.type === 'block'));
});
test('on another floor: it goes out by a servants\' door and comes in by the one nearest the thing', () => {
  const marks = [door(-6, 0), door(6, 0), door(4, 8)], thing = mk('setting', 2, 8, { broken: true }), e = mk('housekeeper', 0), a = turn(e, FAR, 9, { marks, E: { list: [thing] } });
  assert.equal(a.ev.filter(v => v.type === 'servdoor').length, 2, 'out, and in'); assert.ok(Math.abs(e.y - 8) < 0.01, 'it is on the thing\'s floor'); assert.ok(thing.right); const gone = mk('housekeeper', 0); gone.gone = true; assert.equal(HO.enemies.housekeeper.guard(gone), true, 'in its passages it cannot be struck');
  const home = mk('housekeeper', 0); turn(home, FAR, 9, { marks, E: { list: [mk('setting', 2, 8, { broken: true, right: false })] } }); const back = turn(home, FAR, 12, { marks }); assert.ok(Math.abs(home.y) < 0.01 && back.ev.filter(v => v.type === 'servdoor').length === 2, 'and home again when all is in its place');
});
test('struck, it does not forgive: it comes for him, floor to floor; out of the houses, it lets him go', () => {
  const marks = [door(-6, 0), door(6, 0), door(4, 8)], d = HO.enemies.housekeeper, e = mk('housekeeper', 0); d.onHit(e); assert.ok(e.wronged); const P = { x: 2, y: 8, h: 2.4 }, a = turn(e, P, 8, { marks }); assert.ok(Math.abs(e.y - 8) < 0.01, 'on his floor'); assert.ok(a.hurts.includes('Put out'));
  const e2 = mk('housekeeper', 0); d.onHit(e2); turn(e2, { x: 80, y: 0, h: 2.4 }, 0.2, { marks }); assert.ok(!e2.wronged, 'he is out of the wing'); assert.equal(d.name, 'The Housekeeper'); assert.ok(d.hp >= 16 && d.hp <= 28);
});
test('a moth sleeps by its lamp; woken, it comes at his head and bites, and draws off', () => {
  const e = mk('moth', 0, 3), far = turn(e, FAR, 2); assert.equal(e.st, 'idle'); assert.equal(far.hurts.length, 0); assert.ok(Math.abs(e.x) < 1.2);
  const e2 = mk('moth', 0, 3), near = turn(e2, { x: 2, y: 0, h: 2.4 }, 4); assert.ok(near.hurts.includes('Bitten')); assert.ok(near.hurts.length <= 3); assert.equal(HO.enemies.moth.hp, 1);
});
test('in his house: the Second Place. One heart more', () => {
  const h = room('hishouse'); assert.ok(L.marks.some(m => m.type === 'chest' && m.holds === 'relic:place' && inRoom(m, h))); assert.ok(L.marks.some(m => m.type === 'deco' && m.kind === 'table2' && inRoom(m, h))); assert.equal(L.marks.filter(m => m.type === 'setting' && inRoom(m, h)).length, 2, 'laid for two');
  assert.ok(ST.RELICS.place && ST.RELICS.place.line.length <= 110); const worn = ST.G.worn; ST.G.worn = []; const plain = ST.maxHearts(); ST.G.worn = ['place']; const more = ST.maxHearts(); ST.G.worn = worn; assert.equal(more, plain + 1);
});
