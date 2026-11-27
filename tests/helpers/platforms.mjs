// One-way platforms, counted (the map pass, docs/map-pass-sheet.md). A platform is a run of plank tiles along a row.
// It is `free` if neither end touches rock (it floats), `wall` if one end does (a bracket off a wall), `span` if both
// do (a rung, a bridge, a floor of planks).
import { loadLevel, LEVELS } from '../../src/side/level.js';
const PLANK = new Set([2]);
export function platforms(N){
  const { W, H, tiles } = { ...loadLevel(N) }, out = [];
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++){
    if (!PLANK.has(tiles[j * W + i]) || (i > 0 && PLANK.has(tiles[j * W + i - 1]))) continue;
    let e = i; while (e + 1 < W && PLANK.has(tiles[j * W + e + 1])) e++;
    const l = i === 0 || tiles[j * W + i - 1] === 1, r = e === W - 1 || tiles[j * W + e + 1] === 1;
    out.push({ x0: i, x1: e, y: j, kind: l && r ? 'span' : l || r ? 'wall' : 'free' });
  }
  return out;
}
export const tally = N => { const p = platforms(N), t = { all: p.length, free: 0, wall: 0, span: 0 }; for (const q of p) t[q.kind]++; return t; };
export const names = () => LEVELS.map(l => l.name);
// Rock that hangs in the air: a piece of rock joined to nothing (not to a wall, a floor or a roof), by its sides. The
// same fault as a floating plank, in stone. Each is { x0, x1, y0, y1, n } (its box and its tiles).
export function islands(N){
  const { W, H, tiles } = { ...loadLevel(N) }, rock = k => tiles[k] === 1 || tiles[k] === 20 || tiles[k] === 23 /* 23: a gate of the Drowned Galleries is stone, standing in its frame */, id = new Int32Array(W * H), comps = [];
  for (let k = 0; k < W * H; k++){ if (!rock(k) || id[k]) continue; const c = { n: 0, x0: W, x1: 0, y0: H, y1: 0, edge: false }, q = [k]; id[k] = comps.length + 1;
    while (q.length){ const a = q.pop(), i = a % W, j = (a - i) / W; c.n++; c.x0 = Math.min(c.x0, i); c.x1 = Math.max(c.x1, i); c.y0 = Math.min(c.y0, j); c.y1 = Math.max(c.y1, j); if (i === 0 || j === 0 || i === W - 1 || j === H - 1) c.edge = true;
      for (const b of [i > 0 ? a - 1 : -1, i < W - 1 ? a + 1 : -1, a - W, a + W]) if (b >= 0 && b < W * H && rock(b) && !id[b]){ id[b] = id[k]; q.push(b); } }
    comps.push(c); }
  return comps.filter(c => !c.edge && c.n < 400);
}
