// The Great Shaft's far end (docs/edges-sheet.md, sections 7 to 11; build 120): THE ADIT. Set into the Great Shaft by
// level.js (EDGES), one column further west.
// Half-way down the drop, in off the camp's stage on the west wall: a tunnel the guild drove level into the rock, and
// the camp of the ones who stopped there and went no further down.
//   adit     the tunnel, and their camp in it. At its mouth a wall of stacked stone, against the shaft's cold. At its
//            far end a raise: a chimney cut up through the rock, twenty-eight rows, one sill in it
//   stopped  over it: where they slept. A thread, the last thing they chalked. Come to only up the raise
// Its working is the Cairns' (regions/cairns.js): a wall that keeps a wind off. Knocked down (three blows), the shaft's
// cold air comes through the tunnel and rises up the raise, and he rides it. The wall is at the mouth; the raise is at
// the other end.
import { room, rect, mark, EMPTY } from '../rooms.js';

const named = (fn, title, gate, look) => { const f = () => { const r = fn(); r.title = title; r.gate = gate; if (look) r.look = look; return r; }; Object.defineProperty(f, 'name', { value: fn.name }); return f; };
const deco = (r, kind, x, y, more) => mark(r, 'deco', x, y, { kind, ...more });
const keep = (r, x, y) => mark(r, 'keep', x, y);
const mass = (cw = 1, ch = 1) => { const r = room(cw, ch); rect(r, 0, 0, r.w - 1, r.h - 1); return r; };
// in the adit's own rows (its row 8 is the drop's row 31: the stage he comes in off). mouth: the row he stands at, in
// the tunnel. camp: where its roof is cut higher [from, to]. raise: the chimney [from, to]. head: the row he stands at
// in the room over (in that room's rows). wall: where the wall of stone stands
export const ADIT = { mouth: 8, stage: 31, camp: [14, 30], raise: [2, 9], sill: 20, head: 13, wall: 34, key: 'coldwall' };   // (sill: the row he stands at on the one sill in the raise)
function adit(){
  const r = mass(), A = ADIT;
  rect(r, 2, A.mouth, 37, A.mouth + 5, EMPTY); rect(r, 38, A.mouth, 39, A.mouth + 5, EMPTY);   // the tunnel, in off the stage
  rect(r, A.camp[0], A.mouth, A.camp[1], A.mouth + 8, EMPTY);      // the camp: the roof cut higher
  rect(r, A.raise[0], A.mouth, A.raise[1], 22, EMPTY);             // the foot of the raise
  rect(r, A.raise[1] - 2, A.sill - 1, A.raise[1], A.sill - 1);     // one sill in it: coming down, two drops he takes unhurt. Going up, the second is more than he climbs
  mark(r, 'windbreak', A.wall, A.mouth, { key: A.key }); mark(r, 'updraft', A.raise[0], A.mouth + 1, { w: A.raise[1] - A.raise[0] + 1, h: 23 - A.mouth + A.head + 2, wall: A.key });
  mark(r, 'chest', 22, A.mouth, { holds: 'shards' }); deco(r, 'cot', 17, A.mouth); deco(r, 'kettle', 20, A.mouth); deco(r, 'cot', 27, A.mouth);
  deco(r, 'chalk', 25, A.mouth, { says: 'KEEP THE MOUTH STOPPED OR THE COLD COMES THROUGH.' });
  mark(r, 'urn', 12, A.mouth); mark(r, 'crystal', 31, A.mouth);
  for (let x = A.camp[0] + 1; x < A.camp[1]; x += 3) keep(r, x, A.mouth + 7); for (let y = A.mouth + 2; y <= 21; y += 3) for (const x of [A.raise[0], A.raise[0] + 3, A.raise[1]]) if (r.tiles[y][x] === EMPTY) keep(r, x, y);
  return r;
}
function stopped(){
  const r = mass(), A = ADIT;
  rect(r, A.raise[0], 0, A.raise[1], A.head + 5, EMPTY); rect(r, A.raise[1] + 1, A.head, 30, A.head + 5, EMPTY);   // the head of the raise; and where they slept, off it
  mark(r, 'thread', 26, A.head); deco(r, 'chalk', 20, A.head, { says: 'WE STOPPED HERE. THE OTHERS WENT ON DOWN.' }); deco(r, 'cot', 13, A.head); deco(r, 'cot', 16, A.head); deco(r, 'kettle', 23, A.head);
  mark(r, 'urn', 29, A.head);
  for (let y = 1; y <= A.head + 4; y += 3) for (const x of [A.raise[0], A.raise[0] + 3, A.raise[1]]) keep(r, x, y); for (let x = 12; x <= 29; x += 3) keep(r, x, A.head + 3);
  return r;
}

export const far = { left: 1, build(X){
  const { EMPTY: E, ROCK } = X.tile, cut = (R, x0, y0, x1, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) X.set(R.tx0 + x, R.ty0 + y, E); };
  const dr = X.roomOf('drop'); if (!dr) return;
  for (let y = 0; y < X.H; y++) for (let x = 0; x < dr.tx0; x++) X.set(x, y, ROCK);   // the new column is rock, top to bottom
  const cx = Math.round((dr.tx0 - X.X0) / 40) - 1, cy = Math.round((dr.ty0 - X.Y0) / 23);
  X.addRoom(cx, cy + 1, named(adit, 'THE ADIT', ''), { wing: true, far: true });
  X.addRoom(cx, cy + 2, named(stopped, 'THE ADIT', 'glide'), { wing: true, far: true });
  cut(dr, 0, ADIT.stage, 7, ADIT.stage + 5);                       // through the shaft's west wall, at the stage
} };
