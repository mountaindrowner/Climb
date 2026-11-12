// What there is to find is all there, in every region: one relic (a known one, no two regions the same), two scarf
// threads, the three people once each, and every urn, chest and person standing on something with room over it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS, loadLevel, ROCK, LEDGE } from '../src/side/level.js';
import { RELICS, TEACH } from '../src/side/state.js';
import { SCRIPT, PEOPLE } from '../src/side/talk.js';

const relics = [];
for (let N = 0; N < LEVELS.length; N++){
  const { W, H, tiles, marks } = { ...loadLevel(N) }, NAME = LEVELS[N].name;
  const at = (i, j) => i < 0 || j < 0 || i >= W || j >= H ? ROCK : tiles[j * W + i];
  test(`${NAME}: a relic, two threads, the three people`, () => {
    const chests = marks.filter(m => m.type === 'chest'), rel = chests.filter(m => /^relic:/.test(m.holds || ''));
    assert.equal(rel.length, 1, 'one relic'); const id = rel[0].holds.slice(6); assert.ok(RELICS[id], `relic ${id} is not a known one`); relics.push(id);
    assert.equal(marks.filter(m => m.type === 'thread').length + chests.filter(m => m.holds === 'thread').length, 2, 'two threads');
    for (const who of Object.keys(PEOPLE)){ assert.equal(marks.filter(m => m.type === 'npc' && m.who === who).length, 1, `${who} once`); assert.ok((SCRIPT[who][N] || []).length, `${who} has something to say here`); }
    for (const m of chests) assert.ok(!m.holds || m.holds === 'shards' || m.holds === 'thread' || /^relic:/.test(m.holds), `a chest holds ${m.holds}`);
  });
  test(`${NAME}: every urn, chest and person stands on something, with room over it`, () => {
    for (const m of marks.filter(m => ['urn', 'chest', 'npc'].includes(m.type))){
      const under = at(m.x, m.y - 1); assert.ok(under === ROCK || under === LEDGE, `${m.type} at ${m.x},${m.y} stands on nothing`);
      for (let d = 0; d < (m.type === 'npc' ? 4 : 2); d++) assert.notEqual(at(m.x, m.y + d), ROCK, `${m.type} at ${m.x},${m.y} is in rock`);
    }
  });
}
test('no relic is in two regions, and every keeper leaves something', () => { assert.equal(new Set(relics).size, relics.length); assert.equal(TEACH.length, LEVELS.length); });
