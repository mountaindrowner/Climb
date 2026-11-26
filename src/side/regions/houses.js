// The Keepers' Houses: the Gardens' wing, east of the arbor (docs/world.md, docs/phase13-sheet.md).
// Where the keepers of the flame lived: his house among them. They left after the dark. The house's servant did not.
// Every house is kept: beds made, tables laid, fires laid and not lit. Eight screens, set into the Gardens by level.js
// (WINGS): the two columns east of the garden's own, which the mountain already had.
//   lane       two screens: the row of house fronts. In from the arbor by the gardeners' gate (a shuttered door: the
//              Toll's step goes through it). The Housekeeper's round
//   longtable  two screens, under the lane: the keepers' common hall. One table the length of it, laid for all of them
//   house1     over the lane's west end: three floors
//   backway    over the first house: its attic, and a door out onto the cascade's high terrace
//   house2     over the lane's east end: three floors, moths
//   hishouse   over the second: his. Its door is shut while anything in the houses is out of its place
// Its rule (rooms.js KEPT; level.js RULE.upset, RULE.unkept). Disturb nothing. A setting broken is a thing out of its place: the
// Housekeeper comes by the servants' doors to set it right, and strikes whoever is in its reach on that floor; and
// while anything is out of its place his own house is shut. To strike the Housekeeper is the worst of it.
import { rect, door, ledge, mark, cave, flue, EMPTY, ROCK, VELLUM, KEPT } from '../rooms.js';

const TITLE = 'THE KEEPERS\' HOUSES';
const named = (fn, more = {}) => { const f = () => { const r = fn(); r.title = TITLE; r.look = 'houses'; Object.assign(r, more); return r; }; Object.defineProperty(f, 'name', { value: fn.name }); return f; };
const deco = (r, kind, x, y) => mark(r, 'deco', x, y, { kind });
const keep = (r, x, y) => mark(r, 'keep', x, y);
const set = (r, x, y) => mark(r, 'setting', x, y);
const serv = (r, x, y) => deco(r, 'servdoor', x, y);                // a servants' door: the Housekeeper's way from floor to floor
const inside = (r, w = 40) => rect(r, 2, 2, w - 3, 20, EMPTY);      // a built room: its walls square
const up = (r, x0, x1, ys) => { for (const y of ys) ledge(r, x0, x1, y); };

function lane(){
  const r = cave(2, 1); inside(r, 80); door(r, 'left', 9, 14);    // in from the arbor, at the height of its east shelf
  door(r, 'top', 10, 15); door(r, 'top', 50, 55); door(r, 'bottom', 70, 75); ledge(r, 70, 75, 1);
  // (the map pass, build 104: the way in was planks, and the way up into each house five rungs in the air. Now a stoop
  // of stone at the gate, a step down from it to the lane, and a rung over it; and before the second house a mounting
  // block of two steps, and a rung)
  rect(r, 2, 2, 15, 8); rect(r, 16, 2, 18, 5); up(r, 10, 15, [15, 21]); flue(r, 10, 15, 15, 20);
  rect(r, 47, 2, 49, 5); rect(r, 50, 2, 55, 8); rect(r, 56, 2, 58, 5); up(r, 50, 55, [15, 21]); flue(r, 50, 55, 15, 20);   // up into each house
  mark(r, 'housekeeper', 40, 2); serv(r, 28, 2); serv(r, 62, 2);
  set(r, 22, 2); set(r, 44, 2);
  for (const [k, x] of [['front', 24], ['front', 36], ['front', 64], ['shutters', 30], ['shutters', 43]]) deco(r, k, x, 2);
  mark(r, 'torch', 4, 12); mark(r, 'torch', 33, 9); mark(r, 'torch', 66, 9); mark(r, 'crystal', 76, 2);
  for (const x of [3, 5, 8, 12]) for (const y of [10, 13]) keep(r, x, y);
  return r;
}
function longtable(){
  const r = cave(2, 1); inside(r, 80); door(r, 'top', 70, 75); rect(r, 67, 2, 69, 5); rect(r, 70, 2, 77, 9); up(r, 70, 75, [15, 21]); flue(r, 70, 75, 15, 20);   // (a stair of two steps and a rung, since the map pass)
  ledge(r, 14, 60, 4);                                              // the table: he can go along it, or under it
  for (const x of [18, 26, 34, 42, 50, 58]) set(r, x, 5);           // a place laid for each of them
  serv(r, 63, 2); serv(r, 15, 2); mark(r, 'chest', 6, 2, { holds: 'thread' });      // (a servants' door at either end of the hall); the thread, past every place
  mark(r, 'moth', 24, 12); mark(r, 'moth', 40, 14); mark(r, 'moth', 54, 12);
  for (const [k, x] of [['hearth', 10], ['bench', 22], ['bench', 38], ['bench', 54], ['shutters', 30], ['shutters', 48]]) deco(r, k, x, 2);
  mark(r, 'torch', 4, 9); mark(r, 'torch', 37, 12); mark(r, 'torch', 64, 9); mark(r, 'crystal', 76, 10);
  return r;
}
// a house: three floors. flip: which side its stair is on
function house(r, flip, moths){
  const X = x => flip ? 39 - x : x, R2 = (a, b, y0, y1, t) => rect(r, Math.min(X(a), X(b)), y0, Math.max(X(a), X(b)), y1, t), L = (a, b, y) => ledge(r, Math.min(X(a), X(b)), Math.max(X(a), X(b)), y);
  inside(r); door(r, 'bottom', 10, 15); ledge(r, 10, 15, 1); door(r, 'top', 30, 35);
  R2(12, 37, 8, 9); R2(4, 9, 2, 5); L(2, 11, 9);                     // the first floor up: a block to step from, and planks over the stair's well (since the map pass; a plank stood there)
  R2(2, 27, 15, 16); R2(36, 37, 10, 12); L(28, 37, 16);              // the second, its stair at the other side: a block by the wall
  up(r, 30, 35, [21]);                                              // and on up (one rung fewer)
  for (const [x, y] of [[24, 2], [32, 2], [20, 10], [30, 10], [8, 17], [18, 17]]) set(r, X(x), y);
  serv(r, X(36), 2); serv(r, X(34), 10); serv(r, X(4), 17);
  for (const [k, x, y] of [['laidtable', 28, 2], ['hearth', 20, 2], ['bed', 25, 10], ['shutters', 16, 10], ['trunk', 13, 17], ['shutters', 22, 17]]) deco(r, k, X(x), y);
  for (const [x, y] of moths) mark(r, 'moth', X(x), y);
  mark(r, 'torch', X(3), 6); mark(r, 'torch', X(36), 13); mark(r, 'torch', X(3), 19);
  return r;
}
function house1(){ const r = house(cave(), false, [[26, 11]]); mark(r, 'chest', 12, 17, { holds: 'shards' }); return r; }
// (a moth hangs three tiles over its mark: each is set low enough that that is under the floor above, not in it)
function house2(){ const r = house(cave(), false, [[18, 4], [26, 11], [14, 17]]); mark(r, 'urn', 6, 6); return r; }
function backway(){
  const r = cave(); inside(r); door(r, 'bottom', 30, 35); ledge(r, 30, 35, 1); door(r, 'left', 8, 13);
  rect(r, 2, 2, 12, 7); rect(r, 13, 2, 18, 4);                      // up to the door out
  set(r, 24, 2); serv(r, 36, 2); mark(r, 'chest', 8, 8, { holds: 'shards' }); mark(r, 'moth', 22, 10);
  for (const [k, x, y] of [['trunk', 22, 2], ['trunk', 27, 2], ['shutters', 20, 2]]) deco(r, k, x, y);
  mark(r, 'torch', 36, 9);
  for (const x of [3, 5]) for (const y of [9, 12]) keep(r, x, y);
  return r;
}
function hishouse(){
  const r = cave(); inside(r); door(r, 'bottom', 30, 35); rect(r, 30, 0, 35, 0, KEPT); ledge(r, 30, 35, 1);   // its door: shut while anything in the houses is out of its place
  set(r, 12, 2); set(r, 18, 2); serv(r, 26, 2);                     // the table is laid for two
  mark(r, 'chest', 6, 2, { holds: 'relic:place' });
  for (const [k, x, y] of [['table2', 15, 2], ['hearth', 22, 2], ['bed', 9, 2], ['shutters', 4, 2]]) deco(r, k, x, y);
  mark(r, 'torch', 37, 9);
  return r;
}

// set into the Gardens: the two columns east of its own three (as the region counts cells: the arbor is column 2,
// row 1), from the terraces' row to the cascade's top
export const wing = { right: 2, build(X){
  const ar = X.roomOf('arbor'), ca = X.roomOf('cascade'); if (!ar || !ca) return; const row = Math.round((ar.ty0 - X.Y0) / 23), col = Math.round((ar.tx0 - X.X0) / 40);
  for (let y = ar.ty0 - 23; y < ar.ty0 + 69; y++) for (let x = ar.tx1; x < X.W; x++) X.set(x, y, ROCK);   // east of the garden, the mountain: the houses are cut into it
  X.addRoom(col + 1, row, named(lane), { wing: true });
  X.addRoom(col + 1, row - 1, named(longtable), { wing: true });
  X.addRoom(col + 1, row + 1, named(house1), { wing: true });
  X.addRoom(col + 1, row + 2, named(backway), { wing: true });
  X.addRoom(col + 2, row + 1, named(house2), { wing: true });
  X.addRoom(col + 2, row + 2, named(hishouse), { wing: true });
  // the gardeners' gate: through the arbor's east pier, shuttered (the Toll's step tears it). At the height of the
  // arbor's east shelf, not at its floor: under that shelf a jump takes hold of the shelf, and there is no step to take
  for (let y = 9; y <= 14; y++){ for (let x = ar.tx1 - 1; x >= ar.tx1 - 8; x--){ if (x < ar.tx1 - 4 && X.at(x, ar.ty0 + y) !== ROCK) break; X.set(x, ar.ty0 + y, EMPTY); } X.set(ar.tx1 - 2, ar.ty0 + y, VELLUM); X.set(ar.tx1 - 3, ar.ty0 + y, VELLUM); }
  // the back way's door, out through the cascade's east wall onto its high terrace
  const by = ar.ty0 + 46 + 8 - ca.ty0; for (let y = by; y <= by + 5; y++) for (let x = ca.tx1 - 1; x >= ca.tx1 - 8; x--){ if (x < ca.tx1 - 3 && X.at(x, ca.ty0 + y) !== ROCK) break; X.set(x, ca.ty0 + y, EMPTY); }
} };
export const QUIET = ['hishouse'];

// ---- its look: plastered rooms, warm wood, the afternoon through shutters
export const looks = {
  houses: {
    stone: { edge: 'ink', topEdge: 'bone', lip: 'wood3', lip2: 'wood2', lipD: 2, lip2D: 3, a: 'bone', aSeam: 'pale', b: 'pale', bSeam: 'light', c: 'light', core: 'wood0', seam: 'brick' },
    moss: { c: ['wood2', 'wood1', 'wood0'], p: 0.0 }, plank: ['wood1', 'wood3', 'wood0', 'wood2'], spike: ['wood0', 'bone'],
    ceilLow: [['chain', 1]], ceil: [['lantern', 10], ['chain', 3]], floorWall: ['drum', 'urn'], floorOpen: ['drum'], gem: 'sunbloom',
    back: { cols: ['wood0', 'wood1', 'wood2'], dim: [1, 0.94, 0.88], hole: 99, holeOpen: 99, stand: [['column', 1]], hang: [['chain', 1]], pStand: 0, pHang: 0.004 },
    far: { img: 'gardens', raw: true }, hemi: [0xfff0d8, 0xd8b890, 1.0], shaft: 'rgba(255,220,150,0.5)', bloom: [0.9, 0.4],
    amb: [1.06, 0.96, 0.82], ambIn: [0.72, 0.6, 0.48], mist: { col: 'bone', col2: 'white', a: 0.1, drift: 0.08 }, fore: 'roots',
    air: { n: 50, cols: [0xfff2d0, 0xffffff], warm: 0.8, vx: 0.05, vy: [-0.12, 0.04], drift: 0.1, steady: true },   // dust in the light
  },
};
// ---- what stands in it, painted (a 'deco' mark): x the middle, y the floor
export const decoDef = (px, PAL) => ({
  // a servants' door: low, narrow, set flush in the wall
  servdoor(g, x, y){ px(g, PAL.ink, x - 6, y - 26, 12, 26); px(g, PAL.wood1, x - 5, y - 25, 10, 25); px(g, PAL.wood0, x - 5, y - 25, 1, 25); px(g, PAL.wood0, x, y - 25, 1, 25); px(g, PAL.wood2, x - 4, y - 24, 3, 22); px(g, PAL.ink, x + 3, y - 13, 1, 2); px(g, PAL.gold || PAL.wood3, x + 2, y - 13, 1, 1); },
  // a house front: a door under a lintel, a lamp by it
  front(g, x, y){ px(g, PAL.ink, x - 9, y - 34, 18, 34); px(g, PAL.wood2, x - 8, y - 33, 16, 33); px(g, PAL.wood1, x - 8, y - 33, 16, 2); for (let a = -6; a <= 6; a += 4) px(g, PAL.wood1, x + a, y - 31, 1, 31); px(g, PAL.ink, x - 12, y - 38, 24, 4); px(g, PAL.bone, x - 11, y - 37, 22, 2); px(g, PAL.ink, x + 5, y - 17, 2, 3); px(g, PAL.wood3, x + 5, y - 17, 1, 2); px(g, PAL.ink, x - 15, y - 30, 4, 7); px(g, PAL.wood3, x - 14, y - 29, 2, 5); },
  // a window, its shutters closed: the afternoon comes through the slats
  shutters(g, x, y){ const b = y - 44; px(g, PAL.ink, x - 10, b, 20, 26); px(g, PAL.wood1, x - 9, b + 1, 18, 24); px(g, PAL.ink, x, b + 1, 1, 24); for (let k = 3; k < 24; k += 3){ px(g, PAL.bone, x - 8, b + k, 7, 1); px(g, PAL.bone, x + 2, b + k, 7, 1); } px(g, PAL.ink, x - 12, b + 26, 24, 2); px(g, PAL.bone, x - 11, b + 26, 22, 1); },
  // a table laid: a cloth to the floor's knee, nothing out of line
  laidtable(g, x, y){ px(g, PAL.ink, x - 15, y - 13, 30, 3); px(g, PAL.white, x - 14, y - 13, 28, 2); px(g, PAL.bone, x - 13, y - 11, 26, 5); px(g, PAL.pale, x - 13, y - 7, 26, 1); px(g, PAL.ink, x - 12, y - 6, 2, 6); px(g, PAL.ink, x + 10, y - 6, 2, 6); px(g, PAL.wood1, x - 12, y - 6, 1, 6); px(g, PAL.wood1, x + 10, y - 6, 1, 6); },
  // his table, laid for two: a chair at either side
  table2(g, x, y){ px(g, PAL.ink, x - 13, y - 13, 26, 3); px(g, PAL.white, x - 12, y - 13, 24, 2); px(g, PAL.bone, x - 11, y - 11, 22, 5); px(g, PAL.ink, x - 10, y - 6, 2, 6); px(g, PAL.ink, x + 8, y - 6, 2, 6); for (const s of [-1, 1]){ const cx = x + s * 19; px(g, PAL.ink, cx - 3, y - 20, 6, 20); px(g, PAL.wood2, cx - 2, y - 19, 4, 9); px(g, PAL.wood1, cx - 2, y - 9, 4, 2); px(g, PAL.wood0, cx - 2, y - 7, 1, 7); px(g, PAL.wood0, cx + 1, y - 7, 1, 7); } },
  // a bench at the long table
  bench(g, x, y){ px(g, PAL.ink, x - 12, y - 7, 24, 3); px(g, PAL.wood2, x - 11, y - 7, 22, 2); px(g, PAL.ink, x - 10, y - 4, 2, 4); px(g, PAL.ink, x + 8, y - 4, 2, 4); },
  // a hearth: the fire laid, and not lit
  hearth(g, x, y){ px(g, PAL.ink, x - 12, y - 24, 24, 24); px(g, PAL.light, x - 11, y - 23, 22, 23); px(g, PAL.bone, x - 11, y - 23, 22, 2); px(g, PAL.ink, x - 7, y - 16, 14, 16); px(g, PAL.deep || PAL.ink, x - 6, y - 15, 12, 15); px(g, PAL.wood1, x - 5, y - 4, 10, 2); px(g, PAL.wood2, x - 4, y - 6, 8, 2); px(g, PAL.wood1, x - 3, y - 8, 6, 2); px(g, PAL.ink, x - 14, y - 27, 28, 3); px(g, PAL.bone, x - 13, y - 26, 26, 1); },
  // a bed, made
  bed(g, x, y){ px(g, PAL.ink, x - 15, y - 9, 30, 9); px(g, PAL.wood1, x - 14, y - 4, 28, 4); px(g, PAL.white, x - 14, y - 8, 28, 4); px(g, PAL.pale, x - 14, y - 5, 28, 1); px(g, PAL.ink, x - 16, y - 16, 3, 16); px(g, PAL.wood2, x - 15, y - 15, 1, 15); px(g, PAL.bone, x - 12, y - 10, 7, 3); px(g, PAL.ink, x + 13, y - 11, 3, 11); px(g, PAL.wood2, x + 14, y - 10, 1, 10); },
  // a trunk, shut
  trunk(g, x, y){ px(g, PAL.ink, x - 8, y - 9, 16, 9); px(g, PAL.wood1, x - 7, y - 8, 14, 8); px(g, PAL.wood2, x - 7, y - 8, 14, 2); px(g, PAL.ink, x - 7, y - 5, 14, 1); px(g, PAL.ink, x - 1, y - 6, 2, 3); px(g, PAL.wood3, x - 1, y - 6, 1, 2); },
});

// ---- who is in it
const three = () => { const T3 = typeof window !== 'undefined' && window.THREE; return T3 && T3.Group && T3.CanvasTexture && typeof document !== 'undefined' ? T3 : null; };
const pix = (T3, w, h, paint) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); paint((col, x, y, ww, hh) => { g.fillStyle = col; g.fillRect(x, y, ww, hh); }); const t = new T3.CanvasTexture(c); t.magFilter = t.minFilter = T3.NearestFilter; t.generateMipmaps = false; return t; };
const mesh = (T3, map, w, h, more = {}) => new T3.Mesh(new T3.PlaneGeometry(w, h), new T3.MeshBasicMaterial({ map, transparent: true, alphaTest: 0.5, ...more }));
let TEX = null;
const texes = T3 => TEX || (TEX = {
  whole: pix(T3, 10, 14, f => { f('#181425', 2, 0, 6, 2); f('#181425', 1, 2, 8, 11); f('#181425', 2, 13, 6, 1); f('#ead4aa', 3, 0, 4, 1); f('#ffffff', 2, 3, 6, 9); f('#c0cbdc', 6, 3, 2, 9); f('#0099db', 2, 6, 6, 2); f('#124e89', 6, 6, 2, 2); f('#ffffff', 3, 4, 1, 2); }),
  broken: pix(T3, 14, 6, f => { f('#181425', 0, 3, 5, 3); f('#ffffff', 1, 4, 3, 2); f('#181425', 5, 2, 4, 4); f('#c0cbdc', 6, 3, 2, 3); f('#0099db', 6, 4, 2, 1); f('#181425', 10, 4, 4, 2); f('#ffffff', 11, 5, 2, 1); f('#ffffff', 4, 1, 1, 1); }),
});
export const KEEPER = { hp: 22, speed: 1.6, quick: 3.4, wind: 0.6, rest: 0.8, reach: 2.2, tend: 1.3, away: 1.1, floor: 1.7 };

export const enemies = {
  // a setting: a thing in its place. A blow breaks it; the Housekeeper sets it right. Not a creature
  setting: { ai: 'setting', own: true, prop: true, wakeful: true, hp: 99, w: 0.45, h: 0.8, color: 0xffffff, fly: false, guard(e){ if (!e.broken) e.struck = true; return true; }, onHit(e){ e.hp = e.d.hp; if (!e.broken) e.struck = true; } },
  // a moth: it sleeps by a lamp. Woken, it comes at his head
  moth: { ai: 'moth', hp: 1, w: 0.4, h: 0.5, color: 0xead4aa, wake: 5.5, speed: 3.6, back: 2.6, art: 'px_housemoth', fly: true, word: 'Bitten' },
  // the Housekeeper: the wing's keeper. It walks its round and looks at no one. A thing out of its place, it goes to
  // by the servants' doors, and sets right; whoever is in its reach on that floor, it strikes. Struck, it does not forgive
  housekeeper: { ai: 'housekeeper', wakeful: true, hp: KEEPER.hp, w: 0.7, h: 2.6, color: 0xead4aa, art: 'px_housekeeper', fly: false, name: 'The Housekeeper', word: 'Put out', guard(e){ return !!e.gone; }, onHit(e){ e.wronged = true; e.woke = true; },
    spawn(e, c){ if (c.RULE.unkept){ e.alive = false; if (e.stand) e.stand.visible = false; } } },   // broken before: it is not on its round
};
const wingRoom = (c, x, y) => (c.rooms || []).some(r => r.title === TITLE && x >= r.x0 && x < r.x1 && y >= r.y0 && y < r.y1);
export const ai = {
  setting(e, P, dt, c){
    e.st = 'idle';
    if (e.struck){ e.struck = false; if (!e.broken){ e.broken = true; c.events.push({ type: 'upset', e, at: { x: e.x, y: e.y + 0.4 } }); } }
    if (e.right){ e.right = false; if (e.broken){ e.broken = false; c.events.push({ type: 'setright', e, at: { x: e.x, y: e.y + 0.4 } }); } }
    const T3 = three(); if (!T3) return;
    if (!e.g){ const X = texes(T3), a = mesh(T3, X.whole, 0.625, 0.875), b = mesh(T3, X.broken, 0.875, 0.375); a.position.set(e.x, e.y + 0.44, 0.035); b.position.set(e.x, e.y + 0.19, 0.035); c.E.scene.add(a); c.E.scene.add(b); e.g = [a, b]; }
    e.g[0].visible = !e.broken; e.g[1].visible = !!e.broken; e.g[0].material.color.setHex(e.flash > 0 ? 0xffffff : 0xffffff);
  },
  moth(e, P, dt, c){
    const d = e.d; e.fr = ((e.fr || 0) + dt * 3) % 1; e.ph = (e.ph || e.home.x * 1.7) + dt * 7;
    if (!e.rm) e.rm = (c.rooms || []).find(r => e.home.x >= r.x0 && e.home.x < r.x1 && e.home.y >= r.y0 && e.home.y < r.y1) || { x0: -1e9, x1: 1e9, y0: -1e9, y1: 1e9 };
    const here = P.x > e.rm.x0 && P.x < e.rm.x1 && P.y > e.rm.y0 - 0.5 && P.y < e.rm.y1;   // it keeps to its own room: it does not come through a floor for him
    if (e.st === 'back' && !here) c.go('idle');
    if (e.st === 'back'){ const a = Math.atan2(e.y - (P.y + 1.8), e.x - P.x); e.x += Math.cos(a) * d.back * dt; e.y += Math.sin(a) * d.back * dt + Math.sin(e.ph) * dt; if (e.tm > 0.9) c.go('come'); }
    else if (e.st === 'come'){ const tx = P.x, ty = P.y + 1.9, L = Math.hypot(tx - e.x, ty - e.y) || 1, s = Math.min(L, d.speed * dt); e.x += (tx - e.x) / L * s + Math.cos(e.ph * 0.7) * dt * 1.2; e.y += (ty - e.y) / L * s + Math.sin(e.ph) * dt * 1.6; e.face = Math.sign(tx - e.x) || e.face;
      if (L < 0.6 && !c.isRollInv(P) && c.hurt(P, 1, e.x, d.word)) c.go('back'); if (c.dist > d.wake * 2.4 || !here) c.go('idle'); }
    else { if (e.st !== 'idle') c.go('idle'); e.x += (e.home.x + Math.cos(e.ph * 0.4) * 0.5 - e.x) * Math.min(1, dt * 2); e.y += (e.home.y + Math.sin(e.ph * 0.6) * 0.3 - e.y) * Math.min(1, dt * 2); if (here && c.dist < d.wake && Math.abs(c.dy) < 4){ c.go('come'); c.events.push({ type: 'notice', e }); } }
    c.anim(e, 'fly', e.fr);
  },
  housekeeper(e, P, dt, c){
    const d = e.d, R = c.RULE, T = c.T, K = KEEPER; e.fr = e.fr || 0; e.dirn = e.dirn || 1;
    if (!e.doors){ e.doors = (c.marks || []).filter(m => m.type === 'deco' && m.kind === 'servdoor').map(m => ({ x: (m.x + 0.5) * T, y: m.y * T })); const mine = e.doors.filter(q => Math.abs(q.y - e.home.y) < 1 && Math.abs(q.x - e.home.x) < 30); e.lo = Math.min(e.home.x, ...mine.map(q => q.x)); e.hi = Math.max(e.home.x, ...mine.map(q => q.x)); }
    if (e.wronged && !wingRoom(c, P.x, P.y + 1)) e.wronged = false;      // he is out of the houses: it lets him go
    const things = ((c.E && c.E.list) || []).filter(s => s.type === 'setting' && s.broken), after = e.wronged, sameFloor = y => Math.abs(y - e.y) < K.floor;
    const hide = on => { e.gone = on; if (e.sprite) e.sprite.g.visible = !on; if (e.stand && !e.sprite) e.stand.visible = !on; };
    // where it is wanted: the nearest thing out of its place (one on its own floor first); else him, if he struck it; else its round
    let goal = null; if (things.length){ const near = things.slice().sort((a, b) => (sameFloor(a.y) ? 0 : 50) + Math.abs(a.x - e.x) - (sameFloor(b.y) ? 0 : 50) - Math.abs(b.x - e.x))[0]; goal = { x: near.x, y: near.y, thing: near }; } else if (after) goal = { x: P.x, y: P.y }; else if (!sameFloor(e.home.y) || e.x < e.lo - 1 || e.x > e.hi + 1) goal = { x: e.home.x, y: e.home.y, home: true };
    if (e.st === 'away'){ if (e.tm >= K.away){ const to = e.dest || e.doors[0]; e.x = to.x; e.y = to.y; hide(false); c.events.push({ type: 'servdoor', e, at: { x: e.x, y: e.y + 1 } }); c.go('walk'); } return; }
    const P1 = Math.abs(P.x - e.x) < K.reach && sameFloor(P.y) && (things.length || after);
    if (e.st === 'wind'){ c.anim(e, 'attack', Math.min(1, e.tm / K.wind) * 0.7);
      if (e.tm >= K.wind){ if (Math.abs(P.x - e.x) < K.reach + 0.3 && Math.sign(P.x - e.x) !== -e.face && sameFloor(P.y) && !c.isRollInv(P)){ if (P.blocking && P.face === -e.face){ e.flash = 0.08; c.events.push({ type: 'block', at: { x: P.x + P.face * 0.5, y: P.y + 1.2 }, mine: true, e }); } else c.hurt(P, 1, e.x, d.word); } c.events.push({ type: 'swept', e, at: { x: e.x + e.face * 1.2, y: e.y + 0.3 } }); c.go('rest'); } return; }
    if (e.st === 'rest'){ c.anim(e, 'attack', 0.9); if (e.tm >= K.rest) c.go('walk'); return; }
    if (P1 && e.st !== 'tend'){ e.face = Math.sign(P.x - e.x) || e.face; c.go('wind'); c.events.push({ type: 'tell', e }); return; }
    if (e.st === 'tend'){ c.anim(e, 'attack', (e.tm / K.tend * 2) % 1 * 0.4); if (!goal || !goal.thing || Math.abs(goal.x - e.x) > 1.2 || !sameFloor(goal.y)) c.go('walk'); else if (e.tm >= K.tend){ goal.thing.right = true; c.go('walk'); } return; }
    if (!goal){ const tx = e.dirn > 0 ? e.hi : e.lo; if (Math.abs(tx - e.x) < 0.15) e.dirn = -e.dirn; const s = Math.sign(tx - e.x); e.face = s || e.face; e.x += s * Math.min(Math.abs(tx - e.x), K.speed * dt); e.fr = (e.fr + dt * 0.8) % 1; if (e.st !== 'round') c.go('round'); c.anim(e, 'walk', e.fr); return; }
    // on its floor: go to it. On another: to the nearest servants' door here, and out by the one nearest it there
    let tx = goal.x;
    if (!sameFloor(goal.y)){ const here = e.doors.filter(q => sameFloor(q.y)).sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0], there = e.doors.filter(q => Math.abs(q.y - goal.y) < K.floor && Math.abs(q.x - goal.x) < 24).sort((a, b) => Math.abs(a.x - goal.x) - Math.abs(b.x - goal.x))[0];
      if (!here || !there){ c.anim(e, 'stand', 0); return; }   // no door of its own to where he is: it waits
      if (Math.abs(here.x - e.x) < 0.2){ e.dest = there; hide(true); c.events.push({ type: 'servdoor', e, at: { x: e.x, y: e.y + 1 } }); c.go('away'); return; } tx = here.x; }
    else if (goal.thing && Math.abs(goal.x - e.x) < 0.9){ e.face = Math.sign(goal.x - e.x) || e.face; c.go('tend'); return; }
    else if (goal.home && Math.abs(goal.x - e.x) < 0.3) return;
    const s = Math.sign(tx - e.x); e.face = s || e.face; e.x += s * Math.min(Math.abs(tx - e.x), K.quick * dt); e.fr = (e.fr + dt * 1.6) % 1; if (e.st !== 'walk') c.go('walk'); c.anim(e, 'walk', e.fr);
  },
};
