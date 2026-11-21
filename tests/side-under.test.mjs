// Deep water bears him up until he has the Wyrm's wind: he cannot go under it, by any means (build 79). A playtest
// found a way: a slam begun while floating was never ended; it held him still, and a leap out of the water then
// became the slam again, seven metres straight down, to the floor of the water and under the arch it was there to
// bar. Here: every way of coming at every deep water of every level, without the wind. He is never under for more
// than a moment, and never left held.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clock } from './helpers/browser.mjs';
const R = await import('./helpers/reach.mjs'); const { T, LEVELS } = R;
const M = await import('../src/side/motor.js'), I = await import('../src/core/input.js'), LV = await import('../src/side/level.js');

const slamFloat = t => { I.hold('down', t > 2 && t < 2.4); if (Math.abs(t - 2.2) < 0.006) I.tap('attack'); };
const leap = t => { if (Math.abs(t - 2.6) < 0.006) I.tap('jump'); I.hold('jump', t > 2.6 && t < 3); };
const WAYS = {
  'falling in': () => {},
  'a slam from the air': t => { I.hold('down', true); if (Math.abs(t - 0.05) < 0.006) I.tap('attack'); },
  'a slam while floating': slamFloat,
  'slams again and again': t => { I.hold('down', true); if (Math.floor(t * 4) !== Math.floor((t - 1 / 60) * 4)) I.tap('attack'); },
  'a slam while floating, then a leap': t => { slamFloat(t); leap(t); },
  'a slam, a leap, and swimming right': t => { slamFloat(t); leap(t); I.hold('right', t > 2.7); },
  'a slam, a leap, and swimming left': t => { slamFloat(t); leap(t); I.hold('left', t > 2.7); },
  'a leap and a slam, again and again': t => { const u = t % 1.2; if (t > 2 && u < 0.02) I.tap('jump'); I.hold('jump', t > 2 && u < 0.3); I.hold('down', t > 2 && u > 0.25); if (t > 2 && Math.abs(u - 0.4) < 0.01) I.tap('attack'); },
  'the ember slam while floating': (t, P) => { if (Math.abs(t - 2.2) < 0.006) M.startArt(P, 'slam'); },
  'the ember slam, then a leap': (t, P) => { if (Math.abs(t - 2.2) < 0.006) M.startArt(P, 'slam'); leap(t); },
  'the ember slam from the air': (t, P) => { if (Math.abs(t - 0.05) < 0.006) M.startArt(P, 'slam'); },
};
// his body has room at (x, y): no rock in it
const open = (x, y) => { for (let yy = y + 0.05; yy < y + M.BODY.stand; yy += 0.4) for (const xx of [x - M.BODY.hw, x, x + M.BODY.hw]) if (LV.tileAt(Math.floor(xx / T), Math.floor(yy / T)) === 1) return false; return true; };
for (let N = 0; N < LEVELS.length; N++){
  const L0 = { ...LV.loadLevel(N) }; if (!(L0.waters || []).some(w => w.y1 - w.y0 > M.SWIM.float + 1.2)) continue;
  test(`${LEVELS[N].name}: without the Wyrm's wind he cannot get under its deep water, and no slam leaves him held in it`, () => {
    R.graph(N, ['breaker', 'dash']); const L = LV.LEVEL;
    for (const w of L.waters){ if (w.y1 - w.y0 <= M.SWIM.float + 1.2) continue;
      for (const fx of [0.5, 0.2, 0.85]) for (const up of [1.5, 9]) for (const [name, way] of Object.entries(WAYS)){
        const x = w.x0 + (w.x1 - w.x0) * fx; if (!open(x, w.y1 + up) || !open(x, w.y1 - 0.5) || LV.waterOver(x, w.y1 + up) != null) continue;   // (only from where he could be: open air, over open water; not a water with another over it)
        I.release(); clock.t += 10; const P = M.newPlayer(x, w.y1 + up); let t = 0, under = 0, worst = 0, deepest = 0;
        for (let f = 0; f < 480; f++){ way(t, P); for (let k = 0; k < 2; k++){ M.stepPlayer(P, 1 / 120); clock.t += 1 / 120; t += 1 / 120; } I.endFrame(); P.events.length = 0;
          const top = LV.waterOver(P.x, P.y + 0.05), d = top != null ? top - P.y : 0; if (d > M.SWIM.float + 1){ under += 1 / 60; deepest = Math.max(deepest, d); } else under = 0; worst = Math.max(worst, under); }
        assert.ok(worst < 0.5, `${name}, into the water at ${x.toFixed(0)},${w.y1.toFixed(0)}: under it for ${worst.toFixed(2)} s, ${deepest.toFixed(1)} deep (it bears him at ${M.SWIM.float})`);
        I.release(); const x0 = P.x; for (let f = 0; f < 60; f++){ I.hold('right', true); for (let k = 0; k < 2; k++){ M.stepPlayer(P, 1 / 120); clock.t += 1 / 120; } I.endFrame(); P.events.length = 0; } const x1 = P.x; for (let f = 0; f < 60; f++){ I.hold('right', false); I.hold('left', true); for (let k = 0; k < 2; k++){ M.stepPlayer(P, 1 / 120); clock.t += 1 / 120; } I.endFrame(); P.events.length = 0; } I.release();
        assert.ok(!P.dive, `${name}: a slam is still on him`); assert.ok(Math.abs(x1 - x0) > 0.2 || Math.abs(P.x - x1) > 0.2 || !open(P.x - 0.9, P.y) || !open(P.x + 0.9, P.y), `${name}, at ${x.toFixed(0)},${w.y1.toFixed(0)}: he is held at ${P.x.toFixed(1)},${P.y.toFixed(1)}, and cannot move`); } }
  });
}
