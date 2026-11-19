// The Great Shaft: the fourth of the Deep (docs/world.md, docs/phase16-sheet.md). Below the Vein's lip. The Auger's
// hole: it bored straight down seven hundred metres and broke through into something. Nobody is here. It is dark, and
// there is no lamp in it but his.
//   drop    three screens, one over another: the guild's last camp hung down its walls on ropes, so it can be climbed
//           either way. Cold air comes up it (an updraft marked `cold`: under the scarf it does not lift him, it holds
//           him back: the longest glide there is). At its foot, deep water: whoever falls the shaft falls into it unhurt
//   floor   reached under that water, through a drowned arch, so only with the Wyrm's wind (needs). Dry rock, and the
//           hole the Auger went on through. A warm light comes up out of it. The way down is the next phase's
import { room, rect, door, ledge, mark, EMPTY } from '../rooms.js';

const mass = (cw = 1, ch = 1) => { const r = room(cw, ch); rect(r, 0, 0, r.w - 1, r.h - 1); return r; };
const filler = draw => { const r = room(); draw(r); r.filler = true; return r; };
function solid(){ return filler(r => { rect(r, 0, 0, 39, 22); }); }
const deco = (r, kind, x, y) => mark(r, 'deco', x, y, { kind });
const keep = (r, x, y) => mark(r, 'keep', x, y);
// where the water at the foot of the drop stands (the row over its top), and the camp's stages: [x0, x1, row]
// (the second stage hangs out from under the head's shelf, so there is room over it to jump from)
export const SHAFT = { top: 14, stages: [[24, 31, 55], [16, 23, 50], [24, 31, 45], [8, 15, 40], [24, 31, 35], [8, 15, 30], [24, 31, 25], [8, 15, 20]] };

function drop(){
  const r = mass(1, 3); rect(r, 8, 6, 31, 66, EMPTY);
  // the head of it: a shelf under the lip, the camp's water-butt on it (the raising water)
  rect(r, 8, 58, 19, 60); rect(r, 13, 60, 17, 60, EMPTY); mark(r, 'pool', 13, 60, { w: 5, look: 'trough' });
  mark(r, 'spawn', 10, 61); mark(r, 'arrive', 10, 61, { name: 'top' }); mark(r, 'pass', 8, 63, { w: 5, h: 4, to: 7, at: 'lip' });
  // the camp, stage under stage, and at the water a stage of rock to climb out onto
  for (const [x0, x1, y] of SHAFT.stages) ledge(r, x0, x1, y);
  rect(r, 8, 6, 13, SHAFT.top - 1);
  rect(r, 32, 6, 39, 10, EMPTY); mark(r, 'water', 8, 6, { w: 24, h: SHAFT.top - 6 }); mark(r, 'water', 32, 6, { w: 8, h: 5, deep: true });
  mark(r, 'updraft', 8, 16, { w: 24, h: 40, cold: true });
  deco(r, 'camp', 27, 56); deco(r, 'cot', 11, 41); deco(r, 'kettle', 28, 36); deco(r, 'depth', 20, 48); deco(r, 'depth', 20, 28); deco(r, 'depthonly', 20, 18);
  mark(r, 'chest', 28, 46, { holds: 'thread' }); mark(r, 'chest', 11, 21, { holds: 'thread' }); mark(r, 'urn', 26, 26); mark(r, 'urn', 18, 61);
  for (let y = 8; y <= 56; y += 4) for (const x of [10, 14, 18, 22, 26, 30]) if (!(x < 14 && y < SHAFT.top)) keep(r, x, y);
  for (const x of [22, 26, 30]) for (const y of [60, 64]) keep(r, x, y);
  for (const x of [33, 36]) for (const y of [7, 9]) keep(r, x, y);
  return r;
}
function floor(){
  const r = mass(); door(r, 'left', 6, 10);
  // the arch comes in under water; the water stands in the west of it; then the floor, and the hole in it
  rect(r, 2, 6, 37, 20, EMPTY); rect(r, 14, 6, 37, SHAFT.top - 1); rect(r, 23, 8, 30, SHAFT.top - 1, EMPTY); ledge(r, 23, 25, 11);
  mark(r, 'water', 2, 6, { w: 12, h: SHAFT.top - 6 }); mark(r, 'water', 0, 6, { w: 2, h: 5, deep: true });
  deco(r, 'breach', 27, 8); mark(r, 'chest', 34, SHAFT.top, { holds: 'relic:lastrope' }); mark(r, 'urn', 18, SHAFT.top);
  for (let x = 4; x <= 36; x += 4) for (const y of [16, 19]) keep(r, x, y);
  for (const x of [3, 6, 9, 12]) for (const y of [7, 10]) keep(r, x, y);
  r.needs = 'glide';
  return r;
}

const themeDef = {
  stone: { edge: 'ink', topEdge: 'deep', lip: 'dark', lip2: 'deep', lipD: 2, lip2D: 3, a: 'dark', aSeam: 'deep', b: 'deep', bSeam: 'ink', c: 'ink', core: 'ink', seam: 'strata', band: [11, 23, 35, 47, 59] },
  moss: { c: ['deep', 'dark', 'deep'], p: 0.04 }, plank: ['wood1', 'wood3', 'wood0', 'wood2'], spike: ['light', 'pale'],
  ceilLow: [['chain', 3]], ceil: [['chain', 30], ['root', 6]],
  floorWall: ['rubble', 'bones', 'rubble'], floorOpen: ['rubble', 'rubble', 'bones'], gem: 'crystal',
  back: { cols: ['ink', 'ink', 'ink'], dim: [0.5, 0.52, 0.6], hole: 99, holeOpen: 99, stand: [], hang: [['chain', 60]], pStand: 0, pHang: 0.03 },
  far: { img: 'workings', raw: true }, hemi: [0xbfd0ff, 0x202a40, 0.45], shaft: null, bloom: [0.7, 0.8],
  amb: [0.07, 0.08, 0.12], mist: { col: 'ink', col2: 'ink', a: 0.2, drift: 0.04 }, fore: 'roots',
  air: { n: 70, cols: [0xbfd0ff, 0xffffff], warm: 0, vx: 0.01, vy: [0.2, 0.5] },
};
const decoDef = (px, PAL) => ({
  // the camp: a canvas on two poles, a box under it
  camp(g, x, y){ px(g, PAL.ink, x - 20, y - 26, 2, 26); px(g, PAL.ink, x + 18, y - 26, 2, 26); for (let k = 0; k < 20; k++) px(g, k % 5 ? '#8b9bb4' : '#5a6988', x - 20 + k * 2, y - 26 + Math.round(Math.sin(k / 19 * Math.PI) * 4), 2, 3); px(g, PAL.ink, x - 8, y - 9, 16, 9); px(g, PAL.wood1, x - 7, y - 8, 14, 8); px(g, PAL.wood3, x - 7, y - 8, 14, 1); },
  cot(g, x, y){ px(g, PAL.ink, x - 14, y - 6, 28, 3); px(g, '#8b9bb4', x - 13, y - 6, 26, 2); px(g, '#c0cbdc', x - 13, y - 8, 7, 2); px(g, PAL.ink, x - 13, y - 3, 2, 3); px(g, PAL.ink, x + 11, y - 3, 2, 3); },
  kettle(g, x, y){ px(g, PAL.ink, x, y - 22, 1, 12); px(g, PAL.ink, x - 4, y - 10, 9, 8); px(g, '#5a6988', x - 3, y - 9, 7, 6); px(g, '#8b9bb4', x - 3, y - 9, 7, 1); px(g, PAL.ink, x + 5, y - 8, 3, 2); },
  // the guild's marks on the wall: a depth and a date; lower down, only a depth
  depth(g, x, y){ for (const [a, b, w] of [[0, 0, 14], [2, 4, 9], [0, 8, 12], [16, 0, 1], [18, 0, 6], [18, 4, 5], [18, 8, 7]]) px(g, '#c0cbdc', x - 12 + a, y - 14 + b, w, 1); px(g, '#8b9bb4', x - 12, y - 2, 26, 1); },
  depthonly(g, x, y){ for (const [a, b, w] of [[0, 0, 14], [2, 4, 9], [0, 8, 12]]) px(g, '#8b9bb4', x - 7 + a, y - 12 + b, w, 1); },
  // the hole the Auger went on through: torn rock, and a warm light under it
  breach(g, x, y){ for (let k = 0; k < 9; k++){ px(g, '#f77622', x - 26 + k * 6, y - 2 - (k % 3), 5, 2 + (k % 3)); px(g, '#fee761', x - 25 + k * 6, y - 1, 3, 1); } px(g, '#feae34', x - 28, y - 1, 58, 1); },
});

export default { name: 'The Great Shaft', theme: 'shaft', sub: 'seven hundred metres, straight down', card: '', epithet: '',
  deep: true, dark: true, empty: true, depth: [-2.9, -2.2], musicOf: 'roots', ambOf: 'spires', vestibule: false,
  seed: 5772156, cols: 2, wear: { sag: 0.2, swell: 0.25, humps: 0.2 },
  layout: [[0, 0, drop, 1, 3], [1, 0, floor], [1, 1, solid], [1, 2, solid]],
  themeDef, deco: decoDef };
