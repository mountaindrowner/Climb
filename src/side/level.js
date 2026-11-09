// The side view's world: a grid of tiles, half a unit square, climbing up through rooms joined by doorways, shafts and
// tunnels, the way a metroidvania's map is. Rooms are built from a few pieces (walls, doors, ledges, stairs, low
// tunnels) so each is easy to read and change; the region is a grid of rooms. Tile y counts up from the bottom.
//   0 empty   1 rock   2 ledge (one-way: stand on it, jump up through it)   3 spikes
// Markers (spawns, lights, the exit) are kept apart from the tiles, in tile coordinates.
export const T = 0.5;                       // a tile, in world units (the warrior is about 1.75 tall)
export const ROOM = { w: 40, h: 23 };       // a room is a screen: 20 x 11.5 units
export const EMPTY = 0, ROCK = 1, LEDGE = 2, SPIKES = 3;

function room(){ const r = { tiles: [], marks: [] }; for (let y = 0; y < ROOM.h; y++) r.tiles.push(new Array(ROOM.w).fill(EMPTY)); return r; }
const put = (r, x, y, v) => { if (x >= 0 && y >= 0 && x < ROOM.w && y < ROOM.h) r.tiles[y][x] = v; };
const rect = (r, x0, y0, x1, y1, v = ROCK) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(r, x, y, v); };
const walls = r => { rect(r, 0, 0, ROOM.w - 1, 1); rect(r, 0, ROOM.h - 2, ROOM.w - 1, ROOM.h - 1); rect(r, 0, 0, 1, ROOM.h - 1); rect(r, ROOM.w - 2, 0, ROOM.w - 1, ROOM.h - 1); };
// openings in the border: left/right take rows y0..y1, top/bottom take columns x0..x1
const door = (r, side, a, b) => {
  if (side === 'left') rect(r, 0, a, 1, b, EMPTY); else if (side === 'right') rect(r, ROOM.w - 2, a, ROOM.w - 1, b, EMPTY);
  else if (side === 'top') rect(r, a, ROOM.h - 2, b, ROOM.h - 1, EMPTY); else rect(r, a, 0, b, 1, EMPTY);
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
  const r = room(); walls(r); door(r, 'bottom', 3, 8); door(r, 'right', 2, 7);
  ledge(r, 12, 18, 5); ledge(r, 22, 28, 9); ledge(r, 10, 16, 13); ledge(r, 24, 32, 16);
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
function summit(){
  const r = room(); walls(r); door(r, 'left', 16, 20);
  rect(r, 2, 2, 37, 15);                                          // the floor the Warden will stand on
  mark(r, 'exit', 32, 16); mark(r, 'torch', 8, 20); mark(r, 'torch', 24, 20); mark(r, 'crystal', 36, 16);
  return r;
}
// the region: rooms on a grid (column, row up)
const LAYOUT = [[0, 0, start], [1, 0, corridor], [1, 1, shaft], [0, 1, tunnel], [0, 2, chamber], [1, 2, ascent], [2, 2, summit]];

export const LEVEL = (() => {
  const cols = Math.max(...LAYOUT.map(l => l[0])) + 1, rows = Math.max(...LAYOUT.map(l => l[1])) + 1;
  const W = cols * ROOM.w, H = rows * ROOM.h, tiles = new Uint8Array(W * H).fill(ROCK), marks = [], rooms = [];
  for (const [cx, cy, make] of LAYOUT){
    const r = make(), ox = cx * ROOM.w, oy = cy * ROOM.h;
    for (let y = 0; y < ROOM.h; y++) for (let x = 0; x < ROOM.w; x++) tiles[(oy + y) * W + ox + x] = r.tiles[y][x];
    for (const m of r.marks) marks.push({ ...m, x: ox + m.x, y: oy + m.y });
    rooms.push({ name: make.name, x0: ox * T, y0: oy * T, x1: (ox + ROOM.w) * T, y1: (oy + ROOM.h) * T });
  }
  return { W, H, tiles, marks, rooms };
})();
// the tile at a tile coordinate (outside the map: rock)
export const tileAt = (tx, ty) => tx < 0 || ty < 0 || tx >= LEVEL.W || ty >= LEVEL.H ? ROCK : LEVEL.tiles[ty * LEVEL.W + tx];
export const tileOf = (x, y) => tileAt(Math.floor(x / T), Math.floor(y / T));
export const solidAt = (x, y) => tileOf(x, y) === ROCK;
export const roomAt = (x, y) => LEVEL.rooms.find(r => x >= r.x0 && x < r.x1 && y >= r.y0 && y < r.y1) || null;
export const spawnPoint = () => { const m = LEVEL.marks.find(k => k.type === 'spawn'); return { x: (m.x + 0.5) * T, y: m.y * T }; };
