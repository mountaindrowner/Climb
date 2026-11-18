// The Bell-Foundry (phase 10, docs/phase10-sheet.md): the Cloister's east wing. The rooms and their gates are held by
// the region tests (none of it is reached without the spade; the bell-rope not before the Cracked Bell has fallen).
// These hold what is its own: the rule (iron rings; what hears it wakes; silence ends it), who is in it, the relic.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './helpers/browser.mjs';
const R = await import('./helpers/reach.mjs');
const LV = await import('../src/side/level.js');
const FO = await import('../src/side/regions/foundry.js');
const M = await import('../src/side/motor.js');
const { RELICS } = await import('../src/side/state.js');
const L = { ...R.loadLevel(1) }, room = n => L.rooms.find(r => r.name === n), NAMES = ['slype', 'casting', 'molds', 'slagruns', 'pit', 'bellrope'];

test('ten screens and the slype, east of the bell tower, behind cracked stone in its wall', () => {
  const rs = NAMES.map(room); assert.ok(rs.every(Boolean));
  assert.equal(rs.reduce((n, r) => n + (r.tx1 - r.tx0) * (r.ty1 - r.ty0) / (40 * 23), 0), 11);
  assert.ok(rs.every(r => r.gate === 'breaker' && r.title === 'THE BELL-FOUNDRY' && r.tx0 >= room('belfry').tx1), 'east of the tower, behind the spade');
  const bf = room('belfry'), col = []; for (let j = bf.ty0 + 9; j <= bf.ty0 + 14; j++) col.push(L.tiles[j * L.W + bf.tx1 - 1]); assert.ok(col.every(t => t === LV.CRACKED), 'the door is cracked stone');
  assert.ok(room('pit').ty1 <= bf.ty0, 'the pit is cut down under the house\'s floor'); assert.ok(room('bellrope').after, 'the bell-rope is behind the Bell');
});
test('a shutter is nothing in silence, rock while iron rings, and nothing for good once the wing is still; a grate is rock until then', () => {
  R.graph(1, ['breaker']); const W = LV.LEVEL.W, find = v => { const k = LV.LEVEL.tiles.indexOf(v); return [k % W, Math.floor(k / W)]; }, [sx, sy] = find(LV.SHUTTER), [gx, gy] = find(LV.STILLED);
  assert.equal(LV.tileAt(sx, sy), LV.EMPTY); assert.equal(LV.tileAt(gx, gy), LV.ROCK);
  LV.RULE.ring = 2; assert.equal(LV.tileAt(sx, sy), LV.ROCK, 'shut while it rings'); LV.RULE.still = true; assert.equal(LV.tileAt(sx, sy), LV.EMPTY, 'up for good'); assert.equal(LV.tileAt(gx, gy), LV.EMPTY, 'the grate lifted');
  LV.RULE.ring = 0; LV.RULE.still = false;
  assert.equal(L.tiles.filter(t => t === LV.SHUTTER).length, 3 * 12 + 5, 'three shutters in doorways, and the lid over the way down to the runs'); assert.ok(L.tiles.includes(LV.STILLED));
});
test('before the Bell has fallen the bell-rope is shut, from the pit and from the slype; after, it is the way back up', () => {
  const a = R.graph(1, R.GIFTS), b = R.graph(1, [...R.GIFTS, 'still']);
  assert.ok(!R.reached(a.seen, room('bellrope'), a.W)); assert.ok(R.reached(b.seen, room('bellrope'), b.W));
});
// a creature's turn, with what the game gives its code stubbed
const ctx = (e, P, RULE, over = {}) => { const ev = [], hurts = []; return { ev, hurts, c: { dx: P.x - e.x, dy: P.y - e.y, dist: Math.hypot(P.x - e.x, P.y - e.y), events: ev, go: s => { e.st = s; e.tm = 0; }, anim(){}, fx: { burst(){}, dust(){} }, E: { scene: { add(){} }, R: null }, RULE, T: 0.5,
  hurt: (Q, n, x, w) => { hurts.push([n, w]); return true; }, isRollInv: () => false, ground: () => 0, solidAt: (x, y) => y >= 8, hit: (x0, y0, x1, y1, w) => { const h = P.x + 0.34 > x0 && P.x - 0.34 < x1 && P.y + P.h > y0 && P.y < y1; if (h) hurts.push([1, w]); return h; }, ...over } }; };
const mk = (type, x, more = {}) => ({ type, d: FO.enemies[type], x, y: 0, home: { x, y: type === 'slag' ? 0 : 1.6 }, st: 'idle', tm: 0, age: 0, face: 1, dirn: 1, flash: 0, hp: FO.enemies[type].hp, ...more });
const turn = (e, P, RULE, secs, each) => { const all = { ev: [], hurts: [] }; for (let t = 0; t < secs; t += 1 / 60){ const K = ctx(e, P, RULE); e.tm += 1 / 60; e.age += 1 / 60; FO.ai[e.d.ai](e, P, 1 / 60, K.c); all.ev.push(...K.ev); all.hurts.push(...K.hurts); for (const v of K.ev) if (v.type === 'ring') RULE.ring = Math.max(RULE.ring, v.big ? FO.BELL.ring[1] : FO.BELL.ring[0]); RULE.ring = Math.max(0, RULE.ring - 1 / 60); if (each) each(t); } return all; };

test('a tongue: a standing man walks into it and it rings; bent double he passes under; still, it does no harm', () => {
  const RULE = { ring: 0, still: false }, e = mk('clapper', 0), a = turn(e, { x: 0, y: 0, h: 2.4 }, RULE, 0.5);
  assert.ok(a.ev.some(v => v.type === 'ring'), 'it rings'); assert.equal(a.hurts.length, 0, 'and has not hurt him yet');
  const R2 = { ring: 0, still: false }, e2 = mk('clapper', 0), b = turn(e2, { x: 0, y: 0, h: 1.4 }, R2, 3); assert.ok(!b.ev.some(v => v.type === 'ring'), 'crouched: nothing'); assert.equal(b.hurts.length, 0);
  assert.ok(M.BODY.crouch < 1.7 && M.BODY.stand > 1.7 && M.BODY.roll < 1.7, 'it hangs between a crouch and a standing man');
});
test('a tongue: his blade rings it and cannot break it; while anything rings it swings and strikes', () => {
  const RULE = { ring: 0, still: false }, e = mk('clapper', 0), d = FO.enemies.clapper; assert.equal(d.guard(e), true); const a = turn(e, { x: 9, y: 0, h: 2.4 }, RULE, 0.2);
  assert.ok(a.ev.some(v => v.type === 'ring'), 'the blade rings it'); e.hp = 1; d.onHit(e, 5); assert.equal(e.hp, d.hp, 'and it is whole');
  const R2 = { ring: 9, still: false }, e2 = mk('clapper', 0); let far = 0; const b = turn(e2, { x: 0.5, y: 0, h: 2.4 }, R2, 4, () => { far = Math.max(far, Math.abs(e2.th)); R2.ring = 9; });
  assert.ok(far > 0.3, 'it swings'); assert.ok(b.hurts.some(h => h[1] === 'Struck by iron'), 'and strikes him in its way');
  const R3 = { ring: 0, still: true }, e3 = mk('clapper', 0), c = turn(e3, { x: 0, y: 0, h: 2.4 }, R3, 1); assert.ok(!c.ev.length && !c.hurts.length, 'the wing still: it does not ring');
});
test('slag: cold, a cut glances off and it does nothing; a ring wakes it, it comes and burns; in silence it goes cold where it stands', () => {
  const RULE = { ring: 0, still: false }, e = mk('slag', 0), d = FO.enemies.slag, P = { x: 4, y: 0, h: 2.4 };
  turn(e, P, RULE, 2); assert.equal(e.st, 'idle'); assert.equal(e.x, 0); assert.equal(d.guard(e), true, 'a cut glances off it'); e.hp = 1; d.onHit(e, 1); assert.equal(e.hp, 2, 'and an art cannot hurt it cold');
  RULE.ring = 3; const a = turn(e, P, RULE, 2.6); assert.ok(a.ev.some(v => v.type === 'notice')); assert.ok(e.x > 2, 'it comes'); assert.ok(a.hurts.some(h => h[1] === 'Seared'), 'and burns'); assert.equal(d.guard({ st: 'crawl' }), false, 'awake, it can be cut');
  turn(e, P, RULE, 2); assert.equal(e.st, 'idle', 'cold again'); const x = e.x; turn(e, P, RULE, 1); assert.equal(e.x, x);
  const far = mk('slag', 0); RULE.ring = 3; turn(far, { x: 40, y: 0, h: 2.4 }, RULE, 1); assert.equal(far.st, 'idle', 'out of hearing');
});
test('the Cracked Bell never strikes first; a blow rings it and sets it swinging, and in its swing it strikes', () => {
  const RULE = { ring: 0, still: false }, e = mk('crackedbell', 0, { mk: { top: 44 } }), d = FO.enemies.crackedbell, P = { x: 6, y: 0, h: 2.4, face: -1 };
  const a = turn(e, P, RULE, 6); assert.ok(!a.ev.length && !a.hurts.length, 'six seconds beside it: nothing'); assert.equal(e.th, 0);
  e.hp -= 1; d.onHit(e, 1, { face: 1 }); const b = turn(e, { x: 2.2, y: 0, h: 2.4 }, RULE, 3); assert.ok(b.ev.some(v => v.type === 'ring' && v.big), 'it rings'); assert.ok(b.hurts.some(h => h[1] === 'Rung'), 'and its swing strikes what is in it');
  turn(e, { x: 30, y: 0, h: 2.4 }, RULE, 14); assert.ok(Math.abs(e.th) < 0.02 && RULE.ring === 0, 'left alone, it comes to rest in silence');
});
test('the Cracked Bell, from half its strength: one blow and it tolls again by itself; then it stops', () => {
  const RULE = { ring: 0, still: false }, e = mk('crackedbell', 0, { mk: { top: 44 } }), d = FO.enemies.crackedbell, P = { x: 30, y: 0, h: 2.4 };
  turn(e, P, RULE, 0.1); e.hp = d.hp / 2; d.onHit(e, 1, { face: 1 }); const a = turn(e, P, RULE, 12), rings = a.ev.filter(v => v.type === 'ring').length;
  assert.ok(a.ev.some(v => v.type === 'tell'), 'the crack opens'); assert.ok(rings >= 2, `it tolls of its own (${rings})`); assert.ok(rings <= 5);
  turn(e, P, RULE, 14); assert.equal(RULE.ring, 0, 'and it stops');
  assert.ok(d.hp >= 16 && d.hp <= 24); assert.ok(FO.BELL.ring[0] >= 3 && FO.BELL.ring[1] <= 6);
});
test('the Founder\'s Felt is a relic with its line; the wing is quiet at the bell-rope', () => {
  assert.ok(RELICS.felt && RELICS.felt.line.length <= 110 && RELICS.felt.lore);
  assert.ok(L.marks.some(m => m.type === 'chest' && m.holds === 'relic:felt' && m.x >= room('bellrope').tx0 && m.x < room('bellrope').tx1)); assert.ok(FO.QUIET.includes('bellrope'));
});
