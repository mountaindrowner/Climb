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
  ledge(r, 30, 36, 6); ledge(r, 25, 30, 10); ledge(r, 32, 37, 14); ledge(r, 26, 31, 18); ledge(r, 30, 36, 21);   // the last, in the doorway: up into the shaft
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
  const r = room(); walls(r); door(r, 'right', 15, 19); door(r, 'top', 3, 15);
  rect(r, 2, 2, 37, 13);                                          // solid under the tunnel
  rect(r, 17, 17, 28, 20);                                        // a low stretch: crouch or roll under it
  stairs(r, 13, 14, 8, -1, 1);                                    // up to the hole in the roof
  rect(r, 2, 2, 5, 20);                                           // the stair meets the wall: no pit beside its top
  mark(r, 'burrower', 30, 14); mark(r, 'torch', 33, 18); mark(r, 'crystal', 20, 14);
  return r;
}
function chamber(){
  const r = room(); walls(r); door(r, 'bottom', 3, 15); door(r, 'right', 2, 7); door(r, 'top', 26, 32);
  ledge(r, 3, 15, 1);                                             // over the hole up from the tunnel: jump up through it
  ledge(r, 12, 18, 5); ledge(r, 22, 28, 9); ledge(r, 10, 16, 13); ledge(r, 24, 32, 16); ledge(r, 26, 32, 20);
  rect(r, 18, 2, 20, 3);
  mark(r, 'flitter', 20, 12); mark(r, 'torch', 11, 15); mark(r, 'torch', 29, 18); mark(r, 'crystal', 30, 2); mark(r, 'crystal', 14, 14); mark(r, 'crawler', 30, 2);
  return r;
}
function ascent(){
  const r = room(); walls(r); door(r, 'left', 2, 7); door(r, 'right', 16, 20);
  stairs(r, 6, 2, 14, 1, 2);                                      // a long climb to the right
  rect(r, 34, 2, 37, 15);                                         // its top meets the wall: no pit beside it
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
  [[24, 32, 5], [8, 16, 9], [22, 30, 13], [30, 37, 17], [14, 22, 21], [2, 10, 25], [16, 24, 29], [8, 16, 33], [2, 12, 37], [16, 24, 36], [30, 37, 38], [30, 36, 42]]
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
  rect(r, 2, 2, 37, 13); rect(r, 12, 8, 27, 13, EMPTY);           // the floor, and the basin in it
  ledge(r, 13, 16, 11); ledge(r, 23, 26, 11);                     // steps out of it
  rect(r, 30, 14, 37, 14);                                        // a step up to the well
  mark(r, 'shrine', 20, 8); mark(r, 'crystal', 13, 8); mark(r, 'crystal', 26, 8); mark(r, 'crystal', 18, 8);
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
    rooms.push({ name: make.name, x0: ox * T, y0: oy * T, x1: (ox + r.w) * T, y1: (oy + r.h) * T, tx0: ox, ty0: oy, tx1: ox + r.w, ty1: oy + r.h });
  }
  const raw = tiles.slice();
  organic(tiles, W, H, marks, rooms);
  return { W, H, tiles, marks, rooms, raw };
})();

// ---- the organic pass: the rooms are drawn as boxes (easy to read and change); this wears them into caves. It
// never touches the space he moves through: the floor he walks and four tiles over it, doorways and their way in,
// and the markers. Outside that it fills the corners where floor meets wall with ramps (steps a tile high, which he
// walks up, drawn as slopes), rounds the top corners off with wedges, hangs lumps from ceilings, swells the walls and
// raises low humps along long floors. The same every load (a fixed seed).
function organic(tiles, W, H, marks, rooms){
  let seed = 1234567; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647, ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
  const at = (i, j) => i < 0 || j < 0 || i >= W || j >= H ? ROCK : tiles[j * W + i];
  const set = (i, j, v) => { if (i > 0 && j > 0 && i < W - 1 && j < H - 1) tiles[j * W + i] = v; };
  const air = (i, j) => at(i, j) === EMPTY, rock = (i, j) => at(i, j) === ROCK, support = (i, j) => { const t = at(i, j); return t === ROCK || t === LEDGE; };
  const stand = (i, j) => air(i, j) && support(i, j - 1);
  const roomOf = (i, j) => rooms.find(r => i >= r.tx0 && i < r.tx1 && j >= r.ty0 && j < r.ty1);
  // what is kept clear: near (the walk: six over every floor), far (head room: nine over a floor, his height and a
  // jump; thirteen and wider over a ledge, where he jumps from one to the next), doorways and the way through, markers
  const near = new Uint8Array(W * H), far = new Uint8Array(W * H), doorway = new Uint8Array(W * H);
  const mark = (arr, i, j) => { if (i >= 0 && j >= 0 && i < W && j < H) arr[j * W + i] = 1; };
  for (let j = 1; j < H; j++) for (let i = 0; i < W; i++) if (stand(i, j)){
    const ledge = at(i, j - 1) === LEDGE, up = ledge ? 13 : 9, side = ledge ? 4 : 2;
    for (let d = 0; d <= 6; d++) for (let a = -1; a <= 1; a++) mark(near, i + a, j + d);
    for (let d = 0; d <= up; d++) for (let a = -side; a <= side; a++) mark(far, i + a, j + d);
  }
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) if (at(i, j) === LEDGE) for (let d = -8; d <= 0; d++) for (let a = -3; a <= 3; a++) mark(far, i + a, j + d);   // under a ledge: he jumps up through it
  for (const r of rooms) for (let j = r.ty0; j < r.ty1; j++) for (let i = r.tx0; i < r.tx1; i++){
    const ring = i < r.tx0 + 2 || i >= r.tx1 - 2 || j < r.ty0 + 2 || j >= r.ty1 - 2;
    if (!ring || at(i, j) === ROCK) continue;
    for (let a = -6; a <= 6; a++) for (let b = -6; b <= 6; b++){ mark(near, i + a, j + b); mark(far, i + a, j + b); mark(doorway, i + a, j + b); }
  }
  for (const m of marks) for (let a = -2; a <= 2; a++) for (let b = -1; b <= 3; b++){ mark(near, m.x + a, m.y + b); mark(far, m.x + a, m.y + b); }
  const free = (arr, i, j) => air(i, j) && !arr[j * W + i];
  const quiet = r => r && r.name === 'arena';   // the Warden's stage stays flat (its sweep runs along it)
  const added = new Uint8Array(W * H), put = (i, j) => { set(i, j, ROCK); if (i >= 0 && j >= 0 && i < W && j < H) added[j * W + i] = 1; };
  // smooth noise along a line: a value every few tiles, eased between
  const noise = (period, s0) => { const v = []; for (let k = 0; k < 400; k++) v.push(rnd()); return x => { const f = (x + s0) / period, k = Math.floor(f), t = f - k, e = t * t * (3 - 2 * t); return v[k % 400] * (1 - e) + v[(k + 1) % 400] * e; }; };
  const ceil = noise(5, 3), ceil2 = noise(13, 7), wallN = noise(4, 11);
  // 1. ceilings sag and bulge: each column hangs down by a smooth amount, as far as head room allows
  for (let j = 2; j < H - 2; j++) for (let i = 2; i < W - 2; i++){
    if (!air(i, j) || !rock(i, j + 1)) continue;
    const n = Math.round(Math.max(0, ceil(i) * 4.2 + ceil2(i) * 3 - 2.4));
    for (let b = 0; b < n; b++) if (free(far, i, j - b)) put(i, j - b); else break;
  }
  // 2. walls swell and hollow along their height
  for (let j = 2; j < H - 2; j++) for (let i = 2; i < W - 2; i++) for (const dir of [1, -1]){
    if (!air(i, j) || !rock(i - dir, j) || added[j * W + i - dir]) continue;
    const n = Math.round(Math.max(0, wallN(j * 1.0 + i * 0.37 + (dir > 0 ? 0 : 50)) * 4 - 1.2));
    for (let a = 0; a < n; a++) if (free(far, i + dir * a, j)) put(i + dir * a, j); else break;
  }
  // 3. the top corners of a room: a wedge, as big as fits clear of head room
  for (let j = 2; j < H - 2; j++) for (let i = 2; i < W - 2; i++){
    if (!air(i, j) || !rock(i, j + 1)) continue;
    for (const dir of [1, -1]){
      if (!rock(i - dir, j)) continue;
      for (let sz = ri(4, 9); sz >= 2; sz--){
        let ok = true;
        for (let a = 0; a < sz && ok; a++) for (let b = 0; b < sz - a; b++) if (!free(far, i + dir * a, j - b) && !rock(i + dir * a, j - b)) { ok = false; break; }
        if (ok){ for (let a = 0; a < sz; a++) for (let b = 0; b < sz - a; b++) if (air(i + dir * a, j - b)) put(i + dir * a, j - b); break; }
      }
    }
  }
  // 4. round it all off: what the pass added keeps to the shape around it (no single teeth or notches)
  for (let it = 0; it < 2; it++){
    const copy = tiles.slice(), rk = (i, j) => i < 0 || j < 0 || i >= W || j >= H || copy[j * W + i] === ROCK;
    for (let j = 1; j < H - 1; j++) for (let i = 1; i < W - 1; i++){
      let n = 0; for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) if ((a || b) && rk(i + a, j + b)) n++;
      const k = j * W + i;
      if (copy[k] === ROCK && added[k] && n <= 3){ tiles[k] = EMPTY; added[k] = 0; }
      else if (copy[k] === EMPTY && !far[k] && n >= 5){ tiles[k] = ROCK; added[k] = 1; }
    }
  }
  // 5. ramps where a floor meets a wall: steps up, each a tile, so he walks them (drawn as a slope)
  for (let j = 2; j < H - 6; j++){
    let i = 0;
    while (i < W){
      if (!stand(i, j)){ i++; continue; }
      let e = i; while (e + 1 < W && stand(e + 1, j)) e++;
      const len = e - i + 1, r = roomOf(i, j);
      if (len >= 5 && !quiet(r)){
        for (const [end, dir] of [[i, 1], [e, -1]]){
          let wall = true; for (let d = 0; d <= 4; d++) if (!rock(end - dir, j + d)) wall = false;
          if (!wall) continue;
          const h = Math.min(ri(2, 4), Math.floor(len / 3));
          let ok = true;
          for (let k = 0; k < h; k++){ const top = j + (h - 1 - k), cx = end + dir * k; if (doorway[j * W + cx] || at(cx, j - 1) !== ROCK) ok = false;   // not in a doorway's way, not on a ledge
 for (let d = 0; d <= top - j + 5; d++) if (at(end + dir * k, j + d) === LEDGE || (d > top - j && !air(end + dir * k, j + d))) ok = false; if (marks.some(m => Math.abs(m.x - (end + dir * k)) <= 1 && Math.abs(m.y - j) <= 2)) ok = false; }
          if (ok) for (let k = 0; k < h; k++) for (let y = j; y <= j + (h - 1 - k); y++) put(end + dir * k, y);
        }
      }
      i = e + 1;
    }
  }
  // 5. low humps along long floors (a tile, walked over in stride), away from the ends, ledges and markers
  for (let j = 2; j < H - 6; j++){
    let i = 0;
    while (i < W){
      if (!stand(i, j)){ i++; continue; }
      let e = i; while (e + 1 < W && stand(e + 1, j)) e++;
      const r = roomOf(i, j);
      if (e - i + 1 >= 14 && !quiet(r) && rnd() < 0.8){
        const w = ri(3, 6), x0 = ri(i + 4, e - 4 - w);
        let ok = x0 > i + 3;
        for (let x = x0; x < x0 + w && ok; x++){ if (doorway[j * W + x] || at(x, j - 1) !== ROCK) ok = false; for (let d = 1; d <= 6; d++) if (!air(x, j + d)) ok = false; if (marks.some(m => Math.abs(m.x - x) <= 2 && Math.abs(m.y - j) <= 3)) ok = false; }
        if (ok) for (let x = x0; x < x0 + w; x++) set(x, j, ROCK);
      }
      i = e + 1;
    }
  }
}
// the tile at a tile coordinate (outside the map: rock)
export const tileAt = (tx, ty) => tx < 0 || ty < 0 || tx >= LEVEL.W || ty >= LEVEL.H ? ROCK : LEVEL.tiles[ty * LEVEL.W + tx];
export const tileOf = (x, y) => tileAt(Math.floor(x / T), Math.floor(y / T));
export const solidAt = (x, y) => tileOf(x, y) === ROCK;
export const roomAt = (x, y) => LEVEL.rooms.find(r => x >= r.x0 && x < r.x1 && y >= r.y0 && y < r.y1) || null;
export const spawnPoint = () => { const m = LEVEL.marks.find(k => k.type === 'spawn'); return { x: (m.x + 0.5) * T, y: m.y * T }; };
