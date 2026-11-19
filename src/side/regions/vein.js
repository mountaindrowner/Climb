// The Vein: the second of the Deep (docs/world.md, docs/phase15-sheet.md). Under the Workings, behind the guild's
// seal. Below the flood the lampstone grew richer and stranger: it began to glitter, to grow in crystals, to give light
// without being broken. The tunnels follow it. It is dark: what he sees, he sees by the lamp he carries, the guild's
// lamps he has lit, and the vein. It goes down: he comes in at the top.
//   seal      the foot of the stair from the Workings: the water, the first dark
//   glitter   two screens: the first crystal gallery. Prospectors at the faces, glimmers among the crystals
//   knot      four screens: three galleries one over another, joined by shafts. An Echo. A lamp at every joining
//   assay     two screens: the Assayer, the Vein's keeper
//   cradle    two screens: where the Auger was built. Empty. Its track goes down into a hole. A relic
//   lip       the edge of the Great Shaft: the way on, later
// Its rule (level.js RULE.lit; main.js the lamp). Do not go back over it. The Echo goes where he went a few seconds ago
// and strikes where he was; it will not come into the light of a guild lamp he has lit.
import { room, rect, door, ledge, mark, cave, EMPTY, STILLED } from '../rooms.js';

const filler = draw => { const r = room(); draw(r); r.filler = true; return r; };
function solid(){ return filler(r => { rect(r, 0, 0, 39, 22); }); }
const deco = (r, kind, x, y) => mark(r, 'deco', x, y, { kind });
const keep = (r, x, y) => mark(r, 'keep', x, y);
const up = (r, x0, x1, ys) => { for (const y of ys) ledge(r, x0, x1, y); };
const lamp = (r, x, y) => mark(r, 'glamp', x, y);                   // a guild lamp, unlit: it hangs at y

function seal(){
  const r = cave(); door(r, 'top', 4, 9); up(r, 4, 9, [5, 9, 13, 17, 21]); door(r, 'right', 2, 7);
  // (the way up is taken from the third rung: the room's roof is the level's, and there is no jumping higher than its top)
  mark(r, 'spawn', 14, 2); mark(r, 'arrive', 14, 2, { name: 'top' }); mark(r, 'arrive', 17, 2, { name: 'overflow' }); mark(r, 'pass', 4, 15, { w: 6, h: 6, to: 6, at: 'seal' });
  rect(r, 20, 1, 26, 1, EMPTY); mark(r, 'pool', 20, 1, { w: 7, look: 'trough' });   // the Vein's raising water: the last trough the guild set
  lamp(r, 14, 8); lamp(r, 32, 8); mark(r, 'crystal', 36, 2); mark(r, 'urn', 28, 2);
  mark(r, 'npc', 32, 2, { who: 'hob' });                             // Hob, under the second lamp: he has come down ahead, as he said
  for (const x of [34, 36]) for (const y of [3, 6]) keep(r, x, y); for (const x of [5, 8]) for (const y of [19, 21]) keep(r, x, y);
  return r;
}
function glitter(){
  const r = cave(2, 1); door(r, 'left', 2, 7); door(r, 'bottom', 10, 15); ledge(r, 10, 15, 1);
  ledge(r, 30, 38, 7); ledge(r, 50, 58, 9);
  mark(r, 'prospector', 28, 2, { face: 1 }); mark(r, 'crystal', 33, 2); mark(r, 'prospector', 62, 2, { face: 1 }); mark(r, 'crystal', 67, 2);
  mark(r, 'glimmer', 22, 2); mark(r, 'glimmer', 44, 2); mark(r, 'glimmer', 54, 10); mark(r, 'glimmer', 73, 2);
  mark(r, 'crystal', 40, 2); mark(r, 'crystal', 50, 2); mark(r, 'crystal', 34, 8); mark(r, 'crystal', 76, 2); mark(r, 'crystal', 6, 2);
  lamp(r, 18, 8); lamp(r, 46, 14); lamp(r, 72, 8);
  mark(r, 'chest', 76, 2, { holds: 'shards' }); mark(r, 'urn', 25, 2); mark(r, 'urn', 58, 2);
  for (const x of [3, 5]) for (const y of [3, 6]) keep(r, x, y);
  return r;
}
// the knot: its three galleries' floors (the row he stands on) and the shafts between them
export const KNOT = { floors: [2, 17, 32] };
function knot(){
  const r = cave(2, 2); rect(r, 2, 2, 77, 43, EMPTY); door(r, 'top', 50, 55); up(r, 50, 55, [35, 39, 43]); door(r, 'bottom', 58, 63); ledge(r, 58, 63, 1);
  rect(r, 2, 15, 77, 16); rect(r, 2, 30, 77, 31);                  // two floors across it: three galleries
  for (const [x, y0] of [[8, 30], [66, 30], [30, 15], [70, 15]]){ rect(r, x, y0, x + 5, y0 + 1, EMPTY); ledge(r, x, x + 5, y0 + 1); up(r, x, x + 5, [y0 - 10, y0 - 6, y0 - 2]); }   // a shaft through each, planked over at its top, rungs down it
  for (const [x, y] of [[20, 37], [60, 37], [20, 22], [50, 22], [20, 7], [64, 7]]) lamp(r, x, y);
  mark(r, 'echo', 40, 32);
  mark(r, 'prospector', 26, 32, { face: 1 }); mark(r, 'crystal', 31, 32); mark(r, 'prospector', 46, 17, { face: -1 }); mark(r, 'crystal', 41, 17);
  mark(r, 'glimmer', 16, 17); mark(r, 'glimmer', 58, 17); mark(r, 'glimmer', 14, 2); mark(r, 'glimmer', 44, 2); mark(r, 'glimmer', 74, 32);
  mark(r, 'chest', 5, 2, { holds: 'thread' }); mark(r, 'chest', 75, 17, { holds: 'shards' });
  mark(r, 'crystal', 4, 32); mark(r, 'crystal', 76, 2); mark(r, 'crystal', 24, 2); mark(r, 'crystal', 62, 17); mark(r, 'urn', 36, 2);
  for (let x = 6; x <= 74; x += 4) for (const y of [8, 12, 22, 26, 37, 41]) keep(r, x, y);   // the galleries stay as they were cut
  return r;
}
function assay(){
  const r = cave(2, 1); rect(r, 2, 2, 77, 20, EMPTY); door(r, 'top', 18, 23); up(r, 18, 23, [5, 9, 13, 17, 21]); door(r, 'bottom', 4, 9); rect(r, 4, 0, 9, 1, STILLED);
  mark(r, 'assayer', 44, 2); mark(r, 'echo', 60, 2, { late: true });
  lamp(r, 12, 9); lamp(r, 74, 9); mark(r, 'crystal', 30, 2); mark(r, 'crystal', 58, 2);
  for (let x = 6; x <= 74; x += 4) for (const y of [14, 18]) keep(r, x, y);
  return r;
}
function cradle(){
  const r = cave(2, 1); rect(r, 2, 2, 77, 20, EMPTY); door(r, 'top', 44, 49); up(r, 44, 49, [5, 9, 13, 17, 21]); door(r, 'right', 12, 17);
  rect(r, 70, 2, 77, 11); rect(r, 66, 2, 69, 7); rect(r, 62, 2, 65, 4);   // up to the lip's door
  mark(r, 'chest', 8, 2, { holds: 'relic:lampstone' }); deco(r, 'cradle', 24, 2); mark(r, 'echo', 30, 2);
  lamp(r, 14, 9); lamp(r, 40, 9); lamp(r, 60, 9); mark(r, 'crystal', 18, 2); mark(r, 'glimmer', 54, 2);
  for (const x of [74, 76]) for (const y of [13, 16]) keep(r, x, y);
  r.after = true;
  return r;
}
function lip(){
  const r = cave(); rect(r, 2, 2, 37, 20, EMPTY); door(r, 'left', 12, 17); door(r, 'bottom', 23, 29);
  // (the Great Shaft itself: the hole in the floor, and the way down it)
  mark(r, 'pass', 23, 0, { w: 7, h: 2, to: 9, at: 'top', gate: 'still' }); mark(r, 'arrive', 16, 2, { name: 'lip' });
  rect(r, 2, 2, 12, 11); ledge(r, 14, 18, 5); ledge(r, 14, 18, 8);   // the lip itself, and rungs back up to it from the foot
  ledge(r, 17, 22, 11); ledge(r, 25, 30, 13); ledge(r, 32, 37, 15); mark(r, 'chest', 35, 16, { holds: 'thread' });
  deco(r, 'shaft', 26, 2); lamp(r, 8, 18); mark(r, 'crystal', 34, 2);
  for (const x of [3, 5]) for (const y of [13, 16]) keep(r, x, y);
  r.after = true;
  return r;
}

// ---- its look: black rock, the vein in it pale and too bright
const themeDef = {
  stone: { edge: 'ink', topEdge: 'cyan', lip: 'pale', lip2: 'light', lipD: 2, lip2D: 3, a: 'dark', aSeam: 'deep', b: 'deep', bSeam: 'ink', c: 'ink', core: 'ink', seam: 'strata', band: [9, 14, 19] },
  moss: { c: ['cyan', 'pale', 'white'], p: 0.1 }, plank: ['wood1', 'wood3', 'wood0', 'wood2'], spike: ['cyan', 'white'],
  ceilLow: [['stalactite', 4], ['chain', 2]], ceil: [['stalactite', 30], ['chain', 14], ['root', 4]],
  floorWall: ['crystal', 'rubble', 'crystal', 'bones'], floorOpen: ['crystal', 'rubble', 'crystal'], gem: 'crystal',
  back: { cols: ['ink', 'ink', 'deep'], dim: [0.6, 0.62, 0.78], hole: 99, holeOpen: 99, stand: [['pillar', 3]], hang: [['stalactite', 40], ['chain', 20]], pStand: 0.008, pHang: 0.02 },
  far: { img: 'workings', raw: true }, hemi: [0xbfe0ff, 0x3a4a70, 0.5], shaft: null, bloom: [0.7, 0.8],
  amb: [0.1, 0.11, 0.16], mist: { col: 'deep', col2: 'ink', a: 0.2, drift: 0.06 }, fore: 'roots',
  air: { n: 50, cols: [0x9fe8ff, 0xffffff], warm: 0.1, vx: 0.04, vy: [0.01, 0.06] },
};
const decoDef = (px, PAL) => ({
  // the Auger's cradle: two timber bearers, the rails between them, and the hole the rails go down into
  cradle(g, x, y){ for (const a of [-34, 30]){ px(g, PAL.ink, x + a, y - 20, 6, 20); px(g, PAL.wood1, x + a + 1, y - 19, 4, 19); px(g, PAL.wood2, x + a + 1, y - 19, 1, 19); } px(g, PAL.ink, x - 36, y - 24, 74, 5); px(g, PAL.wood1, x - 35, y - 23, 72, 3); px(g, PAL.wood3, x - 35, y - 23, 72, 1);
    px(g, PAL.ink, x - 40, y - 3, 84, 3); px(g, PAL.mid, x - 39, y - 3, 82, 1); for (let a = -38; a < 42; a += 6) px(g, PAL.wood0, x + a, y - 2, 3, 2); px(g, PAL.ink, x + 44, y - 6, 22, 6); px(g, '#000000', x + 46, y - 4, 18, 4); },
  // the edge of the Great Shaft: a broken rail, and nothing
  shaft(g, x, y){ px(g, PAL.ink, x - 30, y - 12, 2, 12); px(g, PAL.wood1, x - 30, y - 12, 1, 11); px(g, PAL.ink, x - 30, y - 12, 14, 2); px(g, PAL.wood2, x - 29, y - 12, 12, 1); px(g, PAL.ink, x - 18, y - 11, 2, 5); for (let k = 0; k < 9; k++) px(g, '#000000', x - 10 + k * 5, y - 1 - (k % 3), 4, 2 + (k % 3)); },
});

// ---- who is in it
const three = () => { const T3 = typeof window !== 'undefined' && window.THREE; return T3 && T3.Group && T3.CanvasTexture && typeof document !== 'undefined' ? T3 : null; };
const pix = (T3, w, h, paint) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); paint((col, x, y, ww, hh) => { g.fillStyle = col; g.fillRect(x, y, ww, hh); }); const t = new T3.CanvasTexture(c); t.magFilter = t.minFilter = T3.NearestFilter; t.generateMipmaps = false; return t; };
const mesh = (T3, map, w, h, more = {}) => new T3.Mesh(new T3.PlaneGeometry(w, h), new T3.MeshBasicMaterial({ map, transparent: true, alphaTest: 0.5, ...more }));
let TEX = null;
const texes = T3 => TEX || (TEX = {
  ghost: pix(T3, 14, 38, f => { f('#bfe8ff', 4, 0, 6, 6); f('#bfe8ff', 3, 6, 8, 14); f('#bfe8ff', 2, 9, 2, 10); f('#bfe8ff', 10, 9, 2, 10); f('#bfe8ff', 3, 20, 3, 16); f('#bfe8ff', 8, 20, 3, 16); f('#ffffff', 5, 1, 4, 3); f('#9fd0ff', 3, 34, 3, 3); f('#9fd0ff', 8, 34, 3, 3); }),
  post: pix(T3, 12, 56, f => { f('#181425', 2, 0, 8, 56); f('#b86f50', 3, 1, 6, 55); f('#feae34', 3, 1, 2, 55); f('#743f39', 7, 1, 2, 55); f('#181425', 0, 50, 12, 6); f('#b86f50', 1, 51, 10, 4); f('#181425', 1, 0, 10, 5); f('#feae34', 2, 1, 8, 3); }),
  beam: pix(T3, 96, 5, f => { f('#181425', 0, 0, 96, 5); f('#b86f50', 1, 1, 94, 3); f('#feae34', 1, 1, 94, 1); f('#181425', 46, 0, 4, 5); f('#ffffff', 47, 1, 2, 2); }),
  pan: pix(T3, 28, 26, f => { f('#8b9bb4', 13, 0, 2, 16); f('#181425', 3, 15, 22, 2); f('#181425', 0, 17, 28, 9); f('#b86f50', 1, 18, 26, 7); f('#feae34', 1, 18, 26, 2); f('#743f39', 1, 23, 26, 2); }),
});
const lampsLit = c => { if (c.LL && c.LL.n === c.RULE.lit.size) return c.LL.a; const a = (c.marks || []).filter(m => m.type === 'glamp' && (c.RULE.litAll || c.RULE.lit.has(m.x + ',' + m.y))).map(m => [(m.x + 0.5) * c.T, m.y * c.T]); return a; };
export const ECHO = { delay: 2.6, speed: 10, shy: 4.5, keep: 7 };
export const ASSAY = { hp: 26, pan: 5, half: 1.7, tell: 0.85, down: 0.5, rest: [1.5, 1.1, 0.9], second: 0.5 };

const enemies = {
  // a prospector: his face to the glitter. He notices only what comes between him and it
  prospector: { ai: 'prospector', hp: 4, w: 0.6, h: 2.0, color: 0x8b9bb4, sees: 6.5, reach: 2.2, wind: 0.55, rest: 0.9, speed: 2.4, art: 'px_prospector', fly: false, word: 'Struck with a pick', onHit(e){ e.woke = true; } },
  // a glimmer: ore, until he is on it
  glimmer: { ai: 'glimmer', hp: 2, w: 0.6, h: 0.6, color: 0x9fe8ff, wake: 1.4, speed: 5.4, art: 'px_glimmer', fly: false, word: 'Bitten', onHit(e){ e.woke = true; } },
  // the Echo: it goes where he went, a few seconds after, and strikes where he was. It cannot be struck. It will not come into a lit lamp's light
  echo: { ai: 'echo', own: true, noAim: true, hp: 99, w: 0.4, h: 2.2, color: 0xbfe8ff, fly: true, word: 'Caught by his echo', guard(){ return true; } },
  // the Assayer: the Vein's keeper. A great balance. It weighs what is brought to it, and finds it light
  assayer: { ai: 'assayer', own: true, hp: ASSAY.hp, w: 0.8, h: 3.4, color: 0xb86f50, fly: false, name: 'The Assayer', word: 'Found light', onHit(e){ e.woke = true; },
    spawn(e, c){ if (c.RULE.still) e.alive = false; } },
};
const ai = {
  prospector(e, P, dt, c){
    const d = e.d, m = e.mk || {}, face0 = m.face || 1, dx = P.x - e.x, dy = P.y - e.y; e.fr = e.fr || 0;
    const between = Math.sign(dx) === face0 && Math.abs(dx) < d.sees && Math.abs(dy) < 1.6;
    if (e.st === 'wind'){ c.anim(e, 'attack', Math.min(1, e.tm / d.wind) * 0.6);
      if (e.tm >= d.wind){ if (Math.abs(P.x - e.x) < d.reach + 0.3 && Math.sign(P.x - e.x) !== -e.face && Math.abs(dy) < 1.6 && !c.isRollInv(P)){ if (P.blocking && P.face === -e.face){ e.flash = 0.08; c.events.push({ type: 'block', at: { x: P.x + P.face * 0.5, y: P.y + 1.2 }, mine: true, e }); } else c.hurt(P, 1, e.x, d.word); } c.go('rest'); } return; }
    if (e.st === 'rest'){ c.anim(e, 'attack', 0.9); if (e.tm >= d.rest) c.go(e.hunt ? 'hunt' : 'idle'); return; }
    if (!e.hunt){ if (between || e.woke){ e.hunt = true; c.go('hunt'); c.events.push({ type: 'notice', e }); } else { e.face = face0; if (Math.abs(e.x - e.home.x) > 0.2){ const s = Math.sign(e.home.x - e.x); e.x += s * Math.min(Math.abs(e.home.x - e.x), d.speed * dt); e.fr = (e.fr + dt) % 1; c.anim(e, 'walk', e.fr); } else { if (e.st !== 'idle') c.go('idle'); c.anim(e, 'attack', (e.age * 0.45) % 1 * 0.55); } return; } }
    if (Math.abs(dx) > d.sees * 1.6 || Math.abs(dy) > 3){ e.hunt = false; e.woke = false; return; }   // he is gone: back to the glitter
    e.face = Math.sign(dx) || e.face;
    if (Math.abs(dx) < d.reach && Math.abs(dy) < 1.6){ c.go('wind'); c.events.push({ type: 'tell', e }); return; }
    const nx = e.x + e.face * d.speed * dt; if (!c.solidAt || c.solidAt(nx + e.face * 0.4, e.y - 0.2)) e.x = nx; e.fr = (e.fr + dt * 1.1) % 1; c.anim(e, 'walk', e.fr);
  },
  glimmer(e, P, dt, c){
    const d = e.d, dx = P.x - e.x, dy = P.y - e.y; e.fr = e.fr || 0;
    if (e.st === 'rest'){ c.anim(e, 'walk', e.fr); if (e.tm > 0.6) c.go('run'); return; }
    if (e.st !== 'run'){ e.dormant = true; if (e.woke || (Math.hypot(dx, dy) < d.wake)){ e.dormant = false; e.woke = true; c.go('run'); c.events.push({ type: 'notice', e }); } else { if (e.st !== 'idle') c.go('idle'); c.anim(e, 'stand', 0); } return; }
    if (Math.abs(dx) > 12 || Math.abs(dy) > 5){ e.woke = false; c.go('idle'); return; }
    e.face = Math.sign(dx) || e.face; if (Math.abs(dy) < 2.2 && Math.abs(dx) > 0.3){ const nx = e.x + e.face * d.speed * dt; if (!c.solidAt || c.solidAt(nx + e.face * 0.3, e.y - 0.2)) e.x = nx; } e.fr = (e.fr + dt * 3) % 1; c.anim(e, 'walk', e.fr);
    if (Math.abs(dx) < 0.6 && Math.abs(dy) < 1 && !c.isRollInv(P) && c.hurt(P, 1, e.x, d.word)) c.go('rest');
  },
  echo(e, P, dt, c){
    // (the Tally's End, a relic of the Hollow: once each rest, an Echo that catches him does not hurt him)
    const m = e.mk || {}; e.st = 'idle';
    if (!e.rm) e.rm = (c.rooms || []).find(r => e.home.x >= r.x0 && e.home.x < r.x1 && e.home.y >= r.y0 && e.home.y < r.y1) || { x0: -1e9, x1: 1e9, y0: -1e9, y1: 1e9 };
    const here = P.x > e.rm.x0 && P.x < e.rm.x1 && P.y > e.rm.y0 - 0.5 && P.y < e.rm.y1, late = m.late && !((c.E && c.E.list) || []).some(q => q.type === 'assayer' && q.alive && q.stage >= 2);
    if (!here || late){ e.trail = null; e.shown = false; }
    else { const T0 = e.trail || (e.trail = []); e.clock = (e.clock || 0) + dt; T0.push([e.clock, P.x, P.y]); while (T0.length && T0[0][0] < e.clock - ECHO.keep) T0.shift();
      let s = null; for (const q of T0){ if (q[0] <= e.clock - ECHO.delay) s = q; else break; }
      if (s){ const lit = lampsLit(c), inLight = lit.some(l => Math.hypot(l[0] - s[1], l[1] - (s[2] + 1.2)) < ECHO.shy);
        if (!e.shown){ e.x = s[1]; e.y = s[2]; e.shown = true; } else if (!inLight){ const L = Math.hypot(s[1] - e.x, s[2] - e.y), k = Math.min(L, ECHO.speed * dt); if (L > 1e-4){ e.x += (s[1] - e.x) / L * k; e.y += (s[2] - e.y) / L * k; e.face = Math.sign(s[1] - e.x) || e.face; } }
        e.held = inLight;
        if (Math.hypot(P.x - e.x, P.y - e.y) < 0.7 && !c.isRollInv(P) && !lit.some(l => Math.hypot(l[0] - P.x, l[1] - (P.y + 1.2)) < ECHO.shy) && (c.SIDE && c.SIDE.tally ? ((c.SIDE.tally = false), c.events.push({ type: 'turned', e }), true) : c.hurt(P, 1, e.x, e.d.word))){ e.trail = null; e.shown = false; e.clock = 0; } } }
    const T3 = three(); if (!T3) return;
    if (!e.g){ e.g = mesh(T3, texes(T3).ghost, 14 / 16, 38 / 16, { alphaTest: 0, depthWrite: false, opacity: 0 }); c.E.scene.add(e.g); }
    e.g.position.set(e.x, e.y + 1.19, 0.05); e.g.scale.x = e.face || 1; e.g.material.opacity += ((e.shown ? (e.held ? 0.25 : 0.6) : 0) - e.g.material.opacity) * Math.min(1, dt * 6);
  },
  assayer(e, P, dt, c){
    const d = e.d, K = ASSAY; e.x = e.home.x; e.y = e.home.y; e.stage = e.hp > K.hp * 2 / 3 ? 0 : e.hp > K.hp / 3 ? 1 : 2; e.tilt = e.tilt || 0;
    if (!e.woke && Math.abs(P.x - e.x) < 14 && Math.abs(P.y - e.y) < 5) e.woke = true;
    const slam = s => { const px0 = e.x + s * K.pan; if (Math.abs(P.x - px0) < K.half + 0.3 && P.y < e.y + 2.6 && P.y > e.y - 0.6 && !c.isRollInv(P)) c.hurt(P, 1, px0, d.word); c.events.push({ type: 'thud', e, at: { x: px0, y: e.y } }); };
    if (!e.woke){ e.st = 'idle'; }
    else if (e.st === 'tell'){ if (e.tm >= (e.second ? K.second : K.tell)){ slam(e.side); c.go('down'); } }
    else if (e.st === 'down'){ if (e.tm >= K.down){ if (e.stage >= 1 && !e.second){ e.second = true; e.side = -e.side; c.go('tell'); } else { e.second = false; c.go('idle'); } } }
    else { if (e.st !== 'idle') c.go('idle'); if (e.tm >= K.rest[e.stage]){ e.side = Math.sign(P.x - e.x) || 1; e.second = false; c.go('tell'); c.events.push({ type: 'tell', e }); } }
    const want = e.st === 'tell' ? e.side * 0.16 : e.st === 'down' ? e.side * 0.42 : 0; e.tilt += (want - e.tilt) * Math.min(1, dt * (e.st === 'down' ? 30 : 7));
    const T3 = three(); if (!T3) return;
    if (!e.parts){ const X = texes(T3), post = mesh(T3, X.post, 0.75, 3.5), beam = mesh(T3, X.beam, 12, 5 / 16), pl = mesh(T3, X.pan, 28 / 16 * 1.6, 26 / 16 * 1.6), pr = mesh(T3, X.pan, 28 / 16 * 1.6, 26 / 16 * 1.6); for (const q of [post, pl, pr, beam]) c.E.scene.add(q); e.parts = { post, beam, pl, pr }; }
    const { post, beam, pl, pr } = e.parts, top = e.y + 3.6; post.position.set(e.x, e.y + 1.75, 0.03); beam.position.set(e.x, top, 0.034); beam.rotation.z = -e.tilt; for (const [q, s] of [[pl, -1], [pr, 1]]){ const ex = e.x + s * K.pan * Math.cos(e.tilt), ey = top - s * K.pan * Math.sin(e.tilt); q.position.set(ex, Math.max(e.y + 1.3, ey - 1.3), 0.032); }
    const col = e.flash > 0 ? 0xffffff : e.st === 'tell' && Math.sin(e.tm * 40) > 0 ? 0xfff0c0 : 0xffffff; post.material.color.setHex(col); beam.material.color.setHex(col); const vis = e.alive !== false; for (const q of [post, beam, pl, pr]) q.visible = vis;
  },
};

export default { name: 'The Vein', theme: 'vein', sub: 'where the lampstone grew, and glittered', card: '', epithet: '',
  deep: true, dark: true, depth: [-2.2, -1.3], musicOf: 'roots', ambOf: 'roots', vestibule: false,
  seed: 2718281, cols: 3, wear: { sag: 0.5, swell: 0.5, humps: 0.4 },
  layout: [[0, 4, seal], [0, 0, cradle, 2, 1], [2, 0, lip], [0, 1, solid], [1, 1, assay, 2, 1], [0, 2, knot, 2, 2], [2, 2, solid], [2, 3, solid], [1, 4, glitter, 2, 1]],   // (the seal first: its stair is where the level leads back to)
  themeDef, deco: decoDef, enemies, ai };
