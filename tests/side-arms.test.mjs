// His weapons (motor.js BLADE, SPADE): every swing names a drawing he has, with its light map, and the moment it lands
// falls inside that drawing. motor.js needs a page to import, so its text is read.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const src = readFileSync(new URL('../src/side/motor.js', import.meta.url), 'utf8');
const meta = JSON.parse(readFileSync(new URL('../assets/side/mask_tall_c/sprite.json', import.meta.url), 'utf8'));
const swings = [...src.matchAll(/\{ dmg: (\d+)[^}]*anim: '(\w+)', hit: ([\d. /]+)/g)].map(m => ({ dmg: +m[1], anim: m[2], hit: Function(`return ${m[3]}`)() }));

test('every swing names a drawing he has, lit, landing inside it', () => {
  assert.ok(swings.length >= 6, 'the blade and the spade');
  for (const s of swings){
    const A = meta.anims[s.anim]; assert.ok(A, `no drawing ${s.anim}`); assert.equal(A.n, 1, `${s.anim} has no light map`);
    assert.ok(s.hit > 0 && s.hit < 1, `${s.anim} lands outside its drawing`);
  }
});
test('the spade: a whole weapon. Three slow blows, the last with a wave; further than the blade, no guard, it digs', () => {
  const spade = /export const SPADE = \{[^]*?\] \};/.exec(src)[0], blade = /export const BLADE = \{[^]*?dash: \{[^}]*\} \};/.exec(src)[0];
  assert.ok(+/reach: ([\d.]+)/.exec(spade)[1] > +/reach: ([\d.]+)/.exec(blade)[1], 'reaches further than the blade');
  assert.match(spade, /guard: false/); assert.match(spade, /digs: true/); assert.doesNotMatch(blade, /digs/, 'the blade breaks no stone');
  const sw = [...spade.matchAll(/\{ dmg: (\d+), wind: ([\d.]+)[^}]*\}/g)]; assert.equal(sw.length, 3, 'three blows');
  assert.match(sw[2][0], /wave: true/, 'the last sends a wave'); assert.ok(+sw[2][1] > +sw[0][1], 'and hits hardest');
  const bw = [...blade.matchAll(/\{ dmg: \d+, wind: ([\d.]+)/g)].slice(0, 3); assert.ok(sw.every((m, k) => +m[2] > +bw[k][1]), 'each slower to land than the blade\'s');
  // (build 89: the hammer's whole set, made from one picture of him holding it. He holds it in every drawing where a
  // weapon shows; each blow's drawing is one he has, and lands inside its strip)
  for (const a of ['hm_idle', 'hm_run', 'hm_air', 'hm_land', 'hm_crouch', 'hm_crouch_walk', 'hm_roll', 'hm_hurt', 'hm_atk1', 'hm_atk2', 'hm_atk3', 'hm_plunge', 'receive']) assert.ok(meta.anims[a] && meta.anims[a].n, `his drawing ${a}`);
  for (const m of spade.matchAll(/anim: '(\w+)', hit: (\d+) \/ (\d+)/g)){ const A = meta.anims[m[1]]; assert.ok(A, m[1]); assert.equal(A.frames, +m[3], `${m[1]}: the blow is counted in its own frames`); assert.ok(+m[2] < +m[3]); }
  assert.ok(!Object.keys(meta.anims).some(a => /^(spade_|atk_spade)/.test(a)), 'the spade\'s drawings are gone');   // (bk_spade_*: the hammer on his back, build 96)
  const feet = new Set(['hm_idle', 'hm_run', 'hm_atk1', 'hm_atk3', 'hm_roll'].map(a => meta.anims[a].foot + ':' + meta.anims[a].cx)); assert.equal(feet.size, 1, 'every strip stands him in the same place');
});
