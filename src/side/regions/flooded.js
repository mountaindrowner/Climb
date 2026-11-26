// The Flooded Levels: the third of the Deep (docs/world.md, docs/phase16-sheet.md). Under the Workings' cistern, down
// its sump. At six hundred metres the guild cut into water; it took four levels in a night. Deep water (level.js
// waters, motor.js SWIM): it bears him up, and with the Wyrm's wind it carries him under, so he cannot come in here
// without it (needs). It is dark, and the lit part of it is under the water: the guild's lamps that went under still
// burn there, green. It goes down: he comes in at the top.
//   sump       two screens, one over the other: the drowned shaft from the cistern's floor, and at its foot the first
//              air: the raising water (a stand-pipe), and Hob
//   pockets    two screens: domes of trapped air, the water in the floor of each, joined under their walls. Rafts. The Sunk
//   drowned    three screens: a whole gallery under water to its roof. Its lamps. Blind eels. The Sunk
//   chapel     the chapel of the shift, flooded. The lamp on its altar, burning under the water: travel through the water
//   pumphouse  two screens: the Pump, the level's keeper. It moves the water (RULE.tide)
//   overflow   two screens: where the water goes down a stair into the dark. A relic. The way down into the Vein
import { room, rect, door, ledge, mark, EMPTY, STILLED } from '../rooms.js';

const mass = (cw = 1, ch = 1) => { const r = room(cw, ch); rect(r, 0, 0, r.w - 1, r.h - 1); return r; };
const filler = draw => { const r = room(); draw(r); r.filler = true; return r; };
function solid(){ return filler(r => { rect(r, 0, 0, 39, 22); }); }
const deco = (r, kind, x, y) => mark(r, 'deco', x, y, { kind });
const keep = (r, x, y) => mark(r, 'keep', x, y);
const up = (r, x0, x1, ys) => { for (const y of ys) ledge(r, x0, x1, y); };
// a guild lamp in the air, unlit (he lights it); one under the water, still lit; a body of deep water (deep: its top
// is under rock or more water, and has no line drawn along it)
const lamp = (r, x, y) => mark(r, 'glamp', x, y);
const dl = (r, x, y) => mark(r, 'dlamp', x, y);
const water = (r, x, y, w, h, more) => mark(r, 'water', x, y, { w, h, ...more });

function sump(){
  const r = mass(1, 2);
  // the drowned shaft, from the cistern's floor; at its foot a gallery east; then the first air: a chamber, and a
  // shelf of rock in it, dry
  rect(r, 5, 4, 14, 45, EMPTY); rect(r, 5, 4, 24, 9, EMPTY); rect(r, 18, 4, 37, 20, EMPTY); rect(r, 25, 4, 37, 11);
  door(r, 'right', 12, 17);
  water(r, 5, 4, 10, 42, { deep: true }); water(r, 15, 4, 10, 8);
  mark(r, 'pass', 5, 38, { w: 10, h: 8, to: 6, at: 'sump' }); mark(r, 'arrive', 9, 30, { name: 'top' });
  mark(r, 'spawn', 26, 12);
  // the level's raising water: a stand-pipe the guild drove into the flood
  rect(r, 28, 11, 33, 11, EMPTY); mark(r, 'pool', 28, 11, { w: 6, look: 'pipe' });
  mark(r, 'npc', 36, 12, { who: 'hob' });
  lamp(r, 27, 18); lamp(r, 35, 18); dl(r, 6, 36); dl(r, 13, 25); dl(r, 6, 14); dl(r, 20, 7);
  mark(r, 'urn', 34, 12);
  for (const y of [8, 14, 20, 26, 32, 38, 42]) for (const x of [6, 9, 12]) keep(r, x, y);
  for (const x of [8, 12, 16, 20, 23]) keep(r, x, 6);
  for (let x = 19; x <= 36; x += 3) for (const y of [13, 16]) keep(r, x, y);
  return r;
}
function pockets(){
  const r = mass(2, 1); rect(r, 2, 4, 77, 20, EMPTY); door(r, 'left', 12, 17);
  // the landing, dry; the walls between the domes, each going down into the water (he goes under it); and in the last
  // dome's floor, the winze down to the drowned level
  rect(r, 2, 4, 9, 11);
  for (const x of [20, 40, 60]) rect(r, x, 10, x + 2, 20);
  rect(r, 68, 0, 73, 3, EMPTY);
  water(r, 2, 0, 76, 12);
  mark(r, 'raft', 30, 12, { w: 6 }); mark(r, 'raft', 50, 12, { w: 6 });
  mark(r, 'sunk', 31, 4); mark(r, 'sunk', 51, 4); mark(r, 'sunk', 64, 4);
  ledge(r, 53, 59, 17); mark(r, 'chest', 56, 18, { holds: 'thread' });   // (out from the pillar, since the map pass: it hung a tile short of it)
  lamp(r, 13, 18); lamp(r, 31, 19); lamp(r, 49, 19); lamp(r, 69, 19); dl(r, 21, 7); dl(r, 41, 7); dl(r, 61, 7);
  mark(r, 'urn', 4, 12); mark(r, 'urn', 7, 12);
  for (let x = 4; x <= 76; x += 4) for (const y of [6, 14, 17]) if (!(x < 10 && y < 12) && !(y > 9 && [20, 40, 60].includes(x))) keep(r, x, y);
  for (const x of [69, 72]) for (const y of [1, 3]) keep(r, x, y);
  return r;
}
function drowned(){
  const r = mass(3, 1); rect(r, 2, 2, 117, 20, EMPTY); door(r, 'top', 108, 113); door(r, 'bottom', 14, 19); door(r, 'bottom', 60, 65);
  water(r, 0, 0, 120, 23, { deep: true });
  // the rail along it, and the carts where they stopped
  for (const x of [26, 46, 78, 96]) ledge(r, x, x + 6, 5);
  for (let x = 8; x <= 112; x += 13) dl(r, x, 16);
  mark(r, 'sunk', 23, 2); mark(r, 'sunk', 42, 2); mark(r, 'sunk', 74, 2); mark(r, 'sunk', 92, 2);
  mark(r, 'eel', 36, 20); mark(r, 'eel', 70, 2); mark(r, 'eel', 86, 20); mark(r, 'eel', 103, 2);
  mark(r, 'chest', 5, 2, { holds: 'shards' }); mark(r, 'urn', 115, 2); mark(r, 'urn', 54, 2); mark(r, 'crystal', 10, 2); mark(r, 'crystal', 100, 2);
  for (let x = 4; x <= 116; x += 4) for (const y of [8, 12, 17]) keep(r, x, y);
  return r;
}
function chapel(){
  const r = mass(); rect(r, 2, 2, 37, 20, EMPTY); door(r, 'top', 14, 19);
  // the altar, and two benches; the shift's lamp on the altar
  rect(r, 16, 2, 23, 4); ledge(r, 5, 10, 4); ledge(r, 29, 34, 4);
  water(r, 0, 0, 40, 23, { deep: true });
  deco(r, 'shiftlamp', 19, 5); dl(r, 6, 15); dl(r, 33, 15);
  mark(r, 'chest', 33, 2, { holds: 'thread' }); mark(r, 'urn', 6, 2); mark(r, 'crystal', 12, 2);
  for (let x = 4; x <= 36; x += 4) for (const y of [8, 12, 17]) keep(r, x, y);
  return r;
}
// the pump-house: where its hall's floor is (the row he stands on), and how wide the hall is either side of the Pump
export const HALL = { floor: 8, x0: 34, x1: 77, pump: 56 };
function pumphouse(){
  const r = mass(2, 1); door(r, 'top', 20, 25);
  // the intake: a trunk down from the drowned level, always full; under a wall at its foot, a trench on the hall's side,
  // always full too. Then the hall, its floor above the trench's water: dry at low water, drowned at high
  rect(r, 19, 2, 26, 20, EMPTY); rect(r, 27, 2, 33, 7, EMPTY); rect(r, 30, 2, 77, 20, EMPTY); rect(r, HALL.x0, 2, HALL.x1, HALL.floor - 1);
  // the grate over the overflow, in the hall's floor: shut until the Pump runs free
  rect(r, 70, 0, 75, 7, EMPTY); rect(r, 70, 6, 75, 7, STILLED); ledge(r, 70, 75, 3);
  water(r, 19, 2, 11, 21, { deep: true }); water(r, 30, 2, 40, 19, { key: 'tide', up: HALL.floor - 2 }); water(r, 70, HALL.floor, 8, 13, { key: 'tide' });
  mark(r, 'pump', HALL.pump, HALL.floor); mark(r, 'valve', 49, 9, { n: 0 }); mark(r, 'valve', 56, 14, { n: 1 }); mark(r, 'valve', 63, 18, { n: 2 });
  mark(r, 'sunk', 31, 2, { drawn: true }); mark(r, 'sunk', 32, 2, { drawn: true });
  lamp(r, 40, 18); lamp(r, 67, 18); dl(r, 22, 12); dl(r, 28, 5);
  for (let x = 36; x <= 76; x += 4) for (const y of [10, 14, 18]) keep(r, x, y);
  for (const y of [5, 10, 15, 19]) for (const x of [20, 23, 25]) keep(r, x, y);
  for (const x of [28, 31, 33]) for (const y of [3, 6]) keep(r, x, y);
  return r;
}
function overflow(){
  const r = mass(2, 1); rect(r, 2, 2, 77, 20, EMPTY); door(r, 'top', 70, 75); door(r, 'bottom', 12, 16);
  // the stair the water goes down: twelve steps, from under the grate down to the west
  for (let k = 0; k < 12; k++) rect(r, 20 + k * 4, 2, 77, 2 + k);
  up(r, 70, 75, [17, 21]);
  mark(r, 'pass', 12, 0, { w: 5, h: 3, to: 7, at: 'overflow', gate: 'still' });
  mark(r, 'chest', 6, 2, { holds: 'relic:shiftbell' }); mark(r, 'shrine', 41, 8);
  deco(r, 'spill', 44, 9); lamp(r, 28, 12); lamp(r, 58, 18); mark(r, 'urn', 24, 4); mark(r, 'urn', 9, 2); mark(r, 'crystal', 4, 2);
  for (let x = 4; x <= 76; x += 4) for (const y of [16, 19]) keep(r, x, y);
  for (const x of [4, 8, 12, 16]) for (const y of [4, 8]) keep(r, x, y);
  r.after = true;
  return r;
}

// ---- its look: the Workings' cut rock gone green and black under the water
const themeDef = {
  stone: { edge: 'ink', topEdge: 'teal', lip: 'moss0', lip2: 'teal', lipD: 2, lip2D: 3, a: 'dark', aSeam: 'deep', b: 'deep', bSeam: 'ink', c: 'ink', core: 'ink', seam: 'strata', band: [7, 13, 18] },
  moss: { c: ['moss0', 'teal', 'moss0'], p: 0.22 }, plank: ['wood1', 'wood3', 'wood0', 'wood2'], spike: ['light', 'pale'],
  ceilLow: [['chain', 4], ['stalactite', 3]], ceil: [['chain', 30], ['root', 16], ['stalactite', 14]],
  floorWall: ['rubble', 'bones', 'rubble', 'crystal'], floorOpen: ['rubble', 'bones', 'rubble'], gem: 'crystal',
  back: { cols: ['ink', 'ink', 'deep'], dim: [0.6, 0.62, 0.76], hole: 99, holeOpen: 99, stand: [['pillar', 4], ['arch', 2]], hang: [['chain', 40], ['root', 24], ['stalactite', 20]], pStand: 0.01, pHang: 0.022 },
  far: { img: 'workings', raw: true }, hemi: [0xbfffe0, 0x2a4a50, 0.5], shaft: null, bloom: [0.7, 0.8],
  amb: [0.1, 0.14, 0.14], mist: { col: 'deep', col2: 'ink', a: 0.24, drift: 0.05 }, fore: 'roots',
  air: { n: 46, cols: [0x9fffd0, 0xbfe8ff], warm: 0.1, vx: 0.03, vy: [0.02, 0.09] },
};
const decoDef = (px, PAL) => ({
  // the shift's lamp, on the altar: a guild lamp set down, not hung, and lit
  shiftlamp(g, x, y){ px(g, PAL.ink, x - 4, y - 14, 8, 14); px(g, '#63c74d', x - 3, y - 12, 6, 9); px(g, '#d8ffb0', x - 1, y - 10, 2, 5); px(g, '#a8f070', x - 2, y - 9, 4, 3); px(g, PAL.ink, x - 5, y - 2, 10, 2); px(g, '#3e8948', x - 4, y - 14, 8, 1); px(g, PAL.ink, x - 1, y - 17, 2, 3); },
  // where the water goes down the stair: a worn channel cut in its steps
  spill(g, x, y){ for (let k = 0; k < 6; k++){ px(g, '#0099db', x - 40 + k * 14, y - 2 + k * 3, 12, 2); px(g, '#2ce8f5', x - 40 + k * 14, y - 3 + k * 3, 10, 1); px(g, '#ffffff', x - 36 + k * 14, y - 3 + k * 3, 3, 1); } },
});

// ---- who is in it
const three = () => { const T3 = typeof window !== 'undefined' && window.THREE; return T3 && T3.Group && T3.CanvasTexture && typeof document !== 'undefined' ? T3 : null; };
const pix = (T3, w, h, paint) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); paint((col, x, y, ww, hh) => { g.fillStyle = col; g.fillRect(x, y, ww, hh); }); const t = new T3.CanvasTexture(c); t.magFilter = t.minFilter = T3.NearestFilter; t.generateMipmaps = false; return t; };
const mesh = (T3, map, w, h, more = {}) => new T3.Mesh(new T3.PlaneGeometry(w, h), new T3.MeshBasicMaterial({ map, transparent: true, alphaTest: 0.5, ...more }));
const disc = (f, cx, cy, r, col) => { for (let y = -r; y <= r; y++){ const half = Math.floor(Math.sqrt(r * r - y * y)); f(col, cx - half, cy + y, half * 2 + 1, 1); } };
let TEX = null;
const texes = T3 => TEX || (TEX = {
  seg: pix(T3, 8, 8, f => { disc(f, 4, 4, 3, '#181425'); disc(f, 4, 4, 2, '#3e8948'); f('#63c74d', 3, 2, 2, 1); }),
  head: pix(T3, 12, 10, f => { f('#181425', 0, 1, 12, 8); f('#3e8948', 1, 2, 10, 6); f('#63c74d', 1, 2, 10, 2); f('#181425', 8, 5, 4, 1); f('#ffffff', 9, 6, 1, 2); f('#ffffff', 11, 6, 1, 2); f('#d8ffb0', 2, 3, 2, 1); }),
  wheel: pix(T3, 22, 22, f => { disc(f, 11, 11, 10, '#181425'); disc(f, 11, 11, 9, '#b86f50'); disc(f, 11, 11, 6, '#181425'); disc(f, 11, 11, 5, '#262b44'); f('#b86f50', 10, 2, 2, 18); f('#b86f50', 2, 10, 18, 2); disc(f, 11, 11, 2, '#feae34'); f('#feae34', 4, 4, 2, 2); f('#feae34', 16, 16, 2, 2); }),
  wheelOff: pix(T3, 22, 22, f => { disc(f, 11, 11, 10, '#181425'); disc(f, 11, 11, 9, '#3a4466'); disc(f, 11, 11, 6, '#181425'); f('#3a4466', 10, 4, 2, 9); f('#3a4466', 5, 13, 9, 2); }),
  body: pix(T3, 56, 72, f => { f('#181425', 4, 20, 48, 52); f('#3a4466', 6, 22, 44, 48); f('#5a6988', 6, 22, 44, 3); f('#262b44', 6, 60, 44, 10); for (let y = 30; y < 60; y += 10) for (const x of [10, 44]) f('#8b9bb4', x, y, 2, 2);
    f('#181425', 20, 0, 16, 22); f('#b86f50', 22, 2, 12, 20); f('#feae34', 22, 2, 3, 20); f('#743f39', 31, 2, 3, 20); f('#181425', 16, 36, 24, 20); f('#0b2a2e', 18, 38, 20, 16); f('#63c74d', 24, 42, 8, 8); f('#d8ffb0', 26, 44, 4, 4); }),
  beam: pix(T3, 112, 8, f => { f('#181425', 0, 0, 112, 8); f('#b86f50', 1, 1, 110, 6); f('#feae34', 1, 1, 110, 2); f('#743f39', 1, 5, 110, 2); f('#181425', 53, 0, 6, 8); f('#ffffff', 55, 2, 2, 3); }),
  rod: pix(T3, 10, 16, f => { f('#181425', 0, 0, 10, 16); f('#8b9bb4', 1, 0, 8, 16); f('#c0cbdc', 2, 0, 2, 16); f('#5a6988', 7, 0, 2, 16); }),
  foot: pix(T3, 42, 12, f => { f('#181425', 0, 0, 42, 12); f('#5a6988', 1, 1, 40, 10); f('#8b9bb4', 1, 1, 40, 2); f('#262b44', 1, 8, 40, 3); for (let x = 4; x < 40; x += 6) f('#181425', x, 9, 2, 2); }),
});
// the Sunk: how near, over it, he must pass for it to rise; how fast it comes; how near it takes hold; how long it rests
export const SUNK = { sees: 5, speed: 2.3, grab: 0.8, rest: 1.3, far: 15 };
// a blind eel: how far it feels the water move, how fast he must be going for it to feel him, the strike (its speed, how
// far it goes), the moment of warning, its way back, and its rest
export const EEL = { feel: 7.5, fast: 3.6, strike: 19, reach: 14, tell: 0.3, back: 5, rest: 1.7, bite: 0.75 };
// the Pump: its tide (low water, the turn, high water: seconds, at its first pace), how much quicker with each valve
// broken, its piston (the warning, how wide the blow, the rest between), a valve's strength
export const PUMP = { low: 4.4, turn: 2.2, high: 4.8, quick: [1, 0.82, 0.66], tell: 0.85, half: 1.25, rest: 1.5, valve: 6 };

const enemies = {
  // the Sunk: what was a miner, lying on the bottom. It rises at whoever passes over it. It cannot leave the water
  sunk: { ai: 'sunk', hp: 3, w: 0.6, h: 2.0, color: 0x9fd0b0, art: 'px_sunk', fly: false, word: 'Dragged at', onHit(e){ e.woke = true; } },
  // a blind eel, in its hole. It feels the water move
  eel: { ai: 'eel', own: true, noAim: true, hp: 2, w: 0.5, h: 0.6, color: 0x63c74d, fly: false, word: 'Struck by an eel', onHit(e){ e.hit = true; } },
  // a valve of the Pump: a wheel on its body
  valve: { ai: 'valve', own: true, hp: PUMP.valve, w: 0.7, h: 1.4, color: 0xb86f50, fly: false, word: '', onHit(e){ e.spin = 1; }, spawn(e, c){ if (c.RULE.still) e.alive = false; } },
  // the Pump: the level's keeper. It cannot be struck: it is fought by its valves
  pump: { ai: 'pump', own: true, noAim: true, wakeful: true, hp: 3, w: 1.6, h: 4.4, color: 0x5a6988, fly: false, name: 'The Pump', word: 'Crushed', guard(){ return true; }, spawn(e, c){ if (c.RULE.still) e.alive = false; } },
};
const ai = {
  sunk(e, P, dt, c){
    const K = SUNK, dx = P.x - e.x, dy = P.y - e.y, wet = (x, y) => !c.waterAt || !!c.waterAt(x, y); e.fr = e.fr || 0;
    if (e.st === 'rest'){ c.anim(e, 'attack', 0.9); if (e.tm >= K.rest) c.go('rise'); return; }
    if (e.st !== 'rise'){
      if (e.st !== 'idle') c.go('idle');
      // back to where it lay: along, then down
      if (Math.abs(e.x - e.home.x) > 0.1){ const s = Math.sign(e.home.x - e.x), nx = e.x + s * Math.min(Math.abs(e.home.x - e.x), 1.6 * dt); if (!c.solidAt(nx + s * 0.3, e.y + 0.4)) e.x = nx; else e.y += 1.2 * dt; e.face = s; }
      else if (e.y > e.home.y) e.y = Math.max(e.home.y, e.y - 1.4 * dt);
      else if (e.y < e.home.y) e.y = e.home.y;
      c.anim(e, 'stand', 0);
      // (one the Pump's intake draws in, `drawn`, lies still until it is drawn)
      if (e.woke || (!(e.mk && e.mk.drawn) && P.wet && Math.abs(dx) < K.sees && dy > -1.5 && dy < 10 && wet(e.x, e.y + 2.2))){ e.woke = true; c.go('rise'); c.events.push({ type: 'notice', e }); }
      return;
    }
    if (Math.hypot(dx, dy) > K.far || !wet(e.x, e.y + 1.2)){ e.woke = false; c.go('idle'); return; }
    e.face = Math.sign(dx) || e.face;
    const L = Math.hypot(dx, dy) || 1, sx = dx / L * K.speed * dt, sy = dy / L * K.speed * dt;
    if (!c.solidAt(e.x + sx + Math.sign(sx) * 0.3, e.y + 0.4) && !c.solidAt(e.x + sx + Math.sign(sx) * 0.3, e.y + 1.6) && wet(e.x + sx, e.y + 1.9)) e.x += sx;
    if (!c.solidAt(e.x, e.y + sy + (sy > 0 ? 2 : 0)) && (sy < 0 || wet(e.x, e.y + sy + 1.9))) e.y += sy;
    e.fr = (e.fr + dt * 0.8) % 1; c.anim(e, 'walk', e.fr);
    if (Math.abs(dx) < K.grab && dy > -1.6 && dy < 1.8 && !c.isRollInv(P) && c.hurt(P, 1, e.x, e.d.word)) c.go('rest');
  },
  eel(e, P, dt, c){
    const K = EEL, hx = e.home.x, hy = e.home.y + 0.3; if (e.hx == null){ e.hx = hx; e.hy = hy; e.ux = 0; e.uy = 0; }
    const dx = P.x - hx, dy = P.y + 1.2 - hy, dist = Math.hypot(dx, dy), speed = Math.hypot(P.vx || 0, P.vy || 0);
    if (e.hit && e.st === 'idle'){ e.hit = false; }
    if (e.st === 'tell'){ if (e.tm >= K.tell){ c.go('strike'); e.bit = false; e.run = 0; } }
    else if (e.st === 'strike'){ const step = K.strike * dt, nx = e.hx + e.ux * step, ny = e.hy + e.uy * step; e.run += step;
      if (c.solidAt(nx, ny) || e.run >= K.reach || (c.waterAt && !c.waterAt(nx, ny))) c.go('back'); else { e.hx = nx; e.hy = ny; }
      if (!e.bit && Math.hypot(P.x - e.hx, P.y + 1.2 - e.hy) < K.bite && !c.isRollInv(P)){ e.bit = true; c.hurt(P, 1, e.hx - e.ux, e.d.word); } }
    else if (e.st === 'back'){ const L = Math.hypot(hx - e.hx, hy - e.hy), k = Math.min(L, K.back * dt); if (L < 0.05){ e.hx = hx; e.hy = hy; c.go('rest'); } else { e.hx += (hx - e.hx) / L * k; e.hy += (hy - e.hy) / L * k; } }
    else if (e.st === 'rest'){ if (e.tm >= K.rest) c.go('idle'); }
    else { if (e.st !== 'idle') c.go('idle');
      // it feels the water move: he is in it, near, and going fast. One who carries the Shift Bell it does not feel
      if (P.wet && dist < K.feel && dist > 0.6 && speed > K.fast && !(c.SIDE && c.SIDE.bell)){ e.ux = dx / dist; e.uy = dy / dist; c.go('tell'); c.events.push({ type: 'tell', e }); } }
    // where it can be struck: its head
    e.x = e.hx; e.y = e.hy - 0.3; e.face = e.ux < 0 ? -1 : 1;
    const T3 = three(); if (!T3) return;
    if (!e.parts){ const X = texes(T3); e.parts = []; for (let k = 0; k < 9; k++){ const q = mesh(T3, k === 8 ? X.head : X.seg, k === 8 ? 12 / 16 : 0.5, k === 8 ? 10 / 16 : 0.5); c.E.scene.add(q); e.parts.push(q); } }
    const out = Math.hypot(e.hx - hx, e.hy - hy), nx = out > 0.01 ? -(e.hy - hy) / out : 0, ny = out > 0.01 ? (e.hx - hx) / out : 0; e.wig = (e.wig || 0) + dt * (e.st === 'strike' ? 30 : 5);
    e.parts.forEach((q, k) => { const u = k / 8, w = Math.sin(e.wig + k * 0.9) * 0.12 * (1 - Math.abs(u - 0.5)) * Math.min(1, out); q.position.set(hx + (e.hx - hx) * u + nx * w, hy + (e.hy - hy) * u + ny * w, 0.04 + k * 0.0004); q.visible = e.alive !== false && (k === 8 || out > 0.4);
      if (k === 8){ q.rotation.z = out > 0.01 ? Math.atan2(e.hy - hy, e.hx - hx) : 0; q.material.color.setHex(e.flash > 0 || (e.st === 'tell' && Math.sin(e.tm * 60) > 0) ? 0xffffff : 0xdddddd); } });
  },
  valve(e, P, dt, c){
    e.x = e.home.x; e.y = e.home.y; e.st = 'idle'; e.turn = (e.turn || 0) + dt * (0.6 + (e.spin || 0) * 14); e.spin = Math.max(0, (e.spin || 0) - dt * 2);
    if (!e.woke && e.hp < e.d.hp) e.woke = true;
    const T3 = three(); if (!T3) return;
    if (!e.g){ e.g = mesh(T3, texes(T3).wheel, 22 / 16, 22 / 16); c.E.scene.add(e.g); }
    e.g.position.set(e.x, e.y + 0.7, 0.036); e.g.rotation.z = -e.turn; e.g.material.color.setHex(e.flash > 0 ? 0xffffff : 0xdddddd);
  },
  pump(e, P, dt, c){
    const K = PUMP, T3 = three(); e.x = e.home.x; e.y = e.home.y;
    const vs = ((c.E && c.E.list) || []).filter(q => q.type === 'valve'), left = vs.filter(q => q.alive).length; e.hp = Math.max(left, 0.001); e.stage = Math.min(2, vs.length - left);
    const inHall = P.x > e.x - 11.4 && P.x < e.x + 11 && P.y > e.y - 0.6 && P.y < e.y + 7;
    if (!e.woke){ c.RULE.tide = 0; e.clock = 0; if (inHall) e.woke = true; }
    else if (vs.length && left === 0){ c.RULE.tide = 0; c.kill(e, c.events); }
    else {
      // the tide: low water, the turn, high water, the turn
      const q = K.quick[e.stage], a = K.low * q, b = K.turn * q, h = K.high * q, all = a + b + h + b; e.clock = (e.clock || 0) + dt; const u = e.clock % all;
      const raw = u < a ? 0 : u < a + b ? (u - a) / b : u < a + b + h ? 1 : 1 - (u - a - b - h) / b, tide = raw * raw * (3 - 2 * raw);
      if (raw > 0 && !e.rising && u < a + b){ e.rising = true; c.events.push({ type: 'flood', e, at: { x: e.x, y: e.y } }); } if (raw === 0) e.rising = false;
      c.RULE.tide = tide;
      // low water: a piston on where he stands. A warning, then the blow
      if (tide < 0.2 && inHall){ e.pt = (e.pt || 0) + dt; if (!e.aim && e.pt > K.rest * q){ e.aim = { x: Math.max(e.x - 10, Math.min(e.x + 10, P.x)), t: 0, hit: false }; c.events.push({ type: 'tell', e }); } }
      if (e.aim){ e.aim.t += dt; if (e.aim.t >= K.tell && !e.aim.hit){ e.aim.hit = true; c.hit(e.aim.x - K.half, e.y - 0.2, e.aim.x + K.half, e.y + 3.4, e.d.word, e.aim.x); c.events.push({ type: 'thud', e, at: { x: e.aim.x, y: e.y } }); } if (e.aim.t > K.tell + 0.55){ e.aim = null; e.pt = 0; } }
      // high water: the intake draws one of the Sunk in
      if (tide > 0.85 && !e.drew){ e.drew = true; const s = (c.E.list || []).find(q => q.type === 'sunk' && q.alive && q.mk && q.mk.drawn && !q.woke); if (s) s.woke = true; } if (tide < 0.4) e.drew = false;
    }
    if (!T3) return;
    if (!e.parts){ const X = texes(T3), body = mesh(T3, X.body, 3.5, 4.5), beam = mesh(T3, X.beam, 7, 0.5), rod = mesh(T3, X.rod, 10 / 16, 1), foot = mesh(T3, X.foot, K.half * 2 + 0.1, 0.75), warn = new T3.Mesh(new T3.PlaneGeometry(K.half * 2, 0.12), new T3.MeshBasicMaterial({ color: 0xff5060, transparent: true, opacity: 0 })); for (const q of [body, beam, rod, foot, warn]) c.E.scene.add(q); e.parts = { body, beam, rod, foot, warn }; }
    const { body, beam, rod, foot, warn } = e.parts, vis = e.alive !== false, roof = e.y + 6.3;
    e.rock = (e.rock || 0) + dt * (e.woke ? 1.4 / K.quick[e.stage || 0] : 0.25);
    body.position.set(e.x, e.y + 2.25, 0.03); beam.position.set(e.x, e.y + 4.7, 0.034); beam.rotation.z = Math.sin(e.rock) * 0.16;
    // the piston: it hangs at the roof over where it means to fall; at the blow it is on the floor
    const A = e.aim, down = A ? (A.t < K.tell ? 0 : Math.min(1, (A.t - K.tell) / 0.06)) * (A.t > K.tell + 0.3 ? Math.max(0, 1 - (A.t - K.tell - 0.3) / 0.25) : 1) : 0, fy = roof - 0.4 - down * (roof - 0.4 - (e.y + 0.38));
    foot.visible = rod.visible = vis && !!A; warn.visible = vis && !!A && A.t < K.tell;
    if (A){ foot.position.set(A.x, fy, 0.045); rod.scale.y = Math.max(0.05, roof - fy); rod.position.set(A.x, (roof + fy) / 2, 0.044); warn.position.set(A.x, e.y + 0.08, 0.046); warn.material.opacity = 0.35 + 0.35 * Math.sin(A.t * 30); }
    body.visible = beam.visible = vis;
  },
};

export default { name: 'The Flooded Levels', theme: 'flooded', sub: 'four mine levels, flooded in one night', card: '', epithet: '',
  deep: true, dark: true, needs: ['glide'], depth: [-1.3, -0.6], musicOf: 'roots', ambOf: 'roots', vestibule: false,
  seed: 1618033, cols: 3, wear: { sag: 0.4, swell: 0.4, humps: 0.3 },
  layout: [[0, 3, sump, 1, 2], [1, 4, solid], [2, 4, solid], [1, 3, pockets, 2, 1], [0, 2, drowned, 3, 1], [0, 1, chapel], [1, 1, pumphouse, 2, 1], [0, 0, solid], [1, 0, overflow, 2, 1]],
  themeDef, deco: decoDef, enemies, ai };
