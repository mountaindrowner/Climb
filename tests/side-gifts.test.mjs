// Who gives what (docs/gifts-sheet.md, approved 22 Nov 2026; decisions 0.13 and 0.22): abilities from the wings'
// keepers, weapons from the regions'. Build 87 is the first of it: the air dash is the Cracked Bell's, in a prize chest
// that opens when the Bell has fallen, and the way up into the Spires asks for it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './helpers/browser.mjs';
const R = await import('./helpers/reach.mjs');
const ST = await import('../src/side/state.js');
const TE = await import('../src/side/teach.js');
const room = (L, n) => L.rooms.find(r => r.name === n);
test('the air dash is an ability with its picture and its words, and it is no keeper\'s; the Toll leaves a heart until its weapon is made', () => {
  const A = ST.ABILITY.dash; assert.ok(A && A.can === 'dash' && A.name && A.does && A.how.length); assert.ok(TE.ICONS[A.icon]);
  assert.ok(!ST.TEACH.some(t => t.can === 'dash'), 'no keeper leaves it'); assert.equal(ST.TEACH[1].heart, 1); assert.ok(ST.TEACH[1].name);
  assert.deepEqual(Object.keys(ST.ARRIVES), ['breaker', 'dash', 'glide']); assert.deepEqual(R.arrival(2), ['breaker', 'dash']); assert.deepEqual(R.arrival(1), ['breaker']);
  for (const l of [A.does, ...A.how, ...(A.more || [])]) assert.ok(l.length <= 110, l);
});
test('the Bell-Foundry is reached with the hammer alone; its prize, the air dash, is past the grate that lifts when the Bell falls', () => {
  const a = R.graph(1, ['breaker']), L = { ...R.LEVEL }; assert.ok(R.reached(a.seen, room(L, 'pit'), a.W), 'the pit, with the hammer'); assert.ok(!R.reached(a.seen, room(L, 'bellrope'), a.W), 'the bell-rope is shut while the Bell stands');
  const b = R.graph(1, ['breaker', 'still']), br = room(L, 'bellrope'); assert.ok(R.reached(b.seen, br, b.W), 'and open once it has fallen');
  const prize = L.marks.filter(m => m.type === 'chest' && /^gift:/.test(m.holds || '')); assert.equal(prize.length, 1); const m = prize[0];
  assert.equal(m.holds, 'gift:dash'); assert.equal(m.prize, 'still', 'it opens when the wing is still'); assert.ok(m.x >= br.tx0 && m.x < br.tx1 && m.y >= br.ty0 && m.y < br.ty1, 'in the bell-rope room');
  let near = false; for (const k of b.seen){ const i = k % b.W, j = (k - i) / b.W; if (Math.abs(i - m.x) < 3 && Math.abs(j - m.y) < 2){ near = true; break; } } assert.ok(near, 'he can stand at it');
  const none = R.graph(1, []); assert.ok(!R.reached(none.seen, room(L, 'pit'), none.W), 'not without the hammer');
});
test('the way up into the Spires asks for it: without the dash he is stopped at the mouth; with it he goes on', () => {
  const a = R.graph(2, ['breaker']), L = { ...R.LEVEL }; assert.equal(room(L, 'mouth').asks, 'dash');
  for (const n of ['gate', 'road', 'mouth']) assert.ok(R.reached(a.seen, room(L, n), a.W), n + ' without it');
  for (const n of ['saddle', 'spire', 'icecave', 'crown', 'shelter']) assert.ok(!R.reached(a.seen, room(L, n), a.W), n + ' is past the ice');
  const b = R.graph(2, ['breaker', 'dash']); for (const n of ['saddle', 'spire', 'icecave', 'crown', 'shelter']) assert.ok(R.reached(b.seen, room(L, n), b.W), n + ' with it');
  assert.ok(L.marks.some(m => m.type === 'pool' && m.y < room(L, 'mouth').ty0), 'a pool before the ice: he is not stranded');
});
test('a save from before keeps what it had; a new one has nothing until it is given', () => {
  const load = s => { globalThis.localStorage.getItem = k => k === 'climb-side' ? JSON.stringify(s) : null; const G = ST.loadSave(); globalThis.localStorage.getItem = () => null; return JSON.parse(JSON.stringify(G)); };
  assert.deepEqual(load({ level: 1, top: 1, beat: [true] }).can, {}, 'the Warden only: no dash');
  assert.deepEqual(load({ level: 1, top: 1, beat: [true, true] }).can, { dash: 1 }, 'the Toll had fallen: he keeps the dash it gave');
  assert.deepEqual(load({ level: 3, top: 3, beat: [true, true, true] }).can, { dash: 1, glide: 1 });
  assert.deepEqual(load({ level: 2, top: 2, beat: [true] }).can, { dash: 1 }, 'above the Cloister: he had it');
  assert.deepEqual(load({ level: 2, top: 2, beat: [true, true], can: {} }).can, {}, 'a save of this build is left as it is');
  ST.fresh(); assert.deepEqual(ST.G.can, {});
});
