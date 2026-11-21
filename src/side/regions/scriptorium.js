// The Scriptorium: the Cloister's wing, west of the stair (docs/world.md, docs/phase10-sheet.md). Where the house's
// books were copied. After the dark the rule became: no page may have a single fault, or it is burned and begun again.
// The copyists have been copying the same book ever since, and have never finished the first page. Nine screens, set
// into the Cloister by level.js (WINGS): three columns added to the west.
//   stacks       the stacks of spoils: heaps of spoiled pages under the door from the stair's landing. Anyone may walk
//                in. The way on is a sheet of vellum stretched over the hall's door: only the Toll's step goes through
//   hall         the copying hall, two screens by two: desks in tiers over a floor of ink. Copyists at the desks, blots
//                in the ink, sheets of vellum hung between the pillars
//   furnace      where spoiled leaves are burned: red, the hot air rising over its grate (the Wyrm's wind rides it)
//   rubrication  the red room, where faults are struck out: the Corrector
//   lectern      the book they copy, open at its first page; a relic. A chute in its floor, for spoiled leaves, goes
//                down past the furnace to the top of the stacks: the way back
// Everything past the vellum has `gate: 'dash'`; the tests hold that none of it is reached without the Toll's step.
import { room, rect, walls, door, ledge, mark, EMPTY, VELLUM } from '../rooms.js';

const TITLE = 'THE SCRIPTORIUM';
const named = (fn, look, gate = 'dash') => { const f = () => { const r = fn(); r.title = TITLE; r.gate = gate; r.look = look; return r; }; Object.defineProperty(f, 'name', { value: fn.name }); return f; };
const deco = (r, kind, x, y) => mark(r, 'deco', x, y, { kind });
const keep = (r, x, y) => mark(r, 'keep', x, y);
// a desk to stand on: a short plank, and what is on it
const desk = (r, x, y, who) => { ledge(r, x, x + 4, y); keep(r, x + 2, y + 2); if (who === 'c') mark(r, 'copyist', x + 2, y + 1, { dir: who === 'c' ? (x < r.w / 2 ? 1 : -1) : 1 }); else if (who) deco(r, who, x + 2, y + 1); };

function stacks(){
  const r = room(); walls(r); door(r, 'right', 12, 17); door(r, 'left', 2, 7); door(r, 'top', 32, 37);
  rect(r, 0, 2, 1, 7, VELLUM);                                     // the hall's door: vellum stretched over it
  rect(r, 28, 2, 37, 11);                                          // the landing inside the stair's door
  rect(r, 22, 2, 27, 8); rect(r, 16, 2, 21, 5); rect(r, 8, 2, 15, 3);   // the heaps, down from it: a stair of them (build 81: the lowest stopped short, and left a slot two tiles deep that the blot lay in and could not leave)
  mark(r, 'blot', 12, 4);
  for (const [k, x, y] of [['spoils', 24, 9], ['spoils', 18, 6], ['spoils', 9, 4], ['spoils', 34, 12], ['inkpot', 30, 12], ['washline', 14, 15], ['washline', 24, 17]]) deco(r, k, x, y);
  mark(r, 'torch', 5, 9); mark(r, 'torch', 36, 16); mark(r, 'urn', 19, 6); mark(r, 'urn', 4, 2); mark(r, 'crystal', 32, 12);
  for (const x of [33, 36]) for (const y of [14, 18]) keep(r, x, y);   // under the chute's mouth
  return r;
}
function hall(){
  const r = room(2, 2); walls(r); door(r, 'right', 2, 7); door(r, 'right', 25, 30); door(r, 'top', 6, 11);
  // the pillars of shelves, floor to roof but for the ways through them
  for (const x of [26, 52]){ rect(r, x, 2, x + 2, 43); rect(r, x, 8, x + 2, 13, EMPTY); rect(r, x, 20, x + 2, 25, EMPTY); rect(r, x, 32, x + 2, 37, EMPTY); }
  // the desks: he climbs across them. In by the east door at the floor; up the east bay to the first way through the
  // pillars; up the middle bay; west through the second, and up the west bay to the hole in the roof. The east bay's
  // middle goes to the furnace. The top of the middle bay, through the third way, comes to a sheet of vellum
  for (const [x, y, w] of [[66, 5, 0], [58, 7, 0], [45, 8, 'inkpot'], [37, 11, 0], [44, 14, 0], [36, 17, 0], [47, 17, 0],
    [58, 20, 0], [66, 22, 'spoils'], [20, 20, 0], [10, 23, 0], [18, 26, 'c'], [8, 29, 0], [16, 32, 0], [8, 35, 0], [20, 39, 0],
    [16, 7, 'c'], [6, 12, 'spoils'], [66, 13, 'c'], [38, 23, 'c'], [31, 31, 0], [40, 34, 'c'], [46, 31, 0]]) desk(r, x, y, w);
  ledge(r, 70, 77, 24);                                            // the step to the furnace's door
  for (const y of [38, 42]) ledge(r, 6, 11, y);                    // up to the red room
  // sheets hung between the pillars: an alcove behind one, in the east bay's top
  rect(r, 55, 32, 55, 37, VELLUM); rect(r, 56, 31, 77, 31); mark(r, 'chest', 72, 32, { holds: 'thread' }); mark(r, 'crystal', 68, 32);
  mark(r, 'blot', 14, 2); mark(r, 'blot', 40, 2); mark(r, 'blot', 62, 2);
  for (const [k, x, y] of [['washline', 12, 22], ['washline', 40, 24], ['washline', 64, 14], ['washline', 20, 34], ['lamp', 39, 40], ['lamp', 14, 41], ['lamp', 66, 41], ['spoils', 33, 2], ['spoils', 70, 2], ['bookcase', 5, 2]]) deco(r, k, x, y);
  mark(r, 'urn', 4, 2); mark(r, 'urn', 47, 2); mark(r, 'urn', 73, 25); mark(r, 'chest', 22, 40, { holds: 'shards' });
  return r;
}
function furnace(){
  const r = room(); walls(r); door(r, 'left', 2, 7);
  rect(r, 30, 0, 39, 22); rect(r, 32, 0, 37, 22, EMPTY);           // the chute, behind its own wall, past the furnace
  rect(r, 35, 15, 37, 16); rect(r, 32, 3, 34, 4);                  // and what breaks a fall down it: two shelves, far enough apart to stand under, each drop short of a hurt
  rect(r, 18, 2, 29, 5);                                           // the furnace's hearth
  mark(r, 'updraft', 20, 6, { w: 8, h: 11 }); for (const y of [8, 12, 16]) for (const x of [20, 27]) keep(r, x, y);   // its heat, rising (the Wyrm's wind rides it)
  rect(r, 2, 16, 9, 17); mark(r, 'chest', 5, 18, { holds: 'shards' }); mark(r, 'urn', 8, 18);   // a shelf only the rising heat reaches
  ledge(r, 8, 13, 9); keep(r, 10, 11);
  for (const [k, x, y] of [['furnace', 24, 6], ['spoils', 6, 2], ['spoils', 12, 2], ['inkpot', 10, 10]]) deco(r, k, x, y);
  mark(r, 'copyist', 11, 10, { dir: 1 }); mark(r, 'blot', 14, 2);
  mark(r, 'torch', 4, 12);
  return r;
}
function rubrication(){
  const r = room(2, 1); walls(r); door(r, 'bottom', 6, 11); ledge(r, 6, 11, 1); door(r, 'right', 2, 7);
  mark(r, 'corrector', 50, 2);
  for (const [k, x, y] of [['vat', 20, 2], ['vat', 68, 2], ['washline', 30, 16], ['washline', 54, 16], ['lamp', 40, 18], ['bookcase', 74, 2]]) deco(r, k, x, y);
  mark(r, 'torch', 16, 10); mark(r, 'torch', 62, 10); mark(r, 'urn', 3, 2);
  return r;
}
function lectern(){
  const r = room(); walls(r); door(r, 'left', 2, 7); door(r, 'bottom', 32, 37);
  rect(r, 13, 2, 27, 2); rect(r, 16, 3, 24, 3);                    // the dais: two low steps
  deco(r, 'lectern', 20, 4); mark(r, 'chest', 8, 2, { holds: 'relic:blankleaf' });
  for (const [k, x, y] of [['lamp', 20, 18], ['bookcase', 5, 2], ['washline', 12, 15]]) deco(r, k, x, y);
  mark(r, 'crystal', 14, 3); mark(r, 'crystal', 26, 3); mark(r, 'torch', 29, 10);
  for (const x of [33, 36]) for (const y of [3, 6]) keep(r, x, y);
  return r;
}

// set into the Cloister: three columns to the west of it (the region as its own file counts cells: the stair is column 0)
export const wing = { left: 3, build(X){
  const st = X.roomOf('stairwell'); if (!st) return; const row = Math.round((st.ty0 - X.Y0) / 23);   // the stair's bottom row, as the region counts rows (the passage's rooms are under it)
  X.addRoom(-1, row, named(stacks, 'scriptorium', ''));
  X.addRoom(-3, row, named(hall, 'scriptorium'));
  X.addRoom(-1, row + 1, named(furnace, 'rubric'));
  X.addRoom(-3, row + 2, named(rubrication, 'rubric'));
  X.addRoom(-1, row + 2, named(lectern, 'scriptorium'));
  for (let y = 12; y <= 17; y++) for (const x of [0, 1]) X.set(st.tx0 + x, st.ty0 + y, X.tile.EMPTY);   // the door, off the stair's landing
} };
export const QUIET = ['rubrication'];

// ---- its looks: the house's brick, ink-dark, pages in the air; and the red rooms
const base = {
  stone: { edge: 'ink', lip: 'tan', lip2: 'wood2', lipD: 2, lip2D: 3, a: 'wood0', aSeam: 'ink', b: 'deep', bSeam: 'ink', c: 'deep', core: 'ink', seam: 'brick' },
  moss: { c: ['deep', 'dark', 'deep'], p: 0.05 }, plank: ['wood1', 'wood3', 'wood0', 'wood2'], spike: ['light', 'pale'],
  ceilLow: [['chain', 4], ['banner', 2]], ceil: [['chain', 20], ['lantern', 20], ['chandelier', 14], ['banner', 8]],
  floorWall: ['books', 'candles', 'spoils', 'inkpot', 'books'], floorOpen: ['candles', 'spoils', 'inkpot'], gem: 'candles',
  back: { cols: ['ink', 'deep', 'wood0'], dim: [0.8, 0.78, 0.78], hole: 3.4, holeOpen: 3.4, windows: true, stand: [['pillar', 1]], hang: [['chain', 1]], pStand: 0, pHang: 0, wall: [['shelf', 9], ['banner', 2], ['chain', 2]], pWall: 0.003, brick: true },
  far: { img: 'cloister', dim: 0.7 }, hemi: [0xf0e6d8, 0x8a7a90, 0.95], shaft: null,
  amb: [0.5, 0.46, 0.52], mist: { col: 'deep', col2: 'ink', a: 0.34, drift: 0.1 }, fore: 'cloister',
  air: { n: 70, cols: [0xead4aa, 0xc0cbdc], warm: 0.75, vx: 0.5, vy: [-0.7, -0.15], steady: true },   // pages, and the ash of pages
};
export const looks = {
  scriptorium: base,
  rubric: { ...base,
    stone: { edge: 'ink', lip: 'rose', lip2: 'red1', lipD: 2, lip2D: 3, a: 'red0', aSeam: 'wood0', b: 'wood0', bSeam: 'ink', c: 'wood0', core: 'ink', seam: 'brick' },
    back: { ...base.back, cols: ['ink', 'wood0', 'red0'] }, hemi: [0xffd0c0, 0xa05048, 0.98], amb: [0.7, 0.36, 0.34],
    mist: { col: 'red0', col2: 'wood0', a: 0.3, drift: 0.14 }, air: { n: 70, cols: [0xff7040, 0xfee761], warm: 0.6, vx: 0.2, vy: [0.5, 1.6] } },   // sparks, rising
};

// ---- what stands in it, painted (a 'deco' mark): x the middle, y the floor
export const decoDef = (px, PAL) => ({
  // a heap of spoiled pages, each struck through
  spoils(g, x, y, r){ for (let k = 0; k < 9; k++){ const w = 5 + Math.floor(r() * 4), a = Math.floor(r() * 13) - 8, b = Math.floor(k / 3) * 2 + Math.floor(r() * 2); px(g, PAL.ink, x + a - 1, y - b - 3, w + 2, 3); px(g, k % 3 ? PAL.bone : PAL.pale, x + a, y - b - 2, w, 1); if (k % 2) px(g, PAL.red1, x + a + 1, y - b - 2, w - 2, 1); } },
  inkpot(g, x, y){ px(g, PAL.ink, x - 3, y - 6, 7, 6); px(g, PAL.deep, x - 2, y - 5, 5, 4); px(g, PAL.dark, x - 2, y - 5, 1, 4); px(g, PAL.ink, x - 1, y - 8, 3, 2); px(g, PAL.pale, x + 2, y - 13, 1, 7); px(g, PAL.white, x + 3, y - 14, 1, 3); px(g, PAL.ink, x - 5, y - 1, 3, 1); },
  // pages pegged out on a line to dry
  washline(g, x, y, r){ for (let a = -14; a <= 14; a++) px(g, PAL.wood0, x + a, y + Math.round(a * a / 60), 1, 1); for (const a of [-11, -5, 1, 8]){ const yy = y + Math.round(a * a / 60) + 1, h = 6 + Math.floor(r() * 3); px(g, PAL.ink, x + a - 1, yy, 6, h + 1); px(g, PAL.bone, x + a, yy, 4, h); for (let k = 1; k < h - 1; k += 2) px(g, PAL.tan, x + a + 1, yy + k, 2, 1); if (r() < 0.6) px(g, PAL.red1, x + a, yy + Math.floor(h / 2), 4, 1); } },
  // a hanging lamp
  lamp(g, x, y, r, glow){ px(g, PAL.mid, x, y - 14, 1, 14); px(g, PAL.ink, x - 3, y, 7, 7); px(g, PAL.wood1, x - 3, y, 7, 1); px(g, PAL.fire2, x - 2, y + 1, 5, 5); px(g, PAL.fire3, x - 1, y + 2, 3, 3); px(g, PAL.white, x, y + 3, 1, 1); if (glow) glow(x + 0.5, y + 3, 'lamp'); },
  bookcase(g, x, y, r){ const cols = [PAL.red0, PAL.navy, PAL.moss0, PAL.plum, PAL.wood2]; px(g, PAL.ink, x - 9, y - 26, 19, 26); px(g, PAL.wood0, x - 8, y - 25, 17, 25); for (let s = 0; s < 3; s++){ const sy = y - 2 - s * 8; px(g, PAL.wood1, x - 8, sy, 17, 1); let bx = x - 7; while (bx < x + 7){ const w = 1 + Math.floor(r() * 2), h = 4 + Math.floor(r() * 3); if (r() < 0.8) px(g, cols[Math.floor(r() * cols.length)], bx, sy - h, w, h); bx += w + (r() < 0.2 ? 2 : 1); } } },
  // the furnace's mouth: an iron arch, fire behind its bars
  furnace(g, x, y, r, glow){ for (let b = 0; b < 26; b++){ const half = b < 16 ? 13 : Math.round(Math.sqrt(Math.max(0, 13 * 13 - (b - 16) * (b - 16) * 1.6))); px(g, PAL.ink, x - half - 2, y - 1 - b, half * 2 + 4, 1); px(g, b % 6 === 0 ? PAL.mid : PAL.dark, x - half - 1, y - 1 - b, half * 2 + 2, 1); if (half > 3){ px(g, b < 5 ? PAL.fire3 : b < 12 ? PAL.fire2 : PAL.fire1, x - half + 2, y - 1 - b, half * 2 - 4, 1); } } for (let a = -9; a <= 9; a += 4) px(g, PAL.ink, x + a, y - 22, 1, 22); if (glow){ glow(x - 5, y - 8, 'lamp'); glow(x + 5, y - 8, 'lamp'); } },
  // a vat of red ink
  vat(g, x, y){ px(g, PAL.ink, x - 7, y - 10, 15, 10); px(g, PAL.wood1, x - 6, y - 9, 13, 9); for (const a of [-6, -2, 2, 6]) px(g, PAL.wood0, x + a, y - 9, 1, 9); px(g, PAL.mid, x - 6, y - 7, 13, 1); px(g, PAL.mid, x - 6, y - 3, 13, 1); px(g, PAL.red1, x - 5, y - 10, 11, 2); px(g, PAL.rose, x - 3, y - 10, 3, 1); px(g, PAL.red0, x + 5, y - 6, 2, 6); },
  // the book they copy, open on its lectern: its first page is blank
  lectern(g, x, y, r, glow){ px(g, PAL.ink, x - 2, y - 16, 5, 16); px(g, PAL.wood1, x - 1, y - 15, 3, 15); px(g, PAL.ink, x - 6, y - 1, 13, 1); px(g, PAL.ink, x - 9, y - 22, 19, 7); px(g, PAL.wood2, x - 8, y - 21, 17, 5); px(g, PAL.ink, x - 8, y - 25, 17, 5); px(g, PAL.white, x - 7, y - 24, 7, 3); px(g, PAL.bone, x + 1, y - 24, 7, 3); px(g, PAL.ink, x, y - 25, 1, 5); if (glow) glow(x, y - 24, 'gem'); },
});

// ---- who is in it
const los = (c, e, P) => { for (let k = 1; k < 8; k++){ const u = k / 8; if (c.solidAt(e.x + (P.x - e.x) * u, e.y + 1.4 + (P.y - e.y) * u)) return false; } return true; };
export const enemies = {
  // a copyist: bound to his desk. He flings ink at what comes in front of him; from behind he does not look up
  copyist: { ai: 'copyist', hp: 3, w: 0.7, h: 2.6, color: 0x8b9bb4, range: 11, windup: 0.7, cooldown: 2.3, speed: 9, orb: 0x4a5a9a, art: 'px_copyist', fly: false, word: 'Inked' },
  // a blot: the shape of a copyist in the ink he spilled. It lies as a spill until he is near, stands up out of it, comes
  // for him and throws itself down over him; then lies where it fell
  blot: { ai: 'blot', hp: 2, w: 0.55, h: 2.2, color: 0x3a4466, wake: 3.6, chase: 2.6, reach: 1.7, art: 'px_blot', fly: false, word: 'Blotted' },
  // the Corrector: the wing's elite. A long knife: a level slash at arm's length, and, every third time or from far off,
  // a line struck through the whole room at the height of a standing man (it shows red first: crouch, or be over it)
  corrector: { ai: 'corrector', hp: 22, w: 0.7, h: 3.6, color: 0x181425, wake: 13, chase: 2.3, reach: 3.3, dmg: 2, art: 'px_corrector', fly: false, word: 'Struck out' },
};
export const ai = {
  copyist(e, P, dt, c){
    const d = e.d, { dx, dy, go, events } = c; e.face = e.dirn; e.cd = Math.max(0, (e.cd || 0) - dt);
    if (e.st === 'idle'){ e.warn = false; c.anim(e, 'write', (e.age * 0.8) % 1);
      if (e.cd <= 0 && dx * e.face > 0.5 && c.dist < d.range && Math.abs(dy) < 7 && los(c, e, P)){ go('fling'); e.shot = false; events.push({ type: 'tell', e }); } }
    else if (e.st === 'fling'){ const u = e.tm / d.windup; e.warn = u < 1;
      c.anim(e, 'fling', u < 1 ? u * 0.6 : Math.min(0.99, 0.6 + (e.tm - d.windup) / 0.4 * 0.39));
      if (u >= 1 && !e.shot){ e.shot = true; c.shoot(c.E, e, P, true); events.push({ type: 'spit', e }); }
      if (e.tm > d.windup + 0.4){ go('idle'); e.cd = d.cooldown; } }
    else go('idle');
  },
  blot(e, P, dt, c){
    const d = e.d, { dx, dy, go, events } = c, gy = c.ground(e.x, e.y + 0.3); if (gy > -Infinity) e.y = gy;
    // it lies as a spill (the last of its dive) until he is near; then it stands up out of it
    if (e.st === 'idle'){ e.warn = false; c.anim(e, 'attack', 0.99); if (Math.abs(dx) < d.wake && Math.abs(dy) < 2){ go('rise'); e.face = Math.sign(dx) || e.face; events.push({ type: 'notice', e }); } }
    else if (e.st === 'rise'){ c.anim(e, 'attack', Math.max(0.3, 0.99 - e.tm / 0.5 * 0.69)); if (e.tm > 0.5) go('crawl'); }
    else if (e.st === 'crawl'){ e.face = Math.sign(dx) || e.face; const nx = e.x + e.face * d.chase * dt;
      if (Math.abs(dx) > 0.9 && !c.solidAt(nx + e.face * d.w, e.y + 0.3) && c.ground(nx, e.y + 0.3) > e.y - 0.6) e.x = nx;
      c.anim(e, 'crawl', (e.age * 1.1) % 1);
      if (Math.abs(dx) < d.reach && Math.abs(dy) < 1.4){ go('gather'); events.push({ type: 'tell', e }); } else if (Math.abs(dx) > 9 || Math.abs(dy) > 4) go('splash'), e.hitDone = true; }
    else if (e.st === 'gather'){ e.warn = true; c.anim(e, 'attack', Math.min(0.34, e.tm / 0.5 * 0.34)); if (e.tm >= 0.5){ go('splash'); e.hitDone = false; } }
    else if (e.st === 'splash'){ e.warn = false; c.anim(e, 'attack', Math.min(0.99, 0.34 + e.tm / 0.35 * 0.65));
      if (!e.hitDone && e.tm > 0.1){ e.hitDone = true; c.hit(e.face > 0 ? e.x - 0.3 : e.x - 2.2, e.y, e.face > 0 ? e.x + 2.2 : e.x + 0.3, e.y + 1.4); c.fx.burst({ x: e.x + e.face * 1.1, y: e.y + 0.4 }, 12, 0x3a4466); }
      if (e.tm > 0.35 + 0.8) go('idle'); }   // it lies where it broke: its place now
    else go('idle');
  },
  corrector(e, P, dt, c){
    const d = e.d, { dx, dy, go, events } = c, gy = c.ground(e.x, e.y + 0.3); if (gy > -Infinity) e.y = gy; e.n = e.n || 0;
    const T3 = window.THREE, line = a => { if (!e.line){ e.line = new T3.Mesh(new T3.PlaneGeometry(26, 0.1), new T3.MeshBasicMaterial({ color: 0xff3040, transparent: true, opacity: 0, depthWrite: false, depthTest: false, blending: T3.AdditiveBlending })); c.E.scene.add(e.line); } e.line.visible = a > 0; e.line.position.set(e.x, e.y + 1.8, 0.09); e.line.material.opacity = a; };
    if (e.line) e.line.visible = false;
    if (e.st === 'idle'){ e.warn = false; c.anim(e, 'walk', 0); if (Math.abs(dx) < d.wake && Math.abs(dy) < 4){ go('stalk'); events.push({ type: 'notice', e }); } }
    else if (e.st === 'stalk'){ e.face = Math.sign(dx) || e.face; const nx = e.x + e.face * d.chase * dt; let moving = false;
      if (Math.abs(dx) > 2.2 && !c.solidAt(nx + e.face * d.w, e.y + 0.3) && c.ground(nx, e.y + 0.3) > e.y - 0.6){ e.x = nx; moving = true; }
      c.anim(e, 'walk', moving ? (e.age * 1.1) % 1 : 0);
      if (e.tm > 0.5 && Math.abs(dy) < 2.5){
        if (e.n % 3 === 2 || (Math.abs(dx) > 7 && e.tm > 1.6)){ go('raise'); events.push({ type: 'tell', e }); }
        else if (Math.abs(dx) < d.reach){ go('draw'); events.push({ type: 'tell', e }); } }
      if (Math.abs(dx) > 18 || Math.abs(dy) > 8) go('idle'); }
    else if (e.st === 'draw'){ e.warn = true; c.anim(e, 'attack', Math.min(0.4, e.tm / 0.5 * 0.4)); if (e.tm >= 0.5){ go('slash'); e.hitDone = false; } }
    else if (e.st === 'slash'){ e.warn = false; c.anim(e, 'attack', Math.min(0.99, 0.4 + e.tm / 0.35 * 0.59));
      if (!e.hitDone && e.tm > 0.06){ e.hitDone = true; const x0 = e.face > 0 ? e.x : e.x - 3.6;
        if (P.x + 0.34 > x0 && P.x - 0.34 < x0 + 3.6 && P.y + P.h > e.y + 0.4 && P.y < e.y + 2.6 && !c.isRollInv(P)){
          if (P.blocking && P.face === -e.face){ e.flash = 0.08; events.push({ type: 'block', at: { x: P.x + P.face * 0.5, y: P.y + 1.2 }, mine: true, e }); } else c.hurt(P, d.dmg, e.x, d.word); } }
      if (e.tm > 0.75){ e.n++; go('stalk'); } }
    else if (e.st === 'raise'){ e.warn = true; c.anim(e, 'strike', Math.min(0.55, e.tm / 0.9 * 0.55)); line(0.2 + 0.3 * Math.abs(Math.sin(e.tm * 22))); if (e.tm >= 0.9){ go('strike'); e.hitDone = false; } }
    else if (e.st === 'strike'){ e.warn = false; c.anim(e, 'strike', Math.min(0.99, 0.55 + e.tm / 0.3 * 0.44)); line(e.tm < 0.14 ? 1 : 0);
      if (!e.hitDone && e.tm > 0.05){ e.hitDone = true; if (Math.abs(P.x - e.x) < 13 && P.y + P.h > e.y + 1.5 && P.y < e.y + 2.1 && !c.isRollInv(P)) c.hurt(P, 1, e.x, d.word); if (c.E.R && c.E.R.glint) c.E.R.glint(e.x, e.y + 1.8, 0xff4050, 2, 12, 0.15); }
      if (e.tm > 0.9){ e.n++; go('stalk'); } }
    else go('idle');
  },
};
