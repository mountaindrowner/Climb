// The Scriptorium (phase 10, docs/phase10-sheet.md): the Cloister's west wing. The rooms and what is behind the vellum
// are held by the region tests (a gated room is not reached without its gift, and is with it). These hold what is its
// own: the vellum, who is in it and how each fights, the relic.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './helpers/browser.mjs';
const R = await import('./helpers/reach.mjs');
const LV = await import('../src/side/level.js');
const SC = await import('../src/side/regions/scriptorium.js');
const M = await import('../src/side/motor.js');
const { RELICS } = await import('../src/side/state.js');
const L = { ...R.loadLevel(1) }, room = n => L.rooms.find(r => r.name === n);

test('nine screens, west of the stair: the stacks open to anyone, the rest behind the Toll\'s step', () => {
  const rs = ['stacks', 'hall', 'furnace', 'rubrication', 'lectern'].map(room); assert.ok(rs.every(Boolean));
  assert.equal(rs.reduce((n, r) => n + (r.tx1 - r.tx0) * (r.ty1 - r.ty0) / (40 * 23), 0), 9);
  assert.equal(room('stacks').gate, ''); for (const n of ['hall', 'furnace', 'rubrication', 'lectern']) assert.equal(room(n).gate, 'dash');
  assert.ok(rs.every(r => r.tx1 <= room('stairwell').tx0), 'west of the stair'); assert.ok(rs.every(r => r.title === 'THE SCRIPTORIUM'));
});
test('the hall\'s door is vellum, floor to lintel; with the Toll\'s step it is gone', () => {
  const st = room('stacks'), col = []; for (let j = st.ty0 + 2; j <= st.ty0 + 7; j++) col.push(L.tiles[j * L.W + st.tx0]);
  assert.ok(col.every(t => t === LV.VELLUM)); const k = (st.ty0 + 3) * L.W + st.tx0;
  R.graph(1, ['breaker']); assert.equal(LV.tileAt(st.tx0, st.ty0 + 3), LV.ROCK, 'rock to anyone else');
  LV.RULE.tearing = true; assert.equal(LV.tileAt(st.tx0, st.ty0 + 3), LV.EMPTY, 'nothing to him in the step'); LV.RULE.tearing = false;
  R.graph(1, ['breaker', 'dash']); assert.equal(LV.LEVEL.tiles[k], 0, 'torn, in a world where he has the step');
});
test('the chute is the way back, and not a way in: from the stacks the lectern is not climbed to', () => {
  const { seen, W } = R.graph(1, ['breaker', 'glide']); for (const n of ['lectern', 'furnace', 'hall']) assert.ok(!R.reached(seen, room(n), W), n);
});
// a creature's turn, with what the game gives its code stubbed
const ctx = (e, P, over = {}) => { const ev = [], hurts = []; return { ev, hurts, c: { dx: P.x - e.x, dy: P.y - e.y, dist: Math.hypot(P.x - e.x, P.y - e.y), events: ev, go: s => { e.st = s; e.tm = 0; }, anim(){}, fx: { burst(){}, dust(){} }, E: { scene: { add(){} }, R: null },
  shoot(){ ev.push({ type: 'shot' }); }, hurt: (Q, n, x, w) => { hurts.push([n, w]); return true; }, isRollInv: () => false, ground: () => e.y, solidAt: () => false, hit: (x0, y0, x1, y1) => { const h = P.x + 0.34 > x0 && P.x - 0.34 < x1 && P.y + P.h > y0 && P.y < y1; if (h) hurts.push([1, e.d.word]); return h; }, ...over } }; };
const mk = (type, x, more = {}) => ({ type, d: SC.enemies[type], x, y: 0, st: 'idle', tm: 0, age: 0, face: 1, dirn: 1, hp: SC.enemies[type].hp, ...more });
const turn = (e, P, secs, over) => { let all = { ev: [], hurts: [] }; for (let t = 0; t < secs; t += 1 / 60){ const K = ctx(e, P, over); e.tm += 1 / 60; e.age += 1 / 60; SC.ai[e.d.ai](e, P, 1 / 60, K.c); all.ev.push(...K.ev); all.hurts.push(...K.hurts); } return all; };
globalThis.window = globalThis.window || {}; window.THREE = window.THREE || { Mesh: function(){ this.position = { set(){} }; this.material = { opacity: 0 }; this.visible = false; }, PlaneGeometry: function(){}, MeshBasicMaterial: function(o){ Object.assign(this, o); }, AdditiveBlending: 0 };

test('a copyist flings ink at what is before him, with a warning; from behind he does not look up', () => {
  const P = { x: 6, y: 0, h: 2.4, vx: 0 }, front = mk('copyist', 0), a = turn(front, P, 1.2);
  assert.ok(a.ev.some(v => v.type === 'tell'), 'a tell'); assert.ok(a.ev.some(v => v.type === 'shot'), 'and the ink'); assert.ok(SC.enemies.copyist.windup >= 0.45, 'warned for long enough');
  const back = mk('copyist', 0, { dirn: -1 }), b = turn(back, P, 2); assert.ok(!b.ev.some(v => v.type === 'shot'), 'he is behind the desk: nothing');
});
test('a blot lies still until he is near, stands, and throws itself down where he is', () => {
  const far = mk('blot', 0), P = { x: 8, y: 0, h: 2.4 }; turn(far, P, 1); assert.equal(far.st, 'idle');
  const near = mk('blot', 0), Q = { x: 1.2, y: 0, h: 2.4 }, a = turn(near, Q, 2.2);
  assert.ok(a.ev.some(v => v.type === 'notice')); assert.ok(a.ev.some(v => v.type === 'tell'), 'it gathers first'); assert.ok(a.hurts.length >= 1, 'and it lands on him if he stands there');
});
test('the Corrector: a slash at arm\'s length for two hearts; his struck line takes a standing man and passes over a crouched one', () => {
  const P = { x: 2.5, y: 0, h: 2.4 }, e = mk('corrector', 0), a = turn(e, P, 2.6);
  assert.ok(a.ev.some(v => v.type === 'tell')); assert.deepEqual(a.hurts[0], [2, 'Struck out']);
  for (const [h, hit] of [[2.4, true], [1.4, false]]){ const c2 = mk('corrector', 0, { st: 'raise', n: 2 }), Q = { x: 9, y: 0, h }, b = turn(c2, Q, 1.4); assert.equal(b.hurts.length > 0, hit, h === 2.4 ? 'standing' : 'crouched'); }
  const jump = mk('corrector', 0, { st: 'raise', n: 2 }), b = turn(jump, { x: 9, y: 2.6, h: 2.4 }, 1.4); assert.equal(b.hurts.length, 0, 'or over it');
});
test('the Blank Leaf: unspent, the next blow does no harm; then it is spent', () => {
  assert.ok(RELICS.blankleaf && RELICS.blankleaf.line.length <= 110);
  const P = M.newPlayer(0, 0); M.SIDE.leaf = true; assert.ok(M.hurt(P, 2, 1, 'x')); assert.equal(P.hp, P.maxHp, 'no harm'); assert.equal(M.SIDE.leaf, false);
  assert.equal(P.events.pop().type, 'spared'); P.inv = 0; M.hurt(P, 1, 1, 'x'); assert.equal(P.hp, P.maxHp - 1, 'the next one lands');
});
