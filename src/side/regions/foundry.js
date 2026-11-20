// The Bell-Foundry: the Cloister's wing, east of the bell tower (docs/world.md, docs/phase10-sheet.md). Where the house
// cast its bells, in a pit cut into the mountain. They cast the Toll here. When the dark came they cast more and larger
// and rang them harder, until one cracked: a sister to the Toll. They left it hanging in the pit and went on casting.
// Ten screens and the slype, set into the Cloister by level.js (WINGS): four columns added to the east.
//   slype      the covered passage the bells were carried out by: in through cracked stone in the tower's east wall (the
//              spade breaks it), a stair down eastward. One tongue, one lump of slag, one shutter: the rule, shown
//   casting    the casting floor, two screens wide: two great molds, the hoist over the hole the bells went down by
//   molds      three molds on their sides, hollow, a tongue hanging in each: gone through bent double
//   slagruns   two screens, one over the other: the channels the slag ran down, still hot in the dips
//   pit        two screens by two: the Cracked Bell, hanging in the middle of it, silent
//   bellrope   the ringers' way up, a shaft of rungs to a grate in the slype's floor; the relic at its foot
// Its rule (level.js RULE.ring, RULE.still): iron rings when it is touched, by his blade or his body. While anything
// rings the tongues swing (and hurt), the slag wakes and comes, the shutters come down. In silence the tongues hang
// still, the slag is cold, the shutters are up. When the Cracked Bell falls the wing is still for good.
// Everything here has `gate: 'breaker'`; the tests hold that none of it is reached without the spade.
import { room, rect, walls, door, ledge, mark, stairs, EMPTY, LEDGE, SPIKES, SHUTTER, STILLED, CRACKED } from '../rooms.js';

const TITLE = 'THE BELL-FOUNDRY';
const named = (fn, look = 'foundry') => { const f = () => { const r = fn(); r.title = TITLE; r.gate = 'breaker'; r.look = look; return r; }; Object.defineProperty(f, 'name', { value: fn.name }); return f; };
const deco = (r, kind, x, y) => mark(r, 'deco', x, y, { kind });
const keep = (r, x, y) => mark(r, 'keep', x, y);
// a tongue, hung over a floor at row y: it hangs to 1.7 units over it (a standing man walks into it; bent double he passes under)
const tongue = (r, x, y, more) => mark(r, 'clapper', x, y, more);
// a run: a channel sloping from (x0, ya) to (x1, yb), two tiles thick
const run = (r, x0, x1, ya, yb) => { for (let x = x0; x <= x1; x++){ const y = Math.round(ya + (yb - ya) * (x - x0) / Math.max(1, x1 - x0)); rect(r, x, y - 1, x, y); } };

function slype(){
  const r = room(); walls(r); door(r, 'left', 9, 14); door(r, 'right', 2, 7);
  rect(r, 0, 0, 13, 8); stairs(r, 27, 2, 7, -1, 2);                // the landing inside the tower's wall, and the stair down from it
  rect(r, 0, 16, 22, 20);                                          // the passage's low roof, over the landing and the stair's head
  rect(r, 38, 2, 39, 7, SHUTTER);                                  // the shutter to the casting floor
  // the ringers' way: a shaft down through the landing to the bell-rope, boards over its mouth, a grate under them
  rect(r, 4, 0, 9, 8, EMPTY); ledge(r, 4, 9, 8); rect(r, 4, 7, 9, 7, STILLED); ledge(r, 4, 9, 6); ledge(r, 4, 9, 2);
  tongue(r, 31, 2); mark(r, 'slag', 35, 2);                        // the rule, shown: walk into the tongue and all three answer
  for (const [k, x, y] of [['tongues', 11, 9], ['moldhalf', 33, 2], ['ingots', 29, 2]]) deco(r, k, x, y);
  mark(r, 'torch', 2, 12); mark(r, 'torch', 24, 8); mark(r, 'crystal', 36, 2);
  for (const x of [29, 31, 33, 35, 37]) keep(r, x, 4);
  return r;
}
function casting(){
  const r = room(2, 1); walls(r); door(r, 'left', 2, 7); door(r, 'right', 2, 7); rect(r, 78, 2, 79, 7, SHUTTER);
  // the two great molds: climbed over, under the tongue that hangs over each crown
  for (const x of [20, 58]){ rect(r, x - 8, 2, x + 8, 4); rect(r, x - 5, 5, x + 5, 7); rect(r, x - 2, 8, x + 2, 8); tongue(r, x, 9); for (const dx of [-2, 0, 2]) keep(r, x + dx, 10); }
  // the hole the bells went down by, under the hoist: boards over it (the chain goes down through them, into the pit)
  rect(r, 36, 0, 43, 1, EMPTY); ledge(r, 36, 43, 1);
  ledge(r, 6, 12, 12); mark(r, 'chest', 8, 13, { holds: 'shards' }); ledge(r, 66, 73, 12); mark(r, 'thread', 70, 13);   // on the hoist's galleries, off each crown
  mark(r, 'slag', 31, 2); mark(r, 'slag', 47, 2);
  for (const [k, x, y] of [['hoist', 40, 20], ['coldfurnace', 73, 2], ['ingots', 46, 2], ['crucible', 30, 20], ['crucible', 50, 20], ['moldhalf', 6, 2]]) deco(r, k, x, y);
  mark(r, 'torch', 4, 9); mark(r, 'torch', 33, 10); mark(r, 'torch', 47, 10); mark(r, 'torch', 76, 10); mark(r, 'urn', 10, 2); mark(r, 'urn', 69, 2); mark(r, 'crystal', 40, 2);
  return r;
}
function molds(){
  const r = room(); walls(r); door(r, 'left', 2, 7);
  // three molds on their sides in one mass of clay and brick: hollow, joined by low ways, a tongue hanging in each
  rect(r, 5, 2, 29, 12); rect(r, 5, 13, 7, 20);
  rect(r, 5, 2, 29, 4, EMPTY); for (const x of [8, 16, 24]){ rect(r, x, 2, x + 4, 7, EMPTY); tongue(r, x + 2, 2); for (const y of [3, 6]) keep(r, x + 2, y); } for (const x of [6, 14, 22, 29]) keep(r, x, 3);
  // the way down to the runs: a hole in the floor, boards over it, a shutter for its lid
  rect(r, 32, 0, 36, 1, EMPTY); ledge(r, 32, 36, 1); rect(r, 32, 0, 36, 0, SHUTTER);
  ledge(r, 32, 37, 5); ledge(r, 30, 35, 9); mark(r, 'chest', 12, 13, { holds: 'thread' }); mark(r, 'crystal', 20, 13);   // over the molds: for one who looks up
  mark(r, 'slag', 31, 2);
  for (const [k, x, y] of [['ingots', 18, 13], ['moldhalf', 26, 13], ['crucible', 34, 20]]) deco(r, k, x, y);
  mark(r, 'torch', 3, 10); mark(r, 'torch', 36, 12); mark(r, 'torch', 20, 16);
  return r;
}
function slagruns(){
  const r = room(1, 2); walls(r); door(r, 'top', 32, 36); door(r, 'left', 2, 7); rect(r, 0, 2, 1, 7, SHUTTER);
  for (const y of [38, 41, 44]) ledge(r, 32, 36, y);               // under the molds' hole: down by these, and back up
  // three runs, one under another, each sloping the other way; slag still hot in the dips
  run(r, 8, 37, 30, 35); run(r, 2, 31, 24, 19); run(r, 8, 37, 8, 13);
  for (const [x, y] of [[20, 33], [12, 23], [26, 12]]){ rect(r, x, y - 1, x + 2, y + 1, EMPTY); rect(r, x, y - 2, x + 2, y - 2); rect(r, x, y - 1, x + 2, y - 1, SPIKES); }   // a dip in each, and what lies in it
  rect(r, 14, 21, 14, 22);                                         // the middle dip is two wide: its far lip is a tile higher under a low roof, and he no longer takes an edge coming down (build 77)
  ledge(r, 2, 6, 28); ledge(r, 33, 37, 16); ledge(r, 2, 6, 5);     // from the end of each run up to the next
  tongue(r, 30, 35); tongue(r, 22, 22); tongue(r, 14, 10);
  mark(r, 'slag', 34, 2); mark(r, 'chest', 30, 2, { holds: 'shards' });   // under the last run
  for (const [k, x, y] of [['ingots', 20, 2], ['moldhalf', 12, 2]]) deco(r, k, x, y);
  mark(r, 'torch', 36, 40); mark(r, 'torch', 3, 14); mark(r, 'torch', 20, 5); mark(r, 'urn', 24, 2); mark(r, 'crystal', 5, 2);
  return r;
}
function pit(){
  const r = room(2, 2); walls(r); door(r, 'right', 2, 7); door(r, 'top', 36, 43); door(r, 'left', 25, 30); rect(r, 0, 25, 1, 30, STILLED);
  // the galleries: up the west wall to the ringers' door, and a shorter climb on the east
  for (const y of [5, 9, 13, 17, 21]) ledge(r, 2, 8, y); rect(r, 2, 23, 9, 24); for (const x of [2, 3, 4, 6]) for (const y of [25, 27]) keep(r, x, y);   // (the wear would bank the gallery up against the grate, and close the door behind it)
  for (const y of [5, 9, 13]) ledge(r, 71, 77, y); mark(r, 'chest', 74, 14, { holds: 'shards' });
  rect(r, 10, 20, 13, 21); tongue(r, 12, 9); rect(r, 66, 16, 69, 17); tongue(r, 67, 5);   // a tongue by each, hung from a bracket: no gallery is safe while anything rings
  mark(r, 'crackedbell', 40, 2, { top: 44 });
  mark(r, 'slag', 18, 2); mark(r, 'slag', 30, 2); mark(r, 'slag', 58, 2);
  for (const [k, x, y] of [['moldhalf', 24, 2], ['moldhalf', 52, 2], ['ingots', 64, 2], ['ingots', 12, 2]]) deco(r, k, x, y);
  for (const x of [14, 30, 50, 66]) mark(r, 'torch', x, 9); mark(r, 'torch', 4, 28); mark(r, 'crystal', 34, 2); mark(r, 'crystal', 46, 2);
  for (const x of [38, 40, 42]) for (const y of [4, 8, 12]) keep(r, x, y);
  return r;
}
function bellrope(){
  const r = room(); walls(r); door(r, 'right', 2, 7); door(r, 'top', 4, 9);
  for (const y of [5, 9, 13, 17, 21]) ledge(r, 4, 9, y);           // the rungs
  rect(r, 18, 2, 26, 2);                                           // a low step, where what was kept here is kept
  mark(r, 'chest', 22, 3, { holds: 'relic:felt' });
  for (const [k, x, y] of [['rope', 6, 20], ['tongues', 30, 2], ['ingots', 14, 2]]) deco(r, k, x, y);
  mark(r, 'torch', 12, 9); mark(r, 'torch', 34, 9); mark(r, 'crystal', 19, 3); mark(r, 'urn', 34, 2);
  return r;
}

// set into the Cloister: four columns to the east of it (as the region counts cells: the bell tower is column 3, its
// foot row 0), the pit cut down into the mountain under the casting floor
export const wing = { right: 4, build(X){
  const bf = X.roomOf('belfry'); if (!bf) return; const col = Math.round((bf.tx0 - X.X0) / 40), row = Math.round((bf.ty0 - X.Y0) / 23);
  X.addRoom(col + 1, row, named(slype));
  X.addRoom(col + 2, row, named(casting));
  X.addRoom(col + 4, row, named(molds));
  X.addRoom(col + 4, row - 2, named(slagruns));
  X.addRoom(col + 2, row - 2, named(pit));
  X.addRoom(col + 1, row - 1, named(bellrope), { after: true });   // after: behind its grates until the Cracked Bell has fallen (the tests hold it shut before)
  // the door: cracked stone in the tower's east wall, at the first turn of the bell stair (over Mirel's place)
  for (let y = 9; y <= 14; y++) for (let x = bf.tx1 - 1; x >= bf.tx1 - 6; x--){ const t = X.at(x, bf.ty0 + y); if (t !== X.tile.ROCK && x < bf.tx1 - 2) break; X.set(x, bf.ty0 + y, CRACKED); }
} };
export const QUIET = ['bellrope'];

// ---- its look: soot-dark brick and black iron, orange from the slag; sparks
export const looks = {
  foundry: {
    stone: { edge: 'ink', lip: 'rust', lip2: 'wood2', lipD: 2, lip2D: 3, a: 'wood1', aSeam: 'wood0', b: 'wood0', bSeam: 'ink', c: 'wood0', core: 'ink', seam: 'brick' },
    moss: { c: ['wood0', 'ink', 'wood0'], p: 0.04 }, plank: ['dark', 'mid', 'ink', 'dark'], spike: ['fire1', 'fire3'],
    ceilLow: [['chain', 6]], ceil: [['chain', 30], ['lantern', 8]],
    floorWall: ['ingots', 'candles', 'ingots'], floorOpen: ['ingots'], gem: 'candles',
    back: { cols: ['wood0', 'ink', 'wood1'], dim: [0.9, 0.82, 0.8], hole: 3.4, holeOpen: 3.4, windows: false, stand: [['pillar', 1]], hang: [['chain', 1]], pStand: 0, pHang: 0.002, wall: [['chain', 6], ['banner', 1]], pWall: 0.002, brick: true },
    far: { img: 'cloister', dim: 0.5 }, hemi: [0xffd8b0, 0x70564c, 0.95], shaft: null,
    amb: [0.66, 0.5, 0.44], mist: { col: 'wood0', col2: 'ink', a: 0.36, drift: 0.12 }, fore: 'cloister',
    air: { n: 60, cols: [0xff7a30, 0xfeae34], warm: 0.7, vx: 0.15, vy: [0.3, 1.2] },   // sparks, rising
  },
};

// ---- what stands in it, painted (a 'deco' mark): x the middle, y the floor. What hangs is marked in the row under
// the roof, and hung from that row's top (eight pixels over its y)
export const decoDef = (px, PAL) => ({
  // half a bell's mold, lying open: clay, the bell's shape hollowed in it
  moldhalf(g, x, y){ for (let b = 0; b < 13; b++){ const half = b < 4 ? 11 : Math.round(11 - (b - 4) * 0.9); px(g, PAL.ink, x - half - 1, y - 1 - b, half * 2 + 2, 1); px(g, b % 4 === 0 ? PAL.wood1 : PAL.wood2, x - half, y - 1 - b, half * 2, 1); if (b > 1 && half > 4) px(g, b < 5 ? PAL.wood0 : PAL.ink, x - half + 3, y - 1 - b, half * 2 - 6, 1); } px(g, PAL.tan, x - 9, y - 4, 2, 1); px(g, PAL.tan, x + 6, y - 7, 2, 1); },
  // ingots, stacked
  ingots(g, x, y, r){ for (let row = 0; row < 3; row++) for (let k = 0; k < 3 - row; k++){ const bx = x - 7 + k * 5 + row * 2, by = y - 3 - row * 3; px(g, PAL.ink, bx, by, 5, 3); px(g, r() < 0.5 ? PAL.mid : PAL.dark, bx + 1, by, 3, 2); px(g, PAL.light, bx + 1, by, 2, 1); } },
  // a rack of tongues: the clappers of bells not yet hung
  tongues(g, x, y){ px(g, PAL.ink, x - 10, y - 20, 21, 2); px(g, PAL.wood1, x - 9, y - 20, 19, 1); px(g, PAL.ink, x - 10, y - 20, 1, 20); px(g, PAL.ink, x + 10, y - 20, 1, 20); for (const a of [-6, -1, 4]){ px(g, PAL.mid, x + a, y - 18, 1, 5); px(g, PAL.ink, x + a - 1, y - 13, 3, 9); px(g, PAL.dark, x + a, y - 13, 1, 8); px(g, PAL.ink, x + a - 2, y - 6, 5, 3); px(g, PAL.mid, x + a - 1, y - 6, 2, 1); } },
  // a crucible hung on its chain from the roof (y the roof), cold
  crucible(g, x, y){ y -= 8; const L = 30; for (let k = 0; k < L; k += 2) px(g, k % 4 ? PAL.mid : PAL.dark, x, y + k, 1, 2); px(g, PAL.ink, x - 6, y + L, 13, 10); px(g, PAL.dark, x - 5, y + L + 1, 11, 8); px(g, PAL.mid, x - 5, y + L + 1, 11, 1); px(g, PAL.ink, x - 4, y + L + 2, 9, 2); px(g, PAL.fire0, x - 3, y + L + 3, 4, 1); px(g, PAL.ink, x - 8, y + L + 3, 2, 2); px(g, PAL.ink, x + 7, y + L + 3, 2, 2); },
  // the hoist over the hole: a beam under the roof (y the roof), its wheel, the chain going down
  hoist(g, x, y){ y -= 8; px(g, PAL.ink, x - 34, y + 4, 69, 6); px(g, PAL.wood1, x - 33, y + 5, 67, 4); px(g, PAL.wood2, x - 33, y + 5, 67, 1); for (let a = -30; a <= 30; a += 12) px(g, PAL.ink, x + a, y + 5, 1, 4); px(g, PAL.ink, x - 6, y + 9, 13, 13); px(g, PAL.dark, x - 5, y + 10, 11, 11); px(g, PAL.mid, x - 3, y + 12, 7, 7); px(g, PAL.ink, x - 1, y + 14, 3, 3); for (let k = 22; k < 150; k += 2) px(g, k % 4 ? PAL.mid : PAL.dark, x, y + k, 1, 2); },
  // the furnace, cold: an iron mouth in a brick breast, ash in it
  coldfurnace(g, x, y){ for (let b = 0; b < 30; b++){ const half = b < 20 ? 14 : Math.round(Math.sqrt(Math.max(0, 14 * 14 - (b - 20) * (b - 20) * 1.8))); px(g, PAL.ink, x - half - 2, y - 1 - b, half * 2 + 4, 1); px(g, b % 5 === 0 ? PAL.wood0 : PAL.wood1, x - half - 1, y - 1 - b, half * 2 + 2, 1); } for (let b = 0; b < 14; b++){ const half = b < 8 ? 8 : Math.round(Math.sqrt(Math.max(0, 64 - (b - 8) * (b - 8) * 1.6))); px(g, PAL.ink, x - half, y - 1 - b, half * 2, 1); } px(g, PAL.dark, x - 6, y - 3, 12, 2); px(g, PAL.mid, x - 4, y - 4, 5, 1); for (let a = -6; a <= 6; a += 3) px(g, PAL.dark, x + a, y - 14, 1, 11); px(g, PAL.ink, x - 3, y - 44, 7, 14); px(g, PAL.wood0, x - 2, y - 44, 5, 13); },
  // the bell-rope, hanging down the shaft (y the roof)
  rope(g, x, y){ y -= 8; for (let k = 0; k < 150; k++) px(g, k % 6 < 3 ? PAL.tan : PAL.wood2, x + (k % 12 < 6 ? 0 : 1), y + k, 1, 1); px(g, PAL.red0, x - 1, y + 150, 3, 6); px(g, PAL.red1, x, y + 151, 1, 4); },
});

// ---- who is in it
const TONGUE = 1.25;   // a tongue's length, from its tip up
// what a creature here draws for itself (not in the tests, which have no pictures)
const three = () => { const T3 = typeof window !== 'undefined' && window.THREE; return T3 && T3.Group && T3.CanvasTexture && typeof document !== 'undefined' ? T3 : null; };
const pixTex = (T3, w, h, paint) => { const c = document.createElement('canvas'); c.width = w; c.height = h; paint(c.getContext('2d')); const t = new T3.CanvasTexture(c); t.magFilter = t.minFilter = T3.NearestFilter; t.generateMipmaps = false; return t; };
const plane = (T3, w, h, map, more = {}) => new T3.Mesh(new T3.PlaneGeometry(w, h), new T3.MeshBasicMaterial({ map, transparent: true, alphaTest: 0.5, ...more }));
let TEX = null;
const texes = T3 => TEX || (TEX = {
  tongue: pixTex(T3, 10, 20, g => { const f = (c, x, y, w, h) => { g.fillStyle = c; g.fillRect(x, y, w, h); }; f('#181425', 3, 0, 4, 3); f('#8b9bb4', 4, 0, 2, 2); f('#181425', 2, 2, 6, 11); f('#5a6988', 3, 3, 4, 9); f('#8b9bb4', 3, 3, 2, 8); f('#c0cbdc', 3, 4, 1, 5); f('#181425', 0, 11, 10, 9); f('#5a6988', 1, 12, 8, 7); f('#8b9bb4', 1, 12, 4, 4); f('#c0cbdc', 2, 13, 2, 2); f('#3a4466', 1, 17, 8, 2); f('#d77643', 2, 18, 6, 1); }),
  chain: pixTex(T3, 4, 8, g => { const f = (c, x, y, w, h) => { g.fillStyle = c; g.fillRect(x, y, w, h); }; f('#181425', 0, 0, 4, 8); f('#8b9bb4', 1, 0, 2, 3); f('#5a6988', 1, 4, 2, 3); }),
  crack: pixTex(T3, 24, 40, g => { let x = 13; for (let y = 2; y < 40; y++){ x += [0, 1, -1, 1, 0, -1, -1, 1, 0, 1][y % 10]; g.fillStyle = '#181425'; g.fillRect(x - 1, y, 3, 1); g.fillStyle = y % 3 ? '#f77622' : '#fee761'; g.fillRect(x, y, 1, 1); if (y % 9 === 4){ g.fillStyle = '#181425'; g.fillRect(x + 2, y, 3, 1); g.fillRect(x - 4, y + 1, 3, 1); } } }),
});
const ringOut = (c, e, big) => { if (c.RULE.still) return; c.events.push({ type: 'ring', e, at: { x: e.x, y: e.y }, big: !!big }); };
const tint = (e, hex) => { if (e.sprite && e.tintNow !== hex){ e.tintNow = hex; e.sprite.g.traverse(o => { if (o.material && o.material.color) o.material.color.setHex(hex); }); } };
// the Cracked Bell, as it is: its size, how it swings, how long it rings
export const BELL = { H: 3.4, R: 1.3, rim: 1.1, w0: 1.7, damp: [0.3, 1.1], max: [0.4, 0.55], push: [0.22, 0.08], hurtAt: 2.6, toll: 0.24, ring: [3.6, 4.6] };

export const enemies = {
  // a tongue: the clapper of a broken bell, hung by its chain. Still, it rings if it is touched (his blade, or his body
  // walking into it). While anything rings it swings, and hurts. It cannot be broken
  clapper: { ai: 'clapper', own: true, noAim: true, hp: 99, w: 0.3, h: TONGUE, color: 0x3a4466, fly: true, word: 'Struck by iron',
    guard(e){ e.rung = true; return true; }, onHit(e){ e.hp = e.d.hp; e.rung = true; } },
  // slag: a lump of it, cold and asleep; a cut glances off. A ring wakes it: it glows, and comes fast along the floor,
  // and burns to touch. In silence it goes cold where it stands
  slag: { ai: 'slag', hp: 2, w: 0.8, h: 1.2, color: 0x3e2731, chase: 3.1, hear: 24, art: 'px_slag', fly: false, word: 'Seared',
    guard(e){ return e.st === 'idle'; }, onHit(e, dmg){ if (e.st === 'idle') e.hp = Math.min(e.d.hp, e.hp + dmg); } },
  // the Cracked Bell: the wing's keeper, a sister to the Toll, hung in the pit. It never strikes first. Every blow it
  // takes, it rings, and swings; from half its strength, while it swings widely it tolls again by itself
  crackedbell: { ai: 'crackedbell', own: true, hp: 20, w: BELL.R, h: BELL.H * 0.75, color: 0x5a6988, fly: true, word: 'Rung', name: 'The Cracked Bell',
    // a blow sends it the way it is already going (or, hanging still, away from him); from half its strength every blow
    // sets it swinging widely
    onHit(e, dmg, P){ const two = e.hp <= e.d.hp / 2, dir = Math.abs(e.om || 0) > 0.05 ? Math.sign(e.om) : Math.sign((P && P.face) || 1); e.om = (e.om || 0) + dir * (BELL.push[0] + BELL.push[1] * dmg);
      if (two && Math.abs(e.om) < BELL.w0 * BELL.max[0]) e.om = dir * BELL.w0 * BELL.max[0]; e.rung = true; e.woke = true; },
    onKill(e){ e.fell = true; lay(e); },
    spawn(e, c){ if (c.RULE.still){ e.alive = false; e.fell = true; hang(e, c.T); drawBell(e, c.scene, c.lit); lay(e); } } },   // one that has fallen lies where it fell
};
// where the Bell hangs: from the pit's roof over its mark, its rim BELL.rim over the floor
function hang(e, T){ const floor = e.home.y - 1.6, top = floor + (((e.mk && e.mk.top) || 44) - 2) * T; e.floor = floor; e.piv = { x: e.home.x, y: top }; e.L = top - floor - BELL.rim - BELL.H; e.th = 0; e.om = e.om || 0; e.cool = 0; e.lastSign = 0; }
// its picture: the Toll's own pieces (its sister), smaller, gone green, the eyes dark; a crack down it
function drawBell(e, scene, lit){
  const T3 = three(); if (!T3 || !lit || e.g) return;
  const B = BELL, X = texes(T3), g = new T3.Group(), L = new T3.TextureLoader(), px = n => { const t = L.load(`assets/side/toll/${n}.png`); t.magFilter = t.minFilter = T3.NearestFilter; t.generateMipmaps = false; return t; }, s = B.H / 5.5, arm = e.L + B.H / 2;
  const chainT = px('chain'); chainT.wrapT = T3.RepeatWrapping; chainT.repeat.y = e.L / 2; const chain = new T3.Mesh(new T3.PlaneGeometry(0.5, 1), new T3.MeshBasicMaterial({ map: chainT, transparent: true, alphaTest: 0.5, color: 0x9a9aa8 })); chain.scale.y = e.L + 0.4; chain.position.y = -(e.L + 0.4) / 2;
  const bell = new T3.Mesh(new T3.PlaneGeometry(90 / 16 * s, 88 / 16 * s), lit({ map: px('bell'), normalMap: px('bell_n'), transparent: true, alphaTest: 0.5, color: 0x8aa094 })); bell.position.set(0, -arm, 0.001);
  const crack = plane(T3, 24 / 16 * 1.1, 40 / 16 * 1.1, X.crack); crack.position.set(0.25, 0.1, 0.002); bell.add(crack);
  const glow = new T3.Mesh(new T3.PlaneGeometry(2.2, 3.6), new T3.MeshBasicMaterial({ map: X.crack, transparent: true, opacity: 0, depthWrite: false, blending: T3.AdditiveBlending, color: 0xff7a30 })); glow.position.set(0.25, 0.1, 0.003); bell.add(glow);
  g.add(chain); g.add(bell); g.position.set(e.piv.x, e.piv.y, -0.2); scene.add(g); e.g = g; e.parts = { bell, crack, chain, glow };
}
// the Bell, fallen: it lies on the pit's floor on its side, its chain hanging empty
export function lay(e){
  if (!e.g || e.floor == null) return;
  e.g.rotation.z = 0; if (e.parts){ const { bell, crack, chain, glow } = e.parts; bell.position.set(0.4, -(e.piv.y - e.floor) + BELL.R + 0.1, 0); bell.rotation.z = 1.72; crack.visible = false; if (glow) glow.visible = false; chain.scale.y = (e.L * 0.55); chain.position.y = -(e.L * 0.55) / 2; if (chain.material.map) chain.material.map.repeat.y = e.L * 0.55 * 2; }
}
export const ai = {
  clapper(e, P, dt, c){
    const R = c.RULE, d = e.d;
    if (!e.piv){   // where it hangs from: the first rock over it (or `len` units of chain), and how far its tip hangs over its floor
      const floor = e.home.y - 1.6, tip = floor + ((e.mk && e.mk.hang) || 1.7); let top = tip + 6;
      if (e.mk && e.mk.len) top = tip + e.mk.len; else for (let k = 1; k < 40; k++){ const y = tip + TONGUE + k * 0.5; if (c.solidAt(e.home.x, y)){ top = Math.floor(y / 0.5) * 0.5; break; } }
      e.piv = { x: e.home.x, y: top }; e.L = Math.max(TONGUE + 0.1, top - tip); e.th = 0; e.amp = 0; e.ph = (e.home.x * 1.7) % 6.28; e.cool = 0; e.grace = 0;
      e.A = Math.max(0.35, Math.min(0.95, 1.6 / Math.sqrt(e.L))); e.w = Math.max(1.6, Math.min(4.5, Math.sqrt(9 / e.L)));
    }
    const ringing = R.ring > 0 && !R.still;
    e.cool = Math.max(0, e.cool - dt); e.grace = Math.max(0, e.grace - dt);
    if (e.rung){ e.rung = false; if (e.cool <= 0){ e.cool = 0.5; e.amp = Math.max(e.amp, 0.25); ringOut(c, e, false); } }
    e.amp += ((ringing ? e.A : 0) - e.amp) * Math.min(1, dt * (ringing ? 2.2 : 1.3)); e.ph += dt * e.w; e.th = e.amp * Math.sin(e.ph);
    const tx = e.piv.x + e.L * Math.sin(e.th), ty = e.piv.y - e.L * Math.cos(e.th); e.x = tx; e.y = ty + TONGUE * 0.5; e.st = 'idle';
    // his body against it: swinging, it strikes him; still, it rings (and gives him a moment to be clear of it)
    if (P.x + 0.34 > tx - 0.28 && P.x - 0.34 < tx + 0.28 && P.y + P.h > ty && P.y < ty + TONGUE){
      if (ringing && e.amp > 0.3 && e.grace <= 0){ if (!c.isRollInv(P)) c.hurt(P, 1, tx, d.word); }
      else if (!ringing && e.cool <= 0 && !R.still){ e.rung = true; e.grace = 0.9; } }
    const T3 = three(); if (!T3) return;
    if (!e.g){ const X = texes(T3), g = new T3.Group(), len = e.L - TONGUE, ch = plane(T3, 0.25, Math.max(0.05, len), X.chain.clone()); ch.material.map.wrapT = T3.RepeatWrapping; ch.material.map.repeat.y = len * 2; ch.material.map.needsUpdate = true; ch.position.y = -len / 2;
      const tg = plane(T3, 0.625, TONGUE, X.tongue); tg.position.y = -(e.L - TONGUE / 2); g.add(ch); g.add(tg); g.position.set(e.piv.x, e.piv.y, 0.04); c.E.scene.add(g); e.g = g; e.tg = tg; }
    e.g.rotation.z = e.th; e.tg.material.color.setHex(ringing && e.amp > 0.3 ? 0xffc890 : 0xffffff);
  },
  slag(e, P, dt, c){
    const d = e.d, R = c.RULE, { dx, dy, go, events } = c, gy = c.ground(e.x, e.y + 0.3); if (gy > -Infinity) e.y = gy;
    const ringing = R.ring > 0 && !R.still && c.dist < d.hear;
    if (e.st === 'idle'){ e.warn = false; e.glow = 0; tint(e, 0x74707c); c.anim(e, 'stand', 0); if (ringing){ go('wake'); e.face = Math.sign(dx) || e.face; events.push({ type: 'notice', e }); } }
    else if (e.st === 'wake'){ e.glow = Math.sin(e.tm * 30) > 0 ? 0x802800 : 0; tint(e, 0xd0c0b8); c.anim(e, 'crawl', 0); if (e.tm > 0.45) go('crawl'); }
    else if (e.st === 'crawl'){ e.glow = 0x802800; tint(e, 0xffffff); e.face = Math.sign(dx) || e.face; const nx = e.x + e.face * d.chase * dt;
      if (Math.abs(dx) > 0.5 && !c.solidAt(nx + e.face * d.w, e.y + 0.3) && c.ground(nx, e.y + 0.3) > e.y - 0.6) e.x = nx;
      c.anim(e, 'crawl', (e.age * 1.6) % 1);
      if (Math.abs(dx) < d.w + 0.34 && P.y < e.y + d.h && P.y + P.h > e.y && c.hit(e.x - d.w, e.y, e.x + d.w, e.y + d.h, d.word, e.x)){ go('cool'); e.spent = 1.1; }   // it has burned him: it is spent a moment
      if (!ringing) go('cool'); }
    else if (e.st === 'cool'){ e.glow = e.tm < 0.3 ? 0x401400 : 0; tint(e, 0xb0a8a8); c.anim(e, 'crawl', 0); e.spent = Math.max(0, (e.spent || 0) - dt); if (ringing){ if (e.spent <= 0) go('crawl'); } else if (e.tm > 0.6){ go('idle'); e.spent = 0; e.home.x = e.x; e.home.y = e.y; } }
    else go('idle');
  },
  crackedbell(e, P, dt, c){
    const R = c.RULE, d = e.d, B = BELL;
    if (!e.piv) hang(e, c.T);
    const two = e.hp <= d.hp / 2, ringing = R.ring > 0 && !R.still, arm = e.L + B.H / 2;
    if (two && !e.two){ e.two = true; c.events.push({ type: 'tell', e }); }
    e.cool = Math.max(0, e.cool - dt);
    if (e.rung){ e.rung = false; ringOut(c, e, true); e.cool = 0.4; }
    // it swings as a weight on a chain does: pushed by each blow, dying away (slowly while it rings, soon in silence)
    const max = B.max[two ? 1 : 0]; e.om += (-B.w0 * B.w0 * e.th - B.damp[ringing ? 0 : 1] * e.om) * dt; e.th += e.om * dt;
    if (Math.abs(e.th) > max){ e.th = Math.sign(e.th) * max; if (e.th * e.om > 0) e.om = 0; }
    // from half its strength: at the end of each wide swing it tolls again by itself
    const sg = Math.sign(e.om); if (two && sg && e.lastSign && sg !== e.lastSign && Math.abs(e.th) > B.toll && e.cool <= 0){ ringOut(c, e, true); e.cool = 0.4; } if (sg) e.lastSign = sg;
    const cx = e.piv.x + arm * Math.sin(e.th), cy = e.piv.y - arm * Math.cos(e.th), speed = Math.abs(e.om) * arm; e.x = cx; e.y = cy - B.H / 4; e.st = Math.abs(e.om) > 0.02 || Math.abs(e.th) > 0.01 ? 'swing' : 'idle';
    if (P.x + 0.34 > cx - B.R && P.x - 0.34 < cx + B.R && P.y + P.h > cy - B.H / 2 && P.y < cy + B.H / 2){
      if (speed > B.hurtAt){ if (!c.isRollInv(P)) c.hurt(P, 1, cx, d.word); }
      else if (!ringing && e.cool <= 0 && !R.still){ e.woke = true; ringOut(c, e, false); e.cool = 1.2; e.om += (Math.sign(cx - P.x) || 1) * 0.05; } }   // walked into: it rings, softly
    drawBell(e, c.E.scene, c.lit); if (!e.g) return;
    e.g.rotation.z = e.th; const m = e.parts.bell.material; if (m.emissive) m.emissive.setHex(e.flash > 0 ? 0x707070 : 0); e.parts.glow.material.opacity = two ? 0.35 + 0.25 * Math.sin(e.age * 9) : ringing ? 0.12 : 0;
  },
};
