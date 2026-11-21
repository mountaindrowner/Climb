// A keeper's hall is its own (build 81). The second playtest: creatures of the Spires followed him into the Wyrm's
// fight. While a keeper stands, a creature that lives outside its hall and has come in is put back where it lives;
// what lives in the hall stays.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './helpers/browser.mjs';
const { keepOut } = await import('../src/side/enemies.js');
test('a creature from outside the hall is sent home; one that lives in it stays', () => {
  const room = { x0: 10, x1: 30, y0: 5, y1: 15 };
  const mk = (hx, hy, x, y, alive = true) => ({ alive, home: { x: hx, y: hy }, x, y, vx: 3, vy: -1, st: 'chase', tm: 2 });
  const out = mk(4, 6, 12, 6), own = mk(20, 6, 22, 7), away = mk(4, 6, 8, 6), dead = mk(4, 6, 12, 6, false);
  assert.equal(keepOut({ list: [out, own, away, dead] }, room), 1);
  assert.deepEqual([out.x, out.y, out.st, out.vx], [4, 6, 'idle', 0], 'the one that came in is home, and at rest');
  assert.deepEqual([own.x, own.st], [22, 'chase'], 'the hall\'s own is left alone');
  assert.deepEqual([away.x, away.st], [8, 'chase'], 'one still outside is left alone');
  assert.equal(dead.x, 12, 'a dead one is not moved');
});
