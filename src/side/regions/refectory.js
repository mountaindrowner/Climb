// The refectory: a room of the Cloister's own, over the head of the stair (docs/world.md). A long table set for
// pilgrims, every day, for a hundred years: the bread on it has turned to stone. Two of the house still serve it. No one
// here fights. Set into the Cloister by level.js (WINGS): a cell the region left empty, reached up through the
// stair's roof from its top landing.
import { room, rect, ledge, mark, EMPTY } from '../rooms.js';

const deco = (r, kind, x, y) => mark(r, 'deco', x, y, { kind });
function refectory(){
  const r = room(); rect(r, 0, 0, r.w - 1, r.h - 1); rect(r, 2, 2, 37, 20, EMPTY);
  rect(r, 28, 0, 34, 1, EMPTY); ledge(r, 28, 34, 1);                // boards over the way up from the stair
  ledge(r, 5, 24, 3);                                              // the table: he can walk along it
  for (const x of [6, 14, 22]) deco(r, 'tableleg', x, 2); for (const x of [8, 12, 16, 20]) deco(r, 'place', x, 4); deco(r, 'tablehead', 3, 2);
  mark(r, 'server', 10, 2); mark(r, 'server', 20, 2);
  mark(r, 'chest', 36, 2, { holds: 'shards' });   // (a region's own rooms hold two red strands, no more: the tests keep that count)
  for (const [k, x, y] of [['lamp', 10, 18], ['lamp', 22, 18]]) deco(r, k, x, y);
  mark(r, 'torch', 4, 10); mark(r, 'torch', 36, 10); mark(r, 'urn', 26, 2); mark(r, 'crystal', 3, 2);
  for (const x of [29, 31, 33]) for (const y of [3, 6]) mark(r, 'keep', x, y);
  return r;
}
export const wing = { build(X){
  const st = X.roomOf('stairwell'); if (!st) return; const cx = Math.round((st.tx0 - X.X0) / 40), cy = Math.round((st.ty1 - X.Y0) / 23);
  X.addRoom(cx, cy, refectory);
  // up from the stair's top landing: rungs in its upper corner, and through its roof
  for (let y = st.ty1 - 4; y < st.ty1; y++) for (let x = st.tx0 + 28; x <= st.tx0 + 34; x++) X.set(x, y, EMPTY);
  for (const y of [28, 32, 36, 40, 44]) for (let x = st.tx0 + 28; x <= st.tx0 + 34; x++) if (X.at(x, st.ty0 + y) === EMPTY) X.set(x, st.ty0 + y, X.tile.LEDGE);
} };
export const QUIET = ['refectory'];
// ---- what stands in it, painted
export const decoDef = (px, PAL) => ({
  // a trestle under the table, and the cloth's edge
  tableleg(g, x, y){ px(g, PAL.ink, x - 1, y - 8, 3, 8); px(g, PAL.wood1, x, y - 8, 1, 8); px(g, PAL.ink, x - 4, y - 1, 9, 1); px(g, PAL.ink, x - 30, y - 13, 61, 5); px(g, PAL.bone, x - 30, y - 13, 61, 3); for (let a = -28; a <= 28; a += 4) px(g, PAL.pale, x + a, y - 10, 2, 2); },
  // the table's head: a tall chair, empty
  tablehead(g, x, y){ px(g, PAL.ink, x - 3, y - 22, 7, 22); px(g, PAL.wood1, x - 2, y - 21, 5, 20); px(g, PAL.wood2, x - 2, y - 21, 5, 1); px(g, PAL.red0, x - 1, y - 17, 3, 6); px(g, PAL.ink, x - 3, y - 9, 9, 2); px(g, PAL.wood1, x - 2, y - 9, 8, 1); },
  // a place set: a bowl, a cup, a loaf gone to stone
  place(g, x, y){ px(g, PAL.ink, x - 6, y - 3, 5, 3); px(g, PAL.mid, x - 5, y - 2, 3, 2); px(g, PAL.light, x - 5, y - 2, 3, 1); px(g, PAL.ink, x, y - 4, 3, 4); px(g, PAL.tan, x + 1, y - 3, 1, 3); px(g, PAL.ink, x + 4, y - 3, 7, 3); px(g, PAL.light, x + 5, y - 2, 5, 2); px(g, PAL.pale, x + 5, y - 2, 4, 1); px(g, PAL.mid, x + 7, y - 1, 2, 1); },
});
