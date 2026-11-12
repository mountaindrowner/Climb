// The Tempest: the fourth region. Over the Spires' high pass the mountain goes up into the storm that wraps it: black
// cloud, rain driven sideways, fins of dark slate, and bolted to them the wreck of an old climbing works (planks, chains,
// lightning rods). Nothing is filled in: the rock is what each room draws, the rest is sky. What it asks for is the
// scarf: rising air (updrafts) carries him up the faces of the pillars, and he glides from one to the next.
//   landing   the cave he comes up into; a first breath of rising air, up to a shelf
//   rigging   the foot of the works: a squall to get behind, a crevasse, and the air up the first pillar
//   anchorage a hung deck over the rigging, for those who try the other column
//   stacks    two pillars and the air between them; more of it, higher, for what is on top
//   gantry    the broken bridge back to the mountain, under the clouds that hunt him
//   watch     the lamplighter's cave, and a shrine
//   flue      a shaft climbed on two columns of air, with lightning loose in it
//   crossing  pillar to pillar over the drop, each taller than the last; the old deck far below catches a fall
//   masthead  the last shelter, a shrine, the way up
//   gale      the top of the storm, where the Thunderhead is
import { room, rect, walls, door, ledge, mark, open, cave, EMPTY, SPIKES, CRACKED } from '../rooms.js';

// rising air, and the space it needs kept: the wear on the rock (level.js, organic) keeps clear of markers, so a column
// of air is given a ladder of them (type 'keep', which nothing draws), up past its top to where he bobs
function air(r, x, y, w, h){
  mark(r, 'updraft', x, y, { w, h });
  for (let j = y + 1; j <= y + h + 7 && j < r.h - 1; j += 4) for (const i of [x, x + w - 1]) if (r.tiles[j][i] !== 1 && r.tiles[j + 1][i] !== 1) mark(r, 'keep', i, j);
}
// ---- rock that is only there to be the mountain (not rooms)
const filler = draw => { const r = room(); draw(r); r.filler = true; return r; };
function bluff(){ return filler(r => { rect(r, 0, 0, 39, 22); }); }                                                                         // the mountain, between the landing and the watch
function buttress(){ return filler(r => { rect(r, 0, 13, 39, 22); rect(r, 0, 6, 26, 12); rect(r, 0, 0, 11, 5); }); }                       // under the old deck, out from the mountain
function corbel(){ return filler(r => { rect(r, 0, 17, 39, 22); rect(r, 0, 12, 22, 16); }); }
function anvil(){ return filler(r => { rect(r, 0, 15, 39, 22); rect(r, 14, 7, 39, 14); rect(r, 28, 0, 39, 6); }); }                         // under the summit, leaning out from the masthead
function cap(){ return filler(r => { rect(r, 0, 0, 30, 5); rect(r, 0, 6, 20, 10); rect(r, 0, 11, 9, 15); }); }                             // the top of the mountain's shoulder, over the flue

function landing(){
  const r = cave(); door(r, 'right', 2, 7);
  rect(r, 2, 2, 4, 3);
  ledge(r, 29, 35, 11);                                           // a shelf: the first rising air goes up to it
  air(r, 24, 2, 5, 10);
  mark(r, 'spawn', 7, 2); mark(r, 'npc', 13, 2, { who: 'scribe' }); mark(r, 'chest', 33, 12, { holds: 'shards' });
  mark(r, 'urn', 18, 2); mark(r, 'urn', 20, 2);
  mark(r, 'torch', 5, 8); mark(r, 'torch', 22, 7); mark(r, 'torch', 36, 9); mark(r, 'crystal', 16, 2); mark(r, 'crystal', 31, 2);
  return r;
}
function rigging(){
  const r = open(2, 1);
  rect(r, 0, 0, 79, 1); rect(r, 0, 8, 3, 22);                     // the ground; the cliff over the cave's mouth
  rect(r, 22, 0, 29, 1, EMPTY); rect(r, 22, 0, 29, 0, SPIKES);    // a crevasse: a long jump, or a short glide
  rect(r, 8, 2, 10, 3);
  rect(r, 50, 8, 53, 22); rect(r, 70, 2, 79, 22);                 // the first pillar (he walks under its foot), and the great fin
  ledge(r, 34, 40, 6); ledge(r, 17, 21, 12);                      // what is left of a scaffold; a plank under the anchorage (a way down from it)
  air(r, 12, 2, 5, 26);                     // up to the anchorage
  air(r, 64, 2, 5, 24);                     // up the fin, to the stacks
  mark(r, 'squall', 44, 2); mark(r, 'nimbus', 57, 7); mark(r, 'harpy', 32, 13); mark(r, 'spark', 38, 10);
  mark(r, 'urn', 18, 2); mark(r, 'urn', 47, 2); mark(r, 'urn', 61, 2); mark(r, 'urn', 37, 7);
  mark(r, 'torch', 6, 3); mark(r, 'torch', 32, 3); mark(r, 'torch', 60, 3); mark(r, 'crystal', 20, 2); mark(r, 'crystal', 42, 2); mark(r, 'crystal', 69, 2);
  return r;
}
function anchorage(){
  const r = open();
  rect(r, 0, 0, 3, 22);                                           // the mountain's face
  rect(r, 6, 3, 7, 7); rect(r, 31, 3, 32, 7); ledge(r, 8, 30, 3);   // a deck hung between two stubs of rock
  ledge(r, 24, 28, 9);
  mark(r, 'squall', 20, 4); mark(r, 'nimbus', 14, 8);
  mark(r, 'chest', 10, 4, { holds: 'shards' }); mark(r, 'thread', 26, 10); mark(r, 'torch', 29, 5);
  return r;
}
// two screens tall: the fin on the right, a pillar on the left, planks between, and air to ride up each
function stacks(){
  const r = open(1, 2);
  rect(r, 30, 0, 39, 40); rect(r, 10, 0, 13, 24);                 // the fin's upper half; the pillar
  ledge(r, 14, 29, 1);                                            // the walkway the first column lifts him through
  ledge(r, 0, 9, 24);                                             // from the pillar's top out to the gantry
  ledge(r, 21, 29, 21);                                           // higher: a plank against the fin, and air up to its top
  air(r, 15, 2, 5, 24);
  air(r, 23, 22, 5, 20);
  mark(r, 'nimbus', 24, 6); mark(r, 'spark', 22, 11); mark(r, 'harpy', 20, 33);
  mark(r, 'chest', 36, 41, { holds: 'shards' }); mark(r, 'urn', 33, 41);
  mark(r, 'torch', 28, 3); mark(r, 'torch', 11, 26); mark(r, 'torch', 31, 42); mark(r, 'crystal', 12, 25); mark(r, 'crystal', 38, 41);
  return r;
}
function gantry(){
  const r = open();
  rect(r, 0, 0, 3, 1); rect(r, 0, 8, 2, 22);                      // the sill of the watch's door, the face above it
  ledge(r, 33, 39, 1); ledge(r, 23, 29, 1); ledge(r, 13, 19, 1); ledge(r, 5, 9, 1); ledge(r, 4, 4, 1);   // the bridge, broken
  mark(r, 'npc', 16, 2, { who: 'wren' });
  mark(r, 'nimbus', 27, 8); mark(r, 'nimbus', 9, 9); mark(r, 'harpy', 20, 13); mark(r, 'spark', 31, 7);
  mark(r, 'torch', 2, 4); mark(r, 'torch', 18, 3);
  return r;
}
function watch(){
  const r = cave(); door(r, 'right', 2, 7); door(r, 'top', 8, 14);
  rect(r, 21, 2, 31, 2); rect(r, 23, 3, 29, 3);                   // the shrine's step
  [[10, 16, 5], [16, 22, 9], [10, 16, 13], [8, 14, 17], [8, 14, 21]].forEach(([a, b, y]) => ledge(r, a, b, y));
  mark(r, 'shrine', 26, 4); mark(r, 'npc', 34, 2, { who: 'lamplighter' }); mark(r, 'urn', 5, 2);
  mark(r, 'torch', 34, 9); mark(r, 'torch', 5, 9); mark(r, 'torch', 26, 14); mark(r, 'crystal', 36, 2); mark(r, 'crystal', 4, 2);
  return r;
}
// two screens tall: up the chimney beside the rock on the first column, across the shelf, up the second to the door
function flue(){
  const r = cave(1, 2); door(r, 'bottom', 8, 14); ledge(r, 8, 14, 1); door(r, 'right', 38, 43);
  rect(r, 30, 2, 37, 35);                                         // the rock the chimney runs beside
  rect(r, 2, 19, 23, 20);                                         // the shelf
  rect(r, 24, 36, 37, 37);                                        // the landing by the door
  ledge(r, 26, 29, 20);                                           // a plank in the chimney, under what is cracked
  rect(r, 32, 21, 36, 26, EMPTY); rect(r, 30, 21, 31, 25, CRACKED);   // a hollow in the rock, walled up
  air(r, 24, 2, 5, 22);
  air(r, 16, 21, 5, 18);
  mark(r, 'chest', 34, 21, { holds: 'relic:stormglass' });
  mark(r, 'spark', 26, 9); mark(r, 'wraith', 8, 8); mark(r, 'wraith', 9, 28); mark(r, 'nimbus', 6, 25);
  mark(r, 'urn', 4, 21); mark(r, 'torch', 4, 9); mark(r, 'torch', 21, 9); mark(r, 'torch', 4, 28); mark(r, 'torch', 33, 40); mark(r, 'crystal', 18, 2); mark(r, 'crystal', 12, 21); mark(r, 'crystal', 28, 38);
  return r;
}
// two screens wide and two tall: pillars like steps, air up the face of each, and the old deck under it all
function crossing(){
  const r = open(2, 2);
  rect(r, 0, 0, 79, 1);                                           // the deck: it catches a fall
  rect(r, 0, 13, 5, 14);                                          // the sill of the flue's door
  ledge(r, 12, 19, 13); rect(r, 20, 8, 23, 27);                   // a plank, and the pillar it is bolted to
  ledge(r, 30, 37, 23); rect(r, 38, 8, 41, 35);
  ledge(r, 48, 55, 31); rect(r, 56, 8, 59, 39);
  ledge(r, 66, 76, 37); rect(r, 77, 8, 79, 45);                   // the last plank, under the masthead's door
  rect(r, 70, 7, 79, 9); rect(r, 78, 2, 79, 6); rect(r, 72, 2, 73, 6, CRACKED);   // on the deck, at its far end: something walled up
  air(r, 6, 2, 5, 14);                      // back up to the sill
  air(r, 13, 14, 5, 16);
  air(r, 31, 2, 5, 22);                     // from the deck up to the second plank
  air(r, 32, 24, 5, 14);
  air(r, 50, 32, 5, 10);
  air(r, 70, 38, 5, 10);
  mark(r, 'thread', 75, 2);
  mark(r, 'nimbus', 34, 30); mark(r, 'nimbus', 52, 38); mark(r, 'harpy', 26, 32); mark(r, 'harpy', 44, 40); mark(r, 'spark', 28, 26); mark(r, 'spark', 62, 40); mark(r, 'wraith', 64, 30);
  mark(r, 'squall', 26, 2); mark(r, 'squall', 52, 2); mark(r, 'spark', 44, 4);
  mark(r, 'chest', 60, 2, { holds: 'shards' }); mark(r, 'urn', 16, 2); mark(r, 'urn', 46, 2); mark(r, 'urn', 66, 2);
  mark(r, 'torch', 2, 17); mark(r, 'torch', 18, 3); mark(r, 'torch', 40, 3); mark(r, 'torch', 64, 3); mark(r, 'torch', 22, 29); mark(r, 'torch', 40, 37); mark(r, 'torch', 58, 41); mark(r, 'crystal', 10, 2); mark(r, 'crystal', 36, 2); mark(r, 'crystal', 56, 2);
  return r;
}
function masthead(){
  const r = cave(); door(r, 'bottom', 30, 36); ledge(r, 30, 36, 1); door(r, 'top', 30, 36);
  rect(r, 8, 2, 18, 2); rect(r, 10, 3, 16, 3);                    // the shrine's step
  [[22, 28, 5], [30, 36, 9], [24, 30, 13], [30, 36, 17], [30, 36, 21]].forEach(([a, b, y]) => ledge(r, a, b, y));
  mark(r, 'shrine', 13, 4); mark(r, 'urn', 5, 2); mark(r, 'urn', 21, 2);
  mark(r, 'torch', 5, 9); mark(r, 'torch', 20, 9); mark(r, 'torch', 34, 6); mark(r, 'torch', 26, 16); mark(r, 'crystal', 3, 2); mark(r, 'crystal', 24, 2);
  return r;
}
// the top of the storm: a long bare stage of slate, a horn of rock at either end, and the cloud over it
function gale(){
  const r = open(2, 2);
  rect(r, 0, 0, 79, 1); rect(r, 70, 0, 76, 1, EMPTY); ledge(r, 70, 76, 1);   // the stage, the way up through it
  rect(r, 0, 2, 3, 24); rect(r, 77, 2, 79, 20);
  mark(r, 'boss', 36, 2); mark(r, 'exit', 8, 2);
  mark(r, 'torch', 6, 3); mark(r, 'torch', 66, 3);
  return r;
}

// ---- its look: dark slate, wet along its tops; iron and old wood; the sky as it was painted
const themeDef = {
  stone: { edge: 'ink', topEdge: 'pale', lip: 'light', lip2: 'mid', lipD: 2, lip2D: 4, a: 'dark', aSeam: 'deep', b: 'deep', bSeam: 'ink', c: 'deep', core: 'ink', seam: 'strata', band: [9, 13, 17] },
  moss: { c: ['navy', 'blue', 'navy'], p: 0.1 }, plank: ['wood1', 'light', 'wood0', 'wood2'], spike: ['light', 'white'],
  ceilLow: [['chain', 5], ['hook', 4], ['stalactite', 2]], ceil: [['chain', 30], ['hook', 22], ['tatter', 18], ['lantern', 12], ['stalactite', 16]],
  floorWall: ['rod', 'crate', 'coil', 'rubble', 'cairn', 'rod'], floorOpen: ['rod', 'crate', 'rubble', 'coil'], gem: 'stormlamp',
  back: { cols: ['ink', 'deep', 'dark'], dim: [0.8, 0.84, 1], hole: 8.5, holeOpen: 2.1, stand: [['scaffold', 6], ['pillar', 2]], hang: [['chain', 60], ['stalactite', 25], ['tatter', 15]], pStand: 0.014, pHang: 0.03 },
  far: { img: 'tempest', raw: true }, hemi: [0xe6eeff, 0x8a9ac8, 0.96], shaft: null, bloom: [0.82, 0.7],
  amb: [0.7, 0.76, 0.95], ambIn: [0.5, 0.54, 0.7], mist: { col: 'dark', col2: 'deep', a: 0.36, drift: 2.4 }, fore: 'roots',
  air: { n: 50, cols: [0xdfe8ff, 0x9fc0ff], warm: 0.4, vx: 0.6, vy: [-6, -3], drift: -2.6, steady: true },
};
// the works' own things: (x, y) is the foot of what stands, the top of what hangs
const deco = (px, PAL) => ({
  // a lightning rod: an iron mast, braced, a ball at its tip
  rod(g, x, y, r){ const h = 13 + Math.floor(r() * 9);
    px(g, PAL.ink, x - 1, y - h - 1, 3, h + 1); px(g, PAL.mid, x, y - h, 1, h); px(g, PAL.light, x, y - h, 1, 3);
    px(g, PAL.ink, x - 2, y - h - 4, 5, 4); px(g, PAL.pale, x - 1, y - h - 3, 3, 2); px(g, PAL.white, x - 1, y - h - 3, 1, 1);
    for (let k = 0; k < 4; k++){ px(g, PAL.ink, x - 1 - k, y - 5 + k, 1, 2); px(g, PAL.dark, x + 1 + k, y - 4 + k, 1, 1); }
    px(g, PAL.ink, x - 3, y - 1, 7, 1); },
  crate(g, x, y, r){ const w = 7 + Math.floor(r() * 3), h = 6 + Math.floor(r() * 2), x0 = x - Math.floor(w / 2);
    px(g, PAL.ink, x0 - 1, y - h - 1, w + 2, h + 1); px(g, PAL.wood1, x0, y - h, w, h); px(g, PAL.wood2, x0, y - h, w, 1); px(g, PAL.wood0, x0, y - 1, w, 1);
    for (let k = 1; k < h - 1; k++) px(g, PAL.wood0, x0 + Math.round(k * (w - 1) / (h - 1)), y - h + k, 1, 1);
    px(g, PAL.mid, x0, y - h + 2, 1, 2); px(g, PAL.mid, x0 + w - 1, y - h + 2, 1, 2); },
  coil(g, x, y, r){ for (let k = 0; k < 3; k++){ const half = 4 - k; px(g, PAL.ink, x - half - 1, y - 2 - k * 2, half * 2 + 3, 2); px(g, k % 2 ? PAL.tan : PAL.wood2, x - half, y - 2 - k * 2, half * 2 + 1, 1); px(g, PAL.wood1, x - half, y - 1 - k * 2, half * 2 + 1, 1); }
    px(g, PAL.wood2, x + 5, y - 2, 3, 1); px(g, PAL.ink, x + 5, y - 1, 4, 1); },
  // a hook on a length of rope
  hook(g, x, y, r){ const L = 6 + Math.floor(r() * 14); for (let k = 0; k < L; k++) px(g, k % 3 ? PAL.wood1 : PAL.tan, x, y + k);
    px(g, PAL.ink, x - 2, y + L, 5, 5); px(g, PAL.light, x - 1, y + L, 1, 4); px(g, PAL.light, x - 1, y + L + 3, 3, 1); px(g, PAL.mid, x + 1, y + L + 2, 1, 1); px(g, 'rgba(0,0,0,0)', x, y + L + 1, 1, 1); },
  // a torn signal flag, hanging
  tatter(g, x, y, r){ const w = 5, L = 9 + Math.floor(r() * 7), col = r() < 0.5 ? [PAL.red0, PAL.red1] : [PAL.navy, PAL.blue];
    px(g, PAL.ink, x - 1, y, w + 2, 1);
    for (let k = 1; k < L; k++){ const rag = k > L - 4 ? (k * 3 + x) % 3 : 0; px(g, PAL.ink, x - 1 + rag, y + k, w + 2 - rag * 2, 1); px(g, col[0], x + rag, y + k, Math.max(1, w - rag * 2), 1); if (k % 4 === 1) px(g, col[1], x + rag, y + k, Math.max(1, w - rag * 2), 1); } },
  // a storm lamp on a post: the works' light
  stormlamp(g, x, y, r, glow){ const h = 9 + Math.floor(r() * 4);
    px(g, PAL.ink, x - 1, y - h, 3, h); px(g, PAL.mid, x, y - h, 1, h); px(g, PAL.ink, x - 3, y - h - 7, 7, 7); px(g, PAL.dark, x - 2, y - h - 7, 5, 1);
    px(g, PAL.fire2, x - 2, y - h - 5, 5, 4); px(g, PAL.fire3, x - 1, y - h - 4, 3, 2); px(g, PAL.white, x, y - h - 4, 1, 1); px(g, PAL.ink, x, y - h - 6, 1, 1); px(g, PAL.ink, x - 3, y - 1, 7, 1);
    glow && glow(x, y - h - 3, 'lamp'); },
  // on the wall behind: a frame of the old scaffold, braced
  scaffold(g, x, y, r){ const w = 18 + Math.floor(r() * 8), h = 22 + Math.floor(r() * 14);
    for (const bx of [x, x + w]){ px(g, PAL.ink, bx - 1, y - h, 3, h); px(g, PAL.dark, bx, y - h, 1, h); }
    for (let by = y - h + 2; by < y - 3; by += 9){ px(g, PAL.ink, x, by - 1, w, 3); px(g, PAL.dark, x, by, w, 1); for (let k = 0; k < Math.min(w, 8); k++) px(g, PAL.ink, x + 1 + Math.round(k * (w - 2) / 8), by + 1 + k, 1, 1); }
    if (r() < 0.5) px(g, PAL.ink, x + w + 1, y - h + 3, 5, 1); },
});

// ---- its creatures
// the squall turns his cut from the front, until it has thrust or is caught turning
const squallGuard = (e, P) => Math.sign(P.x - e.x) === e.face && (e.st === 'idle' || e.st === 'march' || e.st === 'windup');
const enemies = {
  squall: { ai: 'squall', hp: 5, w: 0.6, h: 1.8, color: 0x5a6988, wake: 8, reach: 2.4, chase: 1.5, windup: 0.62, thrust: 0.2, recover: 1.0, stun: 0.45, turn: 0.6, art: 'px_squall', fly: false, word: 'Run through',
    guard: squallGuard, onHit(e){ if (e.st === 'march' || e.st === 'idle'){ e.st = 'stunned'; e.tm = 0; e.stun = 0.4; } } },
  nimbus: { ai: 'nimbus', hp: 2, w: 0.6, h: 0.9, color: 0x8b9bb4, wake: 9, drift: 2.9, hang: 4.4, charge: 0.85, strike: 0.22, rest: 1.1, cooldown: 1.5, art: 'px_nimbus', fly: true, word: 'Struck by lightning',
    onHit(e){ if (e.st === 'charge'){ e.st = 'rest'; e.tm = 0; e.warn = false; } } },
  spark: { ai: 'spark', hp: 1, w: 0.35, h: 0.6, color: 0xfee761, glow: 0x403000, speed: 4.4, lx: 4.5, ly: 3.2, art: 'px_spark', fly: true, word: 'Shocked' },
};
// bolts of lightning are drawn here (a jagged strip, added light) and fade by themselves (tick)
const SKY = { next: 4, pend: [], bolts: [], rain: [], tex: null, scene: null };
function boltTex(){
  if (SKY.tex) return SKY.tex;
  const c = document.createElement('canvas'); c.width = 16; c.height = 64; const g = c.getContext('2d'); let x = 8;
  for (let y = 0; y < 64; y++){ if (y % 5 === 0) x += [-3, 2, -2, 3, -1, 2, -3, 1, 2, -2, 1, -1, 0][Math.floor(y / 5)]; x = Math.max(3, Math.min(12, x)); g.fillStyle = '#9fc8ff'; g.fillRect(x - 1, y, 3, 1); g.fillStyle = '#ffffff'; g.fillRect(x, y, 1, 1); if (y % 13 === 7){ g.fillStyle = '#fee761'; g.fillRect(x + 1, y, 3, 1); g.fillRect(x + 3, y + 1, 2, 1); } }
  const T3 = window.THREE, t = new T3.CanvasTexture(c); t.magFilter = t.minFilter = T3.NearestFilter; t.generateMipmaps = false; return SKY.tex = t;
}
// a bolt from (x, y1) down to (x, y0), for a moment
function bolt(scene, x, y0, y1, life = 0.2, wide = 1){
  const T3 = window.THREE, m = new T3.Mesh(new T3.PlaneGeometry(1, 1), new T3.MeshBasicMaterial({ map: boltTex(), transparent: true, depthWrite: false, blending: T3.AdditiveBlending }));
  m.scale.set((Math.random() < 0.5 ? -1 : 1) * wide, Math.max(0.5, y1 - y0), 1); m.position.set(x, (y0 + y1) / 2, 0.7); scene.add(m); SKY.bolts.push({ m, t: 0, life, scene });
}
const ai = {
  // a knight behind a tower shield: it comes on slowly, its shield toward him, and thrusts; it is slow to turn
  squall(e, P, dt, c){
    const d = e.d, { dx, dy, go, events } = c, gy = c.ground(e.x, e.y + 0.3); if (gy > -Infinity) e.y = gy;
    e.warn = false;
    if (e.st === 'idle'){ if (Math.abs(dx) < d.wake && Math.abs(dy) < 2.5) go('march'); }
    else if (e.st === 'march'){
      const want = Math.sign(dx) || e.face;
      if (want !== e.face){ e.turnT = (e.turnT || 0) + dt; if (e.turnT >= d.turn){ e.face = want; e.turnT = 0; } } else e.turnT = 0;   // he is behind it: it comes round, in its own time
      e.moving = false;
      if (want === e.face){
        const nx = e.x + e.face * d.chase * dt;
        if (Math.abs(dx) > 1.5 && !c.solidAt(nx + e.face * d.w, e.y + 0.3) && c.ground(nx + e.face * 0.3, e.y + 0.3) > e.y - 0.6){ e.x = nx; e.moving = true; }
        if (Math.abs(dx) < d.reach && Math.abs(dy) < 1.3 && e.tm > 0.25){ go('windup'); events.push({ type: 'tell', e }); }
      }
      if (Math.abs(dx) > d.wake * 1.7) go('idle');
    }
    else if (e.st === 'windup'){ e.warn = true; if (e.tm >= d.windup){ go('thrust'); e.hit = false; c.fx.burst({ x: e.x + e.face * 1.4, y: e.y + 1.0 }, 10, 0xfee761); if (c.E.R) c.E.R.glint(e.x + e.face * 1.4, e.y + 1, 0xfee761, 0.8, 4, 0.2); } }
    else if (e.st === 'thrust'){
      if (!e.hit && (P.x - e.x) * e.face > -0.2 && (P.x - e.x) * e.face < d.reach && P.y < e.y + 1.5 && P.y + P.h > e.y + 0.4 && !c.isRollInv(P)){
        e.hit = true;
        if (P.blocking && P.face === -e.face){ const parry = performance.now() / 1000 - (P.blockAt || -9) < 0.18; events.push({ type: parry ? 'parry' : 'block', at: { x: P.x, y: P.y + 1 } }); go('stunned'); e.stun = parry ? 1.5 : 0.8; }
        else c.hurt(P, 1, e.x, d.word);
      }
      if (e.st === 'thrust' && e.tm >= d.thrust) go('recover');
    }
    else if (e.st === 'recover'){ if (e.tm >= d.recover) go('march'); }
    else if (e.st === 'stunned'){ if (e.tm >= (e.stun || d.stun)) go('march'); }
    // a body: he cannot walk through it (a roll can)
    if (P.roll <= 0 && Math.abs(P.x - e.x) < 0.6 && P.y < e.y + 1.2 && P.y > e.y - 0.5){ const side = Math.sign(P.x - e.x) || -e.face; P.x = e.x + side * 0.6; if (Math.sign(P.vx) === -side) P.vx = 0; }
    const st = e.st;
    if (st === 'windup') c.anim(e, 'attack', e.tm / d.windup * 0.62);
    else if (st === 'thrust') c.anim(e, 'attack', 0.67 + e.tm / d.thrust * 0.2);
    else if (st === 'recover') c.anim(e, 'attack', e.tm < 0.15 ? 0.8 : 0.36 + Math.min(0.1, e.tm * 0.05));   // spent: its shield is down
    else if (st === 'stunned') c.anim(e, 'attack', 0.4);
    else c.anim(e, 'walk', e.moving ? e.tm * 1.1 : 0);
  },
  // a cloud that comes to hang over him, darkens, and drops a bolt straight down
  nimbus(e, P, dt, c){
    const d = e.d, { dx, dist, go, events } = c; e.cd = Math.max(0, (e.cd || 0) - dt); e.warn = false;
    const floorAt = x => { const g = c.ground(x, e.y); return g > -Infinity ? g : e.y - 12; };
    if (e.st === 'idle'){ e.x = e.home.x + Math.sin(e.age * 0.8) * 0.5; e.y = e.home.y + Math.sin(e.age * 1.6) * 0.25; if (dist < d.wake) go('stalk'); }
    else if (e.st === 'stalk'){
      e.face = Math.sign(dx) || e.face;
      const fl = c.ground(P.x, P.y + 0.5), ty = (fl > -Infinity && P.y - fl < 3 ? fl : P.y) + d.hang + Math.sin(e.age * 2) * 0.2;
      e.x += Math.max(-d.drift * dt, Math.min(d.drift * dt, P.x - e.x)); e.y += (ty - e.y) * Math.min(1, dt * 2.2);
      if (Math.abs(P.x - e.x) < 0.6 && Math.abs(ty - e.y) < 1.2 && e.cd <= 0){ go('charge'); events.push({ type: 'tell', e }); }
      if (dist > d.wake * 2.2) go('idle');
    }
    else if (e.st === 'charge'){
      e.warn = true;
      if (Math.random() < dt * 30){ const f = floorAt(e.x); c.fx.burst({ x: e.x + (Math.random() - 0.5) * 0.3, y: f + Math.random() * (e.y - f) }, 1, 0xfee761); }   // the air under it prickles
      if (e.tm >= d.charge){
        const f = floorAt(e.x); go('strike'); e.fl = f;
        bolt(c.E.scene, e.x, f, e.y - 0.2, 0.22); c.fx.burst({ x: e.x, y: f + 0.2 }, 14, 0xfff6c0); c.fx.ring({ x: e.x, y: f + 0.3 }, 0xbfe0ff);
        if (c.E.R) c.E.R.glint(e.x, f + 1.2, 0xdff0ff, 1.3, 7, 0.25);
        events.push({ type: 'rockLand', at: { x: e.x, y: f } });
      }
    }
    else if (e.st === 'strike'){ if (!e.hit2 && c.hit(e.x - 0.5, e.fl - 0.2, e.x + 0.5, e.y, d.word, e.x - e.face * 0.1)) e.hit2 = true; if (e.tm >= d.strike){ go('rest'); e.hit2 = false; e.cd = d.cooldown; } }
    else if (e.st === 'rest'){ e.y += dt * 0.5; if (e.tm >= d.rest) go('stalk'); }
    c.anim(e, e.st === 'charge' || e.st === 'strike' ? 'cast' : 'float', e.st === 'charge' ? e.tm / d.charge * 0.6 : e.st === 'strike' ? 0.62 + e.tm / d.strike * 0.3 : e.age * 0.9);
  },
  // ball lightning: it runs a straight slanted line and comes back off rock, never far from where it was loosed
  spark(e, P, dt, c){
    const d = e.d, r = 0.28;
    if (e.sx == null){ const k = Math.round(e.home.x * 2) + Math.round(e.home.y * 2); e.sx = (k % 2 ? 1 : -1) * d.speed * 0.72; e.sy = (k % 4 < 2 ? 1 : -1) * d.speed * 0.69; }
    let nx = e.x + e.sx * dt, ny = e.y + e.sy * dt;
    if (c.solidAt(nx + Math.sign(e.sx) * r, e.y) || Math.abs(nx - e.home.x) > d.lx){ e.sx = -e.sx; nx = e.x; c.fx.burst({ x: e.x, y: e.y }, 3, 0xfee761); }
    if (c.solidAt(e.x, ny + Math.sign(e.sy) * r) || Math.abs(ny - e.home.y) > d.ly){ e.sy = -e.sy; ny = e.y; c.fx.burst({ x: e.x, y: e.y }, 3, 0xfee761); }
    e.x = nx; e.y = ny; e.face = Math.sign(e.sx) || 1;
    if (Math.random() < dt * 9) c.fx.burst({ x: e.x, y: e.y }, 1, 0xfee761);
    if (c.dist < 13 && c.E.R) c.E.R.glint(e.x, e.y, 0xfee761, 0.45, 3);
    c.hit(e.x - 0.3, e.y - 0.3, e.x + 0.3, e.y + 0.3, d.word, e.x);
    c.anim(e, 'idle', e.age * 1.4);
  },
};

// ---- the weather: rain driven across the picture, and now and then lightning (a flash, and its thunder after)
function tick(dt, time, c){
  const T3 = window.THREE, R = c.R, P = c.P, room = c.room, outside = !room || room.open;
  for (let i = SKY.bolts.length - 1; i >= 0; i--){ const b = SKY.bolts[i]; b.t += dt; b.m.material.opacity = b.t > b.life * 0.5 && Math.floor(b.t * 60) % 2 ? 0.35 : 1; if (b.t >= b.life){ b.scene.remove(b.m); b.m.geometry.dispose(); b.m.material.dispose(); SKY.bolts.splice(i, 1); } }
  // rain: slanted streaks that ride with the view (made again when the region is)
  if (SKY.scene !== R.scene || (SKY.rain[0] && SKY.rain[0].m.parent !== R.scene)){
    SKY.scene = R.scene; SKY.rain.length = 0;
    const geo = new T3.PlaneGeometry(1 / 16, 6 / 16);
    for (let k = 0; k < 90; k++){ const near = k % 3 === 0, m = new T3.Mesh(geo, new T3.MeshBasicMaterial({ color: near ? 0xc0d4ff : 0x7c98d0, transparent: true, opacity: near ? 0.7 : 0.45, depthWrite: false }));
      m.rotation.z = -0.24; m.position.set(Math.random() * 24 - 12, Math.random() * 14 - 7, near ? 2.5 : -4); R.scene.add(m); SKY.rain.push({ m, ox: m.position.x, oy: m.position.y, v: near ? 26 : 19 }); }
  }
  const cam = R.camera.position;
  for (const s of SKY.rain){ s.oy -= s.v * dt; s.ox -= s.v * 0.26 * dt; if (s.oy < -7){ s.oy += 14; s.ox = Math.random() * 26 - 12; } if (s.ox < -13) s.ox += 26; s.m.position.x = cam.x + s.ox; s.m.position.y = cam.y + s.oy; s.m.visible = outside; }
  // lightning, not while a keeper has the sky
  const B = window.__side && window.__side.BOSS, busy = B && B.active && B.active();
  SKY.next -= dt;
  if (SKY.next <= 0 && !busy){
    SKY.next = 7 + Math.random() * 10;
    if (outside){ c.flash(0.14); SKY.pend.push({ t: 0.13, again: true }); R.glint(P.x + (Math.random() - 0.5) * 14, P.y + 7, 0xbfd8ff, 1.5, 24, 0.4); }
    SKY.pend.push({ t: 0.5 + Math.random() * 1.1, loud: outside });
  }
  for (let i = SKY.pend.length - 1; i >= 0; i--){ const q = SKY.pend[i]; q.t -= dt; if (q.t > 0) continue; SKY.pend.splice(i, 1); if (q.again) c.flash(0.09); else { c.sfx.thunder(); if (q.loud) c.shake(0.09); } }
}

// ---- its score, made as it plays (the recorded one is the lead's): the climb's tune, in F sharp minor, driven like weather
const CLIMB = { prog: [{ b: 38, n: [50, 53, 57] }, { b: 34, n: [50, 53, 58] }, { b: 43, n: [50, 55, 58] }, { b: 45, n: [49, 52, 57] }],
  tune: [[0, 0, 74, 4], [0, 4, 76, 4], [0, 8, 77, 4], [0, 12, 81, 14], [2, 0, 74, 4], [2, 4, 77, 4], [2, 8, 79, 4], [2, 12, 82, 14], [4, 0, 79, 4], [4, 4, 81, 4], [4, 8, 82, 4], [4, 12, 86, 14], [6, 0, 81, 6], [6, 6, 79, 6], [6, 12, 77, 4], [7, 0, 76, 12]] };
const _ = null;
const songs = {
  tempest: { set: CLIMB, shift: 4, bpm: 104, pad: { g: 0.26, cut: 1100 }, bass: { g: 0.32, at: [0, 6, 8, 14], drive: true }, arp: { inst: 'saw', g: 0.05, oct: 12, pat: [0, 2, 4, 2, 1, 3, 5, 3, 0, 2, 4, 2, 3, 5, 4, 2] },
    lead: { inst: 'saw', g: 0.13, oct: -12, every: 2, octaves: true }, drums: { kick: [0, 10], snare: [], hat: [], g: 0.42 }, wind: 0.8 },
  boss_tempest: { set: CLIMB, shift: 4, bpm: 152, pad: { g: 0.22, cut: 1400, stab: true }, bass: { g: 0.36, at: [0, 2, 4, 6, 8, 10, 12, 14], drive: true }, arp: { inst: 'saw', g: 0.09, oct: 12, pat: [0, 3, 1, 3, 2, 3, 1, 3, 0, 3, 1, 3, 4, 3, 2, 1] },
    lead: { inst: 'saw', g: 0.16, oct: 0, every: 1, octaves: true }, drums: { kick: [0, 3, 6, 8, 11, 14], snare: [4, 12], hat: [2, 6, 10, 14], g: 0.55 }, wind: 0.6 },
};

export default { name: 'The Tempest', theme: 'tempest', sub: 'the storm that came when the flame went dark', card: 'Above the pass the mountain goes on, into the storm.', epithet: 'THE STORM HAS A FACE',
  quiet: ['gale'], seed: 5550123, fill: EMPTY, sky: true, cols: 3, wear: { sag: 0.9, swell: 0, humps: 0.5 },
  layout: [[0, 0, landing], [1, 0, rigging, 2, 1], [0, 1, bluff], [1, 1, anchorage], [2, 1, stacks, 1, 2], [0, 2, watch], [1, 2, gantry],
    [0, 3, flue, 1, 2], [1, 3, buttress], [2, 3, corbel], [1, 4, crossing, 2, 2], [0, 5, cap], [1, 6, anvil], [2, 6, masthead], [1, 7, gale, 2, 2]],
  themeDef, deco, enemies, ai, songs, tick };
