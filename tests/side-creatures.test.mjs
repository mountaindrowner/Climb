// Creatures (phase 6, docs/phase6-sheet.md): each region has its own mix, and every creature its own voice. How they
// behave (patrol, notice by sight, hunt within a leash, give up and go home; the worm; the spitter) is played in the
// real game by tools and by hand: enemies.js needs the renderer, which node has not got.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import './helpers/browser.mjs';
const { LEVELS, loadLevel } = await import('./helpers/reach.mjs');
const NOT = new Set(['spawn', 'torch', 'crystal', 'shrine', 'boss', 'exit', 'npc', 'pass', 'arrive', 'urn', 'chest', 'thread', 'bloom', 'updraft', 'pool', 'bell', 'keep', 'deco', 'runnel', 'gust', 'rod', 'flow', 'pilgrim', 'sweeper']   /* the last two: who he passes in the passages (phase 9), not creatures */);
const mix = LEVELS.map((_, n) => { const L = loadLevel(n), c = {}; for (const m of L.marks) if (!NOT.has(m.type)) c[m.type] = (c[m.type] || 0) + 1; return { name: L.name, c }; });

test('every region has at least three kinds of creature, and no kind is in more than two regions', () => {
  const where = {};
  for (const R of mix){ assert.ok(Object.keys(R.c).length >= 3, `${R.name} has only ${Object.keys(R.c).join(', ')}`); for (const t of Object.keys(R.c)) (where[t] = where[t] || []).push(R.name); }
  for (const [t, rs] of Object.entries(where)) assert.ok(rs.length <= 2, `${t} is in ${rs.join(', ')}`);
});
test('no two regions have the same mix', () => {
  const keys = mix.map(R => Object.keys(R.c).sort().join(','));
  assert.equal(new Set(keys).size, keys.length);
});
test('every creature has its own voice, and every walker a state it hunts in', () => {
  const sfx = readFileSync(new URL('../src/audio/sfx.js', import.meta.url), 'utf8'), fam = /const FAMILY = \{[^]*?\n\};/.exec(sfx)[0];
  for (const R of mix) for (const t of Object.keys(R.c)) assert.match(fam, new RegExp(`\\b${t}: \\['`), `no voice for ${t} (${R.name})`);
  const en = readFileSync(new URL('../src/side/enemies.js', import.meta.url), 'utf8'), walk = /export const WALK = \{([^}]*)\}/.exec(en)[1];
  for (const ai of ['crawler', 'thrower', 'squall', 'thornback', 'sentinel']) assert.match(walk, new RegExp(`\\b${ai}: '`), `${ai} has no hunting state`);
});
