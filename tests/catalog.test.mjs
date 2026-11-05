import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CATALOG } from '../src/entities/catalog.js';
import { ENTITY_TYPES } from './helpers.mjs';

test('the catalog and the registry list the same threats', () => {
  assert.deepEqual([...CATALOG.map(t => t.id)].sort(), [...ENTITY_TYPES].sort());
});
test('every threat has one answer on the four buttons, a tell and a hint', () => {
  for (const t of CATALOG){
    assert.ok(['▲', '▼', 'A', 'B'].includes(t.answer), t.id);
    assert.ok(t.tell.length > 20 && t.name && t.verb, t.id);
    const dir = t.kind === 'enemy' ? 'enemies' : 'hazards';
    const src = readFileSync(new URL(`../src/entities/${dir}/${t.id}.js`, import.meta.url), 'utf8');
    assert.match(src, /export const hint = '/, `${t.id} has a first-sight hint`);
  }
});
