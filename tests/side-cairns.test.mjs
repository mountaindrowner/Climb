// The Pilgrims' Cairns (phase 11, docs/phase11-sheet.md): the Spires' west wing. Its rooms and their gate are held by
// the region tests (nothing past the wind gap is reached without the Wyrm's wind). These hold what is its own: the
// stones of the way, a cairn looked at and not, the Turned, his own cairn, the relic.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './helpers/browser.mjs';
const R = await import('./helpers/reach.mjs');
const LV = await import('../src/side/level.js');
const CA = await import('../src/side/regions/cairns.js');
const M = await import('../src/side/motor.js');
const I = await import('../src/core/input.js');
const { RELICS } = await import('../src/side/state.js');
const L = { ...R.loadLevel(2) }, room = n => L.rooms.find(r => r.name === n), T = 0.5;

test('nine screens west of the mountain\'s caves; past the wind gap, behind the Wyrm\'s wind; the scree open from below', () => {
  const names = ['windgap', 'field', 'reasons', 'turned', 'hiscairn', 'scree'], rs = names.map(room); assert.ok(rs.every(Boolean));
  assert.equal(rs.reduce((n, r) => n + (r.tx1 - r.tx0) * (r.ty1 - r.ty0) / (40 * 23), 0), 9);
  for (const n of ['field', 'reasons', 'turned', 'hiscairn']) assert.equal(room(n).gate, 'glide'); for (const n of ['windgap', 'scree']) assert.equal(room(n).gate, '');
  assert.ok(rs.every(r => r.tx1 <= room('eyrie').tx0 && r.title === 'THE PILGRIMS\' CAIRNS'));
  assert.ok(L.updrafts.some(u => u.gate === 'glide'), 'the wind in the gap is the gate');
});
test('the scree is the way out, not a way in: from the hollow, with every gift but the wind, the slope is not reached', () => {
  const a = R.graph(2, R.GIFTS.filter(g => g !== 'glide')); assert.ok(R.reached(a.seen, room('scree'), a.W)); for (const n of ['turned', 'hiscairn', 'reasons', 'field']) assert.ok(!R.reached(a.seen, room(n), a.W), n);
});
test('a stone of the way is a ledge; turned round on, every one of them is gone', () => {
  R.graph(2, R.GIFTS); const W = LV.LEVEL.W, k = LV.LEVEL.tiles.indexOf(LV.FACED), x = k % W, y = Math.floor(k / W);
  assert.equal(LV.tileAt(x, y), LV.LEDGE); LV.RULE.turned = true; assert.equal(LV.tileAt(x, y), LV.EMPTY); LV.RULE.turned = false;
  assert.equal(L.tiles.filter(t => t === LV.FACED).length, 3 + 4 + 4 + 4 + 22);
});
// the real motor on the way: stood on a stone and turned round; and walked along it without turning
const walk = (tx, ty, prog, frames) => { R.graph(2, R.GIFTS); I.release(); const re = room('reasons'), P = M.newPlayer((re.tx0 + tx + 0.5) * T, (re.ty0 + ty) * T + 0.01); P.face = 1; let fell = false;
  for (let f = 0; f < frames; f++){ I.release(); for (const a of prog(f)) I.hold(a, true); M.stepPlayer(P, 1 / 60); if (LV.RULE.turned) fell = true; } I.release(); return { P, fell, row: Math.round(P.y / T) - re.ty0, col: Math.floor(P.x / T) - re.tx0 }; };
test('on the way: he turns round and falls through it; on the ground again, it is back', () => {
  const a = walk(50, 13, f => f < 20 ? ['right'] : f < 24 ? ['left'] : [], 140);
  assert.ok(a.fell, 'the stones went'); assert.equal(a.row, 2, 'he is on the floor under the way'); assert.equal(LV.RULE.turned, false, 'and the way is whole again');
});
test('on the way: he does not turn, and crosses it', () => {
  const a = walk(45, 13, () => ['right'], 150); assert.ok(!a.fell); assert.equal(a.row, 13); assert.ok(a.col >= 66, `he reached the far side (${a.col})`);
});
test('a foot on the rock is the ground: turning there costs nothing', () => {
  const a = walk(42, 13, f => f < 3 ? ['right'] : f < 8 ? ['left'] : [], 40); assert.ok(!a.fell); assert.equal(a.row, 13);
});
// a creature's turn, with what the game gives its code stubbed
const ctx = (e, P, over = {}) => { const ev = [], hurts = []; return { ev, hurts, c: { dx: P.x - e.x, dy: P.y - e.y, dist: Math.hypot(P.x - e.x, P.y - e.y), events: ev, go: s => { e.st = s; e.tm = 0; }, anim(){}, fx: { burst(){}, dust(){} }, E: { scene: { add(){} }, R: null }, RULE: {}, T: 0.5,
  hurt: (Q, n, x, w) => { hurts.push([n, w]); return true; }, isRollInv: () => !!P.rolling, ground: () => 0, solidAt: () => false, hit: (x0, y0, x1, y1, w) => { const h = P.x + 0.34 > x0 && P.x - 0.34 < x1 && P.y + P.h > y0 && P.y < y1; if (h) hurts.push([1, w]); return h; }, ...over } }; };
const mk = (type, x, more = {}) => ({ type, d: CA.enemies[type], x, y: 0, home: { x, y: 0 }, st: 'idle', tm: 0, age: 0, face: 1, dirn: 1, flash: 0, hp: CA.enemies[type].hp, ...more });
const turn = (e, P, secs, each) => { const all = { ev: [], hurts: [] }; for (let t = 0; t < secs; t += 1 / 60){ const K = ctx(e, P); e.tm += 1 / 60; e.age += 1 / 60; CA.ai[e.d.ai](e, P, 1 / 60, K.c); all.ev.push(...K.ev); all.hurts.push(...K.hurts); if (each) each(t); } return all; };

test('a cairn is only stones while he looks at it; with his back to it, it comes and strikes; looked at again, it stops where it is', () => {
  const e = mk('cairn', 0), P = { x: 5, y: 0, h: 2.4, face: -1, vx: 0 }; turn(e, P, 2); assert.equal(e.st, 'idle'); assert.equal(e.x, 0, 'looked at: it does not move'); assert.equal(CA.enemies.cairn.guard(e), false, 'and can be knocked down');
  P.face = 1; const a = turn(e, P, 0.5); assert.ok(a.ev.some(v => v.type === 'notice'), 'it is heard to come apart'); assert.ok(e.x > 0.5, 'it comes'); assert.equal(CA.enemies.cairn.guard(e), true);
  const x = e.x; P.face = -1; turn(e, P, 1); assert.ok(Math.abs(e.x - x) < 0.2, 'looked at: it stops'); assert.equal(e.st, 'idle');
  P.face = 1; const b = turn(e, P, 3); assert.ok(b.hurts.some(h => h[1] === 'Struck by stones'));
  assert.ok(CA.enemies.cairn.chase < 7, 'slower than he runs');
});
test('the Turned stands in the way of what comes up at him, and sends it down; behind him he does nothing; walked away from, he lets it go', () => {
  const e = mk('turned', 0), up = { x: 2.2, y: 0, h: 2.4, face: -1, vx: -3 }, a = turn(e, up, 2.5);
  assert.ok(a.ev.some(v => v.type === 'tell'), 'a warning'); assert.deepEqual(a.hurts[0], [1, 'Sent down']); assert.ok(up.vx > 8, 'thrown back down the slope'); assert.ok(up.x >= CA.enemies.turned.bar - 0.01, 'and never past him on his feet');
  const behind = mk('turned', 0), b = turn(behind, { x: -2, y: 0, h: 2.4, face: 1, vx: 0 }, 4); assert.equal(b.hurts.length, 0); assert.equal(behind.st, 'idle');
  const hp = behind.hp; CA.enemies.turned.onHit(behind, 1, { x: -2 }); assert.equal(behind.hp, hp - 1, 'a blow from behind counts for more');
  const away = mk('turned', 0), c = turn(away, { x: 6, y: 0, h: 2.4, face: 1, vx: 2 }, 4); assert.equal(c.hurts.length, 0, 'going down, back to him: nothing');
  const roll = mk('turned', 0), Q = { x: 0.5, y: 0, h: 1.25, face: -1, vx: -8, rolling: true }; turn(roll, Q, 0.1); assert.ok(Q.x < CA.enemies.turned.bar, 'a roll goes through him');
});
test('the Turned\'s staff sends a rush of stones down the slope: it strikes one who stands in it, not one in the air', () => {
  for (const [y, hit] of [[0, true], [2.2, false]]){ const e = mk('turned', 0, { n: 1 }), P = { x: 6, y, h: 2.4, face: -1, vx: 0 }, a = turn(e, P, 4); assert.equal(a.hurts.length > 0, hit, y ? 'in the air' : 'standing'); }
});
test('his own cairn is not a creature; the Pilgrim\'s Stone is a relic, and lengthens the moment after a blow', () => {
  assert.ok(CA.enemies.hiscairn.prop && CA.enemies.hiscairn.own); assert.ok(L.marks.some(m => m.type === 'hiscairn')); assert.ok(L.marks.some(m => m.type === 'chest' && m.holds === 'relic:turnstone'));
  assert.ok(RELICS.turnstone && RELICS.turnstone.line.length <= 110);
  const P = M.newPlayer(0, 0); M.SIDE.stone = false; M.hurt(P, 1, 1, 'x'); const plain = P.inv; const Q = M.newPlayer(0, 0); M.SIDE.stone = true; M.hurt(Q, 1, 1, 'x'); M.SIDE.stone = false; assert.ok(Q.inv > plain * 1.4);
  assert.ok(L.marks.filter(m => m.type === 'deco' && m.kind === 'reason' && m.says).length >= 8, 'the reasons, scratched on stones');
});
