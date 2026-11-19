// The Wreck of the Works (phase 12, docs/phase12-sheet.md): the Tempest's west wing. Its rooms are held by the region
// tests (all of it reached, no place to be stranded). These hold what is its own: the two halves of the iron and the
// lever, the coil, the Wright's-arm, the Jar, the relic.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './helpers/browser.mjs';
const R = await import('./helpers/reach.mjs');
const LV = await import('../src/side/level.js');
const WK = await import('../src/side/regions/works.js');
const M = await import('../src/side/motor.js');
const I = await import('../src/core/input.js');
const { RELICS } = await import('../src/side/state.js');
const L = { ...R.loadLevel(3) }, room = n => L.rooms.find(r => r.name === n), NAMES = ['yard', 'coils', 'cranes', 'jarhouse', 'drafting'], T = 0.5;

test('nine screens west of the landing, open to anyone; the drafting room behind the Jar', () => {
  const rs = NAMES.map(room); assert.ok(rs.every(Boolean)); assert.equal(rs.reduce((n, r) => n + (r.tx1 - r.tx0) * (r.ty1 - r.ty0) / (40 * 23), 0), 9);
  assert.ok(rs.every(r => !r.gate && r.wing && r.title === 'THE WRECK OF THE WORKS' && r.tx1 <= room('landing').tx0)); assert.ok(room('drafting').after);
  assert.ok(L.tiles.includes(LV.IRON_A) && L.tiles.includes(LV.IRON_B)); assert.ok(L.marks.filter(m => m.type === 'lever').length >= 8);
});
test('the current is in one half of the iron at a time; the Jar\'s discharge is in all of it; broken, in none', () => {
  R.graph(3, [...R.GIFTS, 'current']); const W = LV.LEVEL.W, at = v => { const k = LV.LEVEL.tiles.indexOf(v); return [k % W, Math.floor(k / W)]; }, a = at(LV.IRON_A), b = at(LV.IRON_B), live = q => LV.liveAt(q[0], q[1]);
  assert.equal(LV.tileAt(a[0], a[1]), LV.LEDGE); assert.equal(LV.tileAt(b[0], b[1]), LV.LEDGE);
  LV.RULE.sw = 0; assert.deepEqual([live(a), live(b)], [true, false]); LV.RULE.sw = 1; assert.deepEqual([live(a), live(b)], [false, true]);
  LV.RULE.surge = 0.3; assert.deepEqual([live(a), live(b)], [true, true], 'the discharge'); LV.RULE.surge = 0;
  LV.RULE.still = true; assert.deepEqual([live(a), live(b)], [false, false], 'the Jar broken'); LV.RULE.still = false; LV.RULE.sw = 0;
});
test('to stand on the live half is to be shocked; the Wright\'s Boots stop it', () => {
  const stand = boots => { R.graph(3, [...R.GIFTS, 'current']); I.release(); const W = LV.LEVEL.W, k = LV.LEVEL.tiles.indexOf(LV.IRON_A), P = M.newPlayer((k % W + 2.5) * T, (Math.floor(k / W) + 1) * T + 0.01); M.SIDE.boots = boots; for (let f = 0; f < 40; f++) M.stepPlayer(P, 1 / 60); M.SIDE.boots = false; return P; };
  const a = stand(false); assert.ok(a.hp < a.maxHp, 'shocked'); const b = stand(true); assert.equal(b.hp, b.maxHp, 'the boots');
  assert.ok(RELICS.boots && RELICS.boots.line.length <= 110); const dr = room('drafting'); assert.ok(L.marks.some(m => m.type === 'chest' && m.holds === 'relic:boots' && m.x >= dr.tx0 && m.x < dr.tx1 && m.y >= dr.ty0 && m.y < dr.ty1));
});
test('with the levers thrown as needed all of it is reached unhurt, but the drafting room: that is behind the Jar', () => {
  // (live iron costs hearts, it does not bar the way: one who will be shocked can cross it. So nothing here says it cannot be got through.)
  const free = R.graph(3, R.GIFTS); for (const n of ['yard', 'coils', 'cranes', 'jarhouse']) assert.ok(R.reached(free.seen, room(n), free.W), n); assert.ok(!R.reached(free.seen, room('drafting'), free.W), 'the grate');
  const after = R.graph(3, [...R.GIFTS, 'still']); assert.ok(R.reached(after.seen, room('drafting'), after.W), 'the Jar broken: the grate is up');
});
// a thing's turn, with what the game gives its code stubbed
const ctx = (e, P, RULE, over = {}) => { const ev = [], hurts = []; return { ev, hurts, c: { dx: P.x - e.x, dy: P.y - e.y, dist: Math.hypot(P.x - e.x, P.y - e.y), events: ev, go: s => { e.st = s; e.tm = 0; }, anim(){}, fx: { burst(){}, dust(){} }, E: { scene: { add(){} }, R: null }, RULE, T: 0.5,
  hurt: (Q, n, x, w) => { hurts.push([n, w]); return true; }, isRollInv: () => false, ground: () => 0, solidAt: (x, y) => y >= 8, ...over } }; };
const mk = (type, x, more = {}) => ({ type, d: WK.enemies[type], x, y: 0, home: { x, y: type === 'crane' ? 1.6 : 0 }, st: 'idle', tm: 0, age: 0, face: 1, dirn: 1, flash: 0, hp: WK.enemies[type].hp, ...more });
const turn = (e, P, RULE, secs) => { const all = { ev: [], hurts: [] }; for (let t = 0; t < secs; t += 1 / 60){ const K = ctx(e, P, RULE); e.tm += 1 / 60; e.age += 1 / 60; WK.ai[e.d.ai](e, P, 1 / 60, K.c); all.ev.push(...K.ev); all.hurts.push(...K.hurts); } return all; };
const rule = (more = {}) => ({ sw: 0, surge: 0, still: false, swFree: false, ...more });

test('a lever is not a creature: a blow throws it, once a moment; with the Jar broken it does nothing', () => {
  const d = WK.enemies.lever, e = mk('lever', 0); assert.ok(d.prop && d.own); assert.equal(d.guard(e), true); const a = turn(e, { x: 1, y: 0, h: 2.4 }, rule(), 0.1); assert.equal(a.ev.filter(v => v.type === 'switch').length, 1);
  d.guard(e); const b = turn(e, { x: 1, y: 0, h: 2.4 }, rule(), 0.1); assert.equal(b.ev.length, 0, 'not twice in a moment'); const dead = mk('lever', 0); d.guard(dead); assert.equal(turn(dead, { x: 1, y: 0, h: 2.4 }, rule({ still: true }), 0.2).ev.length, 0);
});
test('a coil throws its arc only while the current is in its half, after a warning; it strikes what stands in it', () => {
  const P = { x: 2, y: 0, h: 2.4 }, mkc = () => mk('coil', 0, { mk: { half: 0, to: [8, 0] } }), d = WK.enemies.coil;
  const live = turn(mkc(), P, rule({ sw: 0 }), d.period * 2); assert.ok(live.hurts.some(h => h[1] === 'Shocked')); assert.ok(live.ev.some(v => v.type === 'arc'));
  const off = turn(mkc(), P, rule({ sw: 1 }), d.period * 2); assert.equal(off.hurts.length, 0, 'the other half: nothing'); const clear = turn(mkc(), { x: 2, y: 4, h: 2.4 }, rule({ sw: 0 }), d.period * 2); assert.equal(clear.hurts.length, 0, 'over it: nothing');
  assert.ok(d.warn >= 0.5, 'warned for long enough'); assert.ok(d.harmless, 'it is not struck');
});
test('a Wright\'s-arm swings and strikes what is in its way; with the Jar broken it hangs still', () => {
  const P = { x: 0.6, y: 0, h: 2.4 }, a = turn(mk('crane', 0), P, rule(), 8); assert.ok(a.hurts.some(h => h[1] === 'Struck by iron'));
  const e = mk('crane', 0), b = turn(e, { x: 9, y: 0, h: 2.4 }, rule({ still: true }), 12); assert.ok(e.amp < 0.05, 'it comes to rest'); assert.equal(turn(e, P, rule({ still: true }), 3).hurts.length, 0);
});
test('the Jar: the current elsewhere, it is dull and the blade rings off; in its own half it can be broken, fills, warns, and lets go', () => {
  const d = WK.enemies.jar, J = WK.JAR, P = { x: 3, y: 0, h: 2.4 }, dull = mk('jar', 0, { mk: { half: 0 } }); turn(dull, P, rule({ sw: 1 }), 3); assert.equal(dull.live, false); assert.equal(d.guard(dull), true); assert.equal(dull.ch, 0);
  const e = mk('jar', 0, { mk: { half: 0 } }), a = turn(e, P, rule({ sw: 0 }), J.fill + J.warn + 0.2); assert.equal(d.guard(e), false, 'live: it can be struck');
  assert.ok(a.ev.some(v => v.type === 'tell'), 'it is seen to be about to'); assert.equal(a.ev.filter(v => v.type === 'surge').length, 1, 'and it lets go, once'); assert.ok(e.ch < 0.2, 'then it is empty again');
  const part = mk('jar', 0, { mk: { half: 0 } }); turn(part, P, rule({ sw: 0 }), J.fill / 2); const half = part.ch; turn(part, P, rule({ sw: 1 }), J.drain); assert.ok(half > 0.4 && part.ch === 0, 'the current sent away, it drains');
  assert.ok(J.warn >= 0.7 && J.fill >= 4 && d.hp >= 20 && d.hp <= 32); assert.equal(d.name, 'The Jar');
});
