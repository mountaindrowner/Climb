// Rough faces in the regions already built (build 123; docs/phase18-sheet.md 3): one in each of the five passages
// between regions. A chimney in the passage's roof, its east wall rough, a nook at its head. Come to with the grip, and
// by nothing else.
import test from 'node:test';
import assert from 'node:assert/strict';

await import('./helpers/browser.mjs');
const LV = await import('../src/side/level.js'), R = await import('./helpers/reach.mjs'), FC = await import('../src/side/regions/faces.js');
const F = FC.FACE, NAMES = { 1: 'THE CRYPT STAIR', 2: 'THE BELL ROAD', 3: 'THE LAST HUT', 4: 'THE BREACH', 5: 'THE LONG STAIR' };
const built = n => { const L = LV.loadLevel(n); return { W: L.W, H: L.H, tiles: L.tiles.slice(), marks: L.marks.map(m => ({ ...m })), rooms: L.rooms.map(r => ({ ...r })) }; };

test('a rough face in each of the five passages, and nowhere else on the climb but the Shard: a chimney in the roof, a nook at its head, sixteen rows over the floor', () => {
  for (let n = 0; n <= LV.CLIMB_TOP; n++){
    const L0 = LV.loadLevel(n), L = { ...built(n), joins: L0.joins }, rough = [], far = L.rooms.filter(r => r.far), inFar = (i, j) => far.some(r => i >= r.tx0 && i < r.tx1 && j >= r.ty0 && j < r.ty1); for (let j = 0; j < L.H; j++) for (let i = 0; i < L.W; i++) if (L.tiles[j * L.W + i] === LV.ROUGH && !inFar(i, j)) rough.push([i, j]);   // (the Shard's, in the Firmament's far end, is its own: tests/side-shard)
    // a region holds the passage under it (its 'sill' room) and a copy of the one over it, at its top: the same stone. So its rough tiles are one face's for each
    const copies = (n >= 1 ? 1 : 0) + (n < LV.CLIMB_TOP ? 1 : 0); assert.equal(rough.length, copies * (F.top - F.roof + 1), LV.LEVELS[n].name + ': one face a passage');
    if (n < LV.CLIMB_TOP){ const J = L0.joins.up, dirU = LV.JOINS[n + 1].dir, col = J.x + (dirU > 0 ? F.way[1] + 1 : LV.SILL.w - 1 - (F.way[1] + 1)); assert.ok(rough.filter(([i]) => i === col).length === F.top - F.roof + 1, 'the copy over it has its face too');
      for (let x = J.x; x < J.x + LV.SILL.w; x++) assert.equal(L.tiles[(J.y + LV.SILL.h - 1) * L.W + x], LV.ROCK, 'and is roofed in its own last row: nothing opens out of its top'); }
    if (n === 0) continue;
    const s = L.rooms.find(r => r.name === 'sill'), dir = LV.JOINS[n].dir, wide = s.tx1 - s.tx0, X = d => dir > 0 ? d : wide - 1 - d, at = (d, y) => L.tiles[(s.ty0 + y) * L.W + s.tx0 + X(d)], name = LV.LEVELS[n].name;   // (d: tiles in from the hall's side, as the passage is made)
    assert.equal(s.title, NAMES[n], name + ': its passage'); assert.ok(!s.wing, 'on the main way');
    // the face: one column, the chimney's east wall, from the passage's roof to the chimney's head
    const mine = rough.filter(([i, j]) => j >= s.ty0 && j < s.ty1 && i >= s.tx0 && i < s.tx1); assert.equal(mine.length, F.top - F.roof + 1, name + ': one face in its own passage'); assert.ok(mine.every(([i, j]) => i - s.tx0 === X(F.way[1] + 1) && j - s.ty0 >= F.roof && j - s.ty0 <= F.top));
    // on the upper region's side of the passage's middle, where the regions change, and well clear of it
    assert.ok(F.nook[0] - (LV.SILL.w >> 1) >= 4, name + ': all of it past the middle'); assert.equal(wide, LV.SILL.w);
    // the passage under it as it was: open, six rows, on its own floor
    for (let x = F.way[0] - 2; x <= F.way[1] + 2; x++){ assert.equal(at(x, F.floor - 1), LV.ROCK, 'the passage\'s floor'); for (let y = F.floor; y < F.roof; y++) assert.equal(at(x, y), LV.EMPTY, 'the passage is open under it'); }
    assert.equal(at(F.way[0] - 1, F.roof), LV.ROCK, 'its roof, either side of the chimney'); assert.equal(at(F.way[1] + 2, F.roof), LV.ROCK);
    // the chimney: six wide, open from the roof to its head but for the lip
    for (let y = F.roof; y <= F.top; y++) for (let x = F.way[0]; x <= F.way[1]; x++) assert.equal(at(x, y), y === F.head - 1 && x >= F.lip[0] && x <= F.lip[1] ? LV.ROCK : LV.EMPTY, `the chimney at ${x},${y}`);
    assert.equal(F.way[1] - F.lip[1], 2, 'two tiles between the lip and the face: he goes up between them'); for (let x = F.way[0]; x <= F.way[1]; x++) assert.equal(at(x, F.top + 1), LV.ROCK, 'roofed');
    // the nook: west off the chimney's head, five rows, rock round it
    for (let y = F.head; y <= F.ceil; y++) for (let x = F.nook[0]; x <= F.nook[1]; x++) assert.equal(at(x, y), LV.EMPTY, 'the nook'); for (let x = F.nook[0]; x <= F.nook[1]; x++){ assert.equal(at(x, F.head - 1), LV.ROCK); assert.equal(at(x, F.ceil + 1), LV.ROCK); }
    for (let y = F.head; y <= F.ceil; y++) assert.equal(at(F.nook[0] - 1, y), LV.ROCK); assert.equal(F.ceil - F.head + 1, 6, 'room to stand in it'); assert.ok(F.top + 1 - 4.8 - F.head >= 2, 'and the chimney goes on over it: he lets go of the face from well over the lip'); assert.equal(s.ty0 + F.top, s.ty1 - 2, 'to one row under the last of the passage\'s own room'); for (let x = F.way[0]; x <= F.way[1]; x++) assert.equal(at(x, F.top + 1), LV.ROCK);
    assert.ok(F.head - F.floor >= 16, 'sixteen rows from the passage\'s floor: more than he comes up without the grip');
    // what is in it: a chest of shards. No thread: two on a region's climb is the rule
    const dOf = m => dir > 0 ? m.x - s.tx0 : wide - 1 - (m.x - s.tx0), inNook = m => dOf(m) >= F.nook[0] && dOf(m) <= F.nook[1] && m.y - s.ty0 >= F.head && m.y - s.ty0 <= F.ceil;
    const chest = L.marks.filter(m => m.type === 'chest' && inNook(m)); assert.equal(chest.length, 1); assert.equal(chest[0].holds, 'shards'); assert.equal(chest[0].y - s.ty0, F.head); assert.equal(L.marks.filter(m => m.type === 'thread' && inNook(m)).length, 0);
    assert.equal(FC.HOLDS[n], 'shards');
  }
  // the passage is one piece of stone that both its regions hold: the chimney is in the piece itself
  for (const k of Object.keys(LV.JOINS).map(Number)){ const t = LV.sill(k), col = LV.JOINS[k].dir > 0 ? F.way[1] + 1 : LV.SILL.w - 1 - (F.way[1] + 1); for (let y = F.roof; y <= F.top; y++) assert.equal(t[y][col], LV.ROUGH, LV.JOINS[k].title); }
  assert.equal(Object.keys(LV.JOINS).length, 5, 'five passages');
  // the Deep's own rough rock is as it was: only in the Hollow
  for (let n = LV.CLIMB_TOP + 1; n < LV.LEVELS.length; n++){ const L = built(n); assert.equal(L.tiles.includes(LV.ROUGH), LV.LEVELS[n].name === 'The Hollow', LV.LEVELS[n].name); }
});

for (let n = 1; n <= LV.CLIMB_TOP; n++) test(`${LV.LEVELS[n].name}, its passage played: the nook with the grip, and not with everything else he could have; and a way back down`, () => {
  const without = R.graph(n, ['breaker', 'dash', 'glide']), W = without.W, s = without.rooms.find(r => r.name === 'sill');
  const dir = LV.JOINS[n].dir, wide = s.tx1 - s.tx0, loc = k => { const i = k % W - s.tx0; return [dir > 0 ? i : wide - 1 - i, Math.floor(k / W) - s.ty0]; }, inNook = k => { const [i, j] = loc(k); return i >= F.nook[0] && i <= F.way[1] && j >= F.head && j <= F.top; }, under = k => { const [i, j] = loc(k); return i >= F.way[0] - 4 && i <= F.way[1] + 4 && j === F.floor; };
  assert.equal([...without.seen].filter(inNook).length, 0, 'without the grip: not the nook'); assert.ok([...without.seen].some(under), 'he walks under it');
  assert.ok(![...without.seen].some(k => { const [i, j] = loc(k); return i >= F.way[0] && i <= F.way[1] && j >= F.roof && j <= F.top; }), 'nor anywhere in the chimney');
  const G = R.graph(n, R.GIFTS); assert.ok(R.GIFTS.includes('grip')); const nook = [...G.seen].filter(inNook); assert.ok(nook.length > 0, 'with the grip: the nook');
  const chest = G.marks.find(m => { const d = dir > 0 ? m.x - s.tx0 : wide - 1 - (m.x - s.tx0); return m.type === 'chest' && d >= F.nook[0] && d <= F.nook[1] && m.y - s.ty0 === F.head; }); assert.ok(nook.some(k => Math.abs(k % W - chest.x) <= 2 && Math.floor(k / W) === chest.y), 'and its chest');
  const onward = from => { const seen = new Set(from), q = [...from]; while (q.length){ const k = q.pop(); for (const c of (G.edges.get(k) || new Map()).keys()) if (!seen.has(c)){ seen.add(c); q.push(c); } } return seen; };
  for (const k of nook) assert.ok([...onward([k])].some(under), `from ${loc(k)} there is a way back down to the passage`);
});
