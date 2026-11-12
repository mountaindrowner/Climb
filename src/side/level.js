// The side view's world: a grid of tiles, half a unit square, climbing up through rooms joined by doorways, shafts and
// tunnels, the way a metroidvania's map is. Rooms are built from a few pieces (walls, doors, ledges, stairs, low
// tunnels, rooms.js) so each is easy to read and change; a region is a grid of rooms, and there are six, one over the
// other: the Roots (caves), the Cloister (a ruined monastery), the Spires (ice, and the high pass), then, each in its own
// file under regions/, the Tempest (the storm round the mountain), the Gardens (above the cloud) and the Firmament (the
// summit, among the stars). One is in play at a time (LEVEL; loadLevel changes it).
import { T, ROOM, EMPTY, ROCK, LEDGE, SPIKES, CRACKED, GLASS_A, GLASS_B, room, put, rect, walls, door, ledge, stairs, mark, open } from './rooms.js';
import tempest from './regions/tempest.js';
import gardens from './regions/gardens.js';
import firmament from './regions/firmament.js';
export { T, ROOM, EMPTY, ROCK, LEDGE, SPIKES, CRACKED, GLASS_A, GLASS_B };

// ---- the first region: up from the bottom of the mountain
function start(){
  const r = room(); walls(r); door(r, 'right', 2, 7);
  ledge(r, 8, 13, 6); rect(r, 2, 2, 4, 3);
  mark(r, 'spawn', 6, 2); mark(r, 'torch', 5, 7); mark(r, 'torch', 30, 7); mark(r, 'crystal', 20, 2);
  return r;
}
function corridor(){
  const r = room(); walls(r); door(r, 'left', 2, 7); door(r, 'top', 30, 36);
  rect(r, 16, 0, 21, 1, EMPTY); rect(r, 16, 0, 21, 0, SPIKES);   // a pit with spikes: jump it
  ledge(r, 30, 36, 6); ledge(r, 25, 30, 10); ledge(r, 32, 37, 14); ledge(r, 26, 31, 18); ledge(r, 30, 36, 21);   // the last, in the doorway: up into the shaft
  mark(r, 'crawler', 10, 2); mark(r, 'torch', 12, 8); mark(r, 'torch', 26, 6); mark(r, 'crystal', 37, 15);
  return r;
}
function shaft(){
  const r = room(); walls(r); door(r, 'bottom', 30, 36); door(r, 'left', 15, 19);
  rect(r, 2, 2, 22, 13);                                          // the rock the shaft is cut beside
  ledge(r, 33, 37, 5); ledge(r, 25, 29, 9); ledge(r, 33, 37, 13); ledge(r, 24, 28, 17);
  mark(r, 'flitter', 30, 16); mark(r, 'crystal', 24, 2); mark(r, 'crystal', 37, 20); mark(r, 'torch', 10, 17);
  return r;
}
function tunnel(){
  const r = room(); walls(r); door(r, 'right', 15, 19); door(r, 'top', 3, 15);
  rect(r, 2, 2, 37, 13);                                          // solid under the tunnel
  rect(r, 17, 17, 28, 20);                                        // a low stretch: crouch or roll under it
  stairs(r, 13, 14, 8, -1, 1);                                    // up to the hole in the roof
  rect(r, 2, 2, 5, 20);                                           // the stair meets the wall: no pit beside its top
  mark(r, 'burrower', 30, 14); mark(r, 'torch', 33, 18); mark(r, 'crystal', 20, 14);
  return r;
}
function chamber(){
  const r = room(); walls(r); door(r, 'bottom', 3, 15); door(r, 'right', 2, 7); door(r, 'top', 26, 32);
  ledge(r, 3, 15, 1);                                             // over the hole up from the tunnel: jump up through it
  ledge(r, 12, 18, 5); ledge(r, 22, 28, 9); ledge(r, 10, 16, 13); ledge(r, 24, 32, 16); ledge(r, 26, 32, 20);
  rect(r, 18, 2, 20, 3);
  mark(r, 'flitter', 20, 12); mark(r, 'torch', 11, 15); mark(r, 'torch', 29, 18); mark(r, 'crystal', 30, 2); mark(r, 'crystal', 14, 14); mark(r, 'crawler', 30, 2);
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
  ledge(r, 14, 19, 12); ledge(r, 22, 27, 8);                      // down to the floor
  rect(r, 28, 0, 31, 1, EMPTY); rect(r, 28, 0, 31, 0, SPIKES);    // a spiked gap before the well
  rect(r, 16, 19, 18, 20); rect(r, 30, 18, 33, 20);               // teeth in the roof
  mark(r, 'crawler', 22, 2); mark(r, 'spitter', 35, 13); mark(r, 'torch', 6, 19); mark(r, 'torch', 25, 6); mark(r, 'crystal', 13, 2); mark(r, 'crystal', 36, 2);
  return r;
}
// two screens tall: ledges up to the arena, and a door halfway up to the grotto
function well(){
  const r = room(1, 2); walls(r); door(r, 'left', 2, 7); door(r, 'left', 38, 42); door(r, 'top', 30, 36);
  [[24, 32, 5], [8, 16, 9], [22, 30, 13], [30, 37, 17], [14, 22, 21], [2, 10, 25], [16, 24, 29], [8, 16, 33], [2, 12, 37], [16, 24, 36], [30, 37, 38], [30, 36, 42]]
    .forEach(([a, b, y]) => ledge(r, a, b, y));
  mark(r, 'flitter', 20, 24); mark(r, 'flitter', 26, 36); mark(r, 'spitter', 36, 30);
  mark(r, 'torch', 34, 8); mark(r, 'torch', 4, 20); mark(r, 'torch', 34, 26); mark(r, 'torch', 20, 42); mark(r, 'crystal', 3, 2); mark(r, 'crystal', 37, 18); mark(r, 'crystal', 3, 26);
  return r;
}
function roost(){
  const r = room(); walls(r); door(r, 'bottom', 26, 32); door(r, 'right', 14, 18);
  ledge(r, 26, 32, 1);                                            // a step in the hole up from the chamber
  ledge(r, 16, 22, 5); ledge(r, 5, 11, 8); ledge(r, 14, 20, 11); ledge(r, 27, 37, 13);
  rect(r, 6, 16, 9, 20); rect(r, 20, 18, 23, 20);                 // hanging rock
  mark(r, 'flitter', 10, 14); mark(r, 'flitter', 30, 17); mark(r, 'torch', 3, 12); mark(r, 'torch', 34, 4); mark(r, 'crystal', 18, 2); mark(r, 'crystal', 35, 14);
  return r;
}
function bridge(){
  const r = room(); walls(r); door(r, 'left', 14, 18); door(r, 'right', 14, 18);
  rect(r, 2, 2, 37, 13);                                          // high ground both sides
  rect(r, 10, 2, 29, 13, EMPTY); rect(r, 10, 2, 29, 2, SPIKES);   // a chasm with spikes at the bottom
  ledge(r, 13, 15, 12); ledge(r, 19, 21, 14); ledge(r, 25, 27, 12);
  rect(r, 15, 18, 17, 20); rect(r, 24, 19, 26, 20);
  mark(r, 'flitter', 20, 17); mark(r, 'torch', 5, 17); mark(r, 'torch', 34, 17); mark(r, 'crystal', 20, 3); mark(r, 'crystal', 12, 3); mark(r, 'crystal', 28, 3);
  return r;
}
// a basin of crystals and the shrine: it fills the flask and is where you wake
function grotto(){
  const r = room(); walls(r); door(r, 'left', 14, 18); door(r, 'right', 15, 19);
  rect(r, 2, 2, 37, 13); rect(r, 12, 8, 27, 13, EMPTY);           // the floor, and the basin in it
  ledge(r, 13, 16, 11); ledge(r, 23, 26, 11);                     // steps out of it
  rect(r, 30, 14, 37, 14);                                        // a step up to the well
  mark(r, 'shrine', 20, 8); mark(r, 'crystal', 13, 8); mark(r, 'crystal', 26, 8); mark(r, 'crystal', 18, 8);
  mark(r, 'torch', 6, 17); mark(r, 'torch', 33, 18);
  return r;
}
// the top: a vast cavern over a long stage. The Warden rises at the back of it; the way on opens when it falls
function arena(){
  const r = room(2, 2); walls(r); door(r, 'bottom', 70, 76);
  rect(r, 2, 2, 77, 8);                                           // the stage
  rect(r, 70, 0, 76, 8, EMPTY); ledge(r, 70, 76, 1); ledge(r, 70, 76, 5); ledge(r, 70, 76, 8);   // up through it
  ledge(r, 9, 17, 15); ledge(r, 62, 70, 15);                      // high ground at either end, out of the sweep
  mark(r, 'boss', 40, 9); mark(r, 'exit', 6, 9);
  mark(r, 'torch', 8, 13); mark(r, 'torch', 30, 12); mark(r, 'torch', 50, 12); mark(r, 'torch', 72, 13); mark(r, 'crystal', 20, 9); mark(r, 'crystal', 60, 9);
  return r;
}
// ---- the second region: the Cloister, a ruined monastery cut into the mountain over the Warden's cavern. Halls,
// a bell tower three screens tall, cells to crawl through; two ways round to the chapel at the top.
function undercroft(){
  const r = room(); walls(r); door(r, 'right', 2, 7);
  rect(r, 13, 2, 17, 4); rect(r, 25, 2, 29, 4);                   // tombs: hop them
  ledge(r, 19, 23, 8);
  mark(r, 'spawn', 6, 2); mark(r, 'torch', 4, 7); mark(r, 'torch', 21, 12); mark(r, 'torch', 35, 9); mark(r, 'crystal', 15, 5); mark(r, 'crystal', 27, 5); mark(r, 'acolyte', 33, 2);
  return r;
}
function nave(){
  const r = room(2, 1); walls(r); door(r, 'left', 2, 7); door(r, 'right', 2, 7);
  for (const x of [18, 50]){ rect(r, x, 0, x + 5, 1, EMPTY); rect(r, x, 0, x + 5, 0, SPIKES); }   // two pits
  ledge(r, 8, 15, 6); ledge(r, 26, 34, 6); ledge(r, 36, 44, 10); ledge(r, 56, 64, 6); ledge(r, 66, 73, 10);   // the galleries
  rect(r, 38, 2, 41, 3);                                          // a plinth mid-hall
  mark(r, 'acolyte', 30, 2); mark(r, 'acolyte', 62, 2); mark(r, 'wisp', 40, 11); mark(r, 'gargoyle', 22, 13); mark(r, 'gargoyle', 58, 14); mark(r, 'crawler', 70, 2);
  mark(r, 'torch', 5, 8); mark(r, 'torch', 28, 12); mark(r, 'torch', 46, 6); mark(r, 'torch', 60, 12); mark(r, 'torch', 75, 8); mark(r, 'crystal', 11, 7); mark(r, 'crystal', 70, 11); mark(r, 'crystal', 34, 2);
  return r;
}
// three screens tall: ledges up past a door to the library, to a door onto the cloister walk; the bell's rope hangs above
function belfry(){
  const r = room(1, 3); walls(r); door(r, 'left', 2, 7); door(r, 'left', 25, 30); door(r, 'left', 48, 53);
  [[24, 32, 5], [10, 18, 9], [22, 30, 13], [30, 37, 17], [16, 24, 21], [2, 10, 24], [14, 22, 28], [26, 34, 32], [30, 37, 36], [18, 26, 40], [8, 16, 44], [2, 10, 47], [16, 24, 51], [28, 36, 55]]
    .forEach(([a, b, y]) => ledge(r, a, b, y));
  mark(r, 'gargoyle', 20, 16); mark(r, 'gargoyle', 12, 36); mark(r, 'wisp', 33, 37); mark(r, 'wisp', 6, 12); mark(r, 'bell', 20, 64);
  mark(r, 'torch', 34, 8); mark(r, 'torch', 5, 28); mark(r, 'torch', 34, 42); mark(r, 'torch', 5, 51); mark(r, 'crystal', 3, 2); mark(r, 'crystal', 34, 18); mark(r, 'crystal', 32, 56);
  return r;
}
function library(){
  const r = room(); walls(r); door(r, 'right', 2, 7); door(r, 'left', 2, 7);
  rect(r, 13, 2, 27, 2); rect(r, 15, 3, 25, 3);                   // the dais, stepped
  ledge(r, 5, 11, 8); ledge(r, 29, 35, 8);
  mark(r, 'shrine', 20, 4); mark(r, 'crystal', 8, 9); mark(r, 'crystal', 32, 9); mark(r, 'torch', 4, 13); mark(r, 'torch', 36, 13); mark(r, 'torch', 14, 9); mark(r, 'torch', 26, 9);
  return r;
}
function cells(){
  const r = room(); walls(r); door(r, 'right', 2, 7); door(r, 'left', 2, 7);
  rect(r, 9, 5, 13, 20); rect(r, 19, 5, 23, 20); rect(r, 29, 5, 33, 20);   // the cell walls: crouch or roll under each
  mark(r, 'burrower', 16, 2); mark(r, 'acolyte', 26, 2); mark(r, 'torch', 5, 9); mark(r, 'torch', 16, 9); mark(r, 'torch', 26, 9); mark(r, 'torch', 36, 9); mark(r, 'crystal', 16, 2);
  return r;
}
function stairwell(){
  const r = room(1, 2); walls(r); door(r, 'right', 2, 7); door(r, 'right', 25, 30);
  stairs(r, 30, 2, 10, -1, 2); rect(r, 2, 2, 10, 11);            // the long stair up to a landing against the wall
  ledge(r, 13, 19, 15); ledge(r, 22, 29, 18); ledge(r, 31, 37, 21); ledge(r, 30, 37, 24);   // and on up to the walk
  rect(r, 2, 30, 14, 43);                                         // the wall closes in over the landing
  mark(r, 'wisp', 26, 12); mark(r, 'gargoyle', 24, 30); mark(r, 'acolyte', 6, 12); mark(r, 'torch', 35, 9); mark(r, 'torch', 16, 12); mark(r, 'torch', 20, 26); mark(r, 'torch', 35, 34); mark(r, 'crystal', 4, 12); mark(r, 'crystal', 25, 19);
  return r;
}
function cloister(){
  const r = room(2, 1); walls(r); door(r, 'left', 2, 7); door(r, 'right', 2, 7); door(r, 'top', 66, 72);
  for (const x of [14, 46]){ rect(r, x, 0, x + 5, 1, EMPTY); rect(r, x, 0, x + 5, 0, SPIKES); }
  ledge(r, 56, 62, 5); ledge(r, 60, 65, 9); ledge(r, 64, 70, 13); ledge(r, 66, 72, 17); ledge(r, 66, 72, 21);   // up to the chapel
  rect(r, 6, 17, 9, 20); rect(r, 26, 16, 29, 20); rect(r, 44, 17, 47, 20);   // broken vaulting
  mark(r, 'shrine', 36, 2);                                       // the last before the chapel
  mark(r, 'acolyte', 23, 2); mark(r, 'acolyte', 54, 2); mark(r, 'gargoyle', 40, 13); mark(r, 'gargoyle', 20, 14); mark(r, 'wisp', 50, 9);
  mark(r, 'torch', 5, 8); mark(r, 'torch', 24, 9); mark(r, 'torch', 42, 6); mark(r, 'torch', 57, 9); mark(r, 'torch', 75, 8); mark(r, 'crystal', 10, 2); mark(r, 'crystal', 76, 2); mark(r, 'crystal', 30, 2);
  return r;
}
// the top of the Cloister: the chapel, two screens high, where the Toll hangs. The way on opens when it falls
function chapel(){
  const r = room(2, 2); walls(r); door(r, 'bottom', 66, 72); ledge(r, 66, 72, 1);
  ledge(r, 4, 11, 8); ledge(r, 58, 64, 8);                        // galleries at either end, out of its swing
  mark(r, 'boss', 40, 2); mark(r, 'exit', 6, 2);
  mark(r, 'torch', 14, 9); mark(r, 'torch', 30, 9); mark(r, 'torch', 50, 9); mark(r, 'torch', 66, 9); mark(r, 'crystal', 22, 2); mark(r, 'crystal', 56, 2);
  return r;
}

// ---- the third region: the Spires, out in the open air near the summit. Nothing is filled in here: the rock is
// what each piece draws, the rest is sky. Caves in the mountain on the left; outside, a climb up between a needle and
// a tower, a rope bridge back across, a cavern of ice, the tower's teeth, a last bridge, and the summit.
function massif(){ const r = room(); rect(r, 0, 0, r.w - 1, r.h - 1); r.filler = true; return r; }   // the mountain itself
// the mountain's brow: the rock under the ice cave, leaning out over the gap
function brow(){ const r = room(); rect(r, 0, 13, r.w - 1, r.h - 1); rect(r, 0, 7, 27, 12); rect(r, 0, 1, 12, 6); r.filler = true; return r; }
function mouth(){
  const r = room(); rect(r, 0, 0, r.w - 1, r.h - 1); rect(r, 2, 2, 37, 20, EMPTY); door(r, 'right', 2, 7);
  rect(r, 2, 2, 4, 3); ledge(r, 12, 18, 6);
  mark(r, 'spawn', 7, 2); mark(r, 'torch', 5, 8); mark(r, 'torch', 30, 7); mark(r, 'crystal', 22, 2); mark(r, 'crystal', 15, 7);
  return r;
}
function saddle(){
  const r = open(2, 1);
  rect(r, 0, 0, 79, 1); rect(r, 0, 8, 3, 22);                     // the ground; the cliff over the cave's mouth
  for (const x of [20, 44]){ rect(r, x, 0, x + 5, 1, EMPTY); rect(r, x, 0, x + 5, 0, SPIKES); }   // crevasses, iced
  rect(r, 10, 2, 14, 3); rect(r, 30, 2, 37, 4); rect(r, 32, 5, 35, 5);   // outcrops
  rect(r, 54, 8, 57, 22); rect(r, 66, 2, 79, 22);                 // the needle (a flake off the tower: the way in is under it), and the foot of the tower
  ledge(r, 58, 65, 5); ledge(r, 58, 61, 9); ledge(r, 62, 65, 13); ledge(r, 58, 61, 17); ledge(r, 62, 65, 21);   // up between them
  mark(r, 'harpy', 26, 12); mark(r, 'harpy', 46, 10); mark(r, 'yeti', 40, 2); mark(r, 'burrower', 16, 2);
  mark(r, 'torch', 6, 9); mark(r, 'crystal', 12, 4); mark(r, 'crystal', 33, 6); mark(r, 'crystal', 52, 2); mark(r, 'torch', 64, 8);
  return r;
}
function spire(){
  const r = open(1, 2);
  rect(r, 14, 0, 17, 45); rect(r, 26, 0, 39, 34); rect(r, 30, 35, 33, 45); rect(r, 36, 35, 39, 45);   // the needle; the tower; the two teeth that rise from its top
  ledge(r, 18, 21, 2); ledge(r, 22, 25, 6); ledge(r, 18, 21, 10); ledge(r, 22, 25, 14); ledge(r, 18, 21, 18); ledge(r, 22, 25, 22);
  rect(r, 14, 25, 17, 30, EMPTY); ledge(r, 0, 17, 24);            // a gap through the needle: the rope bridge leaves here
  ledge(r, 18, 21, 26); ledge(r, 22, 25, 30);                     // and on, to the top of the tower
  mark(r, 'harpy', 8, 12); mark(r, 'harpy', 20, 40); mark(r, 'wraith', 8, 30); mark(r, 'crystal', 27, 35); mark(r, 'crystal', 34, 35); mark(r, 'torch', 12, 28);
  return r;
}
function nest(){
  const r = open();
  rect(r, 0, 0, 5, 22); rect(r, 6, 8, 30, 11);                    // the mountain's face; a shelf out of it, under the bridge
  ledge(r, 6, 10, 16); ledge(r, 6, 10, 20);                       // back up to the bridge
  mark(r, 'harpy', 18, 16); mark(r, 'yeti', 24, 12); mark(r, 'crystal', 26, 12); mark(r, 'crystal', 12, 12);
  return r;
}
function ropeway(){
  const r = open();
  rect(r, 0, 0, 3, 1); rect(r, 0, 8, 2, 22);                      // the sill of the hollow's door, the face above it
  ledge(r, 4, 8, 1); ledge(r, 11, 16, 1); ledge(r, 19, 24, 1); ledge(r, 27, 32, 1); ledge(r, 35, 39, 1);   // the bridge, broken
  mark(r, 'harpy', 14, 6); mark(r, 'harpy', 30, 8); mark(r, 'torch', 2, 4);
  return r;
}
function hollow(){
  const r = room(); rect(r, 0, 0, r.w - 1, r.h - 1); rect(r, 2, 2, 37, 20, EMPTY); door(r, 'right', 2, 7); door(r, 'top', 8, 14);
  rect(r, 21, 2, 31, 2); rect(r, 23, 3, 29, 3);                   // the shrine's step
  [[10, 16, 5], [16, 22, 9], [10, 16, 13], [8, 14, 17], [8, 14, 21]].forEach(([a, b, y]) => ledge(r, a, b, y));
  mark(r, 'shrine', 26, 4); mark(r, 'torch', 34, 9); mark(r, 'torch', 5, 9); mark(r, 'torch', 26, 14); mark(r, 'crystal', 34, 2); mark(r, 'crystal', 4, 2);
  return r;
}
function chimney(){
  const r = room(); rect(r, 0, 0, r.w - 1, r.h - 1); rect(r, 2, 2, 37, 20, EMPTY); door(r, 'bottom', 8, 14); door(r, 'top', 26, 32);
  ledge(r, 8, 14, 1);
  [[14, 20, 5], [22, 28, 9], [26, 32, 13], [26, 32, 17], [26, 32, 21]].forEach(([a, b, y]) => ledge(r, a, b, y));
  rect(r, 4, 14, 8, 20); rect(r, 33, 2, 37, 5);
  mark(r, 'wraith', 35, 12); mark(r, 'wraith', 10, 8); mark(r, 'torch', 4, 7); mark(r, 'torch', 35, 18); mark(r, 'crystal', 35, 6); mark(r, 'crystal', 17, 6);
  return r;
}
// a cavern of ice through the mountain, out to its far face
function icecave(){
  const r = room(2, 1); rect(r, 0, 0, r.w - 1, r.h - 1); rect(r, 2, 2, 77, 20, EMPTY); door(r, 'bottom', 26, 32); ledge(r, 26, 32, 1); door(r, 'right', 2, 7);
  rect(r, 2, 2, 12, 5);                                           // a bank of ice at the back
  for (const x of [38, 60]){ rect(r, x, 0, x + 5, 1, EMPTY); rect(r, x, 0, x + 5, 0, SPIKES); }   // pits of ice
  rect(r, 47, 5, 55, 20);                                         // the roof comes down: crouch or roll under it
  ledge(r, 14, 20, 6); ledge(r, 33, 37, 6); ledge(r, 64, 70, 7);
  mark(r, 'yeti', 20, 2); mark(r, 'wraith', 34, 12); mark(r, 'wraith', 66, 12); mark(r, 'yeti', 72, 2);
  mark(r, 'torch', 5, 9); mark(r, 'torch', 24, 10); mark(r, 'torch', 43, 9); mark(r, 'torch', 58, 10); mark(r, 'torch', 75, 10); mark(r, 'crystal', 7, 6); mark(r, 'crystal', 44, 2); mark(r, 'crystal', 67, 8); mark(r, 'crystal', 57, 2);
  return r;
}
// outside again, high over the tower: its teeth to cross, and the horn to climb
function teeth(){
  const r = open(1, 2);
  rect(r, 14, 0, 17, 26); rect(r, 30, 0, 33, 30); rect(r, 36, 0, 39, 45);   // the needle's tip, the middle tooth, the horn
  rect(r, 0, 23, 3, 24); ledge(r, 7, 10, 24);                     // the sill of the ice cave's door, a plank out from it
  ledge(r, 21, 26, 27);                                           // between the needle and the tooth
  ledge(r, 34, 35, 33); ledge(r, 32, 35, 37); ledge(r, 32, 35, 41); ledge(r, 32, 35, 45);   // up the horn
  mark(r, 'harpy', 22, 34); mark(r, 'harpy', 8, 32); mark(r, 'wraith', 24, 40); mark(r, 'crystal', 15, 27); mark(r, 'crystal', 31, 31); mark(r, 'torch', 2, 27);
  return r;
}
// the last bridge, from the horn's tip back to the mountain
function span(){
  const r = open();
  rect(r, 36, 0, 39, 12); rect(r, 0, 0, 2, 1); rect(r, 0, 8, 1, 22);   // the horn's tip; the eyrie's sill, the face over its door
  ledge(r, 32, 35, 1); ledge(r, 23, 28, 1); ledge(r, 14, 19, 1); ledge(r, 5, 10, 1); ledge(r, 3, 4, 1);
  mark(r, 'harpy', 12, 8); mark(r, 'harpy', 26, 10); mark(r, 'torch', 2, 4); mark(r, 'crystal', 37, 13);
  return r;
}
// under the summit: a long cave, the last shrine, and the way up through its roof
function eyrie(){
  const r = room(2, 1); rect(r, 0, 0, r.w - 1, r.h - 1); rect(r, 2, 2, 77, 20, EMPTY); door(r, 'right', 2, 7); door(r, 'top', 36, 42);
  rect(r, 50, 2, 62, 2); rect(r, 52, 3, 60, 3);                   // the shrine's step
  [[20, 26, 5], [28, 34, 9], [34, 40, 13], [36, 42, 17], [36, 42, 21]].forEach(([a, b, y]) => ledge(r, a, b, y));
  rect(r, 2, 2, 8, 4);
  mark(r, 'shrine', 56, 4); mark(r, 'yeti', 14, 2); mark(r, 'wraith', 22, 14);
  mark(r, 'torch', 5, 9); mark(r, 'torch', 30, 5); mark(r, 'torch', 46, 9); mark(r, 'torch', 66, 9); mark(r, 'torch', 75, 9); mark(r, 'crystal', 4, 5); mark(r, 'crystal', 70, 2); mark(r, 'crystal', 44, 2);
  return r;
}
// the summit: a crown of rock under the open sky, where the Rime Wyrm keeps the peak. The beacon is lit when it falls
function crown(){
  const r = open(2, 2);
  rect(r, 0, 0, 79, 1); rect(r, 36, 0, 42, 1, EMPTY); ledge(r, 36, 42, 1);   // the top of the mountain, the way up through it
  rect(r, 0, 2, 3, 26); rect(r, 76, 2, 79, 22);                   // a horn of rock at either end
  ledge(r, 4, 9, 8); ledge(r, 70, 75, 8);
  mark(r, 'boss', 40, 2); mark(r, 'exit', 12, 2);
  mark(r, 'torch', 18, 7); mark(r, 'torch', 62, 7); mark(r, 'crystal', 24, 2); mark(r, 'crystal', 56, 2);
  return r;
}

// the regions, from the bottom of the mountain up: rooms on a grid, [column, row, builder, columns wide, rows tall].
// `fill` is what is between the rooms; `wear` is how hard the organic pass works the rock
const REGIONS = [
  { name: 'The Roots', theme: 'roots', sub: 'the bottom of the mountain', card: '', epithet: 'KEEPER OF THE ROOTS', quiet: ['arena'], seed: 1234567, wear: { sag: 1, swell: 1, humps: 0.8 },
    layout: [[0, 0, start], [1, 0, corridor], [1, 1, shaft], [0, 1, tunnel], [0, 2, chamber], [1, 2, ascent], [2, 2, gallery], [3, 2, well, 1, 2], [0, 3, roost], [1, 3, bridge], [2, 3, grotto], [2, 4, arena, 2, 2]] },
  { name: 'The Cloister', theme: 'cloister', sub: 'a house of stone over the Warden\'s hall', card: 'The Roots are below him. The climb goes on.', epithet: 'THE VOICE OF THE CLOISTER', quiet: ['chapel'], seed: 7654321, wear: { sag: 0.55, swell: 0.5, humps: 0.4 },
    layout: [[0, 0, undercroft], [1, 0, nave, 2, 1], [3, 0, belfry, 1, 3], [0, 1, stairwell, 1, 2], [1, 1, cells], [2, 1, library], [1, 2, cloister, 2, 1], [1, 3, chapel, 2, 1]] },
  { name: 'The Spires', theme: 'spires', sub: 'the open air, and the high pass', card: 'Out of the stone, into the open air.', epithet: 'IT KEEPS THE HIGH PASS', quiet: ['crown'], seed: 2468101, fill: EMPTY, sky: true, wear: { sag: 1.1, swell: 0.5, humps: 0.6 },
    layout: [[0, 0, mouth], [1, 0, saddle, 2, 1], [0, 1, massif], [1, 1, nest], [2, 1, spire, 1, 2], [0, 2, hollow], [1, 2, ropeway], [0, 3, chimney], [1, 3, brow], [0, 4, icecave, 2, 1], [2, 3, teeth, 1, 2],
      [0, 5, eyrie, 2, 1], [2, 5, span], [0, 6, crown, 2, 2]], cols: 3 },
  tempest, gardens, firmament,   // each in its own file (regions/)
];
export const LEVELS = REGIONS.map(r => ({ name: r.name, theme: r.theme, sub: r.sub || '', card: r.card || '', epithet: r.epithet || '' }));
export const REGION_DATA = REGIONS;   // a region's own look, creatures and music, where its file has them (themeDef, deco, enemies, ai, songs)
const QUIET = new Set(REGIONS.flatMap(r => r.quiet || []));   // a boss's stage stays flat (its blows run along it)

function build(n){
  const R = REGIONS[n], LAYOUT = R.layout;
  const cols = Math.max(R.cols || 0, ...LAYOUT.map(l => l[0] + (l[3] || 1))), rows = Math.max(...LAYOUT.map(l => l[1] + (l[4] || 1)));
  const W = cols * ROOM.w, H = rows * ROOM.h, tiles = new Uint8Array(W * H).fill(R.fill === undefined ? ROCK : R.fill), marks = [], rooms = [];
  for (const [cx, cy, make] of LAYOUT){
    const r = make(), ox = cx * ROOM.w, oy = cy * ROOM.h;
    for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++) tiles[(oy + y) * W + ox + x] = r.tiles[y][x];
    for (const m of r.marks) marks.push({ ...m, x: ox + m.x, y: oy + m.y });
    if (!r.filler) rooms.push({ name: make.name, open: !!r.open, x0: ox * T, y0: oy * T, x1: (ox + r.w) * T, y1: (oy + r.h) * T, tx0: ox, ty0: oy, tx1: ox + r.w, ty1: oy + r.h });
  }
  const raw = tiles.slice();
  organic(tiles, W, H, marks, rooms, R.seed, R.wear);
  // what the motor asks about every step: the flowers' tiles, and the rising air (in world units)
  const pads = new Map(), updrafts = [];
  for (const m of marks){
    if (m.type === 'bloom') for (let a = -1; a <= 1; a++) pads.set(m.y * W + m.x + a, m);
    if (m.type === 'updraft') updrafts.push({ x0: m.x * T, y0: m.y * T, x1: (m.x + (m.w || 4)) * T, y1: (m.y + (m.h || 12)) * T });
  }
  return { index: n, name: R.name, theme: R.theme, sky: !!R.sky, W, H, tiles, marks, rooms, raw, pads, updrafts, tiles0: tiles.slice() };
}
// the region in play. One object, refilled when he goes up a region, so everything that reads it reads the new one
export const LEVEL = {};
const BUILT = [];
export function loadLevel(n){ n = Math.max(0, Math.min(REGIONS.length - 1, n | 0)); Object.assign(LEVEL, BUILT[n] || (BUILT[n] = build(n))); return LEVEL; }
loadLevel(typeof location !== 'undefined' && location.search ? (parseInt(new URLSearchParams(location.search).get('level')) || 1) - 1 : 0);

// ---- the organic pass: the rooms are drawn as boxes (easy to read and change); this wears them into caves. It
// never touches the space he moves through: the floor he walks and four tiles over it, doorways and their way in,
// and the markers. Outside that it fills the corners where floor meets wall with ramps (steps a tile high, which he
// walks up, drawn as slopes), rounds the top corners off with wedges, hangs lumps from ceilings, swells the walls and
// raises low humps along long floors. The same every load (a fixed seed).
function organic(tiles, W, H, marks, rooms, seed0 = 1234567, wear = { sag: 1, swell: 1, humps: 0.8 }){
  let seed = seed0; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647, ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
  const at = (i, j) => { if (i < 0 || j < 0 || i >= W || j >= H) return ROCK; const t = tiles[j * W + i]; return t === CRACKED ? ROCK : t === GLASS_A || t === GLASS_B ? LEDGE : t; };   // cracked rock is rock, star-glass a ledge
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
export const glassOn = k => PHASE.all || ((PHASE.t / PHASE.period) % 2 < 1) === (k === GLASS_A);
// the tile as it is drawn into the level (cracked rock and star-glass as themselves)
export const rawAt = (tx, ty) => tx < 0 || ty < 0 || tx >= LEVEL.W || ty >= LEVEL.H ? ROCK : LEVEL.tiles[ty * LEVEL.W + tx];
// the tile as he meets it now: cracked rock is rock, star-glass a ledge while it is there
export const tileAt = (tx, ty) => { if (tx < 0 || ty < 0 || tx >= LEVEL.W || ty >= LEVEL.H) return ROCK; const t = LEVEL.tiles[ty * LEVEL.W + tx]; return t < CRACKED ? t : t === CRACKED ? ROCK : glassOn(t) ? LEDGE : EMPTY; };
export const updraftAt = (x, y) => { for (const u of LEVEL.updrafts) if (x >= u.x0 && x < u.x1 && y >= u.y0 && y < u.y1) return u; return null; };
export const tileOf = (x, y) => tileAt(Math.floor(x / T), Math.floor(y / T));
export const solidAt = (x, y) => tileOf(x, y) === ROCK;
export const roomAt = (x, y) => LEVEL.rooms.find(r => x >= r.x0 && x < r.x1 && y >= r.y0 && y < r.y1) || null;
export const spawnPoint = () => { const m = LEVEL.marks.find(k => k.type === 'spawn'); return { x: (m.x + 0.5) * T, y: m.y * T }; };
