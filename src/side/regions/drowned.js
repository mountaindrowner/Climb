// The Drowned Galleries: the Roots' west wing (docs/drowned-sheet.md). The first people on the mountain did not climb
// it: they kept the water at its foot, in halls cut in the rock. The water rose and took the halls. The pool he wakes
// in is the last room of them still dry. Set into the Roots by level.js (WINGS): four columns added to the west, and
// two rows under the region, since the halls lie lower than the pool. Open from the first: nothing gates it.
//   waterstair   out of the pool room's west wall: a stairhead, and a broad stair down into the water (two screens tall)
//   drownedhall  the keepers' great hall, four screens: a floor with a picture in it, two pools that never empty, a
//                gallery on either wall where high water comes to (the way on off the west one, a thread on the east)
//   keepcells    off the west gallery, two screens tall: a pit of cells he floats across, and a flue of cells over it
//   weir         where the keepers held the water back: a pond between two banks (two screens tall)
//   cuproom      behind the weir, up a stair from its east bank. Dry always
//   culvert      the hall's drain: under the stair, and up a shaft into the pool he woke in
// Its rule: the water breathes (level.js BREATH; a body of water with key 'breath'). It rises sixteen tiles, stands,
// falls and stands, the same every time. At low water the floors are dry; at high water it bears him up to what the
// floor cannot reach. He cannot drown, and without the Wyrm's wind he cannot go under.
// Its gates (build 108; rooms.js SLUICE, level.js RULE.gates and setGates): stone that slides in grooves, each raised and
// let down by a windlass that is somewhere else, a chain on the wall between the two. Struck, a windlass turns its gate
// over; it stays as he left it, and his save remembers.
//   hall     in the foot of the water stair, before the hall. Its windlass: on the ledge over it, where only high water comes
//   cells    the sluice at the foot of the cells' pit. Down, it holds the pit's water as it was (dry, when he first comes):
//            the cells do not fill until it is up. Its windlass: on the hall's east gallery, across the hall
//   culvert  the grate in the hall's drain. Its windlass: in the cup room, at the far end of everything
// Its heights, in every room of the lower row: the floors he walks at row 8, which is where low water stands; high water
// at row 24, sixteen over it. He leaps and hauls himself up fourteen rows and a half at the most (a second jump, and
// his hands on a lip), so only what is sixteen up wants the water. (The sheet said twelve: twelve he can climb.)
// Under the floors the drain (the culvert) runs knee-deep always, and fills as soon as the water comes over the floor.
import { room, rect, door, ledge, mark, shelf, EMPTY, ROCK, LEDGE, SLUICE } from '../rooms.js';

const TITLE = 'THE DROWNED GALLERIES';
export const DROWNED = { floor: 8, low: 8, high: 24, weirLow: 2, weirHigh: 18 };
const named = fn => { const f = () => { const r = fn(); r.title = TITLE; r.gate = ''; return r; }; Object.defineProperty(f, 'name', { value: fn.name }); return f; };
const deco = (r, kind, x, y, more) => mark(r, 'deco', x, y, { kind, ...more });
const keep = (r, x, y) => mark(r, 'keep', x, y);
const mass = (cw = 1, ch = 1) => { const r = room(cw, ch); rect(r, 0, 0, r.w - 1, r.h - 1); return r; };
// air kept from the rock's wear: every third column and every other row of a box, where it is open
const keeps = (r, x0, y0, x1, y1) => { for (let y = y0; y <= y1; y += 2) for (let x = x0; x <= x1; x += 3) if (r.tiles[y] && r.tiles[y][x] === EMPTY) keep(r, x, y); };
const water = (r, x, y, w, h, more) => mark(r, 'water', x, y, { w, h, ...more });
const breathes = (r, x, w, lo = DROWNED.low, hi = DROWNED.high) => water(r, x, lo, w, hi - lo, { key: 'breath' });
// the drain under the floors, from column x: knee-deep always, and full as soon as the water is over the floor (gain)
const drain = (r, x, w) => { water(r, x, 2, w, 3); water(r, x, 5, w, 3, { key: 'breath', gain: 6 }); };
const tide = (r, x, side, y = DROWNED.high) => deco(r, 'tidemark', x, y, { side });

function waterstair(){
  const r = mass(1, 2); rect(r, 2, 8, 37, 43, EMPTY);
  door(r, 'right', 25, 29); door(r, 'left', 8, 13);
  // the stairhead, level with the pool room's floor; the stair down from it, a tile a step; the floor at its foot
  rect(r, 35, 8, 37, 24); for (let x = 18; x <= 34; x++) rect(r, x, 8, x, x - 10);   // (the stair stands well back from the far wall: its ledge is not leapt to)
  rect(r, 24, 36, 37, 43); rect(r, 2, 36, 9, 43);                  // the vault comes down over the stairhead, and at the far wall
  // a ledge over the hall's door, four tiles over high water: only the top of the rise brings him to it, and then by a
  // leap out of the water and his hands. (Lower, it was leapt to from the stair)
  shelf(r, 'L', 5, 27); mark(r, 'windlass', 4, 28, { key: 'hall' }); deco(r, 'chain', 2, 14);
  // the drain, under all of it (the culvert): from the hall's floor to the shaft under the pool
  rect(r, 0, 2, 39, 6, EMPTY); drain(r, 0, 40); breathes(r, 0, 40);
  tide(r, 6, -1); tide(r, 28, 1);
  mark(r, 'torch', 36, 30); mark(r, 'torch', 29, 28); mark(r, 'torch', 12, 27); mark(r, 'crystal', 2, 28); mark(r, 'urn', 36, 25);
  keeps(r, 2, 8, 17, 34); keeps(r, 10, 14, 36, 34); keeps(r, 0, 2, 39, 6); for (let x = 18; x <= 34; x += 2) for (const d of [1, 3, 5]) keep(r, x, x - 10 + d);
  for (const x of [35, 37]) for (const y of [25, 27, 29]) keep(r, x, y);
  return r;
}
function drownedhall(){
  const r = mass(2, 2); rect(r, 2, 8, 77, 43, EMPTY);
  door(r, 'right', 8, 13); door(r, 'left', 24, 29); door(r, 'left', 8, 12);   // (the low one: the cells' sluice)
  // the two pools that never empty, cut in the floor
  rect(r, 14, 3, 22, 7, EMPTY); rect(r, 48, 3, 56, 7, EMPTY);
  // the galleries, where high water comes to: one on either wall
  shelf(r, 'L', 9, 23); shelf(r, 'R', 70, 23);
  // the drain in the floor, and the culvert east from it
  rect(r, 64, 2, 79, 6, EMPTY); rect(r, 64, 7, 67, 7, EMPTY);
  water(r, 14, 3, 9, 5); water(r, 48, 3, 9, 5); drain(r, 64, 16); breathes(r, 0, 80);
  tide(r, 11, -1); tide(r, 68, 1);
  for (const x of [11, 25, 39, 53, 67]) deco(r, 'column', x, 8, { h: 36 });
  for (const x of [8, 30, 39, 46, 60]) deco(r, 'mosaic', x, 8);
  mark(r, 'lamprey', 8, 22); mark(r, 'windlass', 71, 24, { key: 'cells' });
  for (const x of [15, 35, 55]) deco(r, 'chainh', x, 34); deco(r, 'chain', 70, 25); deco(r, 'chain', 3, 14);
  mark(r, 'torch', 5, 32); mark(r, 'torch', 74, 32); mark(r, 'crystal', 30, 8); mark(r, 'crystal', 60, 8); mark(r, 'crystal', 18, 3); mark(r, 'crystal', 52, 3); mark(r, 'crystal', 77, 24);   // (no flame where the water comes: the floor is lit by what grows in it)
  mark(r, 'urn', 75, 24); mark(r, 'urn', 4, 8); mark(r, 'urn', 33, 8); mark(r, 'urn', 44, 8); mark(r, 'chest', 73, 24, { holds: 'shards' }); mark(r, 'thread', 76, 25);
  keeps(r, 2, 8, 77, 22); keeps(r, 2, 24, 77, 30); keeps(r, 10, 23, 69, 23); keeps(r, 14, 3, 22, 7); keeps(r, 48, 3, 56, 7); keeps(r, 64, 2, 79, 7); 
  return r;
}
function keepcells(){
  const r = mass(1, 2), H = DROWNED.high;
  // in off the hall's gallery; the pit it looks into, sheer on both sides, and a wall hung in the middle of it from the
  // roof: there is no crossing it but under that wall, on the pit's floor, and then up the far side on the water
  door(r, 'right', H, H + 5); rect(r, 26, H, 39, H + 5, EMPTY);
  rect(r, 14, 8, 25, H + 5, EMPTY); rect(r, 19, 14, 20, H + 5);
  // at the pit's foot: a cell west, and east the passage to the sluice. Up the pit's east wall, two sills of its stone and
  // a cell off the first: the way back up to the way in (they are no help across: the hung wall is between)
  rect(r, 2, 8, 13, 12, EMPTY); rect(r, 26, 8, 39, 12, EMPTY);
  rect(r, 24, 13, 25, 13); rect(r, 24, 19, 25, 19); rect(r, 26, 14, 32, 18, EMPTY);
  // across the pit: the top cell, and the flue of cells over it, each cell's sill a step, one side and the other
  rect(r, 2, H, 13, H + 4, EMPTY); rect(r, 4, H + 5, 11, 45, EMPTY);
  for (const [x, y] of [[10, 29], [4, 35], [10, 41]]) rect(r, x, y, x + 1, y);
  water(r, 0, DROWNED.low, 40, H - DROWNED.low, { key: 'breath', held: 'cells' });
  tide(r, 15, -1); tide(r, 24, 1); deco(r, 'chain', 36, 8);
  mark(r, 'chest', 5, 8, { holds: 'shards' }); mark(r, 'urn', 29, 8); mark(r, 'urn', 31, 8); mark(r, 'urn', 8, H); mark(r, 'urn', 29, 14);
  mark(r, 'torch', 30, 27); mark(r, 'torch', 8, 27); mark(r, 'torch', 7, 38); mark(r, 'crystal', 9, 8); mark(r, 'crystal', 31, 14); mark(r, 'crystal', 16, 8); mark(r, 'crystal', 23, 8);
  keeps(r, 14, 8, 25, H + 5); keeps(r, 26, H, 39, H + 5); keeps(r, 26, 8, 39, 12); keeps(r, 2, 8, 13, 12); keeps(r, 26, 14, 32, 18); keeps(r, 2, H, 13, H + 4);
  for (let y = H + 5; y <= 45; y++) for (const x of [6, 8]) keep(r, x, y); for (const [x, y] of [[10, 29], [4, 35], [10, 41]]) for (const d of [1, 3, 5]) if (y + d < r.h){ keep(r, x, y + d); keep(r, x + 1, y + d); }
  return r;
}
function weir(){
  const r = mass(1, 2), B = DROWNED.weirHigh + 1;                  // the banks: a tile over its high water
  // up out of the cells through the west bank; the pond; the east bank, and three steps up from it to the cup room's door
  rect(r, 4, 0, 11, B - 1, EMPTY); rect(r, 4, 1, 5, 1); rect(r, 10, 7, 11, 7); rect(r, 4, 13, 5, 13);
  rect(r, 2, B, 37, 43, EMPTY); rect(r, 16, 2, 31, B - 1, EMPTY);
  rect(r, 35, B, 37, B + 2); rect(r, 37, B + 3, 37, B + 5); door(r, 'right', 25, 29);
  water(r, 16, DROWNED.weirLow, 16, DROWNED.weirHigh - DROWNED.weirLow, { key: 'breath' });
  tide(r, 17, -1, DROWNED.weirHigh); tide(r, 30, 1, DROWNED.weirHigh);
  mark(r, 'torch', 13, 23); mark(r, 'torch', 33, 23); mark(r, 'torch', 24, 30); mark(r, 'crystal', 24, 2); mark(r, 'urn', 20, 2); mark(r, 'urn', 28, 2);
  keeps(r, 2, B, 37, 32); keeps(r, 16, 2, 31, B - 1); for (let y = 0; y < B; y++) for (const x of [6, 8]) keep(r, x, y);
  for (const [x, y] of [[4, 1], [10, 7], [4, 13]]) for (const d of [1, 3, 5]) if (y + d < B + 5){ keep(r, x, y + d); keep(r, x + 1, y + d); }
  return r;
}
function cuproom(){
  const r = mass();
  // a low passage in from the weir, and the room itself: the cup on its plinth
  rect(r, 0, 2, 21, 7, EMPTY); rect(r, 22, 2, 37, 13, EMPTY);
  deco(r, 'plinth', 31, 2); deco(r, 'keepline', 23, 2, { says: 'WE KEPT IT. WE DID NOT CARRY IT UP.' });
  mark(r, 'chest', 34, 2, { holds: 'relic:cup' }); mark(r, 'windlass', 28, 2, { key: 'culvert' }); deco(r, 'chain', 26, 3);
  mark(r, 'torch', 6, 5); mark(r, 'torch', 24, 8); mark(r, 'torch', 36, 8); mark(r, 'crystal', 36, 2);
  keeps(r, 0, 2, 21, 7); keeps(r, 22, 2, 37, 13);
  return r;
}
function culvert(){
  const r = mass();
  // the drain's last stretch, and the shaft up into the pool: three rungs in it, and the boards in the pool's floor
  rect(r, 0, 2, 8, 6, EMPTY); rect(r, 3, 7, 6, 22, EMPTY); for (const y of [7, 13, 19]) ledge(r, 3, 6, y);
  drain(r, 0, 9); breathes(r, 3, 4);
  mark(r, 'torch', 7, 5);
  keeps(r, 0, 2, 8, 6); for (let y = 8; y <= 22; y++) if (![13, 19].includes(y)) for (const x of [4, 5]) keep(r, x, y);
  return r;
}

export const wing = { left: 4, down: 2, build(X){
  const st = X.roomOf('start'); if (!st) return;
  const more = { breath: true, wing: true };
  const stair = X.addRoom(-1, -1, named(waterstair), more), hall = X.addRoom(-3, -1, named(drownedhall), more), cells = X.addRoom(-4, -1, named(keepcells), more);
  // the gates, set in after the rock's wear: the hall's, in the stair's foot; the cells' sluice (it holds their water, and
  // holds it low until he first raises it); the grate in the hall's drain
  const gate = (R, x, y, w, h, key, more = {}) => { for (let b = y; b < y + h; b++) for (let a = x; a < x + w; a++) X.set(R.tx0 + a, R.ty0 + b, SLUICE); X.marks.push({ type: 'gate', x: R.tx0 + x, y: R.ty0 + y, w, h, key, ...more }); };
  gate(stair, 0, 8, 2, 6, 'hall'); gate(cells, 38, 8, 2, 5, 'cells', { holds: true, at: 0 }); gate(hall, 64, 7, 4, 1, 'culvert');
  X.addRoom(-4, 1, named(weir), more); X.addRoom(-3, 2, named(cuproom), { wing: true }); X.addRoom(0, -1, named(culvert), more);
  // the door in the pool room's west wall, at its floor (a row lower than most: the room's torch keeps its wall); and the boards in the pool's floor, over the culvert's shaft
  for (let y = st.ty0 + 2; y <= st.ty0 + 6; y++) for (let x = st.tx0; x < st.tx0 + 6; x++){ if (x >= st.tx0 + 2 && X.at(x, y) !== ROCK) break; X.set(x, y, EMPTY); }
  for (let x = st.tx0 + 3; x <= st.tx0 + 6; x++) X.set(x, st.ty0, LEDGE);
} };
export const QUIET = ['cuproom'];

// ---- what stands in it, painted (a 'deco' mark): x the middle, y the floor
export const decoDef = (px, PAL) => ({
  // where high water comes to: a pale line worn into the wall, and the green under it
  tidemark(g, x, y, r){ for (let k = 0; k < 18; k++){ const w = 2 + Math.floor(r() * 4); px(g, k % 3 ? '#8fd3c0' : '#c0cbdc', x - 9 + k, y, 1, 1); if (r() < 0.6) px(g, '#2f6f62', x - 9 + k, y + 1, 1, w); } },
  // a column of the hall, behind him: its shaft, a band every so often, its foot
  column(g, x, y){ const h = 36 * 8; for (let k = 0; k < h; k++){ px(g, PAL.ink, x - 7, y - 1 - k, 14, 1); px(g, k % 40 < 3 ? PAL.dark : PAL.deep, x - 6, y - 1 - k, 12, 1); px(g, PAL.dark, x - 6, y - 1 - k, 2, 1); if (k < 80) px(g, '#1f4f48', x - 6 + (k * 7) % 11, y - 1 - k, 1, 1); } px(g, PAL.ink, x - 10, y - 6, 20, 6); px(g, PAL.dark, x - 9, y - 5, 18, 4); px(g, PAL.mid, x - 9, y - 5, 18, 1); },
  // the floor's picture: small stones, people carrying water up a mountain on their shoulders
  mosaic(g, x, y, r){ const cols = ['#3e8948', '#0099db', '#c0cbdc', '#b86f50', '#feae34'];
    for (let i = -28; i < 28; i += 2) for (let j = 0; j < 3; j++) px(g, r() < 0.2 ? cols[Math.floor(r() * cols.length)] : j ? PAL.dark : PAL.mid, x + i, y + 1 + j * 2, 2, 2);
    for (let k = 0; k < 4; k++){ const fx = x - 21 + k * 13, up = k * 1; px(g, '#c0cbdc', fx, y + 2 - up, 2, 3); px(g, '#0099db', fx - 2, y + 1 - up, 6, 1); px(g, '#2ce8f5', fx - 2, y + 2 - up, 1, 1); px(g, '#2ce8f5', fx + 3, y + 2 - up, 1, 1); } },
  // a chain on the wall, from a windlass to its gate: ten tiles of it upright, or twenty along
  chain(g, x, y){ for (let k = 0; k < 80; k += 4){ px(g, PAL.ink, x - 2, y - k - 4, 4, 4); px(g, k % 8 ? PAL.light : PAL.mid, x - 1, y - k - 3, 2, 2); } },
  chainh(g, x, y){ for (let k = -80; k < 80; k += 4){ const sag = Math.round(3 * Math.cos(k / 80 * Math.PI / 2 * 2)); px(g, PAL.ink, x + k, y - 4 + sag, 4, 4); px(g, k % 8 ? PAL.light : PAL.mid, x + k + 1, y - 3 + sag, 2, 2); } },
  // where the cup stood: a plinth, with nothing on it
  plinth(g, x, y){ px(g, PAL.ink, x - 7, y - 12, 14, 12); px(g, PAL.mid, x - 6, y - 11, 12, 10); px(g, PAL.light, x - 6, y - 11, 12, 1); px(g, PAL.ink, x - 9, y - 14, 18, 3); px(g, PAL.pale, x - 8, y - 13, 16, 1); px(g, PAL.ink, x - 9, y - 2, 18, 2); px(g, '#2f6f62', x - 3, y - 13, 6, 1); },
  // a line cut in the wall, in the keepers' hand (main.js says it when he stands by it)
  keepline(g, x, y, r){ px(g, PAL.ink, x - 15, y - 26, 30, 11); px(g, PAL.dark, x - 14, y - 25, 28, 9); for (let k = 0; k < 3; k++) for (let i = 0; i < 24; i += 2 + Math.floor(r() * 3)) px(g, PAL.pale, x - 12 + i, y - 23 + k * 3, 1 + Math.floor(r() * 2), 1); },
});

// ---- what is in it that is not rock: the windlasses
const three = () => { const T3 = typeof window !== 'undefined' && window.THREE; return T3 && T3.Group && T3.CanvasTexture && typeof document !== 'undefined' ? T3 : null; };
const pix = (T3, w, h, paint) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); paint((col, x, y, ww, hh) => { g.fillStyle = col; g.fillRect(x, y, ww, hh); }); const t = new T3.CanvasTexture(c); t.magFilter = t.minFilter = T3.NearestFilter; t.generateMipmaps = false; return t; };
const mesh = (T3, map, w, h) => new T3.Mesh(new T3.PlaneGeometry(w, h), new T3.MeshBasicMaterial({ map, transparent: true, alphaTest: 0.5 }));
let TEX = null;
const texes = T3 => TEX || (TEX = {
  // its frame: two stone posts and a sill; and its drum, with four handspikes, seen end on
  frame: pix(T3, 18, 16, f => { f('#181425', 0, 0, 5, 16); f('#181425', 13, 0, 5, 16); f('#5a6988', 1, 1, 3, 15); f('#5a6988', 14, 1, 3, 15); f('#8b9bb4', 1, 1, 1, 15); f('#8b9bb4', 14, 1, 1, 15); f('#181425', 0, 13, 18, 3); f('#3a4466', 1, 14, 16, 2); }),
  drum: pix(T3, 14, 14, f => { for (let y = 0; y < 14; y++) for (let x = 0; x < 14; x++){ const d = Math.hypot(x - 6.5, y - 6.5); if (d < 4.6) f(d > 3.4 ? '#181425' : d > 1.4 ? '#b86f50' : '#733e39', x, y, 1, 1); } f('#181425', 6, 0, 2, 14); f('#181425', 0, 6, 14, 2); f('#c0cbdc', 6, 0, 2, 3); f('#c0cbdc', 6, 11, 2, 3); f('#c0cbdc', 0, 6, 3, 2); f('#c0cbdc', 11, 6, 3, 2); }),
});
export const enemies = {
  // a windlass: struck, its gate goes up; struck again, it comes down. Not a creature
  windlass: { ai: 'windlass', own: true, prop: true, hp: 99, w: 0.6, h: 1.4, color: 0xb86f50, fly: false, guard(e){ e.struck = true; return true; }, onHit(e){ e.hp = e.d.hp; e.struck = true; } },
};
export const ai = {
  windlass(e, P, dt, c){
    const m = e.mk || {}; e.st = 'idle'; e.cool = Math.max(0, (e.cool || 0) - dt);
    if (e.struck){ e.struck = false; if (e.cool <= 0){ e.cool = 0.8; c.events.push({ type: 'windlass', e, key: m.key, at: { x: e.x, y: e.y + 1 } }); } }
    const T3 = three(); if (!T3) return;
    if (!e.g){ const X = texes(T3), g = new T3.Group(), fr = mesh(T3, X.frame, 18 / 16, 1), dr = mesh(T3, X.drum, 14 / 16, 14 / 16); fr.position.y = 0.5; dr.position.set(0, 0.62, 0.001); g.add(fr); g.add(dr); g.position.set(e.x, e.y, 0.04); c.E.scene.add(g); e.g = g; e.dr = dr; }
    const up = c.RULE.gates.has(m.key); e.dr.rotation.z += (e.cool > 0 ? dt * 9 * (up ? -1 : 1) : 0); e.dr.material.color.setHex(e.flash > 0 ? 0xffffff : up ? 0xffffff : 0xb8bfd0);
  },
};
