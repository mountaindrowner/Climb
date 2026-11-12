// The Firmament: the sixth region and the last, the true summit. Above the gardens, above the air almost: night, the
// stars huge and close, and an old observatory of pale stone and brass that someone built to read them. Its halls
// (the orrery, the archive, the lens room) are cut into the last of the rock; between them the way is in the open,
// over star-glass: planks of light that are there for half of each beat and gone for the other half (rooms.js GLASS_A /
// GLASS_B). A miss is a drop to the floor below, or one hurt on the glass shards, never the end of him. At the top
// stands the Fallen (fallen.js): what he left there.
//   threshold  the way in: two planks over a dip, to see how they keep time
//   terrace    the forecourt: two trenches of shards, each bridged by a pair of planks; a sentinel between
//   orrery     the hall of the great orrery: an arc of planks over the shards; a gallery up the wall
//   meridian   the long crossing: eight planks in a row, every other one there; keep moving with the beat
//   gnomon     the sundial's tower: a tall shaft of alternating planks (a floor half way up catches a fall)
//   archive    the first shrine (the Lamplighter); the scribe's books
//   lens       the great telescope's lens room: sentinel, two eyes, and something behind cracked stone
//   transit    out along the roof: rising air up the transit pier, planks down the far side
//   aphelion   a bloom throws him up to the planks and through the wall's window
//   vigil      the last shrine
//   ascension  bare rock and the last planks
//   zenith     the top of the mountain. The Fallen waits by the dark beacon
import { room, rect, door, ledge, mark, open, cave, EMPTY, SPIKES, CRACKED, GLASS_A, GLASS_B } from '../rooms.js';
const A = GLASS_A, B = GLASS_B;
// a trench of shards in a floor two tiles thick: a tile deep, so a fall into it is one hurt and a step out
// (base: the row its shards stand in; 1 where the floor is three thick, over open air, so nothing shows through from below)
const trench = (r, x0, x1, base = 0) => { rect(r, x0, base + 1, x1, base + 1, EMPTY); rect(r, x0, base, x1, base, SPIKES); };

function threshold(){
  const r = cave(); door(r, 'right', 2, 7);
  rect(r, 2, 2, 4, 3);
  rect(r, 16, 2, 19, 4); rect(r, 30, 2, 33, 4);                    // two blocks of the old wall, a dip between
  ledge(r, 20, 23, 4, A); ledge(r, 26, 29, 4, B);                  // the first star-glass: one, then the other
  mark(r, 'spawn', 6, 2); mark(r, 'npc', 11, 2, { who: 'scribe' }); mark(r, 'urn', 14, 2);
  mark(r, 'torch', 5, 8); mark(r, 'torch', 35, 8); mark(r, 'crystal', 24, 2); mark(r, 'crystal', 31, 5);
  return r;
}
function terrace(){
  const r = open(2, 1); rect(r, 0, 0, 79, 1); rect(r, 76, 2, 79, 22);   // the forecourt, and the foot of the orrery's tower
  rect(r, 9, 2, 12, 3);                                            // a plinth
  trench(r, 18, 31); ledge(r, 19, 23, 1, A); ledge(r, 26, 30, 1, B);
  trench(r, 46, 59); ledge(r, 47, 51, 1, B); ledge(r, 54, 58, 1, A);
  ledge(r, 62, 66, 5); ledge(r, 68, 74, 9); ledge(r, 62, 66, 13); ledge(r, 68, 74, 17); ledge(r, 68, 74, 21);   // up the tower's face
  mark(r, 'sentinel', 38, 2); mark(r, 'mote', 50, 7); mark(r, 'mote', 53, 9); mark(r, 'mote', 56, 7);
  mark(r, 'urn', 42, 2); mark(r, 'crystal', 35, 2); mark(r, 'crystal', 63, 2); mark(r, 'crystal', 10, 4); mark(r, 'torch', 4, 8); mark(r, 'torch', 72, 6);
  return r;
}
function orrery(){
  const r = cave(); rect(r, 2, 2, 37, 2);                           // its floor is three thick (the forecourt is under it)
  door(r, 'bottom', 28, 34); rect(r, 28, 2, 34, 2, EMPTY); ledge(r, 28, 34, 2); door(r, 'left', 3, 8);
  trench(r, 7, 24, 1);                                             // the shards under the orrery's arms
  ledge(r, 20, 23, 5, A); ledge(r, 14, 17, 7, B); ledge(r, 8, 11, 5, A);   // an arc over them
  ledge(r, 32, 37, 7); ledge(r, 33, 37, 11); ledge(r, 34, 37, 15);  // the gallery
  mark(r, 'chest', 36, 16, { holds: 'shards' });
  mark(r, 'oculus', 27, 12);
  mark(r, 'torch', 36, 5); mark(r, 'torch', 4, 10); mark(r, 'crystal', 26, 3); mark(r, 'crystal', 4, 3);
  return r;
}
// the long crossing, right to left: every other plank is there. Run the ones that are, jump the ones that are not
function meridian(){
  const r = open(2, 1); rect(r, 0, 0, 79, 2); rect(r, 0, 3, 2, 22);     // three thick here too
  trench(r, 44, 63, 1); ledge(r, 59, 63, 2, A); ledge(r, 54, 58, 2, B); ledge(r, 49, 53, 2, A); ledge(r, 44, 48, 2, B);
  trench(r, 16, 37, 1); ledge(r, 33, 37, 2, A); ledge(r, 28, 32, 2, B); ledge(r, 22, 27, 2, A); ledge(r, 16, 21, 2, B);
  ledge(r, 44, 47, 7, A); ledge(r, 38, 43, 11);                    // over the island between: a plank, and a shelf
  mark(r, 'chest', 40, 12, { holds: 'shards' });
  ledge(r, 4, 9, 6); ledge(r, 10, 15, 9); ledge(r, 4, 9, 13); ledge(r, 8, 14, 17); ledge(r, 8, 14, 21);   // up into the gnomon
  mark(r, 'oculus', 41, 15); mark(r, 'mote', 24, 8); mark(r, 'mote', 27, 10); mark(r, 'mote', 30, 8);
  mark(r, 'crystal', 40, 3); mark(r, 'crystal', 70, 3); mark(r, 'crystal', 12, 3); mark(r, 'torch', 74, 8); mark(r, 'torch', 5, 9);
  return r;
}
// the sundial's tower, two screens tall: planks up it in turn. The floor half way is whole: nothing falls past it
function gnomon(){
  const r = open(1, 2); rect(r, 0, 0, 39, 1); rect(r, 8, 0, 14, 1, EMPTY); ledge(r, 8, 14, 1);
  rect(r, 0, 2, 1, 45); rect(r, 36, 2, 39, 45); rect(r, 36, 2, 39, 7, EMPTY); rect(r, 36, 25, 39, 30, EMPTY);   // its walls; a door low to the archive, one high onto the roof
  ledge(r, 16, 22, 5); ledge(r, 24, 28, 9, A); ledge(r, 2, 35, 13);                  // to the floor half way
  ledge(r, 26, 30, 17, B); ledge(r, 18, 22, 21, A); ledge(r, 28, 35, 24);            // and on, to the high door
  ledge(r, 9, 13, 24, B); ledge(r, 2, 6, 28);                                        // a way aside, to what was left on the top shelf
  mark(r, 'thread', 4, 29);
  mark(r, 'wraith', 12, 6); mark(r, 'wraith', 8, 32); mark(r, 'oculus', 6, 19); mark(r, 'mote', 22, 28); mark(r, 'mote', 25, 30); mark(r, 'mote', 28, 28);
  mark(r, 'torch', 4, 5); mark(r, 'torch', 33, 16); mark(r, 'torch', 33, 27); mark(r, 'crystal', 30, 2); mark(r, 'crystal', 20, 14); mark(r, 'crystal', 4, 14); mark(r, 'urn', 26, 2);
  return r;
}
function archive(){
  const r = cave(); door(r, 'left', 2, 7); door(r, 'right', 2, 7);
  rect(r, 13, 2, 27, 2); rect(r, 15, 3, 25, 3);                    // the dais, stepped
  ledge(r, 5, 11, 9); ledge(r, 29, 35, 9);
  mark(r, 'shrine', 20, 4); mark(r, 'npc', 9, 2, { who: 'lamplighter' });
  mark(r, 'urn', 30, 2); mark(r, 'urn', 33, 2); mark(r, 'crystal', 8, 10); mark(r, 'crystal', 32, 10); mark(r, 'torch', 4, 14); mark(r, 'torch', 36, 14); mark(r, 'torch', 14, 9); mark(r, 'torch', 26, 9);
  return r;
}
// the lens room: its keeper, its two eyes, and behind the cracked pier what the astronomers steered by
function lens(){
  const r = cave(); door(r, 'left', 2, 7);
  ledge(r, 8, 12, 5, A); ledge(r, 14, 18, 9, B); ledge(r, 20, 26, 12);
  mark(r, 'chest', 23, 13, { holds: 'shards' });
  rect(r, 31, 7, 37, 20); rect(r, 31, 2, 32, 6, CRACKED);          // the pier, and where it has split
  mark(r, 'chest', 35, 2, { holds: 'relic:starcompass' });
  mark(r, 'sentinel', 22, 2); mark(r, 'oculus', 13, 14); mark(r, 'oculus', 27, 15);
  mark(r, 'torch', 4, 9); mark(r, 'torch', 28, 4); mark(r, 'crystal', 16, 2); mark(r, 'crystal', 35, 3); mark(r, 'urn', 6, 2); mark(r, 'urn', 28, 2);
  return r;
}
// out along the roof of the halls: rising air up the transit's pier, planks down its far side over the shards
function transit(){
  const r = open(2, 1); rect(r, 0, 0, 79, 1); rect(r, 76, 2, 79, 22);
  rect(r, 34, 2, 45, 16);                                          // the pier
  mark(r, 'updraft', 28, 2, { w: 5, h: 15 });
  trench(r, 52, 59);
  ledge(r, 47, 51, 14, A); ledge(r, 54, 58, 11, B);                // down from the pier
  ledge(r, 62, 66, 9); ledge(r, 68, 72, 5); ledge(r, 68, 72, 13); ledge(r, 62, 66, 17); ledge(r, 66, 72, 21);   // and up, to the aphelion
  mark(r, 'npc', 42, 17, { who: 'wren' });
  mark(r, 'sentinel', 15, 2); mark(r, 'squall', 23, 2); mark(r, 'oculus', 56, 17);
  mark(r, 'urn', 8, 2); mark(r, 'crystal', 26, 2); mark(r, 'crystal', 38, 17); mark(r, 'crystal', 64, 2); mark(r, 'torch', 4, 7); mark(r, 'torch', 74, 8);
  return r;
}
// a wall with a window high in it, and a bloom to throw him at it: the planks are the last step
function aphelion(){
  const r = open(); rect(r, 0, 0, 39, 1); rect(r, 26, 0, 32, 1, EMPTY); ledge(r, 26, 32, 1); rect(r, 38, 2, 39, 22);
  rect(r, 8, 2, 11, 14); rect(r, 8, 21, 11, 22);                   // the wall; its window
  mark(r, 'bloom', 21, 2);
  ledge(r, 17, 20, 13, A); ledge(r, 12, 15, 14, B);
  ledge(r, 30, 36, 10); mark(r, 'chest', 34, 11, { holds: 'shards' });
  mark(r, 'sentinel', 4, 2); mark(r, 'squall', 35, 2);
  mark(r, 'crystal', 24, 2); mark(r, 'crystal', 10, 15); mark(r, 'torch', 36, 5); mark(r, 'torch', 2, 8);
  return r;
}
function vigil(){
  const r = cave(); door(r, 'left', 2, 7); door(r, 'right', 2, 7);
  rect(r, 9, 2, 21, 2); rect(r, 11, 3, 19, 3);                     // the last shrine's step
  ledge(r, 22, 26, 6); rect(r, 26, 10, 37, 11); rect(r, 31, 12, 32, 16, CRACKED); rect(r, 31, 17, 37, 20);   // a shelf under the roof, walled up
  mark(r, 'thread', 35, 12);
  mark(r, 'shrine', 15, 4); mark(r, 'urn', 26, 2); mark(r, 'urn', 5, 2); mark(r, 'crystal', 30, 2); mark(r, 'crystal', 34, 2);
  mark(r, 'torch', 4, 9); mark(r, 'torch', 24, 12); mark(r, 'torch', 36, 6);
  return r;
}
function ascension(){
  const r = open(); rect(r, 0, 0, 39, 1); rect(r, 0, 2, 1, 22);
  ledge(r, 28, 33, 5); ledge(r, 20, 25, 9, A); ledge(r, 13, 18, 13, B); ledge(r, 8, 14, 17); ledge(r, 8, 14, 21);
  mark(r, 'mote', 24, 6); mark(r, 'mote', 27, 8); mark(r, 'mote', 30, 6);
  mark(r, 'crystal', 34, 2); mark(r, 'crystal', 5, 2); mark(r, 'torch', 36, 8);
  return r;
}
// the top of the mountain: a long bare floor under the whole sky, the dark beacon at its far end, and the one who stayed
function zenith(){
  const r = open(2, 2); rect(r, 0, 0, 79, 1); rect(r, 8, 0, 14, 1, EMPTY); ledge(r, 8, 14, 1);
  rect(r, 0, 2, 3, 30); rect(r, 76, 2, 79, 30);                    // a horn of rock at either end
  ledge(r, 20, 26, 6, A); ledge(r, 53, 59, 6, B); ledge(r, 36, 43, 10, A);
  mark(r, 'boss', 40, 2); mark(r, 'exit', 68, 2);
  mark(r, 'torch', 18, 3); mark(r, 'torch', 61, 3); mark(r, 'crystal', 30, 2); mark(r, 'crystal', 49, 2);
  return r;
}
// the mountain's last shoulder, beside the summit
function shoulder(){ const r = room(); rect(r, 0, 0, r.w - 1, r.h - 1); r.filler = true; return r; }
function shoulderTop(){ const r = room(); rect(r, 0, 0, r.w - 1, 9); rect(r, 0, 10, 14, 13); rect(r, 0, 14, 6, 16); r.filler = true; return r; }

// ---- its look: night stone dressed in blocks, a line of brass let into every floor, brass instruments, star-glass
const themeDef = {
  stone: { edge: 'ink', topEdge: 'fire2', lip: 'pale', lip2: 'light', lipD: 2, lip2D: 4, a: 'mid', aSeam: 'dark', b: 'dark', bSeam: 'deep', c: 'deep', core: 'ink', seam: 'brick', band: [8, 12, 16] },
  moss: { c: ['pale', 'white', 'light'], p: 0.04 }, plank: ['rust', 'fire2', 'wood1', 'fire3'], spike: ['cyan', 'white'],
  ceilLow: [['chain', 3], ['orb', 4]], ceil: [['orb', 40], ['chain', 18], ['lantern', 10], ['banner', 8]],
  floorWall: ['armillary', 'telescope', 'rubble', 'books', 'statue', 'urn'], floorOpen: ['armillary', 'rubble', 'telescope', 'brazier'], gem: 'starlamp',
  back: { cols: ['ink', 'deep', 'dark'], dim: [0.8, 0.8, 1.0], hole: 8, holeOpen: 1.8, stand: [['pillar', 5], ['arch', 5], ['armillary', 2]], hang: [['chain', 60], ['orb', 40]], pStand: 0.012, pHang: 0.01,
    wall: [['starchart', 5], ['shelf', 3], ['banner', 2]], pWall: 0.0012, brick: true },
  far: { img: 'firmament', raw: true }, hemi: [0xdfe6ff, 0x8a86c8, 0.98], shaft: null, bloom: [0.78, 0.7],
  amb: [0.72, 0.76, 1.0], ambIn: [0.5, 0.52, 0.74], mist: { col: 'plum', col2: 'deep', a: 0.16, drift: 0.08 }, fore: null,
  air: { n: 110, cols: [0xffffff, 0x9fe8ff], warm: 0.35, vx: 0.06, vy: [0.01, 0.08] },
};
// the observatory's things. (x, y): the foot of what stands, the top of what hangs
const deco = (px, PAL) => {
  const ring = (g, cx, cy, rx, ry, col, tilt = 0) => { for (let a = 0; a < 64; a++){ const t = a / 64 * Math.PI * 2, x = Math.cos(t) * rx, y = Math.sin(t) * ry; px(g, col, cx + x * Math.cos(tilt) - y * Math.sin(tilt), cy + x * Math.sin(tilt) + y * Math.cos(tilt)); } };
  const star = (g, x, y, big) => { px(g, PAL.cyan, x - 1, y, 3, 1); px(g, PAL.cyan, x, y - 1, 1, 3); px(g, PAL.white, x, y); if (big){ px(g, PAL.cyan, x - 2, y); px(g, PAL.cyan, x + 2, y); px(g, PAL.cyan, x, y - 2); px(g, PAL.cyan, x, y + 2); } };
  return {
    // an armillary sphere on its stand: brass rings about a star
    armillary(g, x, y, r, glow){ const R = 5 + Math.floor(r() * 3), cy = y - 7 - R;
      px(g, PAL.ink, x - 4, y - 2, 9, 2); px(g, PAL.rust, x - 3, y - 2, 7, 1); px(g, PAL.ink, x - 1, y - 7, 3, 5); px(g, PAL.fire2, x, y - 7, 1, 5);
      ring(g, x, cy, R + 1, R + 1, PAL.ink); ring(g, x, cy, R, R, PAL.fire2); ring(g, x, cy, R, R * 0.35, PAL.rust, 0.5); ring(g, x, cy, R * 0.4, R, PAL.fire3, 0.2);
      star(g, x, cy, false); glow && r() < 0.5 && glow(x, cy, 'crystal'); },
    // a telescope on a tripod, turned up to the sky
    telescope(g, x, y, r){ const dir = r() < 0.5 ? -1 : 1;
      for (let k = 0; k < 8; k++){ px(g, PAL.ink, x - 3 + Math.round(k * 0.4) - 1, y - 1 - k, 3, 1); px(g, PAL.wood1, x - 3 + Math.round(k * 0.4), y - 1 - k); px(g, PAL.ink, x + 3 - Math.round(k * 0.4) - 1, y - 1 - k, 3, 1); px(g, PAL.wood1, x + 3 - Math.round(k * 0.4), y - 1 - k); }
      for (let k = -5; k <= 8; k++){ const tx = x + dir * k, ty = y - 10 - Math.round(k * 0.6), w = k > 4 ? 4 : 3; px(g, PAL.ink, tx - 1, ty - 1, 3, w + 2); px(g, k % 5 === 0 ? PAL.rust : PAL.fire2, tx, ty, 1, w); px(g, PAL.fire3, tx, ty, 1, 1); }
      px(g, PAL.cyan, x + dir * 9, y - 15, 1, 3); px(g, PAL.white, x + dir * 9, y - 14); },
    // a little world hung on a wire, from the orrery's arms
    orb(g, x, y, r){ const L = 5 + Math.floor(r() * 14), R = 2 + Math.floor(r() * 2), cols = [[PAL.rust, PAL.fire2], [PAL.plum, PAL.pink], [PAL.navy, PAL.blue], [PAL.mid, PAL.pale]][Math.floor(r() * 4)];
      for (let k = 0; k < L; k++) px(g, k % 3 ? PAL.mid : PAL.light, x, y + k);
      const cy = y + L + R; for (let yy = -R - 1; yy <= R + 1; yy++) for (let xx = -R - 1; xx <= R + 1; xx++){ const d = Math.hypot(xx, yy); if (d <= R + 0.9) px(g, d > R + 0.2 ? PAL.ink : xx + yy < -1 ? cols[1] : cols[0], x + xx, cy + yy); }
      if (r() < 0.4){ px(g, PAL.fire2, x - R - 2, cy + 1, 2, 1); px(g, PAL.fire2, x + R + 1, cy - 1, 2, 1); } },
    // a star kept in a lamp: the Firmament's crystal
    starlamp(g, x, y, r, glow){ px(g, PAL.ink, x - 3, y - 2, 7, 2); px(g, PAL.rust, x - 2, y - 2, 5, 1); px(g, PAL.ink, x - 1, y - 5, 3, 3); px(g, PAL.fire2, x, y - 5, 1, 3);
      const cy = y - 9; px(g, PAL.ink, x - 3, cy - 3, 7, 7); px(g, PAL.navy, x - 2, cy - 2, 5, 5); star(g, x, cy, true); px(g, PAL.fire2, x - 3, cy - 3, 7, 1); px(g, PAL.fire2, x - 3, cy + 3, 7, 1);
      glow && glow(x, cy, 'crystal'); },
    // a brass bowl of cold fire
    brazier(g, x, y, r, glow){ px(g, PAL.ink, x - 1, y - 6, 3, 6); px(g, PAL.rust, x, y - 6, 1, 6); px(g, PAL.ink, x - 3, y - 1, 7, 1); px(g, PAL.ink, x - 5, y - 9, 11, 4); px(g, PAL.fire2, x - 4, y - 8, 9, 2); px(g, PAL.fire3, x - 4, y - 8, 9, 1);
      px(g, PAL.blue, x - 2, y - 11, 5, 2); px(g, PAL.cyan, x - 1, y - 13, 3, 3); px(g, PAL.white, x, y - 12, 1, 2); px(g, PAL.cyan, x + (r() < 0.5 ? -1 : 1), y - 15);
      glow && glow(x, y - 11, 'crystal'); },
    // a chart of the sky, framed, on the wall
    starchart(g, x, y, r){ const w = 22, h = 14; px(g, PAL.ink, x - 1, y - h - 1, w + 2, h + 2); px(g, PAL.rust, x, y - h, w, h); px(g, PAL.ink, x + 1, y - h + 1, w - 2, h - 2); px(g, PAL.deep, x + 2, y - h + 2, w - 4, h - 4);
      let lx = x + 4 + Math.floor(r() * 3), ly = y - h + 4 + Math.floor(r() * 5);
      for (let k = 0; k < 5; k++){ const nx = lx + 2 + Math.floor(r() * 3), ny = y - h + 3 + Math.floor(r() * (h - 7)); const n = Math.max(Math.abs(nx - lx), Math.abs(ny - ly)); for (let q = 0; q <= n; q++) px(g, PAL.dark, Math.round(lx + (nx - lx) * q / n), Math.round(ly + (ny - ly) * q / n)); px(g, k % 2 ? PAL.white : PAL.cyan, lx, ly); lx = nx; ly = ny; if (lx > x + w - 5) break; }
      px(g, PAL.fire3, lx, ly); },
  };
};

// ---- its creatures (numbers here; how each fights, in `ai` below)
//   sentinel  a brass knight with a halberd. Slow and heavy: it raises the halberd (the tell) and brings it down a long
//             way in front of it. His ordinary cuts do not move it; a finishing cut or a plunge staggers it. Block it,
//             or raise the block as it lands to turn the blow and leave it open
//   oculus    a brass eye adrift. It turns to him, takes its aim (a thin red line that follows him, then holds), and
//             fires along that line. The beam does not follow: step off the line, or roll through it
//   mote      a small star that comes for him, slowly, through anything. One cut puts it out; touched, it bursts
const enemies = {
  sentinel: { ai: 'sentinel', hp: 7, w: 0.7, h: 3.0, color: 0xfeae34, wake: 9, reach: 2.9, chase: 1.5, windup: 0.72, swing: 0.2, recover: 0.95, stun: 1.0, art: 'px_sentinel', fly: false, word: 'Cloven',
    onHit(e, dmg, P, slam){ if (!slam) e.x -= P.face * 0.3;                       // it is not pushed about
      if ((dmg >= 2 || slam) && e.st !== 'stunned'){ e.st = 'stunned'; e.tm = 0; e.stunT = slam ? 1.2 : 0.9; } } },
  oculus: { ai: 'oculus', hp: 2, w: 0.5, h: 1.4, color: 0x2ce8f5, glow: 0x081828, wake: 11, range: 11, charge: 1.05, lock: 0.38, fire: 0.5, cooldown: 2.3, art: 'px_oculus', fly: true, word: 'Seared',
    onHit(e){ if (e.hp <= 0) for (const m of [e.aim, e.beam, e.core]) if (m) m.visible = false; } },
  mote: { ai: 'mote', hp: 1, w: 0.32, h: 0.75, color: 0xfee761, glow: 0x4a3a10, wake: 8.5, speed: 2.7, art: 'px_mote', fly: true, word: 'Burned by a star' },
};
// is there rock between two points? (a creature that has to see him)
const sees = (c, x0, y0, x1, y1) => { const L = Math.hypot(x1 - x0, y1 - y0), n = Math.ceil(L / 0.4); for (let k = 1; k < n; k++) if (c.solidAt(x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n)) return false; return true; };
// a mote keeps to its own part of the sky: it will not follow him up into the next room, or along for ever
const near = (e, P) => Math.abs(P.y + 1.2 - e.home.y) < 6 && Math.abs(P.x - e.home.x) < 15;
const ai = {
  sentinel(e, P, dt, c){
    const d = e.d, gy = c.ground(e.x, e.y + 0.3); if (gy > -Infinity) e.y = gy;
    const adx = Math.abs(c.dx), ady = Math.abs(c.dy);
    if (e.st === 'idle'){ e.moving = false; if (adx < d.wake && ady < 3) c.go('march'); }
    else if (e.st === 'march'){
      e.face = Math.sign(c.dx) || e.face; e.moving = false;
      const nx = e.x + e.face * d.chase * dt;
      if (adx > d.reach - 1.0 && !c.solidAt(nx + e.face * d.w, e.y + 0.3) && c.ground(nx + e.face * 0.3, e.y + 0.3) > e.y - 0.6){ e.x = nx; e.moving = true; e.walk = (e.walk || 0) + dt; }
      if (adx < d.reach - 0.4 && ady < 1.8 && e.tm > 0.3){ c.go('windup'); c.events.push({ type: 'tell', e }); }
      else if (adx > d.wake * 1.7) c.go('idle');
    }
    else if (e.st === 'windup'){ if (e.tm >= d.windup){ c.go('swing'); e.hit = false; } }
    else if (e.st === 'swing'){
      // the halberd comes down along the floor in front of it
      const x0 = Math.min(e.x, e.x + e.face * d.reach), x1 = Math.max(e.x, e.x + e.face * d.reach);
      if (!e.hit && e.tm > 0.04 && P.x + 0.34 > x0 && P.x - 0.34 < x1 && P.y < e.y + 2.7 && P.y + P.h > e.y && !c.isRollInv(P)){
        e.hit = true;
        if (P.blocking && P.face === -e.face){ const parry = performance.now() / 1000 - (P.blockAt || -9) < 0.18;
          c.events.push({ type: parry ? 'parry' : 'block', at: { x: P.x + P.face * 0.5, y: P.y + 1.3 } });
          if (parry){ c.go('stunned'); e.stunT = 1.6; } else P.vx = e.face * 5; }
        else c.hurt(P, 1, e.x, d.word);
      }
      if (e.st === 'swing' && e.tm >= d.swing) c.go('recover');
    }
    else if (e.st === 'recover'){ if (e.tm >= d.recover) c.go('march'); }
    else if (e.st === 'stunned'){ if (e.tm >= (e.stunT || d.stun)){ e.stunT = 0; c.go('march'); } }
    // a body: standing, he cannot walk through it (a roll can)
    if (P.roll <= 0 && Math.abs(P.x - e.x) < 0.6 && P.y < e.y + 1.6 && P.y > e.y - 0.5){ const side = Math.sign(P.x - e.x) || -e.face; P.x = e.x + side * 0.6; if (Math.sign(P.vx) === -side) P.vx = 0; }
    e.warn = e.st === 'windup';
    const st = e.st;
    if (st === 'windup') c.anim(e, 'attack', 0.12 + e.tm / d.windup * 0.2);          // the halberd goes up
    else if (st === 'swing') c.anim(e, 'attack', 0.34 + e.tm / d.swing * 0.3);       // and comes down
    else if (st === 'recover') c.anim(e, 'attack', 0.66 + Math.min(0.33, e.tm / 0.35 * 0.33));
    else if (st === 'stunned') c.anim(e, 'attack', 0.9 + Math.sin(e.tm * 30) * 0.02);
    else c.anim(e, 'walk', e.moving ? (e.walk || 0) * 0.85 : 0);
  },
  oculus(e, P, dt, c){
    const d = e.d, TH = window.THREE;
    e.x = e.home.x + Math.sin(e.age * 0.7) * 0.5; e.y = e.home.y + Math.sin(e.age * 1.3) * 0.25;
    e.cd = Math.max(0, (e.cd || 0) - dt);
    if (!e.aim){   // its aim, its beam and the beam's heart: bars from its eye along +x, turned to where it looks
      const geo = new TH.PlaneGeometry(1, 1); geo.translate(0.5, 0, 0);
      const bar = (col, z) => { const m = new TH.Mesh(geo, new TH.MeshBasicMaterial({ color: col, transparent: true, opacity: 0, depthWrite: false, blending: TH.AdditiveBlending })); m.visible = false; m.position.z = z; c.E.scene.add(m); return m; };
      e.aim = bar(0xff4838, 0.3); e.beam = bar(0x58d8ff, 0.3); e.core = bar(0xffffff, 0.32); e.ang = 0; e.len = 1;
    }
    const ex = e.x + e.face * 0.25, ey = e.y - 0.05, ca = Math.cos(e.ang), sa = Math.sin(e.ang);   // its eye
    const lay = (m, len, wid) => { m.position.x = ex; m.position.y = ey; m.rotation.z = e.ang; m.scale.set(len, wid, 1); };
    if (e.st === 'idle'){
      e.face = Math.sign(c.dx) || e.face;
      if (c.dist < d.range && Math.abs(c.dy) < 7 && e.cd <= 0 && sees(c, ex, ey, P.x, P.y + 1.2)){ c.go('charge'); c.events.push({ type: 'tell', e }); e.ang = Math.atan2(P.y + 1.2 - ey, P.x - ex); }
    }
    else if (e.st === 'charge'){
      if (e.tm < d.charge - d.lock){ let want = Math.atan2(P.y + 1.2 - ey, P.x - ex), dA = want - e.ang; while (dA > Math.PI) dA -= Math.PI * 2; while (dA < -Math.PI) dA += Math.PI * 2; e.ang += dA * Math.min(1, dt * 9); e.face = Math.cos(e.ang) < 0 ? -1 : 1; }
      let L = 0.5; while (L < d.range + 5 && !c.solidAt(ex + Math.cos(e.ang) * L, ey + Math.sin(e.ang) * L)) L += 0.25; e.len = L;
      if (e.tm >= d.charge){ c.go('fire'); e.hit = false; c.events.push({ type: 'spit', e }); }
    }
    else if (e.st === 'fire'){
      if (!e.hit) for (let s = 0.5; s < e.len; s += 0.4){ const bx = ex + ca * s, by = ey + sa * s; if (c.hit(bx - 0.22, by - 0.22, bx + 0.22, by + 0.22, d.word, bx - ca)){ e.hit = true; break; } }
      if (c.E.R){ c.E.R.glint(ex, ey, 0x58d8ff, 0.9, 4.5); c.E.R.glint(ex + ca * e.len, ey + sa * e.len, 0x58d8ff, 0.7, 3.5); }
      if (Math.random() < 0.7) c.fx.burst({ x: ex + ca * e.len, y: ey + sa * e.len }, 2, 0x9ff6ff);
      if (e.tm >= d.fire){ c.go('idle'); e.cd = d.cooldown; }
    }
    const ch = e.st === 'charge', fi = e.st === 'fire', held = ch && e.tm >= d.charge - d.lock;
    e.aim.visible = ch; if (ch){ lay(e.aim, e.len, held ? 2 / 16 : 1 / 16); e.aim.material.opacity = held ? (Math.floor(e.tm * 24) % 2 ? 1 : 0.5) : 0.3 + 0.25 * Math.sin(e.tm * 26); }
    e.beam.visible = e.core.visible = fi; if (fi){ const k = 1 - e.tm / d.fire; lay(e.beam, e.len, 0.2 + 0.4 * k); e.beam.material.opacity = 0.55 + 0.3 * k; lay(e.core, e.len, 0.06 + 0.12 * k); e.core.material.opacity = 1; }
    e.warn = ch;
    c.anim(e, ch || fi ? 'cast' : 'float', fi ? 0.72 : ch ? e.tm / d.charge * 0.72 : e.age * 0.9);
  },
  mote(e, P, dt, c){
    const d = e.d;
    if (e.st === 'idle'){ e.x = e.home.x + Math.sin(e.age * 1.1) * 0.3; e.y = e.home.y + Math.sin(e.age * 1.9) * 0.2; if (c.dist < d.wake && near(e, P) && sees(c, e.x, e.y, P.x, P.y + 1.2)){ c.go('seek'); e.vx = e.vy = 0; } }
    else {
      const home = e.st === 'home', tx = home ? e.home.x : P.x, ty = home ? e.home.y : P.y + 1.2, L = Math.hypot(tx - e.x, ty - e.y) || 1, k = Math.min(1, dt * 2.2);
      e.vx += ((tx - e.x) / L * d.speed - e.vx) * k; e.vy += ((ty - e.y) / L * d.speed - e.vy) * k;
      e.x += (e.vx + Math.cos(e.age * 5 + e.home.x) * 0.5) * dt; e.y += (e.vy + Math.sin(e.age * 4 + e.home.y) * 0.5) * dt; e.face = Math.sign(e.vx) || e.face;
      if (home){ if (L < 0.3) c.go('idle'); else if (c.dist < d.wake * 0.8 && near(e, P) && e.tm > 1.5) c.go('seek'); }
      else if (c.dist > d.wake * 2.4 || !near(e, P)) c.go('home');
      else if (P.hp > 0 && c.hit(e.x - 0.3, e.y - 0.3, e.x + 0.3, e.y + 0.3, d.word, e.x)){   // it bursts on him, and is gone (no embers for that)
        e.alive = false; e.dead = 0; if (e.sprite) e.sprite.g.visible = false; e.stand.visible = false;
        c.fx.burst({ x: e.x, y: e.y }, 18, 0xfee761); c.fx.ring({ x: e.x, y: e.y }, 0xffffff); if (c.E.R) c.E.R.glint(e.x, e.y, 0xfee761, 1, 4, 0.3); return;
      }
    }
    if (Math.random() < 0.18) c.fx.burst({ x: e.x, y: e.y - 0.2 }, 1, 0xfee761);
    c.anim(e, 'idle', e.age * 1.3);
  },
};

// ---- the score made as it plays (the fallback under the recorded music): the climb's tune, a third lower, in bells
// over a long still chord; the last fight takes it at more than twice the pace
const _ = null;
const TUNE = { prog: [{ b: 38, n: [50, 53, 57] }, { b: 34, n: [50, 53, 58] }, { b: 43, n: [50, 55, 58] }, { b: 45, n: [49, 52, 57] }],
  tune: [[0, 0, 74, 4], [0, 4, 76, 4], [0, 8, 77, 4], [0, 12, 81, 14], [2, 0, 74, 4], [2, 4, 77, 4], [2, 8, 79, 4], [2, 12, 82, 14], [4, 0, 79, 4], [4, 4, 81, 4], [4, 8, 82, 4], [4, 12, 86, 14], [6, 0, 81, 6], [6, 6, 79, 6], [6, 12, 77, 4], [7, 0, 76, 12]] };
const songs = {
  firmament: { set: TUNE, shift: -3, bpm: 60, pad: { g: 0.36, cut: 2300 }, bass: { g: 0.2, at: [0] }, arp: { inst: 'bell', g: 0.07, oct: 24, pat: [0, _, _, 3, _, _, 2, _, _, 4, _, _, 1, _, _, _] }, lead: { inst: 'bell', g: 0.2, oct: 12, every: 2 }, wind: 0.12 },
  boss_firmament: { set: TUNE, shift: -3, bpm: 152, pad: { g: 0.2, cut: 1500, stab: true }, bass: { g: 0.34, at: [0, 2, 4, 6, 8, 10, 12, 14], drive: true },
    arp: { inst: 'harpsi', g: 0.1, oct: 12, pat: [0, 2, 1, 2, 3, 2, 1, 2, 0, 2, 1, 2, 4, 3, 2, 1] }, lead: { inst: 'bell', g: 0.2, oct: 0, every: 1 }, drums: { kick: [0, 6, 8, 14], snare: [4, 12], hat: [0, 2, 4, 6, 8, 10, 12, 14], g: 0.5 } },
};

// ---- the sky's own: now and then a star falls across it, behind everything
const SKY = { m: null, t: 4, life: 0 };
function tick(dt, time, ctx){
  const TH = typeof window !== 'undefined' && window.THREE, R = ctx.R; if (!TH || !R || !R.scene) return;
  if (!SKY.m || SKY.m.parent !== R.scene){
    const g = new TH.PlaneGeometry(1, 1); g.translate(-0.5, 0, 0);   // its head at the origin, its tail behind
    SKY.m = new TH.Mesh(g, new TH.MeshBasicMaterial({ color: 0xdff6ff, transparent: true, opacity: 0, depthWrite: false, blending: TH.AdditiveBlending })); SKY.m.position.z = -45; R.scene.add(SKY.m); SKY.life = 0;
  }
  const m = SKY.m; SKY.t -= dt;
  if (SKY.life <= 0 && SKY.t <= 0){ const cam = R.camera.position; SKY.dir = Math.random() < 0.5 ? -1 : 1; SKY.x = cam.x - SKY.dir * (2 + Math.random() * 7); SKY.y = cam.y + 2.5 + Math.random() * 3; SKY.life = SKY.max = 0.6 + Math.random() * 0.5; SKY.t = 5 + Math.random() * 9; }
  if (SKY.life > 0){
    SKY.life -= dt; const u = 1 - SKY.life / SKY.max, k = Math.sin(Math.PI * Math.min(1, u));
    SKY.x += SKY.dir * 15 * dt; SKY.y -= 5 * dt; m.position.x = Math.round(SKY.x * 16) / 16; m.position.y = Math.round(SKY.y * 16) / 16; m.rotation.z = Math.atan2(-5, SKY.dir * 15);
    m.scale.set(0.6 + 2.6 * k, 1 / 16, 1); m.material.opacity = 0.9 * k;
  } else m.material.opacity = 0;
}

export default { name: 'The Firmament', theme: 'firmament', sub: 'the summit, among the stars', card: 'The last of the mountain. The stars are close.', epithet: 'WHAT HE LEFT AT THE TOP',
  quiet: ['zenith'], seed: 7770123, fill: EMPTY, sky: true, cols: 3, wear: { sag: 0.5, swell: 0.4, humps: 0.3 }, themeDef, deco, enemies, ai, songs, tick,
  layout: [[0, 0, threshold], [1, 0, terrace, 2, 1], [0, 1, meridian, 2, 1], [2, 1, orrery], [0, 2, gnomon, 1, 2], [1, 2, archive], [2, 2, lens], [1, 3, transit, 2, 1],
    [0, 4, ascension], [1, 4, vigil], [2, 4, aphelion], [0, 5, zenith, 2, 2], [2, 5, shoulder], [2, 6, shoulderTop]] };
