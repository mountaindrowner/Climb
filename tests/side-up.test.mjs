// Up (decided 22 Nov 2026): W and the up arrow are not a second jump. Up looks up, and a strike with up held is
// struck upward: it finds what is over him, not what is in front of him.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './helpers/browser.mjs';
const { DEFAULTS } = await import('../src/core/settings.js'); const { ACTIONS } = await import('../src/core/input.js'); const { strikeEnemies } = await import('../src/side/enemies.js');
test('Space alone jumps; W and the up arrow are up', () => {
  assert.deepEqual(DEFAULTS.keys.jump, ['Space']); assert.deepEqual(DEFAULTS.keys.up, ['KeyW', 'ArrowUp']); assert.ok(ACTIONS.includes('up'));
  const all = Object.values(DEFAULTS.keys).flat(); assert.equal(new Set(all).size, all.length, 'no key does two things');
});
test('a strike with up held finds what is over him; without it, what is in front', () => {
  const mk = (x, y) => ({ alive: true, d: { ai: 'none', w: 0.8, h: 1.2, fly: true }, x, y, hp: 9, st: 'idle', flash: 0, home: { x, y } });
  const P = { x: 10, y: 5, face: 1 };
  for (const [up, hitAbove, hitFront] of [[true, true, false], [false, false, true]]){
    const above = mk(10.2, 9), front = mk(11.6, 6), E = { list: [above, front] }; strikeEnemies(E, P, 2.1, 1, [], up);
    assert.equal(above.hp < 9, hitAbove, `up ${up}: the one over him`); assert.equal(front.hp < 9, hitFront, `up ${up}: the one in front`); }
});
