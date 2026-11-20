// The stuck-finder: every place in a region he could stand (his body fits there, at least crouched, on rock or a ledge)
// that open air joins to where he plays, played with the real motor and every input program the reachability graph uses.
// A place from which he cannot get back to where he plays is a pocket: if he ever ends up there (a fall, a knock-back,
// a drop through a plank) he is stuck. Every gift is his, so a pocket is one the player can never get out of. Only the
// rooms are searched (not the rock over the summit), and from each place up to six moves on.
//   pockets(N) -> [{ x, y, room }]   tiles where he would be stuck
import { graph, run, PROGS, DASH, LONG, SWIMP, CLIMBP, GIFTS, LEVEL, T } from './reach.mjs';
const { BODY } = await import('../../src/side/motor.js');
const ROCK = 1, LEDGE = 2;
export function pockets(N){
  const G = graph(N, GIFTS), { seen, W, H } = G, tiles = LEVEL.tiles;   // graph() leaves this region loaded, cracked stone broken
  const at = (i, j) => i < 0 || j < 0 || i >= W || j >= H ? ROCK : tiles[j * W + i];
  const rock = (i, j) => at(i, j) === ROCK || at(i, j) === 3 || at(i, j) === 4 || at(i, j) === 7 || at(i, j) === 9 || at(i, j) === 11 || at(i, j) === 13 || at(i, j) === 20 || at(i, j) === 21 || at(i, j) === 22;   // rock, spikes' base, cracked (broken above)
  // open air joined to where he plays
  const air = new Uint8Array(W * H), q = [];
  for (const k of seen){ if (!air[k]){ air[k] = 1; q.push(k); } }
  while (q.length){ const k = q.pop(), i = k % W, j = (k - i) / W; for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){ const ii = i + a, jj = j + b; if (ii < 0 || jj < 0 || ii >= W || jj >= H) continue; const kk = jj * W + ii; if (!air[kk] && !rock(ii, jj)){ air[kk] = 1; q.push(kk); } } }
  const fits = (x, y) => { for (let jj = Math.floor((y + 1e-4) / T); jj <= Math.floor((y + BODY.crouch - 1e-4) / T); jj++) for (let ii = Math.floor((x - BODY.hw + 1e-4) / T); ii <= Math.floor((x + BODY.hw - 1e-4) / T); ii++) if (at(ii, jj) === ROCK) return false; return true; };
  const progs = PROGS.concat(DASH, (LEVEL.waters || []).length ? SWIMP : []), out = [];   // (where there is deep water, the ways through it too) out.tried = 0; out.standable = 0;
  for (let j = 1; j < H; j++) for (let i = 0; i < W; i++){
    const k = j * W + i; if (!air[k] || seen.has(k) || rock(i, j)) continue;
    if (!LEVEL.rooms.some(r => i >= r.tx0 && i < r.tx1 && j >= r.ty0 && j < r.ty1)) continue;   // only where he plays (not over the summit's roof)
    const below = at(i, j - 1); if (below !== ROCK && below !== LEDGE) continue;
    const y = j * T, x = [0.5, 0.3, 0.7].map(f => (i + f) * T).find(x => fits(x, y)); if (x == null) continue; out.tried++;
    // from here, can he get back? (a few moves on, through places that are themselves not yet known)
    let ok = false; const tried = new Set([k]), front = [[x, y]];
    for (let hop = 0; hop < 6 && !ok && front.length; hop++){
      const next = [];
      for (const [px, py] of front){
        for (const p of progs){ for (const [c, pos] of run(px, py, p)){ if (seen.has(c)){ ok = true; break; } if (!tried.has(c)){ tried.add(c); next.push(pos); } } if (ok) break; }
        if (!ok && LEVEL.tiles.includes(20)) for (const p of CLIMBP){ for (const [c] of run(px, py, p, 900)) if (seen.has(c)){ ok = true; break; } if (ok) break; }
        if (!ok && LEVEL.updrafts.length) for (const p of LONG){ for (const [c] of run(px, py, p, 420)) if (seen.has(c)){ ok = true; break; } if (ok) break; }
        if (ok) break;
      }
      front.splice(0, front.length, ...next.slice(0, 30));
    }
    // a perch he can only leave by a long drop: he lands sore, and is out all the same (build 77: he no longer takes
    // an edge on the way down, so such a drop is a drop)
    if (!ok) for (const p of progs.slice(0, 40)){ for (const [c] of run(x, y, p, 600, true)) if (seen.has(c)){ ok = true; break; } if (ok) break; }
    if (!ok){ const r = LEVEL.rooms.find(r => i >= r.tx0 && i < r.tx1 && j >= r.ty0 && j < r.ty1); out.push({ x: i, y: j, room: r ? r.name : '?' }); }
  }
  return out;
}
