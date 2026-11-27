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
