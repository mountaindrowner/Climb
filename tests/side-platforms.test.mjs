// The map pass (docs/map-pass-sheet.md): height is changed by the shape of the place, not by planks hung in the air.
// Each level has a budget of one-way platforms, of platforms that touch nothing, and of rock that hangs in the air.
// A level that has had its pass is held to what the pass left; one that has not is held to what it has now, so it
// cannot get worse before its turn. When a level has its pass, its line here comes down with it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLevel, LEVELS } from '../src/side/level.js';
import { ORG115 } from '../src/side/state.js';
import { tally, islands, platforms } from './helpers/platforms.mjs';

//                planks, of them touching nothing, rock in the air, has had its pass
const BUDGET = {
  'The Roots':          [21, 2, 0, true],   // (build 107: the culvert's three rungs, and the boards in the pool's floor. The water stair stands over the culvert, joined to the walls by the stone of the gates at either end of it: build 108)
  'The Cloister':       [49, 10, 2, true],     // (build 101, its pass: 122 planks became 49. The two pieces of rock in the air are the pit's tongues' brackets: each tongue swings from the first rock over it)
  'The Spires':         [90, 28, 3, 'reasons'],   // (build 102, its pass: 116 planks became 90 and every one has a reason, but it is NOT under one a screen (56): what is left is ladders in the towers' clefts and two rope bridges. The three pieces of rock in the air are walls over doorways and the rock adrift that holds a thread: docs/map-pass-sheet.md, "The Spires, room by room")
  'The Tempest':        [50, 9, 7, true],   // (build 103, its pass: 72 planks became 50, in 51 screens; bare in the air, 29 became none. The seven pieces of rock in the air are named in docs/map-pass-sheet.md, "The Tempest, room by room")
  'The Gardens':        [46, 3, 7, true],   // (build 104, its pass: 117 planks became 46, in 47 screens; bare in the air, 85 became none. The seven pieces of rock in the air are the hanging gardens' own terraces and the aqueduct's spans: docs/map-pass-sheet.md, "The Gardens, room by room")
  'The Firmament':      [30, 6, 0, true],   // (build 105, its pass: 68 planks became 30, in 40 screens; bare in the air, 24 became none. The star-glass is not planks and is as it was)
  'The Workings':       [11, 4, 0, true],   // (build 106, the Deep's pass: 47 planks became 11, in 14 screens)
  'The Vein':           [9, 0, 2, true],    // (build 106: 43 became 9, in 12 screens. The two pieces of rock in the air are the knot's two floors, each cut through by its shafts)
  'The Flooded Levels': [10, 7, 0, true],   // (build 106: one plank in the air made a step off a pillar; the rest stood on posts already)
  'The Great Shaft':    [3, 0, 0, true],    // (build 106: six of its eight stages are ledges of the shaft's rock; two are planks still, off the bank's wall and off a rib of the head's shelf)
  'The Hollow':         [6, 2, 0, true],    // (build 106: 13 became 6)
};
// a rope bridge: boards along one row, no gap between one and the next wider than three tiles, its two ends on rock
// (rock beside the end board, no more than three tiles off along the row, or right under it). Each board of it is
// held, by the rope, from the rock at the ends
function bridged(all, p, tiles, W){
  const row = all.filter(q => q.y === p.y).sort((a, b) => a.x0 - b.x0), k = row.indexOf(p);
  let a = k, b = k; while (a > 0 && row[a].x0 - row[a - 1].x1 - 1 <= 3) a--; while (b < row.length - 1 && row[b + 1].x0 - row[b].x1 - 1 <= 3) b++;
  if (a === b) return false;
  const rock = i => tiles[p.y * W + i] === 1, under = i => tiles[(p.y - 1) * W + i] === 1, near = (i, d) => [1, 2, 3, 4].some(k => rock(i + d * k));
  const left = near(row[a].x0, -1) || under(row[a].x0), right = near(row[b].x1, 1) || under(row[b].x1);
  return left && right;
}
// one board in the air, by design and approved: the Wyrm's slab over the broken pass (docs/wyrm-sheet.md)
const ALLOWED = [{ level: 'The Spires', x0: 153, y: 336 }];   // (290 before every level was lifted 46 rows, build 115. x0 as build 115 had the level: what it has grown west by since is added, state.js ORG115)
const screens = N => { const { rooms } = { ...loadLevel(N) }; let s = 0; for (const r of rooms) s += Math.round((r.tx1 - r.tx0) / 40) * Math.round((r.ty1 - r.ty0) / 23); return s; };

for (let N = 0; N < LEVELS.length; N++){ const name = LEVELS[N].name, B = BUDGET[name];
  test(`${name}: no more platforms than its budget`, () => {
    assert.ok(B, 'a new level states its budget');
    const t = tally(N), isl = islands(N).length;
    assert.ok(t.all <= B[0], `${t.all} one-way platforms (budget ${B[0]})`);
    assert.ok(t.free <= B[1], `${t.free} platforms that touch nothing (budget ${B[1]})`);
    assert.ok(isl <= B[2], `${isl} pieces of rock hanging in the air (budget ${B[2]})`);
  });
  // B[3] true: the pass is done, and the level is under one platform a screen. 'reasons': the pass is done and every
  // platform has a reason, but the level is over one a screen, said so in its budget's note (the count is not bent)
  if (B && B[3]) test(`${name}, after its pass: ${B[3] === true ? 'under one platform a screen, and ' : ''}each has a reason`, () => {
    const t = tally(N), sc = screens(N);
    if (B[3] === true) assert.ok(t.all < sc, `${t.all} platforms in ${sc} screens`);
    // what is left is a rung (set from wall to wall), a step off a wall, a staging on posts, or a board of a rope
    // bridge: never bare in the air
    const LN = loadLevel(N), GREW = [(LN.X0 || 0) - ORG115[N][0], (LN.Y0 || 0) - ORG115[N][1]], { W, tiles } = { ...LN }, rockUnder = (i, j) => { for (let d = 1; d <= 8; d++){ const v = tiles[(j - d) * W + i]; if (v === 1) return true; if (v !== 0) return false; } return false; };
    const all = platforms(N), held = p => p.kind !== 'free' || rockUnder(p.x0, p.y) && rockUnder(p.x1, p.y) || bridged(all, p, tiles, W) || ALLOWED.some(a => a.level === name && a.x0 + GREW[0] === p.x0 && a.y + GREW[1] === p.y);
    for (const p of all) assert.ok(held(p), `the platform at ${p.x0}-${p.x1}, ${p.y} stands on nothing (a post needs ground within eight tiles under each end)`);
  });
}
