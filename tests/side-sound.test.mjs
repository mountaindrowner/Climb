// Phase 19, build 131 (docs/phase19-sheet.md; decided 28 Nov, decision 0.37): no section silent. Every room plays a
// piece (its own, or its region's as a stand-in) and an ambience, but for the places meant to be nearly silent; every
// keeper's fight has a piece, made as it plays as well as recorded; and Options has Listen, every sound by itself.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

await import('./helpers/browser.mjs');
const LV = await import('../src/side/level.js'), MU = await import('../src/side/music.js');
const main = readFileSync(new URL('../src/side/main.js', import.meta.url), 'utf8');
const manifest = JSON.parse(readFileSync(new URL('../assets/audio/manifest.json', import.meta.url), 'utf8'));
const made = p => !!MU.SONGS[p], recorded = p => !!(manifest.music || {})[p];

test('every room of every level: a piece and an ambience, made as it plays and recorded; silent only where meant', () => {
  const quiet = [];
  for (let n = 0; n < LV.LEVELS.length; n++){
    const L = LV.loadLevel(n), R0 = LV.REGION_DATA[n], looks = new Set([R0.theme, ...L.rooms.map(r => r.look || R0.theme)]);
    for (const look of looks){
      const m = MU.placeSound(look, R0, made), r = MU.placeSound(look, R0, p => recorded(p) || made(p)), at = `${LV.LEVELS[n].name}, a room that looks '${look}'`;
      assert.ok(m.amb, at + ': an ambience'); assert.ok(manifest.sfx['amb_' + m.amb], at + ': its ambience is a recording there is');
      if (m.hushed){ quiet.push(look); assert.equal(m.piece, ''); continue; }
      assert.ok(made(m.piece), at + ': a piece made as it plays (' + m.piece + ')'); assert.ok(r.piece, at + ': a piece with the recordings');
    }
  }
  assert.deepEqual([...new Set(quiet)].sort(), ['eye', 'shardlight'], 'nearly silent: the Eye of the Storm and the Shard\'s room, and nowhere else (yet)');
});

test('a wing with no piece of its own plays its region\'s, until it has one', () => {
  const at = n => LV.REGION_DATA[n];
  assert.equal(MU.placeSound('scriptorium', at(1), made).piece, 'cloister'); assert.equal(MU.placeSound('foundry', at(1), made).piece, 'cloister');
  assert.equal(MU.placeSound('glacier', at(2), made).piece, 'spires'); assert.equal(MU.placeSound('aqueduct', at(4), made).piece, 'gardens');
  assert.equal(MU.placeSound('orrery', at(5), made).piece, 'firmament'); assert.equal(MU.placeSound('houses', at(4), made).piece, 'gardens');
  assert.equal(MU.placeSound('cloister', at(0), made).piece, 'cloister', 'a room that wears another region\'s look plays that region\'s, as before (the Ossuary)');
  assert.equal(MU.placeSound('workings', at(6), made).piece, 'roots', 'the Deep: the Roots\' piece, as before');
  assert.equal(MU.placeSound('glacier', at(2), made).amb, 'wind'); assert.equal(MU.placeSound('foundry', at(1), made).amb, 'cave');
});

test('every keeper\'s fight has a piece made as it plays: the Auger\'s among them', () => {
  for (const R of LV.REGION_DATA) assert.ok(made('boss_' + R.theme), R.name + ': boss_' + R.theme);
  assert.ok(made('boss_hollow'), 'the Hollow\'s keeper, the Auger');
});

test('Options, Listen: every piece, ambience, cry and sound by itself, and the game\'s music waits while it is open', () => {
  assert.match(main, /menuButton\('Listen', \(\) => listenMenu\(\(\) => options\(back\)\), true\)/);
  assert.match(main, /const LISTEN_TABS = \['Music', 'Made', 'Places', 'Sounds'\];/);
  assert.match(main, /if \(LISTEN\.piece !== null\)\{/); assert.match(main, /const leave = \(\) => \{ LISTEN\.piece = null; LISTEN\.amb = null; back\(\); \};/);
  for (const k of ['MANIFEST.music', 'SONGS', 'BEASTS', 'MANIFEST.sfx']) assert.ok(main.includes(k), k);
});
