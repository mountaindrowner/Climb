// The Roots' far ends (docs/edges-sheet.md, section 1; build 116): what lies past each of its wings, set into the
// Roots by level.js (EDGES) after everything else, one column further west and one further east, and down into the
// rows of rock every level stands on since build 115.
// West, past the weir of the Drowned Galleries: THE DRAWING-PLACE. The keepers did one thing here: they drew the water,
// and those who came down for it carried it up.
//   sump       under the well-shaft, in off the floor of the cells' pit. The windlass of the bucket-chain; and in its
//              floor the mouth of the Well itself
//   drawshaft  the well-shaft, three screens, sheer. The chain of buckets hangs in it, still until its windlass is
//              turned; then they go up, and he rides them. A gallery half-way, in off the weir's west bank
//   loft       over the shaft and over the weir: where the buckets were tipped. A chest, the keepers' words;
//              and a hole in the floor at its far end, down into the weir (one way)
//   sounding   under the sump, three screens of water straight down into the new rock: the Well, as far as the keepers'
//              line went. For one who has the Seated's Wind and can go under
// Its working is a thing that moves only once its windlass is turned (level.js keyClock; a mover with a key).
// East, past the niches of the Ossuary: THE UNSORTED. The house had more dead than room, and this is where they were put
// when the sorting fell behind: a pit, tipped full.
//   unsorted   the pit, three screens. In off the head of the aisle's stair, on to a step of the wall a little over its
//              floor; the floor a funnel of the heaped, and the pan of a scale at the bottom of the funnel
//   firstlaid  under the pit, through a slab in its floor: the first of the house's dead, laid before there was a count
// Its working is the Ossuary's scale with its stack in three: a piece on each of three ledges, at three heights, and
// (one on the step he comes in by; one across the pit, up off the floor; one at the head of the tiers, forty-four rows
// over that). The slab lies
// across a hole, so it lifts only for all three (level.js liftOf). Two Tallymen keep the pan. Under the slab is a ring:
// struck from below it is up for good, so that the pan emptied behind him cannot shut him in.
import { room, rect, mark, EMPTY } from '../rooms.js';
import { DROWNED } from './drowned.js';

const TITLE = 'THE DRAWING-PLACE';
const named = (fn, gate = '') => { const f = () => { const r = fn(); r.title = r.title || TITLE; r.gate = gate; return r; }; Object.defineProperty(f, 'name', { value: fn.name }); return f; };
const deco = (r, kind, x, y, more) => mark(r, 'deco', x, y, { kind, ...more });
const keep = (r, x, y) => mark(r, 'keep', x, y);
const mass = (cw = 1, ch = 1) => { const r = room(cw, ch); rect(r, 0, 0, r.w - 1, r.h - 1); return r; };
const keeps = (r, x0, y0, x1, y1) => { for (let y = y0; y <= y1; y += 2) for (let x = x0; x <= x1; x += 3) if (r.tiles[y] && r.tiles[y][x] === EMPTY) keep(r, x, y); };
const water = (r, x, y, w, h, more) => mark(r, 'water', x, y, { w, h, ...more });
// the chain: its buckets go up the middle of the shaft, from under the water in the Well's mouth to a little over the
// loft's floor, and come in at the foot again. Counted in the shaft's own rows (the sump is 23 under them, the loft 69 over)
export const CHAIN = { x: 19, foot: -17, head: 73, buckets: 4, period: 16, w: 4, key: 'draw' };
const SHAFT = [16, 23];   // the shaft's two walls stand outside these columns, in every room it goes through

function sump(){
  const r = mass(), L = DROWNED.low;
  // in from the cells' pit at its floor; the shaft over the middle; the Well's mouth under it, brim-full at the floor
  rect(r, 4, L, 39, 14, EMPTY); rect(r, SHAFT[0], 15, SHAFT[1], 22, EMPTY); rect(r, SHAFT[0], 0, SHAFT[1], L - 1, EMPTY);
  water(r, 0, L, 40, DROWNED.high - L, { key: 'breath', held: 'cells' }); water(r, SHAFT[0], 0, 8, L, { deep: true });
  mark(r, 'windlass', 7, L, { key: CHAIN.key }); deco(r, 'chain', 10, L + 1);
  mark(r, 'urn', 33, L); mark(r, 'urn', 35, L); mark(r, 'crystal', 12, L); mark(r, 'crystal', 28, L); mark(r, 'crystal', 5, L);
  deco(r, 'keepline', 30, L, { says: 'IT HAS NO FLOOR THAT WE HAVE FOUND.' });
  keeps(r, 4, L, 39, 14); for (let y = 0; y <= 22; y++) for (const x of [18, 21]) keep(r, x, y);
  return r;
}
function drawshaft(){
  const r = mass(1, 3);
  rect(r, SHAFT[0], 0, SHAFT[1], 68, EMPTY);
  // the gallery, in off the weir's west bank (the weir stands a screen higher: its bank is this room's row 42)
  rect(r, 24, 42, 39, 47, EMPTY);
  for (let k = 0; k < CHAIN.buckets; k++) mark(r, 'mover', CHAIN.x, (CHAIN.foot + CHAIN.head) / 2, { kind: 'chain', ay: (CHAIN.head - CHAIN.foot) / 2, period: CHAIN.period, ph: k / CHAIN.buckets, key: CHAIN.key, look: 'bucket', w: CHAIN.w });
  mark(r, 'torch', 30, 45); mark(r, 'torch', 36, 45); mark(r, 'crystal', 26, 42); deco(r, 'tidemark', 17, 1, { side: -1 });
  keeps(r, 24, 42, 39, 47); for (let y = 0; y <= 68; y++) for (const x of [18, 21]) keep(r, x, y);
  return r;
}
function loft(){
  const r = mass(2, 1);
  // the tipping floor; the head of the shaft in it; a landing of two steps where the carriers stood; at the far end, over
  // the weir, the hole the spilt water ran back by
  rect(r, 2, 2, 77, 13, EMPTY); rect(r, SHAFT[0], 0, SHAFT[1], 1, EMPTY);
  rect(r, 40, 2, 62, 3); rect(r, 46, 4, 56, 5);
  rect(r, 70, 0, 75, 1, EMPTY);
  deco(r, 'wellwheel', 20, 12); deco(r, 'trough', 31, 2); deco(r, 'yokes', 51, 6); deco(r, 'yokes', 66, 2);
  deco(r, 'keepline', 36, 2, { says: 'THEY CAME DOWN FOR IT EVERY DAY. WE DREW IT FOR THEM.' });
  mark(r, 'chest', 6, 2, { holds: 'shards' }); mark(r, 'urn', 10, 2); mark(r, 'urn', 13, 2); mark(r, 'urn', 60, 4); mark(r, 'urn', 64, 2);
  mark(r, 'torch', 8, 7); mark(r, 'torch', 28, 7); mark(r, 'torch', 51, 10); mark(r, 'torch', 73, 7); mark(r, 'crystal', 3, 2); mark(r, 'crystal', 77, 2);
  keeps(r, 2, 2, 77, 13); keep(r, 18, 0); keep(r, 21, 0); keep(r, 18, 1); keep(r, 21, 1);
  return r;
}
function sounding(){
  const r = mass(1, 3);
  // straight down; two pockets off it where the line snagged; at the bottom, the chamber the lead lies in
  rect(r, SHAFT[0], 13, SHAFT[1], 68, EMPTY); rect(r, 24, 44, 31, 48, EMPTY); rect(r, 8, 26, 15, 30, EMPTY); rect(r, 6, 4, 33, 12, EMPTY);
  water(r, SHAFT[0], 13, 8, 56, { deep: true }); water(r, 24, 44, 8, 5, { deep: true }); water(r, 8, 26, 8, 5, { deep: true }); water(r, 6, 4, 28, 9, { deep: true });
  for (let y = 6; y <= 66; y += 10) deco(r, 'chain', 20, y); deco(r, 'plumb', 20, 4);
  deco(r, 'keepline', 13, 4, { says: 'THE LINE RAN OUT HERE. THE WATER DID NOT.' });
  mark(r, 'thread', 8, 4); mark(r, 'chest', 30, 4, { holds: 'shards' }); mark(r, 'urn', 28, 44); mark(r, 'urn', 10, 26);
  mark(r, 'dlamp', 20, 56); mark(r, 'dlamp', 29, 46); mark(r, 'dlamp', 20, 34); mark(r, 'dlamp', 11, 28); mark(r, 'dlamp', 20, 16); mark(r, 'dlamp', 9, 9); mark(r, 'dlamp', 31, 9);
  mark(r, 'crystal', 26, 4); mark(r, 'crystal', 13, 26); mark(r, 'crystal', 26, 44);
  keeps(r, 6, 4, 33, 12); keeps(r, 24, 44, 31, 48); keeps(r, 8, 26, 15, 30); for (let y = 13; y <= 68; y++) for (const x of [18, 21]) keep(r, x, y);
  return r;
}

// the pit, in its own rows (its foot is level with the aisle's: the head of the aisle's stair is its row 14).
// TIERS: the shelves the sextons built up the east wall as the pit filled, each [the row he stands at, where it begins]:
// each shorter than the one under it, so that he rises beside its lip from the one below (eleven rows: he hauls himself up)
export const PIT = { way: 16, key: 'pit', hatch: [6, 11], pan: 19, tiers: [[16, 24], [27, 26], [38, 28], [49, 30], [60, 32]] };
function unsorted(){
  const r = mass(1, 3); r.title = 'THE OSSUARY'; r.look = 'cloister';
  rect(r, 2, 4, 37, 66, EMPTY);
  // the heaped: against each wall; and a pile in the middle of the floor, a dip in it where the pan is. From the pile's
  // two heads he comes up on to the step and on to the lowest tier (seven rows each: no more than a leap)
  for (let x = 2; x <= 5; x++) rect(r, x, 4, x, 9 - x); for (let x = 31; x <= 35; x++) rect(r, x, 4, x, x - 27);
  rect(r, 14, 4, 15, 8); rect(r, 16, 4, 17, 6); rect(r, 18, 4, 20, 4); rect(r, 21, 4, 21, 6); rect(r, 22, 4, 23, 8);
  // the way in, through the west wall from the head of the aisle's stair, on to a step of the wall's own stone twelve
  // rows over the floor: so the floor is never a place he cannot leave. On the step, a stack
  rect(r, 2, PIT.way - 2, 13, PIT.way - 1);
  // the tiers up the east wall; a stack on the lowest and one on the highest
  for (const [y, x] of PIT.tiers) rect(r, x, y - 2, 37, y - 1);
  const top = PIT.tiers[PIT.tiers.length - 1];
  mark(r, 'bonestack', 35, PIT.tiers[0][0], { key: PIT.key, n: 1, i: 0 }); mark(r, 'bonestack', 12, PIT.way, { key: PIT.key, n: 1, i: 1 }); mark(r, 'bonestack', top[1] + 1, top[0], { key: PIT.key, n: 1, i: 2 });
  mark(r, 'pan', PIT.pan, 5, { key: PIT.key }); deco(r, 'panchain', PIT.pan + 1, 6);
  mark(r, 'acolyte', 12, 4); mark(r, 'acolyte', 27, 4); mark(r, 'wisp', 16, 30); mark(r, 'wisp', 20, 50);
  mark(r, 'thread', 36, top[0]); mark(r, 'urn', 32, 16); mark(r, 'urn', 5, PIT.way); mark(r, 'urn', 25, 4); mark(r, 'urn', 35, 27); mark(r, 'urn', 34, 49);
  mark(r, 'torch', 20, 12); mark(r, 'torch', 36, 32); mark(r, 'torch', 3, 30); mark(r, 'torch', 36, 54); mark(r, 'torch', 3, 48); mark(r, 'crystal', 9, PIT.way); mark(r, 'crystal', 37, 16); mark(r, 'crystal', 37, 38);
  keeps(r, 2, 4, 37, 64);
  return r;
}
function firstlaid(){
  const r = mass(); r.title = 'THE OSSUARY'; r.look = 'cloister';
  // one tomb, in a room of its own. The way in is the hole in its roof, at the west wall: a flue under it, and a sill
  // on one side and the other to come back up by (each of the wall's stone)
  rect(r, 4, 2, 35, 12, EMPTY); rect(r, 4, 13, 11, 22, EMPTY);
  rect(r, 4, 7, 5, 7); rect(r, 10, 13, 11, 13); rect(r, 4, 17, 5, 17);   // (the third low enough that he can stand on it under the pit's floor; a fourth is set in the hole itself, under the slab's east end: level.js far.build)
  // a ring on the slab's underside, as on the hatch of the keepers' store: struck from below, the slab is up for good.
  // (A Tallyman may empty the pan while he is down here: he is not to be shut in)
  mark(r, 'ring', 7, 21, { key: PIT.key });
  deco(r, 'firsttomb', 26, 2); deco(r, 'keepline', 18, 2, { says: 'THE FIRST OF US. WE DID NOT COUNT THEN.' });
  mark(r, 'chest', 31, 2, { holds: 'shards' }); mark(r, 'urn', 22, 2); mark(r, 'urn', 34, 2);
  mark(r, 'torch', 20, 7); mark(r, 'torch', 32, 7); mark(r, 'crystal', 8, 2);
  keeps(r, 4, 2, 35, 12); keeps(r, 4, 13, 11, 22); for (const [x, y] of [[4, 7], [10, 13], [4, 17]]) for (const d of [1, 3]){ keep(r, x, y + d); keep(r, x + 1, y + d); }
  return r;
}

export const far = { left: 5, right: 1, build(X){
  const cells = X.roomOf('keepcells'), weir = X.roomOf('weir'); if (!cells || !weir) return;
  const { EMPTY: E } = X.tile, cut = (R, x0, y0, x1, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) X.set(R.tx0 + x, R.ty0 + y, E); };
  X.addRoom(-5, -1, named(sump), { breath: true, wing: true, far: true }); X.addRoom(-5, 0, named(drawshaft), { breath: true, wing: true, far: true });
  X.addRoom(-5, 3, named(loft), { wing: true, far: true }); X.addRoom(-5, -4, named(sounding, 'glide'), { wing: true, far: true });
  // the ways in: through the west wall of the cells' pit at its floor, and of the weir at its bank; and the hole in the
  // weir's roof under the loft's boards
  cut(cells, 0, DROWNED.low, 1, DROWNED.low + 4); cut(weir, 0, DROWNED.weirHigh + 1, 1, DROWNED.weirHigh + 6); cut(weir, 30, 44, 35, 45);
  // ---- east: the pit beside the niches, and the first tomb under it
  const ni = X.roomOf('niches'), ai = X.roomOf('aisle'); if (!ni || !ai) return;
  const cx = Math.round((ni.tx0 - X.X0) / 40) + 1, cy = Math.round((ai.ty0 - X.Y0) / 23);   // the column east of the niches; the pit's foot level with the aisle's
  const pit = X.addRoom(cx, cy, named(unsorted, 'breaker'), { wing: true, far: true }), tomb = X.addRoom(cx, cy - 1, named(firstlaid, 'breaker'), { wing: true, far: true });
  // the one way in: through the aisle's east wall at the head of its stair, two rows up off the stair's last step. (One,
  // and no second through the niches: two ways into one room make a ring of open air, and the stone inside a ring hangs)
  cut(ai, 78, PIT.way, 79, PIT.way + 4); cut(pit, 0, PIT.way, 1, PIT.way + 4);
  // the slab, across the hole in the pit's floor: stone under it cut away down to the tomb's roof
  for (let x = PIT.hatch[0]; x <= PIT.hatch[1]; x++){ for (let y = 0; y < 3; y++) X.set(pit.tx0 + x, pit.ty0 + y, E); X.set(pit.tx0 + x, pit.ty0 + 3, X.tile.SLUICE); for (let y = 21; y <= 22; y++) X.set(tomb.tx0 + x, tomb.ty0 + y, E); }
  for (const x of [PIT.hatch[1] - 1, PIT.hatch[1]]) X.set(tomb.tx0 + x, tomb.ty0 + 22, X.tile.ROCK);   // the last sill up out of the tomb, in the hole under the slab's east end
  X.marks.push({ type: 'gate', x: pit.tx0 + PIT.hatch[0], y: pit.ty0 + 3, w: PIT.hatch[1] - PIT.hatch[0] + 1, h: 1, key: PIT.key });
} };

export const decoDef = (px, PAL) => ({
  // the wheel the chain goes over, at the shaft's head: a rim, six spokes, the axle on two posts
  wellwheel(g, x, y){ const R = 18; for (let a = 0; a < 64; a++){ const c = Math.cos(a / 64 * Math.PI * 2), s = Math.sin(a / 64 * Math.PI * 2); px(g, PAL.ink, Math.round(x + c * R) - 1, Math.round(y - s * R) - 1, 3, 3); }
    for (let a = 0; a < 64; a++){ const c = Math.cos(a / 64 * Math.PI * 2), s = Math.sin(a / 64 * Math.PI * 2); px(g, a % 8 < 4 ? PAL.wood1 : PAL.wood2, Math.round(x + c * R), Math.round(y - s * R), 1, 1); }
    for (let k = 0; k < 6; k++){ const c = Math.cos(k / 6 * Math.PI * 2), s = Math.sin(k / 6 * Math.PI * 2); for (let d = 2; d < R; d++) px(g, PAL.wood0, Math.round(x + c * d), Math.round(y - s * d), 1, 1); }
    px(g, PAL.ink, x - 3, y - 3, 6, 6); px(g, '#8b9bb4', x - 2, y - 2, 4, 4); px(g, PAL.ink, x - 40, y - 2, 80, 4); px(g, PAL.wood1, x - 39, y - 1, 78, 2); },
  // the stone trough the buckets were tipped into: it runs along the floor from the shaft's head
  trough(g, x, y){ px(g, PAL.ink, x - 30, y - 9, 60, 9); px(g, PAL.mid, x - 29, y - 8, 58, 7); px(g, PAL.dark, x - 27, y - 8, 54, 4); px(g, '#2f6f62', x - 27, y - 5, 54, 1); px(g, PAL.light, x - 29, y - 8, 2, 1); px(g, PAL.light, x + 27, y - 8, 2, 1); },
  // carriers' yokes on their pegs: a bar across the shoulders, a hook at either end
  yokes(g, x, y, r){ for (let k = 0; k < 3; k++){ const yy = y - 14 - k * 9, w = 26 + Math.floor(r() * 6); px(g, PAL.ink, x - (w >> 1) - 1, yy - 1, w + 2, 4); px(g, PAL.wood1, x - (w >> 1), yy, w, 2); px(g, PAL.wood3, x - (w >> 1), yy, w, 1); px(g, PAL.ink, x - (w >> 1), yy + 2, 2, 5); px(g, PAL.ink, x + (w >> 1) - 2, yy + 2, 2, 5); px(g, '#8b9bb4', x - 1, yy - 3, 2, 2); } },
  // the first tomb: a plain chest of stone on two steps, its lid a little aside
  firsttomb(g, x, y){ px(g, PAL.ink, x - 26, y - 4, 52, 4); px(g, PAL.mid, x - 25, y - 3, 50, 3); px(g, PAL.ink, x - 22, y - 8, 44, 4); px(g, PAL.mid, x - 21, y - 7, 42, 3); px(g, PAL.ink, x - 18, y - 22, 36, 14); px(g, PAL.light, x - 17, y - 21, 34, 12); px(g, PAL.mid, x - 17, y - 14, 34, 5); px(g, PAL.ink, x - 17, y - 26, 38, 5); px(g, PAL.pale, x - 16, y - 25, 36, 3); px(g, PAL.light, x - 16, y - 23, 36, 1); px(g, PAL.dark, x - 4, y - 19, 8, 1); px(g, PAL.dark, x - 1, y - 20, 2, 6); },
  // the lead of the sounding line, lying where it came to rest, the last of the chain coiled on it
  plumb(g, x, y){ px(g, PAL.ink, x - 6, y - 12, 12, 12); px(g, '#5a6988', x - 5, y - 11, 10, 10); px(g, '#8b9bb4', x - 5, y - 11, 3, 6); px(g, PAL.ink, x - 3, y - 15, 6, 4); px(g, '#8b9bb4', x - 1, y - 14, 2, 2); for (let k = 0; k < 5; k++){ px(g, PAL.ink, x + 6 + k * 3, y - 4 + (k % 2), 4, 4); px(g, PAL.light, x + 7 + k * 3, y - 3 + (k % 2), 2, 2); } },
});
