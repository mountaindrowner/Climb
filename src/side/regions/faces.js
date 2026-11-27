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
