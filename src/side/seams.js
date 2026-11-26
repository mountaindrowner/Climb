// The seams (docs/world.md): between two regions, a short way of its own that is neither and both. Each is built under
// the region above's first room (level.js build: the region is moved up `rows` rooms and these go beneath it), he comes
// up into it from the region below, it wears that region's look at its foot and the region above's at its head, and a
// hole cut through the floor at `link` (tile columns of the first room, boarded over) lets him up into the region.
// title: what the place line says there. By region index: 1 the Crypt Stair (into the Cloister), 2 the Bell Road (the
// Spires), 3 the Last Hut (the Tempest), 4 the Breach (the Gardens), 5 the Long Stair (the Firmament).
import { room, put, rect, walls, door, ledge, mark, stairs, den, shelf, pier, corbel, keepOver, flue, stone, EMPTY, ROCK, LEDGE, SPIKES, CRACKED } from './rooms.js';

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
  den(r, 18, 27, 2, 6, { open: 'L', back: 2 }); corbel(r, 13, 17, 7, 'R', 1); put(r, 17, 8, ROCK);   // (since the map pass a step of the den's stone, not a plank, joined to its roof by a step)
  ledge(r, 30, 35, 6); shelf(r, 'R', 30, 13); ledge(r, 30, 35, 18); keepUp(r, 31, 34, 14, 20);   // up to the stair's mouth: a rung off the den, a shelf of the wall, a rung under the hole
  mark(r, 'spawn', 4, 2); mark(r, 'crystal', 14, 2); mark(r, 'urn', 36, 2);   // no creature in the water's room
  return r;
}
function founders(){
  const r = room(1, 2); walls(r); door(r, 'bottom', 30, 35); ledge(r, 30, 35, 1);
  // the founders' tombs in the walls, one over another, each a niche of rock with a light in it
  for (const [x, y] of [[2, 9], [36, 15], [2, 21], [36, 27], [2, 33], [36, 39]]) rect(r, x, y, x + 1, y + 3);
  // (the map pass, build 101: the way up was planks in the air. Now the founders' stone: shelves out of one wall and
  // the other, six rows apart, a crystal on each; and at the top, too near the roof for a step, a ladder in a flue
  // under the hole: two rungs wall to wall)
  for (const [side, y] of [['R', 7], ['L', 12], ['R', 17], ['L', 22], ['R', 27], ['L', 32]]){ shelf(r, side, side === 'L' ? 17 : 22, y, y === 7 ? 1 : 2); mark(r, 'crystal', side === 'L' ? 5 : 34, y + 1); }   // (the first one thin: it is over the hole he comes up by)
  shelf(r, 'R', 22, 33, 1); rect(r, 29, 39, 29, 43); rect(r, 36, 39, 36, 43); ledge(r, 30, 35, 39); ledge(r, 30, 35, 43); keepUp(r, 31, 34, 34, 42);
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
  ledge(r, 22, 27, 7); den(r, 28, 37, 2, 6, { open: 'L', back: 0 }); shaftUp(r, 30, 35, 15, 19); flue(r, 30, 35, 15, 20);   // (its rungs between stone sides since the map pass, a row up: five rows of air over the lamp-room's roof)
  mark(r, 'spawn', 5, 2); mark(r, 'torch', 12, 8); mark(r, 'torch', 19, 8); mark(r, 'urn', 8, 2); mark(r, 'urn', 37, 2);
  for (const y of [2, 4]) for (const x of [2, 4]) mark(r, 'keep', x, y);   // over the way up from the road (build 81: the wear rounded the corner into a lip over half the hatch, and it was nearly too tight to come up through)
  return r;
}
function road(){
  const r = room(1, 2); walls(r); door(r, 'bottom', 30, 35); ledge(r, 30, 35, 1);
  // the road: a worn stair up from the gate, then switchbacks up the face, a landing at each turn
  stairs(r, 24, 2, 6, -1, 2);
  // (the map pass, build 102: from the second landing the road was planks in the air. Now the face's own stone:
  // shelves out of one side and the other, five rows apart, the turn on the first; one rung under the hole)
  for (const [x0, x1, y] of [[4, 12, 8], [14, 19, 12]]){ ledge(r, x0, x1, y); mark(r, 'keep', x0 + 2, y + 2); }
  const SH = [['R', 20, 16], ['L', 17, 21], ['R', 22, 26], ['L', 17, 31], ['R', 22, 36]];
  for (const [side, x, y] of SH) shelf(r, side, x, y);
  for (const [side, x, y] of SH) keepOver(r, side === 'L' ? 2 : x - 4, side === 'L' ? x + 4 : 37, y);   // (all laid first, so no mark of the air is under a shelf laid after it)
  mark(r, 'shrine', 25, 17);                                     // the turn: water seeps through the road here (a leak)
  ledge(r, 30, 35, 43); keepUp(r, 31, 34, 37, 43);
  mark(r, 'harpy', 20, 34); mark(r, 'urn', 6, 9); mark(r, 'chest', 30, 17, { holds: 'shards' });
  mark(r, 'torch', 6, 26); mark(r, 'torch', 36, 40);
  return r;
}

// ---- the Last Hut: the climbers' last shelter below the storm, a fire kept in it; everything in it says stay
function path(){
  const r = room(); walls(r); door(r, 'top', 30, 35);
  rect(r, 20, 2, 39, 9);                                           // the scree, banked against the hut's foot
  den(r, 20, 29, 2, 6, { open: 'L', back: 0 }); stone(r, 16, 17, 5); keepOver(r, 20, 37, 9);   // Ordric's lamp-room, dug into the scree out of the rain; the path goes up over it (from a step of the scree since the map pass, its mouth left open beside it; the scree's top kept from the wear's humps)
  shaftUp(r, 30, 35, 15, 19); flue(r, 30, 35, 15, 20);         // (since the map pass, the rungs between stone sides, five rows of air over the lamp-room's roof)
  rect(r, 8, 1, 15, 1, EMPTY); mark(r, 'pool', 8, 1, { w: 8, look: 'pipe' });   // rain off the scree, caught by the climbers' pipe: the Tempest's raising water
  mark(r, 'spawn', 5, 2); mark(r, 'crystal', 18, 6);   // no creature in the water's room: Ordric keeps his lamps on the scree's first step
  return r;
}
function hut(){
  const r = room(1, 2); walls(r); door(r, 'bottom', 30, 35); ledge(r, 30, 35, 1);
  rect(r, 2, 2, 39, 3); rect(r, 30, 2, 35, 3, EMPTY);           // the hut's floor, open over the cellar he came up through (a hatch of planks in it until the map pass)
  mark(r, 'shrine', 18, 4);                                       // the hut's roof lets the water through, into a bowl (a leak)
  // (the map pass, build 103: the loft was planks in the air. Now shelves out of the hut's walls, one side and the
  // other: the bunk shelf, two more, and the top one at the east wall, where Corwen's nook is through it (level.js
  // nooks); from it a rung, and a ladder between stone sides up to the door)
  const SH = [['L', 17, 9, 1], ['R', 22, 15, 1], ['L', 17, 21, 1], ['R', 22, 26, 2]];
  for (const [side, x, y, t] of SH) shelf(r, side, x, y, t);
  for (const [side, x, y] of SH) keepOver(r, side === 'L' ? 2 : x - 4, side === 'L' ? x + 4 : 37, y);
  shaftUp(r, 29, 35, 31, 43); flue(r, 29, 35, 32, 43);
  mark(r, 'torch', 14, 12); mark(r, 'torch', 34, 12); mark(r, 'torch', 30, 33);
  mark(r, 'urn', 9, 10); mark(r, 'urn', 26, 4); mark(r, 'chest', 6, 10, { holds: 'shards' });
  return r;
}

// ---- the Breach: the garden wall, where the storm broke through the night it came; storm and garden both
function wallfoot(){
  const r = room(); walls(r); door(r, 'top', 30, 35);
  rect(r, 18, 2, 29, 9);                                           // the fallen wall's stones, heaped
  den(r, 18, 27, 2, 6, { open: 'L', back: 0 }); stone(r, 14, 15, 5); rect(r, 28, 2, 37, 9); keepOver(r, 18, 37, 9);   // Ordric's lamp-room, in the old wall's own cellar under the stones; the way up is over them (since the map pass the heap runs to the east wall, and a stone of it is the step up)
  shaftUp(r, 30, 35, 15, 19); flue(r, 30, 35, 15, 20);
  rect(r, 7, 1, 14, 1, EMPTY); mark(r, 'pool', 7, 1, { w: 8, look: 'spout' });   // the garden's own spring, out of the broken wall: the Gardens' raising water
  mark(r, 'spawn', 5, 2); mark(r, 'urn', 36, 10); mark(r, 'crystal', 33, 10);   // no creature in the water's room: Ordric is on the fallen stones
  return r;
}
function breach(){
  const r = room(1, 2); walls(r); door(r, 'bottom', 30, 35); ledge(r, 30, 35, 1);
  // the wall itself, broken through: its courses standing either side, rubble heaped in the gap
  rect(r, 2, 2, 9, 30); rect(r, 37, 24, 39, 44);
  rect(r, 10, 2, 16, 5); rect(r, 17, 2, 21, 9); rect(r, 22, 2, 25, 4);
  // (the map pass, build 104: the way up was planks in the air. Now courses of the wall still standing out of either
  // side, one and then the other: the second is the one at the east wall where Corwen's nook is through it (level.js
  // nooks); the fifth is the top of the west courses, run out; from the last a rung straight up under the hole)
  const SH = [[9, 16, 15], [24, 37, 16], [9, 20, 21], [26, 36, 26], [9, 19, 31], [27, 36, 37]];
  for (const [x0, x1, y] of SH) rect(r, x0, y, x1, y);
  for (const [x0, x1, y] of SH) keepOver(r, x0 < 20 ? 11 : x0 - 5, x0 < 20 ? x1 + 5 : 35, y);
  ledge(r, 30, 35, 43); flue(r, 30, 35, 43, 43); keepUp(r, 31, 34, 39, 43); for (const y of [38, 40, 42]) for (let x = 14; x <= 28; x += 2) mark(r, 'keep', x, y);   // (the air over the last jump kept from the roof's wear)
  mark(r, 'lasher', 13, 6); mark(r, 'puff', 20, 30); mark(r, 'nimbus', 26, 36);
  mark(r, 'torch', 12, 12); mark(r, 'torch', 28, 26); mark(r, 'urn', 23, 5); mark(r, 'chest', 15, 22, { holds: 'shards' });
  return r;
}

// ---- the Long Stair: the keepers' stair to the summit, a step for every day of the year, swept
function stairfoot(){
  const r = room(); walls(r); door(r, 'top', 8, 13);
  stairs(r, 16, 2, 9, 1, 2); rect(r, 34, 2, 37, 10);              // the first flight, to the wall
  for (const y of [7, 13, 19]) ledge(r, 8, 13, y); flue(r, 8, 13, 13, 20); keepUp(r, 9, 12, 8, 19);   // and up from its foot to the next (three rungs, the upper two between stone sides, since the map pass: four hung in the air)
  rect(r, 17, 2, 29, 9); den(r, 17, 26, 2, 6, { open: 'L', back: 0 }); rect(r, 16, 2, 16, 7, EMPTY);   // Ordric's last lamp-room, under the long stair: the stair's foot is its roof
  rect(r, 6, 1, 13, 1, EMPTY); mark(r, 'pool', 6, 1, { w: 8, look: 'ring' });   // a still pool at the stair's foot, the stars in it: the Firmament's raising water
  mark(r, 'spawn', 5, 2); mark(r, 'urn', 36, 11); mark(r, 'crystal', 34, 11);
  return r;
}
function flights(){
  const r = room(1, 2); walls(r); door(r, 'bottom', 8, 13); ledge(r, 8, 13, 1);
  // flight after flight, turning at each landing, the sky darkening into stars as it goes
  stairs(r, 14, 2, 10, 1, 2); rect(r, 34, 2, 37, 11);
  // (the map pass, build 105: the landings were planks in the air. Now flights of the stair's own stone, out of one
  // wall and then the other, and two rungs between stone sides to the top step)
  const SH = [[2, 26, 17], [31, 37, 23], [2, 26, 29]];             // the landings, turning
  for (const [x0, x1, y] of SH) rect(r, x0, y, x1, y);
  for (const [x0, x1, y] of SH) keepOver(r, x0 < 20 ? 2 : 27, x0 < 20 ? 30 : 37, y);
  for (const y of [35, 41]) ledge(r, 8, 13, y); flue(r, 8, 13, 35, 43); keepUp(r, 9, 12, 31, 43);   // to the top step
  mark(r, 'mote', 29, 27); mark(r, 'mote', 24, 40); mark(r, 'urn', 36, 12); mark(r, 'chest', 6, 18, { holds: 'shards' });
  mark(r, 'torch', 36, 26); mark(r, 'torch', 4, 21); mark(r, 'torch', 34, 40);
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
const headR = r => { rect(r, 29, 31, 37, 32); shaftUp(r, 30, 35, 37, 41); flue(r, 30, 35, 38, 43); };   // (the top rung between stone sides since the map pass)
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
  steps(r, [[10, 13, 24], [16, 19, 26]]); corbel(r, 22, 37, 31, 'R', 1);   // back over it, to a shelf out of the east wall (the map pass, build 101: the two steps in the air went; the shelf reaches back for them)
  ledge(r, 10, 21, 31); for (const x of [14, 20, 26]) mark(r, 'keep', x, 33);                    // the plank over the well, to the shelf
  headL(r);
  for (const [x, y] of [[35, 14], [4, 22], [35, 32], [7, 33]]){ deco(r, 'tomb', x, y); deco(r, 'plaque', x, y + 4); }   // the founders, oldest lowest
  mark(r, 'crystal', 33, 14); mark(r, 'crystal', 6, 22); mark(r, 'torch', 20, 36); mark(r, 'urn', 36, 32);
  return r;
}
// the Breach, storm side: storm and garden both. Drowned beds, torn trellis, a gate hanging by one hinge; a nimbus
// over the beds, lashers in the rain. The only passage with a fight in it
function stormbeds(){
  const r = room(1, 2); walls(r); door(r, 'right', 14, 19); door(r, 'top', 2, 5);
  rect(r, 2, 2, 37, 13);
  rect(r, 6, 14, 12, 15); rect(r, 18, 14, 26, 15);                   // the beds, banked up
  rect(r, 20, 21, 37, 21); rect(r, 2, 26, 14, 26);                 // (the map pass: a course of the wall over the door, and one of the west wall, where the trellis's planks hung)
  headL(r); rect(r, 2, 31, 9, 31, EMPTY); flue(r, 2, 5, 40, 43); keepOver(r, 15, 35, 21); keepOver(r, 3, 19, 26);   // (the landing one course thick here: five rows of air over the shelf under it)
  mark(r, 'lasher', 9, 16); mark(r, 'lasher', 22, 16); mark(r, 'nimbus', 17, 30);
  deco(r, 'gatehang', 33, 14); deco(r, 'trellis', 30, 14); deco(r, 'trellis', 15, 14); deco(r, 'trellis', 4, 14); deco(r, 'tuft', 8, 16); deco(r, 'tuft', 21, 16); deco(r, 'tuft', 24, 16);
  mark(r, 'torch', 35, 24); mark(r, 'torch', 5, 28); mark(r, 'urn', 3, 33);
  return r;
}
// a stair, then ledges back over it, then a long plank: the shape of the Bell Road's and the Long Stair's first rooms
function turning(r){
  walls(r); door(r, 'left', 14, 19); door(r, 'top', 30, 35);
  rect(r, 2, 2, 37, 13);
  stairs(r, 10, 14, 8, 1, 3); rect(r, 34, 2, 37, 21);                // the first flight, and its landing at the east wall
  // back over it, to a shelf out of the west wall (the map pass, build 102: the steps in the air went; the shelf reaches
  // back for them, and the plank over the well rests on it)
  steps(r, [[27, 31, 24], [22, 26, 25]]); corbel(r, 2, 17, 31, 'L', 1); keepOver(r, 2, 21, 31);
  ledge(r, 18, 28, 31); for (const x of [12, 18, 24]) mark(r, 'keep', x, 33);                  // and along the top
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
  for (const [x, y] of [[5, 14], [36, 22], [4, 32]]){ deco(r, 'stele', x, y); deco(r, 'candles', x + (x < 20 ? 2 : -2), y); }
  mark(r, 'pilgrim', 7, 14); mark(r, 'pilgrim', 35, 22); mark(r, 'pilgrim', 18, 32);
  mark(r, 'torch', 2, 24); mark(r, 'torch', 36, 27); mark(r, 'torch', 25, 36); mark(r, 'urn', 3, 32);
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
  rect(r, 22, 14, 37, 17); rect(r, 2, 21, 17, 22); rect(r, 22, 25, 37, 26); rect(r, 2, 29, 17, 30);   // the terraces, east and west by turns (since the map pass, each reaching out to four tiles from the next: no steps between)
  for (const [x0, x1, y] of [[2, 21, 22], [22, 28, 26], [2, 21, 30]]) keepOver(r, x0, x1, y);
  steps(r, [[23, 26, 32]]);                                        // a step on the last terrace, up to the head
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
  mark(r, 'sweeper', 16, 17, { dir: 1 }); mark(r, 'sweeper', 22, 32, { dir: -1 });
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
// the Roots' quick way: the foot of the well, under the well room, from the pithead. Stone shelves and a knotted rope
function wellfoot(){
  const r = room(1, 2); walls(r); door(r, 'left', 2, 7); door(r, 'top', 16, 19);
  // up it: shelves of the well's own stone, out of one wall and then the other, the rope hanging down between their
  // ends; the last runs in under the mouth of the well, a flue in the roof, and up that go two rungs (the map pass)
  pier(r, 12, 14, 4);                                              // a fallen block is the first step (five or six rows to a shelf, four clear tiles between lips: build 77)
  shelf(r, 'R', 19, 9); shelf(r, 'L', 14, 15); shelf(r, 'R', 19, 20); shelf(r, 'L', 14, 26); shelf(r, 'R', 16, 31);
  rect(r, 12, 37, 15, 43); rect(r, 20, 37, 23, 43); for (const y of [37, 41]) ledge(r, 16, 19, y); keepUp(r, 17, 18, 34, 44);
  for (const y of [3, 9, 15, 21, 27, 34]) deco(r, 'rope', 16, y); deco(r, 'knot', 16, 40);   // the rope, and Ordric's knot on it
  mark(r, 'torch', 30, 14); mark(r, 'torch', 5, 20); mark(r, 'torch', 30, 36); mark(r, 'urn', 34, 2); mark(r, 'urn', 26, 32);
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
  // the Thunderhead's storm: rain, and three rods on the way up struck in turn (main.js ruleStep), each with a warning.
  // Its quick way: a shaft of iron gantries through the rock under the crossing, straight up from the stacks. While the
  // storm rules the gantries are live: to land on one is to be shocked. When it breaks they are dead iron
  3: X => { const { EMPTY, LIVE, ROCK } = X.tile, rig = X.roomOf('rigging'), gan = X.roomOf('gantry'), cro = X.roomOf('crossing'), st = X.roomOf('stacks'); if (!rig || !gan || !cro || !st) return;
    for (const [r, x, y] of [[rig, 4, 2], [gan, 4, 2], [cro, 4, 17]]){ let yy = r.ty0 + y; while (yy > r.ty0 && X.at(r.tx0 + x, yy - 1) === EMPTY) yy--; X.marks.push({ type: 'rod', x: r.tx0 + x, y: yy }); }
    // the shaft: four wide, from the rock's underside up through the crossing's floor, where the floor has open air over
    // it (he jumps the grating at its head) and nothing stands by
    const top = cro.ty0 + 1, fixed = new Set(['urn', 'chest', 'crystal', 'torch', 'npc', 'shrine', 'rod', 'thread']), clear = x => { for (let a = -3; a <= 6; a++) for (let b = 1; b <= 13; b++) if (X.at(x + a, top + b) !== EMPTY) return false; return !X.marks.some(m => fixed.has(m.type) && m.x >= x - 1 && m.x <= x + 4 && Math.abs(m.y - top - 1) < 3); };
    let sx = -1; for (let x = st.tx0 + 6; x <= st.tx0 + 30 && sx < 0; x++) if (clear(x) && [0, 1, 2, 3].every(d => X.at(x + d, top) === ROCK && X.at(x + d, top - 6) === ROCK)) sx = x;
    if (sx < 0) return;
    let bottom = top; while (bottom > st.ty1 && X.at(sx, bottom - 1) === ROCK) bottom--;
    for (let y = bottom; y <= top; y++) for (let x = sx; x < sx + 4; x++) X.set(x, y, EMPTY);
    for (let y = top; y >= bottom; y -= 4) for (let x = sx; x < sx + 4; x++) X.set(x, y, LIVE);
    const live = (x0, x1, y) => { for (let x = x0; x <= x1; x++) if (X.at(x, y) === EMPTY) X.set(x, y, LIVE); };
    live(sx - 1, sx + 4, bottom - 4); live(Math.min(sx + 2, st.tx0 + 24), Math.max(sx + 4, st.tx0 + 26), bottom - 8);   // and out under it: a gantry along to the corbel's rock
    for (const r of [st, X.roomOf('corbel')].filter(Boolean)) r.quick = true;
  },
  // Mother Thorn's hold: four ways straight up through the garden's floors are choked with thorn. It hurts to touch
  // and the blade does not cut it. When she falls it withers: the quick way, boards over each mouth
  4: X => { const { EMPTY, ROCK, LEDGE, HOLD, GIVEN } = X.tile;
    for (const [a, b, x] of [['wellspring', 'sundial', 10], ['arbor', 'cascade', 8], ['orangery', 'canopy', 6], ['brambles', 'orangery', 20]]){ const A = X.roomOf(a), B = X.roomOf(b); if (!A || !B) continue;
      const x0 = B.tx0 + x; let lo = B.ty0 + 1; while (lo > A.ty0 && [0, 1, 2, 3].every(d => X.at(x0 + d, lo - 1) === ROCK)) lo--;   // the rock between them, down from the upper room's floor
      for (let y = lo; y <= B.ty0 + 1; y++) for (let d = 0; d < 4; d++) X.set(x0 + d, y, y === B.ty0 + 1 ? GIVEN : HOLD);
      // under it, what brings him up into it from the ground below (the map pass, build 104: five planks hung in the air
      // under each). Rungs six rows apart, down as far as he can come to: a jump from that ground, or the throw of a
      // bloom where one grows under the mouth. They are steps off a rib of stone hung from the mouth's west side
      let g = lo - 1; while (g > A.ty0 && X.at(x0 + 1, g) !== ROCK && X.at(x0 + 2, g) !== ROCK) g--;
      const s = g + 1, bloom = X.marks.some(m => m.type === 'bloom' && m.y === s && m.x >= x0 && m.x <= x0 + 3), reach = s + (bloom ? 19 : 6), rungs = [];
      for (let y = B.ty0 + 1 - 6; y > s + 2; y -= 6){ rungs.push(y); if (y + 1 <= reach) break; }
      for (const y of rungs) for (let d = 0; d < 4; d++) if (X.at(x0 + d, y) === EMPTY) X.set(x0 + d, y, LEDGE);
      if (rungs.length) for (let y = Math.max(rungs[rungs.length - 1], s + 5); y < lo; y++) if (X.at(x0 - 1, y) === EMPTY) X.set(x0 - 1, y, ROCK);
      A.quick = true; }
  },
};
export const SEAMS = {
  1: { rows: 3, link: [30, 35], layout: [[0, 0, titled(cryptfoot, 'THE CRYPT STAIR')], [0, 1, titled(founders, 'THE CRYPT STAIR'), 1, 2]] },
  2: { rows: 3, link: [30, 35], layout: [[0, 0, titled(gate, 'THE BELL ROAD')], [0, 1, titled(road, 'THE BELL ROAD'), 1, 2]] },
  3: { rows: 3, link: [30, 35], layout: [[0, 0, titled(path, 'THE LAST HUT')], [0, 1, titled(hut, 'THE LAST HUT'), 1, 2]] },
  4: { rows: 3, link: [30, 35], layout: [[0, 0, titled(wallfoot, 'THE BREACH')], [0, 1, titled(breach, 'THE BREACH'), 1, 2]] },
  5: { rows: 3, link: [8, 13], layout: [[0, 0, titled(stairfoot, 'THE LONG STAIR')], [0, 1, titled(flights, 'THE LONG STAIR'), 1, 2]] },
};
