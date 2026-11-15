// The knots (docs/side.md, Scarf knots): a relic works only while it is tied into his scarf; there are two knots to start
// and Ordric ties more, to five; an old save wears what it carried, as far as the knots go.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { G, has, owns, wear, knots, KNOTS, loadSave, RELICS } from '../src/side/state.js';

const fresh = relics => { loadSave(); G.relics = [...relics]; G.worn = []; G.knots = 0; };

test('a relic carried but not tied does nothing', () => {
  fresh(['whetstone']); assert.ok(owns('whetstone')); assert.ok(!has('whetstone'));
  assert.ok(wear('whetstone', true)); assert.ok(has('whetstone'));
  assert.ok(wear('whetstone', false)); assert.ok(!has('whetstone'));
});
test('no more tied than there are knots; untie one to tie another', () => {
  fresh(['whetstone', 'lodestone', 'stylus']); assert.equal(knots(), KNOTS.base);
  assert.ok(wear('whetstone')); assert.ok(wear('lodestone')); assert.equal(wear('stylus'), false, 'every knot is tied');
  assert.ok(wear('whetstone', false)); assert.ok(wear('stylus')); assert.deepEqual(G.worn, ['lodestone', 'stylus']);
});
test('he cannot tie what he does not carry', () => { fresh([]); assert.equal(wear('whetstone', true), false); assert.ok(!has('whetstone')); });
test('Ordric ties knots up to the most, at a price each', () => {
  fresh([]); for (let k = 0; k < 9; k++) G.knots = k; G.knots = 99; assert.equal(knots(), KNOTS.most);
  assert.equal(KNOTS.cost.length, KNOTS.most - KNOTS.base, 'a price for each knot he can tie');
  assert.ok(Object.keys(RELICS).length > KNOTS.most, 'more relics than knots: there is always a choice');
});
test('an old save (before the knots) wears what it carried, and keeps a knot for each', () => {
  const store = {}; globalThis.localStorage = { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = v; }, removeItem: k => { delete store[k]; } };
  store['climb-side'] = JSON.stringify({ seamed: 1, relics: ['whetstone', 'lodestone', 'featherfall'], beat: [1] });
  loadSave(); assert.deepEqual(G.relics, ['whetstone', 'lodestone', 'featherfall']);
  assert.equal(knots(), 3, 'a knot for every relic he had'); assert.deepEqual(G.worn, ['whetstone', 'lodestone', 'featherfall']);
  store['climb-side'] = JSON.stringify({ relics: Object.keys(RELICS) }); loadSave();
  assert.equal(knots(), KNOTS.most); assert.equal(G.worn.length, KNOTS.most, 'as many worn as there are knots');
  store['climb-side'] = JSON.stringify({ seamed: 1, relics: ['whetstone'], worn: [] }); loadSave(); assert.ok(!has('whetstone'), 'a save with knots is left as it was');
  delete globalThis.localStorage;
});
