import { test } from 'node:test';
import assert from 'node:assert/strict';
import { migrate, SAVE_VERSION } from '../src/save/migrations.js';

test('a prototype save without a version migrates to the current shape', () => {
  const old = { best: 212, lifts: [6], bosses: [14], falls: 3, gold: 12, stash: 40, weapon: 'pick' };
  const now = migrate(old);
  assert.equal(now.version, SAVE_VERSION);
  assert.equal(now.best, 212); assert.deepEqual(now.lifts, [6]); assert.deepEqual(now.bosses, [14]); assert.equal(now.weapon, 'pick');
});
test('a current save passes through untouched', () => {
  const cur = { version: SAVE_VERSION, best: 1, lifts: [], bosses: [], falls: 0, gold: 0, stash: 0, weapon: 'sword' };
  assert.deepEqual(migrate(cur), cur);
});
