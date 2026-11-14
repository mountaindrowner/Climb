// The Workings: the first of the Deep (docs/world.md). Under the Roots, the Lamp-guild's shallow mines: timbered
// galleries, rails, the guild's lamps still hanging at every turning, and the miners' works going down level below
// level. It is not on the climb: it is reached from the Roots' Pithead, down the old cage shaft, and left the same way.
// It goes down, not up: he comes in at the top and the cistern, where the water came in, is at the bottom.
//   cage      the shaft the guild's cage ran in; the cage hangs in it still. He climbs down its frame (and back up)
//   tally     the tally-house: two hundred years of shifts chalked on a wall; a flame kept here
//   bunk      the bunkhouse: cots, boots, a hymn on a beam with every verse numbered. Hob is here, filling a lamp
//   props     a gallery held up by its timbers, two screens long, the guild's lamps along it
//   long      the long level: a rail line the whole width of the Workings, carts on it, a gap where the floor went
//   cistern   the bottom, where the water came in and stayed: lampreys on the roof, barnacles on the rock. The way on
//             down (to the Flooded Levels) is under the water, and closed to him yet
import { room, rect, walls, door, ledge, mark, stairs, EMPTY, LEDGE, SPIKES } from '../rooms.js';

const filler = draw => { const r = room(); draw(r); r.filler = true; return r; };
function solid(){ return filler(r => { rect(r, 0, 0, 39, 22); }); }

function cage(){
  const r = room(1, 2); walls(r);
  door(r, 'top', 17, 22);                                         // up the shaft: out to the Pithead
  door(r, 'right', 25, 30); door(r, 'right', 2, 7);               // to the tally-house above, the props below
  // the cage itself, stuck, hung high in the shaft: he lands on its roof coming down
  ledge(r, 15, 24, 38); ledge(r, 15, 24, 33); rect(r, 15, 34, 15, 37, LEDGE); rect(r, 24, 34, 24, 37, LEDGE);   // its roof, its floor, its bars
  // the frame the cage ran in: rungs down the shaft, a jump apart each way, and a step out to the door above the props
  for (const [x0, x1, y] of [[4, 10, 8], [13, 20, 13], [4, 10, 18], [13, 20, 23], [4, 10, 28]]) ledge(r, x0, x1, y);
  ledge(r, 29, 37, 24);
  rect(r, 2, 31, 2, 43);                                           // a post of the frame
  mark(r, 'spawn', 20, 39); mark(r, 'arrive', 20, 39, { name: 'down' });
  mark(r, 'pass', 17, 41, { w: 6, h: 5, to: 0, at: 'pithead' });
  mark(r, 'torch', 8, 30); mark(r, 'torch', 32, 15); mark(r, 'torch', 10, 4);
  mark(r, 'flitter', 20, 20); mark(r, 'chest', 33, 25, { holds: 'shards' });
  return r;
}
function tally(){
  const r = room(); walls(r); door(r, 'left', 2, 7); door(r, 'right', 2, 7);
  ledge(r, 8, 14, 7); ledge(r, 26, 32, 9);                         // the tally-men's benches
  mark(r, 'shrine', 20, 2); mark(r, 'torch', 12, 9); mark(r, 'torch', 28, 11);
  mark(r, 'urn', 5, 2); mark(r, 'urn', 34, 2); mark(r, 'chest', 29, 10, { holds: 'thread' });
  return r;
}
function bunk(){
  const r = room(); walls(r); door(r, 'left', 2, 7);
  ledge(r, 6, 12, 6); ledge(r, 6, 12, 11); ledge(r, 27, 33, 6); ledge(r, 27, 33, 11);   // the cots, two high
  mark(r, 'npc', 20, 2, { who: 'hob' }); mark(r, 'torch', 20, 9);
  mark(r, 'urn', 9, 7); mark(r, 'urn', 30, 12); mark(r, 'crawler', 31, 2);
  return r;
}
function props(){
  const r = room(2, 1); walls(r); door(r, 'left', 2, 7); door(r, 'bottom', 50, 55); ledge(r, 50, 55, 1);   // boards over the hole down to the long level
  // the timbers: posts from floor to roof, a beam across, standing in the gallery the whole way along
  for (const x of [12, 26, 40, 64]){ rect(r, x, 2, x, 3); rect(r, x, 18, x, 20); }
  ledge(r, 16, 22, 8); ledge(r, 30, 36, 11); ledge(r, 44, 49, 8); ledge(r, 58, 63, 12); ledge(r, 68, 74, 8);
  rect(r, 46, 2, 49, 3, SPIKES);                                  // where the floor rotted: the old nails up
  mark(r, 'crawler', 22, 2); mark(r, 'crawler', 60, 2); mark(r, 'flitter', 34, 16); mark(r, 'flitter', 70, 15);
  mark(r, 'torch', 7, 8); mark(r, 'torch', 33, 14); mark(r, 'torch', 56, 9); mark(r, 'torch', 75, 13);
  mark(r, 'urn', 4, 2); mark(r, 'urn', 38, 2); mark(r, 'chest', 61, 13, { holds: 'shards' });
  return r;
}
function long(){
  const r = room(3, 1); walls(r); door(r, 'top', 90, 95); door(r, 'bottom', 10, 15);
  // the rail line along the whole level: the bed raised a little, the gap where the floor went into the dark
  rect(r, 2, 2, 117, 2); rect(r, 10, 2, 15, 2, LEDGE);   // over the hole to the cistern: boards, to drop through or come up onto
  rect(r, 40, 0, 51, 2, EMPTY); rect(r, 40, 0, 51, 0, SPIKES);
  ledge(r, 43, 48, 6);                                            // a cart, stopped over the gap
  ledge(r, 82, 88, 7); ledge(r, 92, 98, 12); ledge(r, 88, 96, 17);   // staging up to the hole into the props, a jump apart, the last under it
  ledge(r, 16, 22, 7); ledge(r, 60, 66, 7); ledge(r, 100, 106, 8);   // carts off the line, to stand on
  mark(r, 'burrower', 28, 3); mark(r, 'crawler', 70, 3); mark(r, 'barnacle', 108, 3); mark(r, 'flitter', 56, 15);
  mark(r, 'torch', 8, 9); mark(r, 'torch', 34, 9); mark(r, 'torch', 62, 11); mark(r, 'torch', 104, 10);
  mark(r, 'crystal', 24, 3); mark(r, 'crystal', 80, 3);
  mark(r, 'urn', 4, 3); mark(r, 'urn', 74, 3); mark(r, 'urn', 115, 3); mark(r, 'chest', 104, 9, { holds: 'thread' });
  return r;
}
function cistern(){
  const r = room(2, 2); walls(r); door(r, 'top', 10, 15);
  // the water came in here and stayed: a deep basin across the floor, stone steps down into it, the roof high
  rect(r, 20, 1, 66, 3, EMPTY);
  // the guild's ladder of staging down from the hole in the roof, a jump apart: the way back up as well as down
  // (marked 'keep' over each, so the wear on the rock leaves room to stand on them)
  for (const [x0, x1, y] of [[6, 11, 7], [14, 20, 12], [6, 11, 17], [14, 20, 22], [6, 11, 27], [14, 20, 32], [6, 11, 37], [10, 15, 42]]){ ledge(r, x0, x1, y); mark(r, 'keep', x0 + 2, y + 2); mark(r, 'keep', x1 - 1, y + 3); }
  ledge(r, 30, 38, 10); ledge(r, 48, 56, 10); ledge(r, 66, 74, 16);                     // stones standing out of the water
  mark(r, 'pool', 20, 1, { w: 47, plain: true });
  mark(r, 'lamprey', 34, 30); mark(r, 'lamprey', 52, 34); mark(r, 'lamprey', 70, 30);
  mark(r, 'barnacle', 12, 4); mark(r, 'barnacle', 72, 4);
  mark(r, 'torch', 6, 26); mark(r, 'torch', 40, 16); mark(r, 'torch', 74, 22);
  mark(r, 'crystal', 34, 11); mark(r, 'crystal', 52, 11);
  mark(r, 'chest', 70, 17, { holds: 'relic:tally' });
  return r;
}

// its look: the Roots' dark rock, cut and propped; timber at its lips, lamps and chains from its roofs
const themeDef = {
  stone: { edge: 'ink', lip: 'wood2', lip2: 'wood1', lipD: 2, lip2D: 2, a: 'dark', aSeam: 'deep', b: 'deep', bSeam: 'ink', c: 'ink', core: 'ink', seam: 'strata' },
  moss: { c: ['moss0', 'teal', 'moss0'], p: 0.08 }, plank: ['wood1', 'wood3', 'wood0', 'wood2'], spike: ['light', 'pale'],
  ceilLow: [['chain', 4], ['lantern', 3], ['stalactite', 2]], ceil: [['chain', 26], ['lantern', 24], ['root', 10], ['stalactite', 12], ['banner', 2]],
  floorWall: ['rubble', 'bones', 'crystal', 'rubble'], floorOpen: ['rubble', 'crystal', 'bones'], gem: 'crystal',
  back: { cols: ['ink', 'deep', 'wood0'], dim: [0.66, 0.68, 0.8], hole: 4.2, holeOpen: 4.2, stand: [['pillar', 5], ['arch', 2]], hang: [['chain', 40], ['root', 20], ['stalactite', 30]], pStand: 0.012, pHang: 0.02 },
  far: { img: 'workings', raw: true }, hemi: [0xffe6c8, 0x8a7a90, 0.9], shaft: null,
  amb: [0.42, 0.42, 0.56], mist: { col: 'deep', col2: 'ink', a: 0.32, drift: 0.12 }, fore: 'roots',
  air: { n: 60, cols: [0xffc880, 0xd0b090], warm: 0.6, vx: 0.12, vy: [0.02, 0.12] },
};

export default { name: 'The Workings', theme: 'workings', sub: 'the guild\'s mines, under the water', card: '', epithet: '',
  deep: true, depth: [-0.6, -0.1], musicOf: 'roots', ambOf: 'roots', vestibule: false, looks: { cage: 'roots' },
  seed: 3141592, cols: 3, wear: { sag: 0.7, swell: 0.6, humps: 0.5 },
  layout: [[0, 0, cistern, 2, 2], [2, 0, solid], [2, 1, solid], [0, 2, long, 3, 1], [0, 3, cage, 1, 2], [1, 3, props, 2, 1], [1, 4, tally], [2, 4, bunk]],
  themeDef };
