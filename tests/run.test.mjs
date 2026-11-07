import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MARKS, BLUEPRINTS, OATHS, UPGRADES, WELL, MARK_SLOTS, edgeMul, knellSpeed } from '../src/config/run.js';
import { S, fresh } from '../src/save/store.js';
import { migrate, SAVE_VERSION } from '../src/save/migrations.js';
import { knownMarks, offeredMarks, offeredOaths } from '../src/run/picks.js';

test('the run layer is well formed: blueprints are the marks not known from the start, every price is set', () => {
  assert.ok(Object.values(MARKS).filter(m => m.start).length >= 3, 'some marks are known from the first climb');
  for (const id of BLUEPRINTS){ assert.ok(!MARKS[id].start); assert.ok(MARKS[id].cost > 0, `${id} has a price`); }
  for (const U of Object.values(UPGRADES)) assert.ok(U.costs.length && U.costs.every((c, i) => c > 0 && (!i || c > U.costs[i - 1])), U.name + ' costs rise');
  assert.equal(Object.keys(OATHS).length, 3);
  for (const t of ['crawler', 'flitter', 'burrower', 'spitter']) assert.ok(WELL.kill[t] > 0, t + ' frees wellstone');
  assert.ok(edgeMul(2) > edgeMul(1) && knellSpeed(1) > 1);
  assert.equal(MARK_SLOTS, 3);
});
test('an old save gains an empty run layer', () => {
  const old = migrate({ version: 2, best: 40, lifts: [5], bosses: [], falls: 3, gold: 9, stash: 0, weapon: 'sword', seen: ['gap'] });
  assert.equal(old.version, SAVE_VERSION);
  const s = Object.assign(fresh(), old);
  assert.equal(s.well, 0); assert.deepEqual(s.found, []); assert.deepEqual(s.unlocked, []); assert.deepEqual(s.runes, []);
  assert.deepEqual(s.upgrades, { flask: 0, mail: 0, credit: 0 }); assert.equal(s.best, 40);
});
test('Fetch offers three known marks you do not carry, the same each visit; buying a blueprint adds it to the offers', () => {
  Object.assign(S, fresh());
  const G = { marks: [] };
  const a = offeredMarks(123456789, 8, G), b = offeredMarks(123456789, 8, G);
  assert.deepEqual(a, b); assert.equal(a.length, 3); assert.equal(new Set(a).size, 3);
  for (const id of a) assert.ok(knownMarks().includes(id));
  G.marks.push(a[0]); assert.ok(!offeredMarks(123456789, 8, G).includes(a[0]), 'not what he already carries');
  assert.ok(!knownMarks().includes('vigil')); S.unlocked.push('vigil'); assert.ok(knownMarks().includes('vigil'));
  const seen = new Set(); for (let k = 0; k < 60; k++) for (const id of offeredMarks(k * 7919, k, { marks: [] })) seen.add(id);
  assert.ok(seen.has('vigil'), 'a bought blueprint turns up in the offers');
  Object.assign(S, fresh());
});
test('each oath stone carries two different oaths, and all three turn up', () => {
  const seen = new Set();
  for (let k = 0; k < 40; k++){ const o = offeredOaths(987654321, k); assert.equal(o.length, 2); assert.notEqual(o[0], o[1]); o.forEach(x => seen.add(x)); }
  assert.equal(seen.size, 3);
});
