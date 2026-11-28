// Phase 20, items 3 and 8 (docs/phase20-sheet.md; decided 28 Nov, decision 0.37): less drawn when a phone cannot keep
// up, in three steps, by itself or as Options says; and the touch buttons in two layouts and three sizes.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

await import('./helpers/browser.mjs');
const ST = await import('../src/side/state.js'), RD = await import('../src/side/render.js');
const src = f => readFileSync(new URL('../' + f, import.meta.url), 'utf8');
const main = src('src/side/main.js'), render = src('src/side/render.js'), html = src('side.html');

test('the steps: everything drawn to begin with, and Options, Drawing: auto, full, light', () => {
  assert.equal(RD.DRAW.step, 0); assert.equal(ST.OPT.draw, 'auto');
  assert.match(main, /cyc\('Drawing', 'draw', \['auto', 'full', 'light'\]/);
  assert.match(main, /if \(OPT\.draw === 'full'\)\{ DRAW\.step = 0; return; \} if \(OPT\.draw === 'light'\)\{ DRAW\.step = 3; return; \}/);
});

test('auto: under 45 frames a second for three seconds together steps down once, never past three, never back up', () => {
  // the rule itself, as main.js has it, run over made-up frames
  const body = main.slice(main.indexOf('function drawStep(gap){'), main.indexOf('function frame(ts){'));
  const make = new Function('OPT', 'DRAW', 'FPS', 'PAUSE', 'STORY', 'GO', body + '; return drawStep;');
  const OPT = { draw: 'auto' }, DRAW = { step: 0 }, FPS = { n: 60, slow: 0 }, run = (fps, secs, extra = {}) => { const f = make(OPT, DRAW, FPS, extra.pause || false, { active: () => !!extra.story }, { st: extra.going || '' }); for (let t = 0; t < secs; t += 1 / 60){ FPS.n = fps; f(1 / 60); } };
  run(58, 20); assert.equal(DRAW.step, 0, 'fast enough: nothing changes');
  run(40, 2.9); assert.equal(DRAW.step, 0, 'not three seconds yet');
  run(40, 0.2); assert.equal(DRAW.step, 1, 'three seconds slow: one step');
  run(40, 1.9); assert.equal(DRAW.step, 1, 'two seconds\' grace after a step');
  run(40, 5.2); assert.equal(DRAW.step, 2); run(40, 5.2); assert.equal(DRAW.step, 3); run(20, 30); assert.equal(DRAW.step, 3, 'three is the last');
  DRAW.step = 1; FPS.slow = 0; run(30, 10, { pause: true }); run(30, 10, { story: true }); run(30, 10, { going: 'out' }); assert.equal(DRAW.step, 1, 'a menu, a story screen, a region being made: not counted');
  run(60, 60); assert.equal(DRAW.step, 1, 'and it does not step back up');
  OPT.draw = 'full'; run(10, 1); assert.equal(DRAW.step, 0); OPT.draw = 'light'; run(60, 1); assert.equal(DRAW.step, 3);
});

test('what each step does in the drawing', () => {
  assert.match(render, /if \(DRAW\.step < 2\)\{   \/\/ the glow/, 'step 2: no glow passes');
  assert.match(render, /comp\.uniforms\.amt\.value = DRAW\.step < 2 \? AMT : 0;/);
  assert.match(render, /if \(DRAW\.step >= 1\)\{ pass\(comp, fin\); copy\.uniforms\.tex\.value = fin\.texture; pass\(copy, null\); \}/, 'step 1: the last pass at the world\'s size, stretched up');
  assert.match(render, /fin\.setSize\(w, TH\)/); assert.match(render, /fin\.texture\.minFilter = fin\.texture\.magFilter = THREE\.NearestFilter/);
  assert.match(main, /if \(DRAW\.step >= 3 && \(FPS\.odd = !FPS\.odd\)\)\{ requestAnimationFrame\(frame\); return; \}/, 'step 3: every other frame let go');
  assert.match(main, /FPS\$\{DRAW\.step \? ' D' \+ DRAW\.step : ''\}/, 'the readout says the step');
});

test('the touch buttons: jump or attack bottom right, small, middle or large', () => {
  assert.equal(ST.OPT.pad, 'jump'); assert.equal(ST.OPT.ring, 'mid');
  assert.match(main, /cyc\('Buttons', 'pad', \['jump', 'attack'\]/); assert.match(main, /cyc\('Button size', 'ring', \['small', 'mid', 'large'\]/);
  assert.match(main, /const padLayout = \(\) => \{ document\.body\.dataset\.pad = OPT\.pad; document\.body\.dataset\.ring = OPT\.ring; \}; padLayout\(\);/);
  assert.ok(html.includes('body[data-pad="attack"] #pad .col.right .a{grid-column:2;grid-row:2}')); assert.ok(html.includes('body[data-pad="attack"] #pad .col.right .jump{grid-column:1;grid-row:2}'));
  for (const s of ['small', 'large']) assert.ok(html.includes(`body[data-ring="${s}"] #pad{height:`), s);
});
