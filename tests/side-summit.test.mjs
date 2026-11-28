// The three at the summit (build 126; docs/phase18-sheet.md 5): once more each, after the Fallen and before the
// beacon. Mirel by the empty cradle, Corwen with his book at its last page, Ordric with a lamp he has not lit.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

await import('./helpers/browser.mjs');
const LV = await import('../src/side/level.js'), TK = await import('../src/side/talk.js'), IT = await import('../src/side/items.js');
const main = readFileSync(new URL('../src/side/main.js', import.meta.url), 'utf8'), items = readFileSync(new URL('../src/side/items.js', import.meta.url), 'utf8');
const L0 = LV.loadLevel(LV.CLIMB_TOP), L = { W: L0.W, tiles: L0.tiles.slice(), marks: L0.marks.map(m => ({ ...m })), rooms: L0.rooms.map(r => ({ ...r })) };
const z = L.rooms.find(r => r.name === 'zenith'), at = (i, j) => L.tiles[j * L.W + i];
const three = L.marks.filter(m => m.type === 'npc' && m.summit);

test('three on the summit floor, between the stage and the beacon, placed where they were put', () => {
  assert.deepEqual(three.map(m => m.who).sort(), ['lamplighter', 'scribe', 'wren']);
  const boss = L.marks.find(m => m.type === 'boss'), exit = L.marks.find(m => m.type === 'exit');
  for (const m of three){ assert.ok(m.x >= z.tx0 && m.x < z.tx1 && m.y >= z.ty0 && m.y < z.ty1, m.who + ' in the summit room'); assert.equal(m.station, 'zenith');
    assert.notEqual(at(m.x, m.y - 1), LV.EMPTY, m.who + ' stands on the floor'); for (let d = 0; d < 5; d++) assert.equal(at(m.x, m.y + d), LV.EMPTY, m.who + ' has room to stand'); assert.ok(Math.abs(m.x - boss.x) >= 6, 'off the stage'); assert.ok(m.x < exit.x, 'short of the beacon'); }
  const [c, o, w] = ['scribe', 'lamplighter', 'wren'].map(k => three.find(m => m.who === k).x - z.tx0); assert.deepEqual([c, o, w], [31, 49, 62]);
  assert.equal(three.find(m => m.who === 'wren').side, 1, 'her cradle on the beacon\'s side of her');
  for (const m of three) assert.ok(!L.marks.some(k => k.type === 'torch' && Math.abs(k.x - m.x) < 5 && Math.abs(k.y - m.y) < 8), 'no torch at their elbow (one was moved into the empty cradle)');
  for (const k of ['lamplighter', 'wren', 'scribe']) assert.equal(L.marks.filter(m => m.type === 'npc' && m.who === k && !m.summit).length, 1, k + ' still has their own place in the Firmament');
});

test('not there until the Fallen has fallen; and they come up on to the summit when it does', () => {
  assert.ok(/if \(mk\.summit && !RULE\.fallen\)\{ later\.push\(mk\); continue; \}/.test(items), 'held back while it stands');
  assert.ok(/I\.wake = \(\) => \{ const n0 = later\.length; for \(const mk of later\.splice\(0\)\) person\(mk,/.test(items), 'made when woken');
  assert.ok(/case 'bossDead':[\s\S]{0,200}RULE\.fallen = true; ITEMS\.wake\(\);/.test(main), 'woken the moment the keeper falls');
});

test('what each has with them: no station, one thing; Corwen\'s page written only if he has stood at the Source', () => {
  const S = IT.SUMMIT_STATION; assert.deepEqual(Object.keys(S).sort(), ['lamplighter', 'scribe', 'wren']);
  assert.equal(S.wren.name, 'THE EMPTY CRADLE'); assert.equal(S.scribe.name, "CORWEN'S LAST PAGE"); assert.equal(S.lamplighter.name, 'THE UNLIT LAMP');
  assert.ok(/const ST = mk\.summit \? SUMMIT_STATION\[who\] : STATION\[who\]/.test(items)); assert.ok(/ST\.draw\(sc\.getContext\('2d'\), \{ written: mk\.summit && G\.source \}\)/.test(items));
  assert.ok(/if \(who === 'lamplighter' && !mk\.summit\)/.test(items), 'no lamp-store behind Ordric at the summit');
  // the page: ink on it with the Source, none without
  const page = written => { const px = []; const g = { fillStyle: '', fillRect: (x, y, w, h) => px.push([g.fillStyle, x, y, w, h]) }; S.scribe.draw(g, { written }); return px.length; };
  assert.equal(page(true), page(false) + 1);
});

test('what they say: said in full once, then the last line; no shop, no tally; nobody says what to do', () => {
  assert.ok(/if \(N\.summit\)\{[\s\S]{0,140}const k = 'summit:' \+ N\.who, n = G\.met\[k\] \|\| 0, S0 = SUMMIT\[N\.who\]\(!!G\.source\);[\s\S]{0,120}TALK\.start\(N\.who, n === 0 \? S0\.slice\(\) : \[S0\[S0\.length - 1\]\], null, N\.art\); return; \}/.test(main));
  const all = [...TK.SUMMIT.wren(), ...TK.SUMMIT.scribe(false), ...TK.SUMMIT.scribe(true), ...TK.SUMMIT.lamplighter()];
  assert.deepEqual(TK.SUMMIT.scribe(false), ['The last page.', 'I have nothing to put on it.']);
  assert.ok(TK.SUMMIT.scribe(true).some(l => /How far down the water goes/.test(l)), 'the depth, and nothing else');
  for (const l of all){ assert.ok(!/^(Go|Find|Look|Take|Climb|Break|Strike|Listen|Wait)\b/.test(l), 'no one tells him what to do: ' + l); assert.ok(l.length < 80, 'short'); assert.ok(!/—/.test(l)); }
  assert.ok(TK.SUMMIT.wren().every(l => !/count/i.test(l) || /did not count/.test(l)), 'she has stopped counting');
});

test('Ordric at the summit holds his own lantern dark (build 129): his drawing, with only the glass painted out', async () => {
  const TK = await import('../src/side/talk.js'), { readFileSync } = await import('node:fs');
  assert.equal(TK.PEOPLE.lamplighter.summit, 'px_moth_dark'); assert.equal(TK.PEOPLE.lamplighter.art, 'px_moth', 'everywhere else, lit');
  const items = readFileSync(new URL('../src/side/items.js', import.meta.url), 'utf8'); assert.match(items, /mk\.summit && P0\.summit \? \{ \.\.\.P0, art: P0\.summit \}/);
  const a = JSON.parse(readFileSync(new URL('../assets/side/px_moth/sprite.json', import.meta.url))), b = JSON.parse(readFileSync(new URL('../assets/side/px_moth_dark/sprite.json', import.meta.url)));
  assert.deepEqual(Object.keys(b.anims), Object.keys(a.anims)); for (const k of Object.keys(a.anims)) assert.deepEqual(b.anims[k], a.anims[k], k + ': the same frames, the same feet');
  for (const k of Object.keys(a.anims)) for (const f of [k + '.png', k + '_n.png']) assert.ok(readFileSync(new URL('../assets/side/px_moth_dark/' + f, import.meta.url)).length > 0, f);
  assert.ok(/px_moth_dark: \[18, 7, 32\]/.test(readFileSync(new URL('../src/side/talk.js', import.meta.url), 'utf8')), 'his face in the talk box from the same place');
});
