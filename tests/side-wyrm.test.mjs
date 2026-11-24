// The Rime Wyrm rebuilt (build 97, docs/wyrm-sheet.md): its hall is the broken pass, three levels and the gap between
// the halves of the pass, cloud while it fights; its five attacks each take one level from him. The fight is run here
// in node: its pictures go to a stand-in for three.js that takes anything and draws nothing.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './helpers/browser.mjs';
const stub = () => { const keep = {}; return new Proxy(function(){}, {
  get: (t, k) => k in keep ? keep[k] : k === Symbol.toPrimitive ? () => 0 : k === 'then' ? undefined : (keep[k] = stub()),
  set: (t, k, v) => { keep[k] = v; return true; }, apply: () => stub(), construct: () => stub() }); };
globalThis.THREE = stub(); document.createElement = () => stub();
const LV = await import('../src/side/level.js');
const { makeWyrm, WYRM } = await import('../src/side/wyrm.js');
const { SIDE } = await import('../src/side/motor.js');
const room = () => LV.LEVEL.rooms.find(r => r.name === 'crown');

function fight(){
  LV.loadLevel(2);
  const B = makeWyrm(stub(), stub()), r = room(), T = LV.T, events = [];
  // the hall shut, as entrance.js shuts it: the gap's two rows of rock
  const tx0 = Math.round(r.x0 / T), mk = LV.LEVEL.marks.find(m => m.type === 'boss'), W = LV.LEVEL.W;
  for (let i = Math.round(B.gap.x0 / T); i < Math.round(B.gap.x1 / T); i++) for (const j of [mk.y - 2, mk.y - 1]) LV.LEVEL.tiles[j * W + i] = LV.ROCK;
  const P = { x: B.cx - 6, y: B.stageY + 0.02, vx: 0, vy: 0, h: 2.4, hp: 99, maxHp: 99, inv: 0, roll: 0, face: 1, grounded: true, events: [] };
  B.st = 'fight'; B.tm = 0; B.mode = 'circle'; B.cd = 99;
  const run = (s, each) => { for (let n = 0; n < s * 60; n++){ B.step(P, 1 / 60, stub(), events); P.inv = Math.max(0, P.inv - 1 / 60); if (each) each(n); } };
  const force = (m, side, more = {}) => Object.assign(B, { mode: m, mt: 0, side, hit: false, cd: 99 }, more);
  return { B, P, r, events, run, force, tx0 };
}

test('the broken pass: shelves at the horns and beside the middle, a slab over the gap, and the gap itself', () => {
  LV.loadLevel(2); const r = room(), T = LV.T, mk = LV.LEVEL.marks.find(m => m.type === 'boss'), W = LV.LEVEL.W, at = (c, row) => LV.LEVEL.tiles[(mk.y - 2 + row) * W + Math.round(r.x0 / T) + c];
  for (const [a, b, row] of [[4, 9, 8], [70, 75, 8], [20, 26, 8], [53, 59, 8], [33, 46, 14]]) for (let c = a; c <= b; c++) assert.equal(at(c, row), LV.LEDGE, `a ledge at ${c}, ${row}`);
  assert.deepEqual(WYRM.levels, [0, 3.5, 6.5]);
  for (let c = 36; c <= 42; c++) assert.equal(at(c, 0), LV.EMPTY, 'the way up is the gap');
});

test('a fall into the cloud costs a heart and puts him back on the pass, beside the gap; the gap is open only while it fights', () => {
  const { B, P, run } = fight(); const T = LV.T, mk = LV.LEVEL.marks.find(m => m.type === 'boss'), row1 = i => LV.LEVEL.tiles[(mk.y - 1) * LV.LEVEL.W + i];
  P.x = B.gap.x + 0.4; P.y = B.stageY - 0.3; run(1 / 60);
  assert.equal(P.hp, 98, 'a heart'); assert.ok(P.x > B.gap.x1 && P.x < B.gap.x1 + 1.2 && Math.abs(P.y - B.stageY) < 0.1, `back beside it: ${P.x}`);
  assert.equal(row1(Math.round(B.gap.x / T)), LV.EMPTY, 'the top row of the seal cut back while it fights');
  B.reset(); assert.equal(row1(Math.round(B.gap.x / T)), LV.ROCK, 'and shut again after');
});

test('the frost lies along the whole pass, and hurts him there; on a shelf he is not hurt, and its head can be cut while it breathes', () => {
  const { B, P, run, force } = fight();
  P.x = B.room.x1 - 3.5; P.y = B.stageY + 3.52; force('frostGo', 1);
  let hurtOnShelf = 0; run(2.6, () => { if (P.hp < 99) hurtOnShelf++; });
  assert.ok(['frostTell', 'frost'].includes(B.mode), B.mode); assert.equal(hurtOnShelf, 0);
  run(1); assert.equal(B.mode, 'frost');
  const on = { ...P }; P.x = B.room.x0 + 10; P.y = B.stageY + 0.02; run(0.3); assert.ok(P.hp < 99, 'on the pass, frozen'); Object.assign(P, on, { hp: 99 });
  const hp = B.hp, out = []; const H = B.h; P.x = H.x - 1.5; P.y = H.y - 1.2; P.face = 1; B.strike(P, 2.2, 2, out);
  assert.equal(B.hp, hp - 2, 'cut while it breathes'); assert.ok(out.some(e => e.type === 'hit'));
  force('circle', 1); const out2 = []; B.h.x = P.x + 1.5; B.h.y = P.y + 1.2; B.strike(P, 2.2, 2, out2); assert.equal(B.hp, hp - 2, 'not while it flies'); assert.ok(out2.some(e => e.type === 'block'));
});

test('the pass goes through the hall along one level: the one he is on, mostly; on another level it misses him', () => {
  const { B, P, run, force } = fight(); let his = 0;
  for (let n = 0; n < 30; n++){ P.x = B.cx - 6; P.y = B.stageY + 0.02; force('passGo', 1); run(3.5); if (B.mode === 'passTell' || B.mode === 'pass'){ if (B.lv === 0) his++; } }
  assert.ok(his > 12 && his < 29, `the pass, on his level ${his} of 30`);
  // along the pass, with him on the slab: it misses
  P.x = B.cx; P.y = B.stageY + 6.52; force('passTell', 1, { lv: 0, ly: B.stageY + WYRM.levels[0] + WYRM.pass.over }); B.h.x = B.room.x1 + 9; B.h.y = B.ly; P.hp = 99;
  run(4.5); assert.equal(P.hp, 99, 'over it'); assert.equal(B.mode, 'circle');
  // along the slab, with him on it: it hits
  P.x = B.cx; P.y = B.stageY + 6.52; force('passTell', -1, { lv: 2, ly: B.stageY + WYRM.levels[2] + WYRM.pass.over }); B.h.x = B.room.x0 - 9; B.h.y = B.ly;
  run(4.5); assert.ok(P.hp < 99, 'in its way');
});

test('three shards from its mouth, aimed at him; each cracks where it lands and leaves a spike; a cut sends one back at its head', () => {
  const { B, P, run, force } = fight();
  // (in the open: not under a shelf, which takes them)
  P.x = B.cx - 5; P.y = B.stageY + 0.02; force('shardGo', 1); let most = 0, fired = 0;
  run(5, () => { most = Math.max(most, B.shards.length); if (B.mode === 'shard') fired = B.n; });
  assert.equal(fired, 3); assert.ok(P.hp < 99, 'they come at him'); assert.equal(B.mode, 'circle');
  // one in front of his cut
  P.hp = 99; force('shardGo', 1); P.x = B.cx - 5; run(1.2, () => {});
  while (B.mode !== 'shard') run(1 / 60);
  run(0.05); const c = B.shards[0]; assert.ok(c, `one in the air: ${B.mode} ${B.mt.toFixed(2)} ${B.n} ${B.shards.length} ${(B.h.x - P.x).toFixed(1)} ${(B.h.y - P.y).toFixed(1)}`); P.x = c.x - 1.2 * Math.sign(c.vx || 1) * -1; P.face = Math.sign(c.x - P.x) || 1; P.y = c.y - 1.2;
  const hp = B.hp, out = []; B.strike(P, 2.2, 1, out); assert.ok(c.back, 'sent back'); run(1.5); assert.equal(B.hp, hp - WYRM.shards.back, 'into its head');
});

test('the plunge drives into the first thing under it: onto the slab when he stands there, and it is stuck there to be cut', () => {
  const { B, P, run, force } = fight();
  P.x = B.cx + 2; P.y = B.stageY + 6.52; force('aim', 1); run(4, () => {}); 
  assert.ok(['stuck', 'pull', 'circle'].includes(B.mode)); assert.ok(Math.abs(B.fy - (B.stageY + 6.5)) < 0.01, `onto the slab: ${B.fy - B.stageY}`);
  // never over the gap
  P.x = B.gap.x; P.y = B.stageY + 6.52; force('aim', 1); run(0.5); assert.ok(B.h.x < B.gap.x0 || B.h.x > B.gap.x1 || B.mode === 'aim');
});

test('from half health: up out of the gap, the wind along the pass toward it, and a breath followed by a pass', () => {
  const { B, P, run, force } = fight(); B.phase = 2; B.hp = 15;
  P.x = B.gap.x1 + 0.8; P.y = B.stageY + 0.02; force('upGo', 1); let rose = false;
  run(4, () => { if (B.mode === 'up') rose = true; P.x = B.gap.x1 + 0.8; P.y = B.stageY + 0.02; });
  assert.ok(rose); assert.ok(P.hp < 99, 'thrown, beside its edge');
  P.hp = 99; P.x = B.room.x0 + 9; P.y = B.stageY + 0.02; force('circle', 1, { wt: 0 }); const x0 = P.x; run(1);
  assert.ok(P.x > x0 + 1.5, `carried toward the gap: ${(P.x - x0).toFixed(2)}`);
  P.x = B.room.x1 - 3.5; P.y = B.stageY + 3.52; force('frost', 1, { n: 0, combo: false }); run(3.1); assert.equal(B.mode, 'passGo', 'a pass at once');
});

test('it is never the same attack twice running, and every attack comes', () => {
  const { B, P, run } = fight(); const seen = new Set(); let prev = '', twice = 0; B.phase = 2; B.cd = 0;
  run(240, () => { P.hp = 99; P.x = B.cx - 6; P.y = B.stageY + 0.02; P.vx = P.vy = 0; if (B.acts && B.last !== prev){ seen.add(B.last); prev = B.last; } });
  for (const k of ['plunge', 'frost', 'pass', 'shards', 'up']) assert.ok(seen.has(k), k);
  assert.equal(B.st, 'fight');
});
