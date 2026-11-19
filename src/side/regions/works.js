// The Wreck of the Works: the Tempest's wing, west of the landing (docs/world.md, docs/phase12-sheet.md). The Wrights
// built a works on the storm's edge to catch the lightning in jars and coils and keep it, and so make their own flame.
// The storm took it apart. Nine screens, set into the Tempest by level.js (WINGS): three columns added to the west.
//   yard      the yard, two screens: open to anyone, out of the landing's west wall. One lever, one climb of iron
//   coils     two screens, one over the other: rungs of iron up it, coils that throw arcs across it, a lever at each landing
//   cranes    two screens: three spans of iron deck over a drop, a Wright's-arm swinging over each, a lever on each pier
//   jarhouse  two screens: the Jar. Dull, until a lever sends the current to its half
//   drafting  the Wrights' plans; the relic. Behind a grate until the Jar is broken
// Its rule (rooms.js IRON_A, IRON_B; level.js RULE.sw): the current is always in one half of the iron. To stand on that
// half is to be shocked. A lever (struck) sends it to the other half: every deck, every coil. Nothing turns it off but
// breaking the Jar; then all of it is dead for good (RULE.still), and the grates lift.
import { room, rect, door, ledge, mark, cave, EMPTY, ROCK, SPIKES, STILLED, IRON_A, IRON_B } from '../rooms.js';

const TITLE = 'THE WRECK OF THE WORKS';
const named = (fn, more = {}) => { const f = () => { const r = fn(); r.title = TITLE; Object.assign(r, more); return r; }; Object.defineProperty(f, 'name', { value: fn.name }); return f; };
const deco = (r, kind, x, y) => mark(r, 'deco', x, y, { kind });
const keep = (r, x, y) => mark(r, 'keep', x, y);
const A = (r, x0, x1, y) => ledge(r, x0, x1, y, IRON_A), B = (r, x0, x1, y) => ledge(r, x0, x1, y, IRON_B);

function yard(){
  const r = room(2, 1); r.open = true;
  rect(r, 0, 0, 79, 1); rect(r, 0, 8, 1, 22);                      // the yard's ground, and the cliff at its back (the coils' door at its foot)
  // the first climb: copper rungs up to a shelf, and the lever that makes them safe to stand on
  mark(r, 'lever', 24, 2); A(r, 6, 13, 5); A(r, 4, 11, 10); rect(r, 2, 14, 12, 15);
  mark(r, 'chest', 5, 16, { holds: 'shards' });                    // on the shelf: what the first lever is for
  for (const [k, x, y] of [['wreck', 40, 2], ['wreck', 62, 2], ['drum', 32, 2], ['drum', 52, 2], ['boom', 48, 2]]) deco(r, k, x, y);
  mark(r, 'spark', 44, 6); mark(r, 'urn', 70, 2); mark(r, 'urn', 28, 2); mark(r, 'crystal', 58, 2); mark(r, 'crystal', 16, 2);
  return r;
}
function coils(){
  const r = cave(1, 2); door(r, 'right', 2, 7); door(r, 'right', 25, 30);   // in from the yard, at the floor; out to the cranes, halfway up
  mark(r, 'lever', 30, 2);
  B(r, 12, 20, 5); B(r, 12, 20, 10); mark(r, 'coil', 6, 7, { half: 0, to: [22, 0] });   // the first run of rungs, an arc across it
  rect(r, 2, 14, 9, 15); mark(r, 'lever', 5, 16);                  // a landing of stone, and its lever
  A(r, 14, 22, 19); mark(r, 'coil', 10, 22, { half: 1, to: [16, 0] });
  rect(r, 28, 23, 37, 24); mark(r, 'lever', 33, 25);               // the landing at the cranes' door
  B(r, 16, 24, 29); B(r, 16, 24, 34); rect(r, 2, 38, 14, 39); mark(r, 'chest', 6, 40, { holds: 'thread' }); mark(r, 'coil', 12, 32, { half: 0, to: [16, 0] });   // and on up, for one who goes past the door
  for (const [k, x, y] of [['drum', 34, 2], ['wreck', 20, 2]]) deco(r, k, x, y);
  mark(r, 'torch', 36, 12); mark(r, 'torch', 3, 22); mark(r, 'torch', 36, 34); mark(r, 'crystal', 10, 2); mark(r, 'urn', 24, 2);
  for (const x of [30, 33, 36]) keep(r, x, 27);
  return r;
}
function cranes(){
  const r = cave(2, 1); door(r, 'left', 2, 7); door(r, 'top', 70, 75); for (const y of [5, 9, 13, 17, 21]) ledge(r, 70, 75, y);   // in from the coils; up to the jar-house at the far end
  rect(r, 15, 0, 64, 1, EMPTY); rect(r, 15, 0, 64, 0, SPIKES);     // the drop under the decks
  A(r, 15, 30, 1); rect(r, 31, 0, 34, 1); B(r, 35, 50, 1); rect(r, 51, 0, 54, 1); A(r, 55, 64, 1);   // three spans, a pier of stone between each
  mark(r, 'lever', 10, 2); mark(r, 'lever', 33, 2); mark(r, 'lever', 52, 2);
  mark(r, 'crane', 23, 2); mark(r, 'crane', 42, 2); mark(r, 'crane', 60, 2);   // a Wright's-arm over each span
  mark(r, 'spark', 28, 10); mark(r, 'spark', 46, 12);
  for (const [k, x, y] of [['drum', 6, 2], ['wreck', 67, 2]]) deco(r, k, x, y);
  mark(r, 'torch', 4, 10); mark(r, 'torch', 33, 12); mark(r, 'torch', 53, 12); mark(r, 'torch', 77, 10); mark(r, 'urn', 66, 2);
  return r;
}
function jarhouse(){
  const r = cave(2, 1); door(r, 'bottom', 70, 75); ledge(r, 70, 75, 1); door(r, 'left', 2, 7); door(r, 'right', 2, 7);
  rect(r, 0, 2, 1, 7, STILLED); rect(r, 78, 2, 79, 7, STILLED);     // the grates: to the drafting room, and to the cable run
  rect(r, 22, 0, 37, 1, EMPTY); rect(r, 22, 0, 37, 0, SPIKES); A(r, 22, 37, 1);   // iron either side of the Jar: its own half to the west
  rect(r, 43, 0, 58, 1, EMPTY); rect(r, 43, 0, 58, 0, SPIKES); B(r, 43, 58, 1);
  mark(r, 'jar', 40, 2, { half: 0 }); mark(r, 'lever', 14, 2); mark(r, 'lever', 64, 2);
  for (const [k, x, y] of [['drum', 6, 2], ['wreck', 10, 2]]) deco(r, k, x, y);
  mark(r, 'torch', 4, 10); mark(r, 'torch', 30, 14); mark(r, 'torch', 50, 14); mark(r, 'torch', 76, 10);
  for (const x of [3, 5, 74, 76]) keep(r, x, 3);
  return r;
}
function drafting(){
  const r = cave(); door(r, 'right', 2, 7);
  mark(r, 'chest', 8, 2, { holds: 'relic:boots' }); deco(r, 'plans', 20, 2); deco(r, 'plans', 28, 2);
  mark(r, 'torch', 5, 9); mark(r, 'torch', 34, 9); mark(r, 'crystal', 14, 2); mark(r, 'urn', 32, 2);
  for (const x of [34, 36]) keep(r, x, 3);
  return r;
}

// set into the Tempest: three columns to the west of it (as the region counts cells: the landing is column 0), from
// the landing's height up to the watch's. Under and beside its rooms is the mountain's rock
export const wing = { left: 3, build(X){
  const la = X.roomOf('landing'), wa = X.roomOf('watch'); if (!la || !wa) return; const row = Math.round((la.ty0 - X.Y0) / 23);
  for (let y = X.Y0; y < la.ty0; y++) for (let x = 0; x < X.X0; x++) X.set(x, y, ROCK);   // under the yard
  for (let y = la.ty0 + 23; y < la.ty0 + 69; y++) for (let x = 0; x < la.tx0; x++) X.set(x, y, ROCK);   // and what the upper rooms are cut into
  for (let y = la.ty0 + 69; y < X.H; y++) for (let x = 0; x < la.tx0 - 40; x++) X.set(x, y, ROCK);   // over the wing, west of the Breach's cliff: the mountain (no ledge up there to be stranded on)
  // wing: its rooms are a wing's though nothing gates it (the tests count a wing's relic and strands apart from the region's own)
  X.addRoom(-2, row, named(yard, { open: true }), { open: true, wing: true });
  X.addRoom(-3, row, named(coils), { wing: true });
  X.addRoom(-2, row + 1, named(cranes), { wing: true });
  X.addRoom(-2, row + 2, named(jarhouse), { wing: true });
  X.addRoom(-3, row + 2, named(drafting), { after: true, wing: true });         // after: behind its grate until the Jar is broken
  // the doors in the mountain's own walls: out of the landing into the yard; out of the jar-house into the watch (the cable run)
  const cut = (R, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = R.tx0; x < R.tx0 + 6; x++){ if (x >= R.tx0 + 2 && X.at(x, R.ty0 + y) !== ROCK) break; X.set(x, R.ty0 + y, EMPTY); } };
  cut(la, 2, 7); cut(wa, 2, 7);
} };
export const QUIET = ['drafting'];

// ---- what stands in it, painted (a 'deco' mark): x the middle, y the floor
export const decoDef = (px, PAL) => ({
  // a heap of wrecked ironwork
  wreck(g, x, y, r){ for (let k = 0; k < 7; k++){ const a = Math.floor(r() * 21) - 10, w = 4 + Math.floor(r() * 8), h = 1 + Math.floor(r() * 2), b = Math.floor(r() * 7); px(g, PAL.ink, x + a - 1, y - b - h - 1, w + 2, h + 2); px(g, k % 2 ? PAL.dark : PAL.mid, x + a, y - b - h, w, h); if (k % 3 === 0) px(g, PAL.rust, x + a, y - b - h, Math.max(1, w - 3), 1); } px(g, PAL.ink, x - 2, y - 16, 2, 16); px(g, PAL.mid, x - 2, y - 16, 1, 15); },
  // a cable drum, on its side
  drum(g, x, y){ px(g, PAL.ink, x - 6, y - 10, 13, 10); px(g, PAL.wood1, x - 5, y - 9, 11, 8); for (let b = 0; b < 4; b++) px(g, PAL.wood0, x - 5, y - 8 + b * 2, 11, 1); px(g, PAL.ink, x - 7, y - 11, 2, 12); px(g, PAL.ink, x + 6, y - 11, 2, 12); px(g, PAL.mid, x - 7, y - 11, 1, 11); px(g, PAL.mid, x + 6, y - 11, 1, 11); },
  // a crane's boom, fallen across the yard
  boom(g, x, y){ for (let a = -22; a <= 22; a++){ const yy = y - 3 - Math.round((a + 22) * 0.35); px(g, PAL.ink, x + a, yy - 1, 1, 4); px(g, a % 4 ? PAL.dark : PAL.mid, x + a, yy, 1, 2); if (a % 6 === 0) px(g, PAL.ink, x + a, yy - 4, 1, 4); } },
  // a drafting table, a plan pinned to it: the Jar, drawn larger
  plans(g, x, y){ px(g, PAL.ink, x - 9, y - 12, 19, 2); px(g, PAL.wood2, x - 8, y - 12, 17, 1); px(g, PAL.ink, x - 7, y - 10, 1, 10); px(g, PAL.ink, x + 7, y - 10, 1, 10); px(g, PAL.ink, x - 7, y - 26, 15, 13); px(g, PAL.bone, x - 6, y - 25, 13, 11); px(g, PAL.navy, x - 2, y - 23, 5, 8); px(g, PAL.bone, x - 1, y - 22, 3, 6); px(g, PAL.blue, x, y - 21, 1, 4); px(g, PAL.navy, x - 5, y - 16, 3, 1); px(g, PAL.navy, x + 3, y - 16, 3, 1); },
});

// ---- who is in it: none of it is a creature, and all of it draws itself
const three = () => { const T3 = typeof window !== 'undefined' && window.THREE; return T3 && T3.Group && T3.CanvasTexture && typeof document !== 'undefined' ? T3 : null; };
const pix = (T3, w, h, paint) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); paint((col, x, y, ww, hh) => { g.fillStyle = col; g.fillRect(x, y, ww, hh); }); const t = new T3.CanvasTexture(c); t.magFilter = t.minFilter = T3.NearestFilter; t.generateMipmaps = false; return t; };
const mesh = (T3, map, w, h, more = {}) => new T3.Mesh(new T3.PlaneGeometry(w, h), new T3.MeshBasicMaterial({ map, transparent: true, alphaTest: 0.5, ...more }));
let TEX = null;
const texes = T3 => TEX || (TEX = {
  base: pix(T3, 10, 6, f => { f('#181425', 0, 2, 10, 4); f('#5a6988', 1, 3, 8, 2); f('#8b9bb4', 1, 3, 8, 1); f('#181425', 3, 0, 4, 3); f('#3a4466', 4, 1, 2, 2); }),
  arm: pix(T3, 4, 14, f => { f('#181425', 0, 0, 4, 14); f('#8b9bb4', 1, 4, 2, 9); f('#c0cbdc', 1, 4, 1, 8); f('#e43b44', 0, 0, 4, 4); f('#f6757a', 1, 1, 2, 2); }),
  coil: pix(T3, 10, 20, f => { f('#181425', 3, 0, 4, 20); f('#5a6988', 4, 0, 2, 20); for (let y = 3; y < 18; y += 3){ f('#181425', 0, y - 1, 10, 3); f('#d77643', 1, y, 8, 1); f('#feae34', 2, y, 3, 1); } f('#181425', 2, 0, 6, 3); f('#c0cbdc', 3, 1, 4, 1); }),
  beam: pix(T3, 16, 4, f => { f('#ffffff', 0, 1, 16, 2); f('#bfe8ff', 0, 0, 16, 1); f('#bfe8ff', 0, 3, 16, 1); }),
  chain: pix(T3, 4, 8, f => { f('#181425', 0, 0, 4, 8); f('#8b9bb4', 1, 0, 2, 3); f('#5a6988', 1, 4, 2, 3); }),
  hook: pix(T3, 12, 14, f => { f('#181425', 4, 0, 4, 6); f('#8b9bb4', 5, 0, 2, 5); f('#181425', 1, 5, 10, 3); f('#5a6988', 2, 6, 8, 1); f('#181425', 8, 7, 3, 6); f('#5a6988', 9, 7, 1, 5); f('#181425', 2, 11, 9, 3); f('#8b9bb4', 3, 12, 6, 1); f('#181425', 1, 8, 3, 4); f('#5a6988', 2, 9, 1, 2); }),
  jar: pix(T3, 26, 42, f => { f('#181425', 6, 0, 14, 5); f('#5a6988', 7, 1, 12, 3); f('#c0cbdc', 7, 1, 12, 1); f('#181425', 2, 5, 22, 33); f('#124e89', 3, 6, 20, 31); f('#0099db', 4, 7, 4, 29); f('#2ce8f5', 5, 8, 1, 24); f('#181425', 0, 37, 26, 5); f('#3a4466', 1, 38, 24, 3); f('#8b9bb4', 1, 38, 24, 1); let x = 15; for (let y = 8; y < 30; y++){ x += [0, 1, -1, 1, 0, -1][y % 6]; f('#181425', x, y, 1, 1); if (y % 7 === 3) f('#181425', x + 1, y, 3, 1); } }),
  bolt: pix(T3, 12, 28, f => { let x = 6; for (let y = 0; y < 28; y++){ x += [1, -1, 2, -2, 1, -1, -1, 1][y % 8]; x = Math.max(1, Math.min(10, x)); f('#bfe8ff', x - 1, y, 3, 1); f('#ffffff', x, y, 1, 1); } }),
});
// does the current run in this half now (IRON_A's half is 0)
const liveHalf = (R, half) => !R.still && !R.swFree && (R.surge > 0 || half === R.sw);
export const JAR = { fill: 6, warn: 0.9, surge: 0.6, drain: 3, hp: 26 };

export const enemies = {
  // a lever: struck, it sends the current to the other half of the iron. Not a creature
  lever: { ai: 'lever', own: true, prop: true, hp: 99, w: 0.5, h: 1.4, color: 0x8b9bb4, fly: false, guard(e){ e.struck = true; return true; }, onHit(e){ e.hp = e.d.hp; e.struck = true; } },
  // a coil: while the current is in its half it throws an arc to its other post, again and again: a warning, then the arc
  coil: { ai: 'coil', own: true, harmless: true, hp: 99, w: 0.4, h: 1.2, color: 0xd77643, fly: false, period: 2.8, warn: 0.7, arc: 0.4, word: 'Shocked' },
  // a Wright's-arm: a crane's hook on its chain, swinging over the deck. It strikes what is in its way. Still, once the Jar is broken
  crane: { ai: 'crane', own: true, harmless: true, hp: 99, w: 0.4, h: 0.9, color: 0x5a6988, fly: true, word: 'Struck by iron' },
  // the Jar: the wing's keeper. The great jar of caught lightning. Dull, and the blade rings off it, while the current is
  // in the other half. With the current in its own half it can be broken, and it fills; full, it lets it all go at
  // once, through every piece of iron in the house: be on stone, or in the air
  jar: { ai: 'jar', own: true, hp: JAR.hp, w: 1.3, h: 4.2, color: 0x124e89, fly: false, name: 'The Jar', word: 'Shocked', guard(e){ return !e.live; }, onHit(e){ e.woke = true; }, onKill(e){ if (e.parts){ e.parts.bolt.visible = false; e.parts.glow.visible = false; e.parts.jar.material.color.setHex(0x5a6070); } },
    // broken before: it stands there dull and empty
    spawn(e, c){ if (!c.RULE.still) return; e.alive = false; const T3 = three(); if (!T3) return; const jar = mesh(T3, texes(T3).jar, 26 / 16 * 1.6, 42 / 16 * 1.6); jar.position.set(e.x, e.y + 2.1, 0.03); jar.material.color.setHex(0x5a6070); c.scene.add(jar); } },
};
export const ai = {
  lever(e, P, dt, c){
    const R = c.RULE; e.st = 'idle'; e.cool = Math.max(0, (e.cool || 0) - dt);
    if (e.struck){ e.struck = false; if (e.cool <= 0 && !R.still){ e.cool = 0.45; c.events.push({ type: 'switch', e, at: { x: e.x, y: e.y + 1 } }); } }
    const T3 = three(); if (!T3) return;
    if (!e.g){ const X = texes(T3), g = new T3.Group(), base = mesh(T3, X.base, 0.625, 0.375), arm = mesh(T3, X.arm, 0.25, 0.875); base.position.y = 0.19; arm.geometry.translate(0, 0.44, 0); arm.position.set(0, 0.3, 0.001); g.add(base); g.add(arm); g.position.set(e.x, e.y, 0.04); c.E.scene.add(g); e.g = g; e.arm = arm; e.lean = 0; }
    const want = R.still ? 0 : R.sw ? -0.6 : 0.6; e.lean += (want - e.lean) * Math.min(1, dt * 14); e.arm.rotation.z = -e.lean; e.arm.material.color.setHex(R.still ? 0x8f96a8 : 0xffffff);
  },
  coil(e, P, dt, c){
    const R = c.RULE, d = e.d, m = e.mk || {}, half = m.half || 0, to = m.to || [8, 0], x1 = e.x + to[0] * c.T, y0 = e.y + 0.9, y1 = e.y + to[1] * c.T + 0.9; e.st = 'idle';
    const live = liveHalf(R, half), t = (e.age + (e.home.x * 0.37) % d.period) % d.period, warn = live && t >= d.period - d.warn - d.arc && t < d.period - d.arc, arc = live && t >= d.period - d.arc;
    if (arc && !c.isRollInv(P)){ const ax = x1 - e.x, ay = y1 - y0, L2 = ax * ax + ay * ay || 1, u = Math.max(0, Math.min(1, ((P.x - e.x) * ax + (P.y + 1.2 - y0) * ay) / L2)), dd = Math.hypot(P.x - (e.x + ax * u), P.y + 1.2 - (y0 + ay * u)); if (dd < 0.7 + (P.h > 2 ? 0.5 : 0.2)) c.hurt(P, 1, e.x + ax * u, d.word); }
    if (arc && !e.wasArc) c.events.push({ type: 'arc', e, at: { x: (e.x + x1) / 2, y: (y0 + y1) / 2 } }); e.wasArc = arc;
    const T3 = three(); if (!T3) return;
    if (!e.g){ const X = texes(T3), a = mesh(T3, X.coil, 0.625, 1.25), b = mesh(T3, X.coil, 0.625, 1.25), beam = mesh(T3, X.beam, 1, 0.25, { alphaTest: 0, depthWrite: false, blending: T3.AdditiveBlending, opacity: 0 }); a.position.set(e.x, e.y + 0.625, 0.04); b.position.set(x1, e.y + to[1] * c.T + 0.625, 0.04);
      const len = Math.hypot(x1 - e.x, y1 - y0); beam.scale.x = len; beam.position.set((e.x + x1) / 2, (y0 + y1) / 2, 0.09); beam.rotation.z = Math.atan2(y1 - y0, x1 - e.x); for (const q of [a, b, beam]) c.E.scene.add(q); e.g = [a, b]; e.beam = beam; }
    e.beam.material.opacity = arc ? 1 : warn ? 0.18 + 0.2 * Math.abs(Math.sin(e.age * 40)) : 0; e.beam.scale.y = arc ? 1.6 + Math.sin(e.age * 90) * 0.6 : 0.5; for (const q of e.g) q.material.color.setHex(live ? 0xffffff : 0x70768a);
  },
  crane(e, P, dt, c){
    const R = c.RULE, d = e.d; e.st = 'idle';
    if (!e.piv){ const floor = e.home.y - 1.6, tip = floor + 0.5; let top = tip + 8; for (let k = 1; k < 44; k++){ const y = tip + d.h + k * 0.5; if (c.solidAt(e.home.x, y)){ top = Math.floor(y / 0.5) * 0.5; break; } } e.piv = { x: e.home.x, y: top }; e.L = top - tip; e.amp = 0.8; e.ph = (e.home.x * 0.9) % 6.28; e.w = Math.max(1.1, Math.min(2.2, Math.sqrt(12 / e.L))); }
    e.amp += ((R.still ? 0 : Math.min(0.85, 4.2 / e.L)) - e.amp) * Math.min(1, dt * 1.2); e.ph += dt * e.w; const th = e.amp * Math.sin(e.ph), tx = e.piv.x + e.L * Math.sin(th), ty = e.piv.y - e.L * Math.cos(th); e.x = tx; e.y = ty + d.h * 0.5;
    if (e.amp > 0.2 && P.x + 0.34 > tx - 0.4 && P.x - 0.34 < tx + 0.4 && P.y + P.h > ty && P.y < ty + d.h && !c.isRollInv(P)) c.hurt(P, 1, tx - Math.sign(Math.cos(e.ph)) * 0.5, d.word);
    const T3 = three(); if (!T3) return;
    if (!e.g){ const X = texes(T3), g = new T3.Group(), len = e.L - d.h, ch = mesh(T3, X.chain.clone(), 0.25, Math.max(0.05, len)); ch.material.map.wrapT = T3.RepeatWrapping; ch.material.map.repeat.y = len * 2; ch.material.map.needsUpdate = true; ch.position.y = -len / 2; const hk = mesh(T3, X.hook, 0.75, 0.875); hk.position.y = -(e.L - d.h / 2); g.add(ch); g.add(hk); g.position.set(e.piv.x, e.piv.y, 0.04); c.E.scene.add(g); e.g = g; }
    e.g.rotation.z = th;
  },
  jar(e, P, dt, c){
    const R = c.RULE, d = e.d, m = e.mk || {}; e.st = e.st === 'burst' ? 'burst' : 'idle'; e.ch = e.ch || 0;
    e.live = !R.still && !R.swFree && (m.half || 0) === R.sw;
    if (e.st === 'burst'){ if (e.tm >= JAR.warn){ c.events.push({ type: 'surge', e, at: { x: e.x, y: e.y + 2 } }); e.ch = 0; c.go('idle'); } }
    else if (e.live){ e.ch = Math.min(1, e.ch + dt / JAR.fill); if (e.ch >= 1){ c.go('burst'); c.events.push({ type: 'tell', e }); } }
    else e.ch = Math.max(0, e.ch - dt / JAR.drain);
    e.warn = e.st === 'burst';
    const T3 = three(); if (!T3) return;
    if (!e.parts){ const X = texes(T3), jar = mesh(T3, X.jar, 26 / 16 * 1.6, 42 / 16 * 1.6), bolt = mesh(T3, X.bolt, 1.2, 2.8, { alphaTest: 0, depthWrite: false, blending: T3.AdditiveBlending }), glow = mesh(T3, X.beam, 3.4, 4.6, { alphaTest: 0, depthWrite: false, blending: T3.AdditiveBlending, opacity: 0, color: 0x2ce8f5 });
      jar.position.set(e.x, e.y + 2.1, 0.03); bolt.position.set(e.x + 0.1, e.y + 2.2, 0.031); glow.position.set(e.x, e.y + 2.2, 0.029); for (const q of [glow, jar, bolt]) c.E.scene.add(q); e.parts = { jar, bolt, glow }; }
    const { jar, bolt, glow } = e.parts, burst = e.st === 'burst'; bolt.visible = e.live || e.ch > 0.02; bolt.scale.x = (Math.floor(e.age * 14) % 2 ? 1 : -1) * (0.6 + e.ch * 0.7); bolt.material.opacity = 0.35 + e.ch * 0.65;
    glow.material.opacity = burst ? 0.5 + 0.4 * Math.abs(Math.sin(e.tm * 38)) : e.ch * 0.35; jar.material.color.setHex(e.flash > 0 ? 0xffffff : burst && Math.sin(e.tm * 38) > 0 ? 0xffffff : e.live ? 0xe8f6ff : 0x7a8298);
  },
};
