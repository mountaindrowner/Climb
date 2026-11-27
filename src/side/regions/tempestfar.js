// The Tempest's far ends (docs/edges-sheet.md, section 4; build 118): what lies past each of its wings, set into the
// Tempest by level.js (EDGES), one column further west and two further east.
// West, past the coils of the Wreck of the Works: THE GREAT ROD. The Wrights' tallest rod, in a shaft of its own cut up
// through the cliff, and the stair of iron round it.
//   rod    three screens, in off the coils' upper landing. Four landings of stone, one side and the other, fifteen rows
//          apart: more than he climbs. Between the first three, plates of iron: the first flight on one half, the
//          second on the other. A lever on each of the two lower landings. The last flight has no plates: a crane's
//          hook on a rail, left at the top; its winch is a landing below. At the head, a window west
// Its working is the works' own (regions/works.js): the current is in one half of the iron, and a lever sends it to the
// other. And a thing on a rail (level.js railAt), as the Cloister's ladders are.
// East, past the stills of the Eye of the Storm: THE BLUE. Clear sky, and nothing moving in it.
//   blue   two screens. A flue up from the still's east end on to a deck; in the deck four floors of cloud, each over
//          a cell; the cells in a row under it, a door of cloud between each and the next, and the last into the flue
// Its working is the Eye's rule turned over (regions/eye.js): a floor of cloud lets him down only when he stands still
// on it, and he cannot see from the deck what is under each. The Hush move while he waits.
import { room, rect, ledge, mark, EMPTY, CALM, IRON_A, IRON_B } from '../rooms.js';

const named = (fn, title, gate, look) => { const f = () => { const r = fn(); r.title = title; r.gate = gate; if (look) r.look = look; return r; }; Object.defineProperty(f, 'name', { value: fn.name }); return f; };
const deco = (r, kind, x, y, more) => mark(r, 'deco', x, y, { kind, ...more });
const keep = (r, x, y) => mark(r, 'keep', x, y);
const mass = (cw = 1, ch = 1) => { const r = room(cw, ch); rect(r, 0, 0, r.w - 1, r.h - 1); return r; };
const keeps = (r, x0, y0, x1, y1) => { for (let y = y0; y <= y1; y += 2) for (let x = x0; x <= x1; x += 3) if (r.tiles[y] && r.tiles[y][x] === EMPTY) keep(r, x, y); };
// the rod's shaft, in its own rows: its walls; the landings [the row he stands at, 'e' or 'w']; the plates of each
// flight [the row he stands at, side, which half]; the hook's rail; the coils' upper landing (their row 38) is its row 15
export const ROD = { door: 38, shaft: [12, 27], lands: [[15, 'e'], [30, 'w'], [45, 'e'], [60, 'w']], plates: [[21, 'w', 'A'], [27, 'e', 'A'], [36, 'e', 'B'], [42, 'w', 'B']], hook: { x: 19, y: 60, dy: -15, secs: 3.5, key: 'hook' } };
function rod(){
  const r = mass(1, 3), [x0, x1] = ROD.shaft;
  rect(r, x0, 4, x1, 66, EMPTY); rect(r, x1 + 1, 15, 39, 20, EMPTY);   // the shaft; the way in from the coils, along the first landing
  for (const [y, side] of ROD.lands) rect(r, side === 'w' ? x0 : x1 - 5, y - 2, side === 'w' ? x0 + 5 : x1, y - 1);
  rect(r, x0, 9, x0 + 2, 9);                                         // a sill under the first landing: the foot of the shaft is no pit
  for (const [y, side, half] of ROD.plates) ledge(r, side === 'w' ? x0 : x1 - 3, side === 'w' ? x0 + 3 : x1, y - 1, half === 'A' ? IRON_A : IRON_B);
  mark(r, 'lever', x1 - 1, 15); mark(r, 'lever', x0 + 1, 30); mark(r, 'winch', x0 + 4, 30, { key: ROD.hook.key });
  mark(r, 'mover', ROD.hook.x, ROD.hook.y, { kind: 'rail', dx: 0, dy: ROD.hook.dy, secs: ROD.hook.secs, key: ROD.hook.key, look: 'ladle', w: 4 });
  mark(r, 'ladder', ROD.hook.x, ROD.hook.y, { key: ROD.hook.key, tall: 4, iron: true });
  // the head: an alcove west of the last landing, and a window out of the cliff
  rect(r, 2, 60, x0 - 1, 66, EMPTY); rect(r, 0, 61, 1, 65, EMPTY);
  mark(r, 'thread', 4, 60); mark(r, 'chest', 8, 60, { holds: 'shards' });
  deco(r, 'rodmast', 20, 4); deco(r, 'rodmast', 20, 36); for (const [k, x, y] of [['drum', 16, 4], ['wreck', 23, 4]]) deco(r, k, x, y);
  mark(r, 'spark', 20, 25); mark(r, 'spark', 19, 40);
  mark(r, 'torch', 34, 18); mark(r, 'torch', x0, 34); mark(r, 'torch', x1, 49); mark(r, 'torch', 6, 64); mark(r, 'urn', 25, 4); mark(r, 'crystal', 14, 4); mark(r, 'crystal', 10, 60);
  keeps(r, x0, 4, x1, 66); keeps(r, x1 + 1, 15, 39, 20); keeps(r, 2, 60, x0 - 1, 66); for (let y = 61; y <= 65; y += 2) keep(r, 0, y);
  return r;
}

// the Blue, in its own rows: the deck he stands on; the floors of cloud in it; the walls between the cells under it,
// a door of cloud in each (the first is the flue's)
export const BLUE = { deck: 14, flue: [2, 9], windows: [[18, 23], [36, 41], [54, 59], [70, 75]], ribs: [10, 28, 46, 64] };
function blue(){
  const r = mass(2, 1);
  rect(r, BLUE.flue[0], 2, BLUE.flue[1], 20, EMPTY); rect(r, 10, BLUE.deck, 77, 20, EMPTY); rect(r, 12, 2, 77, 11, EMPTY);
  rect(r, 7, 8, 9, 8); rect(r, 2, 13, 4, 13);                       // two sills up the flue to the deck (the first off the wall over the cells' door, the second off the outer wall over the way in)
  for (const [a, b] of BLUE.windows) rect(r, a, BLUE.deck - 2, b, BLUE.deck - 1, CALM);
  for (const x of BLUE.ribs){ rect(r, x, 2, x + 1, 11); rect(r, x, 2, x + 1, 7, CALM); for (const dx of [-3, -2, 3, 4]) for (const y of [3, 5]) if (x + dx >= 2 && x + dx <= 77) keep(r, x + dx, y); }
  mark(r, 'thread', 40, 2); mark(r, 'thread', 74, 2); mark(r, 'chest', 56, 2, { holds: 'shards' }); mark(r, 'urn', 16, 2); mark(r, 'urn', 68, 2);
  mark(r, 'hush', 22, 4); mark(r, 'hush', 34, 5); mark(r, 'hush', 60, 4); mark(r, 'hush', 44, 17); mark(r, 'hush', 66, 17);
  for (const [k, x, y] of [['cloudbank', 30, BLUE.deck], ['cloudbank', 62, BLUE.deck], ['cloudbank', 50, 2]]) deco(r, k, x, y);
  mark(r, 'crystal', 13, BLUE.deck); mark(r, 'crystal', 76, BLUE.deck); mark(r, 'crystal', 26, 2); mark(r, 'crystal', 48, 2);
  keeps(r, BLUE.flue[0], 2, BLUE.flue[1], 20); keeps(r, 10, BLUE.deck, 77, 20);
  return r;
}

export const far = { left: 4, right: 5, build(X){
  const { EMPTY: E, ROCK } = X.tile, cut = (R, x0, y0, x1, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) X.set(R.tx0 + x, R.ty0 + y, E); };
  // ---- west: the new column is the cliff, from the coils' foot up; the rod's shaft in it, a screen up
  const co = X.roomOf('coils');
  if (co){
    for (let y = co.ty0; y < co.ty0 + 4 * 23 && y < X.H; y++) for (let x = 0; x < co.tx0; x++) X.set(x, y, ROCK);
    const cx = Math.round((co.tx0 - X.X0) / 40) - 1, cy = Math.round((co.ty0 - X.Y0) / 23) + 1;
    X.addRoom(cx, cy, named(rod, 'THE GREAT ROD', ''), { wing: true, far: true });
    cut(co, 0, ROD.door, 1, ROD.door + 5);
  }
  // ---- east: the Blue, beside the upper still
  const sb = X.roomOf('stillb'); if (!sb) return;
  const ex = Math.round((sb.tx1 - X.X0) / 40), ey = Math.round((sb.ty0 - X.Y0) / 23);
  for (let y = sb.ty0; y < sb.ty1; y++) for (let x = sb.tx1; x < X.W; x++) X.set(x, y, ROCK);
  const bl = X.addRoom(ex, ey, named(blue, 'THE BLUE', 'glide', 'eye'), { wing: true, far: true });
  cut(sb, 78, 2, 79, 7); cut(bl, 0, 2, 1, 7);
} };

// ---- what stands in it, painted (a 'deco' mark)
export const decoDef = (px, PAL) => ({
  // the great rod: a mast of black iron up the back of the shaft, a glass insulator every so often (thirty-two tiles of it)
  rodmast(g, x, y){ const h = 32 * 8; px(g, PAL.ink, x - 4, y - h, 8, h); px(g, '#3a4466', x - 3, y - h, 6, h); px(g, '#5a6988', x - 3, y - h, 2, h); for (let k = 20; k < h; k += 48){ px(g, PAL.ink, x - 8, y - k - 8, 16, 8); px(g, '#2ce8f5', x - 7, y - k - 7, 14, 2); px(g, '#0099db', x - 7, y - k - 5, 14, 4); px(g, PAL.ink, x - 6, y - k - 12, 12, 4); px(g, '#8b9bb4', x - 5, y - k - 11, 10, 2); } },
});
