import { test } from 'node:test';
import assert from 'node:assert/strict';
import { F, FL } from '../src/config/constants.js';
import { TUNE } from '../src/config/tuning.js';
import { landingY, flightY, topAt, special, BRANCHES } from '../src/world/path.js';
import { switchbackOf, platformLedges, platformFlights, setDecks, DECKS, HOLES, holeFlights, stairHole, decksAt, TURN, MANTLE, LEDGE } from '../src/world/decks.js';

const JUMP = TUNE.move.jumpHeight, REACH = JUMP + MANTLE;    // feet at the top of a jump, and hands above them
const HEAD = 2.1;                                           // a standing man, for headroom
// can a man running at full speed get from a surface across a gap onto one dy higher? A jump carries ~3 units at his
// run (5.5) landing a unit up; the double jump (since 0.28) lifts his feet near 2.9, his hands near 4.9: these limits
// leave a wide margin under that
function reach(gap, dy){ return (dy <= 1.0 && gap <= 2.0) || (dy <= 2.4 && gap <= 1.6) || (dy <= REACH - 0.1 && gap <= 0.7) || (dy <= 0 && gap <= 2.6); }

test('every switchback: its first ledge hangs over the fork landing, high enough to walk under and low enough to catch', () => {
  assert.ok(BRANCHES.filter(b => switchbackOf(b.kA)).length >= 10, 'a switchback at most forks');
  for (const b of BRANCHES){
    const sw = switchbackOf(b.kA); if (!sw) continue;
    const L1 = sw.ledges[0], yA = landingY(b.kA);
    assert.ok(L1.top - LEDGE.thick >= yA + HEAD + 0.2, `fork ${b.kA}: a man walks under its first ledge`);
    assert.ok(L1.top - yA <= REACH - 0.1, `fork ${b.kA}: a jump from the landing catches it (${(L1.top - yA).toFixed(2)})`);
  }
});
test('every switchback: each ledge can be reached from the last, clear of the stair below and above, and the last waits under its gap', () => {
  for (const b of BRANCHES){
    const sw = switchbackOf(b.kA); if (!sw) continue;
    const L = sw.ledges;
    for (let i = 1; i < L.length; i++){
      const a = L[i - 1], c = L[i], gap = a.s0 - c.s1, dy = c.top - a.top;
      assert.ok(gap > 0 && reach(gap, dy), `fork ${b.kA} ledge ${i}: gap ${gap.toFixed(2)}, rise ${dy.toFixed(2)}`);
    }
    for (const d of L){
      for (let s = d.s0; s <= d.s1; s += 0.1){
        assert.ok(d.top - LEDGE.thick >= topAt(s) + HEAD - 0.05 || stairHole(s), `fork ${b.kA}: a man on the stair below walks under the ledge at ${s.toFixed(1)}`);
        if (!d.last) assert.ok(d.top + LEDGE.headroom <= topAt(s + TURN) - 1.4 + 1e-6, `fork ${b.kA}: a man on the ledge at ${s.toFixed(1)} clears the stair a turn above`);
      }
    }
    const last = L[L.length - 1], h = sw.hole;
    assert.ok(last.last && last.s0 >= h.s0 - TURN && last.s1 <= h.s1 - TURN, `fork ${b.kA}: the last ledge is under the gap`);
    const up = topAt(h.s1 + 0.05) - last.top;
    assert.ok(up > 0.5 && up < JUMP - 0.2, `fork ${b.kA}: a jump from the last ledge comes up through the gap (${up.toFixed(2)} to the stair above)`);
    const hk = Math.floor(h.s0 / FL); assert.ok(h.s0 - hk * FL > 0.5 && h.s1 - hk * FL < F - 0.5 && !special(hk - 1), `fork ${b.kA}: its gap breaks a flight's steps, not a landing`);
    assert.ok(h.s1 - h.s0 <= 1.7, 'and a man on the stair above can jump it');
  }
});
test('every platforming flight can be crossed: from the landing below, ledge to ledge, to the landing above', () => {
  for (let seed = 1; seed < 30; seed++) for (const k of platformFlights(seed, false)){
    const L = platformLedges(seed, k); assert.ok(L.length >= 2, `flight ${k}: ledges`);
    let e = k * FL, y = flightY(k);
    for (const d of L){ assert.ok(reach(d.s0 - e, d.top - y), `seed ${seed} flight ${k}: gap ${(d.s0 - e).toFixed(2)} rise ${(d.top - y).toFixed(2)}`); assert.ok(d.s1 - d.s0 >= 0.8 && d.s1 <= k * FL + F); e = d.s1; y = d.top; }
    assert.ok(reach(k * FL + F - e, landingY(k) - y), `seed ${seed} flight ${k}: onto its landing (gap ${(k * FL + F - e).toFixed(2)}, rise ${(landingY(k) - y).toFixed(2)})`);
  }
});
test('a climb\'s decks: platforming flights keep away from forks, the stair is broken where they are, and nothing is built for practice', () => {
  for (const b of BRANCHES) b.open = true;
  setDecks(4242, false);
  assert.ok(DECKS.length > 50 && HOLES.length > 5);
  for (const h of HOLES){ assert.ok(stairHole((h.s0 + h.s1) / 2)); assert.ok(holeFlights().has(h.k)); }
  for (const h of HOLES.filter(x => x.platform)) assert.ok(!BRANCHES.some(b => Math.abs(b.kA - h.k) <= 1), `platforming flight ${h.k} beside a fork`);
  const d = DECKS[0]; assert.ok(decksAt((d.s0 + d.s1) / 2).includes(d));
  setDecks(4242, true); assert.equal(DECKS.length, 0); assert.equal(HOLES.length, 0);
});
