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
test('every fork: the spur leaves its fork landing; the high road rejoins the main stair at a landing above, at the same height and angle', async () => {
  const P = await import('../src/world/path.js');
  assert.ok(P.BRANCHES.length >= 5 && P.SPURS.length === P.BRANCHES.length, 'a fork in most zones');
  const ang = (x, y) => Math.abs(Math.atan2(Math.sin(x - y), Math.cos(x - y)));
  for (const b of P.BRANCHES){
    const sp = b.spur, A = P.posOf(P.landingS(b.kA)), B = P.posOf(P.landingS(b.kB));
    const s0 = P.posOf(sp.s0), end = P.posOf(b.s0 + b.len);
    assert.ok(Math.abs(s0.y - (A.y + sp.rise)) < 1e-6 && ang(s0.a, A.a) < 1e-6, `spur ${b.j} starts on its fork landing`);
    assert.ok(Math.abs(end.y - B.y) < 1e-6 && ang(end.a, B.a) < 1e-6, `high road ${b.j} ends at the landing it rejoins`);
    assert.ok(b.rise > 0 && b.rise <= P.BRANCH_MAX_RISE, `high road ${b.j} rise ${b.rise.toFixed(2)} is climbable`);
    assert.ok(Math.abs(b.yA - (sp.topY + P.SPUR.lip)) < 1e-6, 'the high road\'s foot is above the spur\'s broken end');
    assert.ok(P.posOf(b.s0).a > sp.tipA, 'and beyond it');
    assert.equal(P.routeSign(sp.s0 + 1), 1); assert.equal(P.routeSign(b.s0 + 1), -1);
    for (let u = 0.1; u < b.len; u += 0.5) assert.ok(P.topAt(b.s0 + u) >= P.posOf(b.s0 + u).y - 1e-6, 'never below its own steps');
    assert.ok(Math.abs(P.sAt(b.s0 + 5, P.posOf(b.s0 + 6).a) - (b.s0 + 6)) < 1e-6, 'sAt finds positions along the high road');
    assert.ok(Math.abs(P.sAt(sp.s0 + 2, P.posOf(sp.s0 + 3).a) - (sp.s0 + 3)) < 1e-6, 'and along the spur');
    assert.ok(P.spurHole(sp, sp.len + 0.5), 'past the spur\'s end is the void');
  }
});
test('the leap: a running jump off the spur\'s top step reaches the high road\'s foot; the collapse never catches a runner', async () => {
  const P = await import('../src/world/path.js'), { TUNE } = await import('../src/config/tuning.js');
  const M = TUNE.move, S = P.SPUR, vy0 = Math.sqrt(2 * M.gravityUp * M.jumpHeight);
  // jump from the middle of the top step at full run: is there a moment over the landing window high enough?
  let ok = false;
  for (let t = 0; t < 1.2 && !ok; t += 0.005){
    const x = M.run * t - 0.5, up = Math.min(t, vy0 / M.gravityUp), y = vy0 * up - 0.5 * M.gravityUp * up * up - (t > up ? 0.5 * M.gravityDown * (t - up) ** 2 : 0);
    if (x > S.gapFrom && x < S.gapTo && y >= S.lip - 0.45) ok = true;
  }
  assert.ok(ok, 'the leap can be made');
  assert.ok(S.lip > 0.6, 'the foot is above the spur\'s end: it takes a jump');
  const COLLAPSE = S.collapse;
  assert.ok(COLLAPSE.speed < M.run * 0.9 && COLLAPSE.delay > 0.3, 'a runner stays ahead of the collapse');
});

