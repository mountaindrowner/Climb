// Deep water, the Flooded Levels and the Great Shaft (phase 16, docs/phase16-sheet.md). Their rooms are held by the
// region tests (all of them reached, no place to be stranded). These hold what is their own: that water bears him up
// and only the Wyrm's wind takes him under; the sump; the Sunk, the eel, the raft, the Pump and its tide; the Shaft's
// cold air and the water at its foot.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clock } from './helpers/browser.mjs';
const R = await import('./helpers/reach.mjs');
const LV = await import('../src/side/level.js');
const FL = (await import('../src/side/regions/flooded.js')).default, { SUNK, EEL, PUMP, HALL } = await import('../src/side/regions/flooded.js');
const SH = (await import('../src/side/regions/shaft.js')).default, { SHAFT } = await import('../src/side/regions/shaft.js');
const M = await import('../src/side/motor.js');
const I = await import('../src/core/input.js');
const ST = await import('../src/side/state.js');
const T = 0.5, idx = n => LV.LEVELS.findIndex(l => l.name === n), WK = idx('The Workings'), VN = idx('The Vein'), N = idx('The Flooded Levels'), NS = idx('The Great Shaft');
const inRoom = (m, r) => m.x >= r.tx0 && m.x < r.tx1 && m.y >= r.ty0 && m.y < r.ty1;
// him, played: from (x, y) for `secs`, the keys given each frame; what became of him
const play = (glide, x, y, secs, prog, more = {}) => { M.CAN.glide = glide; I.release(); clock.t += 10; const P = M.newPlayer(x, y); P.grounded = false; Object.assign(P, more); let t = 0, low = 1e9, hp = P.hp, events = [];
  for (let f = 0; f < secs * 60; f++){ prog(t, I, P); for (let s = 0; s < 2; s++){ M.stepPlayer(P, 1 / 120); clock.t += 1 / 120; t += 1 / 120; } I.endFrame(); events.push(...P.events.map(e => e.type)); P.events.length = 0; low = Math.min(low, P.y); }
  I.release(); M.CAN.glide = false; return { P, low, hurt: hp - P.hp, events }; };

test('deep water bears him up: without the Wyrm\'s wind he floats in the cistern and cannot go under; with it he reaches the sump', () => {
  const L = R.loadLevel(WK), c = L.rooms.find(r => r.name === 'cistern'), w = L.waters[0], top = w.y1, x = c.x0 + 21.5;
  assert.ok(top - w.y0 >= 3.5, 'four times his depth');
  const a = play(false, x, top + 4, 5, (t, I) => I.hold('down', true)); assert.ok(a.P.swim, 'the water has him'); assert.ok(a.low > top - M.SWIM.float - 0.9, `he went ${(top - a.low).toFixed(2)} under`); assert.equal(a.hurt, 0);
  assert.ok(Math.abs((top - a.P.y) - M.SWIM.float) < 0.2, 'and rests at his chest in it');
  const dive = play(false, x, top + 12, 3, (t, I) => { if (t < 0.02){ I.hold('down', true); I.tap('attack'); } }); assert.ok(dive.low > top - M.SWIM.float - 1.2, 'not even by his plunge');
  const b = play(true, x, top + 4, 5, (t, I) => I.hold('down', true)); assert.ok(b.low < 0.6, 'with the wind: to the bottom of the sump');
  const hang = play(true, x, top - 2, 2, () => {}); assert.ok(hang.P.swim && Math.abs(hang.P.vy) < 1, 'let go, he hangs in it');
  const up = play(true, x, 1.2, 4, (t, I) => I.hold('jump', true)); assert.ok(Math.abs((top - up.P.y) - M.SWIM.float) < 0.25, 'jump held: up to its top');
  const out = play(false, c.x0 + 31, top - 1.5, 4, (t, I) => { I.hold('right', true); if (Math.floor(t * 4) !== Math.floor((t - 1 / 60) * 4)) I.tap('jump'); }); assert.ok(out.P.x > c.x0 + 33.6 && out.events.includes('surface'), 'and he can leave it onto the quay');
});
test('the sump: a passage in the cistern\'s floor, under its water, that only the wind reaches; the quay and the seal are reached without it', () => {
  const L = { ...R.loadLevel(WK) }, c = L.rooms.find(r => r.name === 'cistern'), ps = L.marks.find(m => m.type === 'pass' && m.to === N); assert.ok(ps && ps.gate === 'glide' && inRoom(ps, c));
  const at = g => { for (const k of g.seen){ const i = k % g.W, j = (k - i) / g.W; if (i >= ps.x && i < ps.x + ps.w && j <= ps.y + ps.h) return true; } return false; };
  const dry = R.graph(WK, []); assert.ok(!at(dry), 'not without the wind'); assert.ok(R.reached(dry.seen, L.rooms.find(r => r.name === 'sealroom'), dry.W), 'the seal, across the water');
  assert.ok(at(R.graph(WK, ['glide'])), 'with it');
});
test('the Flooded Levels: twelve screens of the Deep, dark, entered only with the wind; its water, Hob, and lamps above the water and below it', () => {
  const L = { ...R.loadLevel(N) }, names = ['sump', 'pockets', 'drowned', 'chapel', 'pumphouse', 'overflow'], rs = names.map(n => L.rooms.find(r => r.name === n)); assert.ok(rs.every(Boolean));
  assert.equal(rs.reduce((n, r) => n + (r.tx1 - r.tx0) * (r.ty1 - r.ty0) / (40 * 23), 0), 12); assert.ok(FL.deep && FL.dark && FL.needs.includes('glide')); assert.deepEqual(R.arrival(N), ['glide']);
  assert.ok(rs[5].after && !rs[4].after, 'the overflow opens when the Pump runs free');
  assert.ok(L.marks.some(m => m.type === 'pool' && !m.plain && inRoom(m, rs[0]))); assert.ok(L.marks.some(m => m.type === 'npc' && m.who === 'hob' && inRoom(m, rs[0])));
  assert.ok(L.marks.some(m => m.type === 'pass' && m.to === WK && inRoom(m, rs[0])) && L.marks.some(m => m.type === 'pass' && m.to === VN && m.gate && inRoom(m, rs[5])), 'up to the cistern; down to the Vein');
  assert.ok(R.loadLevel(VN).marks.some(m => m.type === 'arrive' && m.name === 'overflow') && R.loadLevel(WK).marks.some(m => m.type === 'arrive' && m.name === 'sump'));
  assert.ok(L.marks.filter(m => m.type === 'dlamp').length >= 16 && L.marks.filter(m => m.type === 'glamp').length >= 8);
  assert.ok(L.marks.some(m => m.type === 'deco' && m.kind === 'shiftlamp' && inRoom(m, rs[3])), 'the lamp on the chapel\'s altar');
  assert.ok(L.waters.length >= 7 && L.movers.filter(m => m.kind === 'raft').length === 2);
});
// a thing's turn, with what the game gives its code stubbed
const turn = (ai, e, P, secs, more = {}, each) => { const ev = [], hurts = [], RULE = more.RULE || { still: false, tide: 0 };
  const c = { events: ev, go: s => { e.st = s; e.tm = 0; }, anim(){}, RULE, T, marks: [], rooms: [], E: { list: more.list || [] }, isRollInv: () => false, solidAt: more.solidAt || (() => false), waterAt: more.waterAt || (() => ({})), SIDE: more.SIDE || {},
    hurt: (p, n, fx, word) => { hurts.push(word); return true; }, hit: (x0, y0, x1, y1, word) => { if (P.x + 0.34 > x0 && P.x - 0.34 < x1 && P.y + 2.4 > y0 && P.y < y1){ hurts.push(word); return true; } return false; }, kill: (q, evs) => { q.alive = false; evs.push({ type: 'kill', e: q }); } };
  for (let t = 0; t < secs && e.alive; t += 1 / 60){ e.tm += 1 / 60; e.age += 1 / 60; if (each) each(t, P, e, RULE); ai(e, P, 1 / 60, c); } return { ev, hurts, RULE }; };
const mk = (type, x, y = 0, more = {}) => ({ type, d: FL.enemies[type], x, y, home: { x, y }, st: 'idle', tm: 0, age: 0, face: 1, flash: 0, hp: FL.enemies[type].hp, alive: true, ...more });

test('the Sunk lie on the bottom, rise at whoever passes over them in the water, take hold, and cannot leave it', () => {
  const dry = turn(FL.ai.sunk, mk('sunk', 0), { x: 1, y: 3, h: 2.4, wet: false }, 4); assert.equal(dry.ev.length, 0, 'one who is not in the water is nothing to it');
  const e = mk('sunk', 0), a = turn(FL.ai.sunk, e, { x: 1, y: 3, h: 2.4, wet: true }, 5); assert.ok(a.ev.some(v => v.type === 'notice')); assert.ok(a.hurts.includes('Dragged at')); assert.ok(e.y > 0.8, 'it rose');
  const far = turn(FL.ai.sunk, mk('sunk', 0), { x: SUNK.sees + 2, y: 3, h: 2.4, wet: true }, 3); assert.equal(far.ev.length, 0);
  const top = 2.5, s = mk('sunk', 0), b = turn(FL.ai.sunk, s, { x: 0.5, y: 8, h: 2.4, wet: true }, 8, { waterAt: (x, y) => y < top ? {} : null }); assert.ok(s.y + 1.9 <= top + 0.05, `its head stays under: ${s.y.toFixed(2)}`); assert.equal(b.hurts.length, 0);
  assert.equal(FL.enemies.sunk.hp, 3);
});
test('a blind eel feels the water move: it strikes a fast swimmer, with a warning; a slow one it never knows; nor one who carries the Shift Bell', () => {
  const fast = { x: 4, y: -1, h: 2.4, wet: true, vx: 5, vy: 0 }, a = turn(FL.ai.eel, mk('eel', 0), fast, 2); assert.ok(a.ev.some(v => v.type === 'tell'), 'a warning'); assert.ok(a.hurts.includes('Struck by an eel'));
  const slow = turn(FL.ai.eel, mk('eel', 0), { x: 4, y: -1, h: 2.4, wet: true, vx: 2, vy: 0.4 }, 4); assert.equal(slow.ev.length + slow.hurts.length, 0); assert.ok(EEL.fast > M.SWIM.drift + 1 && EEL.fast < M.SWIM.speed, 'his full pace wakes it; drifting does not');
  const bell = turn(FL.ai.eel, mk('eel', 0), fast, 4, { SIDE: { bell: true } }); assert.equal(bell.hurts.length, 0);
  const dry = turn(FL.ai.eel, mk('eel', 0), { ...fast, wet: false }, 3); assert.equal(dry.hurts.length, 0);
  const e = mk('eel', 0), miss = turn(FL.ai.eel, e, { x: 4, y: -1, h: 2.4, wet: true, vx: 5, vy: 0 }, 6, {}, (t, P) => { if (t > 0.1) P.y = 6; }); assert.equal(miss.hurts.length, 0, 'it strikes where he was'); assert.ok(Math.hypot(e.hx - e.home.x, e.hy - e.home.y - 0.3) < 0.1, 'and goes back to its hole');
});
test('the Pump: it cannot be struck; it moves the water; at low water its piston falls where he stands, after a warning; its valves broken, it runs free', () => {
  const d = FL.enemies.pump; assert.equal(d.name, 'The Pump'); assert.equal(d.guard(), true); assert.equal(FL.enemies.valve.hp, PUMP.valve);
  const vs = [0, 1, 2].map(k => mk('valve', 0, 2 + k)), e = mk('pump', 0, 0), P = { x: 3, y: 0, h: 2.4 }, seen = [];
  const a = turn(FL.ai.pump, e, P, (PUMP.low + PUMP.turn * 2 + PUMP.high) * 1.2, { list: vs }, (t, P0, e0, RULE) => seen.push(RULE.tide));
  assert.ok(Math.min(...seen) === 0 && Math.max(...seen) === 1, 'low water and high'); assert.ok(a.ev.some(v => v.type === 'tell') && a.ev.some(v => v.type === 'thud')); assert.ok(a.hurts.includes('Crushed'), 'he stood under it');
  const tellAt = a.ev.findIndex(v => v.type === 'tell'), thudAt = a.ev.findIndex(v => v.type === 'thud'); assert.ok(tellAt >= 0 && thudAt > tellAt && PUMP.tell >= 0.7, 'the warning first');
  const e2 = mk('pump', 0, 0), away = turn(FL.ai.pump, e2, { x: 3, y: 0, h: 2.4 }, PUMP.low * 1.5, { list: vs }, (t, P0) => { if (e2.aim && !e2.aim.hit) P0.x = e2.aim.x + 4; }); assert.equal(away.hurts.length, 0, 'out from under it in time');
  const e3 = mk('pump', 0, 0); turn(FL.ai.pump, e3, P, 1, { list: vs }); vs[0].alive = false; turn(FL.ai.pump, e3, P, 0.1, { list: vs }); assert.equal(e3.stage, 1); assert.ok(PUMP.quick[1] < 1 && PUMP.quick[2] < PUMP.quick[1], 'quicker with each valve');
  for (const v of vs) v.alive = false; const end = turn(FL.ai.pump, e3, P, 0.2, { list: vs }); assert.ok(end.ev.some(v => v.type === 'kill')); assert.equal(end.RULE.tide, 0);
  const stayed = mk('pump', 0, 0); d.spawn(stayed, { RULE: { still: true } }); assert.equal(stayed.alive, false, 'and it stays so');
});
test('the Pump\'s water: it stands in the trench at its lowest, to the hall\'s roof at its highest, and is gone from the hall for good once it runs free', () => {
  const L = R.loadLevel(N), ph = L.rooms.find(r => r.name === 'pumphouse'), tide = L.waters.filter(w => w.key === 'tide'); assert.equal(tide.length, 2);
  const w = tide[0], floor = ph.y0 + HALL.floor * T; assert.equal(w.lo, floor);
  LV.RULE.still = false; LV.RULE.tide = 0; assert.equal(LV.waterTop(w), floor); assert.ok(!LV.waterAt(ph.x0 + 25, floor + 0.5), 'the floor dry'); assert.ok(LV.waterAt(ph.x0 + 15.7, floor - 0.5), 'the trench full');
  LV.RULE.tide = 1; assert.equal(LV.waterTop(w), w.y1); assert.ok(LV.waterAt(ph.x0 + 25, floor + 5));
  LV.RULE.still = true; assert.equal(LV.waterTop(w), floor); LV.RULE.still = false;
  let grate = 0; for (let j = ph.ty0; j < ph.ty1; j++) for (let i = ph.tx0; i < ph.tx1; i++) if (L.tiles[j * L.W + i] === 13) grate++; assert.ok(grate >= 10, 'a grate over the overflow');
});
test('a raft goes down under him and comes back when he is off it', () => {
  R.loadLevel(N); LV.PHASE.all = false; const m = LV.LEVEL.movers.find(q => q.kind === 'raft'); m.at = -1; m.sink = 0; m.load = 0; LV.PHASE.t = 100; LV.moversNow(); const y0 = m.y;
  for (let k = 1; k <= 60; k++){ m.load = 0.12; LV.PHASE.t = 100 + k / 60; LV.moversNow(); } assert.ok(y0 - m.y > 1.2, `a second on it: ${(y0 - m.y).toFixed(2)} down`);
  for (let k = 61; k <= 400; k++){ LV.PHASE.t = 100 + k / 60; LV.moversNow(); } assert.ok(Math.abs(m.y - y0) < 0.01, 'and back'); LV.PHASE.all = true;
});
test('the relics: the Shift Bell (faster under water), the Last Rope (up onto an edge twice as fast)', () => {
  assert.ok(ST.RELICS.shiftbell && ST.RELICS.lastrope); const L = R.loadLevel(WK), c = L.rooms.find(r => r.name === 'cistern'), y = L.waters[0].y1 - 3;
  M.SIDE.bell = false; const a = play(true, c.x0 + 8, y, 1.5, (t, I) => I.hold('right', true)); M.SIDE.bell = true; const b = play(true, c.x0 + 8, y, 1.5, (t, I) => I.hold('right', true)); M.SIDE.bell = false;
  assert.ok(b.P.x - a.P.x > 1, `${(b.P.x - a.P.x).toFixed(2)} further`); assert.ok(Math.abs(a.P.vx - M.SWIM.speed) < 0.3);
});
test('the Great Shaft: four screens, nobody in it; cold air under the scarf holds him back; whoever falls it falls into water, unhurt; its floor is under that water', () => {
  const L = { ...R.loadLevel(NS) }, dr = L.rooms.find(r => r.name === 'drop'), fl = L.rooms.find(r => r.name === 'floor'); assert.ok(dr && fl && fl.needs === 'glide' && SH.empty && SH.dark);
  assert.equal([dr, fl].reduce((n, r) => n + (r.tx1 - r.tx0) * (r.ty1 - r.ty0) / (40 * 23), 0), 4); assert.ok(!L.marks.some(m => m.type === 'npc' || m.type === 'glamp' || FL.enemies[m.type]), 'nobody, and no lamp but his');
  assert.ok(L.updrafts.some(u => u.cold)); assert.ok(R.loadLevel(VN).marks.some(m => m.type === 'pass' && m.to === NS && m.gate)); R.loadLevel(NS);
  const x = dr.x0 + 10.2, top = dr.y0 + 21, fell = play(false, x, dr.y0 + 20, 6, () => {}); assert.ok(fell.P.swim, 'into the water'); assert.equal(fell.hurt, 0, 'unhurt');
  const g = play(true, x, top, 2, (t, I) => { if (Math.abs(t - 0.1) < 0.009) I.tap('jump'); I.hold('jump', t > 0.05); }, { airJumps: 0 }); assert.ok(g.P.glide, 'under the scarf'); assert.ok(Math.abs(g.P.vy + M.GLIDE.fall * M.GLIDE.cold) < 0.2, `he comes down at ${(-g.P.vy).toFixed(2)}`);
  const secs = (dr.y0 + 30 - (dr.y0 + SHAFT.top * T)) / (M.GLIDE.fall * M.GLIDE.cold); assert.ok(secs > 10, `the long glide: ${secs.toFixed(1)}s from the head`);
  const dry = R.graph(NS, []); assert.ok(!R.reached(dry.seen, fl, dry.W), 'the floor: not without the wind'); assert.ok(R.reached(R.graph(NS, ['glide']).seen, fl, dry.W), 'with it');
  const ps = L.marks.find(m => m.type === 'pass'); assert.ok([...dry.seen].some(k => { const i = k % dry.W, j = (k - i) / dry.W; return Math.abs(i - ps.x - 2) < 5 && j >= ps.y - 3 && j <= ps.y; }), 'and from the water he can climb back to the head');
});
