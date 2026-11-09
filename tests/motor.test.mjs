import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TUNE } from '../src/config/tuning.js';
import { MAX_RISE_FOR } from '../src/world/layout.js';
const MV = TUNE.move;

// The motor's jump arc, as motor.js flies it (it needs a page to import): gravity eased in after take-off, the hang at
// the top while held, the cut when let go, heavier falling. Returns the arc as heights over time.
const ease = (t, e) => MV.launch.at + (1 - MV.launch.at) * Math.min(1, t / e);
function launchSpeed(height, e){
  const rise = v0 => { let v = v0, y = 0, t = 0; const h = 1 / 480; while (v > 0){ let g = MV.gravityUp * ease(t, e); if (Math.abs(v) < MV.apexBand) g *= MV.apexMul; v -= g * h; y += v * h; t += h; } return y; };
  let lo = 0, hi = 30; for (let i = 0; i < 40; i++){ const m = (lo + hi) / 2; if (rise(m) < height) lo = m; else hi = m; }
  return hi;
}
function fly({ air = false, holdFor = Infinity, until = -Infinity } = {}){
  const e = air ? MV.launch.air : MV.launch.ground, h = 1 / 240;
  let v = launchSpeed(air ? MV.airJumpHeight : MV.jumpHeight, e), y = 0, t = 0, top = 0;
  while (t < 3){
    const held = t < holdFor;
    let g = v > 0 ? MV.gravityUp * ease(t, e) : MV.gravityDown;
    if (held && Math.abs(v) < MV.apexBand) g *= MV.apexMul;
    if (!held && v > 0 && t > MV.minHop) v *= Math.pow(MV.cutMul, h * 20);
    v = Math.max(-MV.maxFall, v - g * h); y += v * h; t += h; top = Math.max(top, y);
    if (v < 0 && y <= until) break;
  }
  return { top, t };
}

test('a held jump rises jumpHeight; the double jump adds most of another', () => {
  assert.ok(Math.abs(fly().top - MV.jumpHeight) < 0.03, 'held jump ' + fly().top.toFixed(2));
  assert.ok(Math.abs(fly({ air: true }).top - MV.airJumpHeight) < 0.03);
  assert.ok(MV.jumpHeight + MV.airJumpHeight > 2.6, 'the two together reach well above his own height');
});
test('the jump pops, then floats: the launch is quicker to its first half than a plain arc', () => {
  // with gravity eased in, the first half of the rise comes sooner than the same height under full gravity from the start
  const e = MV.launch.ground, v = launchSpeed(MV.jumpHeight, e), vPlain = Math.sqrt(2 * MV.gravityUp * MV.jumpHeight);
  assert.ok(v < vPlain, 'a slower launch reaches the same height: gravity is lighter at take-off');
  assert.ok(MV.launch.air > MV.launch.ground, 'the double jump floats longer');
});
test('a full jump clears a broken step going uphill', () => {
  const { t } = fly({ until: MAX_RISE_FOR.gap * 2 });   // landing on the stair risen under it, on the steepest flight a broken step may be on
  assert.ok(MV.run * t > 1.4, `covers ${(MV.run * t).toFixed(2)} units`);
});
test('the quickest tap still hops high enough to clear a set of jaws', () => {
  const { top } = fly({ holdFor: 0 });
  assert.ok(top > 0.7, `the quickest tap rises ${top.toFixed(2)}`);
  assert.ok(top < MV.jumpHeight * 0.8, 'and a tap is clearly lower than a held jump');
});
test('fast from the first step, stopping on a coin; no sprint', () => {
  assert.ok(MV.run / MV.accel < 0.12, `top speed in ${(MV.run / MV.accel).toFixed(3)} s`);
  assert.ok(MV.run / MV.decel < 0.12);
  assert.equal(MV.sprint, undefined);
  assert.ok(MV.run * MV.crouchMul < 1.8, 'a crouch-walk is still a creep');
});
test('air control is stronger than on the ground at first and fades over a long fall, never to nothing', () => {
  assert.ok(MV.airAccel > 30 && MV.airFloor > 0.2 && MV.airFade > 1);
});
test('the roll is invulnerable for most of its length, outruns a run, and can be cut short near its end', () => {
  const R = MV.roll;
  assert.ok(R.iframeTo - R.iframeFrom >= R.time * 0.6); assert.ok(R.cooldown > 0);
  assert.ok(R.speed * R.time > 1.8, 'a roll carries under a beam');
  assert.ok(R.speed > MV.run);
  assert.ok(R.cancel > 0 && R.cancel < 0.6 && R.time * (1 - R.cancel) >= R.iframeFrom + 0.15, 'cut short only once it has carried him');
});
test('the plunge comes down faster than any fall and soaks a little of the drop', () => {
  assert.ok(MV.dive.speed > MV.maxFall && MV.dive.soak > 0 && MV.dive.soak < MV.fallSafe * 2 && MV.dive.radius > 1);
});
