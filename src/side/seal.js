// Where a keeper's hall is shut (entrance.js draws the seals and brings them down). On its own, with nothing of the
// page in it, so the checks can read it.
//   openings(room) -> [{ side: 'l' | 'r' | 'b', cells: [[i, j], ...] }]   each way out of the room, as the tiles a seal fills
import { T, LEVEL, ROCK, EMPTY, LEDGE } from './level.js';
export function openings(rm){
  const L = LEVEL, at = (i, j) => i < 0 || j < 0 || i >= L.W || j >= L.H ? ROCK : L.tiles[j * L.W + i], open = t => t === EMPTY || t === LEDGE;
  const tx0 = rm.tx0 != null ? rm.tx0 : Math.round(rm.x0 / T), tx1 = rm.tx1 != null ? rm.tx1 : Math.round(rm.x1 / T), ty0 = rm.ty0 != null ? rm.ty0 : Math.round(rm.y0 / T), ty1 = rm.ty1 != null ? rm.ty1 : Math.round(rm.y1 / T);
  const out = [], run = (side, cells) => { if (cells.length && cells.length <= 2 * 9) out.push({ side, cells }); };   // a doorway: up to nine tiles across (the band is two deep)
  for (const [side, band, out1] of [['l', [tx0, tx0 + 1], tx0 - 1], ['r', [tx1 - 1, tx1 - 2], tx1]]){
    let cur = [];
    for (let j = ty0; j <= ty1; j++){ const ok = j < ty1 && band.every(i => open(at(i, j))) && open(at(out1, j)); if (ok) cur.push(j); else { run(side, cur.flatMap(j => band.map(i => [i, j]))); cur = []; } }
  }
  // a way up through the floor is shut at its mouth, where he came out of it (in sight), not at the bottom of the room
  // (up the shaft while rock stands either side of it; a step of rock left in the shaft does not end it: the mouth is the
  // highest row the shaft is open right across. Build 78: a stone step put in the Warden's shaft had left its seal at
  // the bottom of the hole, out of sight, and the hole open to fall into)
  const mouth = cols => { const a = cols[0] - 1, b = cols[cols.length - 1] + 1; let j = ty0, top = ty0; while (j + 1 < ty1 && cols.some(i => open(at(i, j + 1))) && at(a, j + 1) === ROCK && at(b, j + 1) === ROCK){ j++; if (cols.every(i => open(at(i, j)))) top = j; } return Math.max(ty0 + 1, top); };
  let cur = [];
  for (let i = tx0; i <= tx1; i++){ const ok = i < tx1 && open(at(i, ty0)) && open(at(i, ty0 + 1)) && open(at(i, ty0 - 1)); if (ok) cur.push(i); else { if (cur.length){ const top = mouth(cur); run('b', cur.flatMap(i => [[i, top - 1], [i, top]])); } cur = []; } }
  return out;
}
