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
// what a keeper holds in its region, until it falls (phase 9, docs/phase9-sheet.md 3 and 4; level.js RULE says whether it has):
//   7 a hold: rock while the keeper stands, nothing after (a seal over the way out of its hall, a slab pressed into a
//     doorway, a wall of thorn, the stone over a quick way)
//   8 a door on the bell's beat: shut and open by turns while the keeper stands, open after
//   9 a given plank: rock while the keeper stands, a plank after (the boards over a quick way's mouth)
//  10 a live deck: an iron gantry by the storm's rods. A ledge; while the keeper stands, to land on it is to be shocked
//  11 vellum: a sheet stretched over a way. Rock, until he goes through it in the Toll's step (a dash in the air tears it)
// what a wing's own keeper holds (phase 10, the Bell-Foundry; level.js RULE.ring, RULE.still):
//  12 a shutter: iron, up in its doorway. Nothing in silence; rock while iron rings; nothing for good once the wing is still
//  13 a grate: rock until the wing's keeper is still, nothing after
//  14 a stone of the way (phase 11, the Pilgrims' Cairns; level.js RULE.turned): a ledge, until he turns round on it. Then
//     every one of them is gone from under him, until he stands on the ground again
//  15 ice a fire melts (phase 11, the Glacier Galleries; level.js RULE.lit): rock, until the brazier nearest it in its
//     room is lit. Then it is gone, for good
//  16, 17 the works' iron (phase 12, the Wreck of the Works; level.js RULE.sw): a deck of one half or the other. A ledge.
//     The current runs through one half at a time (16 while the lever is one way, 17 while it is the other): to stand
//     on that half is to be shocked. A lever sends it across. Dead for good once the Jar is broken (RULE.still)
// 20 rough rock (phase 17; motor.js GRIP): rock, with a face the Auger's grip climbs
// 21, 22 the floors of the bore (phase 17, the Auger's hall; level.js RULE.bore): rock, until the Auger bores each
//     away in turn (21 the first to go, 22 the second), or is still
export const ROUGH = 20, TIER_A = 21, TIER_B = 22;
export const HOLD = 7, DOOR = 8, GIVEN = 9, LIVE = 10, VELLUM = 11, SHUTTER = 12, STILLED = 13, FACED = 14, MELT = 15, IRON_A = 16, IRON_B = 17, CALM = 18, KEPT = 19;   // 19 the door of his house (phase 13, the Keepers' Houses; level.js RULE.upset): rock while anything in the houses is out of its place, until their keeper is broken
//   // 18 a door of cloud (phase 12, the Eye of the Storm; level.js RULE.open): rock, until he has stood still before it long enough; then nothing, a little while
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
// a place dug into rock (phase 8: where the people are found): rock laid all round the hollow (x0..x1 wide, h high, its
// floor at row y), a roof `roof` thick over it, `back` thick behind it, and its mouth open on one side ('L' or 'R'). It
// is cut into whatever rock is there already, or stands as a mass of its own against a wall. The wear leaves it be
export function den(r, x0, x1, y, h = 5, { open: mouth = 'L', back = 2, roof = 2 } = {}){
  rect(r, mouth === 'L' ? x0 : x0 - back, y, mouth === 'R' ? x1 : x1 + back, y + h + roof - 1);
  rect(r, x0, y, x1, y + h - 1, EMPTY);
  for (let x = x0; x <= x1; x += 2) mark(r, 'keep', x, y + 1);
}
// a room with no walls of its own, under the sky (in a region whose fill is EMPTY)
export const open = (cw, ch) => { const r = room(cw, ch); r.open = true; return r; };
// a cave in a region of open air: rock all round, hollowed
export const cave = (cw = 1, ch = 1) => { const r = room(cw, ch); rect(r, 0, 0, r.w - 1, r.h - 1); rect(r, 2, 2, r.w - 3, r.h - 3, EMPTY); return r; };
