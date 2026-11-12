// The side view's region can be played through: from the spawn, walking, dropping and jumping (a generous stand-in
// for the motor: up to seven tiles up and nine across with a double jump, the body nearly five tiles tall), every
// room is reached, and the shrine, the arena's stage and the way out. Guards the organic pass, which reshapes rooms.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LEVEL, LEVELS, loadLevel, ROCK, LEDGE, EMPTY } from '../src/side/level.js';

for (let N = 0; N < LEVELS.length; N++){
const { W, H, tiles, marks, rooms, pads, updrafts } = { ...loadLevel(N) }, NAME = LEVELS[N].name;
const GOAL = marks.find(m => m.type === 'boss') || marks.find(m => m.type === 'exit');   // where the region leads: its boss, or its way out
const at = (i, j) => { if (i < 0 || j < 0 || i >= W || j >= H) return ROCK; const t = tiles[j * W + i]; return t === 4 ? ROCK : t === 5 || t === 6 ? LEDGE : t; };   // cracked rock is rock; star-glass, a ledge (he waits for it)
const solid = (i, j) => at(i, j) === ROCK;
const support = (i, j) => { const t = at(i, j); return t === ROCK || t === LEDGE; };
const BODY = 5;   // tiles tall, rounded up (he is 2.4 units: 4.8 tiles)
const roomy = (i, j) => { for (let d = 0; d < BODY; d++) if (solid(i, j + d)) return false; return true; };
// he is 0.68 wide: where he stands, a column beside also has to be clear to his height
const stand = (i, j) => at(i, j) !== ROCK && at(i, j) !== 3 && support(i, j - 1) && roomy(i, j) && (roomy(i - 1, j) || roomy(i + 1, j));
// crouched or rolling he fits under three tiles: he can go along there, not jump
const low = (i, j) => { if (at(i, j) === ROCK || at(i, j) === 3 || !support(i, j - 1)) return false; for (let d = 0; d < 3; d++) if (solid(i, j + d)) return false; return true; };   // crouched 1.4: three tiles

function reach(edges){
  const sp = marks.find(m => m.type === 'spawn'); let s = { i: sp.x, j: sp.y };
  while (!stand(s.i, s.j) && s.j > 0) s.j--;
  const seen = new Uint8Array(W * H), q = [[s.i, s.j]]; seen[s.j * W + s.i] = 1;
  let from = 0; const push = (i, j, crawl) => { if (i >= 0 && j >= 0 && i < W && j < H && (stand(i, j) || (crawl && low(i, j)))){ if (edges) edges.push(from, j * W + i); if (!seen[j * W + i]){ seen[j * W + i] = 1; q.push([i, j]); } } };
  const fall = (i, j) => { while (j > 0 && !support(i, j - 1) && !solid(i, j - 1)) j--; return j; };
  const clear = (x0, x1, y0, y1) => { for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) for (let y = y0; y <= y1; y++) if (solid(x, y)) return false; return true; };
  while (q.length){
    const [i, j] = q.pop(); from = j * W + i;
    for (const dir of [-1, 1]){
      push(i + dir, j, true);   // along, crouched if need be
      if (!stand(i, j)) continue;
      // walk: a step up of a tile, or on along the level, or off an edge and down
      for (const dj of [1, 0]) if (roomy(i + dir, j + dj) && (dj === 0 || roomy(i, j + 1))) push(i + dir, j + dj);
      if (roomy(i + dir, j)) { const fj = fall(i + dir, j); push(i + dir, fj); }
      // jump: up, across, down onto a floor or ledge
      for (let dx = 1; dx <= 9; dx++) for (let dy = -12; dy <= 7; dy++){   // a double jump now rises 3.8 (seven tiles)
        const ti = i + dir * dx, tj = j + dy; if (!stand(ti, tj)) continue;
        const peak = Math.max(j, tj);   // feet just clear the higher of the two
        if (clear(i, i, j, peak + BODY - 1) && clear(i, ti, peak, peak + BODY - 1) && clear(ti, ti, tj, peak + BODY - 1)) push(ti, tj);
      }
    }
    if (!stand(i, j)) continue;
    // straight up through a ledge above
    for (let dy = 1; dy <= 7; dy++) if (stand(i, j + dy) && clear(i, i, j, j + dy + BODY - 1)) push(i, j + dy);
    // a bloom throws him high (fourteen tiles, and his air jump after): up its column, then across
    if (pads.has(j * W + i)) for (let dy = 1; dy <= 17; dy++){ if (!clear(i, i, j, j + dy + BODY - 1)) break; for (let dx = -9; dx <= 9; dx++){ const ti = i + dx, tj = j + dy; if (stand(ti, tj) && clear(i, ti, tj, tj + BODY - 1)) push(ti, tj); for (let d2 = 1; d2 <= 6; d2++) if (stand(ti, tj - d2) && clear(i, ti, tj, tj + BODY - 1) && clear(ti, ti, tj - d2, tj + BODY - 1)) push(ti, tj - d2); } }
    // rising air carries him (the scarf) up its height, and out a little way either side at any level
    for (const u of updrafts){ const x0 = Math.round(u.x0 * 2), x1 = Math.round(u.x1 * 2) - 1, y0 = Math.round(u.y0 * 2), y1 = Math.round(u.y1 * 2);
      if (i < x0 - 2 || i > x1 + 2 || j < y0 - 6 || j > y1) continue;
      for (let tj = j; tj <= y1 + 3; tj++) for (let ti = x0 - 7; ti <= x1 + 7; ti++){ if (!stand(ti, tj)) continue; const a = Math.max(x0, Math.min(x1, ti)); if (clear(a, ti, tj, tj + BODY - 1)) push(ti, tj); } }
    // drop through the ledge underfoot
    if (at(i, j - 1) === LEDGE){ const fj = fall(i, j - 1); push(i, fj); }
  }
  return seen;
}
const near = (seen, mx, my, r = 3) => { for (let a = -r; a <= r; a++) for (let b = -r; b <= r; b++){ const i = mx + a, j = my + b; if (i >= 0 && j >= 0 && i < W && j < H && seen[j * W + i]) return true; } return false; };

test(`${NAME}: every room, the shrine, the boss's stage and the way out can be reached from the spawn`, () => {
  const seen = reach();
  for (const r of rooms){
    let any = false; for (let j = r.ty0; j < r.ty1 && !any; j++) for (let i = r.tx0; i < r.tx1; i++) if (seen[j * W + i]){ any = true; break; }
    assert.ok(any, `room ${r.name} is cut off`);
  }
  for (const t of ['shrine', 'boss', 'exit']){ const m = marks.find(k => k.type === t); if (m || t !== 'boss') assert.ok(m && near(seen, m.x, m.y), `${t} cannot be reached`); }
});
test(`${NAME}: the organic pass leaves every marker in open air`, () => {
  for (const m of marks) assert.notEqual(at(m.x, m.y), ROCK, `${m.type} at ${m.x},${m.y} is in rock`);
});

test(`${NAME}: no traps: from anywhere he can get to, he can still get to where the region leads`, () => {
  const edges = [], seen = reach(edges), back = new Map();
  for (let k = 0; k < edges.length; k += 2){ const a = edges[k], b = edges[k + 1]; if (!back.has(b)) back.set(b, []); back.get(b).push(a); }
  const boss = GOAL, ok = new Uint8Array(W * H), q = [];
  for (let a = -6; a <= 6; a++) for (let b = -2; b <= 3; b++){ const k = (boss.y + b) * W + boss.x + a; if (seen[k]){ ok[k] = 1; q.push(k); } }
  while (q.length){ const k = q.pop(); for (const p of back.get(k) || []) if (!ok[p]){ ok[p] = 1; q.push(p); } }
  const stuck = []; for (let k = 0; k < W * H; k++) if (seen[k] && !ok[k]) stuck.push(k);
  const where = stuck.slice(0, 5).map(k => { const i = k % W, j = (k - i) / W, r = rooms.find(r => i >= r.tx0 && i < r.tx1 && j >= r.ty0 && j < r.ty1); return `${r ? r.name : '?'} ${i},${j}`; });
  assert.equal(stuck.length, 0, `${stuck.length} places he can get to but not out of, e.g. ${where.join('; ')}`);
});
}
