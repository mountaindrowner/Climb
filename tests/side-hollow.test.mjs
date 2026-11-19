// The grip, the Hollow, the Auger's hall and the Source (phase 17, docs/phase17-sheet.md). The Hollow's rooms are held
// by the region tests (all of them reached, no place to be stranded, the pit with its floors gone included). These
// hold what is its own: rough rock and the grip, the bore's floors, what is shut until the Auger is still, the ways
// in and out, and the relic. The Auger itself is drawn, so it is played in the browser, not here.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clock } from './helpers/browser.mjs';
const R = await import('./helpers/reach.mjs');
const LV = await import('../src/side/level.js');
const HO = (await import('../src/side/regions/hollow.js')).default, { BORE } = await import('../src/side/regions/hollow.js');
const VN = (await import('../src/side/regions/vein.js')).default;
const M = await import('../src/side/motor.js');
const I = await import('../src/core/input.js');
const ST = await import('../src/side/state.js');
const T = 0.5, idx = n => LV.LEVELS.findIndex(l => l.name === n), N = idx('The Hollow'), NS = idx('The Great Shaft');
const inRoom = (m, r) => m.x >= r.tx0 && m.x < r.tx1 && m.y >= r.ty0 && m.y < r.ty1;
const play = (grip, x, y, secs, prog) => { M.CAN.grip = grip; I.release(); clock.t += 10; const P = M.newPlayer(x, y); let t = 0, top = P.y, events = [];
  for (let f = 0; f < secs * 60; f++){ prog(t, I, P); for (let s = 0; s < 2; s++){ M.stepPlayer(P, 1 / 120); clock.t += 1 / 120; t += 1 / 120; } I.endFrame(); events.push(...P.events.map(e => e.type)); P.events.length = 0; top = Math.max(top, P.y); }
  I.release(); M.CAN.grip = false; return { P, top, events }; };

test('the Hollow: fourteen screens of the Deep, dark, under the Shaft\'s floor; its water at the foot of the roof; nobody to speak to', () => {
  const L = { ...R.loadLevel(N) }, names = ['roof', 'camp', 'circles', 'bore', 'source', 'wall'], rs = names.map(n => L.rooms.find(r => r.name === n)); assert.ok(rs.every(Boolean));
  assert.equal(rs.reduce((n, r) => n + (r.tx1 - r.tx0) * (r.ty1 - r.ty0) / (40 * 23), 0), 14); assert.ok(HO.deep && HO.dark && HO.needs.includes('glide') && HO.alone);
  assert.ok(rs[4].after && rs[5].after && !rs[3].after, 'the Source and the wall: past the Auger');
  assert.ok(L.marks.some(m => m.type === 'pool' && !m.plain && inRoom(m, rs[0]))); assert.ok(!L.marks.some(m => m.type === 'npc'));
  assert.ok(L.marks.some(m => m.type === 'pass' && m.to === NS && inRoom(m, rs[0])), 'back up to the Shaft'); assert.ok(L.marks.some(m => m.type === 'pass' && m.to === 0 && m.gate === 'grip' && inRoom(m, rs[5])), 'and by the wall to the Roots');
  assert.ok(R.loadLevel(NS).marks.some(m => m.type === 'pass' && m.to === N && m.gate === 'glide') && R.loadLevel(NS).marks.some(m => m.type === 'arrive' && m.name === 'floor')); assert.ok(R.loadLevel(0).marks.some(m => m.type === 'arrive' && m.name === 'pithead'));
  assert.ok(L.marks.filter(m => m.type === 'echo').length >= 5, 'Echoes, many'); assert.ok(L.marks.some(m => m.type === 'deco' && m.kind === 'sourceflame' && inRoom(m, rs[4])) && L.marks.some(m => m.type === 'shrine' && inRoom(m, rs[4])));
});
test('the bore: three floors; the upper two are the Auger\'s to bore away, one and then the other, and are gone for good when it is still', () => {
  const L = R.loadLevel(N), b = L.rooms.find(r => r.name === 'bore'), boss = L.marks.find(m => m.type === 'boss'); assert.ok(boss && inRoom(boss, b) && boss.y === b.ty0 + BORE.floors[0], 'it is met on the first floor');
  const i = b.tx0 + 30, a = b.ty0 + BORE.floors[0] - 1, c = b.ty0 + BORE.floors[1] - 1; assert.equal(LV.rawAt(i, a), 21); assert.equal(LV.rawAt(i, c), 22);
  LV.RULE.fallen = false; LV.RULE.bore = 0; assert.deepEqual([LV.tileAt(i, a), LV.tileAt(i, c)], [1, 1]); LV.RULE.bore = 1; assert.deepEqual([LV.tileAt(i, a), LV.tileAt(i, c)], [0, 1]); LV.RULE.bore = 2; assert.deepEqual([LV.tileAt(i, a), LV.tileAt(i, c)], [0, 0]);
  LV.RULE.bore = 0; LV.RULE.fallen = true; assert.deepEqual([LV.tileAt(i, a), LV.tileAt(i, c)], [0, 0]); LV.RULE.fallen = false;
  assert.ok((BORE.floors[0] - BORE.floors[1]) * T <= M.SIDE.fallSafe && (BORE.floors[1] - BORE.floors[2]) * T <= M.SIDE.fallSafe, 'each fall is one he lands unhurt');
  let rough = 0; for (let j = b.ty0; j < b.ty1; j++) if (LV.roughAt(b.tx1 - 2, j)) rough++; assert.ok(rough >= 36, 'its east wall is rough from the pit\'s foot to the way in');
});
test('rough rock is rock; with the Auger\'s grip he takes hold of it, climbs it, comes down it, and leaps from it', () => {
  const L = R.loadLevel(N), s = L.rooms.find(r => r.name === 'source'), x = s.x0 + 32.4, y = s.y0 + 1; LV.RULE.fallen = true;
  assert.equal(LV.tileAt(s.tx0 + 66, s.ty0 + 5), 1); assert.ok(LV.roughAt(s.tx0 + 66, s.ty0 + 5));
  const no = play(false, x, y, 4, (t, I) => I.hold('right', true)); assert.ok(no.top < y + 0.6 && !no.events.includes('cling'), 'without it: a wall');
  const up = play(true, x, y, 3, (t, I) => I.hold('right', true)); assert.ok(up.events.includes('cling')); assert.ok(up.P.cling && up.top > y + 9, `three seconds up it: ${(up.top - y).toFixed(1)}`); assert.ok(Math.abs(up.P.vy - M.GRIP.up) < 0.01);
  const hang = play(true, x, y, 4, (t, I) => I.hold('right', t < 2)); assert.ok(hang.P.cling && hang.P.vy === 0 && hang.P.y > y + 5, 'let go of the key, he hangs where he is');
  const down = play(true, x, y, 6, (t, I) => { I.hold('right', t < 2); I.hold('down', t > 2.5); }); assert.ok(down.P.grounded && !down.P.cling && Math.abs(down.P.y - y) < 0.05, 'down held: down it, to the floor');
  const off = play(true, x, y, 2.6, (t, I) => { I.hold('right', t < 2); if (Math.abs(t - 2.2) < 0.009) I.tap('jump'); }); assert.ok(!off.P.cling && off.P.x < x - 0.8, 'jump: off it, away from the wall');
  const away = play(true, x, y, 2.4, (t, I) => { I.hold('right', t < 2); I.hold('left', t > 2.1); }); assert.ok(!away.P.cling && away.P.y < y + 8.5, 'away: he lets go');
  LV.RULE.fallen = false;
});
test('the ways: the Source and the wall are shut until the Auger is still; with the grip the wall is climbed and the pit is climbed out of', () => {
  const L = { ...R.loadLevel(N) }, room = n => L.rooms.find(r => r.name === n), arr = R.graph(N, R.arrival(N)); assert.deepEqual(R.arrival(N), ['glide']);
  for (const n of ['roof', 'camp', 'circles', 'bore']) assert.ok(R.reached(arr.seen, room(n), arr.W), n); for (const n of ['source', 'wall']) assert.ok(!R.reached(arr.seen, room(n), arr.W), `${n} before the Auger`);
  const boss = L.marks.find(m => m.type === 'boss'); assert.ok([...arr.seen].some(k => { const i = k % arr.W, j = (k - i) / arr.W; return Math.abs(i - boss.x) < 8 && j === boss.y; }), 'he can stand on its floor');
  const all = R.graph(N, [...R.GIFTS, 'fallen']); assert.ok(R.GIFTS.includes('grip')); for (const n of ['source', 'wall', 'circles', 'roof']) assert.ok(R.reached(all.seen, room(n), all.W), `${n} after`);
  const b = room('bore'); assert.ok([...all.seen].some(k => { const i = k % all.W, j = (k - i) / all.W; return inRoom({ x: i, y: j }, b) && j <= b.ty0 + 3; }), 'down the pit\'s wall to its foot, unhurt');
});
test('the gift and the relic: the Auger leaves the grip; the Tally\'s End turns one Echo each rest', () => {
  assert.equal(ST.TEACH.length, LV.LEVELS.length); assert.equal(ST.TEACH[N].can, 'grip'); assert.ok(ST.RELICS.tallysend); assert.equal(R.loadLevel(N).marks.filter(m => m.type === 'chest' && m.holds === 'relic:tallysend').length, 1);
  const mk = () => ({ type: 'echo', d: VN.enemies.echo, x: 0, y: 0, home: { x: 0, y: 0 }, st: 'idle', tm: 0, age: 0, face: 1, flash: 0, hp: 99, alive: true, rm: { x0: -99, x1: 99, y0: -99, y1: 99 } });
  const turn = SIDE => { const e = mk(), ev = [], hurts = [], P = { x: 0, y: 0, h: 2.4 }; for (let t = 0; t < 6; t += 1 / 60) VN.ai.echo(e, P, 1 / 60, { events: ev, RULE: { lit: new Set(), litAll: false }, marks: [], rooms: [], E: { list: [] }, T, SIDE, isRollInv: () => false, hurt: (p, n, fx, w) => { hurts.push(w); return true; } }); return { ev, hurts, SIDE }; };
  const plain = turn({}); assert.ok(plain.hurts.length >= 1, 'an Echo catches one who stands still');
  const worn = turn({ tally: true }); assert.equal(worn.ev.filter(v => v.type === 'turned').length, 1); assert.equal(worn.SIDE.tally, false, 'once'); assert.ok(worn.hurts.length < plain.hurts.length);
});
test('water that only falls to be looked at bears nothing down', () => {
  const L = R.loadLevel(N), f = L.flows.find(q => q.soft); assert.ok(f && f.dy); assert.equal(LV.flowAt((f.x0 + f.x1) / 2, (f.y0 + f.y1) / 2), null); assert.equal(LV.flowOn(f), true);
});
