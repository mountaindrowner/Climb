// The side view's world: a grid of tiles, half a unit square, climbing up through rooms joined by doorways, shafts and
// tunnels, the way a metroidvania's map is. Rooms are built from a few pieces (walls, doors, ledges, stairs, low
// tunnels) so each is easy to read and change; the region is a grid of rooms. Tile y counts up from the bottom.
//   0 empty   1 rock   2 ledge (one-way: stand on it, jump up through it)   3 spikes
// Markers (spawns, lights, the exit) are kept apart from the tiles, in tile coordinates.
export const T = 0.5;                       // a tile, in world units (the warrior is about 1.75 tall)
export const ROOM = { w: 40, h: 23 };       // a room is a screen: 20 x 11.5 units
export const EMPTY = 0, ROCK = 1, LEDGE = 2, SPIKES = 3;

// a room spans cw x ch screens (most are one)
function room(cw = 1, ch = 1){ const r = { w: ROOM.w * cw, h: ROOM.h * ch, tiles: [], marks: [] }; for (let y = 0; y < r.h; y++) r.tiles.push(new Array(r.w).fill(EMPTY)); return r; }
const put = (r, x, y, v) => { if (x >= 0 && y >= 0 && x < r.w && y < r.h) r.tiles[y][x] = v; };
const rect = (r, x0, y0, x1, y1, v = ROCK) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(r, x, y, v); };
const walls = r => { rect(r, 0, 0, r.w - 1, 1); rect(r, 0, r.h - 2, r.w - 1, r.h - 1); rect(r, 0, 0, 1, r.h - 1); rect(r, r.w - 2, 0, r.w - 1, r.h - 1); };
// openings in the border: left/right take rows y0..y1, top/bottom take columns x0..x1
const door = (r, side, a, b) => {
  if (side === 'left') rect(r, 0, a, 1, b, EMPTY); else if (side === 'right') rect(r, r.w - 2, a, r.w - 1, b, EMPTY);
  else if (side === 'top') rect(r, a, r.h - 2, b, r.h - 1, EMPTY); else rect(r, a, 0, b, 1, EMPTY);
};
const ledge = (r, x0, x1, y) => rect(r, x0, y, x1, y, LEDGE);
// stairs: n steps, each `run` tiles long and one tile (half a unit) high, rising toward dir (+1 right, -1 left), the
// rock filled in under them
function stairs(r, x, y, n, dir, run = 2){
  for (let i = 0; i < n; i++) for (let k = 0; k < run; k++){ const cx = x + dir * (i * run + k); rect(r, cx, 0, cx, y + i, ROCK); }
}
const mark = (r, type, x, y, extra) => r.marks.push({ type, x, y, ...extra });

// ---- the first region: up from the bottom of the mountain
function start(){
  const r = room(); walls(r); door(r, 'right', 2, 7);
  ledge(r, 8, 13, 6); rect(r, 2, 2, 4, 3);
  mark(r, 'spawn', 6, 2); mark(r, 'torch', 5, 7); mark(r, 'torch', 30, 7); mark(r, 'crystal', 20, 2);
  return r;
}
function corridor(){
  const r = room(); walls(r); door(r, 'left', 2, 7); door(r, 'top', 30, 36);
  rect(r, 16, 0, 21, 1, EMPTY); rect(r, 16, 0, 21, 0, SPIKES);   // a pit with spikes: jump it
  ledge(r, 30, 36, 6); ledge(r, 25, 30, 10); ledge(r, 32, 37, 14); ledge(r, 26, 31, 18);
  mark(r, 'crawler', 10, 2); mark(r, 'torch', 12, 8); mark(r, 'torch', 26, 6); mark(r, 'crystal', 37, 15);
  return r;
}
function shaft(){
  const r = room(); walls(r); door(r, 'bottom', 30, 36); door(r, 'left', 15, 19);
  rect(r, 2, 2, 22, 13);                                          // the rock the shaft is cut beside
  ledge(r, 33, 37, 5); ledge(r, 25, 29, 9); ledge(r, 33, 37, 13); ledge(r, 24, 28, 17);
  mark(r, 'flitter', 30, 16); mark(r, 'crystal', 24, 2); mark(r, 'crystal', 37, 20); mark(r, 'torch', 10, 17);
  return r;
}
function tunnel(){
  const r = room(); walls(r); door(r, 'right', 15, 19); door(r, 'top', 3, 8);
  rect(r, 2, 2, 37, 13);                                          // solid under the tunnel
  rect(r, 17, 17, 28, 20);                                        // a low stretch: crouch or roll under it
  stairs(r, 13, 14, 8, -1, 1);                                    // up to the hole in the roof
  mark(r, 'burrower', 30, 14); mark(r, 'torch', 33, 18); mark(r, 'crystal', 20, 14);
  return r;
}
function chamber(){
  const r = room(); walls(r); door(r, 'bottom', 3, 8); door(r, 'right', 2, 7); door(r, 'top', 26, 32);
  ledge(r, 12, 18, 5); ledge(r, 22, 28, 9); ledge(r, 10, 16, 13); ledge(r, 24, 32, 16); ledge(r, 26, 32, 20);
  rect(r, 18, 2, 20, 3);
  mark(r, 'flitter', 20, 12); mark(r, 'torch', 11, 15); mark(r, 'torch', 29, 18); mark(r, 'crystal', 30, 2); mark(r, 'crystal', 14, 14); mark(r, 'crawler', 30, 2);
  return r;
}
function ascent(){
  const r = room(); walls(r); door(r, 'left', 2, 7); door(r, 'right', 16, 20);
  stairs(r, 6, 2, 14, 1, 2);                                      // a long climb to the right
  mark(r, 'spitter', 20, 14); mark(r, 'torch', 8, 9); mark(r, 'torch', 30, 19); mark(r, 'crystal', 4, 2);
  return r;
}
function gallery(){
  const r = room(); walls(r); door(r, 'left', 16, 20); door(r, 'right', 2, 7);
  rect(r, 2, 2, 12, 15);                                          // the walkway in, high
  ledge(r, 14, 19, 12); ledge(r, 22, 27, 8);                      // down to the floor
  rect(r, 28, 0, 31, 1, EMPTY); rect(r, 28, 0, 31, 0, SPIKES);    // a spiked gap before the well
  rect(r, 16, 19, 18, 20); rect(r, 30, 18, 33, 20);               // teeth in the roof
  mark(r, 'crawler', 22, 2); mark(r, 'spitter', 35, 13); mark(r, 'torch', 6, 19); mark(r, 'torch', 25, 6); mark(r, 'crystal', 13, 2); mark(r, 'crystal', 36, 2);
  return r;
}
// two screens tall: ledges up to the arena, and a door halfway up to the grotto
function well(){
  const r = room(1, 2); walls(r); door(r, 'left', 2, 7); door(r, 'left', 38, 42); door(r, 'top', 30, 36);
  [[24, 32, 5], [8, 16, 9], [22, 30, 13], [30, 37, 17], [14, 22, 21], [2, 10, 25], [16, 24, 29], [8, 16, 33], [2, 12, 37], [18, 26, 40], [30, 36, 43]]
    .forEach(([a, b, y]) => ledge(r, a, b, y));
  mark(r, 'flitter', 20, 24); mark(r, 'flitter', 26, 36); mark(r, 'spitter', 36, 30);
  mark(r, 'torch', 34, 8); mark(r, 'torch', 4, 20); mark(r, 'torch', 34, 26); mark(r, 'torch', 20, 42); mark(r, 'crystal', 3, 2); mark(r, 'crystal', 37, 18); mark(r, 'crystal', 3, 26);
  return r;
}
function roost(){
  const r = room(); walls(r); door(r, 'bottom', 26, 32); door(r, 'right', 14, 18);
  ledge(r, 26, 32, 1);                                            // a step in the hole up from the chamber
  ledge(r, 16, 22, 5); ledge(r, 5, 11, 8); ledge(r, 14, 20, 11); ledge(r, 27, 37, 13);
  rect(r, 6, 16, 9, 20); rect(r, 20, 18, 23, 20);                 // hanging rock
  mark(r, 'flitter', 10, 14); mark(r, 'flitter', 30, 17); mark(r, 'torch', 3, 12); mark(r, 'torch', 34, 4); mark(r, 'crystal', 18, 2); mark(r, 'crystal', 35, 14);
  return r;
}
function bridge(){
  const r = room(); walls(r); door(r, 'left', 14, 18); door(r, 'right', 14, 18);
  rect(r, 2, 2, 37, 13);                                          // high ground both sides
  rect(r, 10, 2, 29, 13, EMPTY); rect(r, 10, 2, 29, 2, SPIKES);   // a chasm with spikes at the bottom
  ledge(r, 13, 15, 12); ledge(r, 19, 21, 14); ledge(r, 25, 27, 12);
  rect(r, 15, 18, 17, 20); rect(r, 24, 19, 26, 20);
  mark(r, 'flitter', 20, 17); mark(r, 'torch', 5, 17); mark(r, 'torch', 34, 17); mark(r, 'crystal', 20, 3); mark(r, 'crystal', 12, 3); mark(r, 'crystal', 28, 3);
  return r;
}
// a basin of crystals and the shrine: it fills the flask and is where you wake
function grotto(){
  const r = room(); walls(r); door(r, 'left', 14, 18); door(r, 'right', 15, 19);
  rect(r, 2, 2, 37, 13); rect(r, 12, 6, 27, 13, EMPTY);           // the floor, and the basin in it
  rect(r, 30, 14, 37, 14);                                        // a step up to the well
  mark(r, 'shrine', 20, 6); mark(r, 'crystal', 13, 6); mark(r, 'crystal', 26, 6); mark(r, 'crystal', 16, 6); mark(r, 'crystal', 23, 6);
  mark(r, 'torch', 6, 17); mark(r, 'torch', 33, 18);
  return r;
}
// the top: a vast cavern over a long stage. The Warden rises at the back of it; the way on opens when it falls
function arena(){
  const r = room(2, 2); walls(r); door(r, 'bottom', 70, 76);
  rect(r, 2, 2, 77, 8);                                           // the stage
  rect(r, 70, 0, 76, 8, EMPTY); ledge(r, 70, 76, 1); ledge(r, 70, 76, 5); ledge(r, 70, 76, 8);   // up through it
  ledge(r, 9, 17, 15); ledge(r, 62, 70, 15);                      // high ground at either end, out of the sweep
  mark(r, 'boss', 40, 9); mark(r, 'exit', 6, 9);
  mark(r, 'torch', 8, 13); mark(r, 'torch', 30, 12); mark(r, 'torch', 50, 12); mark(r, 'torch', 72, 13); mark(r, 'crystal', 20, 9); mark(r, 'crystal', 60, 9);
  return r;
}
// the region: rooms on a grid (column, row up)
// [column, row, builder, columns wide, rows tall]
const LAYOUT = [[0, 0, start], [1, 0, corridor], [1, 1, shaft], [0, 1, tunnel], [0, 2, chamber], [1, 2, ascent], [2, 2, gallery], [3, 2, well, 1, 2],
  [0, 3, roost], [1, 3, bridge], [2, 3, grotto], [2, 4, arena, 2, 2]];

export const LEVEL = (() => {
  const cols = Math.max(...LAYOUT.map(l => l[0] + (l[3] || 1))), rows = Math.max(...LAYOUT.map(l => l[1] + (l[4] || 1)));
  const W = cols * ROOM.w, H = rows * ROOM.h, tiles = new Uint8Array(W * H).fill(ROCK), marks = [], rooms = [];
  for (const [cx, cy, make] of LAYOUT){
    const r = make(), ox = cx * ROOM.w, oy = cy * ROOM.h;
    for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++) tiles[(oy + y) * W + ox + x] = r.tiles[y][x];
    for (const m of r.marks) marks.push({ ...m, x: ox + m.x, y: oy + m.y });
    rooms.push({ name: make.name, x0: ox * T, y0: oy * T, x1: (ox + r.w) * T, y1: (oy + r.h) * T });
  }
  return { W, H, tiles, marks, rooms };
})();
// the tile at a tile coordinate (outside the map: rock)
export const tileAt = (tx, ty) => tx < 0 || ty < 0 || tx >= LEVEL.W || ty >= LEVEL.H ? ROCK : LEVEL.tiles[ty * LEVEL.W + tx];
export const tileOf = (x, y) => tileAt(Math.floor(x / T), Math.floor(y / T));
export const solidAt = (x, y) => tileOf(x, y) === ROCK;
export const roomAt = (x, y) => LEVEL.rooms.find(r => x >= r.x0 && x < r.x1 && y >= r.y0 && y < r.y1) || null;
export const spawnPoint = () => { const m = LEVEL.marks.find(k => k.type === 'spawn'); return { x: (m.x + 0.5) * T, y: m.y * T }; };
