// The Vein's far end (docs/edges-sheet.md, sections 7 to 11; build 120): THE FALSE LODE. Set into the Vein by level.js
// (EDGES), two columns further east, and up into the row over the level.
// East of the glitter: a drift the guild cut after a second vein. It went round, and came out in their own drift.
//   falselode  four screens, two wide and two tall: a ring. In along the foot of it, up the east riser by its sills,
//              back along the top, and down the west riser to where he came in: and there is the guild's air-door,
//              shut, lying across the riser's foot. Its windlass is over it, on the inside. A thread half-way round
// Its working is the Vein's own rule (regions/vein.js): do not go back over it. An Echo is in the ring, and goes where
// he went. Until the air-door is up the ring is a dead end, and the way out of a dead end is back over his own way.
import { room, rect, mark, EMPTY } from '../rooms.js';

const named = (fn, title, gate, look) => { const f = () => { const r = fn(); r.title = title; r.gate = gate; if (look) r.look = look; return r; }; Object.defineProperty(f, 'name', { value: fn.name }); return f; };
const deco = (r, kind, x, y, more) => mark(r, 'deco', x, y, { kind, ...more });
const keep = (r, x, y) => mark(r, 'keep', x, y);
const mass = (cw = 1, ch = 1) => { const r = room(cw, ch); rect(r, 0, 0, r.w - 1, r.h - 1); return r; };
// the ring, in its own rows. foot, top: the rows he stands at in its two galleries (each six high). east, west: the
// risers [from, to]. sills: [the row he stands at, 'w' or 'e'] in each riser. door: the air-door's row, across the
// west riser's foot; its windlass stands on the sill at `lass`
export const LODE = { foot: 2, top: 36, east: [70, 77], west: [2, 9], up: [[9, 'w'], [15, 'e'], [21, 'w'], [27, 'e'], [33, 'w']], down: [[26, 'w'], [15, 'e']], door: 8, lass: 15, key: 'airdoor' };
function falselode(){
  const r = mass(2, 2), D = LODE, [e0, e1] = D.east, [w0, w1] = D.west;
  rect(r, 2, D.foot, 77, D.foot + 5, EMPTY); rect(r, 0, D.foot, 1, D.foot + 5, EMPTY);   // the foot of the ring, in off the glitter
  rect(r, 2, D.top, 77, D.top + 5, EMPTY);                         // the top of it
  rect(r, e0, D.foot, e1, D.top + 5, EMPTY); rect(r, w0, D.door, w1, D.top + 5, EMPTY);   // the risers (the west one down to the air-door, which `far` sets, below)
  for (const [y, side] of D.up) rect(r, side === 'w' ? e0 : e1 - 2, y - 1, side === 'w' ? e0 + 2 : e1, y - 1);
  for (const [y, side] of D.down) rect(r, side === 'w' ? w0 : w1 - 2, y - 1, side === 'w' ? w0 + 2 : w1, y - 1);
  mark(r, 'windlass', w1 - 1, D.lass, { key: D.key, says: 'The air-door under you has gone up.' });
  mark(r, 'thread', 67, D.top); mark(r, 'chest', 13, D.top, { holds: 'shards' });
  deco(r, 'chalk', 20, D.top, { says: 'THIS IS OUR OWN DRIFT. WE HAVE CUT A RING.' }); deco(r, 'chalk', 12, D.foot, { says: 'AIR-DOOR. SHUT FROM WITHIN.' });
  mark(r, 'echo', 40, D.top);
  mark(r, 'prospector', 46, D.foot, { face: 1 }); mark(r, 'prospector', 56, D.top, { face: -1 }); mark(r, 'glimmer', 30, D.foot); mark(r, 'glimmer', 62, D.foot); mark(r, 'glimmer', 30, D.top);
  for (const [x, y] of [[36, D.foot + 5], [74, 20], [44, D.top + 5], [5, 30]]) mark(r, 'glamp', x, y);
  for (const [x, y] of [[20, D.foot], [50, D.foot], [66, D.foot], [26, D.top], [50, D.top], [63, D.top], [5, D.top]]) mark(r, 'crystal', x, y); mark(r, 'urn', 24, D.foot); mark(r, 'urn', 60, D.top);
  for (let x = 4; x <= 76; x += 4) for (const y of [D.foot + 2, D.foot + 4, D.top + 2, D.top + 4]) if (r.tiles[y][x] === EMPTY) keep(r, x, y);   // the galleries stay as they were cut
  for (let y = 10; y <= 34; y += 3) for (const x of [e0, e0 + 3, e1, w0, w0 + 3, w1]) if (r.tiles[y][x] === EMPTY) keep(r, x, y);
  return r;
}

export const far = { right: 2, build(X){
  const { EMPTY: E, ROCK, SLUICE } = X.tile, cut = (R, x0, y0, x1, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) X.set(R.tx0 + x, R.ty0 + y, E); };
  const gl = X.roomOf('glitter'); if (!gl) return;
  for (let y = gl.ty0; y < X.H; y++) for (let x = gl.tx1; x < X.W; x++) X.set(x, y, ROCK);   // the new columns are rock, from the glitter up
  const cx = Math.round((gl.tx1 - X.X0) / 40), cy = Math.round((gl.ty0 - X.Y0) / 23);
  const fl = X.addRoom(cx, cy, named(falselode, 'THE FALSE LODE', ''), { wing: true, far: true });
  cut(gl, 78, LODE.foot, 79, LODE.foot + 5);
  // the air-door: a gate lying across the west riser's foot
  const [w0, w1] = LODE.west; for (let x = w0; x <= w1; x++) X.set(fl.tx0 + x, fl.ty0 + LODE.door, SLUICE);
  X.marks.push({ type: 'gate', x: fl.tx0 + w0, y: fl.ty0 + LODE.door, w: w1 - w0 + 1, h: 1, key: LODE.key });
} };
