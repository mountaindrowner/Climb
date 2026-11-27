// The Spires' far ends (docs/edges-sheet.md, section 3; build 117): what lies past each of its wings, set into the
// Spires by level.js (EDGES), one column further west and one further east.
// West, past his cairn in the Pilgrims' Cairns: THE WAY DOWN. Everyone who built a cairn then went down.
//   waydown   three screens, in off his cairn at its head. A cleft down the mountain's shoulder: four ledges, one side
//             and the other, each seventeen rows under the last. He drops unhurt and cannot climb back
//   lookback  under it: where they turned to look. A window in the mountain's west face; a wall of slates
// Its working is the Cairns' own (docs/bare-wings-sheet.md, section 3): the wall at the bottom keeps a wind off the
// whole cleft. Knocked down, the wind rises the height of it, back to his cairn. The lever is at the far end of what
// it opens, and he has to go all the way down to find it.
// East, past the Seated in the Glacier Galleries: THE CREVASSE. The glacier is split behind him.
//   crevasse  three screens, in off the Seated's hall behind the last fire's ice. A crack a dozen tiles wide, sills
//             of ice down it. One fire at its head; what it melts is the plug in its floor, forty rows below
//   blueblack under the plug: the bottom. One who sat down here, a second fire, a thread in its ice
import { room, rect, mark, EMPTY, MELT } from '../rooms.js';

const named = (fn, title, gate, look) => { const f = () => { const r = fn(); r.title = title; r.gate = gate; if (look) r.look = look; return r; }; Object.defineProperty(f, 'name', { value: fn.name }); return f; };
const deco = (r, kind, x, y, more) => mark(r, 'deco', x, y, { kind, ...more });
const keep = (r, x, y) => mark(r, 'keep', x, y);
const mass = (cw = 1, ch = 1) => { const r = room(cw, ch); rect(r, 0, 0, r.w - 1, r.h - 1); return r; };
const keeps = (r, x0, y0, x1, y1) => { for (let y = y0; y <= y1; y += 2) for (let x = x0; x <= x1; x += 3) if (r.tiles[y] && r.tiles[y][x] === EMPTY) keep(r, x, y); };
// the way down, in the cleft's own rows: the ledges [the row he stands at, from, to], top to bottom; the hole in its
// floor and the column the wind rises in; the floor he lands on below (seventeen rows under the cleft's)
export const DOWN = { ledges: [[61, 28, 37], [44, 2, 12], [27, 27, 37], [10, 2, 12]], hole: [16, 23], foot: 10, key: 'down', drop: 17 };
function waydown(){
  const r = mass(1, 3);
  rect(r, 2, 4, 37, 66, EMPTY); rect(r, DOWN.hole[0], 0, DOWN.hole[1], 3, EMPTY);
  for (const [y, x0, x1] of DOWN.ledges) rect(r, x0, y - 1, x1, y - 1);   // (one course of stone each: head-room under the lowest)
  for (const [x, y, says] of [[33, 61, 'ONLY TO REST.'], [6, 44, 'IT IS EASIER, GOING DOWN.'], [32, 27, 'TOMORROW.']]) deco(r, 'reason', x, y, { says });
  for (const [x, y] of [[30, 61], [9, 44], [35, 27], [5, 10], [10, 10]]) deco(r, 'cairn', x, y);
  mark(r, 'cairn', 4, 44); mark(r, 'cairn', 30, 27);
  mark(r, 'torch', 36, 64); mark(r, 'torch', 3, 48); mark(r, 'torch', 36, 31); mark(r, 'torch', 3, 14); mark(r, 'urn', 8, 10); mark(r, 'crystal', 29, 4);
  keeps(r, 2, 4, 37, 66); for (let y = 0; y <= 3; y++) for (const x of [18, 21]) keep(r, x, y);
  return r;
}
function lookback(){
  const r = mass();
  // a floor high in the room (the drop from the cleft is no more than he takes unhurt); the hole over it; the window
  rect(r, 2, DOWN.foot, 37, 20, EMPTY); rect(r, DOWN.hole[0], 21, DOWN.hole[1], 22, EMPTY); rect(r, 0, DOWN.foot + 2, 1, 17, EMPTY);
  // the wall of slates, and the wind it keeps off: up the hole and the whole height of the cleft
  mark(r, 'windbreak', 30, DOWN.foot, { key: DOWN.key }); mark(r, 'updraft', DOWN.hole[0], DOWN.foot, { w: DOWN.hole[1] - DOWN.hole[0] + 1, h: 23 - DOWN.foot + 66, wall: DOWN.key });
  deco(r, 'reason', 5, DOWN.foot, { says: 'FROM HERE I LOOKED BACK.' }); for (const x of [9, 13, 34]) deco(r, 'cairn', x, DOWN.foot);
  mark(r, 'thread', 3, DOWN.foot); mark(r, 'chest', 35, DOWN.foot, { holds: 'shards' }); mark(r, 'urn', 26, DOWN.foot);
  mark(r, 'torch', 12, 14); mark(r, 'torch', 27, 14); mark(r, 'crystal', 36, DOWN.foot);
  keeps(r, 2, DOWN.foot, 37, 20); for (let y = 21; y <= 22; y++) for (const x of [18, 21]) keep(r, x, y); for (let y = DOWN.foot + 2; y <= 17; y += 2) keep(r, 0, y);
  return r;
}

// the crevasse, in its own rows: the landing he comes in on; the crack; its sills [the row he stands at, 'w' or 'e'];
// the plug in its floor; and in the room under it the block he lands on and the sills back up
// (the crack is ten tiles wide: from the passage's end to the first sill is a leap. The plug is the west six tiles of its floor; under it a flue as wide, and two sills in the flue to come back up by)
export const CREV = { land: 48, crack: [14, 23], sills: [[42, 'e'], [36, 'w'], [30, 'e'], [24, 'w'], [18, 'e'], [11, 'w']], plug: [14, 19], block: 11 };
function crevasse(){
  const r = mass(1, 3), [x0, x1] = CREV.crack;
  // in along a passage from the Seated's hall, to the head of the crack; the fire is here
  rect(r, 0, CREV.land, x0 - 1, CREV.land + 5, EMPTY); rect(r, x0, 4, x1, 62, EMPTY);
  for (const [y, side] of CREV.sills) rect(r, side === 'w' ? x0 : x1 - 2, y - 1, side === 'w' ? x0 + 2 : x1, y - 1);
  rect(r, CREV.plug[0], 0, CREV.plug[1], 3, MELT);
  mark(r, 'brazier', 6, CREV.land);
  for (const [k, x, y] of [['pack', 10, CREV.land], ['bedroll', 3, CREV.land]]) deco(r, k, x, y);
  mark(r, 'wraith', 19, 34); mark(r, 'torch', 3, CREV.land + 3); mark(r, 'torch', x0, 56); mark(r, 'torch', x1, 28); mark(r, 'torch', x0, 8); mark(r, 'crystal', 12, CREV.land); mark(r, 'crystal', 19, 4); mark(r, 'crystal', 22, 4);
  keeps(r, 0, CREV.land, x0 - 1, CREV.land + 5); for (let y = 4; y <= 62; y += 2) for (const x of [18, 19]) keep(r, x, y);
  return r;
}
function blueblack(){
  const r = mass(), [x0, x1] = CREV.crack;
  rect(r, 2, 2, 37, 14, EMPTY); rect(r, CREV.plug[0], 15, CREV.plug[1], 22, EMPTY);
  // under the plug a block of the glacier to land on, and from it two sills back up into the crack (the second is set in
  // after the hole is cut: far.build)
  rect(r, CREV.plug[0], 2, CREV.plug[1], CREV.block - 1); rect(r, CREV.plug[1] + 1, 2, CREV.plug[1] + 3, 5); rect(r, CREV.plug[0], 16, CREV.plug[0] + 1, 16);   // (the block is under the flue and no wider: a step up to it from the floor)
  // one who sat down here, in the second fire's ice; and what was put by, in the same ice
  rect(r, 5, 2, 9, 7, MELT); mark(r, 'sitter', 7, 2, { ice: true }); mark(r, 'brazier', 30, 2); rect(r, 33, 2, 37, 7, MELT); mark(r, 'chest', 35, 2, { holds: 'thread' });
  deco(r, 'reason', 28, 2, { says: 'I ONLY SAT DOWN.' }); deco(r, 'pack', 12, 2); deco(r, 'bedroll', 27, 2);
  mark(r, 'chest', 3, 2, { holds: 'shards' }); mark(r, 'torch', 3, 10); mark(r, 'torch', 36, 11); mark(r, 'crystal', 13, 2); mark(r, 'crystal', 26, 2);
  keeps(r, 2, 2, 37, 14); for (let y = 17; y <= 19; y += 2) for (const x of [16, 17]) keep(r, x, y);
  return r;
}

export const far = { left: 4, right: 4, build(X){
  const { EMPTY: E, ROCK } = X.tile, cut = (R, x0, y0, x1, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) X.set(R.tx0 + x, R.ty0 + y, E); };
  // ---- west: the new column is the mountain's rock, for the height of the Cairns and down to the cleft's foot
  const hc = X.roomOf('hiscairn'), fi = X.roomOf('field');
  if (hc && fi){
    for (let y = hc.ty0 - 3 * 23; y < fi.ty1; y++) for (let x = 0; x < hc.tx0; x++) X.set(x, y, ROCK);
    const cx = Math.round((hc.tx0 - X.X0) / 40) - 1, cy = Math.round((hc.ty0 - X.Y0) / 23);
    X.addRoom(cx, cy - 2, named(waydown, 'THE WAY DOWN', 'glide'), { wing: true, far: true }); X.addRoom(cx, cy - 3, named(lookback, 'THE WAY DOWN', 'glide'), { wing: true, far: true });
    cut(hc, 0, 15, 1, 19); const wd = X.roomOf('waydown'); cut(wd, 38, DOWN.ledges[0][0], 39, DOWN.ledges[0][0] + 4);
  }
  // ---- east: the crack behind the Seated, from his hall's floor down
  const se = X.roomOf('seated'); if (!se) return;
  const ex = Math.round((se.tx1 - X.X0) / 40), ey = Math.round((se.ty0 - X.Y0) / 23);
  for (let y = se.ty0 - 3 * 23; y < se.ty1; y++) for (let x = se.tx1; x < se.tx1 + 40; x++) X.set(x, y, ROCK);
  const cr = X.addRoom(ex, ey - 2, named(crevasse, 'THE CREVASSE', 'dash', 'glacier'), { wing: true, far: true }), bb = X.addRoom(ex, ey - 3, named(blueblack, 'THE CREVASSE', 'dash', 'glacier'), { wing: true, far: true });
  cut(se, 78, 2, 79, 7);
  // the hole under the plug, down into the bottom; and the last sill back up, in the hole
  for (let x = CREV.plug[0]; x <= CREV.plug[1]; x++) for (let y = 21; y <= 22; y++) X.set(bb.tx0 + x, bb.ty0 + y, E);
  for (const x of [CREV.plug[1] - 1, CREV.plug[1]]) X.set(bb.tx0 + x, bb.ty0 + 21, ROCK);   // (against the flue's east wall, a row under the plug)
} };
