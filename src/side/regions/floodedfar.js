// The Flooded Levels' far end (docs/edges-sheet.md, sections 7 to 11; build 120): THE DROWNED STOPE. Set into the
// Flooded Levels by level.js (EDGES), one column further west, and down into the rock under the level.
// West of the chapel, and under it: a chamber the guild worked out and left, under water to its roof but for the air
// caught in the top of it.
//   stope   three screens, one over another, in off the chapel's floor at the top screen's foot. Up: a dome of air, a
//           dry ledge in it, a windlass. Down, two screens, into the rock under the level: the foot of the stope, and
//           a grate across a strong-room cut in its wall. The windlass in the air raises the grate under the water
import { room, rect, mark, EMPTY } from '../rooms.js';

const named = (fn, title, gate, look) => { const f = () => { const r = fn(); r.title = title; r.gate = gate; if (look) r.look = look; return r; }; Object.defineProperty(f, 'name', { value: fn.name }); return f; };
const deco = (r, kind, x, y, more) => mark(r, 'deco', x, y, { kind, ...more });
const keep = (r, x, y) => mark(r, 'keep', x, y);
const mass = (cw = 1, ch = 1) => { const r = room(cw, ch); rect(r, 0, 0, r.w - 1, r.h - 1); return r; };
// the stope, in its own rows (the chapel's floor is its row 48). door: the row of the way in. water: the row its top
// is at. dome: the air [from, to, its roof]. ledge: the dry ledge in it [from, to]. strong: the strong-room at the
// foot [from, to]; grate: the columns the grate stands in. benches: stone left in the walls [x0, y0, x1, y1]
export const STOPE = { door: 48, water: 61, dome: [10, 29, 66], ledge: [22, 29], strong: [2, 9], grate: [10, 11], key: 'stull',
  benches: [[2, 8, 11, 16], [28, 2, 37, 10], [30, 26, 37, 32], [2, 36, 9, 42]] };
function stope(){
  const r = mass(1, 3), S = STOPE, [d0, d1, dy] = S.dome;
  rect(r, 2, 2, 37, 58, EMPTY); rect(r, d0, 59, d1, dy, EMPTY);     // the chamber; and the dome in its roof
  rect(r, 38, S.door, 39, S.door + 5, EMPTY);                       // in off the chapel's floor
  for (const [x0, y0, x1, y1] of S.benches) rect(r, x0, y0, x1, y1);   // benches of stone left standing in its walls (the first is the strong-room's roof)
  rect(r, S.ledge[0], 55, S.ledge[1], S.water - 1);                // the dry ledge: its top is at the water's top
  mark(r, 'water', 0, 0, { w: 40, h: S.water });
  mark(r, 'windlass', S.ledge[1] - 2, S.water, { key: S.key, says: 'Far below, a grate has gone up.' }); deco(r, 'chalk', S.ledge[0] + 2, S.water, { says: 'WORKED OUT. WHAT WAS BEST IS KEPT BELOW.' });
  mark(r, 'thread', 5, 2); mark(r, 'chest', 33, 11, { holds: 'shards' });
  mark(r, 'sunk', 20, 2); mark(r, 'sunk', 24, 30);
  mark(r, 'glamp', 16, dy - 1); for (const [x, y] of [[20, 50], [6, 28], [33, 20], [18, 8], [5, 6]]) mark(r, 'dlamp', x, y);
  mark(r, 'urn', 16, 2); mark(r, 'crystal', 24, 2); mark(r, 'crystal', 35, 33);
  for (let y = 12; y <= 56; y += 4) for (let x = 14; x <= 26; x += 4) if (r.tiles[y][x] === EMPTY) keep(r, x, y);
  for (let x = d0 + 1; x <= d1; x += 3) for (const y of [S.water + 1, S.water + 3]) if (r.tiles[y][x] === EMPTY) keep(r, x, y);
  return r;
}

export const far = { left: 1, build(X){
  const { EMPTY: E, ROCK, SLUICE } = X.tile, cut = (R, x0, y0, x1, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) X.set(R.tx0 + x, R.ty0 + y, E); };
  const ch = X.roomOf('chapel'); if (!ch) return;
  for (let y = 0; y < X.H; y++) for (let x = 0; x < ch.tx0; x++) X.set(x, y, ROCK);   // the new column is rock, top to bottom
  const cx = Math.round((ch.tx0 - X.X0) / 40) - 1, cy = Math.round((ch.ty0 - X.Y0) / 23);
  const st = X.addRoom(cx, cy - 2, named(stope, 'THE DROWNED STOPE', ''), { wing: true, far: true });
  cut(ch, 0, 2, 1, 7);
  // the grate across the strong-room at the stope's foot: a gate, standing
  const [g0, g1] = STOPE.grate; for (let x = g0; x <= g1; x++) for (let y = 2; y <= 7; y++) X.set(st.tx0 + x, st.ty0 + y, SLUICE);
  X.marks.push({ type: 'gate', x: st.tx0 + g0, y: st.ty0 + 2, w: g1 - g0 + 1, h: 6, key: STOPE.key });
} };
