// Everything placed where it makes sense (phase 1, from the playtests): what clings has something to cling to; a
// gargoyle's perch is stone out of a real wall, or a plinth on rock, and never by one of the people.
import { test } from 'node:test';
import assert from 'node:assert/strict';
const { loadLevel, LEVELS, CLINGS } = await import('../src/side/level.js');
const ROCK = 1, CRACKED = 4;
for (let n = 0; n < LEVELS.length; n++){
  const L = loadLevel(n), W = L.W, rock = (i, j) => i < 0 || j < 0 || i >= W || j >= L.H || L.tiles[j * W + i] === ROCK || L.tiles[j * W + i] === CRACKED;
  test(`${LEVELS[n].name}: what clings has a wall or a roof to cling to`, () => {
    for (const m of L.marks){ const kind = CLINGS[m.type]; if (!kind) continue;
      let wall = false; for (let d = 1; d <= 12 && !wall; d++) wall = rock(m.x - d, m.y + 1) || rock(m.x + d, m.y + 1);
      let roof = false; for (let d = 1; d <= 17 && !roof; d++) roof = rock(m.x, m.y + d);
      assert.ok(kind === 'wall' ? wall : roof || wall, `${m.type} at ${m.x},${m.y} has nothing to cling to`); }
  });
  test(`${LEVELS[n].name}: every gargoyle perches on stone, away from the people`, () => {
    const people = L.marks.filter(k => k.type === 'npc');
    for (const m of L.marks.filter(k => k.type === 'gargoyle')){
      const p = m.perch; assert.ok(p, `gargoyle at ${m.x},${m.y} has no perch`);
      if (p.side) assert.ok(rock(p.wall, p.y - 1), `its corbel at ${p.x},${p.y} comes out of rock`);
      else for (const dx of [-1, 0, 1]) assert.ok(rock(p.x + dx, p.base - 1), `its plinth at ${p.x} stands on rock, not a plank or air`);
      for (const k of people) assert.ok(Math.abs(k.x - p.x) >= 8 || Math.abs(k.y - p.y) >= 12, `the perch at ${p.x},${p.y} is by ${k.who}`);
    }
  });
}
