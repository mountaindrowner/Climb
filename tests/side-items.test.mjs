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
// Corwen's Annals cover the whole cast: every creature in a region has an entry somewhere, every entry's creature lives in
// the region it is entered under, and each region's page is its keeper's
test("Corwen's Annals: every creature entered, each under the region it lives in", async () => {
  const { ANNALS } = await import('../src/side/annals.js'), all = new Set(ANNALS.flatMap(a => a.creatures.map(c => c.type)));
  const NOT = new Set(['spawn', 'torch', 'crystal', 'shrine', 'boss', 'exit', 'npc', 'urn', 'chest', 'thread', 'bloom', 'updraft', 'pool', 'bell', 'keep']);
  for (let N = 0; N < LEVELS.length; N++){
    const { marks, theme } = loadLevel(N), here = new Set(marks.filter(m => !NOT.has(m.type)).map(m => m.type));
    for (const t of here) assert.ok(all.has(t), `${t} (in ${LEVELS[N].name}) has no entry`);
    for (const c of ANNALS[N].creatures) assert.ok(here.has(c.type), `${c.type} is entered under ${LEVELS[N].name} but does not live there`);
    assert.equal(ANNALS[N].keeper.theme, theme);
  }
});
test('the three who climb each have a station in a room of their own, never the first', () => {
  for (let N = 0; N < LEVELS.length; N++){
    const { marks, rooms } = loadLevel(N), sp = marks.find(m => m.type === 'spawn'), first = rooms.find(r => sp.x >= r.tx0 && sp.x < r.tx1 && sp.y >= r.ty0 && sp.y < r.ty1);
    const where = marks.filter(m => m.type === 'npc').map(m => { assert.ok(m.station, `${m.who} in ${LEVELS[N].name} has no station`); return rooms.find(r => m.x >= r.tx0 && m.x < r.tx1 && m.y >= r.ty0 && m.y < r.ty1); });
    assert.equal(new Set(where).size, 3, `${LEVELS[N].name}: two of them share a room`); assert.ok(!where.includes(first), `${LEVELS[N].name}: one of them is in the first room`);
  }
});
