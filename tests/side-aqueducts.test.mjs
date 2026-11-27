// The Aqueducts (phase 13, docs/phase13-sheet.md): the Gardens' west wing. Its rooms are held by the region tests (all
// of it reached, no place to be stranded). These hold what is its own: the running water, the sluice wheels, their
// keepers, the striders, the Lock, the relic.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clock } from './helpers/browser.mjs';
const R = await import('./helpers/reach.mjs');
const LV = await import('../src/side/level.js');
const AQ = await import('../src/side/regions/aqueducts.js');
const M = await import('../src/side/motor.js');
const I = await import('../src/core/input.js');
const ST = await import('../src/side/state.js');
const L = { ...R.loadLevel(4) }, room = n => L.rooms.find(r => r.name === n), NAMES = ['arches', 'sluices', 'lock', 'head', 'spill'], T = 0.5, ARR = R.arrival(4);
const inRoom = (m, r) => m.x >= r.tx0 && m.x < r.tx1 && m.y >= r.ty0 && m.y < r.ty1;

test('nine screens west of the wellspring, open to anyone; the head behind the Lock', () => {
  const rs = NAMES.map(room); assert.ok(rs.every(Boolean)); assert.equal(rs.reduce((n, r) => n + (r.tx1 - r.tx0) * (r.ty1 - r.ty0) / (40 * 23), 0), 9);
  assert.ok(rs.every(r => !r.gate && r.wing && r.title === 'THE AQUEDUCTS' && r.tx1 <= room('wellspring').tx0)); assert.ok(room('head').after && !room('spill').after && !room('lock').after);
  const wheels = L.marks.filter(m => m.type === 'wheel' && !/^m\d$/.test(m.key)) /* (not the Rising Main's four, past the lock: build 118, held in side-edges) */, keys = new Set(L.flows.map(f => f.key)); assert.equal(wheels.length, 5); assert.ok(wheels.every(w => keys.has(w.key)), 'every wheel has its water'); assert.ok(keys.has('surge'));
  for (const w of wheels) assert.ok(!L.flows.some(f => (w.x + 0.5) * T >= f.x0 && (w.x + 0.5) * T < f.x1 && w.y * T >= f.y0 && w.y * T < f.y1), `the wheel '${w.key}' stands out of the water`);
});
// he stands at tile x on the arches' channel, with these keys held, for so many frames
const onChannel = (x, keys, frames, jumpAt = 0) => { R.graph(4, [...ARR, 'wet']); I.release(); clock.t += 10; const a = LV.LEVEL.rooms.find(r => r.name === 'arches'), P = M.newPlayer(a.x0 + x * T, a.y0 + (AQ.DECK + 1) * T); let top = 0, jumped = false, land = null;
  for (let f = 0; f < frames; f++){ for (const k of keys) I.hold(k, true); if (jumpAt && !jumped && (P.x - a.x0) / T > jumpAt){ jumped = true; I.tap('jump'); } if (jumped) I.hold('jump', true); for (let s = 0; s < 2; s++){ M.stepPlayer(P, 1 / 120); clock.t += 1 / 120; } I.endFrame(); P.events.length = 0; top = Math.max(top, Math.abs(P.vx)); if (jumped && P.grounded && land == null) land = (P.x - a.x0) / T; }
  I.release(); return { P, top, x: (P.x - a.x0) / T, land }; };
test('running water carries him: with it he is faster than he can run, against it he barely gains, standing he is taken', () => {
  const run = 7.6, wth = onChannel(23, ['right'], 30), agn = onChannel(30, ['left'], 40), std = onChannel(23, [], 30);
  assert.ok(wth.top > run + 4, `with it: ${wth.top}`); assert.ok(agn.P.vx < 0 && agn.P.vx > -3, `against it: ${agn.P.vx}`); assert.ok(agn.x < 30 && agn.x > 26, 'he gains, slowly'); assert.ok(std.x > 26, `standing, he is carried east: ${std.x}`);
  assert.ok(M.FLOW.push < run, 'it can be walked against');
});
test('thrown off the end of a span he keeps its speed: the leap clears the gap to the next span, and more', () => {
  const [, d3, d2] = AQ.DECKS, leap = onChannel(23, ['right'], 110, d3[1] - 0.6); assert.ok(leap.land >= d2[0] && leap.land <= d2[1] + 1, `from ${d3[1]} he comes down at ${leap.land}`); assert.ok(d2[0] - d3[1] - 1 >= 10, 'a gap of ten or more');
});
test('nothing rises through falling water: with every sluice open the climb is barred at its foot, and the spill from below', () => {
  const wet = R.graph(4, [...ARR, 'wet']), s = room('sluices'); for (const k of wet.seen){ const i = k % wet.W, j = (k - i) / wet.W; if (inRoom({ x: i, y: j }, s)) assert.ok(j - s.ty0 <= 14, `he is up the sluices at ${i - s.tx0},${j - s.ty0}`); }   // (the first plank, three tiles up, can be flown onto from outside the water with the Toll's step; nothing rises from it: there is no jumping in falling water)
  assert.ok(!R.reached(wet.seen, room('lock'), wet.W) && !R.reached(wet.seen, room('head'), wet.W)); const sp = room('spill'); for (const k of wet.seen){ const i = k % wet.W, j = (k - i) / wet.W; if (inRoom({ x: i, y: j }, sp)) assert.ok(j - sp.ty0 <= 9, `he is up the spill at ${i - sp.tx0},${j - sp.ty0}`); }
  const dry = R.graph(4, ARR); for (const n of ['arches', 'sluices', 'lock']) assert.ok(R.reached(dry.seen, room(n), dry.W), n); assert.ok(!R.reached(dry.seen, room('head'), dry.W), 'the spill still runs: its wheel is behind the Lock');
  const open = R.graph(4, [...ARR, 'still']); for (const n of NAMES) assert.ok(R.reached(open.seen, room(n), open.W), n); assert.ok(L.marks.find(m => m.type === 'wheel' && m.key === 'sp').after);
});
// a thing's turn, with what the game gives its code stubbed
const turn = (e, P, RULE, secs, more = {}) => { const ev = [], hurts = []; for (let t = 0; t < secs; t += 1 / 60){ e.tm += 1 / 60; e.age += 1 / 60; const n0 = ev.length; AQ.ai[e.d.ai](e, P, 1 / 60, { dx: P.x - e.x, dy: P.y - e.y, dist: Math.hypot(P.x - e.x, P.y - e.y), events: ev, go: s => { e.st = s; e.tm = 0; }, anim(){}, RULE, T, marks: [], flows: [], isRollInv: () => false, hurt: (Q, n, x, w) => { hurts.push(w); return true; }, ...more });
  for (const v of ev.slice(n0)) if (v.type === 'sluice' && v.by){ if (RULE.wet.has(v.key)) RULE.wet.delete(v.key); else RULE.wet.add(v.key); } }   // (as the game does: a wheel turned is turned)
  return { ev, hurts }; };
const mk = (type, x, more = {}) => ({ type, d: AQ.enemies[type], x, y: 0, home: { x, y: 0 }, st: 'idle', tm: 0, age: 0, face: 1, flash: 0, hp: AQ.enemies[type].hp, ...more });
const rule = (wet = [], more = {}) => ({ wet: new Set(wet), wetAll: false, still: false, surge: 0, ...more }), FAR = { x: 40, y: 0, h: 2.4 };
test('a sluice wheel is not a creature: a blow turns it, once a moment', () => {
  const d = AQ.enemies.wheel, e = mk('wheel', 0, { mk: { key: 'f1' } }); assert.ok(d.prop && d.own); assert.equal(d.guard(e), true); const a = turn(e, FAR, rule(), 0.1); assert.deepEqual(a.ev.map(v => [v.type, v.key]), [['sluice', 'f1']]);
  d.guard(e); assert.equal(turn(e, FAR, rule(), 0.1).ev.length, 0, 'not twice in a moment');
});
test('a keeper goes to a wheel that is not as the house left it, and puts it back; when the Lock is open it stands down', () => {
  const marks = [{ type: 'wheel', x: 9.5, y: 0, key: 'f1', open: true }], e = mk('sluicer', 10, { mk: { lo: -12, hi: 4 } }), asLeft = turn(e, FAR, rule(['f1']), 4, { marks }); assert.equal(asLeft.ev.filter(v => v.type === 'sluice').length, 0, 'the wheel is as it was left: it walks its landing');
  const e2 = mk('sluicer', 10, { mk: { lo: -12, hi: 4 } }), a = turn(e2, FAR, rule([]), 6, { marks }), put = a.ev.filter(v => v.type === 'sluice'); assert.equal(put.length, 1); assert.deepEqual([put[0].key, put[0].by], ['f1', 'keeper']); assert.ok(Math.abs(put[0].at.x - 5) < 0.1, 'at the wheel');
  const quick = turn(mk('sluicer', 10, { mk: { lo: -12, hi: 4 } }), FAR, rule([]), 1.2, { marks }); assert.equal(quick.ev.filter(v => v.type === 'sluice').length, 0, 'not at once: there is time to get by');
  const e3 = mk('sluicer', 10, { mk: { lo: -12, hi: 4 } }), still = turn(e3, { x: 10.8, y: 0, h: 2.4 }, rule([], { still: true }), 5, { marks }); assert.equal(e3.x, 10); assert.equal(still.ev.length + still.hurts.length, 0);
});
test('a keeper strikes down what stands in front of it, after a warning; a guard turned to it stops the blow', () => {
  const d = AQ.enemies.sluicer, a = turn(mk('sluicer', 0), { x: 1.2, y: 0, h: 2.4 }, rule(), 2); assert.ok(a.hurts.includes('Struck down')); assert.ok(a.ev.some(v => v.type === 'tell')); assert.ok(d.wind >= 0.5, 'warned for long enough');
  const g = turn(mk('sluicer', 0), { x: 1.2, y: 0, h: 2.4, blocking: true, face: -1 }, rule(), 2); assert.equal(g.hurts.length, 0); assert.ok(g.ev.some(v => v.type === 'block')); assert.ok(d.hp >= 4 && d.hp <= 8);
});
test('a strider is fast on running water and stings; with its water stopped it sits where it was left', () => {
  const flows = [{ x0: -5, x1: 5, y0: 0, y1: 1, dx: 1, dy: 0, key: 'a' }], P = { x: 3, y: 0, h: 2.4 }, wet = turn(mk('strider', -3), P, rule(['a']), 2, { flows }); assert.ok(wet.hurts.includes('Stung'));
  const e = mk('strider', -3), dry = turn(e, P, rule([]), 3, { flows }); assert.equal(e.x, -3); assert.equal(dry.hurts.length, 0); const away = mk('strider', -3); turn(away, { x: 30, y: 0, h: 2.4 }, rule(['a']), 3, { flows }); assert.ok(away.x >= -4.5 && away.x <= 4.5, 'it keeps to its span');
});
test('the Lock: it warns, then lets go down the floor; who stands in that water is swept, who is up on a pier is not; it opens by thirds, faster each time', () => {
  const d = AQ.enemies.lock, K = AQ.LOCK, e = mk('lock', 0), inWater = { x: -4, y: 0, h: 2.4, flow: { key: 'surge' } }, a = turn(e, inWater, rule(), K.period[0] + K.warn + 0.3);
  assert.ok(a.ev.some(v => v.type === 'tell')); assert.equal(a.ev.filter(v => v.type === 'flood').length, 1); assert.deepEqual(a.hurts, ['Swept away'], 'once');
  const b = turn(mk('lock', 0), { x: -4, y: 1.5, h: 2.4, flow: null }, rule(), K.period[0] + K.warn + 0.3); assert.equal(b.hurts.length, 0, 'on a pier');
  const hit = mk('lock', 0); hit.x = 3; turn(hit, inWater, rule(), 0.1); assert.equal(hit.x, 0, 'a blow does not move it');
  assert.ok(K.period[0] > K.period[1] && K.period[1] > K.period[2] && K.period[2] >= 3); assert.ok(K.warn >= 0.8); assert.equal(d.name, 'The Lock'); assert.ok(d.hp >= 18 && d.hp <= 30);
  const late = mk('lock', 0); late.hp = 5; turn(late, inWater, rule(), 0.1); assert.equal(late.stage, 2);
  const lk = room('lock'); assert.ok(L.marks.some(m => m.type === 'lock' && inRoom(m, lk))); assert.ok(L.flows.some(f => f.key === 'surge' && f.dx < 0)); assert.ok(L.tiles.includes(LV.STILLED), 'its gate');
  const gone = R.graph(4, [...ARR, 'still']); assert.ok(R.reached(gone.seen, room('head'), gone.W));
});
test('at the head: the Carrier\'s Yoke. His flask holds one draught more', () => {
  assert.ok(L.marks.some(m => m.type === 'chest' && m.holds === 'relic:yoke' && inRoom(m, room('head')))); assert.ok(ST.RELICS.yoke && ST.RELICS.yoke.line.length <= 110);
  const worn = ST.G.worn; ST.G.worn = []; const plain = ST.maxFlask(); ST.G.worn = ['yoke']; const more = ST.maxFlask(); ST.G.worn = worn; assert.equal(more, plain + 1);
});
test('a save from before the wing is moved once: the Gardens stand three rooms further east', () => {
  assert.deepEqual(ST.WING_MOVED[4].slice(0, 2), [120, 0]); assert.equal(ST.ORG115[4][0], 120); assert.ok(R.loadLevel(4).X0 >= 120, 'what has been built west of the wing since is the save\'s own to follow (state.js rebase)');
});
