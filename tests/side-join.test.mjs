// The joins (phase 9, docs/phase9-sheet.md): he walks from one region into the next through a sill, a tunnel that is
// the same in both. These hold the level side of that: the sill's tiles are the same in the region below and the
// region above; it is wider and taller than the view from its middle, so nothing else is in sight when the regions
// change; the way out of a keeper's hall is stone until the keeper falls; and a save made before the regions moved
// still finds what it had taken.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './helpers/browser.mjs';
const { loadLevel, T } = await import('./helpers/reach.mjs');
const LV = await import('../src/side/level.js');
const { JOIN_MOVED } = await import('../src/side/state.js');
const { VIEW_H } = await import('../src/side/paint.js');
const { SILL, JOINS, sill, ROCK, EMPTY, CRACKED } = LV, L = []; for (let n = 0; n <= LV.CLIMB_TOP; n++) L.push({ ...loadLevel(n) });

for (const k of Object.keys(JOINS).map(Number)){
  const lo = L[k - 1], hi = L[k], up = lo.joins.up, down = hi.joins.down, name = JOINS[k].title;
  test(`${name}: the sill is the same, tile for tile, below and above`, () => {
    assert.ok(up && down, 'both regions have it'); assert.equal(up.k, k); assert.equal(down.k, k); assert.equal(up.dir, down.dir); assert.equal(up.to, k); assert.equal(down.to, k - 1);
    const t = sill(k);
    for (let y = 0; y < SILL.h; y++) for (let x = 0; x < SILL.w; x++){
      const a = up.y + y < lo.H ? lo.tiles[(up.y + y) * lo.W + up.x + x] : t[y][x], b = hi.tiles[(down.y + y) * hi.W + down.x + x];
      assert.equal(a, t[y][x], `below, at ${x},${y}`); assert.equal(b, t[y][x], `above, at ${x},${y}`); }
  });
  test(`${name}: from its middle nothing but the sill is in view`, () => {
    const halfW = VIEW_H / 2 * 16 / 9, lead = 2.4, band = 1, edge = 0.85;   // the view's half width; how far the view runs ahead of him; how far past the middle he is when the regions change; the painting's broken edge
    assert.ok(SILL.w * T / 2 >= halfW + lead + band + edge, 'to either side');
    assert.ok(SILL.floor * T >= VIEW_H / 2 - 1.8 + edge, 'below his feet'); assert.ok((SILL.h - SILL.floor) * T >= VIEW_H / 2 + 1.8 + 0.6 + edge, 'over his head, at the top of a jump');
    const t = sill(k), mid = SILL.w >> 1; for (let x = mid - 6; x <= mid + 6; x++){ assert.equal(t[SILL.floor - 1][x], ROCK, 'its floor is level in the middle'); assert.equal(t[SILL.floor][x], EMPTY); assert.equal(t[SILL.floor + SILL.tall][x], ROCK, 'and its roof'); }
  });
  test(`${name}: the way out of the hall below is stone until its keeper falls`, () => {
    const at = (i, j) => lo.tiles[j * lo.W + i];
    if (k === 1) assert.ok(lo.tiles.some((v, q) => v === CRACKED && Math.abs((q % lo.W) - (up.x + SILL.w + 8)) < 3), 'the Roots: the niche\'s cracked wall (the spade opens it)');
    else { assert.ok(up.seal.length >= 6, 'a seal'); for (const id of up.seal){ const [i, j] = id.split(',').map(Number); assert.equal(at(i, j), CRACKED, `seal at ${id}`); } }
    const ex = lo.marks.find(m => m.type === 'exit'); assert.ok(ex && ex.join, 'no beacon: the way on is walked'); assert.equal(ex.x, up.x + (SILL.w >> 1));
  });
  test(`${name}: the region above was moved as the save's move says`, () => assert.deepEqual(JOIN_MOVED[k], [hi.X0, hi.Y0]));
}
test('the summit keeps its beacon (the end of the climb)', () => { const ex = L[LV.CLIMB_TOP].marks.find(m => m.type === 'exit'); assert.ok(ex && !ex.join); });
