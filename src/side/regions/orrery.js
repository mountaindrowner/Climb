// The Orrery Wing: the Firmament's wing, east of the orrery room (docs/world.md, docs/phase14-sheet.md).
// The astronomers' great work: a brass sky, every star on an arm, wound to run forward, to tell the hour the flame
// would come back. It has told it many times. Nine screens, set into the Firmament by level.js (WINGS): three columns
// added to the east.
//   escapement  the first of it: two pallets rising and falling in turn, up to the way on
//   hours       two screens: the floor of hours. It calls an hour, and strikes
//   arms        four screens: the orrery. Three planets on their arms; he rides them
//   almanac     the Almanac: the wing's keeper. It reads the hour and strikes there
//   winding     the winding room: a relic, and a door into the aphelion
// Its rule (level.js movers, motor.js; and the hours here). It all turns, and it keeps time: what moves can be stood
// on and carries him. And what it says is going to happen is wrong, always the same way: it calls an hour, and strikes
// the one after.
import { flue, rect, door, ledge, mark, cave, EMPTY, ROCK, STILLED } from '../rooms.js';

const TITLE = 'THE ORRERY WING';
const named = (fn, more = {}) => { const f = () => { const r = fn(); r.title = TITLE; r.look = 'orrery'; Object.assign(r, more); return r; }; Object.defineProperty(f, 'name', { value: fn.name }); return f; };
const deco = (r, kind, x, y) => mark(r, 'deco', x, y, { kind });
const keep = (r, x, y) => mark(r, 'keep', x, y);
const up = (r, x0, x1, ys) => { for (const y of ys) ledge(r, x0, x1, y); };
const mover = (r, x, y, more) => mark(r, 'mover', x, y, more);

function escapement(){
  const r = cave(); rect(r, 2, 2, 37, 20, EMPTY); door(r, 'left', 8, 12); door(r, 'right', 12, 17);   // in from the orrery room's shelf; out, higher, to the hours
  rect(r, 2, 2, 8, 7); rect(r, 30, 2, 37, 11);
  mover(r, 14, 9, { kind: 'slide', ay: 3, period: 5, ph: 0, w: 5 }); mover(r, 23, 12, { kind: 'slide', ay: 3, period: 5, ph: 0.5, w: 5 });   // the pallets: one up as the other is down
  deco(r, 'escwheel', 19, 2); mark(r, 'torch', 4, 15); mark(r, 'torch', 36, 19); mark(r, 'crystal', 12, 2); mark(r, 'urn', 26, 2);
  for (const x of [3, 5]) for (const y of [9, 11]) keep(r, x, y); for (const x of [34, 36]) for (const y of [13, 16]) keep(r, x, y);
  return r;
}
// the floor of hours: PLATES of them, each so many tiles wide, from tile HOUR0
export const PLATES = 9, PLATE = 6, HOUR0 = 16;
function hours(){
  const r = cave(2, 1); rect(r, 2, 2, 77, 20, EMPTY); door(r, 'left', 12, 17); door(r, 'top', 71, 76); rect(r, 71, 2, 73, 5); rect(r, 74, 2, 77, 9); up(r, 71, 76, [15, 21]); flue(r, 71, 76, 15, 20);   // (two steps of stone and a rung, since the map pass)
  rect(r, 2, 2, 10, 11); rect(r, 11, 2, 12, 7); rect(r, 13, 2, 14, 4);   // in at the head of a stair: from there the whole floor can be watched
  mark(r, 'hours', HOUR0, 2, { n: PLATES, w: PLATE }); deco(r, 'dates', 8, 12);
  mark(r, 'chest', 43, 2, { holds: 'shards' });
  mark(r, 'torch', 4, 19); mark(r, 'torch', 67, 9); mark(r, 'crystal', 70, 2);
  for (const x of [3, 5]) for (const y of [13, 16]) keep(r, x, y);
  return r;
}
// the orrery: its middle, and each planet's arm (in tiles) and time round (seconds)
export const HUB = [40, 22], ARMS = [{ r: 14, period: 14, ph: 0, dir: 1, w: 6 }, { r: 14, period: 14, ph: 0.5, dir: 1, w: 6 }, { r: 7, period: 9, ph: 0.25, dir: -1, w: 5 }];
function arms(){
  const r = cave(2, 2); rect(r, 2, 2, 77, 43, EMPTY); door(r, 'bottom', 71, 76); ledge(r, 71, 76, 1); door(r, 'top', 32, 37);
  for (const a of ARMS) mover(r, HUB[0], HUB[1], { kind: 'arm', ...a });
  rect(r, 35, 2, 45, 4); rect(r, 33, 2, 34, 3); rect(r, 46, 2, 47, 3);   // a mounting block under the hub: from it a planet at the foot of its turn is a short hop up
  ledge(r, 32, 37, 42); flue(r, 32, 37, 42, 43);                    // off the top of the turn, and up to the Almanac (one rung between stone sides, since the map pass: two planks hung there)
  for (let x = 4; x <= 76; x += 3) for (const y of [36, 39, 42]) if (!(y === 42 && x === 31)) keep(r, x, y);   // the roof stays where it was cut: a planet at the top of its turn has his head near it
  rect(r, 2, 22, 12, 22); mark(r, 'chest', 6, 23, { holds: 'thread' });   // at nine o'clock (a shelf of the wall)
  rect(r, 67, 30, 77, 30); mark(r, 'chest', 73, 31, { holds: 'shards' });
  mark(r, 'roller', 20, 2, { lo: -16, hi: 30 }); mark(r, 'roller', 58, 2, { lo: -30, hi: 10 });
  mark(r, 'torch', 4, 10); mark(r, 'torch', 75, 10); mark(r, 'torch', 4, 34); mark(r, 'torch', 75, 38); mark(r, 'crystal', 10, 2); mark(r, 'urn', 64, 2);
  return r;
}
function almanac(){
  const r = cave(); rect(r, 2, 2, 37, 20, EMPTY); door(r, 'bottom', 32, 37); ledge(r, 32, 37, 1); door(r, 'left', 2, 7); rect(r, 0, 2, 1, 7, STILLED);   // the grate to the winding room: shut until the Almanac is
  mark(r, 'almanac', 17, 2, { n: 5, w: 5, from: -12 });
  mark(r, 'torch', 36, 9); mark(r, 'torch', 4, 12);
  for (const x of [3, 5]) keep(r, x, 3);
  return r;
}
function winding(){
  const r = cave(); rect(r, 2, 2, 37, 20, EMPTY); door(r, 'right', 2, 7); door(r, 'left', 2, 7); rect(r, 0, 2, 1, 7, STILLED);   // and a grate on the door into the aphelion: the short way, once the wing is done
  mark(r, 'chest', 14, 2, { holds: 'relic:lastpage' }); deco(r, 'drum', 24, 2);
  mark(r, 'torch', 5, 10); mark(r, 'torch', 34, 10); mark(r, 'crystal', 30, 2);
  for (const x of [3, 5, 34, 36]) keep(r, x, 3);
  return r;
}

// set into the Firmament: three columns to the east of it (as the region counts cells: the orrery room is column 2),
// from the orrery room's row to the aphelion's
export const wing = { right: 3, build(X){
  const or = X.roomOf('orrery'), ap = X.roomOf('aphelion'); if (!or || !ap) return; const row = Math.round((or.ty0 - X.Y0) / 23), col = Math.round((or.tx0 - X.X0) / 40);
  for (let y = or.ty0; y < or.ty0 + 92; y++) for (let x = or.tx1; x < X.W; x++) X.set(x, y, ROCK);   // the wing's own masonry: its rooms are cut into it
  X.addRoom(col + 1, row, named(escapement), { wing: true });
  X.addRoom(col + 2, row, named(hours), { wing: true });
  X.addRoom(col + 2, row + 1, named(arms), { wing: true });
  X.addRoom(col + 2, row + 3, named(almanac), { wing: true });
  X.addRoom(col + 1, row + 3, named(winding), { wing: true, after: true });   // after: behind the Almanac
  const cut = (R, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = R.tx1 - 1; x >= R.tx1 - 6; x--){ if (x < R.tx1 - 2 && X.at(x, R.ty0 + y) !== ROCK) break; X.set(x, R.ty0 + y, EMPTY); } };
  cut(or, 8, 12); cut(ap, 2, 7);                                   // out of the orrery room, from its shelf; and the winding room's door into the aphelion
} };
export const QUIET = ['winding'];

// ---- its look: the Firmament's, in brass
export const looksOf = base => ({ orrery: { ...base, stone: { ...base.stone, a: 'rust', aSeam: 'wood1', b: 'wood1', bSeam: 'dark', c: 'dark', topEdge: 'fire2', lip: 'fire2', lip2: 'rust' },
  floorWall: ['armillary', 'telescope', 'books'], floorOpen: ['armillary', 'telescope'], amb: [0.92, 0.84, 0.74], ambIn: [0.62, 0.54, 0.5], mist: { col: 'rust', col2: 'deep', a: 0.1, drift: 0.05 },
  back: { ...base.back, cols: ['ink', 'deep', 'wood0'], hole: 99, holeOpen: 99 } } });
// ---- what stands in it, painted (a 'deco' mark): x the middle, y the floor
export const decoDef = (px, PAL) => ({
  // the escape wheel: a great toothed wheel on the back wall, and its anchor over it
  escwheel(g, x, y){ const cy = y - 40, R = 26; for (let a = 0; a < 360; a += 3){ const c = Math.cos(a * Math.PI / 180), s = Math.sin(a * Math.PI / 180), tooth = a % 24 < 9 ? 4 : 0; px(g, PAL.ink, Math.round(x + c * (R + tooth)), Math.round(cy + s * (R + tooth)), 2, 2); px(g, PAL.rust, Math.round(x + c * (R - 2)), Math.round(cy + s * (R - 2)), 2, 2); px(g, PAL.fire2, Math.round(x + c * (R - 5)), Math.round(cy + s * (R - 5)), 1, 1); }
    for (let k = 0; k < 6; k++){ const c = Math.cos(k * Math.PI / 3), s = Math.sin(k * Math.PI / 3); for (let q = 4; q < R - 5; q += 2) px(g, PAL.rust, Math.round(x + c * q), Math.round(cy + s * q), 2, 2); } px(g, PAL.ink, x - 4, cy - 4, 8, 8); px(g, PAL.fire2, x - 2, cy - 2, 4, 4); },
  // the hours it has given, cut in the wall: hundreds, all past
  dates(g, x, y, r){ px(g, PAL.ink, x - 16, y - 34, 32, 30); px(g, PAL.rust, x - 15, y - 33, 30, 28); px(g, PAL.fire2, x - 15, y - 33, 30, 1); for (let row = 0; row < 8; row++) for (let k = 0; k < 9; k++){ const n = 1 + Math.floor(r() * 3); for (let q = 0; q < n; q++) px(g, PAL.ink, x - 14 + k * 3 + (q ? 1 : 0), y - 31 + row * 3, 1, 2); if (r() < 0.9) px(g, PAL.ink, x - 14 + k * 3, y - 30 + row * 3, 2, 1); } },
  // the winding drum: the weight's cable on it, the great key in its side
  drum(g, x, y){ px(g, PAL.ink, x - 12, y - 22, 24, 22); px(g, PAL.rust, x - 11, y - 21, 22, 20); for (let b = 0; b < 20; b += 3) px(g, PAL.wood1, x - 11, y - 20 + b, 22, 1); px(g, PAL.fire2, x - 11, y - 21, 22, 1); px(g, PAL.ink, x + 12, y - 14, 10, 4); px(g, PAL.fire2, x + 12, y - 13, 9, 2); px(g, PAL.ink, x + 20, y - 19, 4, 14); px(g, PAL.fire2, x + 21, y - 18, 2, 12); px(g, PAL.ink, x - 14, y - 2, 28, 2); },
});

// ---- who is in it
const three = () => { const T3 = typeof window !== 'undefined' && window.THREE; return T3 && T3.Group && T3.CanvasTexture && typeof document !== 'undefined' ? T3 : null; };
const pix = (T3, w, h, paint) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); paint((col, x, y, ww, hh) => { g.fillStyle = col; g.fillRect(x, y, ww, hh); }); const t = new T3.CanvasTexture(c); t.magFilter = t.minFilter = T3.NearestFilter; t.generateMipmaps = false; return t; };
const mesh = (T3, map, w, h, more = {}) => new T3.Mesh(new T3.PlaneGeometry(w, h), new T3.MeshBasicMaterial({ map, transparent: true, alphaTest: 0.5, ...more }));
let TEX = null;
const texes = T3 => TEX || (TEX = {
  ring: pix(T3, 20, 20, f => { for (let y = 0; y < 20; y++) for (let x = 0; x < 20; x++){ const d = Math.hypot(x - 9.5, y - 9.5); if (d < 10 && d > 8.6) f('#181425', x, y, 1, 1); else if (d <= 8.6 && d > 6.4) f(x + y < 16 ? '#feae34' : '#d77643', x, y, 1, 1); else if (d <= 6.4 && d > 5.4) f('#181425', x, y, 1, 1); } f('#181425', 2, 9, 16, 2); f('#d77643', 3, 9, 14, 1); f('#2ce8f5', 9, 8, 2, 4); f('#ffffff', 9, 9, 2, 2); }),
  hammer: pix(T3, 12, 16, f => { f('#181425', 5, 0, 2, 8); f('#8b9bb4', 5, 0, 1, 8); f('#181425', 0, 7, 12, 9); f('#d77643', 1, 8, 10, 7); f('#feae34', 1, 8, 10, 2); f('#a05b53', 1, 13, 10, 2); f('#181425', 3, 10, 6, 2); }),
  glow: pix(T3, 8, 8, f => { f('#ffffff', 0, 0, 8, 8); }),
});
// what the hours do, for a floor of them (the room of hours, and the Almanac's own). e.H is its state; o says how many
// hours it calls at once and how long between. It calls (the plate lights); just before the end the hammer over the
// plate after it shakes; then that one falls. Returns what happened this step
export const HOUR = { call: 1.3, shake: 0.4, down: 0.35, high: 5.2 };
const plateX = (e, m, k) => e.home.x + ((m.from || 0) + (k + 0.5) * m.w) * 0.5 - 0.25;   // the middle of plate k (the mark is at tile x: its left edge is a quarter back from the tile's middle)
export function tellHours(e, P, dt, c, o){
  const m = e.mk || {}, n = m.n || 5, H = e.H || (e.H = { t: 0, st: 'rest', calls: [], k: 0, seed: (Math.floor(Math.abs(e.home.x) * 131) + 977) | 0 }), out = {};
  H.t += dt;   // (which hours it calls: by its own count from its own place, so the same every time he comes)
  if (H.st === 'rest' && H.t >= o.rest){ H.st = 'call'; H.t = 0; H.calls = []; while (H.calls.length < Math.min(o.calls, n - 1)){ H.seed = (Math.imul(H.seed, 1103515245) + 12345) & 0x7fffffff; const h = (H.seed >>> 9) % n; if (!H.calls.includes(h)) H.calls.push(h); } H.k++; out.called = true; }
  else if (H.st === 'call' && H.t >= HOUR.call){ H.st = 'down'; H.t = 0; out.struck = H.calls.map(h => (h + 1) % n);
    for (const k of out.struck){ const x = plateX(e, m, k), half = m.w * 0.25; if (P.x + 0.3 > x - half && P.x - 0.3 < x + half && P.y < e.home.y + 3.4 && P.y > e.home.y - 0.6 && !c.isRollInv(P) && c.hurt(P, 1, x, o.word)) out.hit = true; c.events.push({ type: 'hammer', e, at: { x, y: e.home.y }, hit: !!out.hit }); } }
  else if (H.st === 'down' && H.t >= HOUR.down){ H.st = 'rest'; H.t = 0; }
  const T3 = three(); if (!T3) return out;
  if (!e.plates){ const X = texes(T3); e.plates = []; for (let k = 0; k < n; k++){ const x = plateX(e, m, k), g = mesh(T3, X.glow, m.w * 0.5 - 0.12, 0.16, { alphaTest: 0, depthWrite: false, blending: T3.AdditiveBlending, opacity: 0.12, color: 0xfeae34 }), h = mesh(T3, X.hammer, 0.9, 1.2); g.position.set(x, e.home.y + 0.04, 0.045); h.position.set(x, e.home.y + HOUR.high, 0.036);
      const ticks = []; for (let q = 0; q <= k; q++){ const tk = mesh(T3, X.glow, 0.06, 0.2, { alphaTest: 0, color: 0x181425, opacity: 0.8 }); tk.position.set(x + (q - k / 2) * 0.14, e.home.y - 0.16, 0.046); c.E.scene.add(tk); ticks.push(tk); } c.E.scene.add(g); c.E.scene.add(h); e.plates.push({ g, h, x }); } }
  const truth = H.st === 'call' || H.st === 'down' ? H.calls.map(h => (h + 1) % n) : [];
  e.plates.forEach((p, k) => { const called = H.st === 'call' && H.calls.includes(k), due = truth.includes(k); p.g.material.opacity = called ? 0.55 + 0.35 * Math.abs(Math.sin(H.t * 9)) : 0.1; p.g.scale.y = called ? 3 : 1;
    let y = e.home.y + HOUR.high; if (due && H.st === 'call' && H.t > HOUR.call - HOUR.shake) p.h.position.x = p.x + Math.sin(H.t * 70) * 0.05; else p.h.position.x = p.x; if (due && H.st === 'down') y = e.home.y + 0.6 + Math.max(0, H.t - 0.2) * 6; p.h.position.y += (y - p.h.position.y) * Math.min(1, dt * (due && H.st === 'down' && H.t < 0.2 ? 40 : 6)); });
  return out;
}
export const ALMANAC = { hp: 24, rest: [1.5, 1.2, 0.9], calls: [1, 2, 3] };

export const enemies = {
  // the floor of hours: it calls an hour and strikes. Not a creature, and nothing strikes it
  hours: { ai: 'hours', own: true, harmless: true, prop: true, hp: 99, w: 0.2, h: 0.2, color: 0xfeae34, fly: false, word: 'Struck on the hour', guard(){ return true; } },
  // an armillary: a brass ring off the orrery, rolling. It rolls its length of floor and back; at him, faster. Jumped, or struck back
  roller: { ai: 'roller', own: true, hp: 3, w: 0.6, h: 1.2, color: 0xd77643, speed: 3.8, quick: 6.6, fly: false, word: 'Run down', onHit(e){ e.dirn = -(e.dirn || 1); e.stun = 0.5; } },
  // the Almanac: the wing's keeper. It stands at its book and reads the hour; and strikes it, an hour late. More hours at a time as it is hurt
  almanac: { ai: 'almanac', hp: ALMANAC.hp, w: 0.7, h: 2.6, color: 0xd77643, art: 'px_almanac', fly: false, name: 'The Almanac', word: 'Struck on the hour', an: { stand: 'read' }, onHit(e){ e.woke = true; },
    spawn(e, c){ if (c.RULE.still){ e.alive = false; if (e.stand) e.stand.visible = false; } } },
};
export const ai = {
  hours(e, P, dt, c){ e.st = 'idle'; const o = tellHours(e, P, dt, c, { calls: 1, rest: 1.1, word: e.d.word }); if (o.called) c.events.push({ type: 'called', e, at: { x: P.x, y: P.y } }); },
  roller(e, P, dt, c){
    const d = e.d, m = e.mk || {}, lo = e.home.x + (m.lo == null ? -10 : m.lo) * c.T, hi = e.home.x + (m.hi == null ? 10 : m.hi) * c.T; e.dirn = e.dirn || 1; e.spin = e.spin || 0; e.stun = Math.max(0, (e.stun || 0) - dt); e.st = 'roll';
    const near = Math.abs(P.y - e.y) < 0.8 && Math.abs(c.dx) < 9 && P.x > lo - 1 && P.x < hi + 1; if (near && e.stun <= 0 && Math.abs(c.dx) > 0.4) e.dirn = Math.sign(c.dx);
    const v = (near ? d.quick : d.speed) * (e.stun > 0 ? 0.5 : 1) * e.dirn; e.x += v * dt; if (e.x < lo){ e.x = lo; e.dirn = 1; } if (e.x > hi){ e.x = hi; e.dirn = -1; } e.spin -= v * dt / 0.6; e.face = e.dirn;
    if (Math.abs(P.x - e.x) < 0.75 && P.y < e.y + 0.9 && P.y > e.y - 1 && e.stun <= 0 && !c.isRollInv(P)){ if (P.blocking && P.face === (Math.sign(e.x - P.x) || P.face)){ e.flash = 0.08; c.events.push({ type: 'block', at: { x: P.x + P.face * 0.5, y: P.y + 1 }, mine: true, e }); e.dirn = -e.dirn; e.stun = 0.6; } else if (c.hurt(P, 1, e.x, d.word)){ e.dirn = -e.dirn; e.stun = 1.1; } }
    const T3 = three(); if (!T3) return;
    if (!e.g){ e.g = mesh(T3, texes(T3).ring, 1.25, 1.25); c.E.scene.add(e.g); }
    e.g.position.set(e.x, e.y + 0.62, 0.04); e.g.rotation.z = e.spin; e.g.material.color.setHex(e.flash > 0 ? 0xffffff : 0xffffff); e.g.visible = e.alive !== false;
  },
  almanac(e, P, dt, c){
    const d = e.d; e.x = e.home.x; e.y = e.home.y; e.stage = e.hp > ALMANAC.hp * 2 / 3 ? 0 : e.hp > ALMANAC.hp / 3 ? 1 : 2; e.fr = ((e.fr || 0) + dt * 0.5) % 1;
    if (!e.woke && Math.abs(c.dx) < 13 && Math.abs(c.dy) < 4) e.woke = true;
    if (!e.woke){ c.anim(e, 'read', e.fr); return; }
    const o = tellHours(e, P, dt, c, { calls: ALMANAC.calls[e.stage], rest: ALMANAC.rest[e.stage], word: d.word }); if (o.called) c.events.push({ type: 'tell', e }); e.face = Math.sign(c.dx) || e.face;
    const H = e.H; if (H.st === 'down' || (H.st === 'call' && H.t > HOUR.call - HOUR.shake)) c.anim(e, 'strike', H.st === 'down' ? 0.6 + Math.min(0.39, H.t) : 0.3); else c.anim(e, 'read', e.fr);
  },
};
