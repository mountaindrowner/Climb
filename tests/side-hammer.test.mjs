// The hammer (build 86, decision 0.14): the heavy weapon is a sledge. What makes it worth choosing over the blade: three
// times the damage a blow, a wider arc, and what it hits is knocked back and stopped a breath. Not the wings' elites.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './helpers/browser.mjs';
const R = await import('./helpers/reach.mjs'); const M = await import('../src/side/motor.js'); const { strikeEnemies } = await import('../src/side/enemies.js'); const LV = await import('../src/side/level.js');
test('the hammer does three times the blade\'s damage a blow, slower, and says it is a hammer', () => {
  assert.match(M.SPADE.name, /hammer/i);
  M.SPADE.combo.forEach((s, i) => { assert.ok(s.dmg >= 3 * M.BLADE.combo[i].dmg, `blow ${i + 1}: ${s.dmg} against the blade's ${M.BLADE.combo[i].dmg}`); assert.ok(s.wind > M.BLADE.combo[i].wind, `blow ${i + 1} is slower to come`); });
  assert.ok(M.SPADE.knock > 0 && M.SPADE.stagger > 0 && M.SPADE.wide && M.SPADE.guard === false);
});
test('a blow knocks a small creature back and stops it; an elite stands; the arc reaches a little behind him', () => {
  R.loadLevel(0); const L = LV.LEVEL, W = L.W, T = R.T;
  // a stretch of open air, eight tiles clear to the right of where the creature will be
  let at = null; for (let y = 4; y < L.H - 4 && !at; y++) for (let x = 4; x < W - 14; x++){ let ok = true; for (let i = -3; i < 12 && ok; i++) for (let j = -1; j <= 2; j++) if (L.tiles[(y + j) * W + x + i] !== 0) ok = false; if (ok){ at = [x, y]; break; } }
  assert.ok(at, 'somewhere open to test in'); const px = (at[0] + 0.5) * T, py = at[1] * T;
  const mk = (dx, hp) => ({ alive: true, d: { ai: 'none', w: 0.6, h: 1, fly: true, hp }, x: px + dx, y: py + 0.5, hp, st: 'idle', flash: 0, home: { x: px + dx, y: py + 0.5 } });
  const small = mk(1.5, 4), elite = mk(1.5, 22), behind = mk(-0.9, 4), P = { x: px, y: py, face: 1 };
  strikeEnemies({ list: [small] }, P, M.SPADE.reach, 3, [], false, M.SPADE);
  assert.ok(small.x > px + 1.5 + 1, `knocked back: from ${(px + 1.5).toFixed(1)} to ${small.x.toFixed(1)}`); assert.ok(small.stilled > 0, 'and stopped a breath'); assert.equal(small.hp, 1);
  strikeEnemies({ list: [elite] }, P, M.SPADE.reach, 3, [], false, M.SPADE); assert.ok(elite.x - (px + 1.5) < 0.8 && small.x - elite.x > 1, `an elite is not knocked back (it only gives the little any blow moves it: ${(elite.x - px - 1.5).toFixed(2)})`); assert.ok(!elite.stilled, 'nor stopped'); assert.ok(elite.hp < 22, 'but it is hurt');
  strikeEnemies({ list: [behind] }, P, M.SPADE.reach, 3, [], false, M.SPADE); assert.ok(behind.hp < 4, 'the hammer\'s arc takes one a little behind him');
  const behind2 = mk(-0.9, 4); strikeEnemies({ list: [behind2] }, P, M.BLADE.reach, 1, []); assert.equal(behind2.hp, 4, 'the blade\'s does not');
});
