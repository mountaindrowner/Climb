// The edges of every level (docs/edges-sheet.md; builds 115 on): the rows under and over each level, what is built in
// them and past the wings' far ends, and the save that follows a level when it grows.
import test from 'node:test';
import assert from 'node:assert/strict';

const LV = await import('../src/side/level.js'), ST = await import('../src/side/state.js');
const { LEVELS, loadLevel, LIFT, ROOM } = LV;
const built = LEVELS.map((_, n) => { const L = loadLevel(n); return { W: L.W, H: L.H, X0: L.X0 || 0, Y0: L.Y0 || 0, name: L.name, tiles: L.tiles.slice(), marks: L.marks.map(m => ({ ...m })), rooms: L.rooms.map(r => ({ ...r })) }; });

// where two things stood in each level at build 115: the place he wakes or comes in, and the first thread (in the Deep, the first chest)
const AT115 = [[167,93,"thread",184,105],[124,94,"thread",274,216],[125,117,"thread",202,199],[125,117,"thread",188,211],[125,94,"thread",190,178],[5,117,"thread",4,259],[20,154,"chest",33,140],[14,140,"chest",8,48],[26,127,"chest",96,133],[10,107,"chest",28,91],[10,119,"chest",88,119]];

test('every level stands on rock nothing is cut in but what is meant to be, with room over it', () => {
  for (const [n, L] of built.entries()){
    assert.ok(L.Y0 >= LIFT.base * ROOM.h, `${L.name}: at least ${LIFT.base} rooms under where it began`);
    assert.equal(L.tiles.length, L.W * L.H);
    for (const r of L.rooms){ assert.ok(r.ty0 >= 0 && r.ty1 <= L.H && r.tx0 >= 0 && r.tx1 <= L.W, `${L.name}: ${r.name} is inside the level`); }
    for (const m of L.marks) assert.ok(m.x >= 0 && m.x < L.W && m.y >= 0 && m.y < L.H, `${L.name}: a ${m.type} at ${m.x},${m.y} is inside the level`);
    assert.ok(n >= 0);
  }
});

test('a save follows its level: what build 115 knew of each level is where it was, moved by as far as the level has grown since', () => {
  assert.equal(ST.ORG115.length, LEVELS.length);
  for (const [n, L] of built.entries()){
    const [ox, oy] = ST.ORG115[n], dx = L.X0 - ox, dy = L.Y0 - oy, [sx, sy, kind, tx, ty] = AT115[n];
    assert.ok(dx >= 0 && dy >= 0 && dx % ROOM.w === 0 && dy % ROOM.h === 0, `${L.name}: a level grows west or down by whole rooms`);
    const spawn = L.marks.find(m => m.type === 'spawn'); assert.deepEqual([spawn.x, spawn.y], [sx + dx, sy + dy], `${L.name}: where he comes in is where it was, moved with the level`);
    assert.ok(L.marks.some(m => m.type === kind && m.x === tx + dx && m.y === ty + dy), `${L.name}: its first ${kind} is where it was, moved with the level`);
    // a save from build 115 or before (no `org`): its places in this level are moved by that much, once
    const S = { got: { [n]: ['t' + tx + ',' + ty, 'c1,2'] }, broke: { [n]: ['3,4'] }, lit: { [n]: ['5,6'] }, wat: { [n]: ['r', '7,8|a room'] }, blocked: {} };
    const moved = ST.rebase(n, L.X0, L.Y0, S);
    assert.equal(moved, !!(dx || dy)); assert.deepEqual(S.org[n], [L.X0, L.Y0]);
    assert.deepEqual(S.got[n], ['t' + (tx + dx) + ',' + (ty + dy), 'c' + (1 + dx) + ',' + (2 + dy)]); assert.deepEqual(S.broke[n], [(3 + dx) + ',' + (4 + dy)]); assert.deepEqual(S.lit[n], [(5 + dx) + ',' + (6 + dy)]); assert.deepEqual(S.wat[n], ['r', (7 + dx) + ',' + (8 + dy) + '|a room']);
    assert.equal(ST.rebase(n, L.X0, L.Y0, S), false, 'and not twice'); assert.deepEqual(S.broke[n], [(3 + dx) + ',' + (4 + dy)]);
    // a save written when the level stood somewhere else again
    const S2 = { org: { [n]: [L.X0 - 40, L.Y0 - 23] }, got: { [n]: ['t10,10'] } }; assert.equal(ST.rebase(n, L.X0, L.Y0, S2), true); assert.deepEqual(S2.got[n], ['t50,33']);
    // a new game has nothing to move, and learns where the level stands
    const S3 = {}; ST.rebase(n, L.X0, L.Y0, S3); assert.deepEqual(S3.org[n], [L.X0, L.Y0]);
  }
});

// ---- the Roots (build 116): the Drawing-Place past the weir, the Unsorted past the niches
await import('./helpers/browser.mjs');
const R = await import('./helpers/reach.mjs'), RF = await import('../src/side/regions/rootsfar.js'), OS = await import('../src/side/regions/ossuary.js');
const L0 = { ...R.loadLevel(0) }, room0 = n => L0.rooms.find(r => r.name === n), in0 = (m, r) => m.x >= r.tx0 && m.x < r.tx1 && m.y >= r.ty0 && m.y < r.ty1;
const FAR0 = ['sump', 'drawshaft', 'loft', 'sounding', 'unsorted', 'firstlaid'];
// from a set of places, everywhere he can go on to (over the reach graph)
const onward = (G, from) => { const seen = new Set(from), q = [...from]; while (q.length){ const k = q.pop(); for (const c of (G.edges.get(k) || new Map()).keys()) if (!seen.has(c)){ seen.add(c); q.push(c); } } return seen; };
const nodesIn = (G, r) => [...G.seen].filter(k => { const i = k % G.W, j = Math.floor(k / G.W); return i >= r.tx0 && i < r.tx1 && j >= r.ty0 && j < r.ty1; });

test('the Roots: a column further west and one further east, thirteen screens, and down into the rock under the level', () => {
  const rs = FAR0.map(room0); assert.ok(rs.every(Boolean), 'all six rooms'); assert.ok(rs.every(r => r.far && r.wing));
  assert.equal(rs.reduce((n, r) => n + (r.tx1 - r.tx0) * (r.ty1 - r.ty0) / (ROOM.w * ROOM.h), 0), 13);
  const weir = room0('weir'), cells = room0('keepcells'), ni = room0('niches');
  for (const n of ['sump', 'drawshaft', 'sounding']){ assert.equal(room0(n).tx1, weir.tx0, n + ' is the column west of the weir'); assert.equal(room0(n).tx0, 0, 'at the level\'s west edge'); }
  assert.equal(room0('sump').ty0, cells.ty0, 'the sump beside the foot of the cells\' pit'); assert.equal(room0('drawshaft').ty1, weir.ty1, 'the shaft to the weir\'s roof'); assert.equal(room0('loft').ty0, weir.ty1, 'the loft over both');
  assert.equal(room0('sounding').ty0, 0, 'the Sounding goes to the bottom of the rock the level stands on (build 115)'); assert.equal(room0('sounding').ty1, room0('sump').ty0, 'from under the sump'); assert.ok(room0('sounding').ty0 < room0('keepstore').ty0 - ROOM.h, 'two screens lower than anything there was');
  assert.equal(room0('unsorted').tx0, ni.tx1, 'the pit is the column east of the niches'); assert.equal(room0('unsorted').ty0, room0('aisle').ty0, 'its foot level with the aisle\'s'); assert.equal(room0('unsorted').tx1, L0.W, 'at the level\'s east edge'); assert.equal(room0('firstlaid').ty1, room0('unsorted').ty0, 'the tomb under it');
  assert.equal(room0('sounding').gate, 'glide', 'the Sounding is for one who can go under'); for (const n of ['unsorted', 'firstlaid']){ assert.equal(room0(n).gate, 'breaker', 'as the Ossuary is'); assert.equal(room0(n).look, 'cloister'); }
  // the Sounding's only way in is down through deep water: the Well's mouth in the sump's floor
  const sump = room0('sump'), mouth = L0.waters.filter(w => w.deep && w.x0 / LV.T >= sump.tx0 && w.x1 / LV.T <= sump.tx1 && w.y0 / LV.T >= sump.ty0 && w.y0 / LV.T < sump.ty1);
  assert.equal(mouth.length, 1); assert.equal(mouth[0].y1 / LV.T, sump.ty0 + 8, 'brim-full at the sump\'s floor');
  for (let x = sump.tx0; x < sump.tx1; x++){ const open = L0.tiles[(sump.ty0 - 1) * L0.W + x] !== LV.ROCK; assert.equal(open, x >= mouth[0].x0 / LV.T && x < mouth[0].x1 / LV.T, 'nothing else is cut through the sump\'s floor'); }
});

test('the bucket-chain: four buckets on one key, still until the windlass at the foot is turned, and then up at one pace', () => {
  R.loadLevel(0); LV.setGates();
  const ch = LV.LEVEL.movers.filter(m => m.key === RF.CHAIN.key), lass = L0.marks.find(m => m.type === 'windlass' && m.key === RF.CHAIN.key), sh = room0('drawshaft');
  assert.equal(ch.length, RF.CHAIN.buckets); assert.ok(ch.every(m => m.kind === 'chain' && m.look === 'bucket' && m.ax === 0));
  assert.ok(in0(lass, room0('sump')), 'the windlass is in the sump'); const head = sh.ty0 + RF.CHAIN.head; assert.ok(head - lass.y >= 3 * ROOM.h, 'three screens under the head of the chain it turns');
  assert.ok(head >= room0('loft').ty0 + 2 && head <= room0('loft').ty0 + 6, 'the buckets come a little over the loft\'s floor'); assert.ok(sh.ty0 + RF.CHAIN.foot < room0('sump').ty0 + 8, 'and start under the water in the Well\'s mouth');
  // still: wherever the clock is
  const at0 = ch.map(m => LV.moverAt(m, 0)); for (const t of [1, 7.3, 400]) assert.deepEqual(ch.map(m => LV.moverAt(m, t)), at0, 'not turned: nothing moves');
  // turned at t = 100: it goes on from where it stood, with no jump, and upward
  LV.RULE.gates.add(RF.CHAIN.key); LV.keyRun(RF.CHAIN.key, true, 100);
  assert.deepEqual(ch.map(m => LV.moverAt(m, 100)), at0, 'it starts from where it stood');
  const speed = (RF.CHAIN.head - RF.CHAIN.foot) * LV.T / RF.CHAIN.period; let wraps = 0;
  for (const m of ch){ let [, y] = LV.moverAt(m, 100); for (let t = 100; t < 100 + RF.CHAIN.period * 2; t += 1 / 60){ const [, y2] = LV.moverAt(m, t + 1 / 60); if (y2 < y) wraps++; else assert.ok(Math.abs((y2 - y) * 60 - speed) < 1e-6, 'up, at one pace'); y = y2; } }
  assert.equal(wraps, RF.CHAIN.buckets * 2, 'each bucket goes over the top once a round, and comes in at the foot');
  assert.ok(speed > 1.5 && speed < 4, 'slow enough to step on to, fast enough to be a ride');
  // stopped at t = 130, started at t = 500: where it stopped
  LV.RULE.gates.delete(RF.CHAIN.key); LV.keyRun(RF.CHAIN.key, false, 130); const held = ch.map(m => LV.moverAt(m, 130)); assert.deepEqual(ch.map(m => LV.moverAt(m, 300)), held);
  LV.RULE.gates.add(RF.CHAIN.key); LV.keyRun(RF.CHAIN.key, true, 500); for (const [k, m] of ch.entries()){ const [x, y] = LV.moverAt(m, 500); assert.ok(Math.abs(x - held[k][0]) < 1e-9 && Math.abs(y - held[k][1]) < 1e-9, 'and on from there'); }
  // his save: a chain he set going is going when he comes back
  LV.setGates({ [RF.CHAIN.key]: 1 }); assert.ok(LV.RULE.gates.has(RF.CHAIN.key)); LV.setGates(); assert.ok(!LV.RULE.gates.has(RF.CHAIN.key));
  // the shaft is sheer: no stone in it between the sump's roof and the loft's floor
  for (let y = sh.ty0; y < sh.ty1; y++) for (let x = sh.tx0 + 16; x <= sh.tx0 + 23; x++) assert.equal(L0.tiles[y * L0.W + x], LV.EMPTY, 'the shaft is open, wall to wall');
});

test('the Unsorted: one way in; one scale, its stack in three, a piece on each of three ledges; the slab lies across the hole to the first tomb', () => {
  const pit = room0('unsorted'), tomb = room0('firstlaid'), P = RF.PIT;
  const st = L0.marks.filter(m => m.type === 'bonestack' && m.key === P.key), pan = L0.marks.filter(m => m.type === 'pan' && m.key === P.key), g = L0.marks.filter(m => m.type === 'gate' && m.key === P.key);
  assert.equal(st.length, 3); assert.equal(pan.length, 1); assert.equal(g.length, 1); assert.ok(st.every(s => s.n === 1 && in0(s, pit))); assert.deepEqual(st.map(s => s.i).sort(), [0, 1, 2]);
  assert.equal(g[0].h, 1, 'it lies flat'); assert.equal(g[0].y, pit.ty0 + 3, 'in the pit\'s floor'); for (let x = g[0].x; x < g[0].x + g[0].w; x++){ assert.equal(L0.tiles[g[0].y * L0.W + x], LV.SLUICE); for (let y = tomb.ty1 - 2; y < g[0].y; y++) assert.equal(L0.tiles[y * L0.W + x], y === tomb.ty1 - 1 && x >= g[0].x + g[0].w - 2 ? LV.ROCK : LV.EMPTY, 'open under it, down into the tomb (but for the last sill up, under its east end)'); }
  const ys = st.map(s => s.y - pit.ty0).sort((a, b) => a - b); assert.ok(ys[2] - ys[1] >= 40, 'the third is far over the others: the whole of the tiers to climb'); assert.ok(Math.abs(st.find(s => s.i === 0).x - st.find(s => s.i === 1).x) >= 20, 'and the two low ones are on opposite walls');
  assert.ok(Math.abs(pan[0].x - (g[0].x + 2)) >= 10, 'the pan is not beside the slab: he cannot stand in it and step through');
  // one way in, from the head of the aisle's stair: the west wall is whole but for it, and the other three are whole
  const ai = room0('aisle'); let door = 0; for (let y = pit.ty0; y < pit.ty1; y++){ if (L0.tiles[y * L0.W + pit.tx0] !== LV.ROCK){ door++; assert.ok(y >= ai.ty0 && y < ai.ty1, 'in the aisle\'s height'); assert.notEqual(L0.tiles[y * L0.W + pit.tx0 - 1], LV.ROCK, 'and through to the aisle'); } assert.equal(L0.tiles[y * L0.W + pit.tx1 - 1], LV.ROCK); }
  assert.equal(door, 5); for (let x = pit.tx0; x < pit.tx1; x++) assert.equal(L0.tiles[(pit.ty1 - 1) * L0.W + x], LV.ROCK);
  // the tiers: each shorter than the one under it, and no more than he can haul himself up between them
  for (const [k, [y, x]] of P.tiers.entries()){ assert.equal(L0.tiles[(pit.ty0 + y - 1) * L0.W + pit.tx0 + x], LV.ROCK); assert.equal(L0.tiles[(pit.ty0 + y - 1) * L0.W + pit.tx0 + x - 1], LV.EMPTY, 'its lip'); if (k){ assert.ok(x >= P.tiers[k - 1][1] + 2, 'two tiles of the one under it to stand on, clear of it'); assert.ok(y - P.tiers[k - 1][0] <= 12, 'no more than twelve rows'); } }
  // the slab lifts only for all three; each stack is its own
  R.loadLevel(0); LV.setGates(); const open = () => LV.tileAt(g[0].x, g[0].y) === LV.EMPTY;
  for (const [load, up] of [[0, false], [1, false], [2, false], [3, true]]){ LV.setPan(P.key, load); assert.equal(open(), up, `${load} in the pan`); }
  LV.setPan(P.key, 0, 3); assert.ok(open(), 'his own weight lifts it, while he stands in the pan'); LV.setPan(P.key, 0); assert.ok(!open());
  LV.setGates({}, { [P.key]: 2, [P.key + '#']: [2, 0] }); assert.equal(LV.RULE.pan[P.key], 2); assert.deepEqual(LV.RULE.stacks[P.key], [2, 0], 'his save keeps which stacks have gone over, in the order they went');
  // the stack: struck, it sends one piece, and only if it is still on its ledge
  const ev = [], c = { RULE: LV.RULE, events: ev, E: { list: [], scene: null } }, strike = i => { const e = { mk: st.find(s => s.i === i), struck: true, cool: 0, x: 0, y: 0 }; OS.ai.bonestack(e, { x: 99, y: 99 }, 1 / 60, c); return ev.splice(0); };
  assert.deepEqual(strike(2), [], 'one that has gone over already sends nothing'); const got = strike(1); assert.equal(got.length, 1); assert.equal(got[0].load, 3); assert.equal(got[0].stack, 1); assert.ok(got[0].fell);
  LV.setGates(); const first = strike(0); assert.equal(first[0].load, 1, 'one piece'); assert.equal(first[0].eff, 1);
  // the Ossuary's own stacks are as they were: all three at once
  const yard = L0.marks.find(m => m.type === 'bonestack' && m.key === 'yard'); assert.ok(!yard.n); const e = { mk: yard, struck: true, cool: 0, x: 0, y: 0 }; OS.ai.bonestack(e, { x: 99, y: 99 }, 1 / 60, c); assert.equal(ev.splice(0)[0].load, 3);
  // a ring under the slab, in the tomb: he is not to be shut in
  const ring = L0.marks.find(m => m.type === 'ring' && m.key === P.key); assert.ok(ring && in0(ring, tomb)); assert.ok(ring.x >= g[0].x && ring.x < g[0].x + g[0].w && ring.y < g[0].y && g[0].y - ring.y <= 6, 'on the slab\'s underside');
  LV.setGates({ [P.key]: 1 }); assert.ok(open(), 'struck, the slab is up whatever is in the pan'); LV.setGates();
  assert.equal(L0.marks.filter(m => m.type === 'acolyte' && in0(m, pit)).length, 2, 'two Tallymen keep the pan');
});

// (SHUT0: he turns nothing; the gates and slabs there were before are up, so that only the chain and the new scale are in question)
const ALL0 = R.graph(0, R.GIFTS), SHUT0 = R.graph(0, ['shut', 'gate:hall', 'gate:cells', 'gate:culvert', 'gate:hatch', 'gate:yard', 'gate:count', ...R.GIFTS]);
test('the Roots\' far ends, played: the loft only by the chain, the tomb only by all three stacks, and from each of them a way back', () => {
  for (const n of FAR0) assert.ok(R.reached(ALL0.seen, room0(n), ALL0.W), n + ' is come to, with every gift');
  assert.ok(ALL0.gates.includes(RF.CHAIN.key) && ALL0.gates.includes(RF.PIT.key));
  // turning nothing: the gallery half-way up the shaft and the sump, but not the loft; the pit, but not the tomb
  assert.ok(R.reached(SHUT0.seen, room0('drawshaft'), SHUT0.W) && R.reached(SHUT0.seen, room0('sump'), SHUT0.W), 'the shaft is seen from its gallery and its foot before the chain is turned');
  assert.ok(!R.reached(SHUT0.seen, room0('loft'), SHUT0.W), 'the loft: not without the chain'); assert.ok(!R.reached(SHUT0.seen, room0('firstlaid'), SHUT0.W), 'the tomb: not without the scale');
  const sh = room0('drawshaft'); for (const k of nodesIn(SHUT0, sh)){ const j = Math.floor(k / SHUT0.W) - sh.ty0; assert.ok(j <= 48, 'with the chain still, nothing in the shaft over its gallery is come to'); }
  // the three stacks are come to (the high one up the tiers), and the thread beside it
  const pit = room0('unsorted'); for (const s of L0.marks.filter(m => m.type === 'bonestack' && m.key === RF.PIT.key)){ assert.ok([...SHUT0.seen].some(k => Math.abs(k % SHUT0.W - s.x) <= 3 && Math.abs(Math.floor(k / SHUT0.W) - s.y) <= 2), `stack ${s.i} is come to before anything is turned`); } for (const s of L0.marks.filter(m => m.type === 'bonestack' && m.key === RF.PIT.key)) assert.ok([...ALL0.seen].some(k => Math.abs(k % ALL0.W - s.x) <= 3 && Math.abs(Math.floor(k / ALL0.W) - s.y) <= 2), `stack ${s.i} is come to`);
  const th = L0.marks.find(m => m.type === 'thread' && in0(m, pit)); assert.ok(ALL0.seen.has(th.y * ALL0.W + th.x) || [...ALL0.seen].some(k => Math.abs(k % ALL0.W - th.x) <= 1 && Math.floor(k / ALL0.W) === th.y), 'the thread on the high ledge');
  // a way back from every one of the new rooms: to the weir's bank from the west ones, to the aisle from the east ones
  const weir = room0('weir'), ni = room0('aisle'), inRoom = (k, r) => { const i = k % ALL0.W, j = Math.floor(k / ALL0.W); return i >= r.tx0 && i < r.tx1 && j >= r.ty0 && j < r.ty1; };
  for (const [n, home] of [['sump', weir], ['drawshaft', weir], ['loft', weir], ['sounding', weir], ['unsorted', ni], ['firstlaid', ni]]){ const from = nodesIn(ALL0, room0(n)); assert.ok(from.length > 0);
    for (const k of from) assert.ok([...onward(ALL0, [k])].some(c => inRoom(c, home)), `${n}: from ${k % ALL0.W - room0(n).tx0},${Math.floor(k / ALL0.W) - room0(n).ty0} there is a way back`); }
});

test('a new game\'s save says where its level stands, though the game was emptied after the level was made', () => {
  const store = {}; globalThis.localStorage = { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
  ST.rebase(0, built[0].X0, built[0].Y0); ST.fresh(); assert.equal(ST.G.org, undefined); ST.store();
  const saved = JSON.parse(Object.values(store)[0]); assert.deepEqual(saved.org[0], [built[0].X0, built[0].Y0]);
});

// ---- the Cloister (build 117): the Empty Shelves past the copying hall, the Cull past the slag runs
const CF = await import('../src/side/regions/cloisterfar.js');
const L1 = { ...R.loadLevel(1) }, room1 = n => L1.rooms.find(r => r.name === n), FAR1 = ['shelves', 'bindery', 'cull'];
const stood = (G, r, x0, y0, x1, y1) => nodesIn(G, r).some(k => { const i = k % G.W - r.tx0, j = Math.floor(k / G.W) - r.ty0; return i >= x0 && i <= x1 && j >= y0 && j <= y1; });

test('the Cloister: a column further west and one further east, eight screens', () => {
  const rs = FAR1.map(room1); assert.ok(rs.every(Boolean)); assert.ok(rs.every(r => r.far && r.wing));
  assert.equal(rs.reduce((n, r) => n + (r.tx1 - r.tx0) * (r.ty1 - r.ty0) / (ROOM.w * ROOM.h), 0), 8);
  const hall = room1('hall'), sl = room1('slagruns'), sh = room1('shelves'), bi = room1('bindery'), cu = room1('cull');
  assert.equal(sh.tx1, hall.tx0, 'the shelves are the column west of the copying hall'); assert.equal(sh.tx0, 0, 'at the level\'s west edge'); assert.equal(sh.ty0, hall.ty0, 'from its floor');
  assert.equal(bi.ty0, sh.ty1, 'the binders\' loft over them'); assert.equal(bi.tx0, 0); assert.equal(room1('rubrication').ty1, bi.ty0, 'and over the rubrication');
  assert.equal(cu.tx0, sl.tx1, 'the Cull is the column east of the slag runs'); assert.equal(cu.tx1, L1.W, 'at the level\'s east edge'); assert.equal(cu.ty0 + CF.CULL.land - 2, sl.ty0, 'its near landing level with the foot of the runs');
  assert.equal(sh.gate, 'dash'); assert.equal(bi.gate, 'dash'); assert.equal(cu.gate, 'breaker', 'each gated as the wing it is the end of');
  assert.equal(sh.title, 'THE EMPTY SHELVES'); assert.equal(cu.title, 'THE BELL-FOUNDRY'); assert.equal(sh.look, 'bareshelves', 'the Scriptorium\'s look, with no books on the walls'); assert.equal(cu.look, 'foundry');
});

test('a thing on a rail: it stands at one end until it is sent, rolls to the other, slow out and slow in, and stays', () => {
  R.loadLevel(1); LV.setGates(); const P = LV.PHASE, all = P.all, t0 = P.t;
  try {
    const rails = LV.LEVEL.movers.filter(m => m.kind === 'rail'); assert.deepEqual([...new Set(rails.map(m => m.key))].sort(), ['crane', 'floor', 'hung']);
    const fl = rails.filter(m => m.key === 'floor'), A = CF.LADDERS.floor, sh = room1('shelves'); assert.equal(fl.length, A.rungs.length);
    for (const [k, m] of fl.entries()){ const [x, y] = LV.moverAt(m, 0); assert.ok(Math.abs(x - (sh.tx0 + A.x + 0.5) * LV.T) < 1e-9 && Math.abs(y - (sh.ty0 + A.y + A.rungs[k]) * LV.T) < 1e-9, 'where it was left'); assert.deepEqual(LV.moverAt(m, 999), [x, y], 'and there it stays'); }
    assert.equal(LV.railSend('floor', 10), 1, 'sent: to the far end'); assert.equal(LV.railSend('floor', 10.5), null, 'while it rolls it cannot be sent again');
    let last = LV.moverAt(fl[0], 10)[0]; for (let t = 10; t <= 10 + A.secs; t += 1 / 60){ const x = LV.moverAt(fl[0], t)[0]; assert.ok(x >= last - 1e-9, 'one way'); assert.ok(x - last < 0.25, 'and no jump in it'); last = x; }
    assert.ok(Math.abs(LV.moverAt(fl[0], 10 + A.secs)[0] - (sh.tx0 + A.x + A.dx + 0.5) * LV.T) < 1e-9, 'to the other end of its rail'); assert.ok(Math.abs(LV.moverAt(fl[0], 10 + A.secs / 2)[0] - (sh.tx0 + A.x + A.dx / 2 + 0.5) * LV.T) < 1e-9, 'half-way at half its time');
    P.all = false; P.t = 10 + A.secs + 0.1; LV.moversNow(); assert.equal(LV.RULE.rail.floor.at, 1, 'it is there'); assert.equal(LV.RULE.rail.floor.t0, null); assert.equal(LV.railSend('floor', 50), 0, 'and can be sent back');
    LV.setGates({}, {}, [], { hung: 1 }); assert.equal(LV.RULE.rail.hung.at, 1, 'his save keeps where each one stands'); assert.equal(LV.RULE.rail.floor.at, 0); assert.ok(!LV.RULE.gates.has('hung'), 'a rail is no gate');
    assert.ok(CF.enemies.ladder.prop && CF.enemies.ladder.own && CF.enemies.winch.prop, 'a ladder and a winch are things, not creatures');
    const ev = [], c = { RULE: LV.RULE, events: ev, movers: LV.LEVEL.movers, moverAt: LV.moverAt, time: 0, E: { list: [], scene: null } }, e = { mk: { key: 'floor' }, struck: true, cool: 0, x: 0, y: 0, home: { x: 0, y: 0 }, d: CF.enemies.ladder };
    CF.ai.ladder(e, { x: 99, y: 99 }, 1 / 60, c); assert.deepEqual(ev.map(q => [q.type, q.key]), [['rail', 'floor']], 'struck, a ladder asks to be sent'); assert.ok(Math.abs(e.x - (sh.tx0 + A.x + 0.5) * LV.T) < 1e-9, 'and it is where its rungs are');
    ev.length = 0; CF.ai.winch({ mk: { key: 'crane' }, struck: true, cool: 0, x: 0, y: 0, d: CF.enemies.winch }, { x: 99, y: 99 }, 1 / 60, c); assert.deepEqual(ev.map(q => [q.type, q.key]), [['rail', 'crane']], 'and the winch sends the crane');
  } finally { P.all = all; P.t = t0; LV.setGates(); }
});

test('the ladders and the crane: each left where it is no use, and of use where it goes', () => {
  const sh = room1('shelves'), cu = room1('cull'), G = CF.GAL, at = (r, x, y) => L1.tiles[(r.ty0 + y) * L1.W + r.tx0 + x];
  assert.ok(G.east[0] - 2 >= 16, 'the first gallery is too far over the floor to be climbed to'); assert.ok(G.west[0] - G.east[0] >= 16, 'and the second over the first');
  for (const [key, to] of [['floor', G.east], ['hung', G.west]]){ const A = CF.LADDERS[key], top = A.y + A.rungs[A.rungs.length - 1], x1 = A.x + A.dx;
    const corn = G.cornice.find(c => A.x >= c[0] && A.x <= c[1]); assert.ok(corn, `${key}: a cornice over where it was left`); assert.ok(corn[2] - top <= 6 && corn[2] > top + 3, 'low over its top rung: he stands there, and cannot leap on');
    assert.ok(to[0] - top >= 3 && to[0] - top <= 6, `${key}: sent, its top rung is a step under the gallery`); const lip = key === 'floor' ? to[1] : to[2]; assert.ok(Math.abs(x1 - lip) <= 5, 'and beside its lip'); }
  const lass = L1.marks.find(m => m.type === 'ladder' && m.key === 'hung'); assert.ok(lass.y - sh.ty0 >= G.east[0], 'the second ladder hangs over the first gallery: it is not come to from the floor');
  // the Cull: the far landing ten rows over the near one; the winch on the floor, forty rows under the ladle it sends
  const C = CF.CULL, win = L1.marks.find(m => m.type === 'winch'), ladle = L1.marks.find(m => m.type === 'ladder' && m.key === 'crane');
  assert.ok(C.far - C.land >= 10); assert.ok(C.east[0] - C.west[1] >= 20, 'twenty tiles of pit between them'); assert.equal(win.y - cu.ty0, 4, 'the winch is on the pit\'s floor'); assert.ok(ladle.y - win.y >= 40, 'far under what it sends');
  assert.equal(ladle.x - cu.tx0, C.crane.x, 'the ladle is left at the far side'); assert.ok(C.crane.x + C.crane.dx - C.west[1] <= 5, 'and sent, it stands beside the near landing');
  for (let y = C.far; y <= C.far + 5; y++) for (const x of [C.east[0], C.east[0] + 1]) assert.equal(at(cu, x, y), LV.SHUTTER, 'the cell\'s door is a shutter: it drops while anything rings');
  assert.equal(L1.marks.filter(m => m.type === 'clapper' && in0(m, cu)).length, 2, 'two tongues in the ladle\'s way');
});

const ALL1 = R.graph(1, R.GIFTS), SHUT1 = R.graph(1, ['shut', ...R.GIFTS]);
test('the Cloister\'s far ends, played: the loft only by both ladders, the cell only by the crane, with every gift he has; and a way back', () => {
  const sh = room1('shelves'), cu = room1('cull'), G = CF.GAL, C = CF.CULL;
  for (const n of FAR1) assert.ok(R.reached(ALL1.seen, room1(n), ALL1.W), n + ' is come to');
  assert.ok(stood(ALL1, sh, G.east[1], G.east[0], G.east[2], G.east[0]) && stood(ALL1, sh, G.west[1], G.west[0], G.west[2], G.west[0]) && stood(ALL1, sh, G.far[1], G.far[0], G.far[2], G.far[0]), 'each gallery, and the far shelf with its chest');
  assert.ok(stood(ALL1, cu, C.east[0] + 2, C.far, C.east[1], C.far), 'the cell on the far landing, and its thread'); assert.ok(stood(ALL1, cu, 20, 4, 37, 4), 'the pit\'s floor, and the winch');
  // sending nothing, with the Seated's wind and all the rest: the shelves' floor and no gallery; the Cull's near side and its floor, and not the far landing
  assert.ok(stood(SHUT1, sh, 2, 2, 37, 2)); assert.ok(!stood(SHUT1, sh, G.east[1], G.east[0], G.east[2], G.east[0] + 8), 'the first gallery: not without the first ladder');
  assert.ok(!stood(SHUT1, sh, G.west[1], G.west[0], G.west[2], 66), 'nor anything over it'); assert.ok(!R.reached(SHUT1.seen, room1('bindery'), SHUT1.W), 'nor the loft');
  assert.ok(stood(SHUT1, cu, C.west[0], C.land, C.west[1], C.land) && stood(SHUT1, cu, 20, 4, 37, 4)); assert.ok(!stood(SHUT1, cu, C.east[0], C.far, C.east[1], C.far + 5), 'the far landing: not without the crane');
  const home = { shelves: room1('hall'), bindery: room1('hall'), cull: room1('slagruns') }, inRoom = (k, r) => { const i = k % ALL1.W, j = Math.floor(k / ALL1.W); return i >= r.tx0 && i < r.tx1 && j >= r.ty0 && j < r.ty1; };
  for (const n of FAR1){ const from = nodesIn(ALL1, room1(n)); assert.ok(from.length > 0); for (const k of from) assert.ok([...onward(ALL1, [k])].some(c => inRoom(c, home[n])), `${n}: from ${k % ALL1.W - room1(n).tx0},${Math.floor(k / ALL1.W) - room1(n).ty0} there is a way back`); }
});

// ---- the Spires (build 117): the Way Down past his cairn, the Crevasse past the Seated
const SF = await import('../src/side/regions/spiresfar.js'), MO = await import('../src/side/motor.js');
const L2 = { ...R.loadLevel(2) }, room2 = n => L2.rooms.find(r => r.name === n), FAR2 = ['waydown', 'lookback', 'crevasse', 'blueblack'];

test('the Spires: a column further west and one further east, eight screens', () => {
  const rs = FAR2.map(room2); assert.ok(rs.every(Boolean)); assert.ok(rs.every(r => r.far && r.wing));
  assert.equal(rs.reduce((n, r) => n + (r.tx1 - r.tx0) * (r.ty1 - r.ty0) / (ROOM.w * ROOM.h), 0), 8);
  const hc = room2('hiscairn'), se = room2('seated'), wd = room2('waydown'), lb = room2('lookback'), cr = room2('crevasse'), bb = room2('blueblack');
  assert.equal(wd.tx1, hc.tx0, 'the cleft is the column west of his cairn'); assert.equal(wd.tx0, 0, 'at the level\'s west edge'); assert.equal(wd.ty1, hc.ty1, 'from his cairn\'s height down'); assert.equal(lb.ty1, wd.ty0, 'the look-back under it');
  assert.equal(cr.tx0, se.tx1, 'the crevasse is the column east of the Seated\'s hall'); assert.equal(cr.tx1, L2.W, 'at the level\'s east edge'); assert.equal(cr.ty1, se.ty1, 'from his hall down'); assert.equal(bb.ty1, cr.ty0, 'its bottom under it');
  assert.ok([wd, lb].every(r => r.gate === 'glide' && r.title === 'THE WAY DOWN'), 'gated as the Cairns are'); assert.ok([cr, bb].every(r => r.gate === 'dash' && r.title === 'THE CREVASSE' && r.look === 'glacier'), 'and as the Galleries are');
  // the new column west is the mountain's rock but for these rooms: nothing is open beside the field or the reasons
  for (const n of ['field', 'reasons']){ const r = room2(n); for (let y = r.ty0; y < r.ty1; y++) for (let x = 0; x < r.tx0; x++) assert.equal(L2.tiles[y * L2.W + x], LV.ROCK, 'rock west of the ' + n); }
});

test('the Way Down: each ledge too far under the last to climb back, and no further than he drops unhurt; the wall at the bottom keeps a wind off all of it', () => {
  const D = SF.DOWN, wd = room2('waydown'), lb = room2('lookback'), safe = MO.SIDE.fallSafe / LV.T;
  const rows = D.ledges.map(l => l[0]); for (let k = 1; k < rows.length; k++){ const d = rows[k - 1] - rows[k]; assert.equal(d, D.drop); assert.ok(d > 14.5, 'more than he hauls himself up'); assert.ok(d <= safe, 'and no more than he drops unhurt'); assert.notEqual(D.ledges[k][1] < 20, D.ledges[k - 1][1] < 20, 'one side and the other'); }
  assert.equal(rows[rows.length - 1] - 4, 6, 'the last ledge is a step over the cleft\'s floor'); assert.equal(4 + ROOM.h - D.foot, D.drop, 'and the floor a drop over the look-back\'s');
  const wall = L2.marks.find(m => m.type === 'windbreak' && m.key === D.key), up = L2.updrafts.find(u => u.wall === D.key);
  assert.ok(wall && in0(wall, lb), 'the wall is at the bottom'); assert.ok(up, 'and its wind');
  assert.equal(up.y0 / LV.T, lb.ty0 + D.foot); assert.ok(up.y1 / LV.T >= wd.ty0 + rows[0] + 4, 'which rises the whole height of the cleft, past the ledge he came in on'); assert.ok(up.x0 / LV.T >= wd.tx0 + 13 && up.x1 / LV.T <= wd.tx0 + 27, 'in the open middle of it, between the ledges');
  for (let y = lb.ty0 + D.foot; y < wd.ty0 + rows[0] + 4; y++) for (let x = up.x0 / LV.T; x < up.x1 / LV.T; x++) assert.notEqual(L2.tiles[y * L2.W + x], LV.ROCK, 'nothing stands in the wind\'s way');
  R.loadLevel(2); LV.setGates(); const mid = [(up.x0 + up.x1) / 2, (wd.ty0 + 30) * LV.T];
  assert.equal(LV.updraftAt(...mid), null, 'dead air while the wall stands'); LV.setGates({}, {}, [D.key]); assert.ok(LV.updraftAt(...mid), 'and rising air when it is down'); LV.setGates();
  for (let y = D.foot + 2; y <= 17; y++) assert.equal(L2.tiles[(lb.ty0 + y) * L2.W + lb.tx0], LV.EMPTY, 'a window in the mountain\'s west face');
  assert.ok(L2.marks.some(m => m.type === 'thread' && in0(m, lb)), 'a thread at the look-back');
});

test('the Crevasse: one fire at its head, and what it melts is the plug in its floor, forty rows below; then a second fire, at the bottom', () => {
  const C = SF.CREV, cr = room2('crevasse'), bb = room2('blueblack');
  const fire = L2.marks.filter(m => m.type === 'brazier' && in0(m, cr)); assert.equal(fire.length, 1); assert.equal(fire[0].y - cr.ty0, C.land, 'on the landing he comes in on');
  const ice = []; for (let y = cr.ty0; y < cr.ty1; y++) for (let x = cr.tx0; x < cr.tx1; x++) if (L2.tiles[y * L2.W + x] === LV.MELT) ice.push([x, y]);
  assert.equal(ice.length, (C.plug[1] - C.plug[0] + 1) * 4, 'the only ice in it is the plug'); assert.ok(ice.every(([x, y]) => y - cr.ty0 <= 3 && x - cr.tx0 >= C.plug[0] && x - cr.tx0 <= C.plug[1]), 'in its floor');
  assert.ok(ice.every(([x, y]) => L2.meltOf.get(y * L2.W + x) === fire[0].x + ',' + fire[0].y), 'and it is that fire\'s'); assert.ok(fire[0].y - ice[0][1] >= 40, 'forty rows over it');
  R.loadLevel(2); const was = LV.RULE.litAll, lit = LV.RULE.lit; LV.RULE.litAll = false; LV.RULE.lit = new Set();
  try { const [x, y] = ice[0]; assert.equal(LV.tileAt(x, y), LV.ROCK, 'unlit: the plug is ice'); LV.RULE.lit.add(fire[0].x + ',' + fire[0].y); assert.equal(LV.tileAt(x, y), LV.EMPTY, 'lit: it is gone'); } finally { LV.RULE.litAll = was; LV.RULE.lit = lit; }
  for (let k = 1; k < C.sills.length; k++){ assert.ok(C.sills[k - 1][0] - C.sills[k][0] <= 7, 'the sills are no more than a leap apart'); assert.notEqual(C.sills[k][1], C.sills[k - 1][1], 'one side and the other'); }
  assert.ok(C.land - C.sills[0][0] <= 7 && C.sills[C.sills.length - 1][0] - 4 <= 7);
  const f2 = L2.marks.filter(m => m.type === 'brazier' && in0(m, bb)); assert.equal(f2.length, 1, 'a second fire at the bottom');
  assert.ok(L2.marks.some(m => m.type === 'sitter' && m.ice && in0(m, bb)), 'one who sat down there, in its ice'); const th = L2.marks.find(m => m.type === 'chest' && m.holds === 'thread' && in0(m, bb)); assert.ok(th); assert.equal(L2.tiles[th.y * L2.W + th.x], LV.MELT, 'and a thread in the same ice');
  assert.ok(ROOM.h + 4 - C.block <= MO.SIDE.fallSafe / LV.T, 'the drop through the plug is one he takes unhurt');
});

const ALL2 = R.graph(2, R.GIFTS), SHUT2 = R.graph(2, ['shut', ...R.GIFTS]);
test('the Spires\' far ends, played: down the cleft and no way back until the wall is down; down the crevasse and back', () => {
  for (const n of FAR2) assert.ok(R.reached(ALL2.seen, room2(n), ALL2.W), n + ' is come to');
  const hc = room2('hiscairn'), se = room2('seated'), lb = room2('lookback'), inRoom = (G, k, r) => { const i = k % G.W, j = Math.floor(k / G.W); return i >= r.tx0 && i < r.tx1 && j >= r.ty0 && j < r.ty1; };
  // the wall standing: he comes to the look-back all the same, and from it there is no way back to his cairn
  assert.ok(R.reached(SHUT2.seen, lb, SHUT2.W), 'the look-back, with the wall standing'); const from = nodesIn(SHUT2, lb); assert.ok(![...onward(SHUT2, from)].some(k => inRoom(SHUT2, k, hc)), 'and no way back up, until it is down');
  const home = { waydown: hc, lookback: hc, crevasse: se, blueblack: se };
  for (const n of FAR2){ const fr = nodesIn(ALL2, room2(n)); assert.ok(fr.length > 0); for (const k of fr) assert.ok([...onward(ALL2, [k])].some(c => inRoom(ALL2, c, home[n])), `${n}: from ${k % ALL2.W - room2(n).tx0},${Math.floor(k / ALL2.W) - room2(n).ty0} there is a way back`); }
  const th = L2.marks.find(m => m.type === 'thread' && in0(m, lb)); assert.ok([...ALL2.seen].some(k => Math.abs(k % ALL2.W - th.x) <= 1 && Math.floor(k / ALL2.W) === th.y), 'the thread at the look-back');
});

test('the game moves a save with its level wherever a level is made: as it starts, on going into a region, on walking into one', async () => {
  const src = (await import('node:fs')).readFileSync(new URL('../src/side/main.js', import.meta.url), 'utf8');
  assert.ok(/\nrebased\(\);[^\n]*\nsetup\(\);\n/.test(src), 'before the first level is set up (level.js makes that one itself)');
  assert.ok(/loadLevel\(n\); rebased\(\);/.test(src), 'in enter()'); assert.ok(/loadLevel\(J\.to\); rebased\(\);/.test(src), 'in cross()');
  assert.equal((src.match(/loadLevel\(/g) || []).length, 3, 'and there is no other place a level is loaded (two in enter, one in cross): a new one must move the save too');
});
