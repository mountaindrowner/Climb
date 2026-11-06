import { test } from 'node:test';
import assert from 'node:assert/strict';
import { F, FL, FH, ZF, ZH, ZONE_METERS, MPU, R, MAXK, GRADE, MAX_RISE } from '../src/config/constants.js';
import { ZONES } from '../src/config/zones.js';
import { posOf, topAt, landingS, landingY, flightY, riseOf, kAtY, zoneOf, special, meters, bossFlight, arenaOf } from '../src/world/path.js';
import { layoutFlight, suits } from '../src/world/layout.js';

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
  for (let k = 0; k < 5; k++){ const p = posOf(landingS(k)); assert.ok(p.land); assert.equal(p.k, k); assert.ok(Math.abs(p.y - landingY(k)) < 1e-9); }
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

test('variable grade: gentle on the whole, steep and flat in places, every zone the same height', () => {
  const rises = GRADE, gentle = rises.filter(r => r > 0 && r <= 0.45).length;
  assert.ok(gentle > rises.length / 2, 'most flights are gentle');
  assert.ok(rises.includes(0) && MAX_RISE >= 0.7, 'flat galleries and steep flights');
  for (let z = 0; z < 7; z++) assert.ok(Math.abs(flightY((z + 1) * ZF) - flightY(z * ZF) - ZH) < 1e-9, `zone ${z} height`);
  assert.equal(meters(ZH), ZONE_METERS);
});
test('heights are continuous: each flight starts where the last landing ended, and kAtY inverts flightY', () => {
  for (let k = 0; k < MAXK; k++){
    assert.ok(Math.abs(posOf(k * FL).y - flightY(k)) < 1e-9, `flight ${k} start`);
    assert.ok(Math.abs(topAt(k * FL + F - 0.01) - landingY(k)) < 1e-9, `flight ${k} last step`);
    assert.equal(kAtY(flightY(k) + 1e-6), riseOf(k) === 0 && k > 0 ? kAtY(flightY(k) + 1e-6) : k);
  }
});
test('broken steps and swings only on flights gentle enough for them', () => {
  for (let seed = 1; seed < 6; seed++) for (let k = 0; k < MAXK; k++)
    for (const o of layoutFlight(seed, k).obs) assert.ok(suits(o.type, k), `${o.type} on flight ${k} (rise ${riseOf(k)})`);
});
