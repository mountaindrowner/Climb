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
      assert.ok(m.amb || m.air, at + ': an ambience'); if (m.amb) assert.ok(manifest.sfx['amb_' + m.amb], at + ': its ambience is a recording there is'); else assert.ok(MU.AIR[m.air], at + ': its air is one made as it plays');
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
  assert.equal(MU.placeSound('workings', at(6), made).piece, 'workings', 'the Deep: its own (build 133)');
  assert.equal(MU.placeSound('glacier', at(2), made).amb, 'wind'); assert.equal(MU.placeSound('foundry', at(1), made).amb, 'cave');
});

test('every keeper\'s fight has a piece made as it plays: the Auger\'s among them', () => {
  for (const R of LV.REGION_DATA) assert.ok(made('boss_' + R.theme), R.name + ': boss_' + R.theme);
  assert.ok(made('boss_hollow'), 'the Hollow\'s keeper, the Auger');
});

test('Options, Listen: every piece, ambience, cry and sound by itself, and the game\'s music waits while it is open', () => {
  assert.match(main, /menuButton\('Listen', \(\) => listenMenu\(\(\) => options\(back\)\), true\)/);
  assert.match(main, /const LISTEN_TABS = \['Music', 'Made', 'Places', 'Sounds'\];/);
  assert.match(main, /if \(LISTEN\.piece !== null\)\{/); assert.match(main, /const leave = \(\) => \{ LISTEN\.piece = null; LISTEN\.amb = null; LISTEN\.air = ''; back\(\); \};/);
  for (const k of ['MANIFEST.music', 'SONGS', 'BEASTS', 'MANIFEST.sfx']) assert.ok(main.includes(k), k);
});

test('the pilot (build 132): the Scriptorium is the Cloister\'s piece through a wall, with a figure that never reaches its end', () => {
  const at = LV.REGION_DATA[1], P = MU.placeSound('scriptorium', at, made), red = MU.placeSound('rubric', at, made);
  assert.equal(P.piece, 'cloister', 'its region\'s piece, the one already playing: walking in, it does not stop and another start');
  assert.ok(P.wall > 0 && P.wall < 2000, 'heard through a wall'); assert.equal(P.layer, 'layer_scriptorium'); assert.equal(red.layer, 'layer_scriptorium'); assert.ok(red.wall <= P.wall, 'the red rooms further in');
  const L = MU.SONGS.layer_scriptorium; assert.ok(L.arp.len < L.arp.pat.length, 'the figure starts over before its last note'); assert.equal(L.arp.pat.length - L.arp.len, 1, 'one note short');
  assert.ok(!L.pad && !L.bass && !L.lead, 'a layer only: the piece under it is the Cloister\'s');
  assert.ok(MU.SONGS.scriptorium_b, 'the other way, made whole in code, to hear beside it (Listen, Made)');
  assert.equal(MU.placeSound('cloister', at, made).wall, 0, 'the Cloister itself: no wall'); assert.equal(MU.placeSound('foundry', at, made).layer, '', 'the Foundry: not yet');
  const score = readFileSync(new URL('../src/audio/score.js', import.meta.url), 'utf8'), mus = readFileSync(new URL('../src/side/music.js', import.meta.url), 'utf8');
  assert.match(score, /S\.wall = cut => \{/); assert.match(mus, /M\.wall = cut => \{ wall\.frequency\.setTargetAtTime\(cut, ctx\.currentTime, 0\.6\); \}/, 'the change is smooth');
  assert.match(main, /thru = tr\.wall \|\| P\.under \? 0\.7 : 1/, 'quieter through the wall'); assert.match(main, /LAYER\.play\(tr\.layer \|\| ''\)/);
});

test('the Deep (build 133): five pieces made in code, each its own, each sparer than the one above; its air made as it plays', () => {
  const lv = name => LV.REGION_DATA.find(r => r.name === name), deep = ['The Workings', 'The Flooded Levels', 'The Vein', 'The Great Shaft', 'The Hollow'];
  for (const name of deep){ const R0 = lv(name), m = MU.placeSound(R0.theme, R0, made); assert.equal(m.piece, R0.theme, name + ': its own piece'); assert.ok(made(m.piece)); assert.equal(m.air, R0.theme, name + ': its own air'); assert.equal(m.amb, '', 'the caves\' recording not under it');
    const S = MU.SONGS[R0.theme]; assert.ok(S.bpm <= 62, name + ': slow'); assert.ok(!S.drums, name + ': no drums: nothing above sounds like it'); }
  assert.equal(MU.SONGS.workings.knock.inst, 'pick'); assert.equal(MU.SONGS.workings.lead.inst, 'pipe', 'the Workings: a pick on stone, the tune on a thin pipe');
  assert.equal(MU.SONGS.flooded.knock.inst, 'pump'); assert.ok(MU.TREAT.flooded.wall > 0, 'the Flooded Levels: the pump\'s stroke, heard as if from under the water');
  assert.ok(MU.SONGS.vein.lead.echo && MU.SONGS.vein.lead.echo.steps > 0, 'the Vein: each phrase again a beat late, as the Echo does');
  const sh = MU.SONGS.shaft; assert.ok(!sh.lead && !sh.arp && !sh.bass && sh.drone, 'the Great Shaft: one held note, nothing else'); assert.ok(sh.drone.g <= 0.05, 'the quietest place in the game');
  const H = lv('The Hollow'), src = MU.placeSound('hollow', H, made, 'source'); assert.equal(src.piece, 'source', 'at the Source, its own'); assert.equal(MU.SONGS.source.set, MU.SONGS.ending.set, 'the tune whole and warm: in the major, as the ending');
  assert.match(main, /P\.under \? 420 : 20000/, 'under the water, all the music muffled further');
  for (const k of Object.keys(MU.AIR)){ const A = MU.AIR[k]; assert.equal(A.bed.length, 3); assert.ok(A.ev.length >= 1); for (const [, lo, hi] of A.ev) assert.ok(lo > 0 && hi >= lo, k + ': events now and then, never on a loop'); }
  assert.ok(main.includes("'made air: '"), 'in Listen too');
});
