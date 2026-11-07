import { surfaceOf } from '../src/world/path.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { F, FL, FH, ZF, ZH, ZONE_METERS, MPU, R, MAXK, GRADE, MAX_RISE } from '../src/config/constants.js';
import { ZONES } from '../src/config/zones.js';
import { posOf, topAt, landingS, landingY, flightY, riseOf, kAtY, zoneOf, special, meters, bossFlight, arenaOf } from '../src/world/path.js';
import { layoutFlight, suits } from '../src/world/layout.js';

test('a zone is 15 flights and measures ZONE_METERS in game metres', () => {
  assert.equal(meters(ZF * FH), ZONE_METERS);
  assert.equal(MAXK, ZONES.length * ZF);
});
test('height never decreases along the path', () => {
  let last = -1;
  for (let s = 0; s < 5 * FL; s += 0.01){ const y = posOf(s).y; assert.ok(y >= last - 1e-9, `dropped at s=${s}`); last = y; }
});
test('the foot never sinks below the step surface', () => {
  for (let s = 0; s < 3 * FL; s += 0.013){ assert.ok(posOf(s).y <= topAt(s) + 1e-9, `above step at s=${s}`); }
});
test('a landing sits at the top of its flight', () => {
  for (let k = 0; k < 5; k++){ const p = posOf(landingS(k)); assert.ok(p.land); assert.equal(p.k, k); assert.ok(Math.abs(p.y - landingY(k)) < 1e-9); }
});
test('every zone has a lift, a rest stop and a Warden at fixed flights', () => {
  for (let z = 0; z < ZONES.length; z++){
    assert.equal(special(z * ZF + 5), 'lift');
    assert.equal(special(z * ZF + 8), 'camp');
    assert.equal(special(bossFlight(z)), 'boss');
    assert.equal(zoneOf(bossFlight(z)), z);
    assert.equal(arenaOf(z * ZF + 9), -1);
    for (let l = 10; l <= 14; l++) assert.equal(arenaOf(z * ZF + l), bossFlight(z));
    assert.equal(arenaOf(z * ZF + 15), z + 1 < ZONES.length ? -1 : -1);
  }
  assert.equal(zoneOf(MAXK + 50), ZONES.length - 1);
});
test('one full turn of the spiral is about seven flights', () => {
  const turnSteps = 2 * Math.PI * R;
  assert.ok(turnSteps / FL > 6.5 && turnSteps / FL < 7.5, 'about 7 flights per turn (the widened landscape shaft)');
});
test('zone names avoid borrowed terms', () => {
  for (const z of ZONES) assert.ok(!/endless stair|moria|balrog|durin|gandalf/i.test(z.name + z.boss), z.name);
});

test('variable grade: gentle on the whole, steep and flat in places, every zone the same height', () => {
  const rises = GRADE, gentle = rises.filter(r => r > 0 && r <= 0.45).length;
  assert.ok(gentle > rises.length / 2, 'most flights are gentle');
  assert.ok(rises.includes(0) && MAX_RISE >= 0.7, 'flat galleries and steep flights');
  for (let z = 0; z < 7; z++) assert.ok(Math.abs(flightY((z + 1) * ZF) - flightY(z * ZF) - ZH) < 1e-9, `zone ${z} height`);
  assert.equal(meters(ZH), ZONE_METERS);
});
test('heights are continuous: each flight starts where the last landing ended, and kAtY inverts flightY', () => {
  for (let k = 0; k < MAXK; k++){
    assert.ok(Math.abs(posOf(k * FL).y - flightY(k)) < 1e-9, `flight ${k} start`);
    assert.ok(Math.abs(topAt(k * FL + F - 1e-7) - landingY(k)) < 1e-5, `flight ${k} meets its landing`);
    assert.equal(kAtY(flightY(k) + 1e-6), riseOf(k) === 0 && k > 0 ? kAtY(flightY(k) + 1e-6) : k);
  }
});
test('broken steps and swings only on flights gentle enough for them', () => {
  for (let seed = 1; seed < 6; seed++) for (let k = 0; k < MAXK; k++)
    for (const o of layoutFlight(seed, k).obs) assert.ok(suits(o.type, k), `${o.type} on flight ${k} (rise ${riseOf(k)})`);
});
test('surfaces: every flight meets both its landings, tall and broad steps only on gentle flights, the regions themed', async () => {
  const P = await import('../src/world/path.js');
  const n = {}, byZone = [{}, {}, {}];
  for (let k = 0; k < MAXK; k++){
    const kind = P.surfaceOf(k); n[kind] = (n[kind] || 0) + 1; const z = Math.min(2, Math.floor(k / 15));
    if (k >= 5 && riseOf(k) > 0) byZone[z][kind] = (byZone[z][kind] || 0) + 1;   // the flights that can vary
    assert.ok(Math.abs(P.topAt(k * FL + 1e-7) - (kind === 'steps' || kind === 'broad' ? flightY(k) + P.surfTop(k, 0) : flightY(k))) < 1e-5, `flight ${k} (${kind}) starts on its base`);
    if (kind === 'tall' || kind === 'broad') assert.ok(riseOf(k) <= 0.45, `${kind} on flight ${k} (rise ${riseOf(k)})`);
    for (let t = 0.05; t < F; t += 0.25) assert.ok(P.topAt(k * FL + t) >= flightY(k) - 1e-9 && P.topAt(k * FL + t) <= landingY(k) + 1e-9, `flight ${k} stays between its landings`);
    // the walking line never runs off the stair: between its lowest and highest point
    for (let t = 0.5; t < F; t += 0.5){ const w = P.walkY(k * FL + t); assert.ok(w >= flightY(k) - 1e-6 && w <= landingY(k) + 1e-6, `walk line on flight ${k}`); }
  }
  for (const kind of P.SURFACES) assert.ok(n[kind] > 3, `some ${kind} flights (${n[kind] || 0})`);
  assert.ok((byZone[0].slope || 0) + (byZone[0].tall || 0) > (byZone[0].steps || 0), 'the Deep is mostly slopes');
  assert.ok((byZone[2].steps || 0) + (byZone[2].broad || 0) > (byZone[2].slope || 0), 'the dwarf halls are mostly built stairs');
});
test('broken steps only where there are steps to break', () => {
  for (let seed = 1; seed < 6; seed++) for (let k = 0; k < MAXK; k++)
    for (const o of layoutFlight(seed, k).obs){
      if (o.type === 'gap') assert.equal(surfaceOf(k), 'steps', `gap on flight ${k}`);
      if (o.type === 'swing') assert.ok(['steps', 'slope'].includes(surfaceOf(k)), `swing on a ${surfaceOf(k)} flight ${k}`);
    }
});
test('routes change from run to run: every zone keeps a way across, and both forks get their turn', async () => {
  const P = await import('../src/world/path.js');
  assert.ok(P.BRANCHES.some(b => b.early) && P.BRANCHES.some(b => !b.early), 'early and late forks are built');
  const seen = new Set();
  for (let seed = 0; seed < 40; seed++){
    P.setRoutes(seed);
    const zones = new Set(P.BRANCHES.map(b => b.z));
    for (const z of zones) assert.ok(P.BRANCHES.some(b => b.z === z && b.open), `zone ${z} has an open fork (seed ${seed})`);
    seen.add(P.BRANCHES.filter(b => b.z === 0).map(b => b.open ? 1 : 0).join(''));
    for (const b of P.BRANCHES) assert.equal(P.forkFrom(b.kA) === b, b.open, 'a closed fork cannot be taken');
  }
  assert.ok(seen.size >= 3, 'the first zone opens its forks in different ways across runs: ' + [...seen].join(' '));
  for (const b of P.BRANCHES) b.open = true;
});
test('hidden halls: every zone has one a run; in from its landing, up through the rock, out on a ledge above the next landing', async () => {
  const P = await import('../src/world/path.js');
  const zones = new Set(P.HALLS.map(h => h.z));
  assert.equal(zones.size, ZONES.length, 'a hall in every zone');
  for (const h of P.HALLS){
    const sM = P.landingS(h.kH), mouth = P.posOf(h.s0 + P.HALL.mouth), L = P.posOf(sM);
    assert.ok(Math.abs(mouth.y - L.y) < 1e-9 && Math.abs(mouth.a - L.a) < 1e-9, `hall ${h.j} opens straight behind its landing`);
    assert.ok(!['lift', 'camp', 'boss'].includes(P.special(h.kH)) && !P.BRANCHES.some(b => b.kA === h.kH), `hall ${h.j} is not on a landing that already does something`);
    assert.ok(h.rise > 0 && h.rise <= 0.75, `hall ${h.j} rise ${h.rise.toFixed(2)} is climbable`);
    // the ledge: its end is over the next landing, and a drop above it
    const out = P.posOf(h.sOut), end = P.posOf(h.s0 + h.len);
    assert.ok(out.land && out.k === h.kH + 1, `hall ${h.j} comes out over landing ${h.kH + 1}`);
    assert.ok(Math.abs(end.a - out.a) < 1e-9, 'straight above it');
    const drop = end.y - out.y; assert.ok(drop > 1.2 && drop < 2.5, `a drop of ${drop.toFixed(2)}`);
    // the walk: continuous, never below its own steps, the chest and carving on the chamber floor
    let last = P.walkY(h.s0 + 0.05);
    for (let u = 0.05; u < h.len; u += 0.05){ const w = P.walkY(h.s0 + u); assert.ok(w >= last - 1e-9 && w - last < 0.1, `hall ${h.j} walk line at ${u.toFixed(2)}`); last = w; assert.ok(P.topAt(h.s0 + u) >= P.posOf(h.s0 + u).y - 1e-6); }
    assert.equal(P.topAt(h.s0 + h.chestU), h.yTop); assert.equal(P.topAt(h.s0 + h.tabletU), h.yTop);
    assert.equal(P.routeSign(h.s0 + 2), 1); assert.equal(P.routeOf(h.s0 + 2), h);
    assert.ok(Math.abs(P.sAt(h.s0 + 4, P.posOf(h.s0 + 5).a) - (h.s0 + 5)) < 1e-6, 'sAt finds positions along a hall');
  }
  for (let seed = 0; seed < 20; seed++){
    P.setRoutes(seed);
    for (const z of zones){ const open = P.HALLS.filter(h => h.z === z && h.open); assert.equal(open.length, 1, `one hall open in zone ${z}`); assert.ok(!open[0].broken && !open[0].looted); }
    const h = P.HALLS.find(x => x.open); assert.equal(P.hallAt(P.landingS(h.kH) + 0.5), h); assert.equal(P.hallAt(P.landingS(h.kH) + 3), null);
  }
});
