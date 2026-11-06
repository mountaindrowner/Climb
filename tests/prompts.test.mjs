// Button prompts: every action renders for every device, and every token written into the game's text is a real action.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { label, say, keyName, DEVICE } from '../src/core/prompts.js';
import { DEFAULTS, SET, REBINDABLE } from '../src/core/settings.js';
const ACTIONS = REBINDABLE;   // the same eight actions input.js reads (input.js itself needs a page)


test('every action has a prompt on every device', () => {
  for (const kind of ['touch', 'keys', 'xbox', 'ps']) for (const a of ACTIONS){
    const l = label(a, kind); assert.ok(l && l !== '?' && l !== '—', `${a} on ${kind}`);
  }
  assert.equal(label('jump', 'keys'), 'Space'); assert.equal(label('attack', 'xbox'), 'X'); assert.equal(label('attack', 'ps'), '□');
  assert.equal(keyName('KeyJ'), 'J'); assert.equal(keyName('ShiftLeft'), 'Shift'); assert.equal(keyName('Mouse0'), 'LMB'); assert.equal(keyName('Mouse2'), 'RMB');
});
test('say() fills tokens for the current device', () => {
  const was = DEVICE.kind; DEVICE.kind = 'keys';
  assert.equal(say('Press {jump} then {attack}'), 'Press Space then LMB');
  DEVICE.kind = was;
});
test('no key or pad button does two things in the defaults', () => {
  const keys = Object.values(DEFAULTS.keys).flat(), pad = Object.values(DEFAULTS.pad).flat();
  assert.equal(new Set(keys).size, keys.length); assert.equal(new Set(pad).size, pad.length);
  for (const a of REBINDABLE) assert.ok(SET.keys[a].length, a);
});
test('every {token} in the game text is an action', () => {
  const files = [];
  const walk = d => { for (const f of readdirSync(new URL(d, import.meta.url), { withFileTypes: true })) f.isDirectory() ? walk(d + f.name + '/') : f.name.endsWith('.js') && files.push(d + f.name); };
  walk('../src/');
  let n = 0;
  for (const f of files){
    const src = readFileSync(new URL(f, import.meta.url), 'utf8');
    for (const m of src.matchAll(/'[^'\n]*(?<!\$)\{(\w+)\}[^'\n]*'/g)) for (const t of m[0].matchAll(/(?<!\$)\{(\w+)\}/g)){ n++; assert.ok(ACTIONS.includes(t[1]), `${f}: {${t[1]}}`); }
  }
  assert.ok(n > 20, 'found the prompts');
});
test('icons and timing rings name actions, not fixed letters', () => {
  const files = [];
  const walk = d => { for (const f of readdirSync(new URL(d, import.meta.url), { withFileTypes: true })) f.isDirectory() ? walk(d + f.name + '/') : f.name.endsWith('.js') && files.push(d + f.name); };
  walk('../src/entities/');
  for (const f of files){
    const src = readFileSync(new URL(f, import.meta.url), 'utf8');
    for (const m of src.matchAll(/draw(?:Icon|Timing)\([^;]*?'([^']*)'/g)) if (m[1] !== '!' && !m[1].startsWith('#')) assert.match(m[1], /^\{\w+\}$/, `${f}: '${m[1]}' should be an action token`);
  }
});
