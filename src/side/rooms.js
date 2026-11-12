// The pieces a room is drawn from, and what a tile can be. A region's file (level.js for the first three, regions/ for
// the rest) builds its rooms out of these. Tile y counts up from the bottom.
//   0 empty   1 rock   2 ledge (one-way: stand on it, jump up through it)   3 spikes
//   4 cracked rock (rock, until his plunge or a finishing cut breaks it, once he has the Warden's weight)
//   5, 6 star-glass (a ledge that is there half the time: 5 the first half of the beat, 6 the second)
// Markers (spawns, lights, what is found, who is met) are kept apart from the tiles, in tile coordinates:
//   spawn, torch, crystal, shrine, boss, exit, and a creature's name; and
//   bloom (a flower that throws him high), updraft { w, h } (rising air, from its bottom-left tile: the scarf rides it),
//   chest { holds }, thread, urn, npc { who }.
export const T = 0.5;                       // a tile, in world units (the warrior is about 2.4 tall)
export const ROOM = { w: 40, h: 23 };       // a room is a screen: 20 x 11.5 units
export const EMPTY = 0, ROCK = 1, LEDGE = 2, SPIKES = 3, CRACKED = 4, GLASS_A = 5, GLASS_B = 6;
// a room spans cw x ch screens (most are one)
export function room(cw = 1, ch = 1){ const r = { w: ROOM.w * cw, h: ROOM.h * ch, tiles: [], marks: [] }; for (let y = 0; y < r.h; y++) r.tiles.push(new Array(r.w).fill(EMPTY)); return r; }
export const put = (r, x, y, v) => { if (x >= 0 && y >= 0 && x < r.w && y < r.h) r.tiles[y][x] = v; };
export const rect = (r, x0, y0, x1, y1, v = ROCK) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(r, x, y, v); };
export const walls = r => { rect(r, 0, 0, r.w - 1, 1); rect(r, 0, r.h - 2, r.w - 1, r.h - 1); rect(r, 0, 0, 1, r.h - 1); rect(r, r.w - 2, 0, r.w - 1, r.h - 1); };
// openings in the border: left/right take rows y0..y1, top/bottom take columns x0..x1
export const door = (r, side, a, b) => {
  if (side === 'left') rect(r, 0, a, 1, b, EMPTY); else if (side === 'right') rect(r, r.w - 2, a, r.w - 1, b, EMPTY);
  else if (side === 'top') rect(r, a, r.h - 2, b, r.h - 1, EMPTY); else rect(r, a, 0, b, 1, EMPTY);
};
export const ledge = (r, x0, x1, y, v = LEDGE) => rect(r, x0, y, x1, y, v);
// stairs: n steps, each `run` tiles long and one tile (half a unit) high, rising toward dir (+1 right, -1 left), the
// rock filled in under them
export function stairs(r, x, y, n, dir, run = 2){
  for (let i = 0; i < n; i++) for (let k = 0; k < run; k++){ const cx = x + dir * (i * run + k); rect(r, cx, 0, cx, y + i, ROCK); }
}
export const mark = (r, type, x, y, extra) => r.marks.push({ type, x, y, ...extra });
// a room with no walls of its own, under the sky (in a region whose fill is EMPTY)
export const open = (cw, ch) => { const r = room(cw, ch); r.open = true; return r; };
// a cave in a region of open air: rock all round, hollowed
export const cave = (cw = 1, ch = 1) => { const r = room(cw, ch); rect(r, 0, 0, r.w - 1, r.h - 1); rect(r, 2, 2, r.w - 3, r.h - 3, EMPTY); return r; };
