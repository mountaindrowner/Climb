// The map pass (docs/map-pass-sheet.md): height is changed by the shape of the place, not by planks hung in the air.
// Each level has a budget of one-way platforms, of platforms that touch nothing, and of rock that hangs in the air.
// A level that has had its pass is held to what the pass left; one that has not is held to what it has now, so it
// cannot get worse before its turn. When a level has its pass, its line here comes down with it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLevel, LEVELS } from '../src/side/level.js';
import { tally, islands, platforms } from './helpers/platforms.mjs';

//                planks, of them touching nothing, rock in the air, has had its pass
const BUDGET = {
  'The Roots':          [17, 2, 0, true],
  'The Cloister':       [49, 10, 2, true],     // (build 101, its pass: 122 planks became 49. The two pieces of rock in the air are the pit's tongues' brackets: each tongue swings from the first rock over it)
  'The Spires':         [116, 67, 4],     // (+3 and +3, build 97: the Wyrm's hall, the broken pass: two shelves beside the gap and the slab over it, in the air by design, approved in docs/wyrm-sheet.md)
  'The Tempest':        [72, 43, 9],
  'The Gardens':        [117, 85, 8],
  'The Firmament':      [70, 50, 0],
  'The Workings':       [47, 44, 0],
  'The Vein':           [43, 33, 2],
  'The Flooded Levels': [10, 8, 0],
  'The Great Shaft':    [9, 1, 0],
  'The Hollow':         [13, 10, 0],
};
const screens = N => { const { rooms } = { ...loadLevel(N) }; let s = 0; for (const r of rooms) s += Math.round((r.tx1 - r.tx0) / 40) * Math.round((r.ty1 - r.ty0) / 23); return s; };

for (let N = 0; N < LEVELS.length; N++){ const name = LEVELS[N].name, B = BUDGET[name];
  test(`${name}: no more platforms than its budget`, () => {
    assert.ok(B, 'a new level states its budget');
    const t = tally(N), isl = islands(N).length;
    assert.ok(t.all <= B[0], `${t.all} one-way platforms (budget ${B[0]})`);
    assert.ok(t.free <= B[1], `${t.free} platforms that touch nothing (budget ${B[1]})`);
    assert.ok(isl <= B[2], `${isl} pieces of rock hanging in the air (budget ${B[2]})`);
  });
  if (B && B[3]) test(`${name}, after its pass: under one platform a screen, and each has a reason`, () => {
    const t = tally(N), sc = screens(N);
    assert.ok(t.all < sc, `${t.all} platforms in ${sc} screens`);
    // what is left is a rung (set from wall to wall), a step off a wall, or a staging on posts: never bare in the air
    const { W, tiles } = { ...loadLevel(N) }, rockUnder = (i, j) => { for (let d = 1; d <= 8; d++){ const v = tiles[(j - d) * W + i]; if (v === 1) return true; if (v !== 0) return false; } return false; };
    for (const p of platforms(N).filter(p => p.kind === 'free')) assert.ok(rockUnder(p.x0, p.y) && rockUnder(p.x1, p.y), `the platform at ${p.x0}-${p.x1}, ${p.y} stands on nothing (a post needs ground within eight tiles under each end)`);
  });
}
