// The Workings' far end (docs/edges-sheet.md, sections 7 to 11; build 120): the cage runs. Set into the Workings by
// level.js (EDGES), one column further west, and up into the row over the level.
// West of the cage shaft and the long level: the shaft's second compartment, and THE WINDING-HOUSE over it.
//   cageway    three screens, from the long level's west end to beside the pithead. A cage in it, at the top, level
//              with a landing in off the shaft's west stage; its way down is sheer. Beside it, behind a wall of rock,
//              the pumpmen's ladder-way: sills one side and the other, from the foot to the winding-house
//   windhouse  over it, in the row over the level. The cage's engine: a windlass. A thread, a chest, the banksman's
//              board. A hatch in its floor, which the engine opens, drops him on to the landing by the cage: too
//              far to climb back
// Its working: a thing on a rail (level.js railAt), as the Cloister's ladders are; and it does not go until its engine
// is going (a mover's `needs`: a key in RULE.gates, a windlass turned). The cage's lever is in the cage; a winch at
// each end calls it. So he finds the cage first, at the top, and it does nothing; the engine is three screens of ladder
// away, from the bottom.
import { room, rect, mark, EMPTY } from '../rooms.js';

const named = (fn, title, gate, look) => { const f = () => { const r = fn(); r.title = title; r.gate = gate; if (look) r.look = look; return r; }; Object.defineProperty(f, 'name', { value: fn.name }); return f; };
const deco = (r, kind, x, y, more) => mark(r, 'deco', x, y, { kind, ...more });
const keep = (r, x, y) => mark(r, 'keep', x, y);
const mass = (cw = 1, ch = 1) => { const r = room(cw, ch); rect(r, 0, 0, r.w - 1, r.h - 1); return r; };
// the compartment, in its own rows (its foot is level with the long level; the cage shaft's row 30 is its row 53).
// floor: the row he stands at, at the foot. way: the cage's way. flue: the ladder-way. land: the landing by the cage
// [from, to, the row he stands at]. cage: where it hangs, how far it goes, how long it takes. sills: the ladder-way's,
// [the row he stands at, 'w' or 'e', and how wide]. hole: in the winding-house's floor, over the landing; and the step
// under it, which is as high as the drop is short
export const CAGE = { floor: 3, way: [14, 25], flue: [2, 9], land: [26, 37, 53], cage: { x: 19, y: 53, dy: -50, secs: 9, w: 10, key: 'cage', needs: 'engine' },
  sills: [[9, 'w'], [15, 'e'], [21, 'w'], [27, 'e', 6], [33, 'w'], [39, 'e'], [45, 'w'], [51, 'e', 6], [57, 'w'], [63, 'e'], [69, 'w']], hole: [30, 35], step: 2, head: 71 };
function cageway(){
  const r = mass(1, 3), C = CAGE, [f0, f1] = C.flue, [w0, w1] = C.way, [l0, l1, ly] = C.land;
  rect(r, 2, C.floor, 37, C.floor + 5, EMPTY); rect(r, 38, C.floor, 39, C.floor + 5, EMPTY);   // the foot: one room, in off the long level
  rect(r, w0, C.floor, w1, 66, EMPTY);                             // the cage's way: sheer
  rect(r, f0, C.floor, f1, 68, EMPTY);                             // the ladder-way, up through the roof
  for (const [y, side, w = 3] of C.sills) rect(r, side === 'w' ? f0 : f1 - w + 1, y - 1, side === 'w' ? f0 + w - 1 : f1, y - 1);
  rect(r, l0, ly, l1, 66, EMPTY); rect(r, 38, ly, 39, ly + 5, EMPTY);   // the landing by the cage, in off the shaft's west stage
  rect(r, C.hole[0], ly, C.hole[1], ly + C.step - 1); rect(r, C.hole[0], 67, C.hole[1], 68, EMPTY);   // the step under the hole in the winding-house's floor
  mark(r, 'mover', C.cage.x, C.cage.y, { kind: 'rail', dx: 0, dy: C.cage.dy, secs: C.cage.secs, key: C.cage.key, needs: C.cage.needs, look: 'cagefloor', w: C.cage.w });
  mark(r, 'cage', C.cage.x, C.cage.y, { key: C.cage.key });         // the cage itself, and the lever in it
  mark(r, 'winch', l0 + 1, ly, { key: C.cage.key }); mark(r, 'winch', w1 + 4, C.floor, { key: C.cage.key });   // a winch at each end, to call it
  mark(r, 'chest', 7, 27, { holds: 'shards' }); deco(r, 'chalk', 6, 51, { says: 'PUMPMEN ONLY. THE CAGE IS FOR THE STONE.' });
  mark(r, 'flitter', 5, 35);   /* (clear of the sills: at 42 its body began in the one over it) */
  mark(r, 'torch', 34, 6); mark(r, 'torch', 8, 6); mark(r, 'torch', 3, 30); mark(r, 'torch', 8, 54); mark(r, 'torch', 36, 57); mark(r, 'crystal', 32, C.floor); mark(r, 'urn', 35, C.floor);
  for (let y = 10; y <= 64; y += 3){ keep(r, w0, y); keep(r, w1, y); keep(r, (w0 + w1) >> 1, y); for (const x of [f0, f1 - 2, f1]) if (r.tiles[y][x] === EMPTY) keep(r, x, y); }
  for (let y = ly + 2; y <= 66; y += 2) for (let x = l0; x <= l1; x += 3) keep(r, x, y);
  return r;
}
function windhouse(){
  const r = mass(), C = CAGE;
  rect(r, 2, 2, 37, 14, EMPTY); rect(r, C.flue[0], 0, C.flue[1], 1, EMPTY); rect(r, C.hole[0], 0, C.hole[1], 0, EMPTY);   // (the hatch over the landing is set by `far`, below: its top course is a gate)
  mark(r, 'windlass', 16, 2, { key: C.cage.needs, says: 'Under the floor, the drum has begun to turn.' }); deco(r, 'windengine', 21, 2);
  mark(r, 'thread', 27, 2); mark(r, 'chest', 12, 2, { holds: 'shards' }); deco(r, 'chalk', 24, 2, { says: 'NIGHT SHIFT. CAGE DOWN, 31 MEN. CAGE UP, NOT YET.' });
  mark(r, 'torch', 11, 8); mark(r, 'torch', 28, 8); mark(r, 'urn', 37, 2);
  for (let y = 3; y <= 13; y += 2) for (let x = 3; x <= 36; x += 3) keep(r, x, y);
  return r;
}

export const far = { left: 1, build(X){
  const { EMPTY: E, ROCK } = X.tile, cut = (R, x0, y0, x1, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) X.set(R.tx0 + x, R.ty0 + y, E); };
  const ca = X.roomOf('cage'), lo = X.roomOf('long'); if (!ca || !lo) return;
  for (let y = lo.ty0; y < X.H; y++) for (let x = 0; x < lo.tx0; x++) X.set(x, y, ROCK);   // the new column is rock, from the long level up
  const cx = Math.round((lo.tx0 - X.X0) / 40) - 1, cy = Math.round((lo.ty0 - X.Y0) / 23);
  X.addRoom(cx, cy, named(cageway, 'THE WINDING-HOUSE', ''), { wing: true, far: true });
  const wh = X.addRoom(cx, cy + 3, named(windhouse, 'THE WINDING-HOUSE', ''), { wing: true, far: true });
  // the hatch in the winding-house's floor, over the landing: shut until the engine is going (a gate on the engine's key)
  for (let x = CAGE.hole[0]; x <= CAGE.hole[1]; x++) X.set(wh.tx0 + x, wh.ty0 + 1, X.tile.SLUICE);
  X.marks.push({ type: 'gate', x: wh.tx0 + CAGE.hole[0], y: wh.ty0 + 1, w: CAGE.hole[1] - CAGE.hole[0] + 1, h: 1, key: CAGE.cage.needs });
  cut(lo, 0, CAGE.floor, 1, CAGE.floor + 5);                        // out of the long level's west end
  cut(ca, 0, CAGE.land[2] - 23, 2, CAGE.land[2] - 23 + 5);          // and off the shaft's west stage, beside the pithead
} };

// ---- what stands in it, painted (a 'deco' mark)
export const decoDef = (px, PAL) => ({
  // the engine: a drum with the cable on it, a flywheel behind, the cable going down through the floor
  windengine(g, x, y){ px(g, PAL.ink, x - 22, y - 4, 44, 4); px(g, '#5a6988', x - 21, y - 3, 42, 2);
    for (let a = 0; a < 360; a += 4){ const c = Math.cos(a * Math.PI / 180), s = Math.sin(a * Math.PI / 180); px(g, PAL.ink, Math.round(x + 10 + c * 18), Math.round(y - 24 + s * 18), 2, 2); px(g, '#5a6988', Math.round(x + 10 + c * 16), Math.round(y - 24 + s * 16), 2, 2); }
    for (let k = 0; k < 4; k++){ const c = Math.cos(k * Math.PI / 4), s = Math.sin(k * Math.PI / 4); for (let q = -15; q <= 15; q += 2) px(g, '#3a4466', Math.round(x + 10 + c * q), Math.round(y - 24 + s * q), 2, 2); }
    px(g, PAL.ink, x - 20, y - 28, 22, 24); px(g, '#b86f50', x - 19, y - 27, 20, 22); for (let b = 0; b < 22; b += 3) px(g, '#e4a672', x - 19, y - 27 + b, 20, 1); px(g, PAL.ink, x - 22, y - 30, 3, 28); px(g, PAL.ink, x + 1, y - 30, 3, 28); px(g, '#8b9bb4', x - 21, y - 29, 1, 26); px(g, '#8b9bb4', x + 2, y - 29, 1, 26); },
  // a board with chalk on it (main.js says it when he stands by it)
  chalk(g, x, y){ px(g, PAL.ink, x - 13, y - 26, 26, 16); px(g, '#262b44', x - 12, y - 25, 24, 14); for (let k = 0; k < 3; k++) for (let i = 0; i < 20; i += 3) px(g, '#c0cbdc', x - 10 + i + (k & 1), y - 22 + k * 4, 2, 1); px(g, PAL.ink, x - 1, y - 10, 2, 10); },
});

// ---- the cage: a frame of iron on its floor (which is a mover, level.js), and the lever in it. Struck, it goes to the
// other end of its way, if its engine is going. Not a creature
const three = () => { const T3 = typeof window !== 'undefined' && window.THREE; return T3 && T3.Group && T3.CanvasTexture && typeof document !== 'undefined' ? T3 : null; };
const pix = (T3, w, h, paint) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); paint((col, x, y, ww, hh) => { g.fillStyle = col; g.fillRect(x, y, ww, hh); }); const t = new T3.CanvasTexture(c); t.magFilter = t.minFilter = T3.NearestFilter; t.generateMipmaps = false; return t; };
let FRAME = null;
export const FRAME_PX = { w: 80, h: 240, cage: 48 };   // the frame: ten tiles wide; six tall, and its cable over it
const frame = T3 => FRAME || (FRAME = pix(T3, FRAME_PX.w, FRAME_PX.h, f => { const H = FRAME_PX.h, c0 = H - FRAME_PX.cage;
  for (let y = 0; y < c0; y += 4){ f('#181425', 38, y, 4, 4); f(y % 8 ? '#8b9bb4' : '#5a6988', 39, y + 1, 2, 2); }   // the cable
  f('#181425', 0, c0, 80, 6); f('#5a6988', 1, c0 + 1, 78, 3); f('#8b9bb4', 1, c0 + 1, 78, 1);   // the roof
  for (const x of [0, 76]){ f('#181425', x, c0, 4, FRAME_PX.cage); f('#5a6988', x + 1, c0, 2, FRAME_PX.cage); }   // the posts
  for (let x = 12; x < 76; x += 13) for (let y = c0 + 6; y < H; y += 2) f('#3a4466', x, y, 1, 1);   // the bars, thin
  f('#181425', 60, H - 22, 3, 22); f('#b86f50', 61, H - 21, 1, 20); f('#181425', 58, H - 26, 7, 5); f('#e43b44', 59, H - 25, 5, 3); }));   // the lever
export const enemies = {
  // (wakeful: it goes with its floor wherever that is. Asleep, it would stay where he last saw it, fifty rows from the floor he has called)
  cage: { ai: 'cage', own: true, prop: true, wakeful: true, hp: 99, w: 0.8, h: 1.6, color: 0x5a6988, fly: true, guard(e){ e.struck = true; return true; }, onHit(e){ e.hp = e.d.hp; e.struck = true; } },
};
export const ai = {
  cage(e, P, dt, c){
    const m = e.mk || {}; e.st = 'idle'; e.cool = Math.max(0, (e.cool || 0) - dt);
    const mv = (c.movers || []).find(q => q.key === m.key && !q.ghost); let cx = e.home.x, cy = e.home.y; if (mv && c.moverAt){ [cx, cy] = c.moverAt(mv, c.time); }
    e.x = cx + 2.6; e.y = cy;                                       // (what he strikes is the lever, at the cage's east side)
    if (e.struck){ e.struck = false; if (e.cool <= 0){ e.cool = 0.6; c.events.push({ type: 'rail', key: m.key, at: { x: e.x, y: e.y + 0.6 } }); } }
    const T3 = three(); if (!T3) return;
    if (!e.g){ const g = new T3.Mesh(new T3.PlaneGeometry(FRAME_PX.w / 16, FRAME_PX.h / 16), new T3.MeshBasicMaterial({ map: frame(T3), transparent: true, alphaTest: 0.5 })); c.E.scene.add(g); e.g = g; }
    e.g.position.set(cx, cy + FRAME_PX.h / 32, 0.03);
  },
};
