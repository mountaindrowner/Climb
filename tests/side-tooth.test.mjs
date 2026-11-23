// The weapons he carries, and the second a keeper leaves: the Wyrm's tooth (docs/weapons-sheet.md; build 91). The game
// knew two weapons and asked "is it the spade?" everywhere; now it has a round of them (motor.js ARMS).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import './helpers/browser.mjs';
const M = await import('../src/side/motor.js');
const ST = await import('../src/side/state.js');
const TE = await import('../src/side/teach.js');
const R = await import('./helpers/reach.mjs');
const { strikeEnemies } = await import('../src/side/enemies.js');
const meta = JSON.parse(readFileSync(new URL('../assets/side/mask_tall_c/sprite.json', import.meta.url), 'utf8'));
const src = f => readFileSync(new URL('../src/side/' + f, import.meta.url), 'utf8');
test('a round of weapons: each with its drawings\' prefix, its picture and its name; the weapon in hand is one of them', () => {
  assert.deepEqual(Object.keys(M.ARMS), ['blade', 'spade', 'tooth']);
  for (const [id, W] of Object.entries(M.ARMS)){ assert.equal(W.id, id); assert.ok(TE.ICONS[W.icon], `a picture for ${id}`); assert.ok(W.title); assert.equal(M.weaponOf({ weapon: id }), W); assert.ok(W.combo.length === 3); }
  assert.equal(M.weaponOf({ weapon: 'nothing' }), M.BLADE, 'an unknown one is the sword');
  for (const W of [M.SPADE, M.TOOTH]) for (const n of ['idle', 'run', 'air', 'land', 'crouch', 'crouch_walk', 'roll', 'hurt', 'plunge']) assert.ok(meta.anims[W.pre + n] && meta.anims[W.pre + n].n, `${W.id}: his drawing ${n}`);
  for (const W of [M.SPADE, M.TOOTH]) for (const sw of [...W.combo, ...(W.rise ? [W.rise] : [])]){ const A = meta.anims[sw.anim]; assert.ok(A, sw.anim); assert.ok(sw.hit > 0 && sw.hit < 1); assert.ok(Math.abs(sw.hit * A.frames - Math.round(sw.hit * A.frames)) < 1e-9, `${sw.anim}: the blow lands on a frame of its own strip`); }
  const m = src('main.js'); assert.ok(!/P\.weapon === 'spade' \? 'hammer' : 'blade'/.test(m)); assert.ok(m.includes("const order = ['blade', ...(G.arms || [])]"), 'the swap goes round what he has');
});
test('the tooth: the longest reach, in a line; a thrust up; no guard; slower to come than the sword, quicker than the hammer', () => {
  const T = M.TOOTH; assert.ok(T.reach > M.SPADE.reach && M.SPADE.reach > M.BLADE.reach); assert.equal(T.guard, false); assert.ok(T.narrow && T.pogo);
  assert.ok(T.combo[1].reach > T.reach, 'the second thrust is longer'); assert.ok(T.rise && T.rise.reach >= T.combo[1].reach, 'and the upward one as long');
  assert.ok(T.combo[2].pierce && T.combo[2].dash > 0, 'the third carries him forward and strikes as it goes');
  for (let k = 0; k < 2; k++) assert.ok(T.combo[k].wind < M.SPADE.combo[k].wind, 'quicker than the hammer');
  assert.ok(T.combo.reduce((a, s) => a + s.dmg, 0) > M.BLADE.combo.reduce((a, s) => a + s.dmg, 0) && T.combo[0].dmg < M.SPADE.combo[0].dmg);
});
test('narrow: it finds what is on its line and far off; it misses what is low at his feet or over his head, which the sword\'s cut would find', () => {
  const mk = (x, y, h = 1.2) => ({ alive: true, d: { ai: 'none', w: 0.8, h, fly: true }, x, y, hp: 9, st: 'idle', flash: 0, home: { x, y } });
  const P = { x: 10, y: 5, face: 1 };
  const far = mk(13.4, 6.4), low = mk(11.2, 4.9, 0.5), high = mk(11.2, 8.4); strikeEnemies({ list: [far, low, high] }, P, M.TOOTH.reach, 2, [], false, M.TOOTH);
  assert.ok(far.hp < 9, 'at chest height, three metres off'); assert.equal(low.hp, 9, 'low at his feet: missed'); assert.equal(high.hp, 9, 'over his head: missed');
  const far2 = mk(13.4, 6.4), low2 = mk(11.2, 4.9, 0.5); strikeEnemies({ list: [far2, low2] }, P, M.BLADE.reach, 1, []); assert.equal(far2.hp, 9, 'the sword does not reach that far'); assert.ok(low2.hp < 9, 'but finds what is low');
});
test('the dive on the tooth throws him back up, with his second jump and his dash again', () => {
  const P = M.newPlayer(10, 20); Object.assign(P, { weapon: 'tooth', dive: { t: 0.2 }, vy: -21, grounded: false, airJumps: 0, airDash: 0 }); const y = P.y;
  M.pogo(P); assert.equal(P.dive, null); assert.ok(P.vy > 8, 'upward'); assert.equal(P.airJumps, 1); assert.equal(P.airDash, 1); assert.equal(P.airTop, y, 'the fall before it does not count');
  assert.ok(M.POGO.height >= 3 && M.POGO.height <= 4.5); const m = src('main.js'); assert.ok(m.includes('=== SPIKES) spikes = true'), 'spikes under the point count'); assert.ok(m.includes('if (seen.size || spikes || boss){ pogo(P);'));
});
test('the Wyrm leaves the tooth; the glide is the Seated\'s, in a prize chest behind him; a save from before keeps its glide', () => {
  const t = ST.TEACH[2]; assert.equal(t.arm, 'tooth'); assert.ok(!t.can && t.name && TE.ICONS[t.icon]); assert.equal(ST.TEACH[0].arm, 'spade');
  for (const l of [t.does, ...t.how, ...(t.more || [])]) assert.ok(l.length <= 110, l);
  const A = ST.ABILITY.glide; assert.ok(A && A.can === 'glide' && A.name && TE.ICONS[A.icon]); assert.ok(!ST.TEACH.some(k => k.can === 'glide'), 'no keeper leaves the glide');
  assert.deepEqual(R.arrival(3), ['breaker', 'dash', 'glide']); assert.deepEqual(R.GIFTS, ['breaker', 'dash', 'glide', 'grip']);
  const L = { ...R.loadLevel(2) }, room = L.rooms.find(r => r.name === 'seated'), ch = L.marks.filter(m => m.type === 'chest' && m.holds === 'gift:glide'); assert.equal(ch.length, 1); assert.equal(ch[0].prize, 'sat');
  assert.ok(ch[0].x >= room.tx0 && ch[0].x < room.tx1 && ch[0].y >= room.ty0 && ch[0].y < room.ty1, 'in his room'); assert.equal(room.gate, 'dash', 'which is behind the air dash');
  const none = R.graph(3, ['breaker', 'dash']), g = R.goalOf(R.LEVEL.marks), near = R.nearGoal(g); let got = false; for (const k of none.seen){ const i = k % none.W, j = (k - i) / none.W; if (near(i, j)){ got = true; break; } } assert.ok(!got, 'the Tempest is not crossed without it');
  globalThis.localStorage.getItem = k => k === 'climb-side' ? JSON.stringify({ level: 3, top: 3, beat: [true, true, true] }) : null; const G = ST.loadSave(); globalThis.localStorage.getItem = () => null; assert.equal(G.can.glide, 1);
  assert.ok(src('main.js').includes("if ((b(2) || (DEV && LEVEL.index > 2)) && !armed('tooth') && !GIFTING)"), 'and gains the tooth');
});
