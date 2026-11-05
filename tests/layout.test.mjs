import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FL, ZF, MAXK } from '../src/config/constants.js';
import { layoutFlight } from '../src/world/layout.js';
import { TUTORIAL } from '../src/zones/tutorial.js';
import { ENTITY_TYPES } from './helpers.mjs';
import { PRACTICE_FLIGHTS } from '../src/world/layout.js';
import { CATALOG } from '../src/entities/catalog.js';
import { ZONES } from '../src/zones/index.js';

test('layout is deterministic for a seed', () => {
  for (let k = 0; k < 40; k++){
    const a = layoutFlight(12345, k), b = layoutFlight(12345, k);
    assert.deepEqual(JSON.stringify(a.obs), JSON.stringify(b.obs));
    assert.deepEqual([...a.gaps], [...b.gaps]);
  }
});
test('different seeds give different climbs', () => {
  let same = 0;
  for (let k = 5; k < 45; k++) if (JSON.stringify(layoutFlight(1, k).obs) === JSON.stringify(layoutFlight(2, k).obs)) same++;
  assert.ok(same < 20, `${same} of 40 flights identical across seeds`);
});
test('the tutorial flights carry exactly their one threat and a hint', () => {
  for (let k = 1; k < TUTORIAL.length; k++){
    const c = layoutFlight(7, k);
    assert.equal(c.obs.length, 1); assert.equal(c.obs[0].type, TUTORIAL[k].type); assert.ok(c.obs[0].hint);
  }
  assert.equal(layoutFlight(7, 0).obs.length, 0);
});
test('every threat is a registered entity type and sits inside its flight', () => {
  for (let k = 0; k < MAXK; k++) for (const o of layoutFlight(99, k).obs){
    assert.ok(ENTITY_TYPES.includes(o.type), o.type);
    assert.ok(o.s >= k * FL && o.s < (k + 1) * FL, `flight ${k} threat at ${o.s}`);
  }
});
test('gold never sits on a broken step', () => {
  for (let k = 0; k < MAXK; k++){
    const c = layoutFlight(3, k);
    for (const g of c.gold) assert.ok(!c.gaps.has(Math.floor(g.s - k * FL)));
  }
});
test("with the Wardens on, their stretch holds no other threats", () => {
  for (let z = 0; z < MAXK / ZF; z++) for (let l = 10; l <= 14; l++){ const c = layoutFlight(5, z * ZF + l, { wardens: true }); assert.equal(c.obs.length, 0, `zone ${z} flight ${l}`); }
  assert.equal(layoutFlight(5, 14).sp, 'boss');
});
test('with the Wardens parked, their stretch is ordinary climbing', () => {
  let n = 0;
  for (let z = 0; z < MAXK / ZF; z++) for (let l = 10; l <= 14; l++) n += layoutFlight(5, z * ZF + l, { wardens: false }).obs.length;
  assert.ok(n > 40, `${n} threats across the seven stretches`);
});
test('a practice run holds only its threat, on flights 1 to 9 and never on the rest stop', () => {
  for (const t of CATALOG){
    let seen = 0;
    for (let k = 0; k < 20; k++){
      const c = layoutFlight(11, k, { only: t.id });
      for (const o of c.obs) assert.equal(o.type, t.id);
      if (k === 0 || k > PRACTICE_FLIGHTS || c.sp === 'camp') assert.equal(c.obs.length, 0, `${t.id} flight ${k}`);
      seen += c.obs.length;
    }
    assert.ok(seen >= 8, `${t.id}: ${seen}`);
  }
});
test('every zone draws from catalogued threats only', () => {
  for (const z of ZONES) for (const ty of z.threats) assert.ok(CATALOG.some(t => t.id === ty), `${z.id}: ${ty}`);
});
