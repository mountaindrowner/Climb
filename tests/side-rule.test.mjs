// What each keeper holds in its region, and the quick way it leaves (phase 9, docs/phase9-sheet.md 3 and 4). While the
// keeper stands its rule slows the region and never shuts it; when it falls the rule ends and a quick way from the
// raising water to its hall is found open. Played with the real motor (tests/helpers/reach.mjs: 'fallen').
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './helpers/browser.mjs';
const R = await import('./helpers/reach.mjs');
const LV = await import('../src/side/level.js');
const { RULES } = await import('../src/side/seams.js');
const { HOLD, DOOR, GIVEN } = LV, count = (L, v) => L.tiles.reduce((n, t) => n + (t === v ? 1 : 0), 0);
const way = (N, gifts) => { const G = R.graph(N, gifts), pool = G.marks.find(m => m.type === 'pool' && !m.plain); return R.runback(G, { x: pool.x + 4, y: pool.y + 1 }, R.nearGoal(R.goalOf(G.marks))); };

for (const N of Object.keys(RULES).map(Number)){
  const NAME = R.LEVELS[N].name;
  test(`${NAME}: with its keeper standing and what he has when he comes, the keeper can be come to from the water`, () => {
    assert.ok(way(N, R.arrival(N)), 'a way from the raising water to the keeper');
  });
  test(`${NAME}: with its keeper fallen the way from the water to its hall is no longer, and a quick way is marked`, () => {
    const a = way(N, R.GIFTS), b = way(N, [...R.GIFTS, 'fallen']); assert.ok(a && b);
    assert.ok(b.units <= a.units + 6, `fallen ${Math.round(b.units)} units, standing ${Math.round(a.units)}`);
    assert.ok({ ...R.loadLevel(N) }.rooms.some(r => r.quick), 'a room of the quick way');
  });
}
test('the Roots: slabs in three doorways (three tiles left under each), and the well\'s foot stone at both ends', () => {
  const L = { ...R.loadLevel(0) }, W = L.W; let low = 0;
  for (let k = 0; k < L.tiles.length; k++) if (L.tiles[k] === HOLD && L.tiles[k - W] === 0 && L.tiles[k - 2 * W] === 0 && L.tiles[k - 3 * W] === 0 && L.tiles[k - 4 * W] === 1) low++;
  assert.ok(low >= 12, `${low} tiles of slab with three tiles of air under them`);
  assert.equal(count(L, GIVEN), 4, 'the boards over the well\'s foot'); const wf = L.rooms.find(r => r.name === 'wellfoot'); assert.ok(wf && wf.after && wf.quick);
});
test('the Cloister: four doors on the bell\'s beat, three of them the tower\'s', () => {
  const L = { ...R.loadLevel(1) }, cols = new Set(); for (let k = 0; k < L.tiles.length; k++) if (L.tiles[k] === DOOR) cols.add(Math.round((k % L.W) / 40) + ':' + Math.floor(k / L.W / 23));
  assert.equal(cols.size, 4, [...cols].join(' ')); assert.equal(count(L, HOLD), L.joins.up.seal.length, 'nothing held but the seal: the house is never shut');
});
test('the Spires: the wind on three faces, one above another; turned, it is the quick way', () => {
  const L = { ...R.loadLevel(2) }; assert.ok(L.gusts.length >= 3); assert.equal(count(L, GIVEN), 4, 'the planks in the arch');
  const xs = L.gusts.map(g => g.x0), ys = L.gusts.map(g => g.y0).sort((a, b) => a - b); assert.ok(Math.max(...xs) - Math.min(...xs) < 12, 'one above another'); assert.ok(ys[ys.length - 1] - ys[0] > 30, 'from the saddle to the span');
  const a = way(2, R.GIFTS), b = way(2, [...R.GIFTS, 'fallen']); assert.ok(b.units < a.units * 0.75, `fallen ${Math.round(b.units)} units, standing ${Math.round(a.units)}`);
});
test('the Tempest: three rods on the way up, and a shaft of live gantries that is dead iron once the storm breaks', () => {
  const L = { ...R.loadLevel(3) }; assert.equal(L.marks.filter(m => m.type === 'rod').length, 3);
  for (const m of L.marks.filter(m => m.type === 'rod')){ assert.equal(L.tiles[m.y * L.W + m.x], 0, 'a rod stands in the open'); assert.ok([1, 2].includes(L.tiles[(m.y - 1) * L.W + m.x]), 'on a floor'); }
  assert.ok(count(L, LV.LIVE) >= 20, 'the gantries');
  const st = R.graph(3, R.GIFTS).seen, fa = R.graph(3, [...R.GIFTS, 'fallen']).seen, live = []; for (let k = 0; k < L.tiles.length; k++) if (L.tiles[k] === LV.LIVE) live.push(k + L.W);
  assert.ok(!live.some(k => st.has(k)), 'no one stands on a live gantry'); assert.ok(live.filter(k => fa.has(k)).length >= 10, 'they are stood on once the storm has broken');
});
test('the Gardens: four ways up choked with thorn; withered, they are the quick way', () => {
  const L = { ...R.loadLevel(4) }; assert.equal(count(L, GIVEN), 16, 'boards over four mouths');
  const a = way(4, R.GIFTS), b = way(4, [...R.GIFTS, 'fallen']); assert.ok(b.units < a.units * 0.75, `fallen ${Math.round(b.units)} units, standing ${Math.round(a.units)}`);
});
