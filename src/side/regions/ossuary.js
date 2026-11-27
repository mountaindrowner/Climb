// The Ossuary: the Roots' wing, east of the climb (docs/world.md). The house laid its dead here, as near the water as it
// could, because it was said the water gives back; when the dark came there were more dead than room, and the house sent
// sextons down to sort them and count them, and they are counting still. Built into the Roots (level.js lays these rooms
// beside the climb's), worn in the Cloister's look (the house built it), and closed by cracked stone at the foot of the
// well until the Warden's weight breaks it: `gate: 'breaker'` on every room, and the tests check none of it can be
// reached before the gate and all of it after.
//   aisle     the long aisle: the door's side, niches in the walls, the Tallymen at their count
//   sorting   off the niches' foot: the bones sorted by kind, in heaps
//   niches    a climb up a wall of niches, grave-lights in it
//   yard      the Sexton's yard: the elite, who buries what moves
//   count     his own count, kept on the wall by someone else; the relic. Its west end is the deadhouse stair, up to a door
//             over the Warden's hall: the way back, from this side only
// Its scales (build 113; docs/bare-wings-sheet.md): the sextons weigh what they count. A door here is a grave-slab hung on
// a chain, and the chain comes down somewhere else to the pan of a scale. Weight in the pan, and the slab goes up: his
// own, while he stands in it; or a stack of the sorted, knocked off the ledge over the pan, which stays. A Tallyman that
// comes to a pan with bones in it carries them back up, a piece at a time, and the slab comes down by as much.
//   yard    the slab in the way from the niches to the Sexton's yard. Its pan: in the sorting room, on the low heap
//   count   the slab across the hole from the yard up to the count. Its pan: in the niches, on the third shelf
import { room, rect, walls, door, ledge, mark, stairs, shelf, pier, hung, SLUICE } from '../rooms.js';

const TITLE = 'THE OSSUARY';
const wing = fn => { const f = () => { const r = fn(); r.title = TITLE; r.gate = 'breaker'; return r; }; Object.defineProperty(f, 'name', { value: fn.name }); return f; };

function aisle(){
  const r = room(2, 1); walls(r); door(r, 'left', 2, 6); door(r, 'top', 72, 77);   // in from the well; up into the niches
  // the walls are niches, floor to roof, a candle in every tenth; the aisle floor heaped where the sorting spilled over.
  // Nothing hangs in the air here (the map pass): two ribs of the vault come down from the roof, and two stacks of the
  // sorted stand on the floor, a heap beside each to step up by
  for (const x of [10, 34]) { hung(r, x, x + 3, 14); mark(r, 'torch', x + 1, 11); }
  for (const x of [22, 46]) { pier(r, x, x + 3, 5); mark(r, 'torch', x + 1, 12); }
  rect(r, 16, 2, 18, 3); rect(r, 40, 2, 43, 4);                                     // heaps of bones
  // at its east end the house's stair, up against the wall; from its head a step of the masonry under the hole in
  // the roof, and up into the niches
  stairs(r, 66, 2, 12, 1, 1); hung(r, 66, 71, 17, 74, 2);
  mark(r, 'acolyte', 28, 2); mark(r, 'acolyte', 52, 2); mark(r, 'wisp', 30, 12); mark(r, 'wisp', 62, 12);
  mark(r, 'urn', 9, 2); mark(r, 'urn', 41, 5); mark(r, 'urn', 60, 2); mark(r, 'crystal', 12, 2); mark(r, 'chest', 67, 4, { holds: 'shards' });
  mark(r, 'chest', 5, 2, { holds: 'thread' }); mark(r, 'crystal', 3, 2);   // just inside the door, lit: seen from the well's foot before the wall can be broken
  mark(r, 'torch', 58, 12);
  return r;
}
function sorting(){
  const r = room(); walls(r); door(r, 'right', 2, 7);
  // the bones sorted: skulls with skulls, long bones with long bones, each heap the height of the one who sorted it
  rect(r, 2, 2, 8, 5); rect(r, 12, 2, 15, 3); rect(r, 19, 2, 23, 6); rect(r, 27, 2, 29, 3);   // (the first against the wall: no slot behind it to be caught in)
  shelf(r, 'L', 12, 11, 1);                                                           // the shelf the counted ones go up on
  mark(r, 'acolyte', 25, 2); mark(r, 'acolyte', 10, 2);
  // the yard's scale: its pan on the low heap, the stack on the lip of the shelf over it, a chain up the wall between
  mark(r, 'pan', 14, 4, { key: 'yard' }); mark(r, 'bonestack', 11, 12, { key: 'yard' }); mark(r, 'deco', 16, 5, { kind: 'panchain' });
  mark(r, 'torch', 10, 15); mark(r, 'torch', 30, 9); mark(r, 'crystal', 13, 4);
  mark(r, 'urn', 6, 6); mark(r, 'urn', 28, 4); mark(r, 'chest', 21, 7, { holds: 'thread' });
  return r;
}
function niches(){
  const r = room(1, 2); walls(r); door(r, 'bottom', 32, 37);                        // the hole up from the aisle
  door(r, 'left', 2, 7); door(r, 'left', 25, 30);                                   // to the sorting; to the yard
  // the wall of niches up the right side, a light in each that is still lit. The lower two are deep enough to stand
  // in, and across from them shelves stand out of the west wall: the climb is from one side to the other
  pier(r, 17, 20, 4);                                                              // (clear of the shelf over it: he has to be able to step off it under that shelf)
  shelf(r, 'R', 25, 8); shelf(r, 'L', 20, 13); shelf(r, 'R', 25, 19); shelf(r, 'L', 20, 24);   // five or six rows from each to the next, four clear tiles between lips; the last is the step through to the yard
  mark(r, 'crystal', 36, 9); mark(r, 'crystal', 36, 20);
  for (const y of [26, 32, 38]) { rect(r, 35, y, 37, y); mark(r, 'crystal', 36, y + 1); }
  // the count's scale: its pan on the third shelf, the stack in the niche over it
  mark(r, 'pan', 31, 20, { key: 'count' }); mark(r, 'bonestack', 35, 27, { key: 'count' }); mark(r, 'deco', 28, 21, { kind: 'panchain' });
  mark(r, 'shrine', 7, 25);                                                         // a flame kept here, before the Sexton's yard
  mark(r, 'wisp', 22, 30); mark(r, 'wisp', 28, 39); mark(r, 'flitter', 12, 36);
  mark(r, 'torch', 6, 15); mark(r, 'torch', 30, 24); mark(r, 'torch', 10, 40); mark(r, 'urn', 9, 25);
  return r;
}
function yard(){
  const r = room(); walls(r); door(r, 'right', 2, 7); door(r, 'top', 34, 37);      // in from the niches; up to the count
  // the yard is flat, the graves in it filled and trodden level: he digs, and he will not trip on his own work. The way
  // up is his ladder, in a flue in the corner over the door: rungs from side to side
  rect(r, 32, 7, 33, 20);
  for (const y of [7, 11, 15, 19]) ledge(r, 34, 37, y);
  mark(r, 'sexton', 18, 3);
  mark(r, 'torch', 20, 10); mark(r, 'torch', 28, 10); mark(r, 'urn', 4, 2);
  return r;
}
function count(){
  const r = room(2, 1); walls(r); door(r, 'bottom', 34, 37);                        // up from the yard
  // the deadhouse stair, up to a door high in the west wall, which lets out above the Warden's hall: the way back, one way
  stairs(r, 21, 2, 8, -1, 2); rect(r, 2, 0, 7, 9); door(r, 'left', 10, 15);
  // the long wall of the count, a candle every few paces along it; the relic at its end, where the count stops
  for (const x of [20, 32, 44, 56, 68]) mark(r, 'torch', x, 9);
  rect(r, 72, 2, 77, 3);                                                            // a step up to where it ends
  mark(r, 'chest', 74, 4, { holds: 'relic:stylus' }); mark(r, 'crystal', 40, 2); mark(r, 'urn', 28, 2); mark(r, 'urn', 60, 2); mark(r, 'urn', 4, 10);
  return r;
}

export const LAYOUT = [[4, 2, wing(aisle), 2, 1], [4, 3, wing(sorting)], [5, 3, wing(niches), 1, 2], [4, 4, wing(yard)], [4, 5, wing(count), 2, 1]];
export const QUIET = ['aisle', 'count'];
export const LOOKS = { aisle: 'cloister', sorting: 'cloister', niches: 'cloister', yard: 'cloister', count: 'cloister' };

// the slabs, set in after the rock's wear (level.js WINGS): the yard's in the niches' west door, the count's across the
// hole in the yard's roof
export const after = { build(X){
  const ni = X.roomOf('niches'), ya = X.roomOf('yard'); if (!ni || !ya) return;
  const gate = (R, x, y, w, h, key) => { for (let b = y; b < y + h; b++) for (let a = x; a < x + w; a++) X.set(R.tx0 + a, R.ty0 + b, SLUICE); X.marks.push({ type: 'gate', x: R.tx0 + x, y: R.ty0 + y, w, h, key }); };
  gate(ni, 0, 25, 2, 6, 'yard'); gate(ya, 34, 22, 4, 1, 'count');
} };

// ---- what stands in it, painted (a 'deco' mark)
export const decoDef = (px, PAL) => ({
  // the chain of a scale, up the wall from beside its pan
  panchain(g, x, y){ for (let k = 0; k < 96; k += 4){ px(g, PAL.ink, x - 2, y - k - 4, 4, 4); px(g, k % 8 ? PAL.light : PAL.mid, x - 1, y - k - 3, 2, 2); } },
});

// ---- the scales: a pan, and the stack over it
const three = () => { const T3 = typeof window !== 'undefined' && window.THREE; return T3 && T3.Group && T3.CanvasTexture && typeof document !== 'undefined' ? T3 : null; };
const pix = (T3, w, h, paint) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); paint((col, x, y, ww, hh) => { g.fillStyle = col; g.fillRect(x, y, ww, hh); }); const t = new T3.CanvasTexture(c); t.magFilter = t.minFilter = T3.NearestFilter; t.generateMipmaps = false; return t; };
const mesh = (T3, map, w, h) => new T3.Mesh(new T3.PlaneGeometry(w, h), new T3.MeshBasicMaterial({ map, transparent: true, alphaTest: 0.5 }));
let TEX = null;
const texes = T3 => TEX || (TEX = {
  // the pan: a shallow dish of bronze on three short chains; a piece of the sorted: a skull, seen from the side
  pan: pix(T3, 30, 12, f => { f('#181425', 1, 6, 28, 5); f('#b86f50', 2, 7, 26, 3); f('#feae34', 3, 7, 24, 1); f('#733e39', 4, 9, 22, 1); for (const x of [3, 14, 26]){ f('#181425', x, 0, 2, 7); f('#8b9bb4', x, 0, 1, 6); } }),
  bone: pix(T3, 10, 8, f => { f('#181425', 1, 0, 8, 7); f('#181425', 0, 2, 10, 4); f('#ead4aa', 2, 1, 6, 5); f('#ead4aa', 1, 2, 8, 3); f('#fff2d0', 2, 1, 4, 1); f('#181425', 6, 3, 2, 2); f('#181425', 3, 6, 1, 1); f('#181425', 5, 6, 1, 1); f('#b86f50', 2, 5, 3, 1); }),
});
const PAN = { pieces: 3, reach: 0.9, take: 2.5, near: 1.4 };
export { PAN };
const bones = (e, c, T3, n, at) => { e.bones = e.bones || []; while (e.bones.length < PAN.pieces){ const m = mesh(T3, texes(T3).bone, 10 / 16, 8 / 16); c.E.scene.add(m); e.bones.push(m); }
  e.bones.forEach((m, k) => { m.visible = k < n; const [x, y] = at(k); m.position.set(x, y, 0.045 + k * 0.0005); }); };
export const enemies = {
  // a pan of a scale: not struck, not a creature. What is on it lifts its slab
  pan: { ai: 'pan', own: true, prop: true, harmless: true, hp: 99, w: 0.9, h: 0.4, color: 0xb86f50, fly: false },
  // the stack of the sorted on the ledge over a pan: struck, what is on the ledge goes over into the pan
  bonestack: { ai: 'bonestack', own: true, prop: true, hp: 99, w: 0.5, h: 1.3, color: 0xead4aa, fly: false, guard(e){ e.struck = true; return true; }, onHit(e){ e.hp = e.d.hp; e.struck = true; } },
};
export const ai = {
  pan(e, P, dt, c){
    const key = (e.mk || {}).key, load = c.RULE.pan[key] || 0; e.st = 'idle';
    // his own weight: while he stands in it, it is as if it were full. It is not kept: he steps off, and it is gone
    const on = !!P.grounded && Math.abs(P.x - e.x) < PAN.reach && Math.abs(P.y - e.y) < 0.45, eff = on ? PAN.pieces : load;
    if (e.eff !== eff){ const first = e.eff == null; e.eff = eff; if (!first || eff) c.events.push({ type: 'pan', key, load, eff, kept: false, at: { x: e.x, y: e.y } }); }
    // a Tallyman at a pan with bones in it takes them back, a piece at a time
    const taker = load > 0 && c.E.list.some(q => q.alive && q.type === 'acolyte' && Math.abs(q.x - e.x) < PAN.near && Math.abs(q.y - e.y) < 1.6);
    e.take = taker ? (e.take || 0) + dt : 0; if (e.take >= PAN.take){ e.take = 0; e.eff = on ? PAN.pieces : load - 1; c.events.push({ type: 'pan', key, load: load - 1, eff: e.eff, by: 'tally', at: { x: e.x, y: e.y } }); }
    const T3 = three(); if (!T3) return;
    if (!e.g){ const m = mesh(T3, texes(T3).pan, 30 / 16, 12 / 16); c.E.scene.add(m); e.g = m; }
    e.g.position.set(e.x, e.y + 0.3 - (eff ? 0.12 : 0), 0.04);
    bones(e, c, T3, load, k => [e.x + (k - 1) * 0.5, e.y + 0.52 - (eff ? 0.12 : 0)]);
  },
  bonestack(e, P, dt, c){
    const key = (e.mk || {}).key, left = PAN.pieces - (c.RULE.pan[key] || 0); e.st = 'idle'; e.cool = Math.max(0, (e.cool || 0) - dt);
    if (e.struck){ e.struck = false; if (left > 0 && e.cool <= 0){ e.cool = 0.6; c.events.push({ type: 'pan', key, load: PAN.pieces, eff: PAN.pieces, fell: true, at: { x: e.x, y: e.y + 0.6 } }); } }
    const T3 = three(); if (!T3) return;
    bones(e, c, T3, left, k => [e.x + (k % 2 ? 0.08 : -0.08), e.y + 0.25 + k * 0.42]);
  },
};
