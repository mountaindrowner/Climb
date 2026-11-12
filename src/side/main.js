// The side view: boot and the loop. The motor steps at a fixed 1/120 s (input is kept until it is used, core/input.js);
// the frame draws where things are. Camera: it leads the way he faces and a little up, eases after him, and stays
// inside the map. The mountain is three regions, one over the other; the way out of one leads up into the next
// (enter), and the buttons under the room's name go straight to any of them.
import { TUNE } from '../config/tuning.js';
import { IN, bindInput, endFrame, pollPads } from '../core/input.js';
import { sfx, ac } from '../audio/sfx.js';
import '../ui/feel.js';
import { LEVEL, LEVELS, loadLevel, T, spawnPoint, roomAt } from './level.js';
import { newPlayer, stepPlayer, BODY, HOOKS, BLADE, swingOf } from './motor.js';
import { makeRenderer, makeSprite, VIEW_H } from './render.js';
import { spawnFx, stepFx } from './fx.js';
import { spawnEnemies, stepEnemies, strikeEnemies, slamEnemies } from './enemies.js';
import { makeWarden } from './boss.js';
import { makeToll } from './toll.js';
import { makeWyrm } from './wyrm.js';
import { makeStory, REGION_SPAN } from './story.js';
import { DEVICE } from '../core/prompts.js';
import { WEAPONS } from '../config/weapons.js';
const MV = TUNE.move;
const BUILD = 'side 12 · the whole mountain';   // shown in the corner, so a stale copy is easy to spot

const canvas = document.getElementById('gl'), hud = document.getElementById('hud'), hx = hud.getContext('2d');
const R = makeRenderer(canvas);
const sp = spawnPoint();
let P = newPlayer(sp.x, sp.y);
const hero = { sprite: null, meta: null };
// the warrior: one of the drawn options (?hero=a|b|c|d), falling back to the first, larger drawing
const HEROES = { masked: 'mask_tall_c', a: 'px_knight', b: 'px_hood', c: 'px_mask', d: 'px_hat' }, HERO = HEROES[new URLSearchParams(location.search).get('hero')] || HEROES.masked;   // the tall masked warrior; ?hero=a..d the small options
const loadHero = name => fetch(`assets/side/${name}/sprite.json`).then(r => r.ok ? r.json() : Promise.reject()).then(meta => { hero.meta = meta; hero.name = name; hero.sprite = makeSprite(R.scene, `assets/side/${name}`, meta); });
loadHero(HERO).catch(() => loadHero('hero_a')).catch(() => loadHero('hero'));
// what a region has in it: made by setup, again each time he comes into one
let fx, E, BOSS, SHRINES, MAP;
let CHECK = null, BANNER = null, WON = false, DEATH = 0;
const SUB = ['the bottom of the mountain', 'a house of stone over the Warden\'s hall', 'the open air, and the peak'];
const CARD = ['', 'The Roots are below him. The climb goes on.', 'Out of the stone, into the open air.'];   // what the card says, coming up into a region
// how far he has got is kept, so the climb can be taken up again
const SAVE = { get(){ try { return JSON.parse(localStorage.getItem('climb-side') || 'null'); } catch (e){ return null; } }, set(v){ try { if (v) localStorage.setItem('climb-side', JSON.stringify(v)); else localStorage.removeItem('climb-side'); } catch (e){} } };
let WAKE = 0;   // at the very start he lies where he fell, and gets up
function setup(){
  fx = spawnFx(R.scene); E = spawnEnemies(R.scene); BOSS = [makeWarden, makeToll, makeWyrm][LEVEL.index](R.scene, R);   // each region's keeper
  // the shrine: it fills the flask and the hearts, and is where he wakes after a death
  SHRINES = LEVEL.marks.filter(m => m.type === 'shrine').map(m => { const x = (m.x + 0.5) * T, y = m.y * T; return { x, y, room: roomAt(x, y + 0.5) }; });
  CHECK = null; WON = false; DEATH = 0;
  if (!BOSS) for (const x of R.exits) x.set(true);   // nothing guards the way on
  // the map: the region drawn a pixel a tile, each room shown once he has been in it
  const c = document.createElement('canvas'); c.width = LEVEL.W; c.height = LEVEL.H; const g = c.getContext('2d'), img = g.createImageData(LEVEL.W, LEVEL.H);
  const COL = { 0: [46, 92, 128], 2: [196, 150, 92], 3: [255, 92, 132] };
  for (let j = 0; j < LEVEL.H; j++) for (let i = 0; i < LEVEL.W; i++){ const k = COL[LEVEL.tiles[j * LEVEL.W + i]]; if (k) img.data.set([...k, 255], ((LEVEL.H - 1 - j) * LEVEL.W + i) * 4); }
  g.putImageData(img, 0, 0); MAP = { c, seen: new Set() };
}
setup();
// into region n: the world is made again, he stands at its start with the hearts and flask he had
function enter(n){
  loadLevel(n); R.load();
  if (hero.meta) hero.sprite = makeSprite(R.scene, `assets/side/${hero.name}`, hero.meta);
  FX2.ghosts.length = 0; setup();
  const s = spawnPoint(), old = P; P = newPlayer(s.x, s.y); P.hp = Math.max(1, old.hp); P.flask = old.flask;
  CAM.x = s.x; CAM.y = s.y + 2; CAM.lead = 0;
  banner(LEVEL.name, SUB[LEVEL.index] || '', 4); marks(); SAVE.set({ level: LEVEL.index });
}
// going up: the picture goes dark, the next region is made, it comes back
const GO = { to: -1, t: 0, st: '', from: -1 };
const go = n => { if (!GO.st){ GO.to = n; GO.from = LEVEL.index; GO.t = 0; GO.st = 'out'; } };
// the regions' buttons
const PICK = document.createElement('div');
PICK.style.cssText = 'position:absolute;left:18px;top:60px;display:flex;gap:6px;z-index:6;font:600 12px "Pixelify Sans",sans-serif';
LEVELS.forEach((l, n) => { const b = document.createElement('button'); b.textContent = `${n + 1} ${l.name.replace('The ', '')}`; b.dataset.n = n;
  b.style.cssText = 'background:rgba(10,8,20,0.7);color:#cfe6ff;border:1px solid rgba(140,210,255,0.35);border-radius:3px;padding:3px 7px;cursor:pointer;font:inherit';
  b.addEventListener('pointerdown', e => { e.stopPropagation(); e.preventDefault(); if (n !== LEVEL.index) go(n); b.blur(); }); PICK.appendChild(b); });
(document.getElementById('stage') || document.body).appendChild(PICK);
const marks = () => { for (const b of PICK.children) b.style.borderColor = +b.dataset.n === LEVEL.index ? '#ffd27a' : 'rgba(140,210,255,0.35)'; };
// ---- the story's screens (story.js) and the title's buttons
const STORY = makeStory(hud, `assets/side/${HERO}`);
const MENU = document.createElement('div');
MENU.style.cssText = 'position:absolute;left:0;right:0;top:56%;display:none;flex-direction:column;align-items:center;gap:10px;z-index:7;font:600 18px "Pixelify Sans",sans-serif';
(document.getElementById('stage') || document.body).appendChild(MENU);
const menuButton = (text, fn, small) => { const b = document.createElement('button'); b.textContent = text;
  b.style.cssText = `background:rgba(10,8,20,0.75);color:#fff2d0;border:1px solid ${small ? 'rgba(140,210,255,0.35)' : '#ffd27a'};border-radius:4px;padding:${small ? '5px 12px' : '9px 22px'};cursor:pointer;font:inherit;font-size:${small ? 13 : 18}px;min-width:${small ? 0 : 220}px`;
  b.addEventListener('pointerdown', e => { e.stopPropagation(); e.preventDefault(); ac(); fn(); }); return b; };
function begin(){   // from the start: the fall, then he gets up at the bottom
  MENU.style.display = 'none'; SAVE.set(null); if (LEVEL.index !== 0) enter(0); else { const s = spawnPoint(); P = newPlayer(s.x, s.y); }
  STORY.start('intro', {}, () => { WAKE = 1.7; banner(LEVEL.name, SUB[0], 4); SAVE.set({ level: 0 }); });
}
function resume(n){ MENU.style.display = 'none'; STORY.kind = null; if (LEVEL.index !== n) enter(n); else banner(LEVEL.name, SUB[n] || '', 4); }
function title(){
  const sv = SAVE.get(); MENU.innerHTML = ''; MENU.style.display = 'flex';
  if (sv && sv.level > 0 && sv.level < LEVELS.length) MENU.appendChild(menuButton('Climb on: ' + LEVELS[sv.level].name, () => resume(sv.level)));
  MENU.appendChild(menuButton(sv && sv.level > 0 ? 'Begin again' : 'Begin the climb', begin, !!(sv && sv.level > 0)));
  const row = document.createElement('div'); row.style.cssText = 'display:flex;gap:8px;margin-top:6px'; LEVELS.forEach((l, n) => row.appendChild(menuButton(`${n + 1} ${l.name.replace('The ', '')}`, () => resume(n), true))); MENU.appendChild(row);
  STORY.start('title');
}
addEventListener('keydown', e => { if (!STORY.active()) return; if (STORY.kind === 'title'){ if (e.code === 'Enter' || e.code === 'Space'){ const b = MENU.querySelector('button'); if (b) b.dispatchEvent(new PointerEvent('pointerdown')); } } else STORY.press(); });
addEventListener('pointerdown', () => { if (STORY.active()) STORY.press(); });
function hudBegin(){ const w = hud.clientWidth, h = hud.clientHeight, dpr = devicePixelRatio || 1; if (hud.width !== Math.round(w * dpr)){ hud.width = Math.round(w * dpr); hud.height = Math.round(h * dpr); } hx.setTransform(dpr, 0, 0, dpr, 0, 0); hx.clearRect(0, 0, w, h); }
const banner = (a, b, t = 3.2) => { BANNER = { a, b, t, life: t }; };
const FEEL_FX = { hitstop: 0, shake: 0, kick: 0 };
const FX2 = { ghosts: [], ghostT: 0, runDust: 0 };   // the dash's afterimages; the run's dust
// the aim assist: with nothing in reach ahead and a creature in reach behind, a swing turns to it
HOOKS.aim = P => {
  const reach = BLADE.reach + MV.aim; let ahead = false, behind = false;
  for (const e of E.list){ if (!e.alive || Math.abs(e.y - P.y) > 2.2) continue; const d = (e.x - P.x) * P.face; if (d > -0.3 && d < reach) ahead = true; else if (d <= -0.3 && d > -reach) behind = true; }
  return !ahead && behind ? -P.face : 0;
};
const CAM = { x: sp.x, y: sp.y + 2, lead: 0, zoom: 1 };
bindInput(); marks();
if (/[?&](level|play)\b/.test(location.search)) banner(LEVEL.name, SUB[LEVEL.index] || '', 4); else title();   // straight in with ?level=2 or ?play

// the drawings the masked warrior uses for these moves, where he has them
const MOVES = { roll: ['roll2_px', 'roll_px', 'roll'], flip: ['flip_px'], climb: ['climb_px', 'climb_v3'], land: ['land_px', 'land_v3'] };
const LAND_T = 0.3;   // how long a landing plays (cut short if he runs on)
const SINK = 2 / 16;  // he is drawn two pixels into the floor's lip, so his boots stand in it, not on its outline
// the ledge climb, set on the ledge: for each frame of the drawing, the column and row of its canvas that sit on the
// ledge's corner (the wall's face, the ledge's top), so his hands hold the lip while he hangs, his arms come over it as
// he hauls, and his feet land on it. `depth` is how far his feet hang under the ledge in that frame, in pixels: he
// comes into the climb at the frame that fits how far under it he caught it (a full hang from far below, a scramble
// from just under). Tuned by eye against a drawn corner.
const CLIMB = { climb_px: { first: 3, corner: { 3: [31, 7], 4: [31, 7], 5: [31, 8], 6: [30, 11], 7: [30, 14], 8: [33, 25], 9: [31, 31], 10: [27, 35], 11: [12, 43], 12: [14, 38] },
  depth: { 3: 41, 4: 42, 5: 42, 6: 41, 7: 37, 8: 24, 9: 19, 10: 14, 11: 0, 12: 0 } } };
let landT = 0;
// which of his animations, and how far into it (and, for a climb, to place it by where it ends)
function heroPose(P, t){
  const A = hero.meta ? hero.meta.anims : {}, has = n => !!A[n], pick = k => MOVES[k].find(has);
  if (WAKE > 0 && has('getup')) return ['getup', Math.min(0.999, Math.max(0, 1 - WAKE / 1.4))];   // where he fell: up off the ground
  if (P.mantle && pick('climb')){
    const name = pick('climb'), C = CLIMB[name], M = P.mantle;
    if (C && M.wall != null){
      const n = A[name].frames, hpx = (M.y1 - M.y0) * 16; let f0 = C.first; while (f0 < n - 2 && C.depth[f0] > hpx + 5) f0++;   // the frame that fits where he caught it
      const f = Math.min(n - 1, f0 + Math.floor(M.t / M.dur * (n - f0))), [cx, foot] = C.corner[f];
      return [name, (f + 0.5) / n, { cx, foot }];
    }
    return [name, Math.min(0.999, 0.15 + 0.85 * M.t / M.dur), 'last'];   // its first frames are him standing: from the reach up
  }
  if (P.hp <= 0 && has('hurt')) return ['hurt', 0.999];
  if (P.hurtT > 0 && has('hurt')) return ['hurt', 1 - P.hurtT / MV.hurtStun];
  if (P.roll > 0 && pick('roll')) return [pick('roll'), 1 - P.roll / MV.roll.time];
  if (P.flip > 0 && !P.grounded && pick('flip')) return [pick('flip'), Math.min(0.999, 0.08 + 0.92 * (1 - P.flip / MV.flip))];   // the double jump's somersault, drawn
  if (P.dive && has('plunge')) return ['plunge', 0.6];
  if (P.atk){
    // the swing's drawing, timed so the blade lands on its impact frame as the cut strikes
    const W = swingOf(P, P.atk), sw = has(W.anim) ? W.anim : { 0: 'attack1', 1: 'attack2', 2: 'attack3' }[P.atk.i];
    if (has(sw)){
      const hit = W.hit || 0.5, end = W.hitEnd || hit + 1 / A[sw].frames, t = P.atk.t, ph = P.atk.phase;
      const f = ph === 'wind' ? hit * t / W.wind : ph === 'active' ? hit + (end - hit) * t / W.active : end + (1 - end) * t / W.rec;
      return [sw, Math.min(0.999, f)];
    }
  }
  if (!P.grounded && !P.mantle){
    if (P.vy > 0 && has('jump')) return ['jump', Math.min(0.999, P.jumpT / 0.45)];
    if (has('fall')) return ['fall', t * 2];
    if (has('jump')) return ['jump', 0.8];
  }
  if (P.grounded && landT > 0 && pick('land') && !(Math.abs(P.vx) > 1.5 && landT < LAND_T - 0.08)) return [pick('land'), Math.min(0.999, 0.2 + 0.8 * (1 - landT / LAND_T))];   // from the moment his feet meet the floor
  if (P.grounded && Math.abs(P.vx) > 0.3){ const run = has('sprint') ? 'sprint' : 'run'; if (has(run)) return [run, (P.dist || 0) / 2.6]; }
  if (has('idle')) return ['idle', t / 1.4];
  return ['stand', 0];
}

let last = 0, acc = 0, time = 0;
// capture: for recording play frame by frame (tools), the game moves only when asked, a fixed step each time
const CAPTURE = { on: false, left: 0, dt: 1 / 24 };
function frame(ts){
  const now = ts / 1000; let dt = last ? Math.min(0.05, now - last) : 1 / 60; last = now;
  if (CAPTURE.on){ if (CAPTURE.left <= 0){ requestAnimationFrame(frame); return; } CAPTURE.left--; dt = CAPTURE.dt; }
  pollPads();
  PICK.style.display = STORY.active() ? 'none' : 'flex';
  if (STORY.active() && !GO.st){ hudBegin(); STORY.draw(dt); endFrame(); requestAnimationFrame(frame); return; }   // a story screen is up: the world waits
  if (WAKE > 0) WAKE -= dt;
  // hit-stop: a hit freezes the world a few frames (the effects keep running)
  let sdt = dt; if (FEEL_FX.hitstop > 0){ FEEL_FX.hitstop -= dt; sdt = dt * 0.06; }
  acc += sdt; time += dt;
  const h = 1 / 120;
  while (acc >= h){ const x0 = P.x; if (DEATH <= 0 && !GO.st && WAKE <= 0) stepPlayer(P, h); P.dist = (P.dist || 0) + Math.abs(P.x - x0); acc -= h; }
  endFrame();
  const evs = [];
  stepEnemies(E, P, sdt, fx, evs);
  if (BOSS) BOSS.step(P, sdt, fx, evs);
  for (const e of P.events) onEvent(e);
  P.events.length = 0;
  for (const e of evs) onEvent(e);
  // a death: a beat to see it, then he wakes at the shrine (or the start) and the Warden waits again
  if (P.hp <= 0 && DEATH <= 0){ DEATH = 1.6; P.vx = 0; fx.burst({ x: P.x, y: P.y + 0.9 }, 30, 0xff5060); FEEL_FX.hitstop = 0.2; banner('You fell', '', 1.6); }
  if (DEATH > 0){ DEATH -= dt; if (DEATH <= 0){ const s = CHECK || spawnPoint(); P = newPlayer(s.x, s.y); if (BOSS) BOSS.reset(); banner(CHECK ? 'You wake at the shrine' : 'You wake', '', 2); } }
  for (const S of SHRINES) if (Math.abs(P.x - S.x) < 1.1 && Math.abs(P.y - S.y) < 1.5 && P.hp > 0 && (CHECK !== S || P.flask < TUNE.player.flask || P.hp < P.maxHp)){
    const first = CHECK !== S; CHECK = S; P.flask = TUNE.player.flask; P.hp = P.maxHp; sfx.drink(); fx.ring({ x: S.x, y: S.y + 1 }, 0xffd27a);
    if (first) banner('Shrine', 'your flask is full; you will wake here');
  }
  if ((!BOSS || BOSS.st === 'dead') && !WON && R.exits.some(x => Math.abs(P.x - x.x) < 1 && Math.abs(P.y - x.y) < 1.5)){
    WON = true; sfx.gold();
    if (LEVEL.index < LEVELS.length - 1) go(LEVEL.index + 1); else { SAVE.set(null); STORY.start('ending', {}, title); }   // the beacon: the end of the climb
  }
  if (GO.st){
    GO.t += dt;
    if (GO.st === 'out' && GO.t > 0.6){ GO.st = 'load'; GO.t = 0; }                 // a frame fully dark before the work
    else if (GO.st === 'load' && GO.t > 0.05){ const up = GO.to === GO.from + 1; enter(GO.to); acc = 0; GO.t = 0;
      if (up){ GO.st = 'card'; STORY.start('card', { from: GO.from, to: GO.to, name: LEVEL.name, line: CARD[GO.to] || '' }, () => { GO.st = 'in'; GO.t = 0; }); } else GO.st = 'in'; }   // going up: the card shows the mountain and where he is on it
    else if (GO.st === 'in' && GO.t > 0.7) GO.st = '';
    if (GO.st === 'card'){ hudBegin(); STORY.draw(dt); endFrame(); requestAnimationFrame(frame); return; }
  }
  // camera
  // in the Warden's arena the camera draws back to show the whole fight, and keeps inside the arena
  const fight = BOSS && BOSS.active();
  CAM.zoom = 1;   // flat pixels are never scaled: the arena is framed by where the camera keeps
  CAM.lead += (P.face * 2.4 - CAM.lead) * Math.min(1, dt * 2.2);
  let wantX = P.x + CAM.lead, wantY = P.y + 1.8 + (P.grounded ? 0 : Math.min(0, P.vy) * 0.08);
  if (fight) wantY = Math.max(wantY, BOSS.stageY + 4.6);   // the stage near the bottom, the Warden's head near the top
  CAM.x += (wantX - CAM.x) * Math.min(1, dt * 5); CAM.y += (wantY - CAM.y) * Math.min(1, dt * (P.grounded ? 4 : 6));
  const halfH = VIEW_H / 2 * CAM.zoom, halfW = halfH * (R.size().w / R.size().h);
  const box = fight ? BOSS.room : { x0: 0, y0: 0, x1: LEVEL.W * T, y1: LEVEL.H * T };
  const cx = Math.max(box.x0 + halfW, Math.min(box.x1 - halfW, CAM.x)), cy = Math.max(box.y0 + halfH, Math.min(box.y1 - halfH, CAM.y));
  FEEL_FX.shake = Math.max(0, FEEL_FX.shake - dt * 1.2); const sk = FEEL_FX.shake;
  FEEL_FX.kick *= Math.exp(-dt * 14);   // a blow nudges the view the way it goes
  R.setCamera(cx + (Math.random() - 0.5) * sk + FEEL_FX.kick, cy + (Math.random() - 0.5) * sk, CAM.zoom);
  // the warrior
  if (hero.sprite){
    const [anim, frac, anchor] = heroPose(P, time);
    let rot = 0;
    if (P.flip > 0 && !MOVES.flip.includes(anim)){ const q = 1 - P.flip / MV.flip; rot = -Math.PI * 2 * Math.min(1, q * 1.1) * (P.face < 0 ? -1 : 1); }   // no drawn flip: turn the sprite
    if (anchor && typeof anchor === 'object') hero.sprite.show(anim, frac, P.mantle.wall, P.mantle.y1 - SINK, P.mantle.d, 0.05, 0, anchor);   // the climb, on the ledge's corner
    else if (anchor === 'last'){
      // the climb is drawn rising a little under a unit; what the ledge is higher than that, he is eased up through
      const M = P.mantle, A = hero.meta.anims[anim], drawn = (A.foot - A.footLast) / (hero.meta.ppu || 16), u = Math.min(1, M.t / M.dur), e = u * u * (3 - 2 * u);
      hero.sprite.show(anim, frac, M.x1, M.y1 - SINK - Math.max(0, (M.y1 - M.y0) - drawn) * (1 - e), P.face, 0.05, 0, 'last');
    }
    else hero.sprite.show(anim, frac, P.x, P.y - SINK, P.face, 0.05, rot);
    // the dash cut leaves afterimages and streaks, and kicks the floor up behind him
    if (P.atk && P.atk.special === 'dash' && P.atk.phase !== 'rec' && (FX2.ghostT -= dt) <= 0){
      FX2.ghostT = 0.035; const m = hero.sprite.ghost(0x4fc8ff); if (m) FX2.ghosts.push({ m, life: 0.22 });
      fx.streak({ x: P.x, y: P.y }, P.face); if (P.grounded) fx.kick({ x: P.x, y: P.y }, -P.face, 3, 3);
    }
  }
  for (let i = FX2.ghosts.length - 1; i >= 0; i--){ const G = FX2.ghosts[i]; G.life -= dt; G.m.material.opacity = Math.max(0, G.life / 0.22) * 0.8; if (G.life <= 0){ R.scene.remove(G.m); G.m.material.map.dispose(); G.m.material.dispose(); FX2.ghosts.splice(i, 1); } }
  landT = Math.max(0, landT - dt);
  // dust at his feet as he runs, now and then
  if (P.grounded && Math.abs(P.vx) > 4 && !P.atk){ FX2.runDust += Math.abs(P.vx) * dt; if (FX2.runDust > 1.3){ FX2.runDust = 0; fx.kick({ x: P.x, y: P.y }, -Math.sign(P.vx), 3, 1.4); } }
  if (hero.sprite){
    hero.sprite.mat.emissive.setHex(P.inv > 0 && Math.floor(time * 20) % 2 ? 0x803030 : 0x000000);
  }
  stepFx(fx, dt);
  R.frame(time, P);
  drawHud(dt);
  requestAnimationFrame(frame);
}
function onEvent(e){
  const at = { x: P.x, y: P.y };
  switch (e.type){
    case 'jump': sfx.jump(); fx.puff(at, 8, 1.6); break;
    case 'doubleJump': sfx.jump(); fx.ring(at, 0x9ff0ff); FX2.flipped = true; break;
    case 'land': sfx.step(); fx.puff(at, e.hard ? 20 : 8, e.hard ? 3.2 : 2); if (e.hard) FEEL_FX.shake = Math.max(FEEL_FX.shake, 0.12); if (e.hard || (e.drop || 0) > 0.8 || FX2.flipped){ landT = LAND_T; } FX2.flipped = false; break;
    case 'slam': { sfx.slam(); fx.puff(at, 24, 3.6); R.shock(P.x, P.y + 0.3, true); fx.ring(at, 0xffd27a); const out = []; slamEnemies(E, P, MV.dive.radius, MV.dive.dmg, out); if (BOSS) BOSS.slam(P, MV.dive.radius, MV.dive.dmg, out); for (const o of out) onEvent(o); break; }
    case 'roll': sfx.whoosh(); fx.kick(at, -P.rollDir, 10, 2.6); break;
    case 'dashCut': sfx.dash(); fx.kick(at, -P.face, 14, 3.4); FX2.ghostT = 0; break;
    case 'dive': sfx.whoosh(); break;
    case 'strike': {
      // the blow: the swoosh of light, the air bending round it, the floor kicked up, a thump, the view nudged
      const big = e.finisher, tilt = { atk_slam_v3: -0.7, atk_slam_px: -0.7, atk_rise_px: 1.0, atk_spin_px: 0.1, atk_dash_px: 0.25 }[e.sw.anim] || 0;
      sfx.swing(big); fx.crescent({ x: P.x + P.face * 1.15, y: P.y + 1.25 }, P.face, big, tilt); R.shock(P.x + P.face * 1.3, P.y + 1.2, big);
      if (P.grounded) fx.kick(at, -P.face, big ? 12 : 7, big ? 3 : 2.2);
      FEEL_FX.shake = Math.max(FEEL_FX.shake, big ? 0.14 : 0.07); FEEL_FX.kick = P.face * (big ? 0.22 : 0.12);
      // the dash cut strikes all along where he dashed
      const from = e.sw.dash && P.dashFrom != null ? { ...P, x: P.dashFrom } : P, reach = BLADE.reach + (e.sw.dash && P.dashFrom != null ? Math.abs(P.x - P.dashFrom) : 0);
      const out = []; strikeEnemies(E, from, reach, e.sw.dmg, out); if (BOSS) BOSS.strike(from, reach, e.sw.dmg, out); for (const o of out) onEvent(o); break; }
    case 'hit': sfx.hit(); fx.burst(e.at, e.heavy ? 18 : 12, 0xffe0a8); FEEL_FX.hitstop = e.heavy ? 0.09 : 0.05; FEEL_FX.shake = Math.max(FEEL_FX.shake, e.heavy ? 0.18 : 0.1); break;
    case 'kill': sfx.gold && sfx.gold(); fx.burst(e.at, 26, 0xff70d0); fx.ring(e.at, 0xffc0ff); FEEL_FX.hitstop = 0.1; break;
    case 'parry': sfx.parry(); fx.ring(e.at, 0x9fd0ff); FEEL_FX.hitstop = 0.12; break;
    case 'block': sfx.block(); fx.burst(e.at, 8, 0xc9d2e0); break;
    case 'spit': sfx.spit(); break;
    case 'tell': e.e.tellT = 0.6; break;
    case 'step': sfx.step(); break;
    case 'mantle': sfx.whoosh(); break;
    case 'hurt': sfx.hurt(); fx.burst({ x: P.x, y: P.y + 1.3 }, 10, 0xff6060); break;
    case 'skid': fx.kick(at, Math.sign(P.vx) || P.face, 6, 2.2); break;
    case 'bossWake': sfx.roar(); FEEL_FX.shake = 0.5; banner(BOSS.name, BOSS.hint); break;
    case 'bossToll': sfx.parry(); sfx.rumble(); FEEL_FX.shake = Math.max(FEEL_FX.shake, 0.2); break;
    case 'bossTell': sfx.creak(); break;
    case 'bossSlam': sfx.impact(true); sfx.slam(); fx.dust(e.at, e.soft ? 10 : 26, 4); if (!e.soft) fx.ring(e.at, 0xffd27a); FEEL_FX.shake = Math.max(FEEL_FX.shake, e.soft ? 0.18 : 0.42); break;
    case 'bossSweep': sfx.rumble(); FEEL_FX.shake = Math.max(FEEL_FX.shake, 0.15); break;
    case 'rockLand': sfx.crack(); fx.dust(e.at, 8, 2); FEEL_FX.shake = Math.max(FEEL_FX.shake, 0.1); break;
    case 'bossPhase': sfx.roar(); FEEL_FX.shake = 0.6; banner(BOSS.name + ' rages', BOSS.rage); break;
    case 'bossDie': sfx.roar(); FEEL_FX.hitstop = 0.3; FEEL_FX.shake = 0.8; break;
    case 'bossDead': for (const x of R.exits) x.set(true); sfx.gold(); banner(BOSS.name + ' falls', BOSS.fell); break;
    case 'flask': if (P.flask > 0 && P.hp < P.maxHp){ P.flask--; P.hp = Math.min(P.maxHp, P.hp + TUNE.player.flaskHeal); sfx.drink(); fx.ring({ x: P.x, y: P.y + 0.8 }, 0x5ce1c6); } break;
  }
}
function drawHud(dt){
  const w = hud.clientWidth, h = hud.clientHeight, dpr = devicePixelRatio || 1;
  if (hud.width !== Math.round(w * dpr)){ hud.width = Math.round(w * dpr); hud.height = Math.round(h * dpr); }
  hudBegin();
  hx.shadowColor = 'rgba(8,6,14,0.85)'; hx.shadowOffsetX = hx.shadowOffsetY = 1.5 * dpr; hx.shadowBlur = 0;   // read over a bright sky as over a dark cave
  for (let i = 0; i < P.maxHp; i++){ hx.fillStyle = i < P.hp ? '#ff4d6a' : '#3a2433'; hx.fillRect(18 + i * 22, 16, 16, 16); hx.strokeStyle = '#0b0710'; hx.lineWidth = 2; hx.strokeRect(18 + i * 22, 16, 16, 16); }
  // a red ! over a creature winding up
  const v = new window.THREE.Vector3();
  for (const e of E.list){
    if (!e.alive || !(e.tellT > 0)) continue; e.tellT -= dt;
    v.set(e.x, e.y + e.d.h + 0.6, 0).project(R.camera); const sx = (v.x + 1) / 2 * w, sy = (1 - v.y) / 2 * h;
    hx.fillStyle = 'rgba(10,6,16,0.8)'; hx.beginPath(); hx.arc(sx, sy, 12, 0, 7); hx.fill(); hx.strokeStyle = '#ff5a4a'; hx.lineWidth = 2.5; hx.stroke();
    hx.fillStyle = '#ff5a4a'; hx.font = '700 16px sans-serif'; hx.textAlign = 'center'; hx.textBaseline = 'middle'; hx.fillText('!', sx, sy + 1); hx.textAlign = 'left'; hx.textBaseline = 'alphabetic';
  }
  hx.fillStyle = '#5ce1c6'; hx.font = '600 13px "Pixelify Sans", sans-serif'; hx.fillText('flask ' + '●'.repeat(P.flask) + '○'.repeat(Math.max(0, TUNE.player.flask - P.flask)), 18 + P.maxHp * 22 + 10, 29);
  // the Warden's health, along the top
  const bh = BOSS && BOSS.hud();
  if (bh){
    const bw = Math.min(560, w * 0.6), bx = (w - bw) / 2, by = 26;
    hx.fillStyle = 'rgba(10,6,16,0.8)'; hx.fillRect(bx - 3, by - 3, bw + 6, 14); hx.fillStyle = '#3a2433'; hx.fillRect(bx, by, bw, 8);
    hx.fillStyle = bh.phase === 2 ? '#ff8a50' : '#5ce1c6'; hx.fillRect(bx, by, bw * bh.frac, 8);
    hx.font = '600 14px "Pixelify Sans", sans-serif'; hx.textAlign = 'center'; hx.fillStyle = '#e8f4ff'; hx.fillText(bh.name, w / 2, by + 28); hx.textAlign = 'left';
  }
  if (BANNER){
    BANNER.t -= dt; const a = Math.max(0, Math.min(1, BANNER.t, (BANNER.life - BANNER.t) * 3));
    hx.textAlign = 'center'; hx.globalAlpha = a; hx.fillStyle = '#fff2d0'; hx.font = '700 34px "Pixelify Sans", sans-serif'; hx.fillText(BANNER.a, w / 2, h * 0.32);
    hx.fillStyle = '#cfe6ff'; hx.font = '400 16px "Pixelify Sans", sans-serif'; hx.fillText(BANNER.b, w / 2, h * 0.32 + 28); hx.globalAlpha = 1; hx.textAlign = 'left';
    if (BANNER.t <= 0) BANNER = null;
  }
  const room = roomAt(P.x, P.y);
  if (room) MAP.seen.add(room);
  {
    const k = h < 520 ? 0.5 : 0.8, mw = LEVEL.W * k, mh = LEVEL.H * k, mx = w - mw - 16, my = 16;
    hx.fillStyle = 'rgba(6,8,20,0.85)'; hx.fillRect(mx - 4, my - 4, mw + 8, mh + 8); hx.strokeStyle = 'rgba(140,210,255,0.35)'; hx.lineWidth = 1; hx.strokeRect(mx - 4.5, my - 4.5, mw + 9, mh + 9);
    hx.imageSmoothingEnabled = false;
    for (const r of MAP.seen){ const sx = r.x0 / T, sy = LEVEL.H - r.y1 / T, sw = (r.x1 - r.x0) / T, sh = (r.y1 - r.y0) / T; hx.globalAlpha = r === room ? 1 : 0.7; hx.drawImage(MAP.c, sx, sy, sw, sh, mx + sx * k, my + sy * k, sw * k, sh * k); }
    hx.globalAlpha = 1;
    const dot = (x, y, c, r = 2) => { hx.fillStyle = c; hx.fillRect(mx + x / T * k - r, my + (LEVEL.H - y / T) * k - r, r * 2, r * 2); };
    for (const S of SHRINES) if (MAP.seen.has(S.room)) dot(S.x, S.y + 0.5, '#ffd27a');
    if (BOSS && [...MAP.seen].some(r => r.name === 'arena')) dot(BOSS.cx, BOSS.stageY + 1, BOSS.st === 'dead' ? '#7a8090' : '#ff5a4a', 3);
    if (Math.floor(time * 3) % 2 === 0) dot(P.x, P.y + 0.8, '#ffffff');
  }
  {
    // how high on the mountain: the three regions one over the other, a mark where he is
    const k = h < 520 ? 0.5 : 0.8, gx = w - 16 - 6, gy = 16 + LEVEL.H * k + 18, gh = Math.min(150, h * 0.3), span = REGION_SPAN[LEVEL.index], f = span[0] + (span[1] - span[0]) * Math.max(0, Math.min(1, P.y / (LEVEL.H * T)));
    hx.fillStyle = 'rgba(6,8,20,0.85)'; hx.fillRect(gx - 3, gy - 3, 12, gh + 6);
    [['#2a7aa8', 0], ['#b86f50', 1], ['#c0cbdc', 2]].forEach(([c, n]) => { const a = REGION_SPAN[n]; hx.globalAlpha = n === LEVEL.index ? 1 : 0.45; hx.fillStyle = c; hx.fillRect(gx, gy + gh * (1 - a[1]), 6, gh * (a[1] - a[0]) - 1); }); hx.globalAlpha = 1;
    hx.fillStyle = '#fee761'; hx.fillRect(gx - 4, gy + gh * (1 - f) - 2, 14, 4); hx.fillStyle = '#ffffff'; hx.fillRect(gx - 4, gy + gh * (1 - f) - 1, 14, 2);
    hx.fillStyle = '#cfe6ff'; hx.font = '600 11px "Pixelify Sans", sans-serif'; hx.textAlign = 'right'; hx.fillText(Math.round(f * 1000) + ' m', gx - 8, gy + gh * (1 - f) + 4); hx.fillText('summit', gx - 8, gy + 6); hx.textAlign = 'left';
  }
  hx.font = '600 14px "Pixelify Sans", sans-serif'; hx.fillStyle = '#cfe6ff'; hx.fillText(LEVEL.name + (room ? ' · ' + room.name : ''), 18, 52);
  hx.fillStyle = 'rgba(207,230,255,0.6)'; hx.font = '400 12px "Pixelify Sans", sans-serif';
  if (DEVICE.kind === 'keys') hx.fillText('A D move · Space jump (again in the air) · Shift roll (LMB during it: dash cut) · LMB attack (S + LMB: rising cut; in the air: plunge) · S + Space drop through a ledge · F9 feel', 18, h - 16);
  else if (DEVICE.kind !== 'touch') hx.fillText('stick move · A jump (again in the air) · roll · attack · down + attack in the air plunge · down + jump drop through a ledge', 18, h - 16);
  hx.fillStyle = 'rgba(207,230,255,0.45)'; hx.font = '400 11px "Pixelify Sans", sans-serif'; hx.textAlign = 'right'; hx.fillText(BUILD, w - 16, h - 6); hx.textAlign = 'left';   // which build this is
  if (GO.st){ hx.fillStyle = `rgba(8,6,14,${GO.st === 'out' ? Math.min(1, GO.t / 0.6) : GO.st === 'in' ? Math.max(0, 1 - GO.t / 0.7) : 1})`; hx.fillRect(0, 0, w, h); }   // going up: dark between regions
  const pips = document.getElementById('pips'), pv = '●'.repeat(P.flask) + '○'.repeat(Math.max(0, TUNE.player.flask - P.flask)); if (pips && pips.textContent !== pv) pips.textContent = pv;
}
window.__side = { get P(){ return P; }, set P(v){ P = v; }, R, LEVEL, weapons: null, CAM, input: null, get E(){ return E; }, get BOSS(){ return BOSS; }, capture: CAPTURE, go, enter, story: STORY, title };
import('../core/input.js').then(m => { window.__side.input = m; });
import('../config/weapons.js').then(m => { window.__side.weapons = m.WEAPONS.sword; });
addEventListener('pointerdown', () => ac(), { once: true });
requestAnimationFrame(frame);
