// The Gardens' far ends (docs/edges-sheet.md, section 5; build 118): what lies past each of its wings, set into the
// Gardens by level.js (EDGES), one column further west and one further east.
// West, past the lock of the Aqueducts: THE RISING MAIN. The shaft the water comes up by, from the pool at the bottom
// of the world.
//   main   three screens, in off the lock's floor on to its top landing. Three landings and a bed, a fall of water
//          between each and the next, a stair of stone in each fall. Running, a fall carries him down and is not
//          climbed; shut, its stair is. Each fall's wheel is at its foot, as in the sluices: so the way back is his to
//          open. A fourth fall, at the bed, is over the stair to a thread; its wheel is on the top landing, three falls
//          above it, and a machine there turns it back
// East, past his own house in the Keepers' Houses: THE LAST HOUSE. One more, the same as the others, and no one was
// ever given it.
//   lasthouse  off his house's east wall. Its door is a kept door: shut while anything in the row is out of its place
//   attic      over it, up a stair of three steps: a thread, a chest, the plate that was never cut
import { room, rect, mark, EMPTY, KEPT } from '../rooms.js';

const named = (fn, title, gate, look) => { const f = () => { const r = fn(); r.title = title; r.gate = gate; if (look) r.look = look; return r; }; Object.defineProperty(f, 'name', { value: fn.name }); return f; };
const deco = (r, kind, x, y, more) => mark(r, 'deco', x, y, { kind, ...more });
const keep = (r, x, y) => mark(r, 'keep', x, y);
const mass = (cw = 1, ch = 1) => { const r = room(cw, ch); rect(r, 0, 0, r.w - 1, r.h - 1); return r; };
const keeps = (r, x0, y0, x1, y1) => { for (let y = y0; y <= y1; y += 2) for (let x = x0; x <= x1; x += 3) if (r.tiles[y] && r.tiles[y][x] === EMPTY) keep(r, x, y); };
// the main, in its own rows. Each fall: [its key, the column it begins at (ten wide), the row at its foot, where its
// wheel is; and for the last, which is under a landing, how tall it is and how tall the step in it]. A fall is twelve
// rows; the stair in it is six. The landings: [the row he stands at, from, to]
export const MAIN = { top: 48, bed: 12, falls: [['m3', 2, 36, [16, 36]], ['m2', 28, 24, [20, 24]], ['m1', 2, 12, [16, 12]], ['m0', 28, 12, [30, 48], 10, 3]], lands: [[48, 12, 37], [36, 2, 27], [24, 12, 37]] };
function main(){
  const r = mass(1, 3);
  rect(r, 2, MAIN.bed, 37, 62, EMPTY); rect(r, 38, MAIN.top, 39, MAIN.top + 5, EMPTY);
  for (const [y, x0, x1] of MAIN.lands) rect(r, x0, y - 2, x1, y - 1);
  for (const [key, x, y, [wx, wy], h = 12, step = 6] of MAIN.falls){ rect(r, x + 2, y, x + 7, y + step - 1); mark(r, 'flow', x, y, { w: 10, h, dir: 'd', key }); mark(r, 'wheel', wx, wy, { key, open: true }); }
  mark(r, 'sluicer', 26, MAIN.top, { lo: -8, hi: 8 }); mark(r, 'sluicer', 20, 36, { lo: -6, hi: 5 });
  mark(r, 'thread', 33, MAIN.bed + 3); mark(r, 'chest', 22, MAIN.bed, { holds: 'shards' }); deco(r, 'mainmark', 20, MAIN.bed, { says: 'FROM THE WELL AT THE BOTTOM OF THE WORLD.' });
  for (const [x, y] of [[7, 48], [33, 36], [7, 24]]) deco(r, 'gate', x, y);
  mark(r, 'torch', 36, 52); mark(r, 'torch', 14, 40); mark(r, 'torch', 25, 28); mark(r, 'torch', 20, 16); mark(r, 'urn', 24, MAIN.bed); mark(r, 'urn', 13, 24); mark(r, 'crystal', 14, MAIN.bed);
  keeps(r, 12, MAIN.top, 37, 62);
  return r;
}
// the stair up its east wall: [the row he stands at, where the step begins]; and the hole in the roof over the last step
export const HOUSE = { steps: [[8, 30], [14, 33], [20, 36]], hole: [32, 37] };
function lasthouse(){
  const r = mass();
  rect(r, 2, 2, 37, 20, EMPTY); rect(r, 0, 2, 1, 7, KEPT);          // its door: shut while anything in the houses is out of its place
  // up the east wall to the attic: a stair of three steps of stone, and the hole in the roof over the last
  for (const [y, x] of HOUSE.steps) rect(r, x, y - 6, 37, y - 1);
  rect(r, HOUSE.hole[0], 21, HOUSE.hole[1], 22, EMPTY);
  for (const [k, x, y] of [['table2', 12, 2], ['hearth', 20, 2], ['bed', 7, 2], ['shutters', 4, 2], ['shutters', 16, 2]]) deco(r, k, x, y);
  mark(r, 'torch', 24, 9); mark(r, 'torch', 3, 9); mark(r, 'moth', 14, 12);
  keeps(r, 2, 2, 37, 20); for (const x of [33, 36]) for (const y of [21, 22]) keep(r, x, y);
  return r;
}
function attic(){
  const r = mass();
  rect(r, 2, 2, 37, 12, EMPTY); rect(r, HOUSE.hole[0], 0, HOUSE.hole[1], 1, EMPTY);
  deco(r, 'doorplate', 16, 2, { says: 'KEPT FOR WHOEVER COMES.' }); for (const [k, x, y] of [['trunk', 22, 2], ['trunk', 26, 2], ['bed', 9, 2]]) deco(r, k, x, y);
  mark(r, 'thread', 4, 2); mark(r, 'chest', 12, 2, { holds: 'shards' }); mark(r, 'torch', 20, 7); mark(r, 'torch', 36, 7); mark(r, 'moth', 18, 8);
  keeps(r, 2, 2, 37, 12);
  return r;
}

export const far = { left: 4, right: 3, build(X){
  const { EMPTY: E, ROCK } = X.tile, cut = (R, x0, y0, x1, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) X.set(R.tx0 + x, R.ty0 + y, E); };
  // ---- west: the main, beside the sluices and the lock, in the mountain's rock
  const lo = X.roomOf('lock');
  if (lo){
    for (let y = lo.ty0 - 2 * 23; y < lo.ty1; y++) for (let x = 0; x < lo.tx0; x++) X.set(x, y, ROCK);
    const cx = Math.round((lo.tx0 - X.X0) / 40) - 1, cy = Math.round((lo.ty0 - X.Y0) / 23);
    X.addRoom(cx, cy - 2, named(main, 'THE RISING MAIN', '', 'aqueduct'), { wing: true, far: true });
    cut(lo, 0, 2, 1, 7);
  }
  // ---- east: the last house, beside his own; its attic over it
  const hh = X.roomOf('hishouse'); if (!hh) return;
  const ex = Math.round((hh.tx1 - X.X0) / 40), ey = Math.round((hh.ty0 - X.Y0) / 23);
  for (let y = hh.ty0; y < hh.ty0 + 2 * 23 && y < X.H; y++) for (let x = hh.tx1; x < X.W; x++) X.set(x, y, ROCK);
  X.addRoom(ex, ey, named(lasthouse, 'THE LAST HOUSE', '', 'houses'), { wing: true, far: true }); X.addRoom(ex, ey + 1, named(attic, 'THE LAST HOUSE', '', 'houses'), { wing: true, far: true });   // (no gate named, as the houses have none: the pane at the arbor is before them all)
  cut(hh, 38, 2, 39, 7);
} };

// ---- what stands in it, painted (a 'deco' mark)
export const decoDef = (px, PAL) => ({
  // the mark cut over the channel where the water comes in (main.js says it when he stands by it)
  mainmark(g, x, y){ px(g, PAL.ink, x - 14, y - 24, 28, 10); px(g, PAL.mid, x - 13, y - 23, 26, 8); for (let k = 0; k < 2; k++) for (let i = 0; i < 22; i += 3) px(g, PAL.pale, x - 11 + i, y - 21 + k * 3, 2, 1); px(g, '#0099db', x - 3, y - 13, 6, 3); },
  // the plate by a house's door, where a keeper's name was cut (main.js says it): this one was never cut
  doorplate(g, x, y){ px(g, PAL.ink, x - 9, y - 22, 18, 10); px(g, '#b86f50', x - 8, y - 21, 16, 8); px(g, '#e4a672', x - 8, y - 21, 16, 1); px(g, PAL.ink, x - 7, y - 20, 1, 1); px(g, PAL.ink, x + 6, y - 20, 1, 1); px(g, PAL.ink, x - 7, y - 15, 1, 1); px(g, PAL.ink, x + 6, y - 15, 1, 1); },
});
