import { test } from 'node:test';
import assert from 'node:assert/strict';
import { F, FL, FH, ZF, ZONE_METERS, MPU, R, MAXK } from '../src/config/constants.js';
import { ZONES } from '../src/config/zones.js';
import { posOf, topAt, landingS, zoneOf, special, meters, bossFlight, arenaOf } from '../src/world/path.js';

test('a zone is 15 flights and measures ZONE_METERS in game metres', () => {
  assert.equal(meters(ZF * FH), ZONE_METERS);
  assert.equal(MAXK, ZONES.length * ZF);
});
test('height never decreases along the path', () => {
  let last = -1;
  for (let s = 0; s < 5 * FL; s += 0.01){ const y = posOf(s).y; assert.ok(y >= last - 1e-9, `dropped at s=${s}`); last = y; }
});
test('the foot never sinks below the step surface', () => {
  for (let s = 0; s < 3 * FL; s += 0.013){ assert.ok(posOf(s).y <= topAt(s) + 1e-9, `above step at s=${s}`); }
});
test('a landing sits at the top of its flight', () => {
  for (let k = 0; k < 5; k++){ const p = posOf(landingS(k)); assert.ok(p.land); assert.equal(p.k, k); assert.ok(Math.abs(p.y - (k + 1) * FH) < 1e-9); }
});
test('every zone has a lift, a rest stop and a Warden at fixed flights', () => {
  for (let z = 0; z < ZONES.length; z++){
    assert.equal(special(z * ZF + 5), 'lift');
    assert.equal(special(z * ZF + 8), 'camp');
    assert.equal(special(bossFlight(z)), 'boss');
    assert.equal(zoneOf(bossFlight(z)), z);
    assert.equal(arenaOf(z * ZF + 9), -1);
    for (let l = 10; l <= 14; l++) assert.equal(arenaOf(z * ZF + l), bossFlight(z));
    assert.equal(arenaOf(z * ZF + 15), z + 1 < ZONES.length ? -1 : -1);
  }
  assert.equal(zoneOf(MAXK + 50), ZONES.length - 1);
});
test('one full turn of the spiral is about seven flights', () => {
  const turnSteps = 2 * Math.PI * R;
  assert.ok(turnSteps / FL > 6.5 && turnSteps / FL < 7.5, 'about 7 flights per turn (the widened landscape shaft)');
});
test('zone names avoid borrowed terms', () => {
  for (const z of ZONES) assert.ok(!/endless stair|moria|balrog|durin|gandalf/i.test(z.name + z.boss), z.name);
});
