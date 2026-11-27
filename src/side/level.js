// The side view's world: a grid of tiles, half a unit square, climbing up through rooms joined by doorways, shafts and
// tunnels, the way a metroidvania's map is. Rooms are built from a few pieces (walls, doors, ledges, stairs, low
// tunnels, rooms.js) so each is easy to read and change; a region is a grid of rooms, and there are six, one over the
// other: the Roots (caves), the Cloister (a ruined monastery), the Spires (ice, and the high pass), then, each in its own
// file under regions/, the Tempest (the storm round the mountain), the Gardens (above the cloud) and the Firmament (the
// summit, among the stars). One is in play at a time (LEVEL; loadLevel changes it).
import { T, ROOM, EMPTY, ROCK, LEDGE, SPIKES, CRACKED, GLASS_A, GLASS_B, HOLD, DOOR, GIVEN, LIVE, VELLUM, SHUTTER, STILLED, FACED, MELT, IRON_A, IRON_B, CALM, KEPT, room, put, rect, walls, door, ledge, stairs, mark, open, den, SLUICE, ROUGH, TIER_A, TIER_B, shelf, pier, hung, corbel, stone, keepOver, flue } from './rooms.js';
import tempest from './regions/tempest.js';
import gardens from './regions/gardens.js';
import firmament from './regions/firmament.js';
import workings from './regions/workings.js';
import vein from './regions/vein.js';
import flooded from './regions/flooded.js';
import greatshaft from './regions/shaft.js';
import thehollow from './regions/hollow.js';
import { SEAMS, LOWER, RULES } from './seams.js';
import * as OSSUARY from './regions/ossuary.js';
import * as SCRIPTORIUM from './regions/scriptorium.js';
import * as FOUNDRY from './regions/foundry.js';
import * as CAIRNS from './regions/cairns.js';
import * as GLACIER from './regions/glacier.js';
import * as REFECTORY from './regions/refectory.js';
import * as WORKS from './regions/works.js';
import * as EYE from './regions/eye.js';
import * as AQUEDUCTS from './regions/aqueducts.js';
import * as HOUSES from './regions/houses.js';
import * as ORRERY from './regions/orrery.js';
import * as DROWNED from './regions/drowned.js';
import * as ROOTSFAR from './regions/rootsfar.js';
import * as CLOISTERFAR from './regions/cloisterfar.js';
// the wings set into a region after it is built (so the region itself is not changed): by region, { left: columns added
// to its west, build(X) }
const WINGS = { 0: [DROWNED.wing, OSSUARY.after], 1: [SCRIPTORIUM.wing, FOUNDRY.wing, REFECTORY.wing], 2: [CAIRNS.wing, GLACIER.wing], 3: [WORKS.wing, EYE.wing], 4: [AQUEDUCTS.wing, HOUSES.wing], 5: [ORRERY.wing] };   // a region's wings: each `left` columns added west of it or `right` columns east, and what it builds there
// (build 116) what is built past a wing's far end, or under or over a region, in the rows the lift left for it (docs/edges-sheet.md).
// Built last, after the keeper's rule, so that the rooms there were keep their order (a save keeps the rooms he has seen by it)
const EDGES = { 0: [ROOTSFAR.far], 1: [CLOISTERFAR.far] };
export { T, ROOM, EMPTY, ROCK, LEDGE, SPIKES, CRACKED, GLASS_A, GLASS_B, HOLD, DOOR, GIVEN, LIVE, VELLUM, SHUTTER, STILLED, FACED, MELT, IRON_A, IRON_B, CALM, KEPT, ROUGH, TIER_A, TIER_B, SLUICE };

// ---- the first region: up from the bottom of the mountain
function start(){
  const r = room(); walls(r); door(r, 'right', 2, 7);
  // the water at the bottom of the world, in a basin cut a tile into the floor: he wakes standing in it, and it gives him
  // back. A cistern older than anything above it (props.js draws it)
  rect(r, 3, 1, 12, 1, EMPTY);
  mark(r, 'pool', 3, 1, { w: 10 });
  // the floor rises in two steps past the water; over them rock hangs from the roof, and on its lip a thread: the first
  // thing worth a second jump
  pier(r, 14, 15, 3); pier(r, 16, 19, 5); hung(r, 27, 31, 11, 22, 2);
  mark(r, 'spawn', 7, 1); mark(r, 'torch', 5, 7); mark(r, 'torch', 34, 7); mark(r, 'crystal', 21, 2);
  mark(r, 'thread', 24, 13);
  mark(r, 'npc', 27, 2, { who: 'wren' }); mark(r, 'urn', 23, 2); mark(r, 'urn', 33, 2);
  return r;
}
function corridor(){
  const r = room(); walls(r); door(r, 'left', 2, 7); door(r, 'top', 27, 36); door(r, 'right', 2, 7);
  rect(r, 11, 0, 15, 1, EMPTY); rect(r, 11, 0, 15, 0, SPIKES);   // a pit with spikes: jump it
  // Ordric's lamp-room: cut into the rock past the pit, where the well-keepers trimmed their lamps before the climb.
  // The way on goes over its roof: up off the boulder at its mouth, the roof, a shelf out of the east wall, a step
  // of the rock that hangs beside the hole, and up into the shaft
  den(r, 24, 33, 2, 6, { open: 'L', back: 2, roof: 1 }); pier(r, 19, 20, 4);   // (the boulder stands three tiles clear of his door)
  ledge(r, 36, 37, 6);                                            // (the one plank: the lamplighter's step, down behind his room to the Pithead's door)
  shelf(r, 'R', 33, 14, 1); hung(r, 24, 26, 16, 29);
  mark(r, 'crawler', 7, 2); mark(r, 'torch', 8, 8); mark(r, 'torch', 26, 6); mark(r, 'crystal', 37, 15);
  mark(r, 'urn', 3, 2); mark(r, 'urn', 28, 2); mark(r, 'chest', 33, 15, { holds: 'shards' });   // (Ordric stands at 25: STATIONS)
  for (const x of [28, 31, 34]) mark(r, 'keep', x, 11); for (const x of [31, 34]) mark(r, 'keep', x, 18);
  return r;
}
function shaft(){
  const r = room(); walls(r); door(r, 'bottom', 27, 36); door(r, 'left', 15, 19);
  rect(r, 2, 2, 22, 13);                                          // the rock the shaft is cut beside
  shelf(r, 'R', 32, 6); rect(r, 23, 9, 25, 10);                   // up it: a shelf out of the east wall, a lip of the rock, the rock's top
  mark(r, 'flitter', 30, 16); mark(r, 'crystal', 24, 2); mark(r, 'crystal', 37, 20); mark(r, 'torch', 10, 17);
  rect(r, 8, 2, 21, 7, EMPTY); rect(r, 22, 2, 22, 6, CRACKED);         // a room in the rock beside the shaft, walled up
  mark(r, 'chest', 12, 2, { holds: 'relic:whetstone' }); mark(r, 'urn', 16, 2); mark(r, 'urn', 19, 2); mark(r, 'crystal', 9, 2);   // its light shows round the cracked stone
  for (const x of [24, 26]) for (const y of [4, 7]) mark(r, 'keep', x, y); for (const x of [33, 36]) mark(r, 'keep', x, 9);
  return r;
}
// the Pithead: where the Lamp-guild went down. The winding gear over the old cage shaft, the guild's lamps, and the hole:
// down it is the Workings (regions/workings.js), the first of the Deep
function pithead(){
  const r = room(); walls(r); door(r, 'left', 2, 7); door(r, 'bottom', 18, 22); door(r, 'top', 5, 8);
  // the well-keepers' old ladder, up into its shaft (oldshaft): a flue of the rock, its rungs set from side to side.
  // The flue begins a man's height over the floor; a boulder under it is the first step, to the ladder or to the deck
  rect(r, 2, 11, 4, 20); rect(r, 9, 11, 10, 20); pier(r, 5, 8, 5);
  for (const y of [11, 16, 21]) ledge(r, 5, 8, y);
  ledge(r, 14, 26, 9);                                            // the headframe's deck over the hole (a deck: planks laid on two legs)
  rect(r, 14, 2, 14, 8); rect(r, 26, 2, 26, 8);                    // its legs
  mark(r, 'pass', 18, 0, { w: 5, h: 3, to: 6, at: 'down' }); mark(r, 'arrive', 10, 2, { name: 'pithead' });
  mark(r, 'torch', 12, 12); mark(r, 'torch', 28, 8); mark(r, 'torch', 34, 12); mark(r, 'crystal', 32, 2);
  mark(r, 'urn', 3, 2); mark(r, 'urn', 35, 2); mark(r, 'flitter', 30, 15);
  for (const y of [8, 13, 18]) for (const x of [6, 7]) mark(r, 'keep', x, y);
  return r;
}
// the well-keepers' old ladder shaft, from the Pithead up under the gallery. Its top is the gallery nook's floor, rotten
// boards: from below he cannot break them, and the ladder ends under them; from above, the Warden's weight plunges
// through, and the way from the top of the Roots down to the Pithead and the pool is open, both ways, from then on
function oldshaft(){
  const r = room(); walls(r); door(r, 'bottom', 5, 8); door(r, 'top', 5, 8);
  rect(r, 2, 0, 4, 22); rect(r, 9, 0, 39, 22);                    // the rock round it: a flue no wider than its ladder
  for (const y of [4, 9, 14, 19]) ledge(r, 5, 8, y);
  for (let y = 2; y <= 20; y += 3) for (const x of [6, 7]) mark(r, 'keep', x, y);   // the wear leaves it open
  return r;
}
function tunnel(){
  const r = room(); walls(r); door(r, 'right', 15, 19); door(r, 'top', 7, 14);
  rect(r, 2, 2, 37, 13);                                          // solid under the tunnel
  rect(r, 19, 17, 30, 20);                                        // a low stretch: crouch or roll under it
  stairs(r, 15, 14, 9, -1, 1);                                    // steps up through the roof: they come out on the chamber's floor
  rect(r, 2, 2, 6, 22);                                           // the stair meets the wall: no pit beside its top
  mark(r, 'burrower', 32, 14); mark(r, 'torch', 34, 18); mark(r, 'crystal', 17, 14);
  mark(r, 'urn', 35, 14); mark(r, 'urn', 24, 14);
  return r;
}
function chamber(){
  const r = room(); walls(r); door(r, 'bottom', 7, 14); door(r, 'right', 2, 7); door(r, 'top', 26, 32);
  rect(r, 6, 1, 6, 1, EMPTY);                                     // the last step of the tunnel's stair, cut in the stairwell's edge
  // the stair comes up at its west end; the room is across the stairwell (a jump). Up it, all of rock: a boulder, a
  // stalagmite, a long shelf out of the west wall, a brow out of the east one, and a step under the hole in the roof
  pier(r, 17, 20, 5); pier(r, 21, 24, 9); shelf(r, 'L', 18, 13); shelf(r, 'R', 26, 15, 1); rect(r, 30, 19, 37, 20);
  rect(r, 29, 8, 37, 9); for (const x of [30, 33, 36]) mark(r, 'keep', x, 11);   // Corwen's cell: a shelf of rock over the east door, the brow over that: he reads where he can see who comes up
  mark(r, 'flitter', 20, 14); mark(r, 'torch', 11, 16); mark(r, 'torch', 27, 18); mark(r, 'crystal', 30, 2); mark(r, 'crystal', 14, 14); mark(r, 'crawler', 32, 2);
  mark(r, 'npc', 28, 2, { who: 'scribe' }); mark(r, 'chest', 11, 14, { holds: 'shards' });
  for (const x of [23, 26, 29]) mark(r, 'keep', x, 18); for (const x of [4, 8, 12]) mark(r, 'keep', x, 16);
  return r;
}
function ascent(){
  const r = room(); walls(r); door(r, 'left', 2, 7); door(r, 'right', 16, 20);
  stairs(r, 6, 2, 14, 1, 2);                                      // a long climb to the right
  rect(r, 34, 2, 37, 15);                                         // its top meets the wall: no pit beside it
  mark(r, 'spitter', 20, 14); mark(r, 'torch', 8, 9); mark(r, 'torch', 30, 19); mark(r, 'crystal', 4, 2);
  return r;
}
function gallery(){
  const r = room(); walls(r); door(r, 'left', 16, 20); door(r, 'right', 2, 7);
  rect(r, 2, 2, 12, 15);                                          // the walkway in, high
  rect(r, 13, 10, 17, 11); pier(r, 20, 25, 7);                    // down to the floor: a lip of the walkway's rock, a boulder
  rect(r, 28, 0, 31, 1, EMPTY); rect(r, 28, 0, 31, 0, SPIKES);    // a spiked gap before the well
  rect(r, 16, 19, 18, 20); rect(r, 30, 18, 33, 20);               // teeth in the roof
  mark(r, 'crawler', 16, 2); mark(r, 'spitter', 35, 13); mark(r, 'torch', 6, 19); mark(r, 'torch', 27, 6); mark(r, 'crystal', 15, 2); mark(r, 'crystal', 36, 2);
  rect(r, 4, 2, 11, 10, EMPTY); rect(r, 12, 2, 12, 5, CRACKED);         // a nook under the walkway, tall enough to plunge in
  rect(r, 5, 0, 8, 1, CRACKED);                                       // its floor rotten boards: under them the well-keepers' old way, down to the Pithead (oldshaft)
  mark(r, 'thread', 7, 3); mark(r, 'urn', 18, 2); mark(r, 'crystal', 10, 2);
  return r;
}
// two screens tall: ledges up to the arena, and a door halfway up to the grotto
function well(){
  const r = room(1, 2); walls(r); door(r, 'left', 2, 7); door(r, 'left', 38, 42); door(r, 'top', 30, 36);
  rect(r, 38, 2, 39, 6, CRACKED);                                   // the Ossuary's door, walled up: bones behind it (regions/ossuary.js)
  // the well: a great shaft the water made, climbed from wall to wall on shelves of its own rock: five or six rows
  // from each to the next, eleven between two on the same wall, four clear tiles between their lips (build 77: they
  // were six rows and two tiles, and felt tight). A boulder at its foot; the fourth shelf has a chest on it; the
  // sixth is the sill of the grotto's door
  pier(r, 20, 21, 5);                                               // (beside the hatch of the quick way, at 16 to 19, not on it)
  shelf(r, 'R', 25, 10); shelf(r, 'L', 20, 15); shelf(r, 'R', 25, 21); shelf(r, 'L', 20, 26); shelf(r, 'R', 25, 32); shelf(r, 'L', 20, 37);
  shelf(r, 'R', 28, 38, 1); rect(r, 34, 42, 37, 43);                // across from the sill; and a step under the hole up into the Warden's hall
  mark(r, 'flitter', 23, 24); mark(r, 'flitter', 23, 40); mark(r, 'spitter', 36, 27);
  mark(r, 'torch', 34, 16); mark(r, 'torch', 4, 21); mark(r, 'torch', 34, 26); mark(r, 'torch', 20, 42); mark(r, 'crystal', 3, 2); mark(r, 'crystal', 37, 22); mark(r, 'crystal', 3, 27);
  mark(r, 'urn', 12, 2); mark(r, 'chest', 8, 27, { holds: 'shards' });
  for (const y of [7, 11, 15, 20, 25, 30, 35, 41]) for (const x of [22, 23]) mark(r, 'keep', x, y);
  return r;
}
function roost(){
  const r = room(); walls(r); door(r, 'bottom', 26, 32); door(r, 'right', 14, 18);
  // up to the east door: a boulder, a shelf out of the west wall (a chest on it), a stalagmite, the door's own shelf
  pier(r, 20, 22, 5); pier(r, 15, 19, 9); shelf(r, 'L', 11, 8); shelf(r, 'R', 27, 13);
  rect(r, 6, 16, 9, 20); rect(r, 20, 19, 23, 20);                 // hanging rock
  mark(r, 'flitter', 13, 13); mark(r, 'flitter', 30, 17); mark(r, 'torch', 3, 12); mark(r, 'torch', 34, 4); mark(r, 'crystal', 24, 2); mark(r, 'crystal', 35, 14);
  mark(r, 'chest', 7, 9, { holds: 'shards' }); mark(r, 'urn', 30, 14);
  return r;
}
function bridge(){
  const r = room(); walls(r); door(r, 'left', 14, 18); door(r, 'right', 14, 18);
  rect(r, 2, 2, 37, 13);                                          // high ground both sides
  rect(r, 10, 2, 29, 13, EMPTY); rect(r, 10, 2, 29, 2, SPIKES);   // a chasm with spikes at the bottom
  pier(r, 13, 15, 11); pier(r, 19, 21, 13); pier(r, 25, 27, 11);  // the bridge: three pillars of the chasm's own rock
  for (const x of [11, 17, 23, 28]) for (const y of [4, 8, 11]) mark(r, 'keep', x, y);   // (the chasm between them stays a chasm: the wear would close it)
  rect(r, 15, 18, 17, 20); rect(r, 24, 19, 26, 20);
  rect(r, 2, 19, 10, 20);                                         // the bridge's west gate, roofed: Mirel waits in it, over the chasm he fell down
  mark(r, 'flitter', 20, 17); mark(r, 'torch', 5, 17); mark(r, 'torch', 34, 17); mark(r, 'crystal', 17, 3); mark(r, 'crystal', 11, 3); mark(r, 'crystal', 23, 3);
  mark(r, 'urn', 4, 14); mark(r, 'urn', 36, 14);
  return r;
}
// a basin of crystals and the shrine: it fills the flask and is where you wake
function grotto(){
  const r = room(); walls(r); door(r, 'left', 14, 18); door(r, 'right', 15, 19);
  rect(r, 2, 2, 37, 13); rect(r, 12, 8, 27, 13, EMPTY);           // the floor, and the basin in it
  rect(r, 12, 8, 14, 10); rect(r, 25, 8, 27, 10);                 // steps out of it, cut in its sides
  rect(r, 30, 14, 37, 14);                                        // a step up to the well
  mark(r, 'shrine', 20, 8); mark(r, 'crystal', 16, 8); mark(r, 'crystal', 24, 8); mark(r, 'crystal', 18, 8);
  mark(r, 'torch', 6, 17); mark(r, 'torch', 33, 18);
  mark(r, 'npc', 22, 8, { who: 'lamplighter' });
  return r;
}
// the top: a vast cavern over a long stage. The Warden rises at the back of it; the way on opens when it falls
function arena(){
  const r = room(2, 2); walls(r); door(r, 'bottom', 70, 76);
  rect(r, 2, 2, 77, 8);                                           // the stage
  rect(r, 70, 0, 76, 8, EMPTY); rect(r, 70, 2, 72, 3);                                           // up through it: a step left in the hole
  ledge(r, 9, 17, 15); ledge(r, 61, 69, 15);                      // high ground at either end, out of the sweep (stagings: on a strut and posts)
  door(r, 'right', 33, 38); rect(r, 64, 32, 77, 32);              // the deadhouse stair from the Ossuary comes out on a shelf too high to climb back to
  mark(r, 'boss', 40, 9); mark(r, 'exit', 6, 9);
  // the way up is in a niche at the stage's end, walled with cracked stone: the first thing the spade the Warden leaves
  // is used on (a gift is used at once, docs/phase3-sheet.md 6). Rock over the wall, so there is no way round it
  rect(r, 2, 14, 9, 43); rect(r, 8, 9, 9, 13, CRACKED); mark(r, 'keep', 4, 10); mark(r, 'keep', 6, 10);
  mark(r, 'torch', 13, 13); mark(r, 'torch', 30, 12); mark(r, 'torch', 50, 12); mark(r, 'torch', 72, 13); mark(r, 'crystal', 20, 9); mark(r, 'crystal', 60, 9);
  return r;
}
// ---- the second region: the Cloister, a ruined monastery cut into the mountain over the Warden's cavern. Halls,
// a bell tower three screens tall, cells to crawl through; two ways round to the chapel at the top.
function undercroft(){
  const r = room(); walls(r); door(r, 'right', 2, 7);
  rect(r, 13, 2, 17, 4); rect(r, 25, 2, 29, 4);                   // tombs: hop them
  ledge(r, 19, 23, 8);
  mark(r, 'spawn', 6, 2); mark(r, 'torch', 4, 7); mark(r, 'torch', 21, 12); mark(r, 'torch', 35, 9); mark(r, 'crystal', 15, 5); mark(r, 'crystal', 27, 5); mark(r, 'acolyte', 33, 2);
  mark(r, 'npc', 21, 2, { who: 'scribe' }); mark(r, 'urn', 10, 2); mark(r, 'urn', 36, 2);
  return r;
}
function nave(){
  const r = room(2, 1); walls(r); door(r, 'left', 2, 6); door(r, 'right', 2, 7);   // (the west door a row lower since the map pass: Corwen's gallery over it rests on the wall)
  for (const x of [18, 50]){ rect(r, x, 0, x + 5, 1, EMPTY); rect(r, x, 0, x + 5, 0, SPIKES); }   // two pits
  // (the map pass, build 101: the galleries were planks in the air. Now the hall's own stone: tombs and a plinth up from
  // its floor, each a hop, the higher one a step from the lower)
  ledge(r, 11, 15, 6); pier(r, 26, 33, 4); pier(r, 36, 44, 7); pier(r, 56, 63, 4); pier(r, 66, 73, 7);
  rect(r, 2, 6, 10, 7); rect(r, 2, 13, 11, 14); for (const x of [3, 6, 9]) mark(r, 'keep', x, 9);   // Corwen's carrel: a stone gallery over the west door, where the house's hours were written down (held to the wall, since the map pass)
  mark(r, 'acolyte', 21, 2); mark(r, 'acolyte', 60, 5); mark(r, 'wisp', 40, 11); mark(r, 'gargoyle', 22, 13); mark(r, 'gargoyle', 58, 14); mark(r, 'acolyte', 76, 2);
  mark(r, 'torch', 5, 8); mark(r, 'torch', 28, 12); mark(r, 'torch', 46, 9); mark(r, 'torch', 60, 12); mark(r, 'torch', 75, 8); mark(r, 'crystal', 11, 7); mark(r, 'crystal', 70, 8); mark(r, 'crystal', 34, 2);
  mark(r, 'urn', 6, 2); mark(r, 'urn', 49, 2); mark(r, 'urn', 76, 2); mark(r, 'chest', 40, 8, { holds: 'shards' });
  return r;
}
// three screens tall: ledges up past a door to the library, to a door onto the cloister walk; the bell's rope hangs above
function belfry(){
  const r = room(1, 3); walls(r); door(r, 'left', 2, 7); door(r, 'left', 25, 30); door(r, 'left', 48, 53);
  // (the map pass, build 101: the stair was fourteen planks in the air. Now it is the tower's own stone: a boulder at
  // its foot, the first turn, then shelves out of one wall and the other, six rows apart, the doors' landings among them)
  pier(r, 15, 19, 4);
  rect(r, 24, 7, 37, 8); for (const x of [32, 35]) mark(r, 'keep', x, 3);   // under the first turn of the bell stair, at the tower's foot: Mirel's place, as far from the door as the tower goes
  for (const [side, y] of [['L', 13], ['R', 19], ['L', 24], ['R', 29], ['L', 35], ['R', 41], ['L', 47], ['R', 53]]) shelf(r, side, side === 'L' ? 19 : 24, y);
  mark(r, 'gargoyle', 20, 16); mark(r, 'gargoyle', 12, 36); mark(r, 'wisp', 33, 33); mark(r, 'wisp', 6, 17); mark(r, 'bell', 20, 64);
  mark(r, 'torch', 34, 11); mark(r, 'torch', 5, 28); mark(r, 'torch', 34, 44); mark(r, 'torch', 5, 51); mark(r, 'crystal', 3, 2); mark(r, 'crystal', 34, 20); mark(r, 'crystal', 32, 55);
  mark(r, 'npc', 20, 22, { who: 'wren' }); mark(r, 'thread', 34, 55);
  return r;
}
function library(){
  const r = room(); walls(r); door(r, 'right', 2, 7); door(r, 'left', 2, 7);
  rect(r, 13, 2, 27, 2); rect(r, 15, 3, 25, 3);                   // the dais, stepped
  shelf(r, 'L', 11, 8, 1); shelf(r, 'R', 29, 8, 1);   // (galleries of the walls' stone since the map pass, build 101)
  mark(r, 'shrine', 20, 4); mark(r, 'crystal', 8, 9); mark(r, 'crystal', 32, 9); mark(r, 'torch', 4, 13); mark(r, 'torch', 36, 13); mark(r, 'torch', 14, 9); mark(r, 'torch', 26, 9);
  mark(r, 'npc', 23, 4, { who: 'lamplighter' });
  return r;
}
function cells(){
  const r = room(); walls(r); door(r, 'right', 2, 7); door(r, 'left', 2, 7);
  rect(r, 9, 5, 13, 20); rect(r, 19, 5, 23, 20); rect(r, 29, 5, 33, 20);   // the cell walls: crouch or roll under each
  mark(r, 'acolyte', 16, 2); mark(r, 'acolyte', 26, 2); mark(r, 'torch', 5, 9); mark(r, 'torch', 16, 9); mark(r, 'torch', 26, 9); mark(r, 'torch', 36, 9); mark(r, 'crystal', 16, 2);
  mark(r, 'urn', 6, 2); mark(r, 'urn', 36, 2);
  return r;
}
function stairwell(){
  const r = room(1, 2); walls(r); door(r, 'right', 2, 7); door(r, 'right', 25, 30);
  stairs(r, 30, 2, 10, -1, 2); rect(r, 2, 2, 10, 11);            // the long stair up to a landing against the wall
  ledge(r, 13, 19, 15); ledge(r, 24, 37, 21); ledge(r, 30, 37, 24);   // and on up to the walk (the map pass, build 101: the plank in the air between went; the step above reaches back to the stair)
  rect(r, 2, 30, 14, 43);                                         // the wall closes in over the landing
  mark(r, 'wisp', 26, 12); mark(r, 'gargoyle', 24, 30); mark(r, 'acolyte', 6, 12); mark(r, 'torch', 35, 9); mark(r, 'torch', 16, 12); mark(r, 'torch', 20, 26); mark(r, 'torch', 25, 36); mark(r, 'crystal', 4, 12); mark(r, 'crystal', 25, 19);
  corbel(r, 15, 21, 31, 'L', 1); rect(r, 4, 32, 12, 37, EMPTY); rect(r, 13, 32, 14, 36, CRACKED);   // a cell in the wall over the landing, walled up (before it, since the map pass, a corbel of the wall's own rock, not a plank)
  mark(r, 'chest', 6, 32, { holds: 'relic:lodestone' }); mark(r, 'thread', 10, 33); mark(r, 'urn', 8, 32); mark(r, 'chest', 8, 12, { holds: 'shards' });
  return r;
}
function cloister(){
  const r = room(2, 1); walls(r); door(r, 'left', 2, 7); door(r, 'right', 2, 7); door(r, 'top', 66, 72);
  for (const x of [14, 46]){ rect(r, x, 0, x + 5, 1, EMPTY); rect(r, x, 0, x + 5, 0, SPIKES); }
  // up to the chapel (the map pass, build 101: it was five planks in the air): a boulder in the floor; a step hung from
  // the vaulting; a step hung from the east wall under the chapel's hole; the floor left clear under them; a rung up
  // through the hole
  pier(r, 62, 66, 5); hung(r, 54, 57, 10, 61, 2); hung(r, 73, 77, 11, 66, 2); ledge(r, 66, 72, 17); ledge(r, 66, 72, 21);
  rect(r, 6, 17, 9, 20); rect(r, 26, 16, 29, 20); rect(r, 44, 17, 47, 20);   // broken vaulting
  mark(r, 'shrine', 36, 2);                                       // the last before the chapel
  mark(r, 'acolyte', 23, 2); mark(r, 'acolyte', 54, 2); mark(r, 'gargoyle', 40, 13); mark(r, 'gargoyle', 20, 14); mark(r, 'wisp', 50, 9);
  mark(r, 'torch', 5, 8); mark(r, 'torch', 24, 9); mark(r, 'torch', 42, 6); mark(r, 'torch', 57, 9); mark(r, 'torch', 75, 8); mark(r, 'crystal', 10, 2); mark(r, 'crystal', 76, 2); mark(r, 'crystal', 30, 2);
  mark(r, 'urn', 4, 2); mark(r, 'urn', 33, 2); mark(r, 'chest', 60, 12, { holds: 'shards' });
  return r;
}
// the top of the Cloister: the chapel, two screens high, where the Toll hangs. The way on opens when it falls
function chapel(){
  const r = room(2, 2); walls(r); door(r, 'bottom', 66, 72); ledge(r, 66, 72, 1);
  shelf(r, 'L', 11, 8, 1); shelf(r, 'R', 58, 8, 1);               // galleries at either end, out of its swing (the walls' stone since the map pass, build 101)
  mark(r, 'boss', 40, 2); mark(r, 'exit', 6, 2);
  mark(r, 'torch', 14, 9); mark(r, 'torch', 30, 9); mark(r, 'torch', 50, 9); mark(r, 'torch', 66, 9); mark(r, 'crystal', 22, 2); mark(r, 'crystal', 56, 2);
  return r;
}

// ---- the third region: the Spires, out in the open air near the summit. Nothing is filled in here: the rock is
// what each piece draws, the rest is sky. Caves in the mountain on the left; outside, a climb up between a needle and
// a tower, a rope bridge back across, a cavern of ice, the tower's teeth, a last bridge, and the summit.
// a column of 'keep' marks, so the rock's wear leaves the way up through a hole open
const keepUp = (r, x0, x1, y0, y1) => { for (let y = y0; y <= y1; y += 3) for (const x of [x0, x1]) mark(r, 'keep', x, y); };
function massif(){ const r = room(); rect(r, 0, 0, r.w - 1, r.h - 1); r.filler = true; return r; }   // the mountain itself
// the mountain's brow: the rock under the ice cave, leaning out over the gap
function brow(){ const r = room(); rect(r, 0, 13, r.w - 1, r.h - 1); rect(r, 0, 7, 27, 12); rect(r, 0, 1, 12, 6); r.filler = true;
  rect(r, 0, 6, 11, 10, EMPTY); mark(r, 'chest', 6, 6, { holds: 'relic:featherfall' }); mark(r, 'thread', 9, 7); mark(r, 'urn', 3, 6);   // the hole behind the chimney's wall
  return r; }
function mouth(){
  const r = room(); rect(r, 0, 0, r.w - 1, r.h - 1); rect(r, 2, 2, 37, 20, EMPTY); door(r, 'right', 2, 7);
  r.asks = 'dash'; rect(r, 38, 2, 39, 7, VELLUM);   // (build 87; `asks`: this room's pane is on the climb itself, not at a wing's door) thin ice has grown across the way up into the Spires: the Cracked Bell's step breaks it. The Bell-Foundry is part of the climb now (decision 0.13)
  rect(r, 2, 2, 4, 3); stone(r, 12, 18, 6);   // (a block of the floor since the map pass: the plank was too low to pass under)
  mark(r, 'spawn', 7, 2); mark(r, 'torch', 5, 8); mark(r, 'torch', 30, 7); mark(r, 'crystal', 22, 2); mark(r, 'crystal', 15, 7);
  mark(r, 'npc', 28, 2, { who: 'scribe' }); mark(r, 'urn', 33, 2); mark(r, 'urn', 35, 2);
  return r;
}
function saddle(){
  const r = open(2, 1);
  rect(r, 0, 0, 79, 1); rect(r, 0, 8, 3, 22);                     // the ground; the cliff over the cave's mouth
  for (const x of [20, 44]){ rect(r, x, 0, x + 5, 1, EMPTY); rect(r, x, 0, x + 5, 0, SPIKES); }   // crevasses, iced
  rect(r, 10, 2, 14, 3); rect(r, 30, 2, 37, 4); rect(r, 32, 5, 35, 5);   // outcrops
  rect(r, 54, 8, 57, 22); rect(r, 66, 2, 79, 22); keepOver(r, 58, 65, 5); for (const y of [9, 13, 17]) keepOver(r, 58, 65, y);   // the needle (a flake off the tower: the way in is under it), and the foot of the tower (its face kept whole since the map pass: the wear had cut a notch in it, and a step hung in the air)
  ledge(r, 58, 65, 5); ledge(r, 58, 61, 9); ledge(r, 62, 65, 14); ledge(r, 58, 61, 17); ledge(r, 62, 65, 21);   // up between them (the third a row up since the map pass: beside the mouth of the way out of the glacier it hung in the air)
  mark(r, 'harpy', 26, 12); mark(r, 'yeti', 40, 2); mark(r, 'yeti', 16, 2);
  mark(r, 'torch', 6, 9); mark(r, 'crystal', 12, 4); mark(r, 'crystal', 33, 6); mark(r, 'crystal', 52, 2); mark(r, 'torch', 64, 8);
  rect(r, 40, 13, 44, 14); mark(r, 'thread', 42, 15);                    // a rock adrift in the air, and what is caught on it
  mark(r, 'urn', 8, 2); mark(r, 'urn', 50, 2); mark(r, 'chest', 35, 6, { holds: 'shards' });
  return r;
}
function spire(){
  const r = open(1, 2);
  rect(r, 14, 0, 17, 45); rect(r, 26, 0, 39, 34); rect(r, 30, 35, 33, 45); rect(r, 36, 35, 39, 45);   // the needle; the tower; the two teeth that rise from its top
  ledge(r, 18, 21, 2); ledge(r, 22, 25, 6); ledge(r, 18, 21, 10); ledge(r, 22, 25, 14); ledge(r, 18, 21, 18); ledge(r, 22, 25, 22);
  rect(r, 14, 25, 17, 30, EMPTY); ledge(r, 0, 17, 24);            // a gap through the needle: the rope bridge leaves here
  ledge(r, 18, 25, 26); ledge(r, 22, 25, 30);                     // and on, to the top of the tower (the first reaching the tower since the map pass: the needle is cut through beside it)
  mark(r, 'harpy', 20, 40); mark(r, 'wraith', 8, 30); mark(r, 'crystal', 27, 35); mark(r, 'crystal', 34, 35); mark(r, 'torch', 12, 28);
  return r;
}
function nest(){
  const r = open();
  rect(r, 0, 0, 5, 22); rect(r, 6, 8, 30, 11);                    // the mountain's face; a shelf out of it, under the bridge
  stone(r, 6, 10, 16); ledge(r, 6, 10, 20);                       // back up to the bridge (the first a step of the shelf since the map pass)
  mark(r, 'harpy', 18, 16); mark(r, 'yeti', 24, 12); mark(r, 'crystal', 26, 12); mark(r, 'crystal', 12, 12);
  mark(r, 'npc', 16, 12, { who: 'wren' });
  return r;
}
function ropeway(){
  const r = open();
  rect(r, 0, 0, 3, 1); rect(r, 0, 8, 2, 22);                      // the sill of the hollow's door, the face above it
  ledge(r, 4, 8, 1); ledge(r, 11, 16, 1); ledge(r, 19, 24, 1); ledge(r, 27, 32, 1); ledge(r, 35, 39, 1);   // the bridge, broken
  mark(r, 'harpy', 14, 6); mark(r, 'torch', 2, 4);
  return r;
}
function hollow(){
  const r = room(); rect(r, 0, 0, r.w - 1, r.h - 1); rect(r, 2, 2, 37, 20, EMPTY); door(r, 'right', 2, 7); door(r, 'top', 8, 14);
  rect(r, 21, 2, 31, 2); rect(r, 23, 3, 29, 3);                   // the shrine's step
  stone(r, 10, 16, 5); [[17, 22, 9], [8, 14, 13], [8, 14, 17], [8, 14, 21]].forEach(([a, b, y]) => ledge(r, a, b, y)); rect(r, 7, 13, 7, 20);   // (since the map pass, the rungs under the hole against a stone side, the west: he comes onto them from the east; and the step before them a block of the shrine's ground)
  mark(r, 'shrine', 26, 4); mark(r, 'torch', 34, 9); mark(r, 'torch', 5, 9); mark(r, 'torch', 26, 14); mark(r, 'crystal', 34, 2); mark(r, 'crystal', 4, 2);
  mark(r, 'npc', 29, 4, { who: 'lamplighter' });
  return r;
}
function chimney(){
  const r = room(); rect(r, 0, 0, r.w - 1, r.h - 1); rect(r, 2, 2, 37, 20, EMPTY); door(r, 'bottom', 8, 14); door(r, 'top', 26, 32);
  ledge(r, 8, 14, 1);
  // (the map pass, build 102: a boulder, a plank on the floor's ground, a shelf of the east wall, and rungs under the hole)
  pier(r, 15, 20, 5); ledge(r, 22, 25, 9); shelf(r, 'R', 26, 13); keepOver(r, 22, 37, 13); ledge(r, 26, 32, 17); ledge(r, 26, 32, 21);
  rect(r, 4, 14, 8, 20); rect(r, 33, 2, 37, 5);
  mark(r, 'wraith', 30, 8); mark(r, 'wraith', 10, 8); mark(r, 'torch', 4, 7); mark(r, 'torch', 36, 19); mark(r, 'crystal', 35, 6); mark(r, 'crystal', 17, 6);
  rect(r, 38, 6, 39, 10, CRACKED);                                   // the wall is thin here: there is a hole in the brow behind it
  return r;
}
// a cavern of ice through the mountain, out to its far face
function icecave(){
  const r = room(2, 1); rect(r, 0, 0, r.w - 1, r.h - 1); rect(r, 2, 2, 77, 20, EMPTY); door(r, 'bottom', 26, 32); ledge(r, 26, 32, 1); door(r, 'right', 2, 7);
  rect(r, 2, 2, 12, 5);                                           // a bank of ice at the back
  for (const x of [38, 60]){ rect(r, x, 0, x + 5, 1, EMPTY); rect(r, x, 0, x + 5, 0, SPIKES); }   // pits of ice
  rect(r, 47, 5, 55, 20);                                         // the roof comes down: crouch or roll under it
  ledge(r, 14, 20, 6); stone(r, 33, 37, 6); ledge(r, 66, 71, 7);   // (the last over firm ice, not the pit, and the middle a block of ice at the pit's lip, since the map pass)
  mark(r, 'yeti', 20, 2); mark(r, 'wraith', 34, 12); mark(r, 'wraith', 66, 12); mark(r, 'yeti', 72, 2);
  mark(r, 'torch', 5, 9); mark(r, 'torch', 24, 10); mark(r, 'torch', 43, 9); mark(r, 'torch', 58, 10); mark(r, 'torch', 75, 10); mark(r, 'crystal', 7, 6); mark(r, 'crystal', 44, 2); mark(r, 'crystal', 67, 8); mark(r, 'crystal', 57, 2);
  mark(r, 'urn', 16, 2); mark(r, 'urn', 30, 2); mark(r, 'urn', 74, 2); mark(r, 'chest', 4, 6, { holds: 'shards' });
  return r;
}
// outside again, high over the tower: its teeth to cross, and the horn to climb
function teeth(){
  const r = open(1, 2);
  rect(r, 14, 0, 17, 26); rect(r, 30, 0, 33, 30); rect(r, 36, 0, 39, 45);   // the needle's tip, the middle tooth, the horn
  rect(r, 0, 23, 10, 24);                                         // the sill of the ice cave's door, running out as a lip of rock (a plank out from it, until the map pass)
  corbel(r, 24, 29, 27, 'R', 1); rect(r, 18, 26, 24, 26);         // between the needle and the tooth: a lip of the tooth's rock, and a ridge from the needle's top out to it (so the needle's tip is held by the tooth, not standing on the gap the bridge goes through)
  for (let y = 15; y <= 22; y += 2) for (let x = 1; x <= 12; x += 2) mark(r, 'keep', x, y);   // the air under the sill and beside the needle, and under the lip,
  for (let y = 19; y <= 26; y += 2) for (let x = 18; x <= 29; x += 2) mark(r, 'keep', x, y);  // kept from the wear (it had swollen them into one mass of rock)
  ledge(r, 34, 35, 33); ledge(r, 32, 35, 37); ledge(r, 32, 35, 44);   // up the horn (no rung beside the ice pane in it, since the map pass)
  mark(r, 'harpy', 22, 34); mark(r, 'wraith', 24, 40); mark(r, 'crystal', 15, 27); mark(r, 'crystal', 31, 31); mark(r, 'torch', 2, 28);
  return r;
}
// the last bridge, from the horn's tip back to the mountain
function span(){
  const r = open();
  rect(r, 36, 0, 39, 12); rect(r, 0, 0, 2, 1); rect(r, 0, 8, 1, 22);   // the horn's tip; the eyrie's sill, the face over its door
  ledge(r, 32, 35, 1); ledge(r, 23, 28, 1); ledge(r, 14, 19, 1); ledge(r, 5, 10, 1); ledge(r, 3, 4, 1);
  mark(r, 'harpy', 12, 8); mark(r, 'torch', 2, 4); mark(r, 'crystal', 37, 13);
  return r;
}
// under the summit: a long cave, the last shrine, and the way up through its roof
function eyrie(){
  const r = room(2, 1); rect(r, 0, 0, r.w - 1, r.h - 1); rect(r, 2, 2, 77, 20, EMPTY); door(r, 'right', 2, 7); door(r, 'top', 36, 42);
  // the leaking rock: water seeps through it (the leak is on its top, on the way across), and under it is a hollow
  // out of the wind, Mirel's. A step up to it either side
  rect(r, 50, 2, 62, 8); den(r, 50, 57, 2, 5, { open: 'L', back: 0 }); rect(r, 45, 2, 47, 4); rect(r, 63, 2, 65, 4);
  // (the map pass, build 102: rock hung from the roof beside the hole, a step out of its foot under it, the floor clear below)
  stone(r, 20, 26, 5); [[28, 34, 9], [36, 42, 18], [36, 42, 21]].forEach(([a, b, y]) => ledge(r, a, b, y)); hung(r, 43, 45, 12, 36); keepUp(r, 37, 41, 15, 20); keepUp(r, 47, 49, 9, 18);   // (the rock three wide: four tiles of air between it and the leaking rock, so he walks off that west)
  rect(r, 2, 2, 8, 4);
  mark(r, 'shrine', 58, 9); mark(r, 'yeti', 14, 2); mark(r, 'wraith', 30, 12);
  mark(r, 'torch', 5, 9); mark(r, 'torch', 30, 5); mark(r, 'torch', 46, 9); mark(r, 'torch', 66, 9); mark(r, 'torch', 75, 9); mark(r, 'crystal', 4, 5); mark(r, 'crystal', 70, 2); mark(r, 'crystal', 44, 2);
  mark(r, 'chest', 7, 5, { holds: 'shards' }); mark(r, 'urn', 70, 2); mark(r, 'urn', 74, 2);
  return r;
}
// the summit: a crown of rock under the open sky, where the Rime Wyrm keeps the peak. The beacon is lit when it falls
function crown(){
  const r = open(2, 2);
  rect(r, 0, 0, 79, 1); rect(r, 36, 0, 42, 1, EMPTY); ledge(r, 36, 42, 1);   // the top of the mountain, the way up through it
  rect(r, 0, 2, 3, 26); rect(r, 76, 2, 79, 22);                   // a horn of rock at either end
  // (build 97, docs/wyrm-sheet.md: the broken pass, three levels.) The pass, its middle the gap he came up through, which
  // is cloud while the Wyrm fights (wyrm.js); a shelf at each horn and one each side of the middle; and a slab high over
  // the gap. Each of its attacks takes one level away from him
  ledge(r, 4, 9, 8); ledge(r, 70, 75, 8); ledge(r, 20, 26, 8); ledge(r, 53, 59, 8); ledge(r, 33, 46, 14);
  mark(r, 'boss', 40, 2); mark(r, 'exit', 12, 2);
  mark(r, 'torch', 18, 7); mark(r, 'torch', 62, 7); mark(r, 'crystal', 24, 2); mark(r, 'crystal', 56, 2);
  return r;
}

// the regions, from the bottom of the mountain up: rooms on a grid, [column, row, builder, columns wide, rows tall].
// `fill` is what is between the rooms; `wear` is how hard the organic pass works the rock
const REGIONS = [
  { name: 'The Roots', theme: 'roots', sub: 'the caves at the bottom of the mountain', card: '', epithet: 'IT HAS FORGOTTEN WHAT IT GUARDS', quiet: ['arena', ...OSSUARY.QUIET, ...DROWNED.QUIET], deco: (px, PAL) => ({ ...DROWNED.decoDef(px, PAL), ...OSSUARY.decoDef(px, PAL), ...ROOTSFAR.decoDef(px, PAL) }), enemies: { ...DROWNED.enemies, ...OSSUARY.enemies }, ai: { ...DROWNED.ai, ...OSSUARY.ai }, seed: 1234567, wear: { sag: 1, swell: 1, humps: 0.8 },
    layout: [[0, 0, start], [1, 0, corridor], [2, 0, pithead], [2, 1, oldshaft], [1, 1, shaft], [0, 1, tunnel], [0, 2, chamber], [1, 2, ascent], [2, 2, gallery], [3, 2, well, 1, 2], [0, 3, roost], [1, 3, bridge], [2, 3, grotto], [2, 4, arena, 2, 2], ...OSSUARY.LAYOUT], looks: OSSUARY.LOOKS },
  { name: 'The Cloister', theme: 'cloister', sub: 'a monastery that rang its bell for the flame', card: 'The caves are below you. Keep climbing.', epithet: 'IT RINGS FOR A LIGHT IT CANNOT SEE', quiet: ['chapel', ...SCRIPTORIUM.QUIET, ...FOUNDRY.QUIET, ...REFECTORY.QUIET], enemies: { ...SCRIPTORIUM.enemies, ...FOUNDRY.enemies, ...CLOISTERFAR.enemies }, ai: { ...SCRIPTORIUM.ai, ...FOUNDRY.ai, ...CLOISTERFAR.ai }, deco: (px, PAL) => ({ ...SCRIPTORIUM.decoDef(px, PAL), ...FOUNDRY.decoDef(px, PAL), ...REFECTORY.decoDef(px, PAL), ...CLOISTERFAR.decoDef(px, PAL) }), looksDef: { ...SCRIPTORIUM.looks, ...FOUNDRY.looks, ...CLOISTERFAR.looks }, seed: 7654321, wear: { sag: 0.55, swell: 0.5, humps: 0.4 },
    layout: [[0, 0, undercroft], [1, 0, nave, 2, 1], [3, 0, belfry, 1, 3], [0, 1, stairwell, 1, 2], [1, 1, cells], [2, 1, library], [1, 2, cloister, 2, 1], [1, 3, chapel, 2, 1]] },
  { name: 'The Spires', theme: 'spires', sub: 'the open air, and the high pass', card: 'Out of the stone, into the cold and the open sky.', epithet: 'IT COILS ON THE PASS, AND LETS NONE BY', quiet: ['crown', ...CAIRNS.QUIET, ...GLACIER.QUIET], enemies: { ...CAIRNS.enemies, ...GLACIER.enemies }, ai: { ...CAIRNS.ai, ...GLACIER.ai }, deco: (px, PAL) => ({ ...CAIRNS.decoDef(px, PAL), ...GLACIER.decoDef(px, PAL) }), looksDef: GLACIER.looks, seed: 2468102, fill: EMPTY, sky: true, wear: { sag: 1.1, swell: 0.5, humps: 0.6 },
    layout: [[0, 0, mouth], [1, 0, saddle, 2, 1], [0, 1, massif], [1, 1, nest], [2, 1, spire, 1, 2], [0, 2, hollow], [1, 2, ropeway], [0, 3, chimney], [1, 3, brow], [0, 4, icecave, 2, 1], [2, 3, teeth, 1, 2],
      [0, 5, eyrie, 2, 1], [2, 5, span], [0, 6, crown, 2, 2]], cols: 3 },
  // each in its own file (regions/); the Tempest with what its wing brings (regions/works.js)
  { ...tempest, quiet: [...tempest.quiet, ...WORKS.QUIET, ...EYE.QUIET], enemies: { ...tempest.enemies, ...WORKS.enemies, ...EYE.enemies }, ai: { ...tempest.ai, ...WORKS.ai, ...EYE.ai }, deco: (px, PAL) => ({ ...tempest.deco(px, PAL), ...WORKS.decoDef(px, PAL), ...EYE.decoDef(px, PAL) }), looksDef: EYE.looks },
  { ...gardens, quiet: [...(gardens.quiet || []), ...AQUEDUCTS.QUIET, ...HOUSES.QUIET], enemies: { ...gardens.enemies, ...AQUEDUCTS.enemies, ...HOUSES.enemies }, ai: { ...gardens.ai, ...AQUEDUCTS.ai, ...HOUSES.ai }, deco: (px, PAL) => ({ ...gardens.deco(px, PAL), ...AQUEDUCTS.decoDef(px, PAL), ...HOUSES.decoDef(px, PAL) }), looksDef: { ...AQUEDUCTS.looks, ...HOUSES.looks } },   // the Gardens with what their wing brings (regions/aqueducts.js)
  { ...firmament, quiet: [...(firmament.quiet || []), ...ORRERY.QUIET], enemies: { ...firmament.enemies, ...ORRERY.enemies }, ai: { ...firmament.ai, ...ORRERY.ai }, deco: (px, PAL) => ({ ...firmament.deco(px, PAL), ...ORRERY.decoDef(px, PAL) }), looksDef: ORRERY.looksOf(firmament.themeDef) },   // the Firmament with what its wing brings (regions/orrery.js)
  workings,   // the Deep: off the climb, under it (deep: true)
  vein,       // and under that, behind the guild's seal (dark: true)
  flooded,    // under the Workings' cistern, down its sump: deep water (needs the Wyrm's wind)
  greatshaft, // below the Vein's lip: the Auger's hole
  thehollow,  // under the Shaft's floor: the Auger, and the Source
];
export const LEVELS = REGIONS.map(r => ({ name: r.name, theme: r.theme, sub: r.sub || '', card: r.card || '', epithet: r.epithet || '' }));
export const REGION_DATA = REGIONS;
// the climb: the regions one above another (the Deep is off it); its top is the summit
export const DEEP = { shut: true };   // is the Deep shut (decision 0.12)? One switch: opening it is this, set false (or, later, something he does)
const SOLID_ROCK = 1;
export const CLIMB_TOP = REGIONS.reduce((t, R, n) => R.deep ? t : n, 0);   // a region's own look, creatures and music, where its file has them (themeDef, deco, enemies, ai, songs)
const QUIET = new Set(REGIONS.flatMap(r => r.quiet || []));   // a boss's stage stays flat (its blows run along it)

// where the wear (organic) left a place he could wedge into and never leave, filled: found by the stuck-finder
// (tests/helpers/stuck.mjs; tests/side-stuck.test.mjs fails on any new one). Whole tiles, x0 y0 x1 y1, by region
const FILL = {
  0: [[92, 125, 92, 127]],     // the Warden's hall: a notch the wear leaves high in the west wall
  1: [[64, 109, 64, 112]],     // the Cloister's cells: a notch beside the narrow shaft
  2: [[107, 150, 107, 153]],   // the Spires' teeth: a tooth of rock under an overhang
};
// what clings: a spitter to a wall, a lamprey to a roof (or, with none near, a wall). Each is put against the nearest
// one, so none hangs in the air (a playtest found one): at its height, a wall within twelve tiles to either side; else
// the nearest row up to six above or below that has one within four. enemies.js then sets the drawing against it
export const CLINGS = { spitter: 'wall', lamprey: 'ceiling' };
function clingers(tiles, W, H, marks){
  const rock = (i, j) => i < 0 || j < 0 || i >= W || j >= H || tiles[j * W + i] === ROCK || tiles[j * W + i] === CRACKED;
  const wallNear = (x, y, far) => { for (let k = 1; k <= far; k++) for (const s of [-1, 1]){ const at = x + s * (k - 1); if (rock(x + s * k, y + 1) && !rock(at, y + 1) && !rock(at, y) && !rock(at, y + 2)) return at; } return null; };   // open air where it goes
  const roofNear = (x, y) => { for (let k = 1; k <= 17; k++) if (rock(x, y + k)) return y + k - 2; return null; };
  for (const m of marks){
    const kind = CLINGS[m.type]; if (!kind || rock(m.x, m.y)) continue;
    if (kind === 'ceiling' && roofNear(m.x, m.y) !== null) continue;
    const at = wallNear(m.x, m.y, 12); if (at !== null){ m.x = at; continue; }
    for (let d = 1; d <= 6; d++){ let done = false; for (const dy of [d, -d]){ const w = wallNear(m.x, m.y + dy, 4); if (w !== null && !rock(w, m.y + dy)){ m.x = w; m.y += dy; done = true; break; } } if (done) break; }
  }
}
function core(n){
  // a seam (seams.js) goes under the region's first room: the region is moved up by its rows, its rooms beneath
  const R = REGIONS[n], SEAM = SEAMS[n], LAYOUT = SEAM ? [...SEAM.layout, ...R.layout.map(l => [l[0], l[1] + SEAM.rows, ...l.slice(2)])] : R.layout;
  const cols = Math.max(R.cols || 0, ...LAYOUT.map(l => l[0] + (l[3] || 1))), rows = Math.max(...LAYOUT.map(l => l[1] + (l[4] || 1)));
  const W = cols * ROOM.w, H = rows * ROOM.h, tiles = new Uint8Array(W * H).fill(R.fill === undefined ? ROCK : R.fill), marks = [], rooms = [];
  if (SEAM) tiles.fill(ROCK, 0, SEAM.rows * ROOM.h * W);   // under a region of sky, the seam is in the mountain: rock beside it
  for (const [cx, cy, make] of LAYOUT){
    const r = make(), ox = cx * ROOM.w, oy = cy * ROOM.h;
    for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++) tiles[(oy + y) * W + ox + x] = r.tiles[y][x];
    for (const m of r.marks) marks.push({ ...m, x: ox + m.x, y: oy + m.y });
    if (!r.filler) rooms.push({ name: make.name, title: r.title || '', gate: r.gate || '', open: !!r.open, ...(r.after ? { after: true } : {}), ...(r.needs ? { needs: r.needs } : {}), ...(r.asks ? { asks: r.asks } : {}), x0: ox * T, y0: oy * T, x1: (ox + r.w) * T, y1: (oy + r.h) * T, tx0: ox, ty0: oy, tx1: ox + r.w, ty1: oy + r.h });
  }
  if (SEAM){   // he comes in at the seam's foot (the region's own start is let go); a hole up into the first room, boarded
    let first = true; for (let k = marks.length - 1; k >= 0; k--) if (marks[k].type === 'spawn'){ if (marks.slice(0, k).some(m => m.type === 'spawn')) marks.splice(k, 1); }
    const y0 = SEAM.rows * ROOM.h; for (let x = SEAM.link[0]; x <= SEAM.link[1]; x++){ for (let y = y0 - 2; y <= y0; y++) tiles[y * W + x] = EMPTY; tiles[(y0 + 1) * W + x] = LEDGE; }
  }
  // the way in still wears the look of the region below: he comes up into what he just left, and it changes round him
  // as he goes on (render.js paints such a room in both looks and lays one into the other). A region can say otherwise:
  // `looks: { room: theme }`, or `vestibule: false`
  const spawn = marks.find(m => m.type === 'spawn'), first = spawn && rooms.find(r => spawn.x >= r.tx0 && spawn.x < r.tx1 && spawn.y >= r.ty0 && spawn.y < r.ty1);
  if (n > 0 && first && R.vestibule !== false) first.look = REGIONS[n - 1].theme;
  for (const r of rooms) if (R.looks && R.looks[r.name]) r.look = R.looks[r.name];
  nooks(tiles, W, H, marks, rooms, STATIONS[n], MEETINGS[n], n);
  stations(tiles, W, H, marks, rooms, STATIONS[n]);
  const raw = tiles.slice();
  organic(tiles, W, H, marks, rooms, R.seed, R.wear);
  for (let k = 0; k < raw.length; k++) if (raw[k] === ROUGH || raw[k] === TIER_A || raw[k] === TIER_B) tiles[k] = raw[k];   // rough rock and the bore's floors stay exactly as drawn
  for (const [x0, y0, x1, y1] of FILL[n] || []) for (let j = y0; j <= y1; j++) for (let i = x0; i <= x1; i++) tiles[j * W + i] = ROCK;   // the pockets the wear left
  clingers(tiles, W, H, marks);
  // where a gargoyle sits: a stone corbel out of the nearest wall at its height, or, with no wall near, a plinth up from
  // the floor under it. Worked out once, here, so the painter draws the stone (paint.js) and the creature sits on it
  // (enemies.js); the stone stays when the creature is gone. perch: { x, y (where its feet are), side (-1 the wall to
  // its left, 1 to its right, 0 a plinth), wall, base }
  { const at = (i, j) => i < 0 || j < 0 || i >= W || j >= H ? ROCK : tiles[j * W + i];
    // never by one of the people (a playtest found a plinth through Ordric), and a plinth only on rock, never a plank
    const people = marks.filter(k => k.type === 'npc'), clear = (x, y) => people.every(k => Math.abs(k.x - x) >= 8 || Math.abs(k.y - y) >= 12);
    // (and room for the creature itself on its corbel: three tiles out from the wall, three up, clear of rock and of
    // spikes. Build 79: one in the Cloister's stair sat with its head in an overhang; two plinths stood in spike pits)
    const room = (i, s, py) => [1, 2, 3].every(c => [1, 2, 3].every(r => at(i - s * c, py + r) !== ROCK && at(i - s * c, py + r) !== SPIKES));
    const corbel = (x, py, far) => { for (let k = 1; k <= far; k++) for (const s of [-1, 1]){ const i = x + s * k; if (at(i, py) === ROCK && at(i, py + 1) === ROCK && at(i - s, py) !== ROCK && at(i - s, py + 1) !== ROCK && at(i - s, py + 2) !== ROCK && clear(i - s * 2, py) && room(i, s, py)) return { s, i }; } return null; };
    for (const m of marks) if (m.type === 'gargoyle'){
      const py = m.y + 2; let best = null, row = py;
      // a corbel out of a wall: at its height, then a little above or below, then further across the room
      for (const [dy, far] of [[0, 9], [1, 9], [-1, 9], [2, 9], [-2, 9], [3, 12], [-3, 12], [4, 14], [-4, 14], [6, 16], [-6, 16]]){ best = corbel(m.x, py + dy, far); if (best){ row = py + dy; break; } }
      if (best){ m.perch = { x: best.i - best.s * 2, y: row + 1, side: best.s, wall: best.i }; continue; }
      // else a plinth up from rock below, where the people are not, as near as can be
      for (const dx of [0, 2, -2, 4, -4, 6, -6, 8, -8, 10, -10, 12, -12]){
        const x = m.x + dx; let j = m.y; while (j > 0 && at(x, j - 1) !== ROCK && at(x, j - 1) !== LEDGE) j--;
        if (at(x, j - 1) !== ROCK || at(x - 1, j - 1) !== ROCK || at(x + 1, j - 1) !== ROCK || !clear(x, j)) continue;   // its foot on rock, three wide
        if ([-1, 0, 1].some(a => at(x + a, j) === SPIKES)) continue;   // and not in a pit of spikes
        m.perch = { x, y: Math.max(j + 4, Math.min(m.y + 2, j + 8)), side: 0, base: j }; break;
      }
    } }
  // every torch is mounted (phase 8): in a bracket on a wall beside it (mount 'wall', side: which way the wall is), or
  // on a stand up from the floor under it (mount 'stand', base: the floor's row). One with neither is moved to the
  // nearest wall at its height, or stood on the floor below; one with nothing near is taken away
  mountTorches(tiles, W, H, marks);
  // the Deep is shut (decision 0.12, 21 Nov 2026: he was there early in both playtests, and felt he should not be). A
  // way down into it from the climb is stopped with rock, and its mark says so (main.js draws the hatch nailed down and
  // does not take him through). The ways up out of it are left, for a save that is already down there
  if (DEEP.shut && !R.deep) for (const m of marks) if (m.type === 'pass' && REGIONS[m.to] && REGIONS[m.to].deep){ m.shut = true; for (let y = m.y; y < m.y + 2; y++) for (let x = m.x; x < m.x + (m.w || 2); x++) tiles[y * W + x] = SOLID_ROCK; m.y += 2; m.h = 1; }   // (its mark is moved up onto the floor that is there now: no marker is left inside rock)
  return { index: n, name: R.name, theme: R.theme, sky: !!R.sky, deep: !!R.deep, W, H, tiles, marks, rooms, raw };
}
// every torch without a mount yet: put on a wall beside it or a stand under it (see core)
function mountTorches(tiles, W, H, marks){
  { const at = (i, j) => i < 0 || j < 0 || i >= W || j >= H ? ROCK : tiles[j * W + i], air = (i, j) => at(i, j) === EMPTY;
    const wallBy = (x, y) => at(x - 1, y) === ROCK ? -1 : at(x + 1, y) === ROCK ? 1 : 0;
    const floorUnder = (x, y, far) => { for (let k = 1; k <= far; k++){ const t = at(x, y - k); if (t === ROCK || t === LEDGE) return y - k + 1; } return null; };
    for (const m of marks) if (m.type === 'torch' && !m.mount){
      if (!air(m.x, m.y)){ const up = [1, 2, -1, 3].find(d => air(m.x, m.y + d)); if (up === undefined){ m.type = 'gone'; continue; } m.y += up; }
      let side = wallBy(m.x, m.y);
      if (!side){ const base = floorUnder(m.x, m.y, 5); if (base !== null){ m.mount = 'stand'; m.base = base; continue; }
        const to = [1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6, -6].find(d => air(m.x + d, m.y) && wallBy(m.x + d, m.y));
        if (to !== undefined){ m.x += to; side = wallBy(m.x, m.y); }
        else { const far = floorUnder(m.x, m.y, 12); if (far === null || ![0, 1, 2, 3, 4].every(k => air(m.x, far + k))){ m.type = 'gone'; continue; } m.y = far + 4; m.mount = 'stand'; m.base = far; continue; } }
      m.mount = 'wall'; m.side = side;
    }
    for (let k = marks.length - 1; k >= 0; k--) if (marks[k].type === 'gone') marks.splice(k, 1); }   // what was taken away is not there
}

// ---- the joins (phase 9, docs/phase9-sheet.md): one continuous mountain. Between a keeper's hall and the passage on
// is a sill: a tunnel through a mass of rock, the same tile for tile in the region below (beside its keeper's hall)
// and in the region above (at the very bottom, under its passage). He walks through it; in its middle, where nothing
// but the sill is in view, the region below is let go and the one above put in its place (main.js cross). So a sill is
// wider and taller than the view, and all rock but its tunnel.
//   dir   which way he walks, going up the mountain (1 right, -1 left): set by where there is room beside the hall
//   a     the hall's floor, in rows over the hall's base (the stage; in the Roots, the niche behind the cracked wall)
//   gap   tiles of open air between the hall and the sill, bridged with planks (where a room is under the hall's side)
//   rows  rows of rooms added under the region above: the sill, and the passage's lower stretch (seams.js LOWER)
export const SILL = { w: 80, h: 38, floor: 14, tall: 6 };
export const JOINS = {
  1: { dir: -1, a: 9, gap: 0, rows: 2, title: 'THE CRYPT STAIR' },
  2: { dir: 1, a: 2, gap: 0, rows: 3, title: 'THE BELL ROAD' },
  3: { dir: 1, a: 2, gap: 40, rows: 3, title: 'THE LAST HUT' },
  4: { dir: -1, a: 2, gap: 0, rows: 2, title: 'THE BREACH' },
  5: { dir: 1, a: 2, gap: 40, rows: 3, title: 'THE LONG STAIR' },
};
// a sill's tiles, rows from the bottom: rock, and the tunnel through it. From the hall's side its floor is the hall's
// (row a), then a stair up to the middle's (SILL.floor), level from there to the far end
export function sill(k){
  const J = JOINS[k], t = []; for (let y = 0; y < SILL.h; y++) t.push(new Array(SILL.w).fill(ROCK));
  for (let x = 0; x < SILL.w; x++){ const d = J.dir > 0 ? x : SILL.w - 1 - x, f = Math.min(SILL.floor, J.a + Math.max(0, (d - 2) >> 1));   // d: tiles in from the hall's side
    for (let y = f; y < SILL.floor + SILL.tall; y++) t[y][x] = EMPTY; }   // one roof all along: over the stair it is a tall mouth, narrowing
  return t;
}
// the region as built, set in its place: rows added under it for the join from below (the sill, and the passage's
// lower stretch up to the raising water's room), and beside its keeper's hall the sill of the join above, the way out
// of the hall sealed until the keeper falls. What core made is moved whole, never changed: its wear, its people's
// places and what the tests measure stay as they were
// (build 115) every level stands on rows of the mountain's rock that nothing is cut in yet, and has a row over it: room to
// grow down or up without moving the level again. What is built is moved whole: its tiles, its marks, its rooms, its joins
export const LIFT = { base: 2, top: 1 };
function lifted(L, fill = ROCK){
  // (the row over it is rock's only: over a level that stands under the sky a row of open air would join, over the tops of
  // its walls, places that are shut off from each other; such a level grows upward when something is built there, and
  // nothing has to be moved for that)
  const dy = LIFT.base * ROOM.h, up = fill === ROCK ? LIFT.top * ROOM.h : 0, W = L.W, H = L.H + dy + up, grow = a => { const out = new Uint8Array(W * H).fill(ROCK); out.fill(fill, (dy + L.H) * W); out.set(a, dy * W); return out; };
  const row = v => v == null ? v : v + dy, mk = m => ({ ...m, y: m.y + dy, ...(m.base != null ? { base: m.base + dy } : {}), ...(m.perch ? { perch: { ...m.perch, y: m.perch.y + dy, ...(m.perch.base != null ? { base: m.perch.base + dy } : {}) } } : {}) });
  const joins = {}; for (const [k, J] of Object.entries(L.joins || {})) joins[k] = { ...J, y: J.y + dy, ...(J.seal ? { seal: J.seal.map(id => { const [x, y] = id.split(','); return x + ',' + (+y + dy); }) } : {}) };
  return { ...L, H, tiles: grow(L.tiles), raw: grow(L.raw), marks: L.marks.map(mk), joins, Y0: row(L.Y0 || 0), over: up,
    rooms: L.rooms.map(r => ({ ...r, y0: r.y0 + dy * T, y1: r.y1 + dy * T, ty0: r.ty0 + dy, ty1: r.ty1 + dy })) };
}
function build(n){
  const C = core(n), R = REGIONS[n], below = JOINS[n], above = n < CLIMB_TOP ? JOINS[n + 1] : null;
  const WING = WINGS[n], EDGE = EDGES[n], ALLW = [...(WING || []), ...(EDGE || [])], wLeft = Math.max(0, ...ALLW.map(w => w.left || 0)), wRight = Math.max(0, ...ALLW.map(w => w.right || 0));
  if (!below && !above && !RULES[n] && !WING && !EDGE) return finish(lifted({ joins: {}, X0: 0, Y0: 0, ...C }, R.fill === undefined ? ROCK : R.fill));
  const hall = (() => { const b = C.marks.find(m => m.type === 'boss'); return b && C.rooms.find(r => b.x >= r.tx0 && b.x < r.tx1 && b.y >= r.ty0 && b.y < r.ty1); })();
  // how far the region moves: up by the rows under it; right, if the sill above stands to the left of what there is
  const wDown = Math.max(0, ...ALLW.map(w => w.down || 0));   // rows added under a region for a wing that goes down (the Drowned Galleries, under the Roots)
  let Y0 = below ? below.rows * ROOM.h : wDown * ROOM.h;
  let X0 = wLeft * ROOM.w, W = C.W + X0, H = C.H + Y0, sx = 0, sy = 0;
  if (above && hall){
    const s0 = above.dir > 0 ? hall.tx1 + above.gap : hall.tx0 - above.gap - SILL.w;   // where the sill starts, as core counts
    if (s0 + X0 < 0) X0 = -s0;
    sx = s0 + X0; sy = hall.ty0 + Y0; W = Math.max(C.W + X0, sx + SILL.w); H = Math.max(H, sy + SILL.h);
  }
  W = Math.max(W, X0 + C.W + wRight * ROOM.w);   // a wing east of it: columns of the mountain's rock for it to be cut into
  const fill = R.fill === undefined ? ROCK : R.fill; let tiles = new Uint8Array(W * H).fill(fill), raw = new Uint8Array(W * H).fill(fill);
  if (C.H + Y0 < H) for (let j = C.H + Y0; j < H; j++) for (let i = X0; i < X0 + C.W; i++){ tiles[j * W + i] = ROCK; raw[j * W + i] = ROCK; }   // over a region with a roof, the roof (as it was: past the top was rock)
  for (let j = 0; j < C.H; j++) for (let i = 0; i < C.W; i++){ tiles[(j + Y0) * W + i + X0] = C.tiles[j * C.W + i]; raw[(j + Y0) * W + i + X0] = C.raw[j * C.W + i]; }
  let marks = C.marks.map(m => ({ ...m, x: m.x + X0, y: m.y + Y0, ...(m.base != null ? { base: m.base + Y0 } : {}), ...(m.perch ? { perch: { ...m.perch, x: m.perch.x + X0, y: m.perch.y + Y0, ...(m.perch.wall != null ? { wall: m.perch.wall + X0 } : {}), ...(m.perch.base != null ? { base: m.perch.base + Y0 } : {}) } } : {}) }));
  let rooms = C.rooms.map(r => ({ ...r, x0: r.x0 + X0 * T, x1: r.x1 + X0 * T, y0: r.y0 + Y0 * T, y1: r.y1 + Y0 * T, tx0: r.tx0 + X0, tx1: r.tx1 + X0, ty0: r.ty0 + Y0, ty1: r.ty1 + Y0 }));
  const set = (i, j, v) => { if (i >= 0 && j >= 0 && i < W && j < H){ tiles[j * W + i] = v; raw[j * W + i] = v; } }, at = (i, j) => i < 0 || j < 0 || i >= W || j >= H ? ROCK : tiles[j * W + i];
  const stamp = (k, x0, y0) => { const t = sill(k); for (let y = 0; y < SILL.h; y++) for (let x = 0; x < SILL.w; x++) set(x0 + x, y0 + y, t[y][x]); };
  const roomRec = (name, title, x0, y0, w, h, more) => ({ name, title, gate: '', open: false, x0: x0 * T, y0: y0 * T, x1: (x0 + w) * T, y1: (y0 + h) * T, tx0: x0, ty0: y0, tx1: x0 + w, ty1: y0 + h, ...more });
  let joins = {};
  // ---- from below: the rows under the region are the mountain's rock; in them the passage's lower stretch (its rooms
  // worn like any others), then the sill laid over, whole
  if (below){
    const LOW = LOWER[n], sub = new Uint8Array(W * Y0).fill(ROCK), subMarks = [], subRooms = [], look = REGIONS[n - 1].theme;
    for (const [cx, cy, make] of LOW.layout){ const r = make(), ox = X0 + cx * ROOM.w, oy = cy * ROOM.h;
      for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++) if (oy + y < Y0) sub[(oy + y) * W + ox + x] = r.tiles[y][x];
      for (const m of r.marks) subMarks.push({ ...m, x: ox + m.x, y: oy + m.y });
      subRooms.push(roomRec(make.name, below.title, ox, oy, r.w, r.h, { look })); }
    const subRaw = sub.slice(); organic(sub, W, Y0, subMarks, subRooms, R.seed + 77, R.wear);
    for (let j = 0; j < Y0; j++) for (let i = 0; i < W; i++){ tiles[j * W + i] = sub[j * W + i]; raw[j * W + i] = subRaw[j * W + i]; }
    mountTorches(tiles, W, H, subMarks); marks.push(...subMarks); rooms.push(...subRooms);
    const bx = X0 + (below.dir > 0 ? 0 : ROOM.w); stamp(n, bx, 0);
    rooms.push(roomRec('sill', below.title, bx, 0, SILL.w, SILL.h, { look, sill: n, ghost: true }));
    // up into the raising water's room, through its floor at the near end (where he used to wake): a hole, boarded
    for (let x = X0 + 2; x <= X0 + 5; x++){ set(x, Y0, EMPTY); set(x, Y0 + 1, LEDGE); }
    joins.down = { k: n, x: bx, y: 0, dir: below.dir, to: n - 1 };
  }
  // ---- to above: the sill beside the keeper's hall, the way to it, and the way out of the hall
  if (above && hall){
    const hx0 = hall.tx0 + X0, hx1 = hall.tx1 + X0, ys = sy + above.a;
    if (fill === EMPTY) for (let j = 0; j < sy; j++) for (let i = sx; i < sx + SILL.w; i++) if (i < X0 || i >= X0 + C.W) set(i, j, ROCK);   // under a sky the sill is the head of a cliff: rock under it, to the ground
    stamp(n + 1, sx, sy);
    rooms.push(roomRec('sill', above.title, sx, sy, SILL.w, SILL.h, { sill: n + 1, after: true }));   // after: reached only once the keeper has fallen (behind the niche's cracked wall, or the seal)
    if (above.gap){ const g0 = above.dir > 0 ? hx1 : sx + SILL.w, g1 = g0 + above.gap - 1;   // an arch of rock across the open air, from the hall to the cliff (rock, not planks: nothing comes up through it from the room below, past the keeper)
      for (let x = g0; x <= g1; x++) for (let y = ys; y < Math.min(H, sy + ROOM.h * 2); y++) set(x, y, EMPTY);   // open air over it (the wear had swelled the hall's wall outward)
      for (let x = g0; x <= g1; x++){ set(x, ys - 1, ROCK); set(x, ys - 2, ROCK); const sag = Math.round(3 * Math.sin((x - g0 + 0.5) / above.gap * Math.PI)); for (let d = 0; d < 3 - sag; d++) set(x, ys - 3 - d, ROCK); }
      rooms.push(roomRec('causeway', above.title, g0, sy, above.gap, ROOM.h, { open: true, after: true })); }
    // the way out, through the hall's wall at the height of its floor: sealed with stone (drawn apart, props.js) that
    // comes down when the keeper falls. In the Roots the niche's cracked wall is the seal: the spade he is left opens it
    const seal = [], wall = [];
    for (let d = 0; d < 6; d++){ const x = above.dir > 0 ? hx1 - 1 - d : hx0 + d; if (at(x, ys) !== ROCK && at(x, ys) !== CRACKED) break; wall.push(x); }
    wall.forEach((x, d) => { for (let y = ys; y < ys + SILL.tall; y++){ const v = n > 0 && d < 2 ? HOLD : EMPTY; set(x, y, v); if (v === HOLD) seal.push(x + ',' + y); } });
    if (fill === EMPTY) for (const x of wall) for (let y = ys + SILL.tall; y < Math.min(H, hall.ty1 + Y0); y++) set(x, y, ROCK);   // under a sky the hall's wall goes to its top on this side: nowhere to stand on it, nothing over it
    for (const m of marks) if (m.type === 'exit'){ m.x = sx + (SILL.w >> 1); m.y = sy + SILL.floor; m.join = true; }   // no beacon: the way on is the middle of the sill, where the regions change
    joins.up = { k: n + 1, x: sx, y: sy, dir: above.dir, to: n + 1, seal };
  }
  // ---- what the keeper holds in its region, and the quick way it leaves (seams.js RULES): set into the region as built
  // (build 116) lifted here, and no longer last: what follows is cut into the level as it stands, rows under it and over it and all
  let over = 0; { const L1 = lifted({ W, H, tiles, raw, marks, rooms, joins, Y0 }, fill); tiles = L1.tiles; raw = L1.raw; marks = L1.marks; rooms = L1.rooms; joins = L1.joins; H = L1.H; Y0 = L1.Y0; over = L1.over; }
  if (RULES[n] || WING || EDGE){
    const roomOf = name => rooms.find(r => r.name === name);
    // a room of its own, on a cell the region left empty (as the region counts cells), worn like the rest
    const addRoom = (cx, cy, make, more = {}) => { const r = make(), x0 = X0 + cx * ROOM.w, y0 = Y0 + cy * ROOM.h, sub = new Uint8Array(r.w * r.h), ms = r.marks.map(m => ({ ...m }));
      for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++) sub[y * r.w + x] = r.tiles[y][x];
      const subRaw = sub.slice(), rec0 = roomRec(make.name, r.title || '', 0, 0, r.w, r.h); organic(sub, r.w, r.h, ms, [rec0], R.seed + 31 * (cx + 7 * cy), R.wear);
      for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++){ tiles[(y0 + y) * W + x0 + x] = sub[y * r.w + x]; raw[(y0 + y) * W + x0 + x] = subRaw[y * r.w + x]; }
      for (const m of ms){ m.x += x0; m.y += y0; } mountTorches(tiles, W, H, ms); marks.push(...ms);
      const rec = roomRec(make.name, r.title || '', x0, y0, r.w, r.h, { gate: r.gate || '', ...(r.look ? { look: r.look } : {}), ...more }); rooms.push(rec); return rec; };
    // a slab pressed down into the doorway between two rooms side by side: its top filled, three tiles left under it
    const lintel = (a, b) => { const A = roomOf(a), B = roomOf(b); if (!A || !B) return 0; const bx = Math.max(A.tx0, B.tx0); if (bx !== Math.min(A.tx1, B.tx1)) return 0; let made = 0;
      const open = j => [-2, -1, 0, 1].every(d => { const t = at(bx + d, j); return t === EMPTY || t === LEDGE; });
      for (let j = Math.max(A.ty0, B.ty0); j < Math.min(A.ty1, B.ty1); j++){ if (!open(j) || open(j - 1)) continue; let j1 = j; while (open(j1 + 1)) j1++;
        if (j1 - j >= 4){ for (let y = j + 3; y <= j1; y++) for (const d of [-2, -1, 0, 1]) set(bx + d, y, HOLD); made++; } }
      return made; };
    // the doorway between two rooms side by side, filled (a door on the bell, or a hold): its middle two columns, each
    // opening's whole height. Returns where each is (its floor), for a lamp beside it
    const doorway = (a, b, v) => { const A = roomOf(a), B = roomOf(b), out = []; if (!A || !B) return out; const bx = Math.max(A.tx0, B.tx0); if (bx !== Math.min(A.tx1, B.tx1)) return out;
      const open = j => [-2, -1, 0, 1].every(d => { const t = at(bx + d, j); return t === EMPTY || t === LEDGE; });
      for (let j = Math.max(A.ty0, B.ty0); j < Math.min(A.ty1, B.ty1); j++){ if (!open(j) || open(j - 1)) continue; let j1 = j; while (open(j1 + 1)) j1++;
        if (j1 - j >= 3){ for (let y = j; y <= j1; y++) for (const d of [-1, 0]) set(bx + d, y, v); out.push({ x: bx, y: j, top: j1 }); } j = j1; }
      return out; };
    const addMarks = list => { mountTorches(tiles, W, H, list); marks.push(...list); };
    const X = { set, at, W, H, X0, Y0, rooms, marks, roomOf, addRoom, lintel, doorway, addMarks, tile: { EMPTY, ROCK, LEDGE, SPIKES, CRACKED, HOLD, DOOR, GIVEN, LIVE, VELLUM, SHUTTER, STILLED, FACED, MELT, IRON_A, IRON_B, CALM, KEPT, ROUGH, TIER_A, TIER_B, SLUICE } };
    if (WING) for (const w of WING) w.build(X);
    if (RULES[n]) RULES[n](X);
    if (EDGE) for (const w of EDGE) w.build(X);
  }
  return finish({ ...C, W, H, tiles, raw, marks, rooms, joins, X0, Y0, over });
}
// what the motor asks about every step: the flowers' tiles, and the rising air (in world units)
// One spring a region (build 88; decision 0.17, and "fewer springs" from the playtest of 21 Nov): on the climb, the one in
// the middle of the region is kept, by the room it is in. The checkpoint pool at the foot of each region is not a
// spring and stays. A wing has none. The sections of the Deep keep what they have (they are shut, and not yet retuned)
export const SPRING = ['grotto', 'library', 'hollow', 'watch', 'orangery', 'archive'];
function finish(L){
  if (SPRING[L.index]) for (let k = L.marks.length - 1; k >= 0; k--){ const m = L.marks[k]; if (m.type !== 'shrine') continue; const r = L.rooms.find(q => m.x >= q.tx0 && m.x < q.tx1 && m.y >= q.ty0 && m.y < q.ty1); if (!r || r.name !== SPRING[L.index]) L.marks.splice(k, 1); }
  const pads = new Map(), updrafts = [], gusts = [], flows = [], movers = [], waters = [];
  for (const m of L.marks){
    if (m.type === 'bloom') for (let a = -1; a <= 1; a++) pads.set(m.y * L.W + m.x + a, m);
    if (m.type === 'updraft') updrafts.push({ x0: m.x * T, y0: m.y * T, x1: (m.x + (m.w || 4)) * T, y1: (m.y + (m.h || 12)) * T, ...(m.gate ? { gate: m.gate } : {}), ...(m.cold ? { cold: true } : {}), ...(m.wall ? { wall: m.wall } : {}) });   // gate: this rising air is a wing's way in (the simple reach test counts it only with the gift)
    if (m.type === 'flow') flows.push({ x0: m.x * T, y0: m.y * T, x1: (m.x + (m.w || 4)) * T, y1: (m.y + (m.h || 2)) * T, dx: m.dir === 'w' ? -1 : m.dir === 'e' ? 1 : 0, dy: m.dir === 'd' ? -1 : 0, key: m.key || '', soft: !!m.soft });   // (soft: only to be looked at: thin water falling, that bears nothing down)   // running water (the Aqueducts): it carries what stands in it; falling, nothing rises through it. It runs while its wheel is open (RULE.wet)
    if (m.type === 'mover') movers.push({ kind: m.kind || 'arm', cx: (m.x + 0.5) * T, cy: m.y * T, r: (m.r || 8) * T, ax: (m.ax || 0) * T, ay: (m.ay || 0) * T, period: m.period || 8, ph: m.ph || 0, dir: m.dir || 1, w: (m.w || 5) * T, x: 0, y: 0, px: 0, py: 0, at: -1, ...(m.key ? { key: m.key } : {}), ...(m.look ? { look: m.look } : {}), ...(m.kind === 'rail' ? { cx: (m.x + 0.5 + (m.dx || 0) / 2) * T, cy: (m.y + (m.dy || 0) / 2) * T, ax: (m.dx || 0) / 2 * T, ay: (m.dy || 0) / 2 * T, half: m.secs || 3 } : {}) });   // (a rail: from where its mark is to dx, dy further, in `secs`)   // a thing that moves and can be stood on (the Orrery Wing): a planet on an arm (round cx, cy at r), or a pallet that slides (by ax, ay either side of cx, cy). Its place is the world's clock's (PHASE.t), nothing else's
    // deep water (phase 16, the Flooded Levels; motor.js SWIM): a body of it, from its bottom-left tile. It bears him up;
    // with the Wyrm's wind it carries him under. key 'tide': the Pump moves it (RULE.tide, 0 its floor to 1 its top)
    if (m.type === 'water') waters.push({ x0: m.x * T, y0: m.y * T, x1: (m.x + (m.w || 4)) * T, y1: (m.y + (m.h || 4)) * T, key: m.key || '', lo: (m.y + (m.up || 0)) * T, deep: !!m.deep, gain: m.gain || 1, held: m.held || '' });   // held: the gate (by its key) that holds this water at the height it had when the gate came down   // lo: where the Pump's water stands at its lowest (`up` rows over its bottom)
    // a raft (the Flooded Levels): planks on the water. Stood on, it goes down under him; left, it comes back up
    if (m.type === 'raft') movers.push({ kind: 'raft', cx: (m.x + 0.5) * T, cy: m.y * T, r: 0, ax: 0, ay: 0, period: 1, ph: 0, dir: 1, w: (m.w || 5) * T, x: 0, y: 0, px: 0, py: 0, at: -1, sink: 0, load: 0, deep: (m.deep || 7) * T });
    if (m.type === 'gust') gusts.push({ x0: m.x * T, y0: m.y * T, x1: (m.x + (m.w || 4)) * T, y1: (m.y + (m.h || 12)) * T });   // the wind the Wyrm holds: it bears down there in beats; when the Wyrm falls it turns, and lifts
  }
  // ice a fire melts: each tile of it answers to the brazier nearest it in its own room (meltOf: tile -> the brazier's
  // place, 'x,y'); and what is frozen in it (a creature marked `ice`) to the same
  const meltOf = new Map(), braziers = L.marks.filter(m => m.type === 'brazier'), roomAt = (x, y) => (L.rooms || []).find(r => !r.ghost && x >= r.tx0 && x < r.tx1 && y >= r.ty0 && y < r.ty1);
  const nearest = (x, y) => { const R0 = roomAt(x, y); let best = null, bd = 1e9; for (const b of braziers){ if (roomAt(b.x, b.y) !== R0) continue; const d = Math.hypot(b.x - x, b.y - y); if (d < bd){ bd = d; best = b; } } return best && best.x + ',' + best.y; };
  if (braziers.length){ for (let k = 0; k < L.tiles.length; k++) if (L.tiles[k] === MELT){ const key = nearest(k % L.W, Math.floor(k / L.W)); if (key) meltOf.set(k, key); }
    for (const m of L.marks) if (m.ice) m.fire = nearest(m.x, m.y); }
  // the gates (rooms.js SLUICE): each tile of one answers to its gate's key
  const gateOf = new Map(), gateBase = {}; for (const m of L.marks) if (m.type === 'gate'){ gateBase[m.key] = m.y; } for (const m of L.marks) if (m.type === 'gate') for (let y = m.y; y < m.y + (m.h || 1); y++) for (let x = m.x; x < m.x + (m.w || 1); x++) if (L.tiles[y * L.W + x] === SLUICE) gateOf.set(y * L.W + x, m.key);
  return { joins: {}, X0: 0, Y0: 0, ...L, pads, updrafts, gusts, flows, movers, waters, meltOf, gateOf, gateBase, tiles0: L.tiles.slice() };
}
// ---- where the three who climb are found in each region: a room each, never the first, spread through it. Each stands
// at a station of their own (items.js draws it and lights it): Ordric at a flame, Mirel at a fire, Corwen at a desk
// A place is a room's name, a list of rooms (the first with a spot that fits), or { room, x, y }: that tile of the room,
// chosen by hand (phase 8: where each stands is staged, not wherever a flat floor was found):
//   Ordric   across the raising water from where he comes in, never on the way in itself; in the Roots at the end of the
//            corridor, after the first crawler and before the climb, so the first room is his waking alone
//   Mirel    where her line is about: the near end of the bridge; the foot of the bell stair; by the leak in the eyrie
//   Corwen   on rock in the middle of the nave, not on a plank; in the orrery away from the eye that watches it
export const STATIONS = [
  { lamplighter: { room: 'corridor', x: 28, y: 2 }, wren: { room: 'bridge', x: 6, y: 14 }, scribe: { room: 'chamber', x: 34, y: 10 } },
  { lamplighter: { room: 'cryptfoot', x: 22, y: 2 }, wren: { room: 'belfry', x: 35, y: 2 }, scribe: { room: 'nave', x: 4, y: 8 } },
  { lamplighter: { room: 'gate', x: 32, y: 2 }, wren: { room: 'eyrie', x: 55, y: 2 }, scribe: 'saddle' },
  { lamplighter: { room: 'path', x: 24, y: 2 }, wren: { room: 'gantry', x: 6, y: 2 }, scribe: ['anchorage', 'stacks', 'buttress', 'corbel', 'cap', 'bluff'] },
  { lamplighter: { room: 'wallfoot', x: 22, y: 2 }, wren: { room: 'cascade', x: 9, y: 25 }, scribe: 'terraces' },
  { lamplighter: { room: 'stairfoot', x: 21, y: 2 }, wren: { room: 'transit', x: 63, y: 2 }, scribe: { room: 'orrery', x: 34, y: 8 } },
  { hob: 'bunk' },   // the Workings: Hob alone
];
// ---- what each meeting is for (phase 8, docs/phase8-sheet.md): they are there when he needs them.
//   story    a beat the story needs: on the main path, where he must pass (tests/side-people.test.mjs checks it)
//   service  something the player needs: Ordric and his shop, beside every region's raising water
//   extra    a place of their own, off the path, to be looked for: a nook cut into the rock behind a low gap (nooks),
//            with a small reward (main.js talkTo). Missing it costs nothing the story or the climb needs
export const MEETINGS = [
  { lamplighter: 'service', wren: 'story', scribe: 'story' },   // (the Roots' grid has no room for a nook: Corwen is on the path)
  { lamplighter: 'service', wren: 'story', scribe: 'story' },
  { lamplighter: 'service', wren: 'story', scribe: 'extra' },
  { lamplighter: 'service', wren: 'story', scribe: 'extra' },
  { lamplighter: 'service', wren: 'story', scribe: 'extra' },
  { lamplighter: 'service', wren: 'story', scribe: 'story' },
  { hob: 'story' },
];
// a place of their own: a small room built onto the outside of an existing one, where the region's grid has nothing
// (rock, or open sky: there it is an outcrop of stone on the room's wall). Its way in is a gap three tiles high through
// the room's side wall, at a floor he can stand on (he crouches through), a torch over it. Looked for along the side
// walls of the rooms given, then of any room: not the keeper's, not a wing's. It is a room of its own for the painter
// and the map ('nook'), which shows it only once he has been in
const NOOK = { w: 16, h: 10, row: { 2: 2, 3: 27, 4: 17 },   // row: by region, the height (in its room) each is wanted at, so no two are found the same way: the Spires' at the road's foot, the Tempest's off the top of the hut's loft, the Gardens' halfway up the broken wall
  title: { scribe: 'Corwen\'s nook', wren: 'Mirel\'s camp', lamplighter: 'Ordric\'s store' } };
function nooks(tiles, W, H, marks, rooms, S, M, n){
  if (!S || !M || (typeof process !== 'undefined' && process.env && process.env.NO_NOOKS)) return;   // NO_NOOKS: a tool's look at the region without them
  const at = (i, j) => i < 0 || j < 0 || i >= W || j >= H ? ROCK : tiles[j * W + i], set = (i, j, v) => { tiles[j * W + i] = v; };
  const inRoom = (q, x, y) => x >= q.tx0 && x < q.tx1 && y >= q.ty0 && y < q.ty1, roomAt = (x, y) => rooms.find(q => inRoom(q, x, y)), boss = marks.find(k => k.type === 'boss');
  for (const m of marks){
    if (m.type !== 'npc' || M[m.who] !== 'extra') continue;
    const order = [].concat(S[m.who] || []).map(n => rooms.find(q => q.name === (n.room || n))).filter(Boolean).concat(rooms).filter(r => !r.gate && r.name !== 'nook' && !(boss && inRoom(r, boss.x, boss.y)));
    const want = NOOK.row[n], sol = v => v === ROCK || v === LEDGE; let pick = null, pd = 1e9;
    order.forEach((r, k) => { for (const d of [1, -1]){
        const wall = d > 0 ? r.tx1 - 2 : r.tx0 + 1, i = wall - d, out = d > 0 ? r.tx1 : r.tx0 - NOOK.w;   // the wall's inner column; where he stands; the block's left edge
        if (out < 1 || out + NOOK.w > W - 1) continue;
        for (let j = r.ty0 + 2; j < r.ty1 - 7; j++){
          if (at(i, j) !== EMPTY || !sol(at(i, j - 1)) || at(i - d, j) !== EMPTY || !sol(at(i - d, j - 1))) continue;   // a floor to stand on by the wall (rock, or a plank), two wide
          let ok = true; for (let b = 0; b < 5 && ok; b++) if (at(i, j + b) !== EMPTY || at(i - d, j + b) !== EMPTY) ok = false;   // and room to stand
          for (let b = -1; b <= 4 && ok; b++) if (at(wall, j + b) !== ROCK || at(wall + d, j + b) !== ROCK) ok = false;                // the wall whole there
          for (let a = 0; a < NOOK.w && ok; a++) for (let b = -3; b < NOOK.h - 3 && ok; b++){ const y = j + b; if (y < 1 || y >= H - 1 || roomAt(out + a, y)) ok = false; }   // nothing of the region's there
          if (!ok || marks.some(q => q !== m && q.type !== 'crystal' && q.type !== 'torch' && q.type !== 'keep' && Math.abs(q.x - i) < 5 && Math.abs(q.y - j) < 5)) continue;
          const score = want == null ? k * 1000 + j : Math.abs(j - r.ty0 - want) * 1000 + k; if (score < pd){ pd = score; pick = { r, d, wall, i, out, j }; }
        } } });
    if (pick){ const { r, d, wall, i, out, j } = pick; {
          for (let a = 0; a < NOOK.w; a++) for (let b = -3; b < NOOK.h - 3; b++) set(out + a, j + b, ROCK);                     // the stone it is cut in
          for (let a = 0; a <= 3; a++) for (let b = 0; b < 3; b++) set(wall + d * a, j + b, EMPTY);                             // the gap, through the wall
          for (let a = 4; a <= 13; a++) for (let b = 0; b < 5; b++) set(wall + d * a, j + b, EMPTY);                            // the nook
          m.x = wall + d * 9; m.y = j; m.station = 'nook'; m.extra = true;
          rooms.push({ name: 'nook', title: NOOK.title[m.who] || '', gate: '', open: false, nook: m.who, look: r.look, x0: out * T, y0: (j - 3) * T, x1: (out + NOOK.w) * T, y1: (j - 3 + NOOK.h) * T, tx0: out, ty0: j - 3, tx1: out + NOOK.w, ty1: j - 3 + NOOK.h });
          for (let a = 4; a <= 13; a += 2) marks.push({ type: 'keep', x: wall + d * a, y: j + 1 }); marks.push({ type: 'keep', x: wall + d, y: j + 1 });
          marks.push({ type: 'torch', x: i, y: j + 5, nook: true });
    } }
  }
}
// each is moved to the best place in its room: a flat floor seven tiles wide with six of air over it, clear of the other
// markers. Ordric stands four tiles from the room's flame (on the side with room); the others as near the room's middle as fits
const NOT_FOE = new Set(['spawn', 'torch', 'crystal', 'shrine', 'boss', 'exit', 'npc', 'pass', 'arrive', 'urn', 'chest', 'thread', 'bloom', 'updraft', 'pool', 'bell', 'keep', 'deco', 'runnel', 'gust', 'rod', 'flow', 'mover', 'glamp', 'water', 'raft', 'dlamp', 'valve', 'gate']);
function stations(tiles, W, H, marks, rooms, S){
  if (!S) return;
  const at = (i, j) => i < 0 || j < 0 || i >= W || j >= H ? ROCK : tiles[j * W + i], solid = t => t === ROCK || t === LEDGE;
  for (const m of marks){
    if (m.type !== 'npc' || !S[m.who] || m.station) continue;   // (one in a nook of their own is placed already)
    // Ordric is beside the region's raising water, in its room (phase 8: his shop is always close); if nothing fits
    // there, his old rooms
    const pool = m.who === 'lamplighter' && marks.find(k => k.type === 'pool' && !k.plain), poolRoom = pool && rooms.find(q => pool.x >= q.tx0 && pool.x < q.tx1 && pool.y >= q.ty0 && pool.y < q.ty1);
    // a tile chosen by hand: there, if he can stand there (a floor under it, and his height of air); else as below
    const hand = [].concat(S[m.who]).find(q => q && q.room), hr = hand && rooms.find(q => q.name === hand.room);
    if (hr){ const i = hr.tx0 + hand.x, j = hr.ty0 + hand.y; if (solid(at(i, j - 1)) && [0, 1, 2, 3, 4].every(d => at(i, j + d) === EMPTY)){ m.x = i; m.y = j; m.station = hr.name; m.placed = true; continue; } }
    for (const name of (poolRoom ? [poolRoom.name] : []).concat([].concat(S[m.who]).map(q => q.room || q))){   // a room, or rooms in the order wanted: the first with a place that fits
    const r = rooms.find(q => q.name === name); if (!r) continue;
    const byPool = pool && r === poolRoom, flame = !byPool && m.who === 'lamplighter' && marks.find(k => k.type === 'shrine' && k.x >= r.tx0 && k.x < r.tx1 && k.y >= r.ty0 && k.y < r.ty1);
    const want = byPool ? [[pool.x + (pool.w || 8) + 5, pool.y + 1], [pool.x - 6, pool.y + 1]] : flame ? [[flame.x + 5, flame.y], [flame.x - 5, flame.y]] : [[(r.tx0 + r.tx1) / 2, r.ty0 + 2]];
    let best = null, bd = 1e9;
    for (let j = r.ty0 + 2; j < r.ty1 - 7; j++) for (let i = r.tx0 + (byPool ? 4 : 5); i < r.tx1 - 5; i++){
      let ok = true;
      const half = byPool ? 2 : 3;   // beside the water a narrower floor will do
      for (let a = -half; a <= half && ok; a++){ if (!solid(at(i + a, j - 1)) || at(i + a, j - 1) === LEDGE && Math.abs(a) < 2 && false) ok = false; for (let d = 0; d < 6; d++) if (at(i + a, j + d) !== EMPTY) ok = false; }
      if (!ok) continue;
      if (marks.some(k => k !== m && k.type !== 'torch' && k.type !== 'crystal' && !(byPool && (k.type === 'spawn' || k === pool)) && Math.abs(k.x - i) < (k.type === 'urn' ? 2 : 5) && Math.abs(k.y - j) < 4 && !(flame && k === flame))) continue;   // an urn may stand close by
      if (flame && Math.abs(flame.x - i) < 4 && Math.abs(flame.y - j) < 4) continue;   // beside his flame, not on it
      if (marks.some(k => !NOT_FOE.has(k.type) && Math.abs(k.x - i) < (byPool ? 6 : 10) && Math.abs(k.y - j) < 6)) continue;   // and no creature at their elbow
      // as near what is wanted as fits, and as far as can be from the other two (they each have a place of their own)
      const others = marks.filter(k => k.type === 'npc' && k !== m && k.station).map(k => Math.hypot(k.x - i, k.y - j)), apart = others.length ? Math.min(...others) : 99;
      let plank = 0; for (let a = -3; a <= 3; a++) if (at(i + a, j - 1) === LEDGE) plank++;   // rock underfoot, rather than a plank, where there is any
      const d = Math.min(...want.map(([x, y]) => Math.abs(x - i) + Math.abs(y - j) * 1.5)) + Math.max(0, 30 - apart) * 2 + plank * 12;
      if (d < bd){ bd = d; best = [i, j]; }
    }
    if (best){ m.x = best[0]; m.y = best[1]; m.station = name; break; }
  } }
  // a torch where one of them stands is moved aside, or taken away: its flame is drawn over everything (one was on
  // Ordric's face)
  for (const m of marks) if (m.type === 'npc'){
    for (const k of marks) if (k.type === 'torch' && Math.abs(k.x - m.x) < 4 && k.y - m.y >= -1 && k.y - m.y < 8){
      const side = k.x >= m.x ? 1 : -1, to = [m.x + side * 5, m.x - side * 5, m.x + side * 6, m.x - side * 6].find(x => at(x, k.y) === EMPTY && at(x, k.y + 1) === EMPTY);
      if (to !== undefined) k.x = to; else k.type = 'gone';
    }
  }
}
// the region in play. One object, refilled when he goes up a region, so everything that reads it reads the new one
export const LEVEL = {};
const BUILT = [];
export function resetLevels(){ BUILT.length = 0; }   // build them again when next wanted (a new game: the cracked rock whole again)
export function prepare(n){ if (n >= 0 && n < REGIONS.length && !BUILT[n]) BUILT[n] = build(n); }   // a region made ahead (its rock: about a twentieth of a second), so that walking into it does not wait for that
export function loadLevel(n){ n = Math.max(0, Math.min(REGIONS.length - 1, n | 0)); Object.assign(LEVEL, BUILT[n] || (BUILT[n] = build(n))); return LEVEL; }
loadLevel(typeof location !== 'undefined' && location.search ? (parseInt(new URLSearchParams(location.search).get('level')) || 1) - 1 : 0);

// ---- the organic pass: the rooms are drawn as boxes (easy to read and change); this wears them into caves. It
// never touches the space he moves through: the floor he walks and four tiles over it, doorways and their way in,
// and the markers. Outside that it fills the corners where floor meets wall with ramps (steps a tile high, which he
// walks up, drawn as slopes), rounds the top corners off with wedges, hangs lumps from ceilings, swells the walls and
// raises low humps along long floors. The same every load (a fixed seed).
function organic(tiles, W, H, marks, rooms, seed0 = 1234567, wear = { sag: 1, swell: 1, humps: 0.8 }){
  let seed = seed0; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647, ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
  const at = (i, j) => { if (i < 0 || j < 0 || i >= W || j >= H) return ROCK; const t = tiles[j * W + i]; return t === CRACKED || t === HOLD || t === GIVEN || t === DOOR || t === VELLUM || t === STILLED || t === ROUGH || t === TIER_A || t === TIER_B ? ROCK : t === SHUTTER || t === MELT || t === CALM || t === KEPT ? EMPTY : t === FACED || t === IRON_A || t === IRON_B ? LEDGE : t === GLASS_A || t === GLASS_B ? LEDGE : t; };   // cracked rock is rock (and what a keeper holds), star-glass a ledge
  const set = (i, j, v) => { if (i > 0 && j > 0 && i < W - 1 && j < H - 1) tiles[j * W + i] = v; };
  const air = (i, j) => at(i, j) === EMPTY, rock = (i, j) => at(i, j) === ROCK, support = (i, j) => { const t = at(i, j); return t === ROCK || t === LEDGE; };
  const stand = (i, j) => air(i, j) && support(i, j - 1);
  const roomOf = (i, j) => rooms.find(r => i >= r.tx0 && i < r.tx1 && j >= r.ty0 && j < r.ty1);
  // what is kept clear: near (the walk: six over every floor), far (head room: nine over a floor, his height and a
  // jump; thirteen and wider over a ledge, where he jumps from one to the next), doorways and the way through, markers
  const near = new Uint8Array(W * H), far = new Uint8Array(W * H), doorway = new Uint8Array(W * H);
  const mark = (arr, i, j) => { if (i >= 0 && j >= 0 && i < W && j < H) arr[j * W + i] = 1; };
  for (let j = 1; j < H; j++) for (let i = 0; i < W; i++) if (stand(i, j)){
    const ledge = at(i, j - 1) === LEDGE, up = ledge ? 13 : 9, side = ledge ? 4 : 2;
    for (let d = 0; d <= 6; d++) for (let a = -1; a <= 1; a++) mark(near, i + a, j + d);
    for (let d = 0; d <= up; d++) for (let a = -side; a <= side; a++) mark(far, i + a, j + d);
  }
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) if (at(i, j) === LEDGE) for (let d = -8; d <= 0; d++) for (let a = -3; a <= 3; a++) mark(far, i + a, j + d);   // under a ledge: he jumps up through it
  for (const r of rooms) for (let j = r.ty0; j < r.ty1; j++) for (let i = r.tx0; i < r.tx1; i++){
    const ring = i < r.tx0 + 2 || i >= r.tx1 - 2 || j < r.ty0 + 2 || j >= r.ty1 - 2;
    if (!ring || at(i, j) === ROCK) continue;
    for (let a = -6; a <= 6; a++) for (let b = -6; b <= 6; b++){ mark(near, i + a, j + b); mark(far, i + a, j + b); mark(doorway, i + a, j + b); }
  }
  for (const m of marks) for (let a = -2; a <= 2; a++) for (let b = -1; b <= 3; b++){ mark(near, m.x + a, m.y + b); mark(far, m.x + a, m.y + b); }
  const free = (arr, i, j) => air(i, j) && !arr[j * W + i];
  const quiet = r => r && QUIET.has(r.name);
  const added = new Uint8Array(W * H), put = (i, j) => { set(i, j, ROCK); if (i >= 0 && j >= 0 && i < W && j < H) added[j * W + i] = 1; };
  // smooth noise along a line: a value every few tiles, eased between
  const noise = (period, s0) => { const v = []; for (let k = 0; k < 400; k++) v.push(rnd()); return x => { const f = (x + s0) / period, k = Math.floor(f), t = f - k, e = t * t * (3 - 2 * t); return v[k % 400] * (1 - e) + v[(k + 1) % 400] * e; }; };
  const ceil = noise(5, 3), ceil2 = noise(13, 7), wallN = noise(4, 11);
  // 1. ceilings sag and bulge: each column hangs down by a smooth amount, as far as head room allows
  for (let j = 2; j < H - 2; j++) for (let i = 2; i < W - 2; i++){
    if (!air(i, j) || !rock(i, j + 1)) continue;
    const n = Math.round(Math.max(0, ceil(i) * 4.2 + ceil2(i) * 3 - 2.4) * wear.sag);
    for (let b = 0; b < n; b++) if (free(far, i, j - b)) put(i, j - b); else break;
  }
  // 2. walls swell and hollow along their height
  for (let j = 2; j < H - 2; j++) for (let i = 2; i < W - 2; i++) for (const dir of [1, -1]){
    if (!air(i, j) || !rock(i - dir, j) || added[j * W + i - dir]) continue;
    const n = Math.round(Math.max(0, wallN(j * 1.0 + i * 0.37 + (dir > 0 ? 0 : 50)) * 4 - 1.2) * wear.swell);
    for (let a = 0; a < n; a++) if (free(far, i + dir * a, j)) put(i + dir * a, j); else break;
  }
  // 3. the top corners of a room: a wedge, as big as fits clear of head room
  for (let j = 2; j < H - 2; j++) for (let i = 2; i < W - 2; i++){
    if (!air(i, j) || !rock(i, j + 1)) continue;
    for (const dir of [1, -1]){
      if (!rock(i - dir, j)) continue;
      for (let sz = ri(4, 9); sz >= 2; sz--){
        let ok = true;
        for (let a = 0; a < sz && ok; a++) for (let b = 0; b < sz - a; b++) if (!free(far, i + dir * a, j - b) && !rock(i + dir * a, j - b)) { ok = false; break; }
        if (ok){ for (let a = 0; a < sz; a++) for (let b = 0; b < sz - a; b++) if (air(i + dir * a, j - b)) put(i + dir * a, j - b); break; }
      }
    }
  }
  // 4. round it all off: what the pass added keeps to the shape around it (no single teeth or notches)
  for (let it = 0; it < 2; it++){
    const copy = tiles.slice(), rk = (i, j) => i < 0 || j < 0 || i >= W || j >= H || copy[j * W + i] === ROCK;
    for (let j = 1; j < H - 1; j++) for (let i = 1; i < W - 1; i++){
      let n = 0; for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) if ((a || b) && rk(i + a, j + b)) n++;
      const k = j * W + i;
      if (copy[k] === ROCK && added[k] && n <= 3){ tiles[k] = EMPTY; added[k] = 0; }
      else if (copy[k] === EMPTY && !far[k] && n >= 5){ tiles[k] = ROCK; added[k] = 1; }
    }
  }
  // 5. ramps where a floor meets a wall: steps up, each a tile, so he walks them (drawn as a slope)
  for (let j = 2; j < H - 6; j++){
    let i = 0;
    while (i < W){
      if (!stand(i, j)){ i++; continue; }
      let e = i; while (e + 1 < W && stand(e + 1, j)) e++;
      const len = e - i + 1, r = roomOf(i, j);
      if (len >= 5 && !quiet(r)){
        for (const [end, dir] of [[i, 1], [e, -1]]){
          let wall = true; for (let d = 0; d <= 4; d++) if (!rock(end - dir, j + d)) wall = false;
          if (!wall) continue;
          const h = Math.min(ri(2, 4), Math.floor(len / 3));
          let ok = true;
          for (let k = 0; k < h; k++){ const top = j + (h - 1 - k), cx = end + dir * k; if (doorway[j * W + cx] || at(cx, j - 1) !== ROCK) ok = false;   // not in a doorway's way, not on a ledge
 for (let d = 0; d <= top - j + 5; d++) if (at(end + dir * k, j + d) === LEDGE || (d > top - j && !air(end + dir * k, j + d))) ok = false; if (marks.some(m => Math.abs(m.x - (end + dir * k)) <= 1 && Math.abs(m.y - j) <= 2)) ok = false; }
          if (ok) for (let k = 0; k < h; k++) for (let y = j; y <= j + (h - 1 - k); y++) put(end + dir * k, y);
        }
      }
      i = e + 1;
    }
  }
  // 5. low humps along long floors (a tile, walked over in stride), away from the ends, ledges and markers
  for (let j = 2; j < H - 6; j++){
    let i = 0;
    while (i < W){
      if (!stand(i, j)){ i++; continue; }
      let e = i; while (e + 1 < W && stand(e + 1, j)) e++;
      const r = roomOf(i, j);
      if (e - i + 1 >= 14 && !quiet(r) && rnd() < wear.humps){
        const w = ri(3, 6), x0 = ri(i + 4, e - 4 - w);
        let ok = x0 > i + 3;
        for (let x = x0; x < x0 + w && ok; x++){ if (doorway[j * W + x] || at(x, j - 1) !== ROCK) ok = false; for (let d = 1; d <= 6; d++) if (!air(x, j + d)) ok = false; if (marks.some(m => Math.abs(m.x - x) <= 2 && Math.abs(m.y - j) <= 3)) ok = false; }
        if (ok) for (let x = x0; x < x0 + w; x++) set(x, j, ROCK);
      }
      i = e + 1;
    }
  }
}
// the tile at a tile coordinate (outside the map: rock)
// star-glass keeps time: the first kind is there for the first half of each beat, the second for the other (`all`: both
// always, for the tests, which cannot wait)
export const PHASE = { t: 0, period: 2.4, all: false };
// the region's keeper: has it fallen (what it held is let go); are the doors on its bell's beat shut just now (props.js
// turns them; in a test they are open: he waits)
export const RULE = { fallen: false, shut: false, tearing: false, ring: 0, still: false, turned: false, lit: new Set(), litAll: false, sw: 0, surge: 0, swFree: false, hush: 0, open: 0, ox0: 0, ox1: -1, oy0: 0, oy1: -1, calmFree: false, wet: new Set(), wetAll: false, upset: 0, unkept: false, tide: 1, bore: 0, gates: new Set(), held: {}, pan: {}, lift: {}, walls: new Set(), t0: {}, stop: {}, stacks: {}, rail: {} };   // upset: how many things in the Keepers' Houses are out of their place (and 9 while their keeper is after him)
//   // wet: the sluice wheels that are open, by key (the Aqueducts: their water runs); wetAll: every one (a test)   // hush: how long he has stood still (the Eye of the Storm); open: seconds its doors of cloud stay open; calmFree: they are open (the tests' player waits as he must)
//   // sw: which half of the works' iron the current is in (0, 1); surge: seconds of the Jar's discharge left (all of it live); swFree: the tests' player throws every lever as he needs it (none of it shocks)   // lit: the braziers that burn in this region, each by its place 'x,y' (the Glacier Galleries); litAll: every one (the tests' player lights what he comes to)
//   // turned: on the stones of the way he has turned round (motor.js): they are gone until he stands on the ground   // ring: seconds of ringing left in the Bell-Foundry (iron was touched); still: its Cracked Bell has fallen, and nothing there rings again
//   // tearing: he is in the Toll's step this instant (motor.js): vellum does not stop him (main.js tears it)
export const glassOn = k => PHASE.all || ((PHASE.t / PHASE.period) % 2 < 1) === (k === GLASS_A);
// the tile as it is drawn into the level (cracked rock and star-glass as themselves)
export const rawAt = (tx, ty) => tx < 0 || ty < 0 || tx >= LEVEL.W || ty >= LEVEL.H ? ROCK : LEVEL.tiles[ty * LEVEL.W + tx];
// the tile as he meets it now: cracked rock is rock, star-glass a ledge while it is there
export const tileAt = (tx, ty) => { if (tx < 0 || ty < 0 || tx >= LEVEL.W || ty >= LEVEL.H) return ROCK; const t = LEVEL.tiles[ty * LEVEL.W + tx]; return t < CRACKED ? t : t === CRACKED || t === ROUGH ? ROCK : t === TIER_A ? (RULE.fallen || RULE.bore >= 1 ? EMPTY : ROCK) : t === TIER_B ? (RULE.fallen || RULE.bore >= 2 ? EMPTY : ROCK) : t === HOLD ? (RULE.fallen ? EMPTY : ROCK) : t === GIVEN ? (RULE.fallen ? LEDGE : ROCK) : t === DOOR ? (RULE.shut && !RULE.fallen ? ROCK : EMPTY) : t === LIVE ? LEDGE : t === VELLUM ? (RULE.tearing ? EMPTY : ROCK) : t === SHUTTER ? (RULE.ring > 0 && !RULE.still ? ROCK : EMPTY) : t === STILLED ? (RULE.still ? EMPTY : ROCK) : t === FACED ? (RULE.turned ? EMPTY : LEDGE) : t === IRON_A || t === IRON_B ? LEDGE : t === KEPT ? (RULE.upset > 0 && !RULE.unkept ? ROCK : EMPTY) : t === CALM ? (RULE.calmFree || (RULE.open > 0 && tx >= RULE.ox0 && tx <= RULE.ox1 && ty >= RULE.oy0 && ty <= RULE.oy1) ? EMPTY : ROCK) : t === SLUICE ? (slabUp(tx, ty) ? EMPTY : ROCK) : t === MELT ? (RULE.litAll || RULE.lit.has(LEVEL.meltOf.get(ty * LEVEL.W + tx)) ? EMPTY : ROCK) : glassOn(t) ? LEDGE : EMPTY; };
// a stone of the way, whether or not it is there now (motor.js: he is standing on the way)
// rough rock (the Auger's grip climbs it)
export const roughAt = (tx, ty) => tx >= 0 && ty >= 0 && tx < LEVEL.W && ty < LEVEL.H && LEVEL.tiles[ty * LEVEL.W + tx] === ROUGH;
export const facedAt = (tx, ty) => tx >= 0 && ty >= 0 && tx < LEVEL.W && ty < LEVEL.H && LEVEL.tiles[ty * LEVEL.W + tx] === FACED;
// a live deck (the storm's gantries) while the keeper stands: to stand on it is to be shocked (motor.js)
export const liveAt = (tx, ty) => { if (tx < 0 || ty < 0 || tx >= LEVEL.W || ty >= LEVEL.H) return false; const t = LEVEL.tiles[ty * LEVEL.W + tx]; if (t === LIVE) return !RULE.fallen;
  if (t === IRON_A || t === IRON_B) return !RULE.still && !RULE.swFree && (RULE.surge > 0 || (t === IRON_A) === (RULE.sw === 0)); return false; };   // the works' iron: the half the current is in (all of it, while the Jar lets go)
// where a mover is at a time: the middle of its top (he stands on it as on a plank: from above only)
export const moverAt = (m, t) => { if (m.kind === 'raft') return [m.cx, m.cy - (m.sink || 0)]; if (m.kind === 'free') return [m.fx, m.fy];   // (free: where its owner says: the Auger's back)
  if (m.kind === 'rail'){ const g = railAt(m.key, t); return [m.cx + m.ax * (2 * g - 1), m.cy + m.ay * (2 * g - 1)]; }
  if (m.key) t = keyClock(m.key, t);
  if (m.kind === 'chain'){ const f = (((t / m.period + m.ph) % 1) + 1) % 1; return [m.cx + m.ax * (2 * f - 1), m.cy + m.ay * (2 * f - 1)]; }   // (a chain: from one end of its way to the other at one pace, and then at the first end again: the buckets of a well)
  const a = (t / m.period + m.ph) * Math.PI * 2; return m.kind === 'arm' ? [m.cx + Math.cos(a * m.dir) * m.r, m.cy + Math.sin(a * m.dir) * m.r] : [m.cx + Math.sin(a) * m.ax, m.cy + Math.sin(a) * m.ay]; };
// (build 116) a mover with a key goes only while that key is up (RULE.gates: a windlass turned, as for a gate). Its own
// clock: stopped, it stays where it had got to, and goes on from there
export const keyClock = (key, t) => RULE.gates.has(key) ? t - (RULE.t0[key] || 0) : (RULE.stop[key] || 0);
export function keyRun(key, on, t = PHASE.t){ if (on) RULE.t0[key] = t - (RULE.stop[key] || 0); else RULE.stop[key] = t - (RULE.t0[key] || 0); if (LEVEL) LEVEL.moverGhosts = null; }
// (build 117) a thing on a rail (the Scriptorium's ladders): it stands at one end of its rail or the other (RULE.rail[key].at,
// 0 or 1). Sent, it rolls to the other end, slow out and slow in, and stays. railAt: how far along it is, 0 to 1
export const railAt = (key, t = PHASE.t) => { const R = RULE.rail[key]; if (!R) return 0; if (R.t0 == null) return R.at; const p = Math.min(1, Math.max(0, (t - R.t0) / R.half)), e = p * p * (3 - 2 * p); return R.at ? 1 - e : e; };
export function railSend(key, t = PHASE.t){ const R = RULE.rail[key]; if (!R || R.t0 != null) return null; R.t0 = t; return 1 - R.at; }   // (the end it is going to; null: it is rolling already)
// the movers as they are now, each with where it was the step before (px, py). In a test (PHASE.all: he waits for
// what turns) each is everywhere on its way at once, and still
export function moversNow(){
  const L = LEVEL.movers || []; if (!L.length) return L;
  if (PHASE.all){ if (!LEVEL.moverGhosts){ LEVEL.moverGhosts = []; for (const m of L) for (let k = 0; k < (m.key && !RULE.gates.has(m.key) ? 1 : 24); k++){ const [x, y] = m.kind === 'rail' ? (RULE.gates.has(m.key) ? [m.cx + m.ax * (2 * k / 23 - 1), m.cy + m.ay * (2 * k / 23 - 1)] : moverAt(m, 0)) : m.key ? (RULE.gates.has(m.key) ? moverAt({ ...m, key: '' }, (k / 24 - m.ph) * m.period) : moverAt(m, 0)) : moverAt(m, (k / 24 - m.ph) * m.period); LEVEL.moverGhosts.push({ ...m, x, y, px: x, py: y, ghost: true }); } } return LEVEL.moverGhosts; }
  const t = PHASE.t; for (const k in RULE.rail){ const R = RULE.rail[k]; if (R.t0 != null && t - R.t0 >= R.half){ R.at = 1 - R.at; R.t0 = null; } }   // (a ladder come to the end of its rail: it is there)
  for (const m of L) if (m.at !== t){ if (m.kind === 'raft' && m.at >= 0){ const dt = Math.min(0.1, Math.max(0, t - m.at)); if (m.load > 0){ m.load -= dt; m.sink = Math.min(m.deep, m.sink + RAFT.sink * dt); } else m.sink = Math.max(0, m.sink - RAFT.rise * dt); }
    const [x, y] = moverAt(m, t); m.jump = m.kind === 'chain' && m.at >= 0 && Math.hypot(x - m.x, y - m.y) > Math.hypot(m.ax, m.ay);   // (a chain's bucket gone over the top and come in at the foot: nothing rides it round)
    if (m.at < 0 || m.jump){ m.px = x; m.py = y; } else { m.px = m.x; m.py = m.y; } m.x = x; m.y = y; m.at = t; }
  return L;
}
export const RAFT = { sink: 1.5, rise: 1.1 };   // a raft under him: how fast it goes down, and comes back
// deep water: the body of it at a point, and where its top is now (the Pump's water rises and falls; once the Pump runs
// free it is gone)
// the water that breathes (the Drowned Galleries; key 'breath'): it rises from its low mark to its high, stands, falls and
// stands again, on the world's clock, the same every time. 0 low, 1 high. BREATH.hold: a test holds it where it likes
export const BREATH = { low: 4, rise: 15, high: 5, fall: 15, hold: null };
export const breath = (t = PHASE.t) => { if (BREATH.hold != null) return BREATH.hold; const all = BREATH.low + BREATH.rise + BREATH.high + BREATH.fall, ease = x => x * x * (3 - 2 * x); let u = ((t % all) + all) % all;
  if (u < BREATH.low) return 0; u -= BREATH.low; if (u < BREATH.rise) return ease(u / BREATH.rise); u -= BREATH.rise; if (u < BREATH.high) return 1; return 1 - ease((u - BREATH.high) / BREATH.fall); };
export const waterTop = w => w.key === 'tide' ? (RULE.still ? w.lo : w.lo + (w.y1 - w.lo) * RULE.tide) : w.key === 'breath' ? w.lo + (w.y1 - w.lo) * Math.min(1, (w.held && RULE.held[w.held] != null ? RULE.held[w.held] : breath()) * w.gain) : w.y1;   // (gain: a drain under a floor is full long before the room over it)
// the gates as they are before he has touched any: all down, and each water a gate holds at the height its mark gives
// (`at`, 0 low to 1 high). `left`: what a save remembers for this region ({ key: 1 } up; { key: { held } } down, and
// the height it holds)
// a wind-break (the Pilgrims' Cairns, build 114): RULE.walls is the walls of slate he has knocked down, by key. Rising air
// that answers to a wall (an 'updraft' mark with `wall`) is not there until its wall is down, and then is for good
// a slab hung on a scale (the Ossuary, build 113): RULE.pan[key] is how many pieces lie in its pan (0 to 3), RULE.lift[key]
// how many rows of the slab are up for it. A slab that stands upright goes up a third of its height a piece; one that
// lies across a hole lifts only for all three. `eff`: the weight that is on the pan now, if it is not the pieces in it
// (he is standing in it)
const slabUp = (tx, ty) => { const k = LEVEL.gateOf.get(ty * LEVEL.W + tx); if (RULE.gates.has(k)) return true; const up = RULE.lift[k]; return up > 0 && ty - LEVEL.gateBase[k] < up; };
export const liftOf = (key, load) => { const g = (LEVEL.marks || []).find(m => m.type === 'gate' && m.key === key); return !g ? 0 : (g.h || 1) > 1 ? Math.round(Math.max(0, Math.min(3, load)) * g.h / 3) : load >= 3 ? 1 : 0; };
export function setPan(key, load, eff = load){ RULE.pan[key] = Math.max(0, Math.min(3, load)); RULE.lift[key] = liftOf(key, eff); }
export function setGates(left = {}, pans = {}, walls = [], rails = {}){ RULE.rail = {}; for (const m of LEVEL.marks || []) if (m.type === 'mover' && m.kind === 'rail' && m.key && !RULE.rail[m.key]) RULE.rail[m.key] = { at: rails[m.key] ? 1 : 0, t0: null, half: m.secs || 3 };
  RULE.gates = new Set(); RULE.t0 = {}; RULE.stop = {}; if (LEVEL) LEVEL.moverGhosts = null; RULE.held = {}; RULE.pan = {}; RULE.lift = {}; RULE.walls = new Set(walls); RULE.stacks = {}; for (const m of LEVEL.marks || []) if (m.type === 'pan'){ setPan(m.key, pans[m.key] || 0); RULE.stacks[m.key] = (pans[m.key + '#'] || []).slice(); }   // (stacks: which of a scale's single stacks have gone over, in the order they went: the Unsorted, build 116)
  for (const m of LEVEL.marks || []) if (m.type === 'gate'){ const v = left[m.key]; if (v === 1) RULE.gates.add(m.key); else if (m.holds) RULE.held[m.key] = v && v.held != null ? v.held : (m.at || 0); }
  for (const m of LEVEL.marks || []) if (m.type === 'mover' && m.key && m.kind !== 'rail' && left[m.key] === 1) RULE.gates.add(m.key); }   // (a chain or a lift he set going is going still)
export const waterAt = (x, y) => { for (const w of LEVEL.waters || []) if (x >= w.x0 && x < w.x1 && y >= w.y0 && y < waterTop(w)) return w; return null; };
// the top of the water over a point (bodies of it stand one on another: a sump under a flooded room), or null out of it
export const waterOver = (x, y) => { const w = waterAt(x, y); if (!w) return null; let top = waterTop(w); for (let k = 0; k < 6; k++){ const u = waterAt(x, top + 0.01); if (!u) break; top = waterTop(u); } return top; };
export const flowOn = f => f.key === 'fall' ? true : f.key === 'surge' ? RULE.surge > 0 : RULE.wetAll || RULE.wet.has(f.key);   // ('surge': the Lock's water, while it lets go)
export const flowAt = (x, y) => { for (const f of LEVEL.flows || []) if (!f.soft && x >= f.x0 && x < f.x1 && y >= f.y0 && y < f.y1 && flowOn(f)) return f; return null; };
export const updraftAt = (x, y) => { for (const u of LEVEL.updrafts) if (x >= u.x0 && x < u.x1 && y >= u.y0 && y < u.y1 && (!u.wall || RULE.walls.has(u.wall))) return u; if (RULE.fallen) for (const u of LEVEL.gusts || []) if (x >= u.x0 && x < u.x1 && y >= u.y0 && y < u.y1) return u; return null; };
// the wind's beat while the Wyrm holds it: it blows a while, drops a while (in a test, always: the worst of it)
export const gustOn = () => PHASE.all || (PHASE.t % 4.4) < 2.6;
export const gustAt = (x, y) => { if (RULE.fallen || !gustOn()) return null; for (const u of LEVEL.gusts || []) if (x >= u.x0 && x < u.x1 && y >= u.y0 && y < u.y1) return u; return null; };
export const tileOf = (x, y) => tileAt(Math.floor(x / T), Math.floor(y / T));
export const solidAt = (x, y) => tileOf(x, y) === ROCK;
export const roomAt = (x, y) => LEVEL.rooms.find(r => x >= r.x0 && x < r.x1 && y >= r.y0 && y < r.y1) || null;
export const spawnPoint = () => { const m = LEVEL.marks.find(k => k.type === 'spawn'); return { x: (m.x + 0.5) * T, y: m.y * T }; };
