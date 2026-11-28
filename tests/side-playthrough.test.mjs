// The whole game in order, from a new save (phase 20 item 10; decided 28 Nov, decision 0.37): each region as he meets
// it, with only what he has by then. The five regions of the climb, each from where he comes in to its keeper, and its
// keeper's gift; the throw at the door of the last; the Deep climbed from the bottom (tests/side-throw: the long way out,
// played join by join); the last region, to its keeper, without the grip; and the Shard, with it.
//   The regions' own checks (side-level, side-physics) play each with what it says he arrives with. This one checks that
// those agree with each other: that what each region asks for, he has been given by the time he comes to it.
import test from 'node:test';
import assert from 'node:assert/strict';

await import('./helpers/browser.mjs');
const LV = await import('../src/side/level.js'), ST = await import('../src/side/state.js'), R = await import('./helpers/reach.mjs');
const TOP = LV.CLIMB_TOP, DEEP = LV.REGION_DATA.map((r, n) => r.deep ? n : -1).filter(n => n >= 0);
// the order he meets them: the climb up to the last region's door; thrown to the bottom; the Deep from the bottom up; the last region
const ORDER = [...Array(TOP).keys(), ...DEEP.slice().sort((a, b) => (LV.REGION_DATA[a].depth || [0, 0])[1] - (LV.REGION_DATA[b].depth || [0, 0])[1]), TOP];
// what a region's keeper gives that opens ways: the climb's by state.js ARRIVES (the region he has it from), the Deep's by TEACH
const GIVES = n => Object.keys(ST.ARRIVES).filter(c => ST.ARRIVES[c] === n + 1);

test('the order: the climb to the last door, the Deep from the bottom up, then the last region', () => {
  assert.deepEqual(ORDER.slice(0, TOP), [0, 1, 2, 3, 4]); assert.equal(ORDER[TOP], LV.REGION_DATA.findIndex(r => r.name === 'The Hollow'), 'thrown to the bottom: the Hollow first');
  assert.equal(ORDER[ORDER.length - 2], LV.REGION_DATA.findIndex(r => r.name === 'The Workings'), 'the Workings last of the Deep: it is under the Roots');
  assert.equal(ORDER[ORDER.length - 1], TOP); assert.equal(new Set(ORDER).size, LV.LEVELS.length, 'every region, once');
});

test('what each region asks of him he has by the time he comes to it', () => {
  const have = new Set();
  for (const n of ORDER){ for (const c of R.arrival(n)) assert.ok(have.has(c), `${LV.LEVELS[n].name} asks for ${R.giftName(c)}, which he has not been given yet`); for (const c of GIVES(n)) have.add(c); }
  assert.ok(!have.has('grip'), 'the grip is no keeper\'s of the climb: it is the Auger\'s, off the long way');
  assert.ok(!R.arrival(TOP).includes('grip'), 'the last region does not ask for the grip');
});

for (const n of [...Array(TOP + 1).keys()]) test(`${LV.LEVELS[n].name}, as he comes to it (${n < TOP ? 'climbing' : 'after the Deep'}): from where he comes in, its keeper; and on`, () => {
  const has = []; for (const m of ORDER.slice(0, ORDER.indexOf(n))) has.push(...GIVES(m));
  const G = R.graph(n, has), W = G.W, goal = R.goalOf(G.marks), near = R.nearGoal(goal);
  assert.ok([...G.seen].some(k => near(k % W, Math.floor(k / W))), `with ${has.map(R.giftName).join(', ') || 'nothing'}: to its keeper`);
  if (n < TOP){ const up = G.marks.find(m => m.type === 'exit') || G.marks.find(m => m.type === 'pass' && !(LV.REGION_DATA[m.to] || {}).deep);
    const open = R.graph(n, [...has, ...GIVES(n), 'fallen']), seen = [...open.seen]; assert.ok(up, 'a way up out of it');
    assert.ok(seen.some(k => Math.abs(k % W - up.x) <= 6 && Math.abs(Math.floor(k / W) - up.y) <= 4), 'and its keeper fallen: on up'); }
});

test('the Shard, last: with the grip, and not without it', () => {
  const has = []; for (const m of ORDER.slice(0, -1)) has.push(...GIVES(m));
  const shard = G => G.rooms.find(r => r.name === 'shard'), into = (G, r) => R.reached(G.seen, r, G.W);
  const without = R.graph(TOP, [...has, 'fallen']), withit = R.graph(TOP, [...has, 'grip', 'fallen']);
  assert.ok(!into(without, shard(without)), 'without the grip he sees it and cannot reach it'); assert.ok(into(withit, shard(withit)), 'with the Auger\'s grip, the Shard');
});
