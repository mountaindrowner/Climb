// The end, read two ways (build 125; docs/phase18-sheet.md 5). The light goes down the scar to the water. If he has
// stood at the Source it runs on along the water to the small flame there, and stays; if he has not, it goes into the
// water and the picture does not show where it ends. After the end, the title shows the light down the scar.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const main = readFileSync(new URL('../src/side/main.js', import.meta.url), 'utf8'), story = readFileSync(new URL('../src/side/story.js', import.meta.url), 'utf8');
const body = name => { const i = story.indexOf(`  function ${name}(`); assert.ok(i >= 0, name); const j = story.indexOf('\n  }\n', i); return story.slice(i, j); };

test('the beacon starts the ending with whether he has stood at the Source', () => {
  assert.ok(/G\.done = true; store\(\); STORY\.start\('ending', \{ source: !!G\.source \}, title\);/.test(main));
  assert.ok(/G\.source = 1;/.test(main), 'the Source is remembered when he stands at it (build 74)');
});

test('the ending: the light down the scar; with the Source, on along the water to its flame, and kept; without, into the water and gone', () => {
  const e = body('ending');
  assert.ok(/const src = !!S\.opts\.source;/.test(e));
  assert.ok(/if \(t > 6 && \(src \|\| t < 16\)\)\{ const u = ease\(\(t - 6\) \/ 6\), fade = src \? 1 : Math\.min\(1, \(16 - t\) \/ 2\);/.test(e), 'kept to the end with the Source; gone by sixteen seconds without');
  assert.ok(/if \(src\) source\(Math\.min\(1, w \/ 1\.2\), t\); else if \(w < 2\.4\) ripple\(w \/ 2\.4\);/.test(e), 'the flame, or a ring in the water and nothing after');
  for (const line of ['The flame you let die was burning.', 'It had never gone out.', 'It had gone down into the dark to find you.']) assert.ok(e.includes(line), 'the lines stay: ' + line);
  assert.ok(/function source\(k, t\)\{/.test(story) && /function ripple\(k\)\{/.test(story) && /function scar\(u, t\)\{/.test(story));
});

test('after the end, the title shows the light down the scar, and the flame if he had stood at the Source', () => {
  const t = body('title');
  assert.ok(/const after = S\.after\(\); if \(after\.done\)\{ scar\(1, S\.t\); if \(after\.source\) source\(1, S\.t\); \}/.test(t));
  assert.ok(/S\.after = \(\) => \(\{\}\);/.test(story), 'nothing, until main says');
  assert.ok(/function title\(\)\{\n  STORY\.after = \(\) => \(\{ done: !!G\.done, source: !!G\.source \}\);/.test(main), 'read from the save each time the title is up');
});
