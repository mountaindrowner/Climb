// The Ossuary: the Roots' wing, east of the climb (docs/world.md). The house laid its dead here, as near the water as it
// could, because it was said the water gives back; when the dark came there were more dead than room, and the house sent
// sextons down to sort them and count them, and they are counting still. Built into the Roots (level.js lays these rooms
// beside the climb's), worn in the Cloister's look (the house built it), and closed by cracked stone at the foot of the
// well until the Warden's weight breaks it: `gate: 'breaker'` on every room, and the tests check none of it can be
// reached before the gate and all of it after.
//   aisle     the long aisle: the door's side, niches in the walls, the Tallymen at their count
//   sorting   off the niches' foot: the bones sorted by kind, in heaps
//   niches    a climb up a wall of niches, grave-lights in it
//   yard      the Sexton's yard: the elite, who buries what moves
//   count     his own count, kept on the wall by someone else; the relic. Its west end is the deadhouse stair, up to a door
//             over the Warden's hall: the way back, from this side only
import { room, rect, walls, door, ledge, mark, stairs } from '../rooms.js';

const TITLE = 'THE OSSUARY';
const wing = fn => { const f = () => { const r = fn(); r.title = TITLE; r.gate = 'breaker'; return r; }; Object.defineProperty(f, 'name', { value: fn.name }); return f; };
// a way up through a hole in the roof: ledges stacked in the hole's own columns, four apart, the last in the hole itself
const upTo = (r, x0, x1, y0) => { for (let y = y0; y < r.h; y += 4) ledge(r, x0, x1, y); };

function aisle(){
  const r = room(2, 1); walls(r); door(r, 'left', 2, 6); door(r, 'top', 58, 63);   // in from the well; up into the niches
  // the walls are niches, floor to roof, a candle in every tenth; the aisle floor heaped where the sorting spilled over
  for (const x of [10, 22, 34, 46, 70]) { rect(r, x, 9, x + 3, 9); rect(r, x, 15, x + 3, 15); mark(r, 'torch', x + 1, 12); }
  rect(r, 16, 2, 18, 3); rect(r, 40, 2, 43, 4); rect(r, 66, 2, 68, 3);              // heaps of bones
  upTo(r, 58, 63, 5);
  mark(r, 'acolyte', 28, 2); mark(r, 'acolyte', 52, 2); mark(r, 'wisp', 36, 12); mark(r, 'wisp', 74, 12);
  mark(r, 'urn', 9, 2); mark(r, 'urn', 41, 5); mark(r, 'urn', 76, 2); mark(r, 'crystal', 12, 2); mark(r, 'chest', 67, 4, { holds: 'shards' });
  mark(r, 'chest', 5, 2, { holds: 'thread' }); mark(r, 'crystal', 3, 2);   // just inside the door, lit: seen from the well's foot before the wall can be broken
  return r;
}
function sorting(){
  const r = room(); walls(r); door(r, 'right', 2, 7);
  // the bones sorted: skulls with skulls, long bones with long bones, each heap the height of the one who sorted it
  rect(r, 4, 2, 8, 5); rect(r, 12, 2, 15, 3); rect(r, 19, 2, 23, 6); rect(r, 27, 2, 29, 3);
  ledge(r, 4, 12, 10); ledge(r, 16, 24, 13);                                       // the shelves the counted ones go up on
  mark(r, 'acolyte', 25, 2); mark(r, 'acolyte', 10, 2);
  mark(r, 'torch', 10, 15); mark(r, 'torch', 30, 9); mark(r, 'crystal', 13, 4);
  mark(r, 'urn', 6, 6); mark(r, 'urn', 28, 4); mark(r, 'chest', 21, 7, { holds: 'thread' });
  return r;
}
function niches(){
  const r = room(1, 2); walls(r); door(r, 'bottom', 18, 23); ledge(r, 18, 23, 1);   // boards over the hole up from the aisle
  door(r, 'left', 2, 7); door(r, 'left', 25, 30);                                   // to the sorting; to the yard
  // the wall of niches up the right side, a light in each that is still lit
  for (const y of [8, 14, 20, 26, 32, 38]) { rect(r, 35, y, 37, y); mark(r, 'crystal', 36, y + 1); }
  for (const [x0, x1, y] of [[26, 32, 5], [16, 22, 9], [26, 32, 13], [16, 22, 17], [8, 14, 21]]) ledge(r, x0, x1, y);
  ledge(r, 2, 12, 24);                                                              // the step through to the yard
  mark(r, 'shrine', 7, 25);                                                         // a flame kept here, before the Sexton's yard
  mark(r, 'wisp', 22, 30); mark(r, 'wisp', 28, 39); mark(r, 'flitter', 12, 36);
  mark(r, 'torch', 6, 12); mark(r, 'torch', 30, 24); mark(r, 'torch', 10, 40); mark(r, 'urn', 9, 25);
  return r;
}
function yard(){
  const r = room(); walls(r); door(r, 'right', 2, 7); door(r, 'top', 26, 31);      // in from the niches; up to the count
  // the yard is flat, the graves in it filled and trodden level: he digs, and he will not trip on his own work
  upTo(r, 26, 31, 5);
  mark(r, 'sexton', 18, 3);
  mark(r, 'torch', 20, 10); mark(r, 'torch', 34, 10); mark(r, 'urn', 4, 2);
  return r;
}
function count(){
  const r = room(2, 1); walls(r); door(r, 'bottom', 26, 31); ledge(r, 26, 31, 1);   // up from the yard
  // the deadhouse stair, up to a door high in the west wall, which lets out above the Warden's hall: the way back, one way
  stairs(r, 21, 2, 8, -1, 2); rect(r, 2, 0, 7, 9); door(r, 'left', 10, 15);
  // the long wall of the count, a candle every few paces along it; the relic at its end, where the count stops
  for (const x of [20, 32, 44, 56, 68]) mark(r, 'torch', x, 9);
  rect(r, 72, 2, 77, 3);                                                            // a step up to where it ends
  mark(r, 'chest', 74, 4, { holds: 'relic:stylus' }); mark(r, 'crystal', 40, 2); mark(r, 'urn', 36, 2); mark(r, 'urn', 60, 2); mark(r, 'urn', 4, 10);
  return r;
}

export const LAYOUT = [[4, 2, wing(aisle), 2, 1], [4, 3, wing(sorting)], [5, 3, wing(niches), 1, 2], [4, 4, wing(yard)], [4, 5, wing(count), 2, 1]];
export const QUIET = ['aisle', 'count'];
export const LOOKS = { aisle: 'cloister', sorting: 'cloister', niches: 'cloister', yard: 'cloister', count: 'cloister' };
