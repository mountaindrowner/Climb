// The walk test's eyes (build 81, asked for in the second playtest: "little areas where, if you're walking, there's a
// little lip that unintentionally gets you stuck"). A low spot is floor he can walk onto from ground he stands on,
// where he fits crouched or rolling but not standing: a lip of rock overhead. Some are meant (a crawl, a cell);
// the test holds each level to the ones it is known to have, so the rock-smoothing cannot leave a new one unseen.
const R = await import('./reach.mjs');
const STAND = 5, FIT = 2;   // rows: he stands in five (2.4 of a tile's 0.5), and nothing passes under two
export function lowSpots(N){
  const L = R.loadLevel(N), W = L.W, H = L.H, t = L.tiles;
  const solid = (x, y) => { if (x < 0 || x >= W || y < 0 || y >= H) return true; const v = t[y * W + x]; return v !== 0 && v !== 2 && v !== 3; };
  const clear = (x, y) => { let n = 0; while (n < 8 && !solid(x, y + n)) n++; return n; }, floor = (x, y) => !solid(x, y) && solid(x, y - 1);
  const spots = [];
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++){ if (!floor(x, y)) continue; const c = clear(x, y); if (c >= STAND || c < FIT) continue;
    let near = false; for (const dx of [-3, -2, -1, 1, 2, 3]) for (const dy of [-2, -1, 0, 1, 2]) if (floor(x + dx, y + dy) && clear(x + dx, y + dy) >= STAND) near = true;
    if (near) spots.push([x, y, c]); }
  const runs = []; for (const [x, y, c] of spots){ const last = runs[runs.length - 1]; if (last && last.y === y && last.x1 === x - 1){ last.x1 = x; last.c = Math.min(last.c, c); } else runs.push({ x0: x, x1: x, y, c }); }
  return runs.map(r => { const q = L.rooms.find(q => r.x0 >= q.tx0 && r.x0 < q.tx1 && r.y >= q.ty0 && r.y < q.ty1); return `${q ? q.name : '?'} ${r.x0 - (q ? q.tx0 : 0)}-${r.x1 - (q ? q.tx0 : 0)},${r.y - (q ? q.ty0 : 0)}`; });
}
