// The phone's buzz (phase 20; docs/phase20-sheet.md): on a phone with no pad, the blows and the big moments run the
// phone's motor (navigator.vibrate, Android), shorter for a lighter one, under the same option as a pad's rumble.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

await import('./helpers/browser.mjs');
const V = await import('../src/side/vibrate.js'), { DEVICE } = await import('../src/core/prompts.js');
const main = readFileSync(new URL('../src/side/main.js', import.meta.url), 'utf8');
// a phone: what it was asked to buzz, and whether it does (a browser says no before the first touch)
function phone({ vibrate = true, pads = [], says = true } = {}){
  const asked = [], nav = { maxTouchPoints: 5, userAgent: 'phone', getGamepads: () => pads };
  if (vibrate) nav.vibrate = ms => { asked.push(ms); return says; };
  Object.defineProperty(globalThis, 'navigator', { value: nav, configurable: true });
  DEVICE.kind = 'touch'; V.VIBE.until = 0; return asked;
}

test('a blow on a phone: a short buzz for a light one, a long one for a heavy one, within bounds', () => {
  const asked = phone(); let t = 0;
  assert.equal(V.vibrate(0.15, 0.3, 50, t += 1000), 15, 'a hit that lands: a tap');
  assert.equal(V.vibrate(0.7, 0.5, 200, t += 1000), 140, 'one taken');
  assert.equal(V.vibrate(1, 1, 450, t += 1000), 400, 'his fall: as long as a buzz is let be');
  assert.equal(V.vibrate(0.05, 0.05, 40, t += 1000), V.VIBE.min, 'never so short the motor cannot start');
  assert.deepEqual(asked, [15, 140, 400, V.VIBE.min]);
  // the strengths the game uses are all inside the bounds
  for (const [s, w, ms] of [[0.15, 0.3, 50], [0.35, 0.5, 90], [0.3, 0.7, 110], [0.55, 0.45, 150], [0.8, 0.5, 260], [1, 0.9, 700]]){ const d = V.vibeMs(s, w, ms); assert.ok(d >= V.VIBE.min && d <= V.VIBE.most); }
});

test('a light buzz does not cut short a long one still going; after it, it does', () => {
  const asked = phone();
  assert.equal(V.vibrate(1, 1, 450, 1000), 400);
  assert.equal(V.vibrate(0.15, 0.3, 50, 1100), 0, 'the death buzz runs on');
  assert.equal(V.vibrate(1, 1, 450, 1200), 400, 'a longer one may take over');
  assert.equal(V.vibrate(0.15, 0.3, 50, 1700), 15, 'once it is over, the next is made');
  assert.deepEqual(asked, [400, 400, 15]);
});

test('no buzz from the phone: played with keys, a pad in the hands, an iPhone, or a browser that says no', () => {
  let asked = phone(); DEVICE.kind = 'keys'; assert.equal(V.vibrate(1, 1, 300, 1000), 0); DEVICE.kind = 'xbox'; assert.equal(V.vibrate(1, 1, 300, 2000), 0); assert.deepEqual(asked, [], 'keys or a pad: not the phone');
  asked = phone({ pads: [null, { connected: true }] }); assert.equal(V.vibrate(1, 1, 300, 1000), 0); assert.deepEqual(asked, [], 'a pad connected: it rumbles instead');
  phone({ vibrate: false }); assert.equal(V.vibrate(1, 1, 300, 1000), 0, 'an iPhone has no vibrate: nothing, and no error');
  asked = phone({ says: false }); assert.equal(V.vibrate(1, 1, 300, 1000), 0); assert.equal(V.VIBE.until, 0, 'refused: nothing is counted as going');
  assert.equal(V.vibrate(0.15, 0.3, 50, 1010), 0); assert.equal(asked.length, 2, 'and the next is asked for, not held back');
  Object.defineProperty(globalThis, 'navigator', { value: { get vibrate(){ throw new Error('no'); }, getGamepads: () => [] }, configurable: true }); DEVICE.kind = 'touch';
  assert.equal(V.vibrate(1, 1, 300, 1000), 0, 'a browser that throws: nothing');
});

test('main.js: every buzz goes to the phone too, under the Rumble option, and the option buzzes when it is turned on', () => {
  assert.ok(main.includes("import { vibrate } from './vibrate.js';"));
  assert.ok(main.includes('const buzz = (s, w, ms) => { if (OPT.rumble !== false){ rumble(s, w, ms); vibrate(s, w, ms); } };'));
  assert.ok(main.includes('if (OPT.rumble) buzz(0.5, 0.5, 160);'));
  assert.equal((main.match(/\brumble\(\w/g) || []).length, 1, 'rumble() is called only from buzz()');
});

test.after(() => { Object.defineProperty(globalThis, 'navigator', { value: { getGamepads: () => [], maxTouchPoints: 0, userAgent: 'node' }, configurable: true }); DEVICE.kind = 'keys'; V.VIBE.until = 0; });
