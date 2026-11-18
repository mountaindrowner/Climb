// The seams (docs/world.md): between two regions, a short way of its own that is neither and both. Each is built under
// the region above's first room (level.js build: the region is moved up `rows` rooms and these go beneath it), he comes
// up into it from the region below, it wears that region's look at its foot and the region above's at its head, and a
// hole cut through the floor at `link` (tile columns of the first room, boarded over) lets him up into the region.
// title: what the place line says there. By region index: 1 the Crypt Stair (into the Cloister), 2 the Bell Road (the
// Spires), 3 the Last Hut (the Tempest), 4 the Breach (the Gardens), 5 the Long Stair (the Firmament).
import { room, rect, walls, door, ledge, mark, stairs, den, EMPTY, LEDGE, SPIKES, CRACKED } from './rooms.js';

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
  rect(r, 8, 1, 16, 1, EMPTY); mark(r, 'pool', 8, 1, { w: 9, look: 'arch' });   // the water, run down the stair and pooled under the founders' niche: the Cloister's raising water
  // Ordric's lamp-room, at the water's edge: the founders cut one by every water, so a lamp could be kept there. The
  // way up to the stair goes over its roof (a plank over the water first)
  den(r, 18, 27, 2, 6, { open: 'L', back: 2 }); ledge(r, 13, 16, 5);
  shaftUp(r, 30, 35, 6, 18);                                                  // up to the stair's mouth
  mark(r, 'spawn', 4, 2); mark(r, 'crystal', 14, 2); mark(r, 'urn', 36, 2);   // no creature in the water's room
  return r;
}
function founders(){
  const r = room(1, 2); walls(r); door(r, 'bottom', 30, 35); ledge(r, 30, 35, 1);
  // the founders' tombs in the walls, one over another, each a niche of rock with a light in it
  for (const [x, y] of [[2, 9], [36, 15], [2, 21], [36, 27], [2, 33], [36, 39]]){ rect(r, x, y, x + 1, y + 3); mark(r, 'crystal', x < 20 ? x + 3 : x - 2, y); }
  for (const [x0, x1, y] of [[22, 28, 7], [12, 18, 12], [22, 28, 17], [12, 18, 22], [22, 28, 27]]){ ledge(r, x0, x1, y); mark(r, 'keep', x0 + 2, y + 2); }
  shaftUp(r, 29, 35, 31, 43);
  mark(r, 'torch', 6, 30); mark(r, 'torch', 33, 34); mark(r, 'torch', 8, 40); mark(r, 'torch', 34, 43);   // the light comes down from the house
  mark(r, 'urn', 25, 18); mark(r, 'urn', 14, 23); mark(r, 'chest', 25, 28, { holds: 'shards' }); mark(r, 'wisp', 20, 36);
  return r;
}

// ---- the Bell Road: the pilgrims' road up from the house's gate to the pass, a shrine at its turn
function gate(){
  const r = room(); walls(r); door(r, 'top', 30, 35);
  rect(r, 14, 2, 17, 6); rect(r, 14, 16, 17, 20);                 // the gate's two posts, and its lintel over
  rect(r, 20, 1, 27, 1, EMPTY); mark(r, 'pool', 20, 1, { w: 8, look: 'ice' });   // meltwater under the gate: the Spires' raising water
  // Ordric's lamp-room, cut into the gate's own rock beyond the meltwater; the way up is over its roof
  ledge(r, 22, 27, 7); den(r, 28, 37, 2, 6, { open: 'L', back: 0 }); shaftUp(r, 30, 35, 14, 18);
  mark(r, 'spawn', 5, 2); mark(r, 'torch', 12, 8); mark(r, 'torch', 19, 8); mark(r, 'urn', 8, 2); mark(r, 'urn', 37, 2);
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
  rect(r, 20, 2, 39, 9);                                           // the scree, banked against the hut's foot
  den(r, 20, 29, 2, 6, { open: 'L', back: 0 }); ledge(r, 16, 19, 5);   // Ordric's lamp-room, dug into the scree out of the rain; the path goes up over it
  shaftUp(r, 30, 35, 14, 18);
  rect(r, 8, 1, 15, 1, EMPTY); mark(r, 'pool', 8, 1, { w: 8, look: 'pipe' });   // rain off the scree, caught by the climbers' pipe: the Tempest's raising water
  mark(r, 'spawn', 5, 2); mark(r, 'crystal', 18, 2);   // no creature in the water's room: Ordric keeps his lamps on the scree's first step
  return r;
}
function hut(){
  const r = room(1, 2); walls(r); door(r, 'bottom', 30, 35); ledge(r, 30, 35, 1);
  rect(r, 2, 2, 39, 3); rect(r, 30, 2, 35, 3, EMPTY); rect(r, 30, 3, 35, 3, LEDGE);   // the hut's floor, over the cellar he came up through
  ledge(r, 4, 10, 8); ledge(r, 4, 10, 12);                        // the bunks
  mark(r, 'shrine', 18, 4);                                       // the hut's roof lets the water through, into a bowl (a leak)
  for (const [x0, x1, y] of [[22, 28, 9], [12, 18, 14], [22, 28, 19], [12, 18, 24]]){ ledge(r, x0, x1, y); mark(r, 'keep', x0 + 2, y + 2); }   // the ladder up the loft, to the door
  ledge(r, 20, 28, 28); shaftUp(r, 29, 35, 31, 43);
  ledge(r, 32, 37, 26); mark(r, 'keep', 35, 28);                  // a ledge off the top of the loft, at the wall: Corwen's nook is through it (level.js nooks)
  mark(r, 'torch', 14, 9); mark(r, 'torch', 34, 12); mark(r, 'torch', 30, 32);
  mark(r, 'urn', 6, 13); mark(r, 'urn', 26, 4); mark(r, 'chest', 6, 9, { holds: 'shards' });
  return r;
}

// ---- the Breach: the garden wall, where the storm broke through the night it came; storm and garden both
function wallfoot(){
  const r = room(); walls(r); door(r, 'top', 30, 35);
  rect(r, 18, 2, 29, 9);                                           // the fallen wall's stones, heaped
  den(r, 18, 27, 2, 6, { open: 'L', back: 0 }); ledge(r, 14, 17, 5); ledge(r, 31, 35, 6);   // Ordric's lamp-room, in the old wall's own cellar under the stones; the way up is over them
  shaftUp(r, 30, 35, 10, 18);
  rect(r, 7, 1, 14, 1, EMPTY); mark(r, 'pool', 7, 1, { w: 8, look: 'spout' });   // the garden's own spring, out of the broken wall: the Gardens' raising water
  mark(r, 'spawn', 5, 2); mark(r, 'urn', 36, 2); mark(r, 'crystal', 33, 2);   // no creature in the water's room: Ordric is on the fallen stones
  return r;
}
function breach(){
  const r = room(1, 2); walls(r); door(r, 'bottom', 30, 35); ledge(r, 30, 35, 1);
  // the wall itself, broken through: its courses standing either side, rubble heaped in the gap
  rect(r, 2, 2, 9, 30); rect(r, 37, 24, 39, 44);
  rect(r, 10, 2, 16, 5); rect(r, 17, 2, 21, 9); rect(r, 22, 2, 25, 4);
  for (const [x0, x1, y] of [[18, 24, 14], [24, 30, 19], [16, 22, 23], [22, 28, 27]]){ ledge(r, x0, x1, y); mark(r, 'keep', x0 + 2, y + 2); }
  shaftUp(r, 28, 35, 31, 43);
  ledge(r, 32, 37, 16); mark(r, 'keep', 35, 18);                  // a ledge out from the broken courses, at the wall: Corwen's nook is through it (level.js nooks)
  mark(r, 'lasher', 13, 6); mark(r, 'puff', 20, 30); mark(r, 'nimbus', 26, 36);
  mark(r, 'torch', 12, 12); mark(r, 'torch', 28, 26); mark(r, 'urn', 23, 5); mark(r, 'chest', 17, 24, { holds: 'shards' });
  return r;
}

// ---- the Long Stair: the keepers' stair to the summit, a step for every day of the year, swept
function stairfoot(){
  const r = room(); walls(r); door(r, 'top', 8, 13);
  stairs(r, 16, 2, 9, 1, 2); rect(r, 34, 2, 37, 10);              // the first flight, to the wall
  shaftUp(r, 8, 13, 6, 18);                                       // and up from its foot to the next
  rect(r, 17, 2, 29, 9); den(r, 17, 26, 2, 6, { open: 'L', back: 0 }); rect(r, 16, 2, 16, 7, EMPTY);   // Ordric's last lamp-room, under the long stair: the stair's foot is its roof
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

// ---- the lower stretch of each passage (phase 9, docs/phase9-sheet.md 2): the rooms under the raising water's room,
// between the sill he comes through from the keeper's hall below (level.js build) and the hole up through that room's
// floor. By the region above: cells [column, row, builder] in the rows added under it. A sill is two rooms wide and a
// room and a half tall, in the bottom row. Where he walks left through it, one tall room beside it goes up to the
// water (in by its right wall at rows 14 to 19, out by its roof at columns 2 to 5). Where he walks right through it,
// a tall room beside it (in by the left wall, out by the roof at columns 30 to 35) and a long one back over the sill
// (in by its floor at the far end, out by its roof at the near end).
// Each ends the same way under its hole: a shelf of rock, and two ledges over it in the hole's own columns, so the
// jump up has head room and a drop through them lands on the shelf, not the floor far below
const headL = r => { rect(r, 2, 31, 9, 32); for (const y of [37, 41]) ledge(r, 2, 5, y); keepUp(r, 3, 4, 34, 44); };
const headR = r => { rect(r, 29, 31, 37, 32); shaftUp(r, 30, 35, 37, 41); };
const steps = (r, list) => { for (const [x0, x1, y] of list){ ledge(r, x0, x1, y); mark(r, 'keep', x0 + 2, y + 2); } };
const deco = (r, kind, x, y) => mark(r, 'deco', x, y, { kind });

// the Crypt Stair's lower flights: dark; water runs down the steps toward him; the founders' tombs stand open and
// empty, the oldest lowest, a name over each. Nothing alive. The stair winds round a drop: a flight up to the west
// wall, ledges back over it to the east, and a long plank across the top of the well
function lowflights(){
  const r = room(1, 2); walls(r); door(r, 'right', 14, 19); door(r, 'top', 2, 5);
  rect(r, 2, 2, 37, 13);
  stairs(r, 31, 14, 8, -1, 3); rect(r, 2, 2, 7, 21);                 // the first flight, and its landing at the west wall
  mark(r, 'runnel', 8, 22, { n: 8, run: 3, dir: 1 });                // the water, down it
  steps(r, [[10, 13, 24], [16, 19, 26], [22, 25, 28], [28, 31, 30]]); rect(r, 33, 31, 37, 32);   // back over it, to a shelf on the east wall
  ledge(r, 10, 32, 32); for (const x of [14, 20, 26]) mark(r, 'keep', x, 34);                    // the plank over the well
  headL(r);
  for (const [x, y] of [[35, 14], [4, 22], [35, 33], [7, 33]]){ deco(r, 'tomb', x, y); deco(r, 'plaque', x, y + 4); }   // the founders, oldest lowest
  mark(r, 'crystal', 33, 14); mark(r, 'crystal', 6, 22); mark(r, 'torch', 20, 36); mark(r, 'urn', 36, 33);
  return r;
}
// the Breach, storm side: storm and garden both. Drowned beds, torn trellis, a gate hanging by one hinge; a nimbus
// over the beds, lashers in the rain. The only passage with a fight in it
function stormbeds(){
  const r = room(1, 2); walls(r); door(r, 'right', 14, 19); door(r, 'top', 2, 5);
  rect(r, 2, 2, 37, 13);
  rect(r, 6, 14, 12, 15); rect(r, 18, 14, 26, 15);                   // the beds, banked up
  steps(r, [[28, 33, 19], [18, 24, 22], [8, 14, 25], [16, 22, 28], [10, 14, 30]]);   // what is left of the trellis
  headL(r);
  mark(r, 'lasher', 9, 16); mark(r, 'lasher', 22, 16); mark(r, 'nimbus', 16, 23);
  deco(r, 'gatehang', 33, 14); deco(r, 'trellis', 30, 14); deco(r, 'trellis', 15, 14); deco(r, 'trellis', 4, 14); deco(r, 'tuft', 8, 16); deco(r, 'tuft', 21, 16); deco(r, 'tuft', 24, 16);
  mark(r, 'torch', 35, 22); mark(r, 'torch', 5, 27); mark(r, 'urn', 3, 33);
  return r;
}
// a stair, then ledges back over it, then a long plank: the shape of the Bell Road's and the Long Stair's first rooms
function turning(r){
  walls(r); door(r, 'left', 14, 19); door(r, 'top', 30, 35);
  rect(r, 2, 2, 37, 13);
  stairs(r, 10, 14, 8, 1, 3); rect(r, 34, 2, 37, 21);                // the first flight, and its landing at the east wall
  steps(r, [[27, 31, 24], [21, 25, 26], [15, 19, 28], [9, 13, 30]]); rect(r, 2, 31, 7, 32);   // back over it, to a shelf on the west wall
  ledge(r, 8, 28, 32); for (const x of [12, 18, 24]) mark(r, 'keep', x, 34);                  // and along the top
  headR(r);
}
// the long room back over the sill: the ground rises over the sill's crown; a step under the hole at the near end
function overSill(r){
  walls(r); door(r, 'bottom', 110, 115); ledge(r, 110, 115, 1); door(r, 'top', 2, 5);
  rect(r, 40, 2, 78, 4); rect(r, 52, 5, 66, 6);
  rect(r, 2, 2, 8, 5); for (const y of [10, 14, 18]) ledge(r, 2, 5, y); keepUp(r, 3, 4, 7, 20);
}
// the Bell Road, out of the house's gate: the road turns back on itself up the slope, a shrine at each turn covered in
// carved names. Grey-threaded pilgrims walk it: some going up, some standing at a shrine. They do not fight
function gatestair(){
  const r = room(1, 2); turning(r);
  for (const [x, y] of [[5, 14], [36, 22], [4, 33]]){ deco(r, 'stele', x, y); deco(r, 'candles', x + (x < 20 ? 2 : -2), y); }
  mark(r, 'pilgrim', 7, 14); mark(r, 'pilgrim', 35, 22); mark(r, 'pilgrim', 18, 33);
  mark(r, 'torch', 2, 24); mark(r, 'torch', 36, 27); mark(r, 'torch', 25, 36); mark(r, 'urn', 3, 33);
  return r;
}
function bellroad(){
  const r = room(3, 1); overSill(r);
  for (const x of [98, 59, 24]){ deco(r, 'stele', x, x === 59 ? 7 : 2); deco(r, 'candles', x + 2, x === 59 ? 7 : 2); }
  mark(r, 'pilgrim', 88, 2); mark(r, 'pilgrim', 61, 7); mark(r, 'pilgrim', 30, 2); mark(r, 'pilgrim', 16, 2);
  mark(r, 'torch', 104, 8); mark(r, 'torch', 72, 10); mark(r, 'torch', 44, 9); mark(r, 'torch', 14, 8); mark(r, 'urn', 92, 2); mark(r, 'urn', 34, 2);
  return r;
}
// the Last Hut's lee slope: one broad climb in the last of the ice, terrace over terrace. Climbers' cairns, ropes left
// fixed, packs put down by those who turned back. A wraith or two
function leeslope(){
  const r = room(1, 2); walls(r); door(r, 'left', 14, 19); door(r, 'top', 30, 35);
  rect(r, 2, 2, 37, 13);
  rect(r, 22, 14, 37, 17); rect(r, 2, 21, 14, 22); rect(r, 24, 25, 37, 26); rect(r, 2, 29, 14, 30);   // the terraces, east and west by turns
  steps(r, [[16, 20, 19], [17, 21, 24], [17, 21, 28], [17, 20, 31], [23, 26, 32]]);
  headR(r);
  deco(r, 'cairn', 30, 18); deco(r, 'cairn', 6, 31); deco(r, 'pack', 10, 23); deco(r, 'pack', 33, 27); deco(r, 'rope', 21, 14); deco(r, 'rope', 15, 23);
  mark(r, 'wraith', 20, 36); mark(r, 'torch', 36, 21); mark(r, 'crystal', 4, 23); mark(r, 'urn', 35, 18);
  return r;
}
function leeway(){
  const r = room(3, 1); overSill(r);
  deco(r, 'cairn', 59, 7); deco(r, 'cairn', 98, 2); deco(r, 'cairn', 22, 2); deco(r, 'pack', 86, 2); deco(r, 'pack', 31, 2); deco(r, 'pack', 62, 7);
  mark(r, 'wraith', 72, 13); mark(r, 'torch', 104, 8); mark(r, 'torch', 14, 8); mark(r, 'crystal', 46, 5); mark(r, 'urn', 90, 2);
  return r;
}
// the Long Stair's swept flights: a step for every day of the year, clean. Someone is still sweeping it: a figure always
// a few steps ahead, seen from behind, never caught up with. Nothing hostile. The one long straight thing on the mountain
function sweptflight(){
  const r = room(1, 2); turning(r);
  mark(r, 'sweeper', 16, 17, { dir: 1 }); mark(r, 'sweeper', 22, 33, { dir: -1 });
  mark(r, 'torch', 2, 24); mark(r, 'torch', 36, 27); mark(r, 'torch', 5, 36); mark(r, 'crystal', 36, 22);
  return r;
}
function longstair(){
  const r = room(3, 1); walls(r); door(r, 'bottom', 110, 115); ledge(r, 110, 115, 1); door(r, 'top', 2, 5);
  stairs(r, 106, 2, 12, -1, 8); rect(r, 2, 2, 10, 13);               // twelve long steps, and the landing at their head
  rect(r, 6, 21, 7, 22, EMPTY); for (const y of [17, 21]) ledge(r, 2, 5, y); keepUp(r, 3, 4, 15, 20);
  mark(r, 'sweeper', 94, 4, { dir: -1 });
  mark(r, 'torch', 100, 9); mark(r, 'torch', 68, 12); mark(r, 'torch', 36, 16); mark(r, 'crystal', 8, 14);
  return r;
}
export const LOWER = {
  1: { layout: [[0, 0, lowflights]] },
  2: { layout: [[2, 0, gatestair], [0, 2, bellroad]] },
  3: { layout: [[2, 0, leeslope], [0, 2, leeway]] },
  4: { layout: [[0, 0, stormbeds]] },
  5: { layout: [[2, 0, sweptflight], [0, 2, longstair]] },
};
// ---- what each keeper holds in its region, and the quick way it leaves when it falls (phase 9, docs/phase9-sheet.md
// 3 and 4). By region: a function given the region as built (level.js build) that sets holds, doors and given planks
// into it and adds the quick way's rooms. While the keeper stands its rule makes the region slower, never impassable;
// the quick way is stone at both ends. When it falls the rule ends and the quick way is found open.
// the Roots' quick way: the foot of the well, under the well room, from the pithead. Planks and a knotted rope
function wellfoot(){
  const r = room(1, 2); walls(r); door(r, 'left', 2, 7); door(r, 'top', 16, 19);
  steps(r, [[8, 13, 5], [18, 23, 9], [8, 13, 13], [18, 23, 17], [8, 13, 21], [18, 23, 25], [8, 13, 29]]);
  rect(r, 14, 31, 37, 32); for (const y of [37, 41]) ledge(r, 16, 19, y); keepUp(r, 17, 18, 34, 44);
  for (const y of [3, 9, 15, 21, 27, 34]) deco(r, 'rope', 16, y); deco(r, 'knot', 16, 40);   // the rope, and Ordric's knot on it
  mark(r, 'torch', 30, 6); mark(r, 'torch', 5, 18); mark(r, 'torch', 30, 36); mark(r, 'urn', 34, 2); mark(r, 'urn', 26, 33);
  r.title = 'THE WELL\'S FOOT';
  return r;
}
export const RULES = {
  // the Warden's weight: slabs pressed down into the doorways on the way up (he goes under them crouched or rolling).
  // Its quick way: the well's foot, from the pithead up into the well room, stone at both ends until it falls
  0: X => { const { HOLD, GIVEN } = X.tile, pit = X.roomOf('pithead'), well = X.roomOf('well');
    X.addRoom(3, 0, wellfoot, { after: true, quick: true });
    for (let y = 2; y <= 7; y++) for (const x of [38, 39]) X.set(pit.tx0 + x, pit.ty0 + y, HOLD);
    for (let x = 16; x <= 19; x++){ X.set(well.tx0 + x, well.ty0, HOLD); X.set(well.tx0 + x, well.ty0 + 1, GIVEN); }
    for (const [a, b] of [['chamber', 'ascent'], ['ascent', 'gallery'], ['gallery', 'well']]) X.lintel(a, b);
  },
  // the Toll's bells: four doors open and shut on the bell's beat (he waits for them): the way into the nave, and the
  // bell tower's three. The tower is the way up through the house, so while the bell rings it is climbed a door at a
  // time. Its quick way is the same tower with the bell stopped: straight up from the nave to the chapel's floor, every
  // door standing open, a lamp left burning at each
  1: X => { const { DOOR } = X.tile, lamps = [];
    for (const [a, b] of [['undercroft', 'nave'], ['nave', 'belfry'], ['library', 'belfry'], ['cloister', 'belfry']]) for (const D of X.doorway(a, b, DOOR)) if (b === 'belfry') lamps.push(D);
    X.addMarks(lamps.map(D => ({ type: 'torch', x: D.x + 5, y: D.y + 4, given: true })));
    const bel = X.roomOf('belfry'); if (bel) bel.quick = true;
  },
  // the Wyrm's wind: on three open faces of the spires, one above another (the saddle to the span), it bears down in
  // beats on anything in the air. When the Wyrm falls the wind turns: the same three faces lift (he has its wind by
  // then, and the scarf rides them), and the arch from the hall has planks let into it over the last: the quick way,
  // straight up from the saddle to the keeper's hall. A red strand is tied where each begins
  2: X => { const { HOLD, GIVEN, ROCK } = X.tile, sad = X.roomOf('saddle'), sp = X.roomOf('spire'), te = X.roomOf('teeth'), span = X.roomOf('span'); if (!sad || !sp || !te || !span) return;
    const faces = [{ x: sp.tx0 + 5, y: sad.ty0 + 9, w: 8, h: sp.ty0 - sad.ty0 - 9 + 23 }, { x: sp.tx0 + 5, y: sp.ty0 + 26, w: 8, h: sp.ty1 - sp.ty0 - 26 + 31 }, { x: te.tx0 + 19, y: te.ty0 + 29, w: 8, h: te.ty1 - te.ty0 - 29 }, { x: te.tx0 + 19, y: span.ty0 + 8, w: 8, h: 14 }];
    for (const F of faces) X.marks.push({ type: 'gust', ...F });
    // the planks in the arch, over the last face: rock while the Wyrm stands
    for (let x = te.tx0 + 21; x <= te.tx0 + 24; x++){ let top = -1; for (let y = span.ty1 - 5; y <= span.ty1 + 3; y++) if (X.at(x, y) === ROCK){ X.set(x, y, HOLD); top = y; } if (top >= 0) X.set(x, top, GIVEN); }
    X.marks.push({ type: 'deco', kind: 'knot', x: sp.tx0 + 4, y: sp.ty0 + 25 }, { type: 'deco', kind: 'knot', x: te.tx0 + 22, y: te.ty0 + 28 }, { type: 'urn', x: sp.tx0 + 2, y: sp.ty0 + 25 }, { type: 'urn', x: te.tx0 + 8, y: te.ty0 + 25 });
    for (const r of [sp, te, span]) r.quick = true;
  },
};
export const SEAMS = {
  1: { rows: 3, link: [30, 35], layout: [[0, 0, titled(cryptfoot, 'THE CRYPT STAIR')], [0, 1, titled(founders, 'THE CRYPT STAIR'), 1, 2]] },
  2: { rows: 3, link: [30, 35], layout: [[0, 0, titled(gate, 'THE BELL ROAD')], [0, 1, titled(road, 'THE BELL ROAD'), 1, 2]] },
  3: { rows: 3, link: [30, 35], layout: [[0, 0, titled(path, 'THE LAST HUT')], [0, 1, titled(hut, 'THE LAST HUT'), 1, 2]] },
  4: { rows: 3, link: [30, 35], layout: [[0, 0, titled(wallfoot, 'THE BREACH')], [0, 1, titled(breach, 'THE BREACH'), 1, 2]] },
  5: { rows: 3, link: [8, 13], layout: [[0, 0, titled(stairfoot, 'THE LONG STAIR')], [0, 1, titled(flights, 'THE LONG STAIR'), 1, 2]] },
};
