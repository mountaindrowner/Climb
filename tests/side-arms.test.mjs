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
test('the spade: one heavy swing, further than the blade, no guard, it digs; and its standing drawing', () => {
  const spade = /export const SPADE = \{[^]*?\] \};/.exec(src)[0], blade = /export const BLADE = \{ name: '[^']+', reach: ([\d.]+)/.exec(src);
  assert.ok(+/reach: ([\d.]+)/.exec(spade)[1] > +blade[1], 'reaches further than the blade');
  assert.match(spade, /guard: false/); assert.match(spade, /digs: true/);
  assert.equal((spade.match(/dmg:/g) || []).length, 1, 'one swing, no combo');
  assert.ok(meta.anims.spade_idle && meta.anims.spade_idle.n, 'he stands with it');
});
