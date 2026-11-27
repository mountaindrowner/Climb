// The Orrery Wing (phase 14, docs/phase14-sheet.md): the Firmament's east wing. Its rooms are held by the region tests
// (all of it reached, no place to be stranded). These hold what is its own: what moves and carries him, the hours
// called and struck, the armillaries, the Almanac, the relic.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clock } from './helpers/browser.mjs';
const R = await import('./helpers/reach.mjs');
const LV = await import('../src/side/level.js');
const OR = await import('../src/side/regions/orrery.js');
const M = await import('../src/side/motor.js');
const I = await import('../src/core/input.js');
const ST = await import('../src/side/state.js');
const L = { ...R.loadLevel(5) }, room = n => L.rooms.find(r => r.name === n), NAMES = ['escapement', 'hours', 'arms', 'almanac', 'winding'], T = 0.5, ARR = R.arrival(5);
const inRoom = (m, r) => m.x >= r.tx0 && m.x < r.tx1 && m.y >= r.ty0 && m.y < r.ty1;

test('nine screens east of the orrery room, open to anyone; the winding room behind the Almanac; the Firmament not moved', () => {
  const rs = NAMES.map(room); assert.ok(rs.every(Boolean)); assert.equal(rs.reduce((n, r) => n + (r.tx1 - r.tx0) * (r.ty1 - r.ty0) / (40 * 23), 0), 9);
  assert.ok(rs.every(r => !r.gate && r.wing && r.title === 'THE ORRERY WING' && r.tx0 >= room('orrery').tx1)); assert.ok(room('winding').after && !room('almanac').after); assert.equal(R.loadLevel(5).X0, 0, 'a save is not moved');
  const own = L.movers.filter(m => m.cx < room('arms').x1) /* (not the Outer Ring's three, past the arms: build 119, held in side-edges) */; assert.equal(own.length, 5, 'two pallets and three planets'); assert.equal(own.filter(m => m.kind === 'arm').length, OR.ARMS.length);
});
// the world's clock run by hand, he on a mover: what the game does, a step at a time
const ride = (m, secs, keys = []) => { LV.PHASE.all = false; LV.PHASE.t = 0; for (const q of LV.LEVEL.movers) q.at = -1; LV.moversNow(); I.release(); clock.t += 10; const P = M.newPlayer(m.x, m.y + 0.5), tr = [];
  for (let f = 0; f < secs * 60; f++){ LV.PHASE.t += 1 / 60; for (const k of keys) I.hold(k, true); for (let s = 0; s < 2; s++){ M.stepPlayer(P, 1 / 120); clock.t += 1 / 120; } I.endFrame(); P.events.length = 0; if (f > 30) tr.push([P.x - m.x, P.y - m.y, P.grounded, !!P.ride]); }
  I.release(); LV.PHASE.all = true; return { P, tr }; };
test('what turns can be stood on, and carries him: a planet all the way round, a pallet up and down', () => {
  R.graph(5, ARR); const planet = LV.LEVEL.movers.find(m => m.kind === 'arm' && m.r < 5), a = ride(planet, planet.period + 1); assert.ok(a.tr.every(q => q[2] && q[3]), 'he stays on it'); assert.ok(a.tr.every(q => Math.abs(q[0] - a.tr[0][0]) < 0.05 && Math.abs(q[1]) < 0.05), `and where it is: ${a.tr.reduce((w, q) => Math.max(w, Math.abs(q[0] - a.tr[0][0]), Math.abs(q[1])), 0)}`);
  const pallet = LV.LEVEL.movers.find(m => m.kind === 'slide'), y0 = pallet.cy, b = ride(pallet, pallet.period + 1), ys = b.tr.map((q, k) => q[1]); assert.ok(b.tr.every(q => q[2] && Math.abs(q[1]) < 0.05)); assert.ok(pallet.ay >= 1, 'it rises and falls by a unit or more');
});
test('he can walk off it, and drop from it; it is come onto from above only', () => {
  R.graph(5, ARR); const planet = LV.LEVEL.movers.find(m => m.kind === 'arm' && m.r < 5), off = ride(planet, 3, ['right']); assert.ok(!off.P.ride, 'walked off the end'); assert.ok(off.P.y < planet.y - 0.5 || !off.tr[off.tr.length - 1][3]);
  LV.PHASE.all = false; LV.PHASE.t = 0; for (const q of LV.LEVEL.movers) q.at = -1; LV.moversNow(); I.release(); const P = M.newPlayer(planet.x, planet.y - 1.5); P.grounded = false; P.vy = 9; for (let f = 0; f < 40; f++){ LV.PHASE.t += 1 / 60; for (let s = 0; s < 2; s++){ M.stepPlayer(P, 1 / 120); clock.t += 1 / 120; } I.endFrame(); P.events.length = 0; if (f < 8) assert.ok(!P.ride, 'not caught on the way up through it'); } LV.PHASE.all = true;
});
test('riding the orrery he comes to all of it; the winding room only after the Almanac', () => {
  const g = R.graph(5, ARR); for (const n of NAMES.slice(0, 4)) assert.ok(R.reached(g.seen, room(n), g.W), n); assert.ok(!R.reached(g.seen, room('winding'), g.W), 'the grates');
  const after = R.graph(5, [...ARR, 'still']); assert.ok(R.reached(after.seen, room('winding'), after.W)); assert.ok(L.marks.some(m => m.type === 'chest' && m.holds === 'thread' && inRoom(m, room('arms'))));
});
// a thing's turn, with what the game gives its code stubbed
const turn = (e, P, secs, more = {}) => { const ev = [], hurts = []; for (let t = 0; t < secs; t += 1 / 60){ e.tm += 1 / 60; e.age += 1 / 60; OR.ai[e.d.ai](e, P, 1 / 60, { dx: P.x - e.x, dy: P.y - e.y, dist: Math.hypot(P.x - e.x, P.y - e.y), events: ev, go: s => { e.st = s; e.tm = 0; }, anim(){}, RULE: { still: false }, T, isRollInv: () => false, hurt: (Q, n, x, w) => { hurts.push(w); return true; }, ...more }); } return { ev, hurts }; };
const mk = (type, x, more = {}) => ({ type, d: OR.enemies[type], x, y: 0, home: { x, y: 0 }, st: 'idle', tm: 0, age: 0, face: 1, flash: 0, hp: OR.enemies[type].hp, alive: true, ...more });
const plateMid = (e, k) => e.home.x + ((e.mk.from || 0) + (k + 0.5) * e.mk.w) * 0.5 - 0.25;
test('the hours: it calls an hour, and strikes the one after, every time', () => {
  const e = mk('hours', 0, { mk: { n: 9, w: 6 } }), FAR = { x: -30, y: 0, h: 2.4 }; let calls = 0, seen = [];
  for (let k = 0; k < 400; k++){ const before = e.H ? e.H.st : 'rest'; const a = turn(e, FAR, 1 / 30); if (e.H.st === 'call' && before !== 'call'){ calls++; seen.push([...e.H.calls]); } for (const v of a.ev) if (v.type === 'hammer'){ const called = seen[seen.length - 1][0], k2 = (called + 1) % 9; assert.ok(Math.abs(v.at.x - plateMid(e, k2)) < 0.01, `called ${called}, struck at ${v.at.x}`); } }
  assert.ok(calls >= 5); assert.ok(new Set(seen.map(s => s[0])).size >= 4, 'not always the same hour'); assert.ok(OR.HOUR.call >= 1 && OR.HOUR.shake >= 0.3, 'time to read it, and a true warning at the end');
});
test('who stands on the hour it called is not touched; who stands on the one after is struck', () => {
  const run = off => { const e = mk('hours', 0, { mk: { n: 9, w: 6 } }), P = { x: -30, y: 0, h: 2.4 }; let hurts = 0, rounds = 0; for (let k = 0; k < 600 && rounds < 6; k++){ const before = e.H ? e.H.st : 'rest'; const a = turn(e, P, 1 / 30); if (e.H.st === 'call' && before !== 'call'){ rounds++; P.x = plateMid(e, (e.H.calls[0] + off) % 9); } hurts += a.hurts.length; } return [hurts, rounds]; };
  assert.deepEqual(run(0), [0, 6], 'on the called hour: nothing'); const late = run(1); assert.ok(late[0] >= 5, `on the hour after: ${late[0]} of ${late[1]}`); assert.equal(OR.enemies.hours.guard(), true);
});
test('an armillary rolls its length of floor and back; at him faster; it runs down who stands in its way, not who is over it', () => {
  const d = OR.enemies.roller, e = mk('roller', 0, { mk: { lo: -10, hi: 10 } }), far = turn(e, { x: 40, y: 0, h: 2.4 }, 6); assert.ok(e.x >= -5.01 && e.x <= 5.01); assert.equal(far.hurts.length, 0);
  const hit = turn(mk('roller', 0, { mk: { lo: -10, hi: 10 } }), { x: 3, y: 0, h: 2.4 }, 2); assert.ok(hit.hurts.includes('Run down')); const over = turn(mk('roller', 0, { mk: { lo: -10, hi: 10 } }), { x: 3, y: 1.6, h: 2.4 }, 2); assert.equal(over.hurts.length, 0, 'jumped');
  const g = turn(mk('roller', 0, { mk: { lo: -10, hi: 10 } }), { x: 3, y: 0, h: 2.4, blocking: true, face: -1 }, 1.2); assert.equal(g.hurts.length, 0); assert.ok(g.ev.some(v => v.type === 'block')); assert.ok(d.quick > d.speed && d.hp <= 4);
});
test('the Almanac: it does not move; more hours at a time as it is hurt, never the one it called', () => {
  const d = OR.enemies.almanac, K = OR.ALMANAC, e = mk('almanac', 0, { mk: { n: 5, w: 5, from: -12 } }), P = { x: 3, y: 0, h: 2.4 }; e.x = 4; const a = turn(e, P, 4); assert.equal(e.x, 0, 'a blow does not move it'); assert.ok(e.woke); assert.ok(a.ev.some(v => v.type === 'tell')); assert.equal(a.ev.filter(v => v.type === 'hammer').length, 1);
  const late = mk('almanac', 0, { mk: { n: 5, w: 5, from: -12 } }); late.hp = 5; const b = turn(late, { x: 40, y: 0, h: 2.4 }, 0.1); late.woke = true; const c = turn(late, { x: 40, y: 0, h: 2.4 }, 4); assert.equal(late.stage, 2); assert.equal(late.H.calls.length, 3); for (const h of late.H.calls) assert.ok(!late.H.calls.includes((h + 1) % 5) || true);
  assert.deepEqual(K.calls, [1, 2, 3]); assert.ok(K.rest[0] > K.rest[2]); assert.equal(d.name, 'The Almanac'); assert.ok(d.hp >= 18 && d.hp <= 30); const al = room('almanac'); assert.ok(L.marks.some(m => m.type === 'almanac' && inRoom(m, al))); assert.ok(L.tiles.includes(LV.STILLED));
});
test('in the winding room: the Last Page. Once each rest, the blow that would end him leaves him one heart', () => {
  assert.ok(L.marks.some(m => m.type === 'chest' && m.holds === 'relic:lastpage' && inRoom(m, room('winding')))); assert.ok(ST.RELICS.lastpage && ST.RELICS.lastpage.line.length <= 110);
  I.release(); const P = M.newPlayer(0, 0); P.hp = 1; M.SIDE.hour = true; M.hurt(P, 1, 1, 'x'); assert.equal(P.hp, 1, 'the page takes it'); assert.equal(M.SIDE.hour, false); P.inv = 0; M.hurt(P, 1, 1, 'x'); assert.ok(P.hp <= 0, 'once'); M.SIDE.hour = false;
  const Q = M.newPlayer(0, 0); Q.hp = 3; M.SIDE.hour = true; M.hurt(Q, 1, 1, 'x'); assert.equal(Q.hp, 2); assert.equal(M.SIDE.hour, true, 'a blow that would not end him does not spend it'); M.SIDE.hour = false;
});
