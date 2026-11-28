// The Shard (build 124; docs/phase18-sheet.md 4): west of the summit and under its lip. The underside, the gap, the
// Shard. For one who has the grip, the air dash, the wind and the hammer. Nothing to fight, no one, nothing written.
import test from 'node:test';
import assert from 'node:assert/strict';

const { clock } = await import('./helpers/browser.mjs');
const LV = await import('../src/side/level.js'), R = await import('./helpers/reach.mjs'), SH = await import('../src/side/regions/shard.js'), ST = await import('../src/side/state.js');
const M = await import('../src/side/motor.js'), I = await import('../src/core/input.js'), { islands } = await import('./helpers/platforms.mjs');
const N = LV.CLIMB_TOP, ROOM = { w: 40, h: 23 }, U = SH.UNDER, G = SH.GAP, S = SH.SHARD, NAMES = ['underside', 'gap', 'undershard', 'shard', 'overshard'];
const L0 = LV.loadLevel(N), L = { W: L0.W, H: L0.H, X0: L0.X0, Y0: L0.Y0, tiles: L0.tiles.slice(), marks: L0.marks.map(m => ({ ...m })), rooms: L0.rooms.map(r => ({ ...r })) };
const room = n => L.rooms.find(r => r.name === n), at = (r, x, y) => L.tiles[(r.ty0 + y) * L.W + r.tx0 + x], inRoom = (r, m) => m.x >= r.tx0 && m.x < r.tx1 && m.y >= r.ty0 && m.y < r.ty1;

test('the Shard: four columns west of the summit\'s under-room, in at its floor; the underside, the gap, and the Shard hanging in it', () => {
  const as = room('ascension'), un = room('underside'), gp = room('gap'), us = room('undershard'), sh = room('shard'), os = room('overshard');
  for (const r of [un, gp, us, sh, os]) assert.ok(r && r.far && r.wing); for (const r of [un, gp, us]) assert.equal(r.gate, '', 'anyone walks under it and looks up'); for (const r of [sh, os]) assert.equal(r.gate, 'grip', 'the Shard itself: the grip\'s');
  assert.equal(un.title, 'THE UNDERSIDE'); assert.equal(sh.title, 'THE SHARD'); for (const r of [gp, us, os]){ assert.equal(r.title, 'THE GAP'); assert.ok(r.open, 'under the sky'); } assert.ok(!sh.open && !un.open); assert.equal(sh.look, 'shardlight'); assert.ok(sh.bare, 'nothing on the wall behind it');
  assert.equal(un.tx1, as.tx0, 'the underside: west of the room under the summit'); assert.equal(un.ty0, as.ty0); assert.equal(un.ty1, L.H, 'three screens, to the level\'s top'); assert.equal(un.ty1 - un.ty0, 3 * ROOM.h);
  assert.equal(gp.tx1, un.tx0); assert.equal(gp.tx1 - gp.tx0, 2 * ROOM.w); assert.equal(gp.ty0, un.ty0); assert.equal(gp.ty1, L.H);
  assert.equal(sh.tx0, 0, 'the Shard: at the level\'s west edge'); assert.equal(sh.tx1, gp.tx0); assert.equal(sh.ty0, gp.ty0 + ROOM.h, 'the middle screen of the three'); assert.equal(us.ty1, sh.ty0); assert.equal(os.ty0, sh.ty1); assert.equal(us.tx0, 0); assert.equal(os.tx0, 0);
  assert.equal(L.X0 - ST.ORG115[N][0], 4 * ROOM.w, 'the Firmament is four columns wider to the west: a save follows'); assert.equal(SH.far.left, 4);
  for (let y = U.foot; y <= U.foot + 5; y++) for (const x of [as.tx0, as.tx0 + 1, un.tx1 - 1, un.tx0, gp.tx1 - 1]) assert.equal(L.tiles[(as.ty0 + y) * L.W + x], LV.EMPTY, 'the way in, at the floor, and on west to the mountain\'s shoulder');
  assert.equal(islands(N).length, 0);
});

test('it hangs: the Shard\'s stone touches the level\'s west edge and nothing else; sky under it and over it', () => {
  const gp = room('gap'), us = room('undershard'), sh = room('shard'), os = room('overshard'), rock = k => L.tiles[k] === LV.ROCK || L.tiles[k] === LV.ROUGH || L.tiles[k] === LV.CRACKED;
  const k0 = (sh.ty0 + 1) * L.W + 10; assert.ok(rock(k0)); const seen = new Set([k0]), q = [k0]; while (q.length){ const a = q.pop(), i = a % L.W; for (const b of [i > 0 ? a - 1 : -1, i < L.W - 1 ? a + 1 : -1, a - L.W, a + L.W]) if (b >= 0 && b < L.W * L.H && rock(b) && !seen.has(b)){ seen.add(b); q.push(b); } }
  let x1 = 0, y0 = L.H, y1 = 0; for (const k of seen){ x1 = Math.max(x1, k % L.W); y0 = Math.min(y0, Math.floor(k / L.W)); y1 = Math.max(y1, Math.floor(k / L.W)); }
  assert.equal(x1, gp.tx0 + G.keel[1], 'no further east than its keel\'s face'); assert.ok(y0 >= us.ty0 + 9, 'its keel ends well over the shoulder'); assert.ok(y1 <= os.ty0 + 8, 'its crag'); assert.ok(seen.size > 900);
  assert.ok(!seen.has((gp.ty0 + G.floor - 1) * L.W + gp.tx0 + 40), 'not the shoulder under it'); assert.ok(!seen.has((gp.ty0 + G.shelf[2] - 1) * L.W + gp.tx0 + G.shelf[0] + 2), 'nor the mountain');
  for (let x = us.tx0; x < gp.tx1; x++){ assert.equal(L.tiles[(us.ty0 + G.floor - 1) * L.W + x], LV.ROCK, 'the shoulder runs under all of it'); for (let y = G.floor + 1; y <= 8; y++) assert.equal(L.tiles[(us.ty0 + y) * L.W + x], LV.EMPTY, 'and open over the shoulder'); }
  for (let x = 0; x < gp.tx1; x++) for (let y = os.ty0 + 9; y < L.H; y++) assert.equal(L.tiles[y * L.W + x], LV.EMPTY, 'sky over it');
  // the gap: nothing in it, from the keel to the shelf
  for (let y = G.floor; y < 3 * ROOM.h; y++) for (let x = G.keel[1] + 1; x < G.shelf[0]; x++) assert.equal(at(gp, x, y), LV.EMPTY, `the gap at ${x},${y}`);
  assert.ok(G.shelf[0] - G.keel[1] - 1 >= 60, 'sixty tiles and more of air');
});

test('the underside: four faces up a shaft, one wall and then the other, each to an alcove; the last runs out west to the shelf', () => {
  const un = room('underside'), [s0, s1] = U.shaft; assert.equal(U.pitches.length, 4);
  let from = U.foot, side = 'w';
  for (const [w, y0, top] of U.pitches){ assert.notEqual(w, side, 'the other wall each time'); side = w; const x = w === 'e' ? s1 + 1 : s0 - 1;
    for (let y = y0; y < top; y++) assert.equal(at(un, x, y), LV.ROUGH, `the face at ${x},${y}`); assert.ok(top - y0 >= 8 && top - y0 <= 16);
    for (let y = top; y <= top + 5; y++) for (let d = 1; d <= 5; d++) assert.equal(at(un, w === 'e' ? s1 + d : s0 - d, y), LV.EMPTY, 'its alcove'); assert.equal(at(un, w === 'e' ? s1 + 2 : s0 - 2, top - 1), LV.ROCK, 'a floor in it');
    assert.ok(y0 <= from + 8, 'he comes to its foot from where he stands'); from = top; }
  assert.ok(U.pitches[0][2] - U.foot > 14.5 + 4, 'the first alcove: more than he comes up without the grip'); assert.equal(U.pitches[3][2], U.head); assert.equal(U.head, G.shelf[2], 'out on to the shelf');
  for (let x = 0; x < s0; x++) for (let y = U.head; y <= U.head + 5; y++) assert.equal(at(un, x, y), x >= U.pane[0] && x <= U.pane[1] ? LV.VELLUM : LV.EMPTY, 'west, out of the mountain, through a pane');
  let rough = 0; for (let y = 0; y < 3 * ROOM.h; y++) for (let x = 0; x < ROOM.w; x++) if (at(un, x, y) === LV.ROUGH) rough++; assert.equal(rough, U.pitches.reduce((a, p) => a + p[2] - p[1], 0), 'no rough rock but the four faces');
  for (let y = U.foot + 6; y <= U.head + 5; y++) for (let x = s0; x <= s1; x++) assert.equal(at(un, x, y), LV.EMPTY, 'the shaft is clear');
});

test('the keel: rough from well over anything he comes up to off the shoulder, to its head; and a plain glide comes to it under the head', () => {
  const gp = room('gap'), [p0, p1, py0, py] = G.keel;
  for (let y = py0; y < py; y++) assert.equal(at(gp, p1, y), y >= G.rough[0] && y <= G.rough[1] ? LV.ROUGH : LV.ROCK, `the face at ${y}`); assert.equal(G.rough[1], py - 1);
  assert.ok(G.rough[0] > G.floor + 14.5 + 4.8, 'its rough rock begins over his head at the top of all he leaps and hauls: no way up it from the shoulder');
  for (let x = p0; x <= p1; x++){ assert.notEqual(at(gp, x, py - 1), LV.EMPTY, 'its head'); for (let y = py; y <= py + 5; y++) assert.equal(at(gp, x, y), LV.EMPTY); }
  // measured with the real motor: a run off the shelf's lip, a jump, the second jump at its top, and the wind held
  R.graph(N, R.GIFTS); const T = LV.T, LVL = LV.LEVEL, g = LVL.rooms.find(q => q.name === 'gap');
  I.release(); clock.t += 10; const P = M.newPlayer(g.x0 + (G.shelf[0] + 3) * T, g.y0 + G.shelf[2] * T + 0.01); let t = 0, off = false, two = false, hit = null, top = 0;
  for (let f = 0; f < 1500 && !hit; f++){ I.hold('left', true); const tx = (P.x - g.x0) / T; if (P.grounded && tx < G.shelf[0] + 0.6 && !off) I.tap('jump'); if (!P.grounded) off = true; if (off && !two && P.vy <= 0){ I.tap('jump'); two = true; } if (off) I.hold('jump', true);
    for (let s = 0; s < 2; s++){ M.stepPlayer(P, 1 / 120); clock.t += 1 / 120; t += 1 / 120; } I.endFrame(); P.events.length = 0; top = Math.max(top, (P.y - g.y0) / T);
    if (off && (tx < p1 + 1.9 || P.grounded)) hit = { x: tx, row: (P.y - g.y0) / T, grounded: P.grounded }; }
  I.release(); assert.ok(hit && !hit.grounded, 'he comes to the keel in the air'); assert.ok(hit.x < p1 + 2 && hit.x > p1, 'at its face');
  assert.ok(hit.row <= py - 3, `under its head (his feet at row ${hit.row.toFixed(1)}): he has to take hold`); assert.ok(hit.row >= G.rough[0] + 6, 'and with rows of rough rock to spare under him for a worse one');
});

test('what is in it: one thread, on the keel\'s head; the old light; nothing to fight, no one, nothing written', () => {
  const gp = room('gap'), sh = room('shard'), rs = NAMES.map(room), mine = L.marks.filter(m => m.type !== 'keep' && rs.some(r => inRoom(r, m)));
  const kinds = [...new Set(mine.map(m => m.type))].sort(); assert.deepEqual(kinds, ['crystal', 'deco', 'thread', 'torch', 'urn'], kinds.join(' '));
  const th = mine.filter(m => m.type === 'thread'); assert.equal(th.length, 1); assert.equal(th[0].y - gp.ty0, G.keel[3]); assert.ok(th[0].x - gp.tx0 <= G.keel[1]);
  const deco = mine.filter(m => m.type === 'deco'); assert.equal(deco.length, 1); assert.equal(deco[0].kind, 'oldlight'); assert.ok(inRoom(sh, deco[0])); assert.equal(deco[0].y - sh.ty0, S.floor); assert.equal(deco[0].x - sh.tx0, S.light);
  assert.ok(!LV.SPOKEN || !LV.SPOKEN.oldlight, 'it says nothing');
  // its way in: a crust of cracked stone, the hammer's
  for (let y = S.door; y <= S.door + 5; y++){ for (const x of [38, 39]) assert.equal(at(sh, x, y), LV.CRACKED); for (let x = 28; x <= 37; x++) assert.equal(at(sh, x, y), LV.EMPTY); }
  assert.equal(sh.ty0 + S.door, gp.ty0 + G.keel[3], 'level with the keel\'s head');
  let cracked = 0; for (const r of rs) for (let y = r.ty0; y < r.ty1; y++) for (let x = r.tx0; x < r.tx1; x++) if (L.tiles[y * L.W + x] === LV.CRACKED) cracked++; assert.equal(cracked, 12);
});

test('played: the light with the grip, the air dash, the wind and the hammer; with the grip gone, nothing over the shoulder; with the hammer gone, not inside; and a way back', () => {
  const where = Gr => { const by = {}; for (const k of Gr.seen){ const i = k % Gr.W, j = Math.floor(k / Gr.W), r = Gr.rooms.find(q => i >= q.tx0 && i < q.tx1 && j >= q.ty0 && j < q.ty1); if (r && NAMES.includes(r.name)) (by[r.name] ||= []).push([i - r.tx0, j - r.ty0, k]); } return by; };
  const A = R.graph(N, R.GIFTS), a = where(A);
  assert.ok(a.shard && a.shard.some(([x, y]) => Math.abs(x - S.light) <= 3 && y <= S.floor + 2), 'he stands at the light'); assert.ok(a.gap.some(([x, y]) => x <= G.keel[1] && y === G.keel[3]), 'on the keel\'s head'); assert.ok(a.underside.some(([, y]) => y === U.head));
  const b = where(R.graph(N, R.GIFTS.filter(g => g !== 'grip'))); assert.ok(!b.shard && !b.overshard); for (const n of ['underside', 'gap', 'undershard']) assert.ok(b[n] && b[n].every(([, y]) => y <= U.foot + 1), n + ': only its floor');
  const d = where(R.graph(N, R.GIFTS.filter(g => g !== 'dash'))); assert.ok(d.underside.some(([, y]) => y === U.head), 'without the air dash: up the underside'); assert.ok(d.underside.every(([x, y]) => y < U.head || x > U.pane[1]) && d.gap.every(([, y]) => y <= U.foot + 1) && !d.shard, 'and no further than its pane');
  const c = where(R.graph(N, R.GIFTS.filter(g => g !== 'breaker'))); assert.ok(!c.shard, 'the crust stops him'); assert.ok(c.gap.some(([x, y]) => x <= G.keel[1] && y === G.keel[3]), 'at the door');
  const as = A.rooms.find(q => q.name === 'ascension'), k0 = a.shard.find(([x, y]) => x < 20 && y <= S.floor + 2)[2], seen = new Set([k0]), q = [k0]; while (q.length){ const k = q.pop(); for (const d of (A.edges.get(k) || new Map()).keys()) if (!seen.has(d)){ seen.add(d); q.push(d); } }
  assert.ok([...seen].some(k => { const i = k % A.W, j = Math.floor(k / A.W); return i >= as.tx0 + 6 && i < as.tx1 && j >= as.ty0 && j < as.ty1; }), 'from the light, back to the room under the summit');
});
