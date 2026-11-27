// A statement swallowed by a comment (build 78). Four times a `//` note was put in the middle of a long line and the
// code after it on that line went quiet: the Gardener's Seed did nothing (twice), a fallen keeper's banner and its
// shards never came, the Toll began its second rise with its first's leftovers, the place's name never brightened.
// Nothing failed; the game was only a little less than it said. This looks at every line of the game for a comment
// with what reads as code after it. A comment that quotes code on purpose can say so by ending the quoted part with no `;`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const dirs = ['src/side', 'src/side/regions', 'src/audio', 'src/core', 'tests/helpers'];   // (the checks' own helpers too, since build 113: three times in a day a note in one of them swallowed code)
const files = dirs.flatMap(d => readdirSync(new URL('../' + d, import.meta.url)).filter(f => f.endsWith('.js') || f.endsWith('.mjs')).map(f => d + '/' + f));
const CODE = /[a-zA-Z_$.\]]+\([^)]*\);|\b(if|for|const|let|return)\s*\(|\w\s=\s[^=].*;\s|\}\s*$|;\s*\}\s*$/;
export const swallowed = text => { const out = [];
  text.split('\n').forEach((ln, n) => { let i = 0, q = null, at = -1;
    while (i < ln.length){ const c = ln[i]; if (q){ if (c === '\\') i++; else if (c === q) q = null; } else if (c === "'" || c === '"' || c === '`') q = c; else if (c === '/' && ln[i + 1] === '/'){ at = i; break; } i++; }
    if (at < 0 || !ln.slice(0, at).trim()) return; const com = ln.slice(at + 2);
    if (CODE.test(com) && com.includes(';')) out.push((n + 1) + ': //' + com.slice(0, 120)); });
  return out; };

test('the looker knows a swallowed statement when it sees one', () => {
  assert.equal(swallowed("a = 1;   // a note b = 2;   // another").length, 1);
  assert.equal(swallowed("f();   // it rings banner('x', y); spill(1, 2);").length, 1);
  assert.equal(swallowed("a = 1;   // a plain note, with (brackets) and a colon: fine").length, 0);
  assert.equal(swallowed("const s = 'http://x';   // a note").length, 0);
});
test('no statement in the game is inside a comment', () => {
  const found = files.flatMap(f => swallowed(readFileSync(new URL('../' + f, import.meta.url), 'utf8')).map(h => f + ':' + h));
  assert.deepEqual(found, []);
});
