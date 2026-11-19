// Teaching (phase 3, docs/phase3-sheet.md): the opening rooms ask for each move, and a hint comes up only when he
// struggles; the keys shown are his device's; the cards keep to the writing rules.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clock } from './helpers/browser.mjs';
const { loadLevel, T } = await import('./helpers/reach.mjs');
const TE = await import('../src/side/teach.js');
const { RELICS, TEACH } = await import('../src/side/state.js');
const LV = await import('../src/side/level.js');
const M = await import('../src/side/motor.js'), I = await import('../src/core/input.js');
const { DEFAULTS } = await import('../src/core/settings.js');

const fresh = (opt = {}) => { const G = {}, OPT = { hints: true, ...opt }; let saved = 0; return { G, OPT, T: TE.makeTeach(G, OPT, () => saved++), saved: () => saved }; };
const P0 = (x = 5, y = 1) => ({ x, y, vx: 0, vy: 0, grounded: true, hp: 5, roll: 0, atk: null, crouch: false });
const open = () => false;

test('every lesson names a real key on every device', () => {
  for (const kind of ['keys', 'xbox', 'ps', 'touch']) for (const [id, show] of Object.entries(TE.LESSONS)) for (const [a] of show){
    const k = TE.keyName(a, kind, DEFAULTS); assert.ok(k && k !== '-' && !/undefined/.test(k), `${id} on ${kind}: ${a} -> ${k}`); }
  assert.equal(TE.keyName('jump', 'keys', DEFAULTS), 'SPACE'); assert.equal(TE.keyName('move', 'keys', DEFAULTS), 'A D'); assert.equal(TE.keyName('attack', 'keys', DEFAULTS), 'CLICK');
  assert.equal(TE.keyName('jump', 'xbox', DEFAULTS), 'A'); assert.equal(TE.keyName('jump', 'ps', DEFAULTS), 'CROSS'); assert.equal(TE.keyName('down', 'touch', DEFAULTS), 'DRAG DOWN');
  assert.equal(TE.fill('{down} + {attack}, in the air.', a => TE.keyName(a, 'keys', DEFAULTS)), 'S + CLICK, in the air.');
});

test('standing still at the start brings up MOVE; moving puts it away for good', () => {
  const { T, G } = fresh(); const P = P0();
  for (let k = 0; k < 90; k++) T.step(1 / 20, { P, held: {}, solidAt: open, onPlank: open });   // four seconds and more
  assert.equal(T.shown() && T.shown().id, 'move');
  P.x += 2; for (let k = 0; k < 20; k++) T.step(1 / 20, { P, held: {}, solidAt: open, onPlank: open });
  assert.equal(T.shown(), null); assert.ok(G.taught.move);
});

test('nothing is shown with hints off, and nothing he already does', () => {
  const a = fresh({ hints: false }); const P = P0();
  for (let k = 0; k < 120; k++) a.T.step(1 / 20, { P, held: {}, solidAt: open, onPlank: open }); assert.equal(a.T.shown(), null);
  const b = fresh(); b.T.event({ type: 'jump' }, { P }); assert.ok(b.T.known('jump'));
  b.T.event({ type: 'hurt', msg: 'Spikes' }, { P }); assert.equal(b.T.shown(), null, 'he already jumps: the spikes bring up nothing');
});

test('a hint is given at most three times', () => {
  const { T, G } = fresh(); const P = P0();
  for (let n = 0; n < 4; n++){ T.event({ type: 'hurt', msg: 'Bitten' }, { P }); for (let k = 0; k < 200; k++) T.step(1 / 20, { P, held: {}, solidAt: open, onPlank: open, busy: true }); }
  assert.equal(G.taughtShown.block, 3); assert.ok(G.taught.block, 'retired after three');
});

test('blocking once brings the parry hint at the next wind-up; with the spade, neither', () => {
  const { T } = fresh(); const P = P0();
  T.event({ type: 'block' }, { P }); assert.ok(!T.known('block'), 'a creature turning his blow is not his block');
  T.event({ type: 'block', mine: true }, { P }); T.event({ type: 'tell' }, { P }); assert.equal(T.shown().id, 'parry');
  const b = fresh(); const Q = { ...P0(), weapon: 'spade' }; b.T.event({ type: 'hurt', msg: 'Bitten' }, { P: Q }); assert.equal(b.T.shown(), null);
});

test('the opening rooms ask for each lesson', () => {
  const L = loadLevel(0), room = n => L.rooms.find(r => r.name === n), tile = (i, j) => L.tiles[j * L.W + i];
  const inRoom = (r, fn) => { for (let j = Math.round(r.y0 / T); j < Math.round(r.y1 / T); j++) for (let i = Math.round(r.x0 / T); i < Math.round(r.x1 / T); i++) if (fn(i, j)) return true; return false; };
  assert.ok(inRoom(room('corridor'), (i, j) => tile(i, j) === LV.SPIKES), 'the corridor has its spike pit (jump)');
  assert.ok(L.marks.some(m => m.type === 'crawler' && m.x >= room('corridor').x0 && m.x < room('corridor').x1), 'and a crawler alone (cut, block)');
  // (the map pass: the Roots' way up has no planks left, so the first room no longer asks for dropping through one. The
  // first he meets is the lamplighter's step, behind Ordric's room; the hint comes the first time he stands on any)
  assert.ok(inRoom(room('corridor'), (i, j) => tile(i, j) === LV.LEDGE), 'the first plank is in the corridor (drop through)');
  assert.ok(L.marks.some(m => m.type === 'thread' && m.x >= room('start').x0 / T && m.x < room('start').x1 / T && m.y - room('start').y0 / T >= 10), 'the start has a thread set high (the second jump)');
  // the tunnel: somewhere the gap is too low to stand in and high enough to crouch through
  const r = room('tunnel'); let low = false;
  for (let i = Math.round(r.x0 / T); i < Math.round(r.x1 / T) && !low; i++) for (let j = Math.round(r.y0 / T); j < Math.round(r.y1 / T); j++){
    if (tile(i, j) === 0 || tile(i, j + 1) !== 0) continue; let h = 0; while (tile(i, j + 1 + h) === 0 && h < 10) h++;
    if (h * T >= M.BODY.crouch && h * T < M.BODY.stand && tile(i, j + 1 + h) === LV.ROCK){ low = true; break; } }
  assert.ok(low, 'the tunnel has its low stretch (crouch, or roll)');
});

test('walking into the tunnel\'s low stretch, upright, brings up CROUCH', () => {
  loadLevel(0); I.release(); const { T: Te } = fresh(); const P = M.newPlayer(7.5, 18.5);
  for (let f = 0; f < 30; f++){ M.stepPlayer(P, 1 / 120); clock.t += 1 / 120; }   // settle
  I.hold('right', true); P.events.length = 0;
  for (let f = 0; f < 360; f++){ M.stepPlayer(P, 1 / 120); clock.t += 1 / 120; Te.step(1 / 120, { P, held: I.IN.held, solidAt: LV.solidAt, onPlank: open }); for (const e of P.events.splice(0)) Te.event(e, { P, solidAt: LV.solidAt }); if (Te.shown()) break; }
  I.release(); assert.equal(Te.shown() && Te.shown().id, 'crouch', `at ${(P.x / T).toFixed(1)}, ${(P.y / T).toFixed(1)}`);
});

// the writing rules (docs/writing.md): short, plain, and never the theme
const THEME = /\b(grace|faith|sin|salvation|redemption|heaven|god|anxiety|fear|worry|panic|peace|calm)\b/i;
test('the cards and hints keep to the writing rules', () => {
  const lines = [...Object.values(RELICS).map(r => r.line), ...TEACH.filter(t => t.name).flatMap(t => [t.does, ...t.how]), ...Object.values(TE.CARDS).flatMap(c => [c.does, ...c.how]), ...Object.values(TE.INTRO), ...Object.values(TE.LESSONS).flat().map(([, w]) => w)];
  for (const l of lines){ assert.ok(!THEME.test(l), `says the theme: ${l}`); assert.ok(l.length <= 110, `too long (${l.length}): ${l}`); }
  for (const id of Object.keys(RELICS)) assert.ok(TE.ICONS[id], `a picture for ${id}`);
  for (const t of TEACH.filter(t => t.name)) assert.ok(TE.ICONS[t.icon], `a picture for ${t.name}`);
  for (const c of Object.values(TE.CARDS)) assert.ok(TE.ICONS[c.icon], `a picture for ${c.title}`);
  for (const [n, rows] of Object.entries(TE.ICONS)) assert.ok(rows.length <= 16 && rows.every(r => r.length <= 16), `${n} fits 16 x 16`);
});
