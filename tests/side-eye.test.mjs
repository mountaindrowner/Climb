// The Eye of the Storm (phase 12, docs/phase12-sheet.md): the Tempest's east wing. Its rooms are held by the region
// tests (all of it reached, no place to be stranded). These hold what is its own: the wind up the wall, the doors of
// cloud, the Hush, the relic.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clock } from './helpers/browser.mjs';
const R = await import('./helpers/reach.mjs');
const LV = await import('../src/side/level.js');
const EY = await import('../src/side/regions/eye.js');
const M = await import('../src/side/motor.js');
const I = await import('../src/core/input.js');
const { RELICS } = await import('../src/side/state.js');
const L = { ...R.loadLevel(3) }, room = n => L.rooms.find(r => r.name === n), NAMES = ['wall', 'stilla', 'stillb', 'seat'], T = 0.5;
const inRoom = (m, r) => m.x >= r.tx0 && m.x < r.tx1 && m.y >= r.ty0 && m.y < r.ty1;

test('seven screens east of the masthead; the wall\'s foot is open to anyone, the rest is behind the wind', () => {
  const rs = NAMES.map(room); assert.ok(rs.every(Boolean)); assert.equal(rs.reduce((n, r) => n + (r.tx1 - r.tx0) * (r.ty1 - r.ty0) / (40 * 23), 0), 7);
  assert.ok(rs.every(r => r.wing && r.title === 'THE EYE OF THE STORM' && r.tx0 >= room('masthead').tx1)); assert.equal(room('wall').gate, ''); assert.ok(['stilla', 'stillb', 'seat'].every(n => room(n).gate === 'glide'));
  assert.ok(L.marks.some(m => m.type === 'updraft' && m.gate === 'glide' && inRoom(m, room('wall'))), 'the wind in the wall');
  assert.ok(L.marks.filter(m => m.type === 'hush').length >= 8); assert.ok(L.tiles.includes(LV.CALM));
});
test('the wall is climbed on the wind and no other way: its rungs are too far apart; with the wind, all of it is reached', () => {
  const w = room('wall'), rows = [2]; for (let j = w.ty0 + 3; j < w.ty0 + 35; j++) if (L.tiles[j * L.W + w.tx0 + 25] === LV.LEDGE) rows.push(j - w.ty0 + 1); rows.push(35);
  assert.ok(rows.length >= 4, 'rungs to come down by'); for (let k = 1; k < rows.length; k++){ assert.ok(rows[k] - rows[k - 1] > 8, `a double jump is seven tiles: ${rows}`); assert.ok((rows[k] - rows[k - 1]) * T < M.SIDE.fallSafe, 'and no drop between them hurts'); }
  const no = R.graph(3, ['breaker', 'dash']); for (const n of ['stilla', 'stillb', 'seat']) assert.ok(!R.reached(no.seen, room(n), no.W), n);
  const yes = R.graph(3, R.GIFTS); for (const n of NAMES) assert.ok(R.reached(yes.seen, room(n), yes.W), n);
});
test('a door of cloud is rock; waited at, that one door is nothing for a while, and no other', () => {
  R.graph(3, [...R.GIFTS, 'hurry']); const W = LV.LEVEL.W, doors = []; LV.LEVEL.tiles.forEach((t, k) => { if (t === LV.CALM) doors.push([k % W, Math.floor(k / W)]); });
  const a = doors[0], b = doors.find(q => Math.abs(q[0] - a[0]) > 8 || Math.abs(q[1] - a[1]) > 8); assert.ok(b, 'more than one door');
  assert.equal(LV.tileAt(a[0], a[1]), LV.ROCK); LV.RULE.open = 2; Object.assign(LV.RULE, { ox0: a[0], ox1: a[0] + 3, oy0: a[1], oy1: a[1] + 5 });
  assert.equal(LV.tileAt(a[0], a[1]), LV.EMPTY, 'open'); assert.equal(LV.tileAt(b[0], b[1]), LV.ROCK, 'the other is not'); LV.RULE.open = 0; assert.equal(LV.tileAt(a[0], a[1]), LV.ROCK, 'shut again');
  assert.ok(EY.CALMS.wait >= 2 && EY.CALMS.wait <= 3.5 && EY.CALMS.open >= 3);
});
test('one who will not wait gets through no door: the lower still\'s near side, and that is all', () => {
  const g = R.graph(3, [...R.GIFTS, 'hurry']), a = room('stilla'); assert.ok(R.reached(g.seen, a, g.W)); assert.ok(!R.reached(g.seen, room('stillb'), g.W)); assert.ok(!R.reached(g.seen, room('seat'), g.W));
  for (const k of g.seen){ const i = k % g.W, j = (k - i) / g.W; if (inRoom({ x: i, y: j }, a)) assert.ok(i < a.tx0 + 40, `past the door at ${i},${j}`); }
});
// a Hush's turn, with what the game gives its code stubbed
const turn = (e, P, hush, secs, rooms = []) => { const ev = [], hurts = []; for (let t = 0; t < secs; t += 1 / 60){ e.tm += 1 / 60; EY.ai.hush(e, P, 1 / 60, { dist: Math.hypot(P.x - e.x, P.y - e.y), events: ev, go: s => { e.st = s; e.tm = 0; }, anim(){}, RULE: { hush }, rooms, isRollInv: () => false, hurt: (Q, n, x, w) => { hurts.push(w); return true; } }); } return { ev, hurts }; };
const mk = (x, y = 1.2) => ({ type: 'hush', d: EY.enemies.hush, x, y, home: { x, y }, st: 'idle', tm: 0, face: 1, flash: 0, hp: EY.enemies.hush.hp });
test('the Hush does not move while he moves; it comes when he stands still, strikes, and draws off', () => {
  const P = { x: 5, y: 0, h: 2.4 }, e = mk(0); turn(e, P, 0, 3); assert.deepEqual([e.x, e.y, e.st], [0, 1.2, 'idle'], 'frozen');
  const a = turn(e, P, 1, 1); assert.ok(e.x > 2 && e.st === 'come', 'it comes'); assert.ok(a.ev.some(v => v.type === 'notice')); const mid = e.x; turn(e, P, 0, 2); assert.equal(e.x, mid, 'he moves: it stops where it is');
  const b = turn(e, P, 1, 2); assert.ok(b.hurts.includes('Hushed')); assert.ok(b.hurts.length <= 2, 'it draws off between'); assert.ok(EY.enemies.hush.hp <= 3 && EY.enemies.hush.speed < 5);
});
test('a guard turned to it stops it; it stirs only for one in its own room', () => {
  const g = turn(mk(0), { x: 3, y: 0, h: 2.4, blocking: true, face: -1 }, 1, 3); assert.equal(g.hurts.length, 0); assert.ok(g.ev.some(v => v.type === 'block'));
  const back = turn(mk(0), { x: 3, y: 0, h: 2.4, blocking: true, face: 1 }, 1, 3); assert.ok(back.hurts.length > 0, 'not from behind');
  const rooms = [{ x0: -10, x1: 4, y0: -5, y1: 10 }], far = mk(0), out = turn(far, { x: 5, y: 0, h: 2.4 }, 1, 3, rooms); assert.equal(far.x, 0, 'he is in the next room'); assert.equal(out.hurts.length, 0);
});
test('the seat\'s way out is a floor of cloud over the wall\'s landing: rock from below, so the stills cannot be jumped past', () => {
  const s = room('seat'), w = room('wall'), W = L.W, floor = []; for (let i = s.tx0; i < s.tx1; i++) if (L.tiles[s.ty0 * W + i] === LV.CALM) floor.push(i - s.tx0);
  assert.ok(floor.length >= 4 && floor.every(i => i >= 28 && i <= 37), `over the landing: ${floor}`); assert.ok(!L.tiles.slice(s.ty0 * W + s.tx0, s.ty0 * W + s.tx1).includes(LV.EMPTY), 'no hole');
  const drop = (s.ty0 + 2 - (w.ty0 + 35)) * T; assert.ok(drop < M.SIDE.fallSafe, `the drop does not hurt: ${drop}`);
});
test('behind the seat\'s door of cloud: a Breath of the Eye. Under the glide he sinks more slowly', () => {
  const s = room('seat'); assert.ok(L.marks.some(m => m.type === 'chest' && m.holds === 'relic:stillair' && inRoom(m, s))); assert.ok(L.marks.some(m => m.type === 'deco' && m.kind === 'seat' && inRoom(m, s)));
  assert.ok(RELICS.stillair && RELICS.stillair.line.length <= 110);
  const sink = calm => { R.graph(3, R.GIFTS); I.release(); const b = room('stillb'), P = M.newPlayer(b.x0 + 33, b.y0 + 1.01); M.SIDE.calm = calm; let v = 0;
    for (let f = 0; f < 150; f++){ const t = f / 60; for (const at of [0, 0.3, 0.6]) if (Math.abs(t - at) < 0.009) I.tap('jump'); I.hold('jump', t < 0.32 || t > 0.6); for (let k = 0; k < 2; k++){ M.stepPlayer(P, 1 / 120); clock.t += 1 / 120; } I.endFrame(); P.events.length = 0; if (P.glide && !P.grounded) v = P.vy; }
    M.SIDE.calm = false; I.release(); return v; };
  const plain = sink(false), calm = sink(true); assert.ok(plain < -2, `gliding, he sinks at ${plain}`); assert.ok(Math.abs(calm - plain * 0.6) < 0.05, `with the breath: ${calm}`);
});
