// The Firmament's far end (docs/edges-sheet.md, section 6; build 119): what lies past its wing, set into the Firmament
// by level.js (EDGES), two columns further east. (West is where the Shard will be: not here.)
// East, past the arms of the Orrery Wing: THE OUTER RING. The far planets, on arms long enough to swing out over
// nothing.
//   outer   six screens, two wide and three tall, in off the arms' floor at their east wall. A ring of two planets,
//           turning as the arms do, mounted from a block under its hub: to a shelf on the west wall, and to a shelf
//           across the room. Over that shelf a second arm, the outermost, and its planet standing at the foot of its
//           turn: he can get up on to it, and it goes nowhere. Wound, it carries him up the far side to the head of
//           a tower of brass: a thread, a chest, a window east
// Its working is a thing that moves only once it is wound (level.js keyClock; a mover with a key), as the Roots'
// bucket-chain is. Its windlass is the key in the winding room: behind the Almanac, at the far end of the wing.
import { room, rect, mark, EMPTY } from '../rooms.js';

const named = (fn, title, gate, look) => { const f = () => { const r = fn(); r.title = title; r.gate = gate; if (look) r.look = look; return r; }; Object.defineProperty(f, 'name', { value: fn.name }); return f; };
const deco = (r, kind, x, y, more) => mark(r, 'deco', x, y, { kind, ...more });
const keep = (r, x, y) => mark(r, 'keep', x, y);
const mass = (cw = 1, ch = 1) => { const r = room(cw, ch); rect(r, 0, 0, r.w - 1, r.h - 1); return r; };
// the ring, in its own rows. The row its shelves are at; the mounting block under the hub [from, to, the row he stands
// at] and the step on each side of it; the running ring; the shelf on the west wall; the shelf across; the outermost's
// arm (ph: it stands at the foot of its turn); the tower [from, to, the row he stands at]; the key in the winding room
// [its column there]
export const RING = { row: 31, block: [30, 42, 11], step: 6, hub: [36, 31], r: 15, period: 16, west: [2, 12], shelf: [60, 69],
  outer: { hub: [54, 49], r: 12, period: 14, ph: 0.25, dir: -1, w: 6, key: 'outer' }, tower: [70, 77, 61], windlass: 20 };
function outer(){
  const r = mass(2, 3), O = RING.outer, [b0, b1, by] = RING.block;
  rect(r, 2, 2, 77, 66, EMPTY); rect(r, 0, 2, 1, 7, EMPTY);         // in at the floor, from the arms
  rect(r, b0, 2, b1, by - 1); rect(r, b0 - 4, 2, b0 - 1, RING.step - 1); rect(r, b1 + 1, 2, b1 + 4, RING.step - 1);   // the mounting block under the hub, a step each side: from it a planet at the foot of its turn is a short hop up
  for (const ph of [0, 0.5]) mark(r, 'mover', RING.hub[0], RING.hub[1], { kind: 'arm', r: RING.r, period: RING.period, ph, dir: 1, w: 6 });
  rect(r, RING.west[0], RING.row - 2, RING.west[1], RING.row - 1);  // a shelf on the west wall, at nine o'clock
  rect(r, RING.shelf[0], RING.row - 2, RING.shelf[1], RING.row - 1);   // the shelf across, off the tower's foot
  rect(r, RING.tower[0], 2, RING.tower[1], RING.tower[2] - 1);      // the tower: sheer, thirty rows from the shelf to its head
  mark(r, 'mover', O.hub[0], O.hub[1], { kind: 'arm', r: O.r, period: O.period, ph: O.ph, dir: O.dir, w: O.w, key: O.key });
  rect(r, 78, RING.tower[2] + 1, 79, RING.tower[2] + 5, EMPTY);     // a window east, at the tower's head
  mark(r, 'chest', 6, RING.row, { holds: 'shards' }); deco(r, 'ringplate', 65, RING.row, { says: 'THE OUTERMOST. WOUND APART FROM THE REST.' });
  mark(r, 'thread', 76, RING.tower[2]); mark(r, 'chest', 72, RING.tower[2], { holds: 'shards' }); deco(r, 'ringplate', 74, RING.tower[2], { says: 'FROM HERE THE HOUR WAS READ. IT WAS WRONG HERE TOO.' });
  mark(r, 'roller', 56, 2, { lo: -7, hi: 10 });
  deco(r, 'escwheel', 16, 2);
  mark(r, 'torch', 4, 36); mark(r, 'torch', 62, 36); mark(r, 'torch', 74, 65); mark(r, 'torch', 4, 10); mark(r, 'torch', 66, 10); mark(r, 'torch', 3, 60); mark(r, 'crystal', 10, RING.row); mark(r, 'crystal', 22, 2); mark(r, 'urn', 64, 2);
  for (let y = 40; y <= 64; y += 3) for (let x = 4; x <= 76; x += 3) if (r.tiles[y][x] === EMPTY) keep(r, x, y);   // the roof and the sky stay where they were cut
  for (let y = RING.tower[2] + 1; y <= RING.tower[2] + 5; y += 2) keep(r, 78, y);
  for (const y of [3, 5]) keep(r, 3, y);
  return r;
}

export const far = { right: 5, build(X){
  const { EMPTY: E } = X.tile, cut = (R, x0, y0, x1, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) X.set(R.tx0 + x, R.ty0 + y, E); };
  const ar = X.roomOf('arms'), wi = X.roomOf('winding'); if (!ar || !wi) return;
  const cx = Math.round((ar.tx1 - X.X0) / 40), cy = Math.round((ar.ty0 - X.Y0) / 23);
  X.addRoom(cx, cy, named(outer, 'THE OUTER RING', '', 'orrery'), { wing: true, far: true });
  cut(ar, 78, 2, 79, 7);                                           // out of the arms, at their floor's east end
  // the outermost's key: in the winding room, beside the drum
  X.marks.push({ type: 'windlass', x: wi.tx0 + RING.windlass, y: wi.ty0 + 2, key: RING.outer.key, says: 'Far off, something heavy has begun to turn.' });
} };

// ---- what stands in it, painted (a 'deco' mark)
export const decoDef = (px, PAL) => ({
  // a plate of brass let into the stone, a line cut in it (main.js says it when he stands by it)
  ringplate(g, x, y){ px(g, PAL.ink, x - 12, y - 22, 24, 10); px(g, PAL.rust, x - 11, y - 21, 22, 8); px(g, PAL.fire2, x - 11, y - 21, 22, 1); for (let k = 0; k < 2; k++) for (let i = 0; i < 18; i += 3) px(g, PAL.ink, x - 9 + i, y - 18 + k * 3, 2, 1); },
});
