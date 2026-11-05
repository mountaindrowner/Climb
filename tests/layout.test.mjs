import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FL, ZF, MAXK } from '../src/config/constants.js';
import { layoutFlight } from '../src/world/layout.js';
import { TUTORIAL } from '../src/zones/tutorial.js';
import { ENTITY_TYPES } from './helpers.mjs';

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
test("the Warden's stretch holds no other threats", () => {
  for (let z = 0; z < MAXK / ZF; z++) for (let l = 10; l <= 14; l++){ const c = layoutFlight(5, z * ZF + l); assert.equal(c.obs.length, 0, `zone ${z} flight ${l}`); }
  assert.equal(layoutFlight(5, 14).sp, 'boss');
});
