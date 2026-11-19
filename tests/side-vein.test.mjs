// The lamp and the Vein (phase 15, docs/phase15-sheet.md). The Vein's rooms are held by the region tests (all of it
// reached, no place to be stranded). These hold what is its own: the seal and the stair, the dark's lamps, the
// Prospector, the glimmer, the Echo, the Assayer, the relic.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clock } from './helpers/browser.mjs';
const R = await import('./helpers/reach.mjs');
const LV = await import('../src/side/level.js');
const VN = (await import('../src/side/regions/vein.js')).default, { ECHO, ASSAY } = await import('../src/side/regions/vein.js');
const M = await import('../src/side/motor.js');
const I = await import('../src/core/input.js');
const ST = await import('../src/side/state.js');
const N = LV.LEVELS.findIndex(l => l.name === 'The Vein'), WK = LV.LEVELS.findIndex(l => l.name === 'The Workings');
const L = { ...R.loadLevel(N) }, room = n => L.rooms.find(r => r.name === n), NAMES = ['seal', 'glitter', 'knot', 'assay', 'cradle', 'lip'], T = 0.5;
const inRoom = (m, r) => m.x >= r.tx0 && m.x < r.tx1 && m.y >= r.ty0 && m.y < r.ty1;

test('the Vein: twelve screens of the Deep, dark, its water and its stair at its head, a guild lamp in every room', () => {
  const rs = NAMES.map(room); assert.ok(rs.every(Boolean)); assert.equal(rs.reduce((n, r) => n + (r.tx1 - r.tx0) * (r.ty1 - r.ty0) / (40 * 23), 0), 12);
  assert.ok(VN.deep && VN.dark); assert.ok(VN.themeDef.amb.every(a => a < 0.2), 'it is dark'); assert.ok(room('cradle').after && room('lip').after && !room('assay').after);
  const s = room('seal'); assert.ok(L.marks.some(m => m.type === 'pool' && inRoom(m, s))); assert.ok(L.marks.some(m => m.type === 'pass' && m.to === WK && inRoom(m, s)));
  for (const r of rs) assert.ok(L.marks.some(m => m.type === 'glamp' && inRoom(m, r)), `no lamp in ${r.name}`); assert.ok(L.marks.filter(m => m.type === 'glamp').length >= 16);
});
test('the stair out can be taken: a jump from its rungs carries him into the way up (the room\'s roof is the level\'s)', () => {
  R.graph(N, []); const s = LV.LEVEL.rooms.find(r => r.name === 'seal'), ps = LV.LEVEL.marks.find(m => m.type === 'pass'), x0 = ps.x * T, y0 = ps.y * T, x1 = x0 + ps.w * T, y1 = y0 + ps.h * T; let taken = false;
  for (const rung of [10, 14]){ I.release(); clock.t += 10; const P = M.newPlayer(s.x0 + 6.5 * T, s.y0 + rung * T); for (let f = 0; f < 60 && !taken; f++){ if (f === 2) I.tap('jump'); I.hold('jump', true); for (let k = 0; k < 2; k++){ M.stepPlayer(P, 1 / 120); clock.t += 1 / 120; } I.endFrame(); P.events.length = 0; const cy = P.y + 0.8; if (P.x >= x0 && P.x <= x1 && cy >= y0 && cy <= y1) taken = true; } }
  I.release(); assert.ok(taken); const P0 = { x: s.x0 + 14.5 * T, y: s.y0 + 2 * T }; assert.ok(!(P0.x >= x0 && P0.x <= x1 && P0.y + 0.8 >= y0), 'and not by standing where he comes in');
});
test('the Workings: the guild\'s seal is cracked stone across the way, and the stair to the Vein is behind it', () => {
  const W = { ...R.loadLevel(WK) }, sr = W.rooms.find(r => r.name === 'sealroom'); assert.ok(sr && sr.title === 'THE GUILD\'S SEAL'); const ps = W.marks.find(m => m.type === 'pass' && m.to === N); assert.ok(ps && ps.gate === 'breaker' && inRoom(ps, sr));
  let cracked = 0; for (let j = sr.ty0; j < sr.ty1; j++) for (let i = sr.tx0; i < sr.tx1; i++) if (W.tiles[j * W.W + i] === 4) cracked++; assert.ok(cracked >= 10); assert.equal(W.marks.filter(m => m.type === 'glamp' && inRoom(m, sr)).length, 2, 'two lamps to learn on');
  const past = g => { for (const k of g.seen){ const i = k % g.W, j = (k - i) / g.W; if (inRoom({ x: i, y: j }, sr) && i >= sr.tx0 + 17) return true; } return false; };
  assert.ok(!past(R.graph(WK, [])), 'without the spade he is stopped at it'); assert.ok(past(R.graph(WK, ['breaker'])), 'with it he is through');
});
// a thing's turn, with what the game gives its code stubbed
const turn = (e, P, secs, more = {}, each) => { const ev = [], hurts = []; for (let t = 0; t < secs; t += 1 / 60){ e.tm += 1 / 60; e.age += 1 / 60; if (each) each(t, P); VN.ai[e.d.ai](e, P, 1 / 60, { dx: P.x - e.x, dy: P.y - e.y, dist: Math.hypot(P.x - e.x, P.y - e.y), events: ev, go: s => { e.st = s; e.tm = 0; }, anim(){}, RULE: { lit: new Set(), litAll: false, still: false }, T, marks: [], rooms: [], E: { list: [] }, solidAt: () => true, isRollInv: () => false, hurt: (Q, n, x, w) => { hurts.push(w); return true; }, ...more }); } return { ev, hurts }; };
const mk = (type, x, more = {}) => ({ type, d: VN.enemies[type], x, y: 0, home: { x, y: 0 }, st: 'idle', tm: 0, age: 0, face: 1, flash: 0, hp: VN.enemies[type].hp, alive: true, ...more });
test('a prospector notices only what comes between him and the glitter; then he strikes, after a warning, and follows', () => {
  const d = VN.enemies.prospector, behind = turn(mk('prospector', 0, { mk: { face: 1 } }), { x: -1.5, y: 0, h: 2.4 }, 5); assert.equal(behind.hurts.length, 0); assert.equal(behind.ev.length, 0, 'behind him: nothing');
  const e = mk('prospector', 0, { mk: { face: 1 } }), a = turn(e, { x: 1.5, y: 0, h: 2.4 }, 2.5); assert.ok(a.hurts.includes('Struck with a pick')); assert.ok(a.ev.some(v => v.type === 'tell')); assert.ok(d.wind >= 0.5);
  const g = turn(mk('prospector', 0, { mk: { face: 1 } }), { x: 1.5, y: 0, h: 2.4, blocking: true, face: -1 }, 2.5); assert.equal(g.hurts.length, 0, 'a guard turned to him');
  turn(e, { x: 40, y: 0, h: 2.4 }, 6); assert.ok(!e.hunt && Math.abs(e.x) < 0.3 && e.face === 1, 'he is gone: back to the glitter');
});
test('a glimmer is ore until he is on it; then it is fast, and bites', () => {
  const d = VN.enemies.glimmer, e = mk('glimmer', 0), far = turn(e, { x: 3, y: 0, h: 2.4 }, 3); assert.equal(e.x, 0); assert.ok(e.dormant); assert.equal(far.hurts.length, 0);
  const e2 = mk('glimmer', 0), near = turn(e2, { x: 1, y: 0, h: 2.4 }, 2); assert.ok(near.hurts.includes('Bitten')); assert.ok(!e2.dormant); const e3 = mk('glimmer', 0); d.onHit(e3); turn(e3, { x: 4, y: 0, h: 2.4 }, 0.5); assert.ok(e3.x > 1, 'struck, it wakes'); assert.equal(d.hp, 2);
});
const ROOMS = [{ x0: -20, x1: 40, y0: -5, y1: 20 }];
test('the Echo goes where he went, a few seconds after, and strikes where he was: standing still, he is caught; moving on, he is not', () => {
  const d = VN.enemies.echo; assert.equal(d.guard(), true, 'it cannot be struck');
  const walk = (t, P) => { P.x = Math.min(10, t * 5); }, e = mk('echo', 30), stood = turn(e, { x: 0, y: 0, h: 2.4 }, 2 + ECHO.delay + 0.8, { rooms: ROOMS }, walk); assert.ok(stood.hurts.includes('Caught by his echo'));
  const on = (t, P) => { P.x = t * 5; }, e2 = mk('echo', 30), went = turn(e2, { x: 0, y: 0, h: 2.4 }, 7, { rooms: ROOMS }, on); assert.equal(went.hurts.length, 0, 'it is always that far behind'); assert.ok(e2.shown && e2.x > 10 && e2.x < 7 * 5 - 5);
  const out = turn(mk('echo', 30), { x: 80, y: 0, h: 2.4 }, 6, { rooms: ROOMS }); assert.equal(out.hurts.length, 0, 'not in its room: nothing');
});
test('it will not come into the light of a guild lamp he has lit', () => {
  const marks = [{ type: 'glamp', x: 19.5, y: 5 }], walk = (t, P) => { P.x = Math.min(10, t * 5); };
  const lit = { lit: new Set(['19.5,5']), litAll: false, still: false }, e = mk('echo', 30), a = turn(e, { x: 0, y: 0, h: 2.4 }, 9, { rooms: ROOMS, marks, RULE: lit }, walk); assert.equal(a.hurts.length, 0); assert.ok(e.held && Math.hypot(e.x - 10, e.y + 1.2 - 2.5) > ECHO.shy - 0.6, 'it waits at the edge');
  const dark = { lit: new Set(), litAll: false, still: false }, b = turn(mk('echo', 30), { x: 0, y: 0, h: 2.4 }, 9, { rooms: ROOMS, marks, RULE: dark }, walk); assert.ok(b.hurts.length > 0, 'unlit, the lamp is nothing to it'); assert.ok(ECHO.shy >= 3 && ECHO.delay >= 2);
});
test('the Assayer: its beam tips to his side and that pan comes down; under the post nothing lands; hurt, the other pan follows', () => {
  const d = VN.enemies.assayer, e = mk('assayer', 0), west = { x: -ASSAY.pan, y: 0, h: 2.4 }; e.x = 3; const a = turn(e, west, 6); assert.equal(e.x, 0, 'a blow does not move it'); assert.ok(a.hurts.includes('Found light')); assert.ok(a.ev.some(v => v.type === 'tell')); assert.ok(ASSAY.tell >= 0.7);
  const post = turn(mk('assayer', 0), { x: -0.8, y: 0, h: 2.4 }, 8); assert.equal(post.hurts.length, 0, 'under the post'); const out = turn(mk('assayer', 0), { x: -ASSAY.pan - ASSAY.half - 1.2, y: 0, h: 2.4 }, 8); assert.equal(out.hurts.length, 0, 'out past the pan');
  const hurt = mk('assayer', 0); hurt.hp = ASSAY.hp / 2; const both = []; turn(hurt, west, 6, {}, () => {}); const t2 = turn(hurt, west, 6); const xs = t2.ev.filter(v => v.type === 'thud').map(v => Math.sign(v.at.x)); assert.ok(xs.includes(-1) && xs.includes(1), 'both pans, one after the other'); assert.equal(hurt.stage, 1);
  const last = mk('assayer', 0); last.hp = 3; turn(last, west, 0.2); assert.equal(last.stage, 2); const late = mk('echo', 5, { mk: { late: true } }), idle = turn(late, { x: 0, y: 0, h: 2.4 }, 5, { rooms: ROOMS, E: { list: [mk('assayer', 0)] } }, (t, P) => { P.x = Math.min(4, t * 2); }); assert.equal(idle.hurts.length, 0, 'the late Echo waits');
  const woke = turn(mk('echo', 5, { mk: { late: true } }), { x: 0, y: 0, h: 2.4 }, 6, { rooms: ROOMS, E: { list: [last] } }, (t, P) => { P.x = Math.min(4, t * 2); }); assert.ok(woke.hurts.length > 0, 'until the Assayer is nearly done'); assert.equal(d.name, 'The Assayer'); assert.ok(d.hp >= 20 && d.hp <= 30);
});
test('in the cradle: Raw Lampstone. And the Vein keeps the rule of things to find: two threads, one relic', () => {
  assert.ok(L.marks.some(m => m.type === 'chest' && m.holds === 'relic:lampstone' && inRoom(m, room('cradle')))); assert.ok(ST.RELICS.lampstone && ST.RELICS.lampstone.line.length <= 110);
  assert.equal(L.marks.filter(m => m.type === 'chest' && m.holds === 'thread').length, 2); assert.equal(L.marks.filter(m => m.type === 'chest' && m.holds.startsWith('relic')).length, 1); assert.ok(L.tiles.includes(LV.STILLED), 'the Assayer\'s hatch');
});
