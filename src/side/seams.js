// The seams (docs/world.md): between two regions, a short way of its own that is neither and both. Each is built under
// the region above's first room (level.js build: the region is moved up `rows` rooms and these go beneath it), he comes
// up into it from the region below, it wears that region's look at its foot and the region above's at its head, and a
// hole cut through the floor at `link` (tile columns of the first room, boarded over) lets him up into the region.
// title: what the place line says there. By region index: 1 the Crypt Stair (into the Cloister), 2 the Bell Road (the
// Spires), 3 the Last Hut (the Tempest), 4 the Breach (the Gardens), 5 the Long Stair (the Firmament).
import { room, rect, walls, door, ledge, mark, stairs, EMPTY, LEDGE, SPIKES, CRACKED } from './rooms.js';

// the way up to a hole in the roof: ledges stacked in the hole's own columns, a jump apart (from beside it, the hole's
// rock edge is in the way of a jump), from row y0 to just under the roof
const shaftUp = (r, x0, x1, y0, top) => { for (let y = y0; y <= top; y += 4) ledge(r, x0, x1, y); keepUp(r, x0 + 1, x1 - 1, y0 + 1, top); };
// a column of 'keep' marks, so the wear on the rock leaves the way up through a hole open
const keepUp = (r, x0, x1, y0, y1) => { for (let y = y0; y <= y1; y += 3) for (const x of [x0, x1]) mark(r, 'keep', x, y); };
const titled = (fn, title) => { const f = () => { const r = fn(); r.title = title; return r; }; Object.defineProperty(f, 'name', { value: fn.name }); return f; };

// ---- the Crypt Stair: the house's old way down to the water, its founders buried along it, oldest lowest. Water runs
// down it; it is dark at the foot and lit at the head, where the house's light comes down to meet him
function cryptfoot(){
  const r = room(); walls(r); door(r, 'top', 30, 35);
  rect(r, 8, 1, 22, 1, EMPTY); mark(r, 'pool', 8, 1, { w: 15, look: 'arch' });   // the water, run down the stair and pooled under the founders' niche: the Cloister's raising water
  stairs(r, 24, 2, 3, 1, 2);                                                   // the first worn steps
  shaftUp(r, 30, 35, 6, 18);                                                  // up to the stair's mouth
  mark(r, 'spawn', 4, 2); mark(r, 'crystal', 14, 2); mark(r, 'urn', 26, 4); mark(r, 'flitter', 18, 14);
  return r;
}
function founders(){
  const r = room(1, 2); walls(r); door(r, 'bottom', 30, 35); ledge(r, 30, 35, 1);
  // the founders' tombs in the walls, one over another, each a niche of rock with a light in it
  for (const [x, y] of [[2, 9], [36, 15], [2, 21], [36, 27], [2, 33], [36, 39]]){ rect(r, x, y, x + 1, y + 3); mark(r, 'crystal', x < 20 ? x + 3 : x - 2, y); }
  for (const [x0, x1, y] of [[22, 28, 7], [12, 18, 12], [22, 28, 17], [12, 18, 22], [22, 28, 27]]){ ledge(r, x0, x1, y); mark(r, 'keep', x0 + 2, y + 2); }
  shaftUp(r, 29, 35, 31, 43);
  mark(r, 'torch', 6, 30); mark(r, 'torch', 33, 34); mark(r, 'torch', 8, 40); mark(r, 'torch', 34, 43);   // the light comes down from the house
  mark(r, 'urn', 25, 18); mark(r, 'urn', 14, 23); mark(r, 'chest', 25, 28, { holds: 'shards' }); mark(r, 'flitter', 20, 36);
  return r;
}

// ---- the Bell Road: the pilgrims' road up from the house's gate to the pass, a shrine at its turn
function gate(){
  const r = room(); walls(r); door(r, 'top', 30, 35);
  rect(r, 14, 2, 17, 6); rect(r, 14, 16, 17, 20);                 // the gate's two posts, and its lintel over
  rect(r, 20, 1, 27, 1, EMPTY); mark(r, 'pool', 20, 1, { w: 8, look: 'ice' });   // meltwater under the gate: the Spires' raising water
  ledge(r, 22, 28, 7); shaftUp(r, 30, 35, 10, 18);
  mark(r, 'spawn', 5, 2); mark(r, 'torch', 12, 8); mark(r, 'torch', 19, 8); mark(r, 'urn', 8, 2); mark(r, 'urn', 34, 2);
  return r;
}
function road(){
  const r = room(1, 2); walls(r); door(r, 'bottom', 30, 35); ledge(r, 30, 35, 1);
  // the road: a worn stair up from the gate, then switchbacks up the face, a landing at each turn
  stairs(r, 24, 2, 6, -1, 2);
  for (const [x0, x1, y] of [[4, 12, 8], [14, 20, 12], [20, 32, 16], [10, 18, 20], [20, 26, 24], [24, 28, 28]]){ ledge(r, x0, x1, y); mark(r, 'keep', x0 + 2, y + 2); }
  mark(r, 'shrine', 25, 17);                                     // the turn: water seeps through the road here (a leak)
  shaftUp(r, 29, 35, 31, 43);
  mark(r, 'harpy', 20, 34); mark(r, 'urn', 6, 9); mark(r, 'chest', 30, 17, { holds: 'shards' });
  mark(r, 'torch', 6, 26); mark(r, 'torch', 36, 36);
  return r;
}

// ---- the Last Hut: the climbers' last shelter below the storm, a fire kept in it; everything in it says stay
function path(){
  const r = room(); walls(r); door(r, 'top', 30, 35);
  rect(r, 20, 2, 39, 3); rect(r, 26, 4, 39, 5);                    // the path climbing the scree
  shaftUp(r, 30, 35, 10, 18);
  rect(r, 8, 1, 15, 1, EMPTY); mark(r, 'pool', 8, 1, { w: 8, look: 'pipe' });   // rain off the scree, caught by the climbers' pipe: the Tempest's raising water
  mark(r, 'spawn', 5, 2); mark(r, 'yeti', 33, 6); mark(r, 'urn', 24, 4); mark(r, 'crystal', 18, 2);   // the yeti up the scree, not by the water
  return r;
}
function hut(){
  const r = room(1, 2); walls(r); door(r, 'bottom', 30, 35); ledge(r, 30, 35, 1);
  rect(r, 2, 2, 39, 3); rect(r, 30, 2, 35, 3, EMPTY); rect(r, 30, 3, 35, 3, LEDGE);   // the hut's floor, over the cellar he came up through
  ledge(r, 4, 10, 8); ledge(r, 4, 10, 12);                        // the bunks
  mark(r, 'shrine', 18, 4);                                       // the hut's roof lets the water through, into a bowl (a leak)
  for (const [x0, x1, y] of [[22, 28, 9], [12, 18, 14], [22, 28, 19], [12, 18, 24]]){ ledge(r, x0, x1, y); mark(r, 'keep', x0 + 2, y + 2); }   // the ladder up the loft, to the door
  ledge(r, 20, 28, 28); shaftUp(r, 29, 35, 31, 43);
  mark(r, 'torch', 14, 9); mark(r, 'torch', 34, 12); mark(r, 'torch', 30, 32);
  mark(r, 'urn', 6, 13); mark(r, 'urn', 26, 4); mark(r, 'chest', 6, 9, { holds: 'shards' });
  return r;
}

// ---- the Breach: the garden wall, where the storm broke through the night it came; storm and garden both
function wallfoot(){
  const r = room(); walls(r); door(r, 'top', 30, 35);
  rect(r, 18, 2, 23, 4); rect(r, 26, 2, 29, 7);                    // the fallen wall's stones
  shaftUp(r, 30, 35, 10, 18);
  rect(r, 7, 1, 14, 1, EMPTY); mark(r, 'pool', 7, 1, { w: 8, look: 'spout' });   // the garden's own spring, out of the broken wall: the Gardens' raising water
  mark(r, 'spawn', 5, 2); mark(r, 'squall', 31, 2); mark(r, 'urn', 20, 5); mark(r, 'crystal', 34, 2);
  return r;
}
function breach(){
  const r = room(1, 2); walls(r); door(r, 'bottom', 30, 35); ledge(r, 30, 35, 1);
  // the wall itself, broken through: its courses standing either side, rubble heaped in the gap
  rect(r, 2, 2, 9, 30); rect(r, 37, 24, 39, 44);
  rect(r, 10, 2, 16, 5); rect(r, 17, 2, 21, 9); rect(r, 22, 2, 25, 4);
  for (const [x0, x1, y] of [[18, 24, 14], [24, 30, 19], [16, 22, 23], [22, 28, 27]]){ ledge(r, x0, x1, y); mark(r, 'keep', x0 + 2, y + 2); }
  shaftUp(r, 28, 35, 31, 43);
  mark(r, 'lasher', 13, 6); mark(r, 'puff', 20, 30); mark(r, 'nimbus', 26, 36);
  mark(r, 'torch', 12, 12); mark(r, 'torch', 28, 26); mark(r, 'urn', 23, 5); mark(r, 'chest', 17, 24, { holds: 'shards' });
  return r;
}

// ---- the Long Stair: the keepers' stair to the summit, a step for every day of the year, swept
function stairfoot(){
  const r = room(); walls(r); door(r, 'top', 8, 13);
  stairs(r, 16, 2, 9, 1, 2); rect(r, 34, 2, 37, 10);              // the first flight, to the wall
  shaftUp(r, 8, 13, 6, 18);                                       // and up from its foot to the next
  rect(r, 6, 1, 13, 1, EMPTY); mark(r, 'pool', 6, 1, { w: 8, look: 'ring' });   // a still pool at the stair's foot, the stars in it: the Firmament's raising water
  mark(r, 'spawn', 5, 2); mark(r, 'urn', 36, 11); mark(r, 'crystal', 34, 11);
  return r;
}
function flights(){
  const r = room(1, 2); walls(r); door(r, 'bottom', 8, 13); ledge(r, 8, 13, 1);
  // flight after flight, turning at each landing, the sky darkening into stars as it goes
  stairs(r, 14, 2, 10, 1, 2); rect(r, 34, 2, 37, 11);
  for (const [x0, x1, y] of [[26, 32, 15], [18, 24, 19], [10, 16, 23], [18, 24, 27]]){ ledge(r, x0, x1, y); mark(r, 'keep', x0 + 2, y + 2); }   // the landings, turning
  shaftUp(r, 8, 13, 31, 43);                                        // to the top step
  mark(r, 'mote', 30, 26); mark(r, 'mote', 24, 40); mark(r, 'urn', 36, 12); mark(r, 'chest', 12, 24, { holds: 'shards' });
  mark(r, 'torch', 36, 16); mark(r, 'torch', 6, 26); mark(r, 'torch', 34, 40);
  return r;
}

export const SEAMS = {
  1: { rows: 3, link: [30, 35], layout: [[0, 0, titled(cryptfoot, 'THE CRYPT STAIR')], [0, 1, titled(founders, 'THE CRYPT STAIR'), 1, 2]] },
  2: { rows: 3, link: [30, 35], layout: [[0, 0, titled(gate, 'THE BELL ROAD')], [0, 1, titled(road, 'THE BELL ROAD'), 1, 2]] },
  3: { rows: 3, link: [30, 35], layout: [[0, 0, titled(path, 'THE LAST HUT')], [0, 1, titled(hut, 'THE LAST HUT'), 1, 2]] },
  4: { rows: 3, link: [30, 35], layout: [[0, 0, titled(wallfoot, 'THE BREACH')], [0, 1, titled(breach, 'THE BREACH'), 1, 2]] },
  5: { rows: 3, link: [8, 13], layout: [[0, 0, titled(stairfoot, 'THE LONG STAIR')], [0, 1, titled(flights, 'THE LONG STAIR'), 1, 2]] },
};
