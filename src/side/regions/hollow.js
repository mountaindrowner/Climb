// The Hollow: the last of the Deep (docs/world.md, docs/phase17-sheet.md). Under the floor of the Great Shaft. A
// hollow nobody made, older than the house, older than the flame; the Auger broke into its roof. It is dark. Its keeper
// is the Auger (auger.js); past it, the Source; past that, a rough wall, and the way home.
//   roof      two screens, one over the other: where the Shaft comes out, under water falling in threads. Broken
//             ledges, down. At its foot the water gathers: the raising water
//   camp      two screens: the guild's last camp. Tents, a fire long out, the last page of the tally. Echoes
//   circles   three screens: the Hollow's floor, torn in rings by the engine going round. Echoes
//   bore      four screens, two by two: the keeper's hall. A pit of three floors; the upper two are the bore's own
//             tiles (TIER_A, TIER_B), which the Auger bores away. Its east wall is rough rock
//   source    two screens, past the pit: the spring, and the flame beside it
//   wall      a rough face going up out of sight: with the grip, the way back to the Roots
import { flue, room, rect, door, ledge, mark, EMPTY, HOLD, ROUGH, TIER_A, TIER_B } from '../rooms.js';

const mass = (cw = 1, ch = 1) => { const r = room(cw, ch); rect(r, 0, 0, r.w - 1, r.h - 1); return r; };
const filler = draw => { const r = room(); draw(r); r.filler = true; return r; };
function solid(){ return filler(r => { rect(r, 0, 0, 39, 22); }); }
const deco = (r, kind, x, y) => mark(r, 'deco', x, y, { kind });
const keep = (r, x, y) => mark(r, 'keep', x, y);
const lamp = (r, x, y) => mark(r, 'glamp', x, y);

function roof(){
  const r = mass(1, 2); rect(r, 4, 4, 35, 43, EMPTY); door(r, 'top', 16, 21); door(r, 'right', 4, 9); rect(r, 36, 4, 37, 9, EMPTY);
  mark(r, 'pass', 16, 37, { w: 6, h: 9, to: 9, at: 'floor' }); mark(r, 'arrive', 18, 35, { name: 'top' });
  // the roof's broken ledges, down
  for (const [x0, x1, y] of [[4, 25, 34], [24, 35, 28], [4, 17, 23], [22, 35, 18], [4, 19, 13]]) rect(r, x0, y, x1, y); ledge(r, 20, 27, 9);   // (out of one wall and the other, since the map pass: five of them hung in the air. The lowest is a staging still)
  // the water from above, in threads; where it gathers: the level's raising water
  for (const x of [9, 30, 34]) mark(r, 'flow', x, 4, { w: 1, h: 38, dir: 'd', key: 'fall', soft: true });
  rect(r, 16, 3, 23, 3, EMPTY); mark(r, 'pool', 16, 3, { w: 8, look: 'spout' }); mark(r, 'spawn', 10, 4);
  lamp(r, 28, 12); lamp(r, 10, 30); mark(r, 'urn', 30, 4); mark(r, 'urn', 6, 4);
  for (const y of [6, 11, 16, 21, 26, 31, 36, 41]) for (const x of [6, 12, 18, 24, 30, 34]) keep(r, x, y);
  return r;
}
function camp(){
  const r = mass(2, 1); rect(r, 2, 4, 77, 20, EMPTY); door(r, 'left', 4, 9); door(r, 'bottom', 70, 75); rect(r, 70, 2, 75, 3, EMPTY); ledge(r, 70, 75, 3);
  deco(r, 'tent', 14, 4); deco(r, 'tent', 30, 4); deco(r, 'tent', 58, 4); deco(r, 'deadfire', 22, 4); deco(r, 'tally', 44, 4);
  mark(r, 'chest', 48, 4, { holds: 'relic:tallysend' }); ledge(r, 62, 68, 11); mark(r, 'chest', 65, 12, { holds: 'thread' });
  mark(r, 'echo', 36, 6); mark(r, 'echo', 52, 6);
  for (const x of [8, 24, 40, 56, 72]) lamp(r, x, 12);
  mark(r, 'urn', 10, 4); mark(r, 'urn', 34, 4); mark(r, 'urn', 62, 4);
  for (let x = 4; x <= 76; x += 4) for (const y of [6, 10, 15, 18]) keep(r, x, y);
  return r;
}
function circles(){
  const r = mass(3, 1); rect(r, 2, 4, 117, 20, EMPTY); door(r, 'top', 70, 75); door(r, 'bottom', 32, 37); rect(r, 32, 2, 37, 3, EMPTY);
  rect(r, 67, 4, 69, 7); rect(r, 70, 4, 77, 11); ledge(r, 70, 75, 17); ledge(r, 70, 75, 22); flue(r, 70, 75, 17, 20);   // the camp's way down: two rungs between stone sides, onto a block with a step either side (four rungs, two in the air, until the map pass)
  // the rings the engine cut: ruts, and the ridges between them
  for (const [x0, x1] of [[8, 20], [44, 56], [84, 98], [104, 112]]) rect(r, x0, 2, x1, 3, EMPTY);
  for (const [x0, x1, h] of [[24, 28, 6], [60, 63, 7], [78, 81, 6], [100, 102, 5]]) rect(r, x0, 4, x1, h);
  // the east side of the way down into the bore: rough, as the bore's wall under it is
  rect(r, 38, 0, 38, 3, ROUGH);
  mark(r, 'echo', 20, 6); mark(r, 'echo', 66, 6); mark(r, 'echo', 94, 6);
  for (const x of [14, 42, 68, 90, 110]) lamp(r, x, 13);
  mark(r, 'chest', 5, 4, { holds: 'thread' }); mark(r, 'chest', 114, 4, { holds: 'shards' }); mark(r, 'urn', 50, 2); mark(r, 'urn', 90, 2); mark(r, 'urn', 64, 4);
  deco(r, 'farlight', 4, 8);
  for (let x = 4; x <= 116; x += 4) for (const y of [9, 13, 17]) if (r.tiles[y][x] === EMPTY) keep(r, x, y);
  for (const x of [33, 36]) for (const y of [1, 3, 5]) keep(r, x, y);
  return r;
}
// the bore: the rows its three floors are stood on, from the first down
export const BORE = { floors: [32, 18, 2] };
function bore(){
  const r = mass(2, 2); rect(r, 2, 2, 77, 43, EMPTY); door(r, 'top', 72, 77);
  rect(r, 2, BORE.floors[0] - 2, 77, BORE.floors[0] - 1, TIER_A); rect(r, 2, BORE.floors[1] - 2, 77, BORE.floors[1] - 1, TIER_B);
  // its east wall: rough rock, from the bottom of the pit to the way in. And at its foot, the way on to the Source,
  // shut until the Auger is still
  rect(r, 78, 8, 78, 45, ROUGH); door(r, 'right', 2, 7); rect(r, 78, 2, 79, 7, HOLD);
  mark(r, 'boss', 40, BORE.floors[0]);
  for (let x = 4; x <= 76; x += 4) for (const y of [4, 8, 12, 20, 24, 28, 34, 38, 42]) keep(r, x, y);
  return r;
}
function source(){
  const r = mass(2, 1); rect(r, 2, 2, 77, 16, EMPTY); door(r, 'left', 2, 7); door(r, 'top', 60, 65); rect(r, 60, 17, 65, 20, EMPTY);
  // the spring, rising in the floor; the flame beside it; and east of them the foot of the wall
  rect(r, 36, 1, 45, 1, EMPTY); mark(r, 'pool', 36, 1, { w: 10, plain: true }); mark(r, 'shrine', 41, 2); deco(r, 'sourceflame', 49, 2);
  rect(r, 66, 2, 66, 22, ROUGH);
  for (let x = 4; x <= 76; x += 4) for (const y of [5, 9, 13]) keep(r, x, y);
  for (const y of [17, 20]) for (const x of [61, 64]) keep(r, x, y);
  r.after = true;
  return r;
}
function wall(){
  const r = mass(); door(r, 'bottom', 20, 25); rect(r, 20, 2, 25, 20, EMPTY); rect(r, 26, 0, 26, 20, ROUGH);
  ledge(r, 20, 25, 11);   // a stance across it, part of the way (he climbs up through it)
  mark(r, 'pass', 20, 14, { w: 6, h: 7, to: 0, at: 'pithead', gate: 'grip' });
  for (const y of [3, 7, 11, 15, 19]) for (const x of [21, 24]) keep(r, x, y);
  r.after = true;
  return r;
}

const themeDef = {
  stone: { edge: 'ink', topEdge: 'deep', lip: 'dark', lip2: 'deep', lipD: 2, lip2D: 3, a: 'dark', aSeam: 'deep', b: 'deep', bSeam: 'ink', c: 'ink', core: 'ink', seam: 'strata', band: [8, 15, 22] },
  moss: { c: ['deep', 'dark', 'deep'], p: 0.05 }, plank: ['wood1', 'wood3', 'wood0', 'wood2'], spike: ['light', 'pale'],
  ceilLow: [['stalactite', 4]], ceil: [['stalactite', 34], ['root', 8]],
  floorWall: ['rubble', 'bones', 'rubble'], floorOpen: ['rubble', 'rubble', 'bones'], gem: 'crystal',
  back: { cols: ['ink', 'ink', 'ink'], dim: [0.5, 0.52, 0.62], hole: 99, holeOpen: 99, stand: [['pillar', 2]], hang: [['stalactite', 50]], pStand: 0.006, pHang: 0.03 },
  far: { img: 'workings', raw: true }, hemi: [0xffe0c0, 0x201a2a, 0.45], shaft: null, bloom: [0.7, 0.8],
  amb: [0.08, 0.075, 0.1], mist: { col: 'ink', col2: 'ink', a: 0.22, drift: 0.04 }, fore: 'roots',
  air: { n: 60, cols: [0xffd9a0, 0xbfd0ff], warm: 0.3, vx: 0.02, vy: [0.01, 0.05] },
};
const decoDef = (px, PAL) => ({
  tent(g, x, y){ for (let k = 0; k < 18; k++){ px(g, PAL.ink, x - 18 + k, y - 1 - k, 36 - k * 2 + 1, 1); px(g, k % 6 === 0 ? '#5a6988' : '#8b9bb4', x - 17 + k, y - 1 - k, 34 - k * 2, 1); } px(g, PAL.ink, x - 3, y - 12, 6, 12); px(g, '#181425', x - 2, y - 11, 4, 11); px(g, PAL.wood1, x, y - 22, 1, 4); },
  deadfire(g, x, y){ for (const a of [-7, -3, 2, 6]) px(g, '#5a6988', x + a, y - 2, 3, 2); px(g, PAL.ink, x - 6, y - 4, 12, 2); px(g, '#3a4466', x - 5, y - 4, 10, 1); px(g, PAL.wood0, x - 4, y - 6, 9, 2); px(g, '#262b44', x - 2, y - 7, 4, 1); },
  // the table, and the last page of the tally on it
  tally(g, x, y){ px(g, PAL.ink, x - 12, y - 9, 24, 2); px(g, PAL.wood1, x - 11, y - 9, 22, 1); px(g, PAL.ink, x - 10, y - 7, 2, 7); px(g, PAL.ink, x + 8, y - 7, 2, 7); px(g, '#ead4aa', x - 5, y - 11, 9, 2); px(g, '#c0a070', x - 4, y - 11, 5, 1); },
  // far off across the Hollow, low and warm: the light
  farlight(g, x, y){ px(g, '#f77622', x - 1, y - 2, 3, 2); px(g, '#fee761', x, y - 2, 1, 1); },
  // the flame beside the spring: low, on bare rock, kept by no one
  sourceflame(g, x, y){ px(g, '#3a4466', x - 9, y - 2, 18, 2); px(g, '#5a6988', x - 8, y - 3, 16, 1); px(g, '#e43b44', x - 5, y - 8, 10, 5); px(g, '#f77622', x - 4, y - 11, 8, 8); px(g, '#feae34', x - 3, y - 14, 6, 10); px(g, '#fee761', x - 2, y - 16, 4, 11); px(g, '#ffffff', x - 1, y - 12, 2, 7); px(g, '#fee761', x, y - 18, 1, 2); },
});

export default { name: 'The Hollow', theme: 'hollow', sub: 'under everything', card: '', epithet: 'ITS ORDER WAS: DEEPER',
  deep: true, dark: true, needs: ['glide'], alone: true, sparse: true, depth: [-3.1, -2.9], musicOf: 'roots', ambOf: 'roots', vestibule: false, quiet: ['bore', 'source', 'wall'],
  seed: 2236067, cols: 4, wear: { sag: 0.3, swell: 0.3, humps: 0.3 },
  layout: [[0, 3, roof, 1, 2], [1, 4, solid], [2, 4, solid], [3, 4, solid], [3, 3, solid], [1, 3, camp, 2, 1], [0, 2, solid], [1, 2, circles, 3, 1], [0, 0, bore, 2, 2], [2, 1, solid], [3, 1, wall], [2, 0, source, 2, 1]],
  themeDef, deco: decoDef };
