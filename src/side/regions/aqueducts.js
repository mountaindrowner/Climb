// The Aqueducts: the Gardens' wing, west of the wellspring and below it (docs/world.md, docs/phase13-sheet.md).
// The garden's water comes from the pool at the bottom of the world: carried up by hand in the first days, then by a
// channel the house built through the mountain. It still runs. Machines keep the sluices. Nine screens, open to
// anyone, set into the Gardens by level.js (WINGS): three columns added to the west.
//   arches   four screens: the channel on its arches, three spans of it fallen. In from the wellspring at the
//            channel's height; under it, the old beds. The water carries him east from deck to deck
//   sluices  two screens, one over the other: three falls of water down it, a wheel under each, a keeper by each wheel
//   lock     the Lock: the wing's keeper. A great gate that fights as it opens
//   head     where the water comes out of the rock. A relic. The spill's wheel
//   spill    the overflow, down to the wellspring: a fall of water until its wheel is shut, then a stair
// Its rule (level.js flows, RULE.wet; motor.js FLOW). The water runs one way, and it carries what stands in it: along
// a channel, faster than he runs; down a fall, and nothing rises through a fall. A sluice wheel (struck) stops its
// water, or starts it. The keepers of the sluices put each wheel back as it was.
import { rect, door, ledge, mark, cave, EMPTY, ROCK, STILLED } from '../rooms.js';

const TITLE = 'THE AQUEDUCTS';
const named = (fn, more = {}) => { const f = () => { const r = fn(); r.title = TITLE; r.look = 'aqueduct'; Object.assign(r, more); return r; }; Object.defineProperty(f, 'name', { value: fn.name }); return f; };
const deco = (r, kind, x, y) => mark(r, 'deco', x, y, { kind });
const keep = (r, x, y) => mark(r, 'keep', x, y);
const flow = (r, x, y, w, h, dir, key) => mark(r, 'flow', x, y, { w, h, dir, key });
const wheel = (r, x, y, key, more = {}) => mark(r, 'wheel', x, y, { key, open: true, ...more });   // (open: as the house left it. after: it can be come to only once the Lock is open)

// the channel's decks in the arches: [x0, x1] of each, west to east; the top of each is row DECK (he stands on DECK + 1)
export const DECKS = [[2, 14], [22, 31], [43, 52], [64, 77]], DECK = 24, BEDS = 9;
function arches(){
  const r = cave(2, 2); door(r, 'right', 25, 30); door(r, 'left', 10, 15);   // in from the wellspring, on the channel; out to the sluices, on the beds
  rect(r, 2, 2, 77, BEDS);                                         // the old beds under the arches
  rect(r, 2, 10, 77, 43, EMPTY);                                   // (all of it one space: nothing hangs in it but the channel)
  for (const [a, b] of DECKS){ rect(r, a, DECK - 1, b, DECK); deco(r, 'pier', Math.round((a + b) / 2), BEDS + 1); }
  rect(r, 2, DECK - 1, 7, DECK, EMPTY); ledge(r, 2, 7, DECK); for (const y of [13, 17, 21]) ledge(r, 3, 7, y);   // up from the beds to the channel's west end
  rect(r, 72, DECK - 1, 76, DECK, EMPTY); ledge(r, 72, 76, DECK); for (const y of [13, 17, 21]) ledge(r, 72, 76, y);   // and at its east end, by the door: down to the beds, and back up (one who cannot cross the gaps is not left below)
  flow(r, 8, DECK + 1, 7, 2, 'e', 'a'); for (const [a, b] of DECKS.slice(1, 3)) flow(r, a, DECK + 1, b - a + 1, 2, 'e', 'a');   // the water on each span, east (it comes in under the wheel); on the last it goes down a drain before the door
  flow(r, 64, DECK + 1, 7, 2, 'e', 'a'); deco(r, 'drain', 71, DECK + 1); deco(r, 'gate', 8, DECK + 1);
  wheel(r, 5, DECK + 1, 'a');                                      // on the dry stone at the channel's head
  mark(r, 'chest', 47, DECK + 1, { holds: 'thread' });             // on the middle span: only the water takes him there
  mark(r, 'strider', 27, DECK + 1, { key: 'a' }); mark(r, 'strider', 50, DECK + 1, { key: 'a' });   // (none on the span by the door: that one is for learning the water)
  mark(r, 'thornback', 34, BEDS + 1); mark(r, 'thornback', 58, BEDS + 1); mark(r, 'lasher', 46, BEDS + 1);
  mark(r, 'chest', 20, BEDS + 1, { holds: 'shards' });
  for (const [k, x] of [['bed', 16], ['bed', 38], ['bed', 54], ['bed', 70]]) deco(r, k, x, BEDS + 1);
  mark(r, 'urn', 26, BEDS + 1); mark(r, 'urn', 62, BEDS + 1); mark(r, 'crystal', 74, BEDS + 1); mark(r, 'crystal', 12, BEDS + 1);
  for (const x of [74, 76]) for (const y of [26, 29]) keep(r, x, y); for (const x of [3, 5]) for (const y of [11, 14]) keep(r, x, y);
  return r;
}
function sluices(){
  const r = cave(1, 2); door(r, 'right', 10, 15); door(r, 'top', 4, 9);   // in from the beds; up into the lock
  rect(r, 2, 2, 37, BEDS); rect(r, 2, 10, 37, 43, EMPTY);
  rect(r, 12, 20, 37, 21); rect(r, 2, 32, 27, 33);                 // two landings
  for (const y of [13, 17]) ledge(r, 4, 9, y); flow(r, 2, 10, 10, 12, 'd', 'f1'); wheel(r, 24, 10, 'f1');   // the first fall, and its wheel under it
  for (const y of [25, 29]) ledge(r, 30, 35, y); flow(r, 28, 22, 10, 12, 'd', 'f2'); wheel(r, 16, 22, 'f2');
  for (const y of [37, 41]) ledge(r, 4, 9, y); flow(r, 2, 34, 10, 12, 'd', 'f3'); wheel(r, 20, 34, 'f3');
  mark(r, 'sluicer', 32, 10, { lo: -18, hi: 4 }); mark(r, 'sluicer', 22, 22, { lo: -8, hi: 5 }); mark(r, 'sluicer', 14, 34, { lo: -1, hi: 11 });   // each keeps to its landing (lo, hi: how far it goes either way, in tiles)
  mark(r, 'chest', 34, 22, { holds: 'shards' });
  for (const [k, x, y] of [['gate', 7, 22], ['gate', 33, 34], ['gate', 7, 44]]) deco(r, k, x, y);
  mark(r, 'torch', 36, 14); mark(r, 'torch', 14, 26); mark(r, 'torch', 25, 38); mark(r, 'urn', 16, 10); mark(r, 'crystal', 30, 10);
  for (const x of [34, 36]) for (const y of [11, 14]) keep(r, x, y);
  return r;
}
function lock(){
  const r = cave(); door(r, 'bottom', 4, 9); ledge(r, 4, 9, 1); door(r, 'right', 2, 7);
  rect(r, 2, 2, 37, 20, EMPTY); rect(r, 34, 2, 37, 20, STILLED);   // the gate: shut, until the Lock is open
  rect(r, 14, 2, 16, 4); rect(r, 23, 2, 25, 4);                    // two piers to stand on, over the water
  flow(r, 10, 2, 24, 3, 'w', 'surge');                              // what the Lock lets go runs the length of the floor
  mark(r, 'lock', 32, 2);
  mark(r, 'chest', 28, 2, { holds: 'gift:drink', prize: 'still' });   // the wing's prize (build 95): a drink, by the Lock, shut while it holds
  mark(r, 'torch', 4, 10); mark(r, 'torch', 20, 12); mark(r, 'urn', 11, 2);
  for (const x of [31, 33]) keep(r, x, 3); for (const x of [13, 17, 22, 26]) for (const y of [2, 4]) keep(r, x, y); for (const x of [14, 16, 23, 25]) keep(r, x, 5);
  return r;
}
function head(){
  const r = cave(); door(r, 'left', 2, 7); door(r, 'right', 14, 19);
  rect(r, 16, 2, 21, 5); rect(r, 22, 2, 27, 9); rect(r, 28, 2, 37, 13);   // up to the spill's door
  deco(r, 'spout', 10, 2); mark(r, 'chest', 5, 2, { holds: 'relic:yoke' }); wheel(r, 31, 14, 'sp', { after: true });
  mark(r, 'torch', 3, 10); mark(r, 'torch', 24, 14); mark(r, 'crystal', 13, 2);
  for (const x of [34, 36]) for (const y of [15, 18]) keep(r, x, y);
  return r;
}
function spill(){
  const r = cave(); door(r, 'left', 14, 19); door(r, 'right', 4, 9);
  rect(r, 2, 2, 37, 20, EMPTY); rect(r, 2, 2, 9, 13); rect(r, 30, 2, 37, 3);   // the top of it, at the head's door; the foot of it, at the wellspring's
  ledge(r, 22, 27, 7); ledge(r, 14, 19, 11);                         // the stair, when it is dry
  flow(r, 10, 6, 20, 16, 'd', 'sp');
  deco(r, 'gate', 10, 14); mark(r, 'torch', 34, 12); mark(r, 'urn', 12, 2);
  for (const x of [3, 5]) for (const y of [15, 18]) keep(r, x, y); for (const x of [34, 36]) for (const y of [5, 8]) keep(r, x, y);
  return r;
}

// set into the Gardens: three columns to the west of it (as the region counts cells: the wellspring is column 0, two
// rows high), from one row below the wellspring to its top
export const wing = { left: 3, build(X){
  const ws = X.roomOf('wellspring'); if (!ws) return; const row = Math.round((ws.ty0 - X.Y0) / 23);
  for (let y = 0; y < X.H; y++) for (let x = 0; x < X.X0; x++) X.set(x, y, ROCK);   // west of the garden it is the mountain
  X.addRoom(-2, row - 1, named(arches), { wing: true });
  X.addRoom(-3, row - 1, named(sluices), { wing: true });
  X.addRoom(-3, row + 1, named(lock), { wing: true });
  X.addRoom(-2, row + 1, named(head), { wing: true, after: true });   // after: behind the Lock
  X.addRoom(-1, row + 1, named(spill), { wing: true });                // (its foot is come to from the wellspring; its top only from the head)
  for (const [y0, y1] of [[2, 7], [27, 32]]) for (let y = y0; y <= y1; y++) for (let x = ws.tx0; x < ws.tx0 + 6; x++){ if (x >= ws.tx0 + 2 && X.at(x, ws.ty0 + y) !== ROCK) break; X.set(x, ws.ty0 + y, EMPTY); }   // two doors in the wellspring's west wall: to the channel, and from the spill
} };
export const QUIET = ['head'];

// ---- its look: the house's cut stone, cool, the water's light on it
export const looks = {
  aqueduct: {
    stone: { edge: 'ink', topEdge: 'pale', lip: 'white', lip2: 'pale', lipD: 3, lip2D: 4, a: 'light', aSeam: 'mid', b: 'mid', bSeam: 'dark', c: 'dark', core: 'deep', seam: 'brick' },
    moss: { c: ['moss1', 'moss2', 'moss0'], p: 0.35 }, plank: ['wood1', 'wood3', 'wood0', 'wood2'], spike: ['moss0', 'cyan'],
    ceilLow: [['vine', 6]], ceil: [['vine', 30], ['root', 10], ['chain', 6]], floorWall: ['fern', 'rubble', 'drum', 'fern'], floorOpen: ['fern', 'flowers', 'rubble', 'fern'], gem: 'crystal',
    back: { cols: ['deep', 'dark', 'mid'], dim: [1, 0.95, 0.9], hole: 5, holeOpen: 2.2, stand: [['column', 8]], hang: [['vine', 40]], pStand: 0.014, pHang: 0.02 },
    far: { img: 'gardens', raw: true }, hemi: [0xe8f4ff, 0xb8d0e0, 1.0], shaft: 'rgba(190,230,255,0.45)', bloom: [0.9, 0.4],
    amb: [0.92, 1.0, 1.06], ambIn: [0.5, 0.6, 0.68], mist: { col: 'pale', col2: 'cyan', a: 0.14, drift: 0.25 }, fore: 'roots',
    air: { n: 40, cols: [0xbfe8ff, 0xffffff], warm: 0.2, vx: 0.3, vy: [-0.4, -0.1], drift: 0.2, steady: true },
  },
};
// ---- what stands in it, painted (a 'deco' mark): x the middle, y the floor
export const decoDef = (px, PAL) => ({
  // a pier of the arcade, from the beds up to the channel, an arch springing from each side of it
  pier(g, x, y){ const H = (DECK - 1 - BEDS - 1) * 8; px(g, PAL.ink, x - 9, y - H, 18, H); px(g, PAL.mid, x - 8, y - H, 16, H); px(g, PAL.light, x - 8, y - H, 3, H); px(g, PAL.dark, x + 5, y - H, 3, H); for (let b = 10; b < H; b += 10){ px(g, PAL.dark, x - 8, y - b, 16, 1); px(g, PAL.dark, x - (b % 20 ? 3 : -2), y - b, 1, 10); }
    px(g, PAL.ink, x - 12, y - 4, 24, 4); px(g, PAL.light, x - 11, y - 3, 22, 2); for (let a = 0; a < 26; a++){ const d = Math.round(Math.sqrt(a) * 4.4); for (const s of [-1, 1]){ px(g, PAL.ink, x + s * (9 + a) - (s < 0 ? 1 : 0), y - H + d - 1, 1, 5); px(g, PAL.mid, x + s * (9 + a) - (s < 0 ? 1 : 0), y - H + d, 1, 3); } } },
  // one of the old beds: a low stone kerb, gone to fern
  bed(g, x, y, r){ px(g, PAL.ink, x - 12, y - 4, 24, 4); px(g, PAL.mid, x - 11, y - 3, 22, 3); px(g, PAL.light, x - 11, y - 3, 22, 1); for (let k = 0; k < 9; k++){ const a = Math.floor(r() * 21) - 10, h = 3 + Math.floor(r() * 7); px(g, PAL.moss0, x + a, y - 3 - h, 1, h); px(g, PAL.moss1, x + a + 1, y - 3 - h + 2, 1, h - 2); if (k % 3 === 0) px(g, PAL.rose, x + a, y - 4 - h, 2, 2); } },
  // a drain in the channel's floor: the water goes down it
  drain(g, x, y){ px(g, PAL.ink, x - 7, y - 3, 14, 3); for (let a = -6; a < 6; a += 3) px(g, PAL.deep, x + a, y - 2, 2, 2); px(g, PAL.cyan, x - 6, y - 3, 12, 1); },
  // a sluice gate over the head of a fall: a stone frame, an iron plate in it
  gate(g, x, y){ px(g, PAL.ink, x - 14, y - 14, 28, 14); px(g, PAL.mid, x - 13, y - 13, 26, 12); px(g, PAL.light, x - 13, y - 13, 26, 2); px(g, PAL.ink, x - 9, y - 9, 18, 9); px(g, PAL.dark, x - 8, y - 8, 16, 8); for (let a = -7; a < 8; a += 4) px(g, PAL.ink, x + a, y - 8, 1, 8); px(g, PAL.cyan, x - 8, y - 1, 16, 1); },
  // where the water comes out of the rock: a carved mouth in the wall, a ring over it, the stream from it
  spout(g, x, y){ px(g, PAL.ink, x - 13, y - 44, 26, 30); px(g, PAL.mid, x - 12, y - 43, 24, 28); px(g, PAL.light, x - 12, y - 43, 24, 2); px(g, PAL.ink, x - 6, y - 40, 12, 12); px(g, PAL.pale, x - 5, y - 39, 10, 10); px(g, PAL.ink, x - 3, y - 37, 6, 6); px(g, PAL.ink, x - 5, y - 24, 10, 8); px(g, PAL.deep, x - 4, y - 23, 8, 6);
    px(g, PAL.cyan, x - 3, y - 18, 6, 16); px(g, PAL.white, x - 2, y - 18, 1, 16); px(g, PAL.pale, x + 1, y - 18, 1, 16); px(g, PAL.ink, x - 12, y - 3, 24, 3); px(g, PAL.cyan, x - 11, y - 2, 22, 1); px(g, PAL.white, x - 6, y - 3, 12, 1); },
});

// ---- who is in it
const three = () => { const T3 = typeof window !== 'undefined' && window.THREE; return T3 && T3.Group && T3.CanvasTexture && typeof document !== 'undefined' ? T3 : null; };
const pix = (T3, w, h, paint) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); paint((col, x, y, ww, hh) => { g.fillStyle = col; g.fillRect(x, y, ww, hh); }); const t = new T3.CanvasTexture(c); t.magFilter = t.minFilter = T3.NearestFilter; t.generateMipmaps = false; return t; };
const mesh = (T3, map, w, h, more = {}) => new T3.Mesh(new T3.PlaneGeometry(w, h), new T3.MeshBasicMaterial({ map, transparent: true, alphaTest: 0.5, ...more }));
const spokes = (f, n, rim, hub, dark) => { const c = n / 2; for (let y = 0; y < n; y++) for (let x = 0; x < n; x++){ const d = Math.hypot(x + 0.5 - c, y + 0.5 - c); if (d < c && d > c - 1.2) f(dark, x, y, 1, 1); else if (d <= c - 1.2 && d > c - 3.2) f(rim, x, y, 1, 1); } for (let a = 1; a < n - 1; a++){ f(rim, a, Math.floor(c) - 1, 1, 2); f(rim, Math.floor(c) - 1, a, 2, 1); } f(dark, Math.floor(c) - 2, Math.floor(c) - 2, 4, 4); f(hub, Math.floor(c) - 1, Math.floor(c) - 1, 2, 2); };
let TEX = null;
const texes = T3 => TEX || (TEX = {
  post: pix(T3, 10, 14, f => { f('#181425', 2, 0, 6, 14); f('#8b9bb4', 3, 1, 4, 13); f('#c0cbdc', 3, 1, 1, 13); f('#181425', 0, 11, 10, 3); f('#5a6988', 1, 12, 8, 2); }),
  wheel: pix(T3, 14, 14, f => spokes(f, 14, '#d77643', '#feae34', '#181425')),
  frame: pix(T3, 22, 56, f => { f('#181425', 0, 0, 22, 56); f('#5a6988', 1, 1, 20, 54); f('#8b9bb4', 1, 1, 3, 54); f('#3a4466', 17, 1, 4, 54); for (let y = 8; y < 56; y += 9) f('#3a4466', 1, y, 20, 1); f('#181425', 5, 30, 12, 26); f('#262b44', 6, 31, 10, 25); for (let x = 7; x < 16; x += 3) f('#181425', x, 31, 1, 25); }),
  great: pix(T3, 26, 26, f => spokes(f, 26, '#d77643', '#feae34', '#181425')),
  spray: pix(T3, 24, 10, f => { for (let k = 0; k < 24; k++){ const h = 2 + (k * 7) % 7; f('#bfe8ff', k, 10 - h, 1, h); if (k % 3 === 0) f('#ffffff', k, 10 - h, 1, 2); } }),
});
const wetNow = (R, key) => !!(R.wetAll || (R.wet && R.wet.has(key)));
export const LOCK = { hp: 24, period: [6, 4.6, 3.4], warn: 1.0, flood: 1.6, front: 0.5 };

export const enemies = {
  // a sluice wheel: struck, its water stops; struck again, it runs. Not a creature
  wheel: { ai: 'wheel', own: true, prop: true, hp: 99, w: 0.6, h: 1.4, color: 0xd77643, fly: false, guard(e){ e.struck = true; return true; }, onHit(e){ e.hp = e.d.hp; e.struck = true; } },
  // a keeper of the sluices: a stone servant of the house. It walks its landing. A wheel that is not as the house left
  // it, it goes to, and puts back. What stands in its way it strikes down, slowly. It can be broken
  sluicer: { ai: 'sluicer', heavy: 2, hp: 6, w: 0.8, h: 1.9, color: 0x8b9bb4, speed: 1.8, hurry: 3.0, turn: 1.3, wind: 0.6, rest: 0.9, reach: 1.7, art: 'px_sluicer', fly: false, word: 'Struck down' },
  // a water-strider: it lives on running water, and on running water it is fast. With its water stopped it sits where it was left
  strider: { ai: 'strider', hp: 2, w: 0.9, h: 0.6, color: 0x2ce8f5, speed: 6.5, dart: 10, art: 'px_strider', fly: false, word: 'Stung' },
  // the Lock: the wing's keeper. The great gate between the channel and the head. It opens by thirds, as it is struck;
  // and again and again it lets go what it holds, down the length of the floor: be up on a pier when it does
  lock: { ai: 'lock', own: true, hp: LOCK.hp, w: 1.4, h: 3.4, color: 0x8b9bb4, fly: false, name: 'The Lock', word: 'Swept away', onHit(e){ e.woke = true; }, onKill(e){ if (e.parts){ e.parts.spray.visible = false; e.parts.great.material.color.setHex(0x8f96a8); } },
    spawn(e, c){ if (!c.RULE.still) return; e.alive = false; const T3 = three(); if (!T3) return; const fr = mesh(T3, texes(T3).frame, 22 / 16, 56 / 16); fr.position.set(e.x + 0.4, e.y + 5.2, 0.03); fr.material.color.setHex(0x9aa2b6); c.scene.add(fr); } },
};
export const ai = {
  wheel(e, P, dt, c){
    const R = c.RULE, m = e.mk || {}; e.st = 'idle'; e.cool = Math.max(0, (e.cool || 0) - dt);
    if (e.struck){ e.struck = false; if (e.cool <= 0){ e.cool = 0.45; c.events.push({ type: 'sluice', e, key: m.key, at: { x: e.x, y: e.y + 1 } }); } }
    const T3 = three(); if (!T3) return;
    if (!e.g){ const X = texes(T3), g = new T3.Group(), post = mesh(T3, X.post, 0.625, 0.875), wh = mesh(T3, X.wheel, 0.875, 0.875); post.position.y = 0.44; wh.position.set(0, 1.0, 0.001); g.add(post); g.add(wh); g.position.set(e.x, e.y, 0.04); c.E.scene.add(g); e.g = g; e.wh = wh; }
    const on = wetNow(R, m.key); e.wh.rotation.z -= dt * (on ? 2.4 : 0) + (e.cool > 0 ? dt * 14 : 0); e.wh.material.color.setHex(e.flash > 0 ? 0xffffff : on ? 0xffffff : 0x8f96a8);
  },
  sluicer(e, P, dt, c){
    const d = e.d, R = c.RULE, m = e.mk || {}, lo = e.home.x + (m.lo == null ? -8 : m.lo) * c.T, hi = e.home.x + (m.hi == null ? 8 : m.hi) * c.T; e.fr = e.fr || 0; e.dirn = e.dirn || -1;
    if (R.still){ if (e.st !== 'idle') c.go('idle'); c.anim(e, 'stand', 0); return; }   // the Lock is open: the house's servants have nothing left to keep
    if (!e.wheels) e.wheels = (c.marks || []).filter(w => w.type === 'wheel' && Math.abs(w.y * c.T - e.home.y) < 1 && (w.x + 0.5) * c.T >= lo - 1 && (w.x + 0.5) * c.T <= hi + 1);
    const off = e.wheels.find(w => wetNow(R, w.key) !== (w.open !== false)), near = Math.abs(c.dx) < d.reach && Math.abs(c.dy) < 1.6;
    if (e.st === 'wind'){ c.anim(e, 'attack', Math.min(1, e.tm / d.wind) * 0.75);
      if (e.tm >= d.wind){ if (Math.abs(P.x - e.x) < d.reach + 0.3 && Math.sign(P.x - e.x) !== -e.face && Math.abs(P.y - e.y) < 1.6 && !c.isRollInv(P)){ if (P.blocking && P.face === -e.face){ e.flash = 0.08; c.events.push({ type: 'block', at: { x: P.x + P.face * 0.5, y: P.y + 1.2 }, mine: true, e }); } else c.hurt(P, 1, e.x, d.word); }
        c.events.push({ type: 'thud', e, at: { x: e.x + e.face * 0.9, y: e.y } }); c.go('rest'); } return; }
    if (e.st === 'rest'){ c.anim(e, 'attack', 0.9); if (e.tm >= d.rest) c.go('idle'); return; }
    if (e.st === 'turn'){ c.anim(e, 'attack', (e.tm / d.turn * 2) % 1 * 0.5); if (!off) c.go('idle'); else if (e.tm >= d.turn){ c.events.push({ type: 'sluice', e, key: off.key, by: 'keeper', at: { x: (off.x + 0.5) * c.T, y: off.y * c.T + 1 } }); c.go('rest'); } if (near){ e.face = Math.sign(c.dx) || e.face; c.go('wind'); c.events.push({ type: 'tell', e }); } return; }
    if (near){ e.face = Math.sign(c.dx) || e.face; c.go('wind'); c.events.push({ type: 'tell', e }); return; }
    let tx, sp = d.speed;
    if (off){ tx = Math.max(lo, Math.min(hi, (off.x + 0.5) * c.T + (e.x < (off.x + 0.5) * c.T ? -0.7 : 0.7))); sp = d.hurry; if (Math.abs(tx - e.x) < 0.15){ e.face = Math.sign((off.x + 0.5) * c.T - e.x) || e.face; c.go('turn'); return; } }
    else { tx = e.dirn > 0 ? hi : lo; if (Math.abs(tx - e.x) < 0.15){ e.dirn = -e.dirn; tx = e.dirn > 0 ? hi : lo; } }
    const s = Math.sign(tx - e.x); e.face = s || e.face; e.x += s * Math.min(Math.abs(tx - e.x), sp * dt); e.fr = (e.fr + dt * sp * 0.45) % 1; if (e.st !== 'walk') c.go('walk'); c.anim(e, 'walk', e.fr);
  },
  strider(e, P, dt, c){
    const d = e.d, R = c.RULE, m = e.mk || {}; e.fr = e.fr || 0; e.dirn = e.dirn || 1;
    if (!e.lane) e.lane = (c.flows || []).find(f => f.dx && e.home.x >= f.x0 && e.home.x < f.x1 && Math.abs(f.y0 - e.home.y) < 0.6) || { x0: e.home.x - 2, x1: e.home.x + 2, key: m.key };
    const wet = wetNow(R, e.lane.key), lo = e.lane.x0 + 0.6, hi = e.lane.x1 - 0.6, inLane = P.x > e.lane.x0 - 0.4 && P.x < e.lane.x1 + 0.4 && Math.abs(P.y - e.y) < 1.2; e.wet = wet;
    if (!wet){ if (e.st !== 'idle') c.go('idle'); c.anim(e, 'stand', 0); return; }   // its water is stopped: it sits where it was left
    if (e.st === 'rest'){ if (e.tm > 0.7) c.go('skate'); }
    else { if (e.st !== 'skate') c.go('skate'); if (inLane && Math.abs(P.x - e.x) > 0.3) e.dirn = Math.sign(P.x - e.x); e.x += e.dirn * (inLane ? d.dart : d.speed) * dt; if (e.x < lo){ e.x = lo; e.dirn = 1; } if (e.x > hi){ e.x = hi; e.dirn = -1; } e.face = e.dirn;
      if (inLane && Math.abs(P.x - e.x) < 0.7 && !c.isRollInv(P)){ if (P.blocking && P.face === (Math.sign(e.x - P.x) || P.face)){ e.flash = 0.08; c.events.push({ type: 'block', at: { x: P.x + P.face * 0.5, y: P.y + 1 }, mine: true, e }); c.go('rest'); e.dirn = -e.dirn; } else if (c.hurt(P, 1, e.x, d.word)) c.go('rest'); } }
    e.fr = (e.fr + dt * 2.2) % 1; c.anim(e, 'skate', e.fr);
  },
  lock(e, P, dt, c){
    const R = c.RULE, d = e.d; e.ch = e.ch || 0; e.stage = e.hp > LOCK.hp * 2 / 3 ? 0 : e.hp > LOCK.hp / 3 ? 1 : 2; if (e.st !== 'burst') e.st = 'idle';
    e.x = e.home.x; e.y = e.home.y;                                  // it is built into the wall: a blow does not move it
    if (!e.woke && Math.abs(c.dx) < 13 && Math.abs(c.dy) < 4) e.woke = true;   // it begins when he is in its room
    if (e.st === 'burst'){ if (e.tm >= LOCK.warn){ c.events.push({ type: 'flood', e, secs: LOCK.flood, at: { x: e.x - 1, y: e.y + 0.6 } }); e.ch = 0; e.flood = LOCK.flood; e.swept = false; c.go('idle'); } }
    else if (e.woke){ e.ch = Math.min(1, e.ch + dt / LOCK.period[e.stage]); if (e.ch >= 1){ c.go('burst'); c.events.push({ type: 'tell', e }); } }
    if (e.flood > 0){ e.flood -= dt; if (!e.swept && e.flood > LOCK.flood - LOCK.front && P.flow && P.flow.key === 'surge' && !c.isRollInv(P)){ e.swept = true; c.hurt(P, 1, e.x, d.word); } }
    e.warn = e.st === 'burst';
    const T3 = three(); if (!T3) return;
    if (!e.parts){ const X = texes(T3), frame = mesh(T3, X.frame, 22 / 16, 56 / 16), great = mesh(T3, X.great, 26 / 16, 26 / 16), spray = mesh(T3, X.spray, 2.2, 0.9, { alphaTest: 0, depthWrite: false, blending: T3.AdditiveBlending, opacity: 0 });
      frame.position.set(e.x + 0.4, e.y + 1.75, 0.03); great.position.set(e.x - 0.1, e.y + 2.3, 0.032); spray.position.set(e.x - 1.3, e.y + 0.45, 0.033); for (const q of [frame, great, spray]) c.E.scene.add(q); e.parts = { frame, great, spray }; }
    const { frame, great, spray } = e.parts, burst = e.st === 'burst'; frame.position.y = e.y + 1.75 + e.stage * 0.55 + (burst ? Math.sin(e.tm * 60) * 0.03 : 0);
    great.rotation.z += dt * (burst ? 9 : e.flood > 0 ? -14 : e.ch * 2.5); great.material.color.setHex(e.flash > 0 ? 0xffffff : 0xffffff); frame.material.color.setHex(e.flash > 0 ? 0xffffff : burst && Math.sin(e.tm * 38) > 0 ? 0xdff4ff : 0xc8d0e0);
    spray.material.opacity = e.flood > 0 ? 0.9 : burst ? 0.3 + 0.4 * Math.abs(Math.sin(e.tm * 30)) : e.ch * 0.25; spray.scale.y = e.flood > 0 ? 1.8 : burst ? 1.2 : 0.7; spray.scale.x = (Math.floor(e.age * 12) % 2 ? 1 : -1);
  },
};
