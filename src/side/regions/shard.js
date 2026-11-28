// THE SHARD (docs/phase18-sheet.md 4; docs/world.md "The Shard"; build 124): "It broke from the top the night he fell and
// has not come down. Unexplained, and it stays so... a piece of the mountain hanging in the air with a little of the old
// light still in it. No one is here. Left alone on purpose." Set into the Firmament by level.js (EDGES), four columns
// further west. For one who has the grip.
//   underside  three screens, one over another, west of the summit and under its lip, in off the room below the summit.
//              A shaft eight wide. Rough faces up it, one wall and then the other, each ending in an alcove: from an
//              alcove he throws himself across the shaft and takes hold of the next
//              At its head the way out west is stopped with a pane: the air dash goes through it
//   gap        nothing in it: open sky, two screens wide and three tall, the mountain's shoulder far below. From a shelf
//              high on the flank, the longest glide in the game, to the Shard's keel, which hangs down into the gap: he
//              comes to its rough face somewhere under its head, takes hold, and climbs. A thread on its head
//   shard      the piece of the mountain, hanging: sky over it and under it. Its way in is stopped with a crust of
//              cracked stone (the hammer's). One room, lit warm. The old light in a cradle of stone. Nothing to fight,
//              no one, nothing written
import { room, open, rect, mark, EMPTY, ROCK, ROUGH, CRACKED, VELLUM } from '../rooms.js';

const named = (fn, title, gate, look) => { const f = () => { const r = fn(); r.title = title; r.gate = gate; if (look) r.look = look; return r; }; Object.defineProperty(f, 'name', { value: fn.name }); return f; };
const deco = (r, kind, x, y, more) => mark(r, 'deco', x, y, { kind, ...more });
const keep = (r, x, y) => mark(r, 'keep', x, y);
const mass = (cw = 1, ch = 1) => { const r = room(cw, ch); rect(r, 0, 0, r.w - 1, r.h - 1); return r; };
// the underside, in its own rows. shaft: [from, to]. foot: the row he stands at in the way in. pitches: each face, [the
// wall it is on, its first row, the row he stands at in the alcove at its head]. pane: the columns of the pane across
// the way out at its head
export const UNDER = { shaft: [16, 23], foot: 2, pitches: [['e', 8, 22], ['w', 22, 34], ['e', 34, 42], ['w', 42, 50]], head: 50, pane: [4, 5] };
function underside(){
  const r = mass(1, 3), U = UNDER, [s0, s1] = U.shaft;
  rect(r, 0, U.foot, 39, U.foot + 5, EMPTY);                        // the way in, from the room under the summit; and on west, to the gap's floor
  rect(r, s0, U.foot, s1, U.head + 5, EMPTY);                       // the shaft
  for (const [side, y0, top] of U.pitches){
    const x = side === 'e' ? s1 + 1 : s0 - 1; rect(r, x, y0, x, top - 1, ROUGH);   // the face
    if (side === 'e') rect(r, s1 + 1, top, s1 + 6, top + 5, EMPTY); else rect(r, top === U.head ? 0 : s0 - 6, top, s0 - 1, top + 5, EMPTY);   // the alcove at its head (the last runs on west, out to the gap)
  }
  rect(r, U.pane[0], U.head, U.pane[1], U.head + 5, VELLUM);          // a pane across the way out: the air dash goes through it
  mark(r, 'torch', 30, 5); mark(r, 'torch', 8, 5); mark(r, 'torch', 27, 25); mark(r, 'torch', 12, 37); mark(r, 'torch', 27, 45); mark(r, 'torch', 6, 53); mark(r, 'crystal', 34, U.foot); mark(r, 'urn', 5, U.foot);
  for (let y = 9; y <= U.head + 4; y += 3) for (const x of [s0 + 1, s0 + 4, s1 - 1]) if (r.tiles[y][x] === EMPTY) keep(r, x, y);
  for (const [side, , top] of U.pitches) for (const dx of [2, 4]) keep(r, side === 'e' ? s1 + dx : s0 - dx, top + 2);
  return r;
}
// the gap, in its own rows (two screens wide, three tall; open: no walls of its own, the sky behind it). shelf: where he
// lets go, [from, to, the row he stands at]. keel: the Shard's east end, which hangs down into the gap, [from, to, its
// first row, the row he stands at on its head]; rough: the rows of its east face that are rough, [from, to]: from over
// anything he comes up to off the shoulder below, to its head. A plain glide (a jump off the shelf's lip, the second
// jump at its top, the wind held) comes to the face five rows under the head (measured, tests/side-shard); a worse one
// lower, with rough rock to spare; only the best there is comes in at the head itself
export const GAP = { shelf: [70, 79, 50], keel: [0, 5, 10, 40], rough: [24, 39], floor: 2 };
function gap(){
  const r = open(2, 3), G = GAP, [h0, h1, hy] = G.shelf, [p0, p1, py0, py] = G.keel;
  rect(r, 0, 0, 79, G.floor - 1);                                   // the mountain's shoulder, far below: whoever falls walks back in at the underside's foot
  rect(r, h0, hy - 2, h1, hy - 1);                                  // the shelf, out of the mountain's flank
  rect(r, p0, py0, p1, py - 1); rect(r, p1, G.rough[0], p1, G.rough[1], ROUGH);   // the keel; its east face rough, from well over the shoulder
  mark(r, 'thread', 2, py);
  mark(r, 'torch', 76, hy + 4);
  for (let y = 5; y <= 65; y += 4) for (let x = 8; x <= 68; x += 4) keep(r, x, y);   // nothing in it: air, from the flank to the Shard
  for (let y = py0 - 4; y <= 66; y += 2) for (const x of [6, 7]) keep(r, x, y); for (let x = h0; x <= h1; x += 2) for (const y of [hy, hy + 3, hy - 3]) keep(r, x, y);
  return r;
}
// under the Shard, and over it (one screen each, open): the mountain's shoulder runs on under it; the Shard's keel
// hangs in steps over that, deepest at its east end; on its back, a crag. KEEL: [from, to, its lowest row] in the
// screen under the Shard's own
export const KEEL = [[28, 39, 10], [14, 27, 15], [4, 13, 19]], CRAG = [[0, 39, 0], [8, 30, 3], [14, 22, 6]];
function undershard(){ const r = open(); rect(r, 0, 0, 39, GAP.floor - 1); for (const [x0, x1, y0] of KEEL) rect(r, x0, y0, x1, 22); rect(r, 0, 21, 3, 22);
  for (let x = 2; x <= 38; x += 3) for (const y of [3, 6, 8]) keep(r, x, y); return r; }
function overshard(){ const r = open(); for (const [x0, x1, y1] of CRAG) rect(r, x0, 0, x1, y1);
  for (let x = 2; x <= 38; x += 3) for (const y of [9, 13, 17]) keep(r, x, y); return r; }
// the Shard's own room, in its own rows (the keel's head, 40 in the gap's rows, is its row 17)
export const SHARD = { door: 17, floor: 4, step: 11, light: 12 };
function shard(){
  const r = mass(), S = SHARD;
  rect(r, 28, S.door, 37, S.door + 5, EMPTY); rect(r, 38, S.door, 39, S.door + 5, CRACKED);   // in, on a landing; the way in stopped with a crust of cracked stone: the hammer's
  rect(r, 4, S.floor, 27, S.door + 5, EMPTY); rect(r, 22, S.floor, 27, S.step - 1);   // the room; a step down from the landing
  deco(r, 'oldlight', S.light, S.floor);
  for (let x = 5; x <= 26; x += 3) for (const y of [S.floor + 3, S.floor + 7, S.floor + 11, S.floor + 15]) if (r.tiles[y][x] === EMPTY) keep(r, x, y);
  for (let x = 29; x <= 36; x += 2) for (const y of [S.door + 1, S.door + 3]) keep(r, x, y);
  return r;
}

// (a room's gate is what he must have to set foot in it at all: tests/side-level. Anyone walks the underside's foot and
// the shoulder under the Shard, and looks up at it; the Shard itself, and its back, are the grip's)
export const far = { left: 4, build(X){
  const { EMPTY: E } = X.tile, cut = (R, x0, y0, x1, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) X.set(R.tx0 + x, R.ty0 + y, E); };
  const as = X.roomOf('ascension'); if (!as) return;
  const cx = Math.round((as.tx0 - X.X0) / 40), cy = Math.round((as.ty0 - X.Y0) / 23);
  X.addRoom(cx - 1, cy, named(underside, 'THE UNDERSIDE', ''), { wing: true, far: true });
  X.addRoom(cx - 3, cy, named(gap, 'THE GAP', ''), { wing: true, far: true, open: true });
  X.addRoom(cx - 4, cy, named(undershard, 'THE GAP', ''), { wing: true, far: true, open: true });
  X.addRoom(cx - 4, cy + 1, named(shard, 'THE SHARD', 'grip', 'shardlight'), { wing: true, far: true, bare: true });
  X.addRoom(cx - 4, cy + 2, named(overshard, 'THE GAP', 'grip'), { wing: true, far: true, open: true });
  cut(as, 0, UNDER.foot, 1, UNDER.foot + 5);                        // out of the room under the summit, at its floor
} };

// ---- its look: the Firmament's, lit warm (the only warm light above the Gardens), and bare: no charts, no shelves, no
// instruments (and, the room being marked `bare`, nothing on the wall behind it: paint.js). Whatever was in it went
// when it broke
export const looksOf = base => ({ shardlight: { ...base, floorWall: ['rubble'], floorOpen: ['rubble'], ceilLow: [['chain', 1]], ceil: [['chain', 1]], amb: [1.0, 0.86, 0.66], ambIn: [0.74, 0.56, 0.4], mist: { col: 'fire2', col2: 'rust', a: 0.07, drift: 0.03 } } });
// ---- what stands in it, painted (a 'deco' mark): x the middle, y the floor
const FLAME = [8, 12, 14, 16, 16, 16, 15, 14, 14, 13, 12, 12, 11, 10, 9, 8, 8, 7, 6, 5, 5, 4, 3, 3, 2, 1];
export const decoDef = (px, PAL) => ({
  // the old light: half of the beacon's bowl, broken, on the drum it stood on; and in it a flame of pale gold that the
  // dark at the summit has not got. It glows (render.js: a sure light, not one in two)
  oldlight(g, x, y, r, glow){
    px(g, PAL.ink, x - 10, y - 6, 20, 6); px(g, PAL.dark, x - 9, y - 5, 18, 5); px(g, PAL.mid, x - 9, y - 5, 18, 1); px(g, PAL.fire2, x - 9, y - 3, 18, 1);   // the drum, a line of brass let into it
    for (let k = 0; k < 11; k++){ const half = Math.round(22 * Math.sqrt(1 - Math.pow((10 - k) / 11, 2))), y0 = y - 7 - k, x1 = k > 5 ? 12 + (k - 5) * 2 : half;   // the bowl: its east rim is gone
      px(g, PAL.ink, x - half - 1, y0, half + x1 + 2, 1); px(g, k < 3 ? PAL.dark : PAL.mid, x - half, y0, half + x1, 1); if (k === 10) px(g, PAL.pale, x - half, y0, half + x1, 1); }
    px(g, PAL.ink, x - 6, y - 15, 1, 5); px(g, PAL.ink, x - 5, y - 11, 1, 3); px(g, PAL.ink, x + 9, y - 13, 1, 4);   // cracks
    for (let k = 0; k < FLAME.length; k++){ const w = FLAME[k], yy = y - 17 - k, lean = k > 14 ? 1 : 0;   // the flame, three golds
      px(g, '#feae34', x - (w >> 1) + lean, yy, w, 1); if (k >= 1 && k < 21 && w > 5) px(g, '#fee761', x - ((w - 4) >> 1) + lean, yy, w - 4, 1); if (k >= 2 && k < 14 && w > 9) px(g, '#ffffff', x - ((w - 9) >> 1) + lean, yy, w - 9, 1); }
    for (const [dx, dy] of [[-9, 30], [7, 36], [-3, 46], [11, 49], [-12, 41], [2, 55]]) px(g, dy > 44 ? '#feae34' : '#fee761', x + dx, y - dy, 1, 1);   // what rises off it
    if (glow){ glow(x, y - 26, 'lamp', true); glow(x - 4, y - 22, 'lamp', true); glow(x + 4, y - 30, 'lamp', true); } },
});
