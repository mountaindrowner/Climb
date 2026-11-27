// The side view's creatures, from the level's markers: the climb's threats remade for a 2D world.
//   crawler   chases along the floor, rears up (the tell), lunges. Block, roll through, or strike it while it rears.
//   flitter   a bat: it circles you, then dives where you were. One cut kills it.
//   spitter   clings to the rock; swells and spits a glob that leads you. Block, or raise the block as it lands to parry
//             it back and burst the sac.
//   burrower  a mound runs at you under the floor and bursts up snapping: jump it, then cut it before it sinks.
// Those are the Roots'. Higher up the mountain has its own, each built on one of those ways of fighting (`ai`) or a new one:
//   the Cloister   acolyte   a hooded monk with a mace: slow, tough, a long overhead blow (ai crawler)
//                  gargoyle  stone on a perch until you come near, then it dives, heavier than a bat (ai flitter)
//                  wisp      a burning lantern adrift: two bolts of fire, one after the other (ai spitter)
//   the Spires     yeti      keeps its distance and lobs ice in an arc; swats if you close (ai thrower)
//                  harpy     a white hawk: fast, and it dives twice before it wheels away (ai flitter)
//                  wraith    drifts at you through anything, rears, and rushes: cut it as it recovers (ai wraith)
// Each is drawn with its PixelLab strips once they exist (tools/pixellab.py), a glowing stand-in before.
import { T, ROCK, LEDGE, LEVEL, tileAt, REGION_DATA, RULE, waterAt, moverAt, PHASE } from './level.js';
import { hurt, isRollInv, shove, SIDE } from './motor.js';
import { makeSprite, lit as litMat } from './render.js';
const THREE = window.THREE;
const ground = (x, y) => {   // the floor under (x, y): the top of the first rock or ledge tile at or below y
  const i = Math.floor(x / T);
  for (let j = Math.floor((y + 0.05) / T); j >= 0; j--){ const t = tileAt(i, j); if (t === ROCK || t === LEDGE) return (j + 1) * T; }
  return -Infinity;
};
const solidAt = (x, y) => tileAt(Math.floor(x / T), Math.floor(y / T)) === ROCK;
// ai: which way of fighting; an: its drawings' names for that way's moves; orb: what it throws
const DEF = {
  crawler:  { ai: 'crawler', hp: 3, w: 0.55, h: 0.8, color: 0xc060ff, wake: 7, reach: 1.9, chase: 2.6, windup: 0.5, lunge: 0.26, lungeDist: 2.2, recover: 0.6, stun: 0.6, art: 'crawler', fly: false },
  flitter:  { ai: 'flitter', hp: 1, w: 0.4, h: 0.5, color: 0xffb040, glow: 0x3a2a4a, wake: 7, circle: 1.2, dive: 0.55, commit: 0.3, leave: 0.8, art: 'flitter', fly: true },
  // the spitters, a family, harder as the mountain goes on. cling: what it holds to ('wall', 'ceiling', 'floor'): it is
  // set against the nearest of it, its drawing's rock against the rock. variants: drawings it is one of, by where it is
  spitter:  { ai: 'spitter', aim: true, hp: 2, w: 0.6, h: 0.8, color: 0x70ff70, range: 8, charge: 0.7, speed: 8, cooldown: 2.0, art: 'px_leech', fly: true, cling: 'wall' },
  lamprey:  { ai: 'spitter', hp: 3, w: 0.5, h: 1.2, color: 0xf6757a, range: 9, charge: 0.65, speed: 10, cooldown: 1.8, burst: 2, orb: 0xd8ff80, art: 'px_lamprey', fly: true, cling: 'ceiling', mouthY: -0.44, word: 'Spat on' },
  barnacle: { ai: 'spitter', hp: 3, w: 0.8, h: 1.6, color: 0x5a6988, range: 7, charge: 0.6, speed: 9, cooldown: 1.6, variants: ['px_barn_a', 'px_barn_b', 'px_barn_c'], fly: false, cling: 'floor', sink: 2, word: 'Spat on' },   // sink: drawn two pixels into the ground it grows from (a playtest: it sat on the floor's edge, not in it)
  toad:     { ai: 'spitter', hp: 5, w: 0.9, h: 2.0, color: 0xc0cbdc, range: 10, charge: 0.9, speed: 9, cooldown: 2.0, lob: true, orb: 0xb8f060, variants: ['px_toad_b'], fly: false, cling: 'floor', word: 'Spat on' },
  burrower: { ai: 'burrower', hp: 2, w: 0.6, h: 1.1, color: 0xd0a070, wake: 7, plough: 5.5, rise: 0.45, up: 1.2, art: 'burrower', fly: false },
  // not creatures to fight (phase 9, the passages): the Bell Road's grey-threaded pilgrims walk their stretch of it and
  // take no notice of him; the Long Stair's sweeper is always a few steps ahead. Neither is hurt, neither hurts
  pilgrim:  { ai: 'crawler', hp: 9, w: 0.6, h: 1.9, color: 0x8b9bb4, wake: 0, reach: 0, chase: 1.5, windup: 9, lunge: 0, lungeDist: 0, recover: 1, stun: 0, art: 'px_acolyte', fly: false, harmless: true, tint: 0x9aa4bc, glow: 0x262b33 },
  // the refectory's two: they serve a table no one comes to, up and down it; they take no notice of him
  server:   { ai: 'crawler', hp: 9, w: 0.6, h: 1.9, color: 0xead4aa, wake: 0, reach: 0, chase: 1.3, windup: 9, lunge: 0, lungeDist: 0, recover: 1, stun: 0, art: 'px_acolyte', fly: false, harmless: true, tint: 0xe8d8c0, glow: 0x2a2018 },
  sweeper:  { ai: 'sweeper', hp: 9, w: 0.5, h: 1.9, color: 0xc0cbdc, wake: 0, art: 'px_acolyte', fly: false, harmless: true, tint: 0xdde4ff, glow: 0x66708a },
  acolyte:  { ai: 'crawler', hp: 5, w: 0.6, h: 1.9, color: 0xa22633, wake: 8, reach: 2.1, chase: 2.0, windup: 0.62, lunge: 0.2, lungeDist: 1.5, recover: 0.8, stun: 0.5, hitR: 1.2, art: 'px_acolyte', fly: false, word: 'Struck' },
  // the Ossuary's elite (regions/ossuary.js): the house's sexton, a head taller than his men, slow to start and hard to
  // stop, two hearts a blow of his spade. Blocked, he staggers; turned at the right moment, he is open a long while.
  // (scale: a creature drawn that much larger, its feet kept on the floor; none needs it now)
  sexton:   { ai: 'crawler', hp: 18, w: 0.8, h: 3.0, color: 0x6b3f2a, wake: 9, reach: 3.0, chase: 1.9, windup: 0.8, lunge: 0.26, lungeDist: 2.8, recover: 0.9, stun: 0.5, hitR: 1.6, dmg: 2, art: 'px_sexton', fly: false, word: 'Buried' },
  gargoyle: { ai: 'flitter', hp: 3, w: 0.55, h: 0.9, color: 0x8b9bb4, wake: 6, circle: 1.5, dive: 0.6, commit: 0.34, leave: 1.0, perch: true, art: 'px_gargoyle', fly: true, word: 'Clawed' },
  wisp:     { ai: 'spitter', hp: 2, w: 0.45, h: 0.8, color: 0xf77622, range: 9, charge: 0.8, speed: 9, cooldown: 2.4, burst: 2, hover: true, orb: 0xfeae34, an: { charge: 'cast', idle: 'float' }, art: 'px_wisp', fly: true, word: 'Burned' },
  // (build 88, decision 0.17: the larger creatures' blows cost two hearts. `dmg` where the blow reads it; `heavy` on one
  // with a turn of its own, regions/*.js: every blow of its body costs at least that. What they throw still costs one)
  yeti:     { ai: 'thrower', dmg: 2, hp: 6, w: 0.7, h: 1.8, color: 0xc0cbdc, wake: 10, range: 9, keep: 4.5, chase: 1.7, windup: 0.7, recover: 0.7, cooldown: 1.9, stun: 0.45, orb: 0x2ce8f5, an: { attack: 'throw' }, art: 'px_yeti', fly: false, word: 'Struck by ice' },
  harpy:    { ai: 'flitter', hp: 1, w: 0.5, h: 0.7, color: 0xffffff, wake: 9, circle: 0.8, dive: 0.45, commit: 0.24, leave: 0.6, dives: 2, art: 'px_harpy', fly: true, word: 'Raked' },
  wraith:   { ai: 'wraith', hp: 3, w: 0.5, h: 1.2, color: 0x2ce8f5, glow: 0x103040, wake: 8, chase: 2.3, windup: 0.5, rush: 0.28, rushSpeed: 10, recover: 1.0, an: { fly: 'float', dive: 'slash' }, art: 'px_wraith', fly: true, word: 'Frozen' },
};
// a region's file can bring its own creatures: `enemies` (entries like those above) and `ai` (ways of fighting those
// name: ai[name](e, P, dt, ctx) is called every step for each living one, with the helpers in ctx (stepEnemies)
const CUSTOM = {};
for (const R of REGION_DATA){ if (R.enemies) Object.assign(DEF, R.enemies); if (R.ai) Object.assign(CUSTOM, R.ai); }
const ART = { crawler: ['px_crawler', 'crawler3', 'crawler'], flitter: ['px_flitter', 'flitter2', 'flitter'], spitter: ['px_leech', 'px_spitter'], burrower: ['px_burrower', 'burrower2', 'burrower'] };
export function spawnEnemies(scene, R){
  const list = [];
  for (const m of LEVEL.marks){
    const d = DEF[m.type]; if (!d) continue;
    const x = d.perch && m.perch ? (m.perch.x + 0.5) * T : (m.x + 0.5) * T, y = d.perch && m.perch ? m.perch.y * T + d.h * 0.7 : d.fly ? m.y * T + 1.6 : m.y * T;   // a percher sits on its perch (level.js)
    const e = { type: m.type, d, x, y, home: { x, y }, vx: 0, vy: 0, face: d.perch && m.perch && m.perch.side ? -m.perch.side : -1, hp: d.hp, st: 'idle', tm: 0, age: Math.random() * 6, flash: 0, dead: 0, alive: true, orb: null, dirn: m.dir || 1, mk: m };
    // a stand-in until the art loads: a glowing shape
    e.stand = new THREE.Mesh(new THREE.PlaneGeometry(d.w * 2, d.h), new THREE.MeshBasicMaterial({ color: d.color }));
    scene.add(e.stand);
    // the newest drawing that is there (drawn flat, at the game's pixel scale), else the first
    const tryArt = names => { if (!names.length) return; const n = names[0];
      fetch(`assets/side/${n}/sprite.json`).then(r => r.ok ? r.json() : null).then(meta => { if (meta && Object.keys(meta.anims).length > 1){ const sp = makeSprite(scene, `assets/side/${n}`, meta).warm(); sp.g.visible = false; e.meta = meta; if (d.cling) cling(e, meta);
        // its drawing replaces the stand-in only once every strip of it is in: it never blinks out while they come
        let tries = 0; const swap = () => { if (sp.in() || ++tries > 400){ e.sprite = sp; sp.g.visible = e.alive; e.stand.visible = false; if (d.tint) sp.g.traverse(o => { if (o.material && o.material.color) o.material.color.setHex(d.tint); }); } else setTimeout(swap, 60); }; swap(); } else tryArt(names.slice(1)); }).catch(() => tryArt(names.slice(1))); };
    // one that draws itself (`own`: a region's ai makes its picture) has no drawing to fetch, and no stand-in
    if (d.own) e.stand.visible = false; else
    tryArt(d.variants ? [d.variants[(m.x * 7 + m.y * 3) % d.variants.length]] : ART[m.type] || [d.art]);
    // how it comes in, if it says (a wing's keeper that was beaten is not there again). Until build 78 only those that
    // draw themselves were asked: the Housekeeper and the Almanac, which have drawings, stood again every visit
    if (d.spawn) d.spawn(e, { scene, lit: litMat, RULE, T });
    if (d.cling === 'floor'){ const gy = ground(x, y + 0.3); if (gy > -Infinity){ e.y = e.home.y = gy; } }
    if (e.d.perch) e.home.face = e.face;
    list.push(e);
  }
  const orbMats = {}, orbMat = c => orbMats[c] || (orbMats[c] = new THREE.MeshBasicMaterial({ color: c }));
  return { list, orbGeo: new THREE.SphereGeometry(0.18, 8, 6), orbMat, scene, R };
}
const anim = (e, name0, frac, dy = 0, z = 0.03) => { if (!e.sprite) return; const A = e.meta.anims, name = (e.d.an && e.d.an[name0]) || name0; const n = A[name] ? name : Object.keys(A).find(k => k !== 'stand') || 'stand'; e.sprite.show(n, frac, e.x, (e.d.fly ? e.y - e.d.h * 0.7 : e.y) + dy - (e.d.sink || 0) / 16, e.face, z, e.rot || 0);
  if (e.d.scale){ const s = e.d.scale, piv = (A.stand ? A.stand.h : 32) / (e.meta.ppu || 64) * 0.45; e.sprite.g.scale.setScalar(s); e.sprite.g.position.y += piv * (s - 1); } };   // drawn larger, its feet kept where they were

// set a clinging creature against what it clings to, by its drawing (its sprite.json's box: the drawing's edges in
// its canvas). A wall: the nearest to either side, its rock to the wall, facing out, never turning. A ceiling: the
// nearest above, hanging from it; with none near, the nearest wall, turned to hang from that. With nothing near it
// stays where it was put
function cling(e, meta){
  const A = meta.anims.stand, B = meta.box || { l: 0, t: 0, r: A.w, b: A.foot }, P = 1 / 16, d = e.d, mx = e.home.x, my = e.home.y;
  const wallAt = () => { for (let k = 0; k <= 12; k++) for (const s of [-1, 1]){ const tx = Math.floor(mx / T) + s * k; if (solidAt((tx + 0.5) * T, my - d.h * 0.4)) return { s, x: s < 0 ? (tx + 1) * T : tx * T }; } return null; };
  if (d.cling === 'wall'){ const w = wallAt(); if (!w) return;
    e.fixFace = -w.s; e.face = e.fixFace; e.x = e.home.x = w.x - w.s * ((A.cx - B.l) * P - P); }
  if (d.cling === 'ceiling'){
    let ceil = null; for (let k = 0; k < 18; k++){ const ty = Math.floor(my / T) + k; if (solidAt(mx, (ty + 0.5) * T)){ ceil = ty * T; break; } }
    if (ceil !== null){ const drawY = ceil - (A.foot - B.t) * P + P; e.y = e.home.y = drawY + d.h * 0.7; return; }
    const w = wallAt(); if (!w) return;   // turned a quarter, its tail to the wall
    e.rot = w.s < 0 ? -Math.PI / 2 : Math.PI / 2; e.fixFace = 1; e.face = 1; e.x = e.home.x = w.x - w.s * ((A.foot - B.t) * P * 0.5 - P);
  }
}
const LOB_G = 15;
// can it see him: a straight line from its middle to his chest with no rock across it (a playtest saw creatures shoot
// through walls). A lob arcs, so for a thrower the line is taken from a little above it
function sees(e, P, lift = 0){
  const x0 = e.x, y0 = e.y + (e.d.fly ? 0 : e.d.h * 0.6) + lift, x1 = P.x, y1 = P.y + 1.3, n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 0.25);
  for (let k = 1; k < n; k++){ const u = k / n; if (tileAt(Math.floor((x0 + (x1 - x0) * u) / T), Math.floor((y0 + (y1 - y0) * u) / T)) === ROCK) return false; }
  return true;
}
function shoot(E, e, P, lob){
  const col = e.d.orb || 0x9dff70, x0 = e.x + e.face * e.d.w * 0.6, y0 = e.d.fly ? e.y + (e.d.mouthY || 0) : e.y + e.d.h * 0.9;
  let vx, vy;
  if (lob){ const t = Math.max(0.6, Math.min(1.25, Math.abs(P.x - x0) / 7)), tx = P.x + P.vx * t * 0.5, ty = P.y + 0.8; vx = (tx - x0) / t; vy = (ty - y0 + 0.5 * LOB_G * t * t) / t; }
  else {   // leads him: where he will be when it gets there
    let tx = P.x, ty = P.y + 1.4; for (let i = 0; i < 3; i++){ const t = Math.hypot(tx - x0, ty - y0) / e.d.speed; tx = P.x + P.vx * t; ty = P.y + 1.4 + (P.grounded ? 0 : P.vy * t * 0.5); }
    const L = Math.hypot(tx - x0, ty - y0) || 1; vx = (tx - x0) / L * e.d.speed; vy = (ty - y0) / L * e.d.speed;
  }
  if (e.orb) E.scene.remove(e.orb.m);
  e.orb = { x: x0, y: y0, vx, vy, g: lob ? LOB_G : 0, col, t: 0, m: new THREE.Mesh(E.orbGeo, E.orbMat(col)) }; if (lob) e.orb.m.scale.setScalar(1.5); E.scene.add(e.orb.m);
}
// ---- how every walker behaves when it is not fighting (docs/phase6-sheet.md 1), one rule set over their own ways of
// fighting. WALK: for each way of fighting that walks, the state it hunts him in. At rest ('idle') it walks a beat round
// its post; it notices him by sight (within its range, no rock between, in front of it or close behind), starts
// ('notice', a third of a second, a mark and its sound), then hunts. It hunts no further than LEASH from its post; if it
// has not seen him for GIVE_UP seconds, or is at its leash, it turns and walks home ('return').
export const WALK = { crawler: 'chase', thrower: 'stalk', squall: 'march', thornback: 'trot', sentinel: 'march' };
export const LEASH = 9, GIVE_UP = 3, BEAT = 3, NOTICE_T = 0.33;
const RESTING = new Set(['idle', 'notice', 'return']);
// its beat: from its post each way to a wall, an edge or BEAT units, whichever is first
function beatOf(e){
  const y = e.home.y, out = [e.home.x, e.home.x];
  for (const dir of [-1, 1]){ let x = e.home.x; for (let k = 0; k < BEAT / 0.25; k++){ const nx = x + dir * 0.25; if (solidAt(nx + dir * e.d.w, y + 0.3) || solidAt(nx + dir * e.d.w, y + 1.1) || Math.abs(ground(nx + dir * e.d.w * 0.5, y + 0.3) - y) > 0.3) break; x = nx; } out[dir < 0 ? 0 : 1] = x; }
  return out;
}
const pace = e => (e.d.chase || e.d.trot || 1.6) * 0.45;
function notices(e, P, dx, dy){ return Math.abs(dx) < e.d.wake && Math.abs(dy) < 2.5 && (dx * e.face > 0 || Math.abs(dx) < 1.2) && sees(e, P); }
// a step along its floor toward x (not into rock, not off the floor): true if it moved
function walkTo(e, x, dt, sp){ const dir = Math.sign(x - e.x); if (!dir || Math.abs(x - e.x) < 0.05) return false; const nx = e.x + dir * Math.min(sp * dt, Math.abs(x - e.x)); e.face = dir;
  if (solidAt(nx + dir * e.d.w, e.y + 0.3) || ground(nx, e.y + 0.3) < e.y - 0.6) return false; e.x = nx; const gy = ground(e.x, e.y + 0.3); if (gy > -Infinity) e.y = gy; return true; }
function atRest(e, P, dt, dx, dy, go, events, anim){
  // the Cloister's acolytes, once the bells have stopped (the Toll fallen): they stand at their posts, and fight only if struck
  if (e.type === 'acolyte' && RULE.fallen && LEVEL.theme === 'cloister' && e.st === 'idle'){ if (Math.abs(e.x - e.home.x) > 0.3) walkTo(e, e.home.x, dt, pace(e)); e.moving = false; anim(e, 'stand', 0); return; }
  if (!e.beat) e.beat = beatOf(e); let moving = false;
  if (e.st === 'idle'){
    if (e.x < e.beat[0] - 0.3 || e.x > e.beat[1] + 0.3){ go('return'); }   // left off its beat (it gave up somewhere else)
    else if (e.beat[1] - e.beat[0] > 1){ e.pdir = e.pdir || (e.face || 1); e.pause = Math.max(0, (e.pause || 0) - dt);
      if (e.pause <= 0){ const to = e.pdir > 0 ? e.beat[1] : e.beat[0]; moving = walkTo(e, to, dt, pace(e)); if (!moving){ e.pdir = -e.pdir; e.pause = 0.9; } } }
    if (notices(e, P, dx, dy)){ go('notice'); e.face = Math.sign(dx) || e.face; events.push({ type: 'notice', e }); }
  }
  else if (e.st === 'notice'){ e.face = Math.sign(dx) || e.face; if (e.tm >= NOTICE_T){ go(WALK[e.d.ai]); e.unseen = 0; } }
  else if (e.st === 'return'){ moving = walkTo(e, e.home.x, dt, pace(e) * 1.4); if (!moving){ go('idle'); e.pause = 0.6; } else if (e.tm > 1 && notices(e, P, dx, dy)){ go('notice'); events.push({ type: 'notice', e }); } }
  e.moving = moving; anim(e, 'walk', moving ? e.age * 1.3 : 0, 0, e.d.ai === 'thrower' ? 0.03 : undefined);
}
// the worm's stretch of floor: as far each way from its post as the floor runs level and unbroken (10 units at most)
function stretchOf(e){ const y = e.home.y, out = [e.home.x, e.home.x]; for (const dir of [-1, 1]){ let x = e.home.x; for (let k = 0; k < 40; k++){ const nx = x + dir * 0.25; if (solidAt(nx, y + 0.3) || tileAt(Math.floor(nx / T), Math.floor((y - 0.05) / T)) !== ROCK) break; x = nx; } out[dir < 0 ? 0 : 1] = x - dir * 0.4; } return out; }
// how far from him (world units, either way) a creature at rest sleeps: well beyond the edge of the view
export const SLEEP = { x: 24, y: 15 };
export function stepEnemies(E, P, dt, fx, events){
  for (const e of E.list){
    e.flash = Math.max(0, e.flash - dt);
    if (!e.alive){ if (e.aim) e.aim.visible = false; if (e.hump) e.hump.visible = false; e.dead += dt; e.y -= dt * (e.d.fly ? 6 : 0); if (e.orb){ E.scene.remove(e.orb.m); e.orb = null; } continue; }
    // (wakeful, in a creature's definition: it is never asleep. The Housekeeper keeps its houses whether he is near or not)
    // asleep: far out of sight and at rest, it does nothing and is not drawn until he comes near (a region three times
    // the size has three times the creatures; only those near him think). One in the middle of something finishes it
    const far = Math.abs(P.x - e.x) > SLEEP.x || Math.abs(P.y - e.y) > SLEEP.y, rest = (e.st === 'idle' || e.st === 'return' || e.st === 'patrol' || e.st === 'perch' || e.st === 'hide' || e.st === 'float' || e.st === 'circle' || e.st === 'drift' || !e.st) && !e.orb;
    if (far && rest && e.age > 0.5 && !e.d.wakeful && !(e.d.own && RULE.ring > 0)){ if (!e.asleep){ e.asleep = true; if (e.sprite) e.sprite.g.visible = false; e.stand.visible = false; } continue; }
    if (e.asleep){ e.asleep = false; if (e.sprite) e.sprite.g.visible = true; else if (!e.d.own) e.stand.visible = true; }
    if (e.stilled > 0 && !e.d.own){ e.stilled -= dt; continue; }   // stilled for a breath (the Founder's Felt: a parry rang)
    e.tm += dt; e.age += dt;
    const ai = e.d.ai, dx = P.x - e.x, dy = P.y - e.y, dist = Math.hypot(dx, dy);
    const go = st => { e.st = st; e.tm = 0; };
    const hunts = !e.d.fly && WALK[ai];
    if (hunts && e.st === hunts){   // hunting: it gives up when he is long out of sight, or it is at its leash
      e.unseen = Math.abs(dx) < e.d.wake * 1.6 && sees(e, P) ? 0 : (e.unseen || 0) + dt;
      if (e.unseen > GIVE_UP || Math.abs(e.x - e.home.x) > LEASH){ go('return'); e.unseen = 0; } }
    if (hunts && RESTING.has(e.st)) atRest(e, P, dt, dx, dy, go, events, anim);
    else if (ai === 'sweeper'){   // always a few steps ahead of him, seen from behind; where the stair ends it is gone
      const dir = e.dirn, ahead = (e.x - P.x) * dir; e.face = dir; let moving = false;
      if (e.st === 'idle'){ if (Math.abs(dy) < 5 && ahead < 8 && ahead > -3) go('walk'); }
      else if (e.st === 'walk'){
        const sp = ahead < 5 ? 9.5 : ahead < 8 ? 6 : 0, nx = e.x + dir * sp * dt, gy = ground(nx, e.y + 0.9);
        if (sp && gy > -Infinity && Math.abs(gy - e.y) <= 0.6 && !solidAt(nx, gy + 0.3) && !solidAt(nx, gy + 1.3)){ e.x = nx; e.y = gy; moving = true; e.swept = (e.swept || 0) + dt; if (e.swept > 0.2){ e.swept = 0; fx.dust({ x: e.x - dir * 0.4, y: e.y + 0.1 }, 2, 1.2); } }
        else if (sp && ahead < 5){ fx.dust({ x: e.x, y: e.y + 0.7 }, 14, 3); e.alive = false; e.dead = 9; if (e.sprite) e.sprite.g.visible = false; e.stand.visible = false; }   // the end of its flight: only the dust it raised
      }
      if (e.alive) anim(e, 'walk', moving ? e.age * 1.7 : 0);
    }
    else if (ai === 'crawler'){
      const gy = ground(e.x, e.y + 0.3); if (gy > -Infinity) e.y = gy;
      if (e.st === 'idle' && Math.abs(dx) < e.d.wake && Math.abs(dy) < 2.5) go('chase');
      if (e.st === 'chase'){
        e.face = Math.sign(dx) || e.face;
        const nx = e.x + e.face * e.d.chase * dt;
        if (Math.abs(dx) > 1.0 && !solidAt(nx + e.face * e.d.w, e.y + 0.3) && ground(nx, e.y + 0.3) > e.y - 0.6) e.x = nx;   // not into walls or off edges
        if (Math.abs(dx) < e.d.reach && Math.abs(dy) < 1.2){ go('windup'); events.push({ type: 'tell', e }); }
        if (Math.abs(dx) > e.d.wake * 1.6) go('idle');
      }
      else if (e.st === 'windup'){ if (e.tm >= e.d.windup){ go('lunge'); e.hit = false; } }
      else if (e.st === 'lunge'){
        const nx = e.x + e.face * e.d.lungeDist / e.d.lunge * dt; if (!solidAt(nx + e.face * e.d.w, e.y + 0.3)) e.x = nx;
        if (!e.hit && Math.abs(P.x - e.x) < (e.d.hitR || 0.75) && P.y < e.y + 1.2 && P.y > e.y - 0.6){
          e.hit = true;
          if (P.blocking && P.face === -e.face){ const parry = performance.now() / 1000 - (P.blockAt || -9) < 0.18; go('stunned'); e.stun = parry ? 1.4 : 0.7; e.x -= e.face * 0.25; e.vx = -e.face * (parry ? 7 : 4); e.flash = parry ? 0.2 : 0.08; events.push({ type: parry ? 'parry' : 'block', at: { x: P.x + P.face * 0.5, y: P.y + 1.2 }, mine: true, e }); }
          else hurt(P, e.d.dmg || 1, e.x, e.d.word || 'Bitten');
        }
        if (e.tm >= e.d.lunge && e.st === 'lunge') go('recover');
      }
      else if (e.st === 'recover'){ if (e.tm >= e.d.recover) go('chase'); }
      else if (e.st === 'stunned'){   // thrown back by his guard: it slides, slowing (not into a wall or off an edge)
        if (e.vx){ const nx = e.x + e.vx * dt; if (!solidAt(nx + Math.sign(e.vx) * e.d.w, e.y + 0.3) && ground(nx, e.y + 0.3) > e.y - 0.6) e.x = nx; else e.vx = 0; e.vx *= Math.max(0, 1 - dt * 7); if (Math.abs(e.vx) < 0.3) e.vx = 0; }
        if (e.tm >= (e.stun || e.d.stun)){ e.vx = 0; go('chase'); } }
      // a body: standing, he cannot walk through it (a roll can)
      if (P.roll <= 0 && Math.abs(P.x - e.x) < 0.55 && P.y < e.y + 0.7 && P.y > e.y - 0.5){ const side = Math.sign(P.x - e.x) || -e.face; if (!shove(P, e.x + side * 0.55)) e.x = P.x - side * 0.55; if (Math.sign(P.vx) === -side) P.vx = 0; }   // never into the rock: against a wall, it is the creature that gives
      anim(e, e.st === 'windup' || e.st === 'lunge' ? 'attack' : 'walk', e.st === 'windup' ? e.tm / e.d.windup * 0.5 : e.st === 'lunge' ? 0.5 + e.tm / e.d.lunge * 0.5 : e.st === 'chase' ? e.tm * 1.6 : 0);
    }
    else if (ai === 'flitter'){
      const W8 = e.meta && e.meta.anims.flap;   // one that perches and has its wingbeat drawn (the gargoyle): sits, launches, flies, comes home
      if (e.st === 'idle'){ if (!e.d.perch){ e.x = e.home.x + Math.sin(e.tm * 1.3) * 0.6; e.y = e.home.y + Math.sin(e.tm * 2.1) * 0.3; } if (dist < e.d.wake && sees(e, P)){ events.push({ type: 'notice', e }); if (e.d.perch && W8){ go('launch'); events.push({ type: 'tell', e }); } else go('circle'); e.left = e.d.dives || 1; } }
      else if (e.st === 'launch'){ e.y = e.home.y + Math.min(1, e.tm / 0.45) * 0.6; e.face = Math.sign(dx) || e.face; if (e.tm >= 0.45) go('circle'); }
      else if (e.st === 'home'){ const k = Math.min(1, dt * 2.5); e.x += (e.home.x - e.x) * k; e.y += (e.home.y + 0.4 - e.y) * k; e.face = Math.sign(e.home.x - e.x) || e.face;
        if (Math.hypot(e.home.x - e.x, e.home.y + 0.4 - e.y) < 0.12) go('land'); else if (dist < e.d.wake * 0.8 && Math.hypot(e.home.x - e.x, e.home.y - e.y) < LEASH && sees(e, P)) go('circle'); }
      else if (e.st === 'land'){ e.x = e.home.x; e.y = e.home.y + (1 - Math.min(1, e.tm / 0.35)) * 0.4; if (e.tm >= 0.35){ e.face = e.d.perch && e.home.face ? e.home.face : e.face; go('idle'); } }   // a gargoyle sits like stone until then
      else if (e.st === 'circle'){
        const a = e.tm * 3.2, cx = P.x, cy = P.y + 2.4;
        e.x += (cx + Math.cos(a) * 1.6 - e.x) * Math.min(1, dt * 3); e.y += (cy + Math.sin(a) * 0.5 - e.y) * Math.min(1, dt * 3);
        e.face = Math.sign(P.x - e.x) || e.face;
        if (e.tm > e.d.circle + Math.random() * 0.6){ go('dive'); e.tx = P.x; e.ty = P.y + 1.3; events.push({ type: 'tell', e }); }
      }
      else if (e.st === 'dive'){
        if (e.tm < e.d.dive - e.d.commit){ e.tx = P.x; e.ty = P.y + 1.3; }   // it tracks you, then commits
        const k = Math.min(1, dt * 7); e.x += (e.tx - e.x) * k; e.y += (e.ty - e.y) * k;
        if (!e.hit && Math.abs(P.x - e.x) < 0.5 && Math.abs(P.y + 1.3 - e.y) < 1.0){ e.hit = true; if (!(P.blocking && P.face === Math.sign(e.x - P.x))) hurt(P, 1, e.x, e.d.word || 'Bitten'); }
        if (e.tm >= e.d.dive + 0.15){ e.hit = false; if (--e.left > 0){ go('leave'); e.again = true; } else { go('leave'); e.again = false; } }
      }
      else if (e.st === 'leave'){ e.y += dt * 3; e.x -= e.face * dt * 2; if (e.tm > (e.again ? 0.3 : e.d.leave)){ if (e.again){ go('dive'); e.tx = P.x; e.ty = P.y + 1.3; e.again = false; events.push({ type: 'tell', e }); } else { go('circle'); e.left = e.d.dives || 1; } } }
      if (W8){   // sitting as stone; the wings opening off the perch (and closing back onto it); the wingbeat; the swoop
        if (e.st === 'idle') anim(e, 'stand', 0); else if (e.st === 'launch') anim(e, 'launch', Math.min(0.999, e.tm / 0.45)); else if (e.st === 'land') anim(e, 'launch', Math.max(0, 0.999 - e.tm / 0.35)); else if (e.st === 'dive') anim(e, 'swoop', Math.min(0.999, e.tm / e.d.dive)); else anim(e, 'flap', e.age * 2.6);
        if (e.st === 'circle' && e.d.perch && dist > e.d.wake * 1.8) go('home');   // he has gone: back to its perch
      } else if (e.st === 'land' || e.st === 'home') anim(e, 'fly', e.age * 2.5); else anim(e, e.st === 'dive' ? 'dive' : 'fly', e.st === 'dive' ? e.tm / e.d.dive : e.st === 'idle' && e.d.perch ? 0 : e.tm * 2.5);
      if (e.st === 'circle' && Math.hypot(e.x - e.home.x, e.y - e.home.y) > LEASH + 4) go('home');   // tethered to its roost
    }
    else if (ai === 'spitter'){
      e.face = e.fixFace || Math.sign(dx) || e.face; e.cd = Math.max(0, (e.cd || 0) - dt);
      if (e.d.hover){ e.x = e.home.x + Math.sin(e.age * 1.1) * 0.5; e.y = e.home.y + Math.sin(e.age * 2) * 0.25; }
      const inSight = dist < e.d.range && sees(e, P); e.unseen = inSight ? 0 : (e.unseen || 0) + dt; if (e.unseen > GIVE_UP) e.saw = false;
      if (inSight && !e.saw){ e.saw = true; events.push({ type: 'notice', e }); e.cd = Math.max(e.cd, NOTICE_T); }   // it has seen him: a start before the first shot
      if (e.st === 'idle' && inSight && e.cd <= 0){ go('charge'); e.shots = 0; events.push({ type: 'tell', e }); }
      if (e.d.aim){   // the Roots' spitter (to the lampreys' standard): it swells and brightens as it charges, and for the last 0.3 s a line of light lies where the shot will go
        const u = e.st === 'charge' ? Math.min(1, e.tm / e.d.charge) : 0; if (e.sprite) e.sprite.g.scale.setScalar(1 + 0.22 * u * u); e.warn = u > 0.35;
        const show = e.st === 'charge' && e.tm > e.d.charge - 0.3;
        if (show && !e.aim){ e.aim = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.07), new THREE.MeshBasicMaterial({ color: e.d.orb || 0x9dff70, transparent: true, opacity: 0.55, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending })); E.scene.add(e.aim); }
        if (e.aim){ e.aim.visible = show; if (show){ const x0 = e.x + e.face * e.d.w * 0.6, y0 = e.y + (e.d.mouthY || 0), tx = P.x, ty = P.y + 1.4, L = Math.min(e.d.range, Math.hypot(tx - x0, ty - y0)); e.aim.position.set((x0 + tx) / 2, (y0 + ty) / 2, 0.09); e.aim.rotation.z = Math.atan2(ty - y0, tx - x0); e.aim.scale.x = L; e.aim.material.opacity = 0.3 + 0.4 * Math.abs(Math.sin(e.tm * 30)); } } }
      if (e.st === 'charge' && e.tm >= e.d.charge){
        shoot(E, e, P, !!e.d.lob); events.push({ type: 'spit', e });
        if (++e.shots < (e.d.burst || 1)){ e.tm = e.d.charge - 0.3; } else { go('idle'); e.cd = e.d.cooldown; }
      }
      anim(e, e.st === 'charge' ? 'charge' : 'idle', e.st === 'charge' ? e.tm / e.d.charge * 0.75 : e.d.hover ? e.age * 1.2 : 0);
    }
    else if (ai === 'thrower'){
      // keeps its distance and lobs; swats him if he closes; a cut staggers it out of either
      const gy = ground(e.x, e.y + 0.3); if (gy > -Infinity) e.y = gy;
      e.cd = Math.max(0, (e.cd || 0) - dt);
      if (e.st === 'idle'){ if (Math.abs(dx) < e.d.wake && Math.abs(dy) < 5) go('stalk'); }
      else if (e.st === 'stalk'){
        e.face = Math.sign(dx) || e.face;
        const want = Math.abs(dx) > e.d.keep + 1 ? 1 : Math.abs(dx) < e.d.keep - 1.5 && Math.abs(dx) > 1.7 ? -1 : 0, nx = e.x + e.face * want * e.d.chase * dt;
        e.moving = false;
        if (want && !solidAt(nx + e.face * want * e.d.w, e.y + 0.3) && ground(nx, e.y + 0.3) > e.y - 0.6){ e.x = nx; e.moving = true; }
        if (Math.abs(dx) < 1.7 && Math.abs(dy) < 1.4){ go('swat'); events.push({ type: 'tell', e }); }
        else if (Math.abs(dx) < e.d.range && Math.abs(dy) < 6 && e.cd <= 0 && sees(e, P, 1.5)){ go('windup'); events.push({ type: 'tell', e }); }
        if (Math.abs(dx) > e.d.wake * 1.6) go('idle');
      }
      else if (e.st === 'windup'){ e.face = Math.sign(dx) || e.face; if (e.tm >= e.d.windup){ shoot(E, e, P, true); events.push({ type: 'spit', e }); go('recover'); e.cd = e.d.cooldown; } }
      else if (e.st === 'swat'){
        if (e.tm >= 0.42 && !e.hit){ e.hit = true; if (Math.abs(P.x - e.x) < 1.7 && (P.x - e.x) * e.face > -0.3 && P.y < e.y + 1.6 && P.y > e.y - 0.8 && !isRollInv(P)){
          if (P.blocking && P.face === -e.face){ e.flash = 0.08; events.push({ type: 'block', at: { x: P.x + P.face * 0.5, y: P.y + 1.2 }, mine: true, e }); } else hurt(P, e.d.dmg || 1, e.x, 'Swatted'); } }
        if (e.tm >= 0.6){ go('recover'); e.hit = false; }
      }
      else if (e.st === 'recover'){ if (e.tm >= e.d.recover) go('stalk'); }
      else if (e.st === 'stunned'){ if (e.tm >= (e.stun || e.d.stun)) go('stalk'); }
      if (P.roll <= 0 && Math.abs(P.x - e.x) < 0.6 && P.y < e.y + 1.2 && P.y > e.y - 0.5){ const side = Math.sign(P.x - e.x) || -e.face; if (!shove(P, e.x + side * 0.6)) e.x = P.x - side * 0.6; if (Math.sign(P.vx) === -side) P.vx = 0; }
      anim(e, e.st === 'windup' || e.st === 'swat' ? 'attack' : 'walk', e.st === 'windup' ? e.tm / e.d.windup * 0.7 : e.st === 'swat' ? 0.3 + e.tm / 0.6 * 0.69 : e.st === 'recover' ? 0.99 : e.moving ? e.age * 1.3 : 0, 0, 0.03);
      if (e.st === 'recover' && e.sprite) anim(e, 'attack', 0.99);
    }
    else if (ai === 'wraith'){
      // it comes on through anything, slowly; rears; rushes where he was; and hangs there spent
      if (e.st === 'idle'){ e.x = e.home.x + Math.sin(e.age * 0.9) * 0.4; e.y = e.home.y + Math.sin(e.age * 1.7) * 0.3; if (dist < e.d.wake) go('drift'); }
      else if (e.st === 'drift'){
        e.face = Math.sign(dx) || e.face;
        const tx = P.x - e.face * 2.0, ty = P.y + 1.5 + Math.sin(e.age * 2.2) * 0.3, L = Math.hypot(tx - e.x, ty - e.y) || 1, v = Math.min(e.d.chase, L / Math.max(dt, 1e-3));
        e.x += (tx - e.x) / L * v * dt; e.y += (ty - e.y) / L * v * dt;
        if (L < 0.7 && e.tm > 0.5){ go('windup'); events.push({ type: 'tell', e }); }
        if (dist > e.d.wake * 2.2) go('idle');
      }
      else if (e.st === 'windup'){ e.x -= e.face * dt * 0.8; if (e.tm >= e.d.windup){ go('rush'); e.hit = false; const L = Math.hypot(dx, dy + 1.2) || 1; e.rx = dx / L; e.ry = (dy + 1.2) / L; e.face = Math.sign(dx) || e.face; } }
      else if (e.st === 'rush'){
        e.x += e.rx * e.d.rushSpeed * dt; e.y += e.ry * e.d.rushSpeed * dt;
        if (!e.hit && Math.abs(P.x - e.x) < 0.6 && Math.abs(P.y + 1.2 - e.y) < 1.1 && !isRollInv(P)){ e.hit = true; if (P.blocking && P.face === -e.face){ e.flash = 0.08; events.push({ type: 'block', at: { x: P.x + P.face * 0.5, y: P.y + 1.2 }, mine: true, e }); } else hurt(P, 1, e.x, e.d.word); }
        if (e.tm >= e.d.rush) go('spent');
      }
      else if (e.st === 'spent'){ e.y += Math.sin(e.age * 6) * dt * 0.2; if (e.tm >= e.d.recover) go('drift'); }
      anim(e, e.st === 'windup' || e.st === 'rush' ? 'dive' : 'fly', e.st === 'windup' ? e.tm / e.d.windup * 0.45 : e.st === 'rush' ? 0.45 + e.tm / e.d.rush * 0.54 : e.age * 1.4);
    }
    else if (ai === 'burrower'){
      // the worm (docs/phase6-sheet.md 2): it hunts him under its stretch of floor as a ripple (a hump of broken ground,
      // main.js hears it), comes up where he will be, cracks the ground there a moment first, stands snapping where it
      // can be cut, goes under, and hunts again. No floor to be under, no worm: he is safe on a plank or in the air
      if (!e.run) e.run = stretchOf(e); if (e.mx == null) e.mx = e.home.x;
      const on = P.x > e.run[0] - 1 && P.x < e.run[1] + 1 && dy > -0.5 && dy < 4, clampX = x => Math.max(e.run[0], Math.min(e.run[1], x));
      if (e.st === 'idle'){ e.mx += (e.home.x - e.mx) * Math.min(1, dt * 2); if (on && Math.abs(P.x - e.mx) < e.d.wake){ go('hunt'); e.lost = 0; events.push({ type: 'notice', e }); } }
      else if (e.st === 'hunt'){
        const tx = clampX(P.x + P.vx * 0.45), d = tx - e.mx, sp = e.d.plough * dt; e.mx += Math.abs(d) <= sp ? d : Math.sign(d) * sp;   // where he will be
        e.lost = on ? 0 : e.lost + dt; if (e.lost > GIVE_UP) go('idle');
        if (Math.random() < dt * 30) fx.dust({ x: e.mx + (Math.random() - 0.5) * 0.5, y: e.y }, 1, 1.4); if (Math.floor(e.tm * 5) !== Math.floor((e.tm - dt) * 5)) events.push({ type: 'ripple', e, at: { x: e.mx, y: e.y } });
        if (e.tm > 0.5 && Math.abs(d) < 0.35 && Math.abs(dy) < 1.5 && P.x > e.run[0] && P.x < e.run[1]){ e.x = e.mx; go('rise'); events.push({ type: 'tell', e }); events.push({ type: 'crack', e, at: { x: e.x, y: e.y } }); } }
      else if (e.st === 'rise'){ if (Math.random() < dt * 40) fx.dust({ x: e.x + (Math.random() - 0.5) * 0.9, y: e.y }, 2, 2.4); if (e.tm >= e.d.rise){ go('up'); e.hit = false; events.push({ type: 'burst', e, at: { x: e.x, y: e.y } }); } }
      else if (e.st === 'up'){
        if (!e.hit && e.tm < 0.5 && P.grounded && Math.abs(P.x - e.x) < 0.6 && Math.abs(P.y - e.y) < 0.4){ e.hit = true; hurt(P, 1, e.x, 'Snapped'); }
        if (e.tm >= e.d.up){ go('under'); e.mx = e.x; } }
      else if (e.st === 'under'){ if (e.tm >= 0.7) go(on ? 'hunt' : 'idle'); }
      // the ripple: a low hump of broken ground that runs along the floor over it
      if (!e.hump){ const c = document.createElement('canvas'); c.width = 16; c.height = 5; const g = c.getContext('2d'); g.fillStyle = '#181425'; g.fillRect(2, 1, 12, 4); g.fillRect(0, 3, 16, 2); g.fillStyle = '#5a6988'; g.fillRect(3, 2, 10, 3); g.fillRect(1, 4, 14, 1); g.fillStyle = '#8b9bb4'; g.fillRect(5, 2, 3, 1); g.fillRect(10, 3, 2, 1); g.fillStyle = '#181425'; g.fillRect(8, 2, 1, 2);
        const t = new THREE.CanvasTexture(c); t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; e.hump = new THREE.Mesh(new THREE.PlaneGeometry(1, 5 / 16), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false })); E.scene.add(e.hump); }
      e.hump.visible = e.st === 'hunt' || e.st === 'rise'; e.hump.position.set(e.st === 'rise' ? e.x : e.mx, e.y + 2.5 / 16 + (e.st === 'hunt' ? Math.abs(Math.sin(e.tm * 14)) * 0.04 : 0), 0.045); e.hump.scale.x = e.st === 'rise' ? 1.2 + e.tm / e.d.rise * 0.6 : 1;
      e.face = Math.sign(dx) || e.face;
      const show = e.st === 'rise' || e.st === 'up';
      if (e.sprite) e.sprite.g.visible = show;
      // it comes up out of the floor (drawn just behind the rock's face, so the floor hides what is still under it) and
      // sinks back at the end
      const out = e.st === 'rise' ? Math.min(1, e.tm / e.d.rise) : e.st === 'up' ? Math.min(1, (e.d.up - e.tm) / 0.25) : 0;
      anim(e, 'snap', e.st === 'rise' ? e.tm / e.d.rise * 0.3 : e.st === 'up' ? 0.3 + Math.min(0.69, e.tm / 0.45 * 0.7) : 0, -(1 - out) * 2.2, -0.05);
      e.stand.visible = !e.sprite && show;
    }
    else if (CUSTOM[ai]){
      // a region's own way of fighting. ctx: go(state), dx, dy, dist (to him), events, fx, E (E.scene, E.R the renderer),
      // anim(e, name, frac, dy, z), shoot(E, e, P, lob), hurt(P, n, fromX, word), isRollInv(P), ground(x, y), solidAt(x, y),
      // kill(e, events), tileAt, T; hit(x0, y0, x1, y1, word, fromX): hurts him if his body is in that box and he is not
      // rolling through (true if it did)
      CUSTOM[ai](e, P, dt, { go, dx, dy, dist, events, fx, E, anim, shoot, hurt: e.d.heavy ? (Q, n, x, w) => hurt(Q, Math.max(n, e.d.heavy), x, w) : hurt, isRollInv, ground, solidAt, kill: killEnemy, tileAt, T, RULE, lit: litMat, rooms: LEVEL.rooms, marks: LEVEL.marks, flows: LEVEL.flows, movers: LEVEL.movers, moverAt, time: PHASE.t, waterAt, SIDE,
        hit: (x0, y0, x1, y1, word, fromX) => P.x + 0.34 > x0 && P.x - 0.34 < x1 && P.y + P.h > y0 && P.y < y1 && !isRollInv(P) && hurt(P, e.d.heavy || 1, fromX == null ? (x0 + x1) / 2 : fromX, word || e.d.word || 'Struck') });
    }
    // what it threw, in flight: a glob or a bolt goes straight, a chunk of ice falls in its arc
    // a shot flies until it meets rock or a plank (or is far out of sight)
    if (e.orb){
      const O = e.orb; O.t += dt; O.vy -= O.g * dt; O.x += O.vx * dt; O.y += O.vy * dt; O.m.position.set(O.x, O.y, 0.1);
      if (Math.random() < 0.6) fx.burst({ x: O.x, y: O.y }, 1, O.col);
      const tile = tileAt(Math.floor(O.x / T), Math.floor(O.y / T));
      if (Math.abs(O.x - P.x) < 0.45 && O.y > P.y && O.y < P.y + P.h){
        if (P.blocking && P.face === -Math.sign(O.vx)){ const parry = performance.now() / 1000 - (P.blockAt || -9) < 0.18; events.push({ type: parry ? 'parry' : 'block', at: { x: O.x, y: O.y }, mine: true, shot: true }); if (parry && !O.g){ killEnemy(e, events); } }
        else if (!isRollInv(P)) hurt(P, 1, O.x, e.d.word || 'Spat on');
        E.scene.remove(O.m); e.orb = null;
      } else if (O.t > 6 || tile === ROCK || tile === LEDGE && (O.g ? O.vy < 0 : true) || Math.abs(O.x - P.x) > 30 || Math.abs(O.y - P.y) > 20){ fx.burst({ x: O.x, y: O.y }, O.g ? 12 : 6, O.col); E.scene.remove(O.m); e.orb = null; }
    }
    if (!e.sprite && !e.d.own) e.stand.position.set(e.x, e.y + e.d.h / 2, 0.03);
    if (e.sprite) e.sprite.mat.emissive.setHex(e.flash > 0 ? 0xffffff : (e.st === 'windup' || e.st === 'charge' || e.st === 'rise' || e.st === 'swat' || e.warn) && Math.sin(e.tm * 40) > 0 ? 0x601010 : (e.glow != null ? e.glow : e.d.glow || 0));
  }
}
function killEnemy(e, events){ e.alive = false; e.dead = 0; if (e.d.onKill) e.d.onKill(e); events.push({ type: 'kill', e, at: { x: e.x, y: e.y + e.d.h / 2 } }); if (e.sprite) e.sprite.g.visible = false; e.stand.visible = false; }
// a sword cut: everything in front of the blade, within its reach and his height
export function strikeEnemies(E, P, reach, dmg, events, up = false, heavy = null){   // up: struck upward: what is over him, not what is in front. heavy: the hammer ({ wide, knock, stagger }): a wider arc, and what it hits is knocked back and stopped a breath
  let any = false;
  for (const e of E.list){
    if (!e.alive || e.d.harmless || (e.d.ai === 'burrower' && !(e.st === 'rise' || e.st === 'up'))) continue;
    const ahead = (e.x - P.x) * P.face, top = e.y + e.d.h, bottom = e.d.fly ? e.y - e.d.h / 2 : e.y;
    if (heavy && heavy.near && !up && Math.abs(e.x - P.x) - e.d.w / 2 < heavy.near) continue;   // the clapper: nothing close to him
    if (up ? (Math.abs(e.x - P.x) > 1.0 + e.d.w / 2 || bottom > P.y + 2.2 + reach || top < P.y + 1.0) : (ahead < (heavy && heavy.round ? -reach - e.d.w : heavy && heavy.wide ? -1.2 : -0.4) || ahead > reach + e.d.w || top < P.y + (heavy && heavy.narrow ? 0.5 : -0.2) || bottom > P.y + (heavy && heavy.wide ? 3.4 : heavy && heavy.narrow ? 2.1 : 2.7))) continue;   // (narrow: the tooth, a line at his chest: it misses what is low at his feet or over his head)
    if (e.d.guard && e.d.guard(e, P)){ events.push({ type: 'block', at: { x: e.x - P.face * e.d.w, y: e.y + e.d.h * 0.6 } }); any = true; continue; }   // it turns the blow
    // the hammer: what is small enough is knocked back along the ground (or through the air), as far as there is room
    // and floor, and stands stopped a breath. Not the wings' elites, nor what clings or is not a body
    if (heavy && heavy.knock && (e.d.hp || 0) < 12 && !e.d.cling && !e.d.own && !e.d.perch){ const dir = P.face || 1; let moved = 0;
      while (moved < heavy.knock){ const nx = e.x + dir * 0.1; if (solidAt(nx + dir * e.d.w / 2, e.y + (e.d.fly ? 0 : 0.3)) || (!e.d.fly && !solidAt(nx, e.y - 0.2))) break; e.x = nx; moved += 0.1; }
      e.vx = 0; e.stilled = Math.max(e.stilled || 0, heavy.stagger || 0); }
    if (heavy && heavy.ring && (e.d.hp || 0) < 12 && !e.d.own){ e.stilled = Math.max(e.stilled || 0, heavy.ring); events.push({ type: 'rang', at: { x: e.x, y: e.y + e.d.h * 0.6 } }); }   // the clapper's blow rings: what is small stands stopped a breath
    any = true; e.hp -= dmg; e.flash = 0.12; if (WALK[e.d.ai] && RESTING.has(e.st)){ e.st = WALK[e.d.ai]; e.tm = 0; e.unseen = 0; } if (e.d.onHit) e.d.onHit(e, dmg, P);
    if ((e.d.ai === 'crawler' && (e.st === 'windup' || e.st === 'chase')) || (e.d.ai === 'thrower' && e.st !== 'stunned')){ e.st = 'stunned'; e.tm = 0; e.stun = e.d.ai === 'thrower' ? 0.4 : 0.5; }
    if (e.d.ai === 'wraith' && e.st !== 'rush'){ e.st = 'spent'; e.tm = Math.max(0, e.d.recover - 0.5); }
    if (e.d.perch && e.st === 'idle'){ e.st = 'circle'; e.tm = 0; e.left = 1; }
    e.x += P.face * (e.d.fly ? 0.6 : 0.35);
    events.push({ type: 'hit', e, at: { x: e.x, y: e.y + e.d.h / 2 }, heavy: dmg >= 2 });
    if (e.hp <= 0) killEnemy(e, events);
  }
  return any;
}
// an ember art's blow: everything in a box, each creature once (seen: the ones already struck by this blow), pushed
// from fromX; the hits are marked art, so they give no embers back (main.js)
export function hitBox(E, x0, x1, y0, y1, dmg, events, seen, fromX, lift = 0){
  for (const e of E.list){
    if (!e.alive || e.d.harmless || seen.has(e) || (e.d.ai === 'burrower' && !(e.st === 'rise' || e.st === 'up'))) continue;
    const top = e.y + e.d.h, bottom = e.d.fly ? e.y - e.d.h / 2 : e.y;
    if (e.x + e.d.w < x0 || e.x - e.d.w > x1 || top < y0 || bottom > y1) continue;
    seen.add(e); e.hp -= dmg; e.flash = 0.15; if (WALK[e.d.ai] && RESTING.has(e.st)){ e.st = WALK[e.d.ai]; e.tm = 0; e.unseen = 0; } e.x += Math.sign(e.x - fromX || 1) * 0.8; if (lift && e.d.fly) e.y += lift; if (e.d.onHit) e.d.onHit(e, dmg, { x: fromX, y: y0, face: Math.sign(e.x - fromX) || 1 }, true);
    if (e.d.ai === 'crawler' || e.d.ai === 'thrower'){ e.st = 'stunned'; e.tm = 0; e.stun = 0.9; }
    events.push({ type: 'hit', e, at: { x: e.x, y: e.y + e.d.h / 2 }, heavy: true, art: true });
    if (e.hp <= 0) killEnemy(e, events);
  }
}
// his plunge landing: everything close around where he lands
export function slamEnemies(E, P, radius, dmg, events){
  for (const e of E.list){
    if (!e.alive || e.d.harmless || (e.d.ai === 'burrower' && !(e.st === 'rise' || e.st === 'up'))) continue;
    if (Math.abs(e.x - P.x) > radius + e.d.w || e.y > P.y + 1.2 || e.y + e.d.h < P.y - 0.8) continue;
    e.hp -= dmg; e.flash = 0.12; e.x += Math.sign(e.x - P.x || 1) * 0.5; if (e.d.onHit) e.d.onHit(e, dmg, P, true);
    if (e.d.ai === 'crawler' || e.d.ai === 'thrower'){ e.st = 'stunned'; e.tm = 0; e.stun = 0.8; }
    events.push({ type: 'hit', e, at: { x: e.x, y: e.y + e.d.h / 2 }, heavy: true });
    if (e.hp <= 0) killEnemy(e, events);
  }
}

// a keeper's hall is its own (build 81, from a playtest: creatures of the Spires came into the Wyrm's fight after him).
// While the keeper stands, a creature that lives outside the hall and has come into it is put back where it lives.
// What the keeper itself calls up lives in the hall, and stays. Returns how many were sent back
export function keepOut(E, room){
  const inside = (x, y) => x >= room.x0 && x < room.x1 && y >= room.y0 - 1 && y < room.y1; let n = 0;
  for (const e of E.list){ if (!e.alive || !e.home || inside(e.home.x, e.home.y) || !inside(e.x, e.y)) continue;
    e.x = e.home.x; e.y = e.home.y; e.vx = e.vy = 0; e.st = 'idle'; e.tm = 0; e.unseen = 0; n++; }
  return n;
}
