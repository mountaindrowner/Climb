// The Hollow's far end (docs/edges-sheet.md, sections 7 to 11; build 120): THE FAR WALL. Set into the Hollow by
// level.js (EDGES), one column further east, and up into the row over the level.
// East of the Hollow's floor, where the engine's rings stop: a rough face going up out of the lamp's reach. The guild
// tried it.
//   farfoot  the chamber at its foot, in off the east end of the circles; and the first of the shaft
//   farwall  three screens over it, the last of them in the row over the level: a shaft six wide with a rough face up
//            its east side; three sills on the other wall to let go to; at its head, where the highest of them came,
//            a thread
// It is climbed with the grip, as the way home is (regions/hollow.js): so he sees it on his way to the Auger, and
// comes back to it. An Echo is at its foot, and goes where he went; the guild's lamps hang over the sills and the head.
import { room, rect, mark, EMPTY, ROUGH } from '../rooms.js';

const named = (fn, title, gate, look) => { const f = () => { const r = fn(); r.title = title; r.gate = gate; if (look) r.look = look; return r; }; Object.defineProperty(f, 'name', { value: fn.name }); return f; };
const deco = (r, kind, x, y, more) => mark(r, 'deco', x, y, { kind, ...more });
const keep = (r, x, y) => mark(r, 'keep', x, y);
const mass = (cw = 1, ch = 1) => { const r = room(cw, ch); rect(r, 0, 0, r.w - 1, r.h - 1); return r; };
// foot: the row he stands at in the chamber (the circles' east end). shaft: [from, to]; the rough face is the column
// east of it. rests: the rows he stands at on the sills of the west wall, and head: the row he stands at, at the top
// (both in the upper room's rows: its row 0 is the foot room's row 23)
export const FARWALL = { foot: 4, shaft: [32, 37], rests: [10, 28, 44], head: 60 };
function farfoot(){
  const r = mass(), F = FARWALL, [s0, s1] = F.shaft;
  rect(r, 2, F.foot, 37, F.foot + 5, EMPTY); rect(r, 0, F.foot, 1, F.foot + 5, EMPTY);   // the chamber, in off the circles
  rect(r, s0, F.foot, s1, 22, EMPTY); rect(r, s1 + 1, F.foot, s1 + 1, 22, ROUGH);   // the first of the shaft, at the chamber's east end; and of the rough face, which is its east wall, from the floor
  deco(r, 'chalk', 12, F.foot, { says: 'ROUGH ENOUGH TO HOLD. WE TRIED IT.' }); mark(r, 'echo', 20, F.foot);
  mark(r, 'glamp', 8, F.foot + 5); mark(r, 'chest', 27, F.foot, { holds: 'shards' }); mark(r, 'urn', 6, F.foot);
  for (let x = 4; x <= 36; x += 4) keep(r, x, F.foot + 3); for (let y = F.foot + 7; y <= 21; y += 3) for (const x of [s0 + 1, s0 + 4]) keep(r, x, y);
  return r;
}
function farwall(){
  const r = mass(1, 3), F = FARWALL, [s0, s1] = F.shaft;
  rect(r, s0, 0, s1, F.head + 6, EMPTY); rect(r, s1 + 1, 0, s1 + 1, F.head + 6, ROUGH);   // the shaft, and the rough face (both a little over the head: he lets go of the face from above its lip, and comes down on to it)
  for (const y of F.rests) rect(r, s0, y - 1, s0 + 2, y - 1);       // sills on the other wall
  rect(r, s0, F.head - 1, s0 + 3, F.head - 1);                     // and the lip of the head, a tile wider: he lets go of the face from above it, and comes down on to it
  rect(r, 14, F.head, s0 - 1, F.head + 5, EMPTY);                   // the head: a place cut west off the shaft
  mark(r, 'thread', 17, F.head); deco(r, 'chalk', 22, F.head, { says: 'THE HIGHEST ANY OF US CAME.' });
  for (const y of F.rests) mark(r, 'glamp', s0 + 1, y + 5); mark(r, 'glamp', 20, F.head + 5); mark(r, 'crystal', 27, F.head);
  for (let y = 1; y <= F.head + 4; y += 3) for (const x of [s0 + 1, s0 + 4]) if (r.tiles[y][x] === EMPTY) keep(r, x, y);
  for (let x = 15; x < s0; x += 3) keep(r, x, F.head + 3);
  return r;
}

export const far = { right: 1, build(X){
  const { EMPTY: E, ROCK } = X.tile, cut = (R, x0, y0, x1, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) X.set(R.tx0 + x, R.ty0 + y, E); };
  const ci = X.roomOf('circles'); if (!ci) return;
  for (let y = 0; y < X.H; y++) for (let x = ci.tx1; x < X.W; x++) X.set(x, y, ROCK);   // the new column is rock, top to bottom
  const cx = Math.round((ci.tx1 - X.X0) / 40), cy = Math.round((ci.ty0 - X.Y0) / 23);
  X.addRoom(cx, cy, named(farfoot, 'THE FAR WALL', ''), { wing: true, far: true });
  X.addRoom(cx, cy + 1, named(farwall, 'THE FAR WALL', 'grip'), { wing: true, far: true });
  cut(ci, ci.tx1 - ci.tx0 - 2, FARWALL.foot, ci.tx1 - ci.tx0 - 1, FARWALL.foot + 5);
} };
