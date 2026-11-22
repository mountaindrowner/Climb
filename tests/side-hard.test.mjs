// How hard (docs/gifts-sheet.md, step 3; decision 0.17: three to five deaths a region, where it was none). Build 88:
// one spring a region, prices up by about two thirds, urns pay less, and the larger creatures' blows and the keepers'
// big blows cost two hearts.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import './helpers/browser.mjs';
const R = await import('./helpers/reach.mjs');
const LV = await import('../src/side/level.js');
const ST = await import('../src/side/state.js');
const src = f => readFileSync(new URL('../src/side/' + f, import.meta.url), 'utf8');
test('one spring a region on the climb, in the room named for it; the checkpoint pool is still there', () => {
  assert.equal(LV.SPRING.length, 6);
  for (let N = 0; N < 6; N++){ const L = { ...R.loadLevel(N) }, sh = L.marks.filter(m => m.type === 'shrine'), r = L.rooms.find(q => q.name === LV.SPRING[N]);
    assert.ok(r, `${L.name}: a room called ${LV.SPRING[N]}`); assert.equal(sh.length, 1, `${L.name}: one spring`); const m = sh[0]; assert.ok(m.x >= r.tx0 && m.x < r.tx1 && m.y >= r.ty0 && m.y < r.ty1, `${L.name}: in ${r.name}`);
    assert.ok(!r.gate, 'on the main way'); assert.ok(L.marks.some(k => k.type === 'pool' && !k.plain), `${L.name}: its pool`);
    const pool = L.marks.find(k => k.type === 'pool' && !k.plain), goal = R.goalOf(L.marks); assert.ok(m.y > pool.y && m.y < goal.y, `${L.name}: between the pool and the keeper`); }
});
test('Ordric\'s prices: about two thirds more than they were; an urn pays two to four', () => {
  assert.deepEqual(ST.KNOTS.cost, [200, 400, 660]); const m = src('main.js');
  for (const c of ['cost: [200, 430][G.flasks]', 'cost: [300, 630][G.edge]', 'cost: G.boughtThread ? undefined : 250']) assert.ok(m.includes(c), c);
  const all = 200 + 430 + 300 + 630 + 250 + 200 + 400 + 660; assert.ok(all > 1850 * 1.6 && all < 1850 * 1.75, `everything he sells: ${all} (it was 1850)`);
  assert.ok(src('items.js').includes('spill(it.x, it.y, Math.round((2 + Math.floor(rnd() * 3))'), 'an urn');
});
test('the larger creatures\' blows cost two hearts; what is thrown still costs one; the keepers\' great blows cost two', () => {
  for (const [f, n] of [['regions/tempest.js', 'squall'], ['regions/aqueducts.js', 'sluicer'], ['regions/firmament.js', 'sentinel']]) assert.ok(src(f).includes(`  ${n}: { ai: '${n}', heavy: 2,`), n);
  assert.ok(src('regions/cairns.js').includes('bar: 0.9, dmg: 2,'), 'the Turned');
  const e = src('enemies.js'); assert.ok(/yeti:\s+\{ ai: 'thrower', dmg: 2,/.test(e)); assert.ok(e.includes("hurt(P, e.d.dmg || 1, e.x, 'Swatted')")); assert.ok(e.includes("hurt(P, 1, O.x, e.d.word || 'Spat on'"), 'a thrown thing: one');
  assert.ok(e.includes('hurt: e.d.heavy ? (Q, n, x, w) => hurt(Q, Math.max(n, e.d.heavy), x, w) : hurt'));
  for (const [f, s] of [['boss.js', "hurt(P, 2, a.p.x, 'Crushed'"], ['toll.js', "hurt(P, 2, B.px, 'Crushed'"], ['wyrm.js', "hurt(P, 2, H.x, 'Run through'"], ['thunderhead.js', "hurt(P, 2, r.x, 'Struck by lightning'"], ['mother.js', "hurt(P, 2, a.tip.x, 'Crushed'"], ['fallen.js', "hurt(P, 2, w.x - w.dir, 'Thrown down'"]]) assert.ok(src(f).includes(s), f);
});
