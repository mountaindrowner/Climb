// The Warden's floor at the top of each region: flat, clear of everything else, and the regions keep their height.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { F, FL, ZF, ZH, MAXK, BOSS_FLIGHT } from '../src/config/constants.js';
import { TUNE } from '../src/config/tuning.js';
import { riseOf, flightY, topAt, floorOf, floorSpan, hasFloor, floorFlights, HALLS, BRANCHES } from '../src/world/path.js';
import { layoutFlight } from '../src/world/layout.js';
import { setDecks, DECKS, HOLES, switchbackOf } from '../src/world/decks.js';

const floors = []; for (let z = 0; z * ZF + BOSS_FLIGHT < MAXK; z++) floors.push(z * ZF + BOSS_FLIGHT);

test('every region ends in a flat floor, and still climbs the same height', () => {
  assert.equal(floors.length, 7);
  for (const kB of floors){
    assert.ok(hasFloor(kB));
    assert.equal(riseOf(kB), 0, `floor ${kB} is flat`);
    const { s0, s1 } = floorSpan(kB), y = flightY(kB);
    for (let s = s0 + 0.01; s < s1; s += 0.2){ assert.ok(Math.abs(topAt(s) - y) < 1e-9, `level at ${s.toFixed(1)}`); assert.equal(floorOf(s), kB); }
    assert.ok(s1 - s0 >= 11, 'room for a fight: ' + (s1 - s0));
    assert.equal(floorOf(s0 - 0.5), -1); assert.equal(floorOf(s1 + 0.5), -1);
    const z = kB / ZF | 0; assert.ok(Math.abs(flightY((z + 1) * ZF) - flightY(z * ZF) - ZH) < 1e-9, `region ${z} keeps its height`);
  }
});

test('nothing else on the floor: no threats or gold, no ledges, no oath stone, no hall, no switchback coming up', () => {
  for (const kB of floors){
    const c = layoutFlight(7, kB);
    assert.equal(c.obs.length, 0, `threats on floor ${kB}`); assert.equal(c.gold.length, 0);
  }
  for (const seed of [1, 2, 3, 99]){
    setDecks(seed, false);
    for (const d of DECKS) assert.ok(!floors.some(kB => floorOf(d.s0) === kB || floorOf(d.s1) === kB), `ledge on a floor (seed ${seed})`);
    for (const h of HOLES) assert.ok(floorOf(h.s0) < 0 && floorOf(h.s1 - 0.01) < 0, `a hole in a floor (seed ${seed})`);
  }
  for (const b of BRANCHES){ const sw = switchbackOf(b.kA); if (sw) assert.ok(!floorFlights(Math.floor(sw.hole.s0 / FL)) && !hasFloor(Math.floor(sw.hole.s0 / FL) - 1), 'a switchback skips a Warden'); }
  for (const h of HALLS) assert.ok(!floorFlights(h.kH) && !floorFlights(h.kH + 1), 'a hall onto a floor');
});

test('the golem: every attack has an answer that fits in its time', () => {
  const T = TUNE.golem, M = TUNE.move, { s0, s1 } = floorSpan(floors[0]);
  // out from under a slam: from the middle of its shadow a man at a run clears it within the wind-up, in every region
  for (const ph of [0, 1]) assert.ok(T.slam.half / M.run < T.slam.wind[ph] * T.windMul(6), 'slam, phase ' + (ph + 1));
  // the slam's shadow and the sweeping hand leave room on the floor
  assert.ok(2 * T.slam.half < (s1 - s0) / 2);
  // under the sweep crouched, not standing: the hand's underside (about 1.4 below its middle) clears a crouched crown (1.05)
  // and not a standing one (2.45)
  assert.ok(T.sweep.h - 1.4 > 1.05 + 0.2 && T.sweep.h - 1.4 < 2.45);
  // a shockwave is lower than a jump, and crosses the floor in under two seconds
  assert.ok(T.wave.height < M.jumpHeight * 0.6 && (s1 - s0) / T.wave.speed < 2);
  // the head, when it comes down, is in reach of most of the floor; he reels for long enough to get to it
  assert.ok(T.reel.reach * 2 > (s1 - s0) * 0.6 && T.reel.hold[1] > (s1 - s0) / 2 / M.run + 1);
  for (let z = 0; z < 7; z++) assert.ok(T.hp(z) > T.poise(z) * 2);
});
