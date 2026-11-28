// Rough faces in the regions already built (docs/phase18-sheet.md 3; build 123; carried from phase 17: "rough faces in
// every region from the Roots on, seen long before they can be climbed"). One in each of the five passages between
// regions: the Crypt Stair, the Bell Road, the Last Hut, the Breach, the Long Stair. He walks under every one of them
// on the way up, from the first hour of the game.
//   In the roof of the passage's upper stretch, a chimney six wide goes up into the rock. Its far wall is rough: the
//   same pale, chisel-bitten rock as the Hollow's. At its head, on the near side, a nook. From the passage's floor to
//   the nook's is sixteen rows: more than he comes up by any means but the grip
// A passage is one piece of stone that both its regions hold (level.js sill): the chimney is cut in that piece, so the
// two are the same, tile for tile. It is on the upper region's side of the passage's middle, where the regions change:
// what is in the nook is the upper region's, set there by level.js (EDGES). No room is added, nothing is moved.
// Measured in tiles in from the hall's side of the passage (level.js sill's `d`), and in the passage's own rows. way:
// the chimney [from, to]; its rough wall is the column past it. floor: the row he stands at in the passage under it.
// roof: the passage's roof (the chimney's foot). head: the row he stands at in the nook; ceil: the nook's last open row.
// top: the chimney's last open row, one under the last of the passage's own (that last row is its roof: over the copy
// of a passage that a region holds at its top there may be nothing but sky): he has to be well over the lip when he lets
// go. nook: [from, to]. lip: the nook's floor, carried out into the chimney toward the face: he lets go of the face from
// over it, and comes down on to it
export const FACE = { way: [54, 59], floor: 14, roof: 20, head: 30, top: 36, ceil: 35, nook: [45, 53], lip: [54, 57] };
// what is in each nook, by region: a chest of shards in every one. (A thread in any of them would be a third on that
// region's climb, and the rule is two: tests/side-items. Whether the rule should bend for these is the designer's)
export const HOLDS = { 1: 'shards', 2: 'shards', 3: 'shards', 4: 'shards', 5: 'shards' };
// the chimney, cut in a passage's stone (t[row][column], `w` wide; dir: which way the passage runs, as level.js JOINS has it)
export function cutSill(t, dir, w, { EMPTY, ROCK, ROUGH }){
  const F = FACE, X = d => dir > 0 ? d : w - 1 - d;
  for (let y = F.roof; y <= F.top; y++){ for (let d = F.way[0]; d <= F.way[1]; d++) t[y][X(d)] = EMPTY; t[y][X(F.way[1] + 1)] = ROUGH; }   // the chimney, and its far wall, rough from the passage's roof to its head
  for (let y = F.head; y <= F.ceil; y++) for (let d = F.nook[0]; d <= F.nook[1]; d++) t[y][X(d)] = EMPTY;   // the nook, off its head on the near side
  for (let d = F.lip[0]; d <= F.lip[1]; d++) t[F.head - 1][X(d)] = ROCK;   // and its lip, out from its floor
}
export const far = { build(X){
  const s = X.roomOf('sill'); if (!s) return; const F = FACE, w = s.tx1 - s.tx0;
  // which way this passage runs: by where its rough wall is
  const dir = X.at(s.tx0 + F.way[1] + 1, s.ty0 + F.roof) === X.tile.ROUGH ? 1 : X.at(s.tx0 + w - 1 - (F.way[1] + 1), s.ty0 + F.roof) === X.tile.ROUGH ? -1 : 0; if (!dir) return;
  const at = d => s.tx0 + (dir > 0 ? d : w - 1 - d), my = s.ty0 + F.head, hold = HOLDS[X.index] || 'shards';
  X.marks.push({ type: 'chest', x: at(F.nook[0] + 2), y: my, holds: hold }); X.marks.push({ type: 'crystal', x: at(F.nook[0] + 5), y: my }); X.addMarks([{ type: 'torch', x: at(F.nook[0] + 4), y: my + 3 }]);   // (addMarks: it is given its bracket or its stand, as every torch is)
} };

// ---- (build 129; decision 0.37, phase 18's question 8) two more, inside the regions: one in the Spires' cliffs, at the
// mouth, where he comes up out of the Bell Road into the region; one in the Tempest's masts, at the foot of the
// rigging. Neither is in a passage, so neither has a chimney's roof to start from: each is cut in from the room's floor.
// A low tunnel into the rock beside where he stands, a chimney up at its end with its far wall rough, and the nook off
// the chimney's head, back over the tunnel. The same heights as the passages' (FACE): the nook's floor sixteen rows
// over his, the chimney six wide and going on six over it, the lip four out from it
//   Measured from the tile he stands on (room-relative `at`: its column, and the row he stands at) and the way into the
// rock (`dir`). In along `dir`: the tunnel 1 to 8, the chimney 9 to 14, the face 15; the nook 3 to 8 (two tiles of rock
// left between it and the room he came from: nothing over there reaches it)
export const CLIFF = { tunnel: [1, 8], rise: 5, way: [9, 14], face: 15, head: 16, ceil: 21, top: 22, nook: [3, 8], lip: [9, 12] };
export const cliffHead = (f, Y0) => { const h = Math.max(CLIFF.head, Y0 + Math.ceil((f + CLIFF.head - Y0) / 23) * 23 - f); return h; };
export const CLIFFS = { 2: { room: 'mouth', at: [2, 4], dir: -1 }, 3: { room: 'rigging', at: [69, 2], dir: 1 } };
const block = () => { const r = { w: 40, h: 23, tiles: [], marks: [] }; for (let y = 0; y < 23; y++) r.tiles.push(new Array(40).fill(1)); return r; };
export const cliffs = { build(X){
  const C = CLIFFS[X.index], R = C && X.roomOf(C.room); if (!R) return; const F = CLIFF, d = C.dir, sx = R.tx0 + C.at[0], f = R.ty0 + C.at[1];
  // the nook's floor at least sixteen rows up, and on the first row of a room's cell: so that where he stands in it is in
  // the room drawn for it, which is the grip's (tests/side-level: a room is somewhere he can stand). Nineteen in the
  // Spires, twenty-one in the Tempest
  const head = cliffHead(f, X.Y0), ceil = head + (F.ceil - F.head), top = head + (F.top - F.head);
  const col = k => sx + d * k, { EMPTY: E, ROCK: K, ROUGH: G } = X.tile;
  // the cells it reaches into that no room holds: given a room each, of rock, so that they are drawn (the nook's, and the
  // chimney's head, are the grip's: nothing else comes there)
  const cuts = [[F.tunnel[0], F.tunnel[1], f, f + F.rise], [F.way[0], F.way[1], f, f + top], [F.face, F.face, f + F.rise + 1, f + top], [F.nook[0], F.nook[1], f + head, f + ceil]];
  const cells = new Map(); for (const [k0, k1, y0, y1] of cuts) for (let k = k0; k <= k1; k++) for (let y = y0; y <= y1; y++){ const x = col(k);
    if (X.rooms.some(r => x >= r.tx0 && x < r.tx1 && y >= r.ty0 && y < r.ty1)) continue;
    const cx = Math.floor((x - X.X0) / 40), cy = Math.floor((y - X.Y0) / 23); cells.set(cx + ',' + cy, [cx, cy, X.Y0 + cy * 23 >= f + head - 1]); }   // (a cell that starts at the nook's floor or over it)
  for (const [cx, cy, high] of cells.values()){ const mk = () => { const r = block(); r.title = 'THE CLEFT'; r.gate = high ? 'grip' : ''; return r; }; Object.defineProperty(mk, 'name', { value: high ? 'cliffhead' : 'cliff' }); X.addRoom(cx, cy, mk, { wing: true, far: true, bare: true }); }
  const cut = (k0, k1, y0, y1, v = E) => { for (let k = k0; k <= k1; k++) for (let y = y0; y <= y1; y++) X.set(col(k), y, v); };
  cut(F.tunnel[0], F.tunnel[1], f, f + F.rise);                       // the tunnel, as tall as a door
  cut(F.way[0], F.way[1], f, f + top);                               // the chimney
  cut(F.face, F.face, f + F.rise + 1, f + top, G);                   // its far wall rough, from over the tunnel's roof to its head
  cut(F.face, F.face, f, f + F.rise, K); cut(F.way[0], F.way[1], f - 1, f - 1, K); cut(F.way[0], F.way[1], f + top + 1, f + top + 1, K);   // its foot and its roof whole
  cut(F.nook[0], F.nook[1], f + head, f + ceil);                   // the nook
  cut(F.lip[0], F.lip[1], f + head - 1, f + head - 1, K);          // and its lip, out into the chimney
  // a torch on the wall the tunnel goes through: moved up, over the tunnel's roof (it had nothing to hang on)
  for (const m of X.marks) if (m.type === 'torch' && m.x === sx && m.y >= f && m.y <= f + F.rise + 1) m.y = f + F.rise + 4;
  const my = f + head; X.marks.push({ type: 'chest', x: col(F.nook[0] + 1), y: my, holds: 'shards' }); X.marks.push({ type: 'crystal', x: col(F.nook[0] + 4), y: my }); X.addMarks([{ type: 'torch', x: col(F.nook[0] + 3), y: my + 3 }]);
} };
