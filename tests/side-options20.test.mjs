// Phase 20's options (docs/phase20-sheet.md; decided 28 Nov, decision 0.37): the save as a line of text to copy and
// paste, the text size, the buzz's option named for the phone too, the frames a second beside the place, and the tags
// that let the game open from a phone's Home Screen as an app.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

await import('./helpers/browser.mjs');
const ST = await import('../src/side/state.js');
const src = f => readFileSync(new URL('../' + f, import.meta.url), 'utf8');
const main = src('src/side/main.js'), hud = src('src/side/hud.js'), html = src('side.html');
const KEY = 'climb-side', BACKUP = 'climb-side-backup';
function storage(){ const box = {}; globalThis.localStorage = { getItem: k => (k in box ? box[k] : null), setItem: (k, v) => { box[k] = String(v); }, removeItem: k => { delete box[k]; } }; return box; }
const save = { seamed: 1, joined: 1, winged: 6, can: { dash: 1 }, level: 4, top: 4, beat: [1, 1, 1, 1], shards: 777, threads: 5, relics: ['whetstone'], worn: ['whetstone'], got: { 4: ['t1,2'] }, broke: {}, began: true, name: 'Élan «ü»' };

test('a save copied as text comes back the same, letters outside plain English and all', () => {
  const box = storage(); box[KEY] = JSON.stringify(save); ST.loadSave();
  const line = ST.saveText(); assert.match(line, /^CLIMB-SAVE-1:[A-Za-z0-9+/=]+$/, 'one line, nothing in it to break when pasted');
  const back = ST.readSaveText(line); for (const k of Object.keys(save)) assert.deepEqual(back[k], save[k], k);
  // as a phone's paste may give it: wrapped, with spaces and line breaks
  assert.ok(ST.readSaveText('  ' + line.slice(0, 30) + '\n' + line.slice(30) + ' \n'));
});

test('what is not a save is turned down, and the save here is not touched', () => {
  const box = storage(); box[KEY] = JSON.stringify(save); box[BACKUP] = box[KEY]; ST.loadSave();
  for (const bad of ['', 'hello', 'CLIMB-SAVE-1:', 'CLIMB-SAVE-1:!!!!', 'CLIMB-SAVE-1:' + btoa('[1,2]'), 'CLIMB-SAVE-1:' + btoa('{"x":1}'), btoa(JSON.stringify(save))]){
    assert.equal(ST.readSaveText(bad), null, bad); assert.equal(ST.takeSaveText(bad), false, bad);
  }
  assert.equal(JSON.parse(box[KEY]).shards, 777); assert.equal(ST.G.shards, 777);
});

test('a pasted save takes the place of the one here: written with its copy, and read as any save is', () => {
  const box = storage(); box[KEY] = JSON.stringify(save); ST.loadSave(); const line = ST.saveText();
  box[KEY] = JSON.stringify({ ...save, shards: 3, level: 0 }); box[BACKUP] = box[KEY]; ST.loadSave(); assert.equal(ST.G.shards, 3);
  assert.equal(ST.takeSaveText(line), true);
  assert.equal(ST.G.shards, 777); assert.equal(ST.G.level, 4); assert.equal(ST.G.began, true);
  assert.equal(JSON.parse(box[KEY]).shards, 777); assert.equal(box[KEY], box[BACKUP]);
});

test('Options: Text size, Rumble and vibration, Copy save, Paste save; the menus a quarter bigger with large text, and moved up or made smaller to fit a short screen', () => {
  assert.equal(ST.OPT.big, false, 'normal text to begin with');
  assert.match(main, /cyc\('Text size', 'big', \[false, true\], \['normal', 'large'\]/);
  assert.match(main, /cyc\('Rumble and vibration', 'rumble'/); assert.doesNotMatch(main, /cyc\('Rumble', /);
  assert.match(main, /menuButton\('Copy save'/); assert.match(main, /menuButton\('Paste save'/);
  assert.match(main, /sc = Math\.min\(OPT\.big \? 1\.25 : 1, \(H - 8\) \/ Math\.max\(1, r\.height\)\)/); assert.match(main, /requestAnimationFrame\(menuFit\); \};/);
  // typing a save is not play: keys in the box do not reach the game (Escape still goes back)
  assert.match(main, /e\.key !== 'Escape'\) e\.stopPropagation\(\)/);
  // asked twice before a save here is replaced
  assert.match(main, /Load it\? The save here will be replaced/);
});

test('large text: the picture over the play drawn 144 tall (a quarter bigger), the pages over a pause kept at 180', () => {
  assert.match(main, /const HH = OPT\.big && !PAUSE && !NOTE \? 144 : 180;/);
  assert.match(main, /HUD\.begin\(Math\.max\(288 \* HH \/ 180, R\.size\(\)\.w \* HH \/ R\.size\(\)\.h\), HH\)/);
  assert.equal(180 / 144, 1.25);
  // nothing in the HUD is placed by the old fixed height: what sits at the foot is placed from the picture's own
  assert.doesNotMatch(hud.replace(/hh = 180|Hh: 180|\(180 - H\.Hh\)/g, ''), /\b180\b/);
  for (const at of ['H.Hh - 20', 'H.Hh - hgt', 'H.Hh - 5 - out.length', 'H.Hh - 7']) assert.ok(hud.includes(at), at);
  // where a creature or a door is on the screen, in the picture's rows
  assert.doesNotMatch(main.slice(main.indexOf('function drawHud'), main.indexOf('if (PAUSE && SCREEN === \'annals\')')), /\/ 2 \* 180/);
});

test('the frames a second, beside the place, measured before the step is capped', () => {
  assert.match(main, /const FPS = \{ n: 60 \}/);
  assert.match(main, /if \(gap > 0 && gap < 0\.5\) FPS\.n \+= \(1 \/ gap - FPS\.n\) \* 0\.05;/);
  assert.match(main, /\$\{Math\.round\(FPS\.n\)\} FPS · /);
});

test('the Home Screen: the tags, the manifest, the icons, and all of them in the itch.io build', () => {
  for (const t of ['apple-mobile-web-app-capable', 'apple-touch-icon', 'rel="manifest" href="side.webmanifest"']) assert.ok(html.includes(t), t);
  const m = JSON.parse(src('side.webmanifest')); assert.equal(m.display, 'fullscreen'); assert.equal(m.orientation, 'landscape');
  for (const i of m.icons) assert.ok(existsSync(new URL('../' + i.src, import.meta.url)), i.src);
  assert.ok(existsSync(new URL('../assets/side/app/icon-180.png', import.meta.url)));
  const b = src('tools/build-itch.mjs'); assert.ok(b.includes("'side.webmanifest'")); assert.ok(b.includes('assets/side/app/icon-${n}.png'));
});
