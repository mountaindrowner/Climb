import { test } from 'node:test';
import assert from 'node:assert/strict';
import { burstChance, CAMP, GOLD } from '../src/config/economy.js';
import { WEAPONS } from '../src/config/weapons.js';
import { ZONES } from '../src/zones/index.js';

test('the pouch burst chance climbs with height and caps', () => {
  assert.equal(burstChance(0), CAMP.burstBase);
  assert.equal(burstChance(40), CAMP.burstBase + 10);
  assert.equal(burstChance(10000), CAMP.burstCap);
});
test('Warden gold rises per zone', () => {
  for (let z = 1; z < ZONES.length; z++) assert.ok(GOLD.warden(z) > GOLD.warden(z - 1));
});
test('every weapon has reach and a combo of complete swings', () => {
  for (const w of Object.values(WEAPONS)){
    assert.ok(w.reach > 0 && w.combo.length >= 2);
    for (const sw of w.combo){ assert.ok(sw.dmg > 0 && sw.wind > 0 && sw.active > 0 && sw.rec > 0 && sw.lunge >= 0); assert.ok(['slash', 'back', 'chop', 'thrust'].includes(sw.pose)); }
    // a combo's last hit is its heaviest
    assert.ok(w.combo[w.combo.length - 1].dmg >= w.combo[0].dmg);
  }
});
test('every zone names a moveset and a threat pool', () => {
  for (const z of ZONES){ assert.ok(z.warden); assert.ok(z.threats.length > 0); assert.ok(z.glow && z.bg && z.stone); }
});
