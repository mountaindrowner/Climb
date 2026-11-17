// The people are there when he needs them (phase 8, docs/phase8-sheet.md). Every meeting is one of three kinds
// (level.js MEETINGS), and each kind has its rule:
//   story    on the main path: going by them adds almost nothing to the way from the region's start to its keeper
//   service  Ordric, beside the region's raising water: a few seconds from where he is raised
//   extra    a place of their own (a nook): off the path, but reached with the gifts he has there
// All played with the real motor (tests/helpers/reach.mjs), with the gifts he arrives with.
import { test } from 'node:test';
import assert from 'node:assert/strict';
const R = await import('./helpers/reach.mjs');
const { MEETINGS } = await import('../src/side/level.js');
const DETOUR = 20, NEAR = 6;   // units a story meeting may add to the way (under three seconds); seconds Ordric may be from the water
for (let N = 0; N < 6; N++){
  const name = R.LEVELS[N].name;
  test(`${name}: story meetings are on the path, Ordric is by the water, their own places can be reached`, () => {
    const G = R.graph(N, R.arrival(N)), goal = R.goalOf(G.marks), sp = G.marks.find(m => m.type === 'spawn'), pool = G.marks.find(m => m.type === 'pool' && !m.plain);
    const at = m => (i, j) => Math.abs(i - m.x) < 4 && Math.abs(j - m.y) < 3, base = R.runback(G, sp, R.nearGoal(goal)); assert.ok(base, 'the keeper can be reached');
    const people = G.marks.filter(m => m.type === 'npc'); assert.deepEqual(people.map(m => m.who).sort(), Object.keys(MEETINGS[N]).sort(), 'everyone the region should have');
    for (const m of people){
      const kind = MEETINGS[N][m.who], to = R.runback(G, sp, at(m)); assert.ok(to, `${m.who} cannot be reached with the gifts he has here`);
      if (kind === 'story'){ const on = R.runback(G, m, R.nearGoal(goal)); assert.ok(on, `${m.who}: no way on from them`); const extra = to.units + on.units - base.units; assert.ok(extra <= DETOUR, `${m.who} (story) is ${extra.toFixed(0)} units off the path`); assert.ok(!m.extra, `${m.who} (story) is in a nook`); }
      if (kind === 'service'){ assert.ok(pool, 'a raising water'); const w = R.runback(G, { x: pool.x + Math.floor((pool.w || 8) / 2), y: pool.y }, at(m)); assert.ok(w && w.secs <= NEAR, `${m.who} is ${w ? w.secs.toFixed(0) + ' s' : 'cut off'} from the water`); }
      if (kind === 'extra'){ assert.ok(m.extra, `${m.who} (their own place) has no nook`); const r = G.rooms.find(q => q.name === 'nook' && m.x >= q.tx0 && m.x < q.tx1 && m.y >= q.ty0 && m.y < q.ty1); assert.ok(r && r.title, 'it is a room of its own, named'); }
    }
  });
}
