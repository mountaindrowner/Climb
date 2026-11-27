// The Cloister's far ends (docs/edges-sheet.md, section 2; build 117): what lies past each of its wings, set into the
// Cloister by level.js (EDGES), one column further west and one further east.
// West, past the copying hall of the Scriptorium: THE EMPTY SHELVES. Where the finished books were to go. No book was
// ever finished: three screens of shelving, floor to roof, with nothing on it.
//   shelves  three screens tall, in off the hall's floor. Three galleries of shelving, east, west and west again, each
//            too far over the last to be climbed to; and the two ladders
//   bindery  over the shelves and over the rubrication: the binders' loft. Presses, thread, covers with nothing in them.
//            A thread, a chest, the ledger
// Its working is the ladders of the stacks (docs/bare-wings-sheet.md, section 2): each runs on a rail, and stands where
// the last copyist left it, which is the wrong end. Struck, a ladder rolls to the other end of its rail and stays
// (level.js railAt; a mover of kind 'rail'). The first is on the floor; the second hangs over the first gallery and
// cannot be come to until the first has been sent.
// East, past the slag runs of the Bell-Foundry: THE CULL. Where the bells that came out wrong were thrown.
//   cull     three screens, in off the foot of the slag runs on to a landing two-thirds of the way up it. A pit of
//            cracked bells; steps of the wall down to its floor; across the pit, on the far landing, a cell with a
//            shutter for its door
// Its working is the casting crane: a ladle hung from a rail across the pit, left at the far side. Its winch is on the
// pit's floor. Sent, the ladle comes over; standing on it, he strikes its chains and it carries him back across. Two
// tongues hang in its way, low enough that he must crouch: touched, they ring, the cell's shutter drops (the foundry's
// rule), and the slag on the floor wakes.
import { room, rect, mark, EMPTY, SHUTTER } from '../rooms.js';
import { looks as SCRIPT } from './scriptorium.js';

const TITLE = 'THE EMPTY SHELVES';
const named = (fn, look = 'bareshelves', gate = 'dash') => { const f = () => { const r = fn(); r.title = r.title || TITLE; r.gate = gate; r.look = look; return r; }; Object.defineProperty(f, 'name', { value: fn.name }); return f; };
const deco = (r, kind, x, y, more) => mark(r, 'deco', x, y, { kind, ...more });
const keep = (r, x, y) => mark(r, 'keep', x, y);
const mass = (cw = 1, ch = 1) => { const r = room(cw, ch); rect(r, 0, 0, r.w - 1, r.h - 1); return r; };
const keeps = (r, x0, y0, x1, y1) => { for (let y = y0; y <= y1; y += 2) for (let x = x0; x <= x1; x += 3) if (r.tiles[y] && r.tiles[y][x] === EMPTY) keep(r, x, y); };
// a ladder: where its foot is when it stands at the end it was left at; how far it rolls; its rungs (rows over its
// foot); how long the roll takes. Each rung is a mover on the ladder's key; the ladder itself is the thing he strikes
export const LADDERS = {
  floor: { x: 5, y: 2, dx: 17, rungs: [3, 8, 13], secs: 2.6 },      // on the floor, at the west wall: sent, it stands under the lip of the first gallery
  hung: { x: 32, y: 22, dx: -12, rungs: [3, 8, 13], secs: 2.2 },    // hung over the first gallery's far end: sent, it hangs beside the lip of the second
};
const ladder = (r, key) => { const L = LADDERS[key]; mark(r, 'ladder', L.x, L.y, { key, tall: L.rungs[L.rungs.length - 1] + 2 });
  for (const up of L.rungs) mark(r, 'mover', L.x, L.y + up, { kind: 'rail', dx: L.dx, dy: 0, secs: L.secs, key, look: 'rung', w: 4 }); };
// the galleries, in the shelves' own rows: [the row he stands at, from, to]. Each step on the west wall stands out
// further than the one over it, so he rises beside its lip from the one below
// (the steps over the second gallery are six rows apart, and the last is seven under the loft's floor: no more than a leap)
export const GAL = { east: [20, 26, 37], west: [40, 2, 17], steps: [[46, 15], [52, 13], [58, 11], [64, 9]], far: [56, 28, 37], hole: [6, 11], cornice: [[2, 12, 20], [28, 37, 40]] };

function shelves(){
  const r = mass(1, 3);
  rect(r, 2, 2, 37, 66, EMPTY);
  for (const k of ['east', 'west', 'far']){ const [y, x0, x1] = GAL[k]; rect(r, x0, y - 2, x1, y - 1); }
  for (const [y, x1] of GAL.steps) rect(r, 2, y - 1, x1, y - 1); rect(r, 2, 64, 5, 66);   // (each step one course of stone: five rows of head under the next. The last step's inner end is filled to the roof: he stands on the rest of it, under the hole)
  rect(r, GAL.hole[0], 67, GAL.hole[1], 68, EMPTY);                // up into the binders' loft, over the highest gallery
  // a cornice of the shelving over each ladder where it was left: from its top rung there, there is no leaping on (and
  // no gliding across: the gift of the Seated does not make the ladders nothing)
  for (const [x0, x1, y] of GAL.cornice) rect(r, x0, y, x1, y + 1);
  ladder(r, 'floor'); ladder(r, 'hung');
  for (const [x, y] of [[10, 2], [30, 2], [31, 20], [8, 40], [33, 56]]) deco(r, 'emptycase', x, y);
  deco(r, 'shelfmark', 20, 2, { says: 'FOR THE FINISHED BOOKS.' }); deco(r, 'shelfmark', 12, 40, { says: 'FOR THE FINISHED BOOKS. SECOND SHELF.' });
  mark(r, 'chest', 34, 56, { holds: 'shards' }); mark(r, 'urn', 35, 20); mark(r, 'urn', 4, 40); mark(r, 'urn', 14, 2);
  mark(r, 'blot', 22, 2); mark(r, 'blot', 10, 40);
  mark(r, 'torch', 36, 8); mark(r, 'torch', 3, 12); mark(r, 'torch', 36, 26); mark(r, 'torch', 3, 30); mark(r, 'torch', 3, 46); mark(r, 'torch', 36, 44); mark(r, 'torch', 36, 62); mark(r, 'torch', 3, 64);
  keeps(r, 2, 2, 37, 66); keep(r, 8, 67); keep(r, 8, 68); keep(r, 10, 67); keep(r, 10, 68);
  return r;
}
function bindery(){
  const r = mass(2, 1);
  rect(r, 2, 2, 77, 13, EMPTY); rect(r, GAL.hole[0], 0, GAL.hole[1], 1, EMPTY);
  rect(r, 30, 2, 33, 3); rect(r, 58, 2, 77, 4);                    // a step by the presses; the dais at the far end, where the ledger is
  deco(r, 'press', 22, 2); deco(r, 'press', 40, 2); deco(r, 'press', 50, 2); deco(r, 'covers', 16, 2); deco(r, 'covers', 46, 2); deco(r, 'covers', 62, 5); deco(r, 'spools', 36, 9); deco(r, 'spools', 54, 9);
  deco(r, 'ledger', 68, 5, { says: 'BOOKS BOUND THIS YEAR: NONE. AS LAST YEAR.' });
  mark(r, 'thread', 74, 5); mark(r, 'chest', 71, 5, { holds: 'shards' }); mark(r, 'urn', 26, 2); mark(r, 'urn', 44, 2); mark(r, 'urn', 60, 5);
  mark(r, 'torch', 14, 8); mark(r, 'torch', 34, 8); mark(r, 'torch', 56, 9); mark(r, 'torch', 76, 10); mark(r, 'torch', 3, 8);
  keeps(r, 2, 2, 77, 13); keep(r, 8, 0); keep(r, 8, 1); keep(r, 10, 0); keep(r, 10, 1);
  return r;
}

// the Cull, in its own rows: the landings (the row he stands at), the crane's two stops, the steps down the west wall
// (the far landing stands ten rows over the near one, and the rail climbs to it: no leap or glide from the near side comes up to it)
export const CULL = { land: 48, far: 58, west: [2, 9], east: [30, 37], crane: { x: 26, dx: -14, dy: -10, secs: 4.5, key: 'crane' }, steps: [[41, 11], [35, 13], [29, 15], [23, 17], [17, 19], [11, 21]] };
function cull(){
  const r = mass(1, 3); r.title = 'THE BELL-FOUNDRY';
  rect(r, 2, 4, 37, 66, EMPTY);
  // the landing he comes in on, and the steps of the wall under it, each standing out further than the one over it
  rect(r, CULL.west[0], CULL.land - 2, CULL.west[1], CULL.land - 1); for (const [y, x1] of CULL.steps) rect(r, 2, y - 1, x1, y - 1);   // (one course of stone each: five rows of head under the next)
  // the far landing: a cell on it, walled and roofed, a shutter for its door
  rect(r, CULL.east[0], CULL.far - 2, CULL.east[1], CULL.far - 1); rect(r, CULL.east[0], CULL.far + 6, 37, 66); rect(r, CULL.east[0], CULL.far, CULL.east[0] + 1, CULL.far + 5, SHUTTER);
  // the crane: the ladle, left at the far side; its chains, which he strikes when he stands on it; its winch, on the floor
  mark(r, 'mover', CULL.crane.x, CULL.far, { kind: 'rail', dx: CULL.crane.dx, dy: CULL.crane.dy, secs: CULL.crane.secs, key: CULL.crane.key, look: 'ladle', w: 4 });
  mark(r, 'ladder', CULL.crane.x, CULL.far, { key: CULL.crane.key, tall: 8, iron: true }); mark(r, 'winch', 31, 4, { key: CULL.crane.key });
  // two tongues in the ladle's way, their tips two rows over where he stands on it as it passes
  mark(r, 'clapper', 16, CULL.land + 5); mark(r, 'clapper', 21, CULL.land + 8);
  mark(r, 'slag', 26, 4); mark(r, 'slag', 35, 4);
  for (const [x, y] of [[24, 4], [29, 4], [35, 4]]) deco(r, 'dumbbell', x, y); deco(r, 'dumbbell', 14, 11); deco(r, 'castmark', 27, 4, { says: 'IT DID NOT RING TRUE. CAST AGAIN.' });
  mark(r, 'thread', 35, CULL.far); mark(r, 'chest', 5, 4, { holds: 'shards' }); mark(r, 'urn', 8, 4); mark(r, 'urn', 33, CULL.far); mark(r, 'crystal', 37, CULL.far);
  mark(r, 'torch', 5, CULL.land + 4); mark(r, 'torch', 3, 33); mark(r, 'torch', 36, 20); mark(r, 'torch', 30, 8); mark(r, 'torch', 36, 40); mark(r, 'torch', 3, 21);
  keeps(r, 2, 4, 37, 62);
  return r;
}

export const far = { left: 4, right: 5, build(X){
  const hall = X.roomOf('hall'); if (!hall) return; const { EMPTY: E } = X.tile;
  const cx = Math.round((hall.tx0 - X.X0) / 40) - 1, cy = Math.round((hall.ty0 - X.Y0) / 23);   // the column west of the hall, from its floor
  const sh = X.addRoom(cx, cy, named(shelves), { wing: true, far: true }); X.addRoom(cx, cy + 3, named(bindery), { wing: true, far: true });
  // the way in: through the hall's west wall at its floor
  for (let y = 2; y <= 7; y++){ for (const x of [0, 1]) X.set(hall.tx0 + x, hall.ty0 + y, E); for (const x of [38, 39]) X.set(sh.tx0 + x, sh.ty0 + y, E); }
  // ---- east: the Cull, beside the slag runs and two screens lower than their foot
  const sl = X.roomOf('slagruns'); if (!sl) return;
  const ex = Math.round((sl.tx0 - X.X0) / 40) + 1, ey = Math.round((sl.ty0 - X.Y0) / 23) - 2;
  const cu = X.addRoom(ex, ey, named(cull, 'foundry', 'breaker'), { wing: true, far: true });
  for (let y = 2; y <= 7; y++){ for (const x of [38, 39]) X.set(sl.tx0 + x, sl.ty0 + y, E); for (const x of [0, 1]) X.set(cu.tx0 + x, cu.ty0 + 46 + y, E); }
} };

// the Scriptorium's look with the books taken off its walls: nothing was ever put on these shelves
export const looks = { bareshelves: { ...SCRIPT.scriptorium, floorWall: ['candles', 'spoils'], back: { ...SCRIPT.scriptorium.back, wall: [['chain', 2], ['banner', 1]], pWall: 0.0012 } } };

// ---- what stands in it, painted (a 'deco' mark)
export const decoDef = (px, PAL) => ({
  // a case of shelves with nothing on them: uprights, five boards, dust
  emptycase(g, x, y){ const w = 46, h = 60; px(g, PAL.ink, x - w / 2, y - h, w, h); px(g, PAL.deep, x - w / 2 + 2, y - h + 2, w - 4, h - 2); for (let k = 0; k < 5; k++){ const yy = y - 3 - k * 12; px(g, PAL.wood0, x - w / 2 + 2, yy, w - 4, 2); px(g, PAL.wood1, x - w / 2 + 2, yy, w - 4, 1); }
    px(g, PAL.wood1, x - w / 2 + 1, y - h + 1, 1, h - 1); px(g, PAL.wood1, x + w / 2 - 2, y - h + 1, 1, h - 1); px(g, PAL.wood2, x - w / 2 + 1, y - h + 1, w - 2, 1); },
  // the label on a shelf (main.js says it when he stands by it): a card in a brass holder
  shelfmark(g, x, y){ px(g, PAL.ink, x - 8, y - 16, 16, 8); px(g, '#b86f50', x - 7, y - 15, 14, 6); px(g, PAL.pale, x - 6, y - 14, 12, 4); px(g, PAL.mid, x - 4, y - 13, 8, 1); px(g, PAL.mid, x - 4, y - 11, 5, 1); },
  // a binder's press: two posts, a screw, a board, nothing under it
  press(g, x, y){ px(g, PAL.ink, x - 12, y - 4, 24, 4); px(g, PAL.wood1, x - 11, y - 3, 22, 2); px(g, PAL.ink, x - 11, y - 26, 4, 22); px(g, PAL.wood0, x - 10, y - 25, 2, 21); px(g, PAL.ink, x + 7, y - 26, 4, 22); px(g, PAL.wood0, x + 8, y - 25, 2, 21);
    px(g, PAL.ink, x - 12, y - 29, 24, 4); px(g, PAL.wood1, x - 11, y - 28, 22, 2); px(g, PAL.ink, x - 2, y - 36, 4, 22); px(g, '#8b9bb4', x - 1, y - 35, 2, 20); px(g, PAL.ink, x - 7, y - 38, 14, 3); px(g, '#8b9bb4', x - 6, y - 37, 12, 1); px(g, PAL.ink, x - 8, y - 15, 16, 3); px(g, PAL.wood2, x - 7, y - 14, 14, 1); },
  // a stack of covers, boards and leather, with nothing between them
  covers(g, x, y, r){ const cols = [PAL.red0, PAL.navy, PAL.moss0, PAL.plum, PAL.wood2]; for (let k = 0; k < 6; k++){ const w = 12 + Math.floor(r() * 5), a = Math.floor(r() * 3) - 1; px(g, PAL.ink, x - (w >> 1) + a - 1, y - 3 - k * 3, w + 2, 3); px(g, cols[k % cols.length], x - (w >> 1) + a, y - 2 - k * 3, w, 1); } },
  // spools of binding thread on pegs
  spools(g, x, y){ for (let k = -2; k <= 2; k++){ const xx = x + k * 7; px(g, PAL.ink, xx - 2, y - 6, 5, 7); px(g, k % 2 ? PAL.pale : '#e43b44', xx - 1, y - 5, 3, 5); px(g, PAL.wood1, xx - 2, y - 7, 5, 1); px(g, PAL.wood1, xx - 2, y, 5, 1); } px(g, PAL.wood0, x - 18, y + 1, 36, 1); },
  // a bell that came out wrong: on its side, a crack up it from the lip
  dumbbell(g, x, y, r){ const R = 15 + Math.floor(r() * 4); for (let k = 0; k <= R; k++){ const half = Math.round(R * (0.55 + 0.45 * Math.sqrt(k / R))); px(g, PAL.ink, x - half - 1, y - k * 2 - 2, half * 2 + 2, 2); px(g, k % 6 === 5 ? '#5a6988' : '#3a4466', x - half, y - k * 2 - 2, half * 2, 2); px(g, '#8b9bb4', x - half, y - k * 2 - 2, 2, 2); }
    px(g, PAL.ink, x - 4, y - R * 2 - 6, 8, 5); px(g, '#5a6988', x - 3, y - R * 2 - 5, 6, 3); for (let k = 0; k < R; k++) px(g, PAL.ink, x + 3 + ((k * 5) % 3) - 1, y - k * 2 - 2, 1, 2); },
  // the founders' mark, cast in a rim (main.js says it when he stands by it)
  castmark(g, x, y){ px(g, PAL.ink, x - 10, y - 9, 20, 6); px(g, '#5a6988', x - 9, y - 8, 18, 4); for (let k = 0; k < 6; k++) px(g, '#c0cbdc', x - 8 + k * 3, y - 7, 2, 2); },
  // the binders' ledger, open on a slope (main.js says it when he stands by it)
  ledger(g, x, y){ px(g, PAL.ink, x - 9, y - 10, 18, 10); px(g, PAL.wood1, x - 8, y - 9, 16, 9); px(g, PAL.ink, x - 10, y - 15, 20, 6); px(g, PAL.pale, x - 9, y - 14, 9, 4); px(g, PAL.light, x, y - 14, 9, 4); px(g, PAL.mid, x - 7, y - 13, 5, 1); px(g, PAL.mid, x + 2, y - 13, 5, 1); px(g, PAL.mid, x - 7, y - 11, 3, 1); },
});

// ---- the ladder: the thing he strikes. Its rungs are movers (level.js); this is its two stiles, and where they are
const three = () => { const T3 = typeof window !== 'undefined' && window.THREE; return T3 && T3.Group && T3.CanvasTexture && typeof document !== 'undefined' ? T3 : null; };
const pix = (T3, w, h, paint) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); paint((col, x, y, ww, hh) => { g.fillStyle = col; g.fillRect(x, y, ww, hh); }); const t = new T3.CanvasTexture(c); t.magFilter = t.minFilter = T3.NearestFilter; t.generateMipmaps = false; return t; };
const TEX = {};
const chains = (T3, tall) => TEX['c' + tall] || (TEX['c' + tall] = pix(T3, 36, tall * 8, f => { for (const x of [3, 29]) for (let y = 0; y < tall * 8; y += 4){ f('#181425', x, y, 4, 4); f(y % 8 ? '#8b9bb4' : '#5a6988', x + 1, y + 1, 2, 2); } }));
const drum = T3 => TEX.drum || (TEX.drum = pix(T3, 20, 18, f => { f('#181425', 0, 12, 20, 6); f('#5a6988', 1, 13, 18, 4); f('#181425', 3, 0, 14, 13); f('#3a4466', 4, 1, 12, 11); for (let y = 2; y < 12; y += 3) f('#8b9bb4', 4, y, 12, 1); f('#181425', 17, 3, 3, 3); f('#c0cbdc', 18, 4, 1, 1); }));
const stiles = (T3, tall) => TEX[tall] || (TEX[tall] = pix(T3, 36, tall * 8, f => { for (const x of [1, 31]){ f('#181425', x, 0, 4, tall * 8); f('#b86f50', x + 1, 0, 2, tall * 8); f('#e4a672', x + 1, 0, 1, tall * 8); } for (const x of [0, 30]){ f('#181425', x, tall * 8 - 6, 6, 6); f('#8b9bb4', x + 1, tall * 8 - 5, 4, 4); } }));
export const enemies = {
  // a ladder on a rail: struck, it rolls to the rail's other end. Not a creature
  ladder: { ai: 'ladder', own: true, prop: true, hp: 99, w: 1.0, h: 3.2, color: 0xb86f50, fly: true, guard(e){ e.struck = true; return true; }, onHit(e){ e.hp = e.d.hp; e.struck = true; } },
  // the winch of the casting crane: struck, the ladle goes to the other end of its rail. Not a creature
  winch: { ai: 'winch', own: true, prop: true, hp: 99, w: 0.6, h: 1.2, color: 0x5a6988, fly: false, guard(e){ e.struck = true; return true; }, onHit(e){ e.hp = e.d.hp; e.struck = true; } },
};
export const ai = {
  ladder(e, P, dt, c){
    const m = e.mk || {}; e.st = 'idle'; e.cool = Math.max(0, (e.cool || 0) - dt);
    const mv = (c.movers || []).find(q => q.key === m.key && !q.ghost); if (mv && c.moverAt){ const [x, y] = c.moverAt(mv, c.time); e.x = x; if (mv.ay) e.y = y; }   // (a ladder rolls along; a ladle on a climbing rail goes up with it)
    if (e.struck){ e.struck = false; if (e.cool <= 0){ e.cool = 0.5; c.events.push({ type: 'rail', key: m.key, at: { x: e.x, y: e.y + 0.6 } }); } }
    const T3 = three(); if (!T3) return; const tall = m.tall || 15;
    if (!e.g){ const g = new T3.Mesh(new T3.PlaneGeometry(36 / 16, tall * 0.5), new T3.MeshBasicMaterial({ map: m.iron ? chains(T3, tall) : stiles(T3, tall), transparent: true, alphaTest: 0.5 })); c.E.scene.add(g); e.g = g; }
    e.g.position.set(e.x, (m.iron ? e.y : e.home.y) + tall * 0.25, 0.046);
  },
  winch(e, P, dt, c){
    const m = e.mk || {}; e.st = 'idle'; e.cool = Math.max(0, (e.cool || 0) - dt);
    if (e.struck){ e.struck = false; if (e.cool <= 0){ e.cool = 0.5; c.events.push({ type: 'rail', key: m.key, at: { x: e.x, y: e.y + 0.6 } }); } }
    const T3 = three(); if (!T3) return;
    if (!e.g){ const g = new T3.Mesh(new T3.PlaneGeometry(20 / 16, 18 / 16), new T3.MeshBasicMaterial({ map: drum(T3), transparent: true, alphaTest: 0.5 })); c.E.scene.add(g); e.g = g; }
    e.g.position.set(e.x, e.y + 9 / 16, 0.04); e.g.material.color.setHex(e.cool > 0 ? 0xffffff : 0xc8cfe0);
  },
};
