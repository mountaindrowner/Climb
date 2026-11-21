// Where a keeper's hall shuts (build 78). A way up through the floor is shut at its mouth, in sight, where he came
// out of it. A stone step left in the Warden's shaft (build 76) had put its seal at the bottom of the hole instead:
// the barrier was out of sight and the hole open to fall into, mid-fight.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLevel, LEVELS, ROCK } from '../src/side/level.js';
import { openings } from '../src/side/seal.js';

for (let N = 0; N < LEVELS.length; N++){
  const L = { ...loadLevel(N) }, b = L.marks.find(m => m.type === 'boss'); if (!b) continue;
  const r = L.rooms.find(r => b.x >= r.tx0 && b.x < r.tx1 && b.y >= r.ty0 && b.y < r.ty1), at = (i, j) => L.tiles[j * L.W + i];
  test(`${LEVELS[N].name}: a way up through the floor of the keeper's hall is shut at its mouth`, () => {
    loadLevel(N); const outs = openings(r).filter(o => o.side === 'b');
    for (const o of outs){ const xs = o.cells.map(c => c[0]), top = Math.max(...o.cells.map(c => c[1])), a = Math.min(...xs) - 1, z = Math.max(...xs) + 1;
      // over the seal the shaft has ended: beside its top row there is rock, and over that, not on both sides
      assert.ok(at(a, top) === ROCK || at(z, top) === ROCK || top - r.ty0 <= 1, 'the seal is in a shaft');
      assert.ok(at(a, top + 1) !== ROCK || at(z, top + 1) !== ROCK, `the seal at row ${top - r.ty0} is below the mouth of its shaft`);
      for (const [i, j] of o.cells) assert.notEqual(at(i, j), ROCK, 'a seal fills open tiles'); }
  });
}
test('the Warden: the hole in its stage shuts at the stage, not at the bottom of the hole', () => {
  const L = { ...loadLevel(0) }, r = L.rooms.find(q => q.name === 'arena'), o = openings(r).find(o => o.side === 'b');
  assert.ok(o, 'it has a way up through the floor'); assert.equal(Math.max(...o.cells.map(c => c[1])) - r.ty0, 8, 'its seal is level with the stage');
});
