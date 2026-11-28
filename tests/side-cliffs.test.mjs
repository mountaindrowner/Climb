// Two more rough faces, inside the regions (build 129; decision 0.37, phase 18's question 8): the Spires' cliffs at the
// mouth, the Tempest's masts at the foot of the rigging. Cut in from the room's floor: a tunnel into the rock, a chimney
// at its end with its far wall rough, a nook off the chimney's head back over the tunnel. Come to with the grip, and by
// nothing else.
import test from 'node:test';
import assert from 'node:assert/strict';

await import('./helpers/browser.mjs');
const LV = await import('../src/side/level.js'), R = await import('./helpers/reach.mjs'), FC = await import('../src/side/regions/faces.js');
const F = FC.CLIFF;

test('one in the Spires, one in the Tempest, and in no other region', () => {
  assert.deepEqual(Object.keys(FC.CLIFFS).map(Number), [2, 3]);
  assert.equal(FC.CLIFFS[2].room, 'mouth'); assert.equal(FC.CLIFFS[3].room, 'rigging');
  for (let n = 0; n < LV.LEVELS.length; n++){ const L = LV.loadLevel(n); assert.equal(L.rooms.some(r => /^cliff/.test(r.name)), n === 2 || n === 3, LV.LEVELS[n].name); }
});

for (const n of [2, 3]) test(`${LV.LEVELS[n].name}: its shape, and the nook with the grip and with nothing else he could have`, () => {
  const C = FC.CLIFFS[n], L = LV.loadLevel(n), W = L.W, R0 = L.rooms.find(r => r.name === C.room), d = C.dir, sx = R0.tx0 + C.at[0], f = R0.ty0 + C.at[1];
  const at = (k, y) => L.tiles[y * W + sx + d * k], name = LV.LEVELS[n].name;
  // the nook's floor: sixteen rows up at least, on the first row of the grip's room drawn for it
  const ch = L.rooms.find(r => r.name === 'cliffhead' && r.ty0 > f && sx + d * F.way[0] >= r.tx0 - 40 && sx + d * F.way[0] < r.tx1 + 40), H = { head: ch.ty0 - f }; H.ceil = H.head + F.ceil - F.head; H.top = H.head + F.top - F.head;
  assert.equal(H.head, FC.cliffHead(f, ch.ty0)); assert.ok(H.head >= F.head && H.head < F.head + 23);
  assert.equal(at(0, f - 1), LV.ROCK, name + ': he stands on rock'); for (let y = f; y < f + 6; y++) assert.equal(at(0, y), LV.EMPTY, 'with room over him');
  for (let k = F.tunnel[0]; k <= F.tunnel[1]; k++){ for (let y = f; y <= f + F.rise; y++) assert.equal(at(k, y), LV.EMPTY, `the tunnel ${k},${y - f}`); assert.equal(at(k, f + F.rise + 1), LV.ROCK, 'its roof'); assert.equal(at(k, f - 1), LV.ROCK, 'its floor'); }
  for (let k = F.way[0]; k <= F.way[1]; k++){ for (let y = f; y <= f + H.top; y++) assert.equal(at(k, y), y === f + H.head - 1 && k >= F.lip[0] && k <= F.lip[1] ? LV.ROCK : LV.EMPTY, `the chimney ${k},${y - f}`); assert.equal(at(k, f + H.top + 1), LV.ROCK, 'roofed'); }
  for (let y = f + F.rise + 1; y <= f + H.top; y++) assert.equal(at(F.face, y), LV.ROUGH, 'its far wall rough'); for (let y = f; y <= f + F.rise; y++) assert.notEqual(at(F.face, y), LV.ROUGH, 'not at the tunnel');
  for (let k = F.nook[0]; k <= F.nook[1]; k++){ for (let y = f + H.head; y <= f + H.ceil; y++) assert.equal(at(k, y), LV.EMPTY, 'the nook'); assert.equal(at(k, f + H.ceil + 1), LV.ROCK); assert.equal(at(k, f + H.head - 1), LV.ROCK); }
  for (let y = f + H.head; y <= f + H.ceil + 1; y++) for (let k = 1; k < F.nook[0]; k++) assert.equal(at(k, y), LV.ROCK, 'two tiles of rock between the nook and the room he came from');
  assert.ok(H.head >= 16, 'sixteen rows over his floor, or more'); assert.equal(F.way[1] - F.lip[1], 2, 'two tiles between the lip and the face');
  // the rooms it is drawn in: open to anyone at the foot, the grip's at the head
  const cl = L.rooms.filter(r => /^cliff/.test(r.name)); assert.ok(cl.length >= 2); for (const r of cl){ assert.ok(r.far && r.wing); assert.equal(r.gate, r.name === 'cliffhead' ? 'grip' : ''); }
  // what is in the nook: a chest of shards, a crystal, a torch on its wall
  const inNook = m => { const k = (m.x - sx) * d; return k >= F.nook[0] && k <= F.nook[1] && m.y >= f + H.head && m.y <= f + H.ceil; };
  const chest = L.marks.filter(m => m.type === 'chest' && inNook(m)); assert.equal(chest.length, 1); assert.equal(chest[0].holds, 'shards'); assert.equal(chest[0].y, f + H.head);
  assert.ok(L.marks.some(m => m.type === 'torch' && inNook(m))); assert.equal(L.marks.filter(m => m.type === 'thread' && inNook(m)).length, 0, 'no thread: two to a region');
  // played
  const kOf = i => (i % W - sx) * d, jOf = i => Math.floor(i / W) - f, nookAt = i => kOf(i) >= F.nook[0] && kOf(i) <= F.way[1] && jOf(i) >= H.head && jOf(i) <= H.top;
  const without = R.graph(n, ['breaker', 'dash', 'glide']); assert.equal([...without.seen].filter(nookAt).length, 0, 'without the grip: not the nook');
  assert.ok([...without.seen].some(i => kOf(i) >= F.way[0] && kOf(i) <= F.way[1] && jOf(i) === 0), 'he walks in to the chimney\'s foot');
  const G = R.graph(n, R.GIFTS), got = [...G.seen].filter(nookAt); assert.ok(got.length > 0, 'with the grip: the nook');
  assert.ok(got.some(i => Math.abs(i % W - chest[0].x) <= 2 && Math.floor(i / W) === chest[0].y), 'and its chest');
  const onward = from => { const seen = new Set(from), q = [...from]; while (q.length){ const k = q.pop(); for (const c of (G.edges.get(k) || new Map()).keys()) if (!seen.has(c)){ seen.add(c); q.push(c); } } return seen; };
  assert.ok([...onward([got[0]])].some(i => jOf(i) === 0 && kOf(i) <= 0), 'and a way back down to the room');
});
