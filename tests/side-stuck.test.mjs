// Nowhere to be stuck (phase 1): a playtest found him wedged in a rock block by Corwen's desk, pushed into it by a
// crawler. Three guards: a creature's shove stops at rock; if he is ever inside rock he is put out of it; and every
// place in every region he could stand is one he can get out of (the stuck-finder, tests/helpers/stuck.mjs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clock } from './helpers/browser.mjs';
const { pockets } = await import('./helpers/stuck.mjs');
const { LEVELS, loadLevel, T } = await import('./helpers/reach.mjs');
const M = await import('../src/side/motor.js'), I = await import('../src/core/input.js');
// (build 107: the Roots moved east and up for their west wing. What these name is given as it was, and moved with them)
const R0 = loadLevel(0), DX = R0.X0, DY = R0.Y0, row = P => Math.round(P.y / T) - DY;
const rockAt = (x, y) => { const L = loadLevel(0); return L.tiles[Math.floor(y / T) * L.W + Math.floor(x / T)] === 1; };
const inRock = P => { for (let y = P.y + 0.02; y < P.y + M.BODY.crouch; y += 0.1) for (const x of [P.x - M.BODY.hw + 0.01, P.x, P.x + M.BODY.hw - 0.01]) if (rockAt(x, y)) return true; return false; };

test('a creature cannot push him into rock (the block by Corwen, in the Roots)', () => {
  loadLevel(0); const P = M.newPlayer((16.2 + DX) * T, (48 + DY) * T);   // just left of the block at tiles 17-20
  assert.ok(!inRock(P), 'he starts clear');
  const all = M.shove(P, (18.5 + DX) * T);   // shoved into the block
  assert.equal(all, false, 'the shove stops short'); assert.ok(!inRock(P), 'and he is not in the rock');
});
test('if he is ever in rock, he is put out of it', () => {
  loadLevel(0); I.release(); const P = M.newPlayer((19 + DX) * T, (48 + DY) * T);   // in the middle of the block
  for (let f = 0; f < 4; f++){ M.stepPlayer(P, 1 / 120); clock.t += 1 / 120; }
  assert.ok(!inRock(P), `out at ${(P.x / T).toFixed(2)}, ${(P.y / T).toFixed(2)}`);
  const away = P.x < (19 + DX) * T ? 'left' : 'right';   // away from the block, whichever side he was put
  I.hold(away, true); const x0 = P.x; for (let f = 0; f < 120; f++){ M.stepPlayer(P, 1 / 120); clock.t += 1 / 120; } I.release();
  assert.ok(Math.abs(P.x - x0) > 0.5, `and he can move (put at ${(x0 / T).toFixed(2)}; walked ${away} to ${(P.x / T).toFixed(2)})`);
});
for (let n = 0; n < LEVELS.length; n++){
  test(`${LEVELS[n].name}: nowhere he could stand that he cannot leave`, () => {
    const p = pockets(n);
    assert.deepEqual([...p], [], `pockets: ${p.map(q => `${q.room} ${q.x},${q.y}`).join('; ')}`);
  });
}

// planks (phase 1, from the playtest): caught anywhere along them from below, and never caught on the way down
const sim = (x, y, prog, frames = 160) => { loadLevel(0); I.release(); clock.t += 10; const P = M.newPlayer((x + DX) * T, (y + DY) * T + 0.01), ev = new Set(), order = []; let t = 0;
  for (let f = 0; f < frames; f++){ prog(t, P); for (let s = 0; s < 2; s++){ M.stepPlayer(P, 1 / 120); clock.t += 1 / 120; t += 1 / 120; } for (const e of P.events){ ev.add(e.type); order.push(e.type); } I.endFrame(); P.events.length = 0; }
  I.release(); return { P, ev, order }; };
test('a jump under the middle of a plank his hands reach hauls him up onto it', () => {
  const { P, ev } = sim(104.5, 2, t => { if (t < 0.01) I.tap('jump'); I.hold('jump', t < 0.6); });   // the Pithead's deck at row 9 (tiles 95-105), from the floor under it
  assert.ok(ev.has('mantle'), 'he caught it'); assert.equal(row(P), 10, 'and stands on it');
});
// taking an edge is for the way up (build 77, from a playtest: among shelves close together he hauled himself onto every
// lip he passed). The well's first shelf, in the Roots: its lip at tile 145, its top at row 57; the boulder under it at 140-141
test('jumping toward an edge and pressing toward it, he takes it', () => {
  const { P, ev } = sim(141, 52, t => { if (t < 0.01) I.tap('jump'); I.hold('jump', t < 0.6); I.hold('right', true); });   // from the boulder, across three clear tiles
  assert.ok(ev.has('mantle'), 'he took the edge'); assert.equal(row(P), 57, 'and stands on the shelf');
});
test('coming down past an edge, pressing toward it, he does not take it', () => {
  for (const [x, y, why] of [[144.2, 56, 'falling beside the lip, a tile under its top'], [143.2, 59, 'falling from over it']]){
    const { P, ev } = sim(x, y, t => { I.hold('right', why === 'falling from over it' ? t > 0.12 : true); });
    assert.ok(!ev.has('mantle'), `${why}: he took the edge`); assert.equal(row(P), 48, `${why}: he comes down to the floor`);
  }
});
test('stepping off an edge is a fall from the start: no edge is taken on the way', () => {
  const P = M.newPlayer((141 + DX) * T, (52 + DY) * T + 0.01); assert.ok(P.topT >= M.GRAB.top, 'he begins as one who is not rising');
});
test('dropping through a plank, he does not catch the next one on the way down', () => {
  // standing on a rung of the Pithead's ladder (row 16) a moment, then down and jump (through it), steering as he falls to the rung at 11
  const { order } = sim(87, 17, t => { I.hold('down', t > 0.2 && t < 0.45); if (Math.abs(t - 0.25) < 0.006) I.tap('jump'); I.hold('left', t > 0.3); });
  const from = order.indexOf('dropThrough'), to = order.indexOf('land', from);
  assert.ok(from >= 0 && to > from, 'he dropped through and landed'); assert.ok(!order.slice(from, to).includes('mantle'), 'and caught nothing on the way down');
});
