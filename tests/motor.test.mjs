import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TUNE } from '../src/config/tuning.js';
import { FL } from '../src/config/constants.js';
import { MAX_RISE_FOR } from '../src/world/layout.js';
const MV = TUNE.move;

test('a full jump clears a broken step going uphill', () => {
  // time in the air from a full jump, falling back to a stair that has risen under it
  const v0 = Math.sqrt(2 * MV.gravityUp * MV.jumpHeight), up = v0 / MV.gravityUp;
  const fall = Math.sqrt(2 * (MV.jumpHeight - MAX_RISE_FOR.gap * 2) / MV.gravityDown);   // the steepest flight a broken step may be on
  // the hole is 0.6 wide (a step less its standable lips); taking off from one lip and landing past the other needs ~1.2
  assert.ok(MV.run * (up + fall) > 1.4, `covers ${(MV.run * (up + fall)).toFixed(2)} units`);
});
test('the quickest tap still hops high enough to clear a set of jaws', () => {
  const v0 = Math.sqrt(2 * MV.gravityUp * MV.jumpHeight);
  const h = v0 * MV.minHop - 0.5 * MV.gravityUp * MV.minHop * MV.minHop;
  assert.ok(h > 0.7, `min hop rises ${h.toFixed(2)} before it can be cut`);
});
test('starting takes a step or two; stopping and turning are near instant', () => {
  assert.ok(MV.run / MV.accel > 0.12 && MV.run / MV.accel < 0.3, `top speed in ${(MV.run / MV.accel).toFixed(2)} s`);
  assert.ok(MV.run / MV.decel < 0.08);
});
test('the roll is invulnerable for most of its length and has a cooldown', () => {
  const R = MV.roll;
  assert.ok(R.iframeTo - R.iframeFrom >= R.time * 0.6); assert.ok(R.cooldown > 0);
  assert.ok(R.speed * R.time > 1.8, 'a roll carries under a beam');
});
