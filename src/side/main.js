// The side view: boot and the loop. The motor steps at a fixed 1/120 s (input is kept until it is used, core/input.js);
// the frame draws where things are. Camera: it leads the way he faces and a little up, eases after him, and stays
// inside the map.
import { TUNE } from '../config/tuning.js';
import { IN, bindInput, endFrame, pollPads } from '../core/input.js';
import { sfx, ac } from '../audio/sfx.js';
import '../ui/feel.js';
import { LEVEL, T, spawnPoint, roomAt } from './level.js';
import { newPlayer, stepPlayer, BODY } from './motor.js';
import { makeRenderer, makeSprite, VIEW_H } from './render.js';
import { spawnFx, stepFx } from './fx.js';
const MV = TUNE.move;

const canvas = document.getElementById('gl'), hud = document.getElementById('hud'), hx = hud.getContext('2d');
const R = makeRenderer(canvas);
const sp = spawnPoint();
let P = newPlayer(sp.x, sp.y);
const hero = { sprite: null, meta: null };
fetch('assets/side/hero/sprite.json').then(r => r.json()).then(meta => { hero.meta = meta; hero.sprite = makeSprite(R.scene, 'assets/side/hero', meta); });
const fx = spawnFx(R.scene);
const CAM = { x: sp.x, y: sp.y + 2, lead: 0 };
bindInput();

// which of his animations, and how far into it
function heroPose(P, t){
  const A = hero.meta ? hero.meta.anims : {}, has = n => !!A[n];
  if (P.hurtT > 0 && has('hurt')) return ['hurt', 1 - P.hurtT / MV.hurtStun];
  if (P.roll > 0 && has('roll')) return ['roll', 1 - P.roll / MV.roll.time];
  if (P.dive && has('plunge')) return ['plunge', 0.6];
  if (P.atk){
    const sw = { 0: 'attack1', 1: 'attack2', 2: 'attack3' }[P.atk.i]; const W = window.__side.weapons.combo[P.atk.i];
    const span = W.wind + W.active + W.rec, at = P.atk.phase === 'wind' ? P.atk.t : P.atk.phase === 'active' ? W.wind + P.atk.t : W.wind + W.active + P.atk.t;
    if (has(sw)) return [sw, Math.min(0.999, at / span)];
  }
  if (!P.grounded && !P.mantle){
    if (P.vy > 0 && has('jump')) return ['jump', Math.min(0.999, P.jumpT / 0.45)];
    if (has('fall')) return ['fall', t * 2];
    if (has('jump')) return ['jump', 0.8];
  }
  if (P.grounded && Math.abs(P.vx) > 0.3){ const run = has('sprint') ? 'sprint' : 'run'; if (has(run)) return [run, (P.dist || 0) / 2.6]; }
  if (has('idle')) return ['idle', t / 1.4];
  return ['stand', 0];
}

let last = 0, acc = 0, time = 0;
function frame(ts){
  const now = ts / 1000; let dt = last ? Math.min(0.05, now - last) : 1 / 60; last = now;
  pollPads();
  acc += dt; time += dt;
  const h = 1 / 120;
  while (acc >= h){ const x0 = P.x; stepPlayer(P, h); P.dist = (P.dist || 0) + Math.abs(P.x - x0); acc -= h; }
  endFrame();
  for (const e of P.events) onEvent(e);
  P.events.length = 0;
  if (P.hp <= 0){ const s = spawnPoint(); P = newPlayer(s.x, s.y); }
  // camera
  CAM.lead += (P.face * 2.4 - CAM.lead) * Math.min(1, dt * 2.2);
  const wantX = P.x + CAM.lead, wantY = P.y + 1.4 + (P.grounded ? 0 : Math.min(0, P.vy) * 0.08);
  CAM.x += (wantX - CAM.x) * Math.min(1, dt * 5); CAM.y += (wantY - CAM.y) * Math.min(1, dt * (P.grounded ? 4 : 6));
  const halfW = VIEW_H / 2 * (R.size().w / R.size().h), halfH = VIEW_H / 2;
  const cx = Math.max(halfW, Math.min(LEVEL.W * T - halfW, CAM.x)), cy = Math.max(halfH, Math.min(LEVEL.H * T - halfH, CAM.y));
  R.setCamera(cx, cy);
  // the warrior
  if (hero.sprite){
    const [anim, frac] = heroPose(P, time);
    let rot = 0;
    if (P.flip > 0){ const q = 1 - P.flip / MV.flip; rot = -Math.PI * 2 * Math.min(1, q * 1.1) * (P.face < 0 ? -1 : 1); }
    hero.sprite.show(anim, frac, P.x, P.y, P.face, 0.05, rot);
    hero.sprite.mat.emissive.setHex(P.inv > 0 && Math.floor(time * 20) % 2 ? 0x803030 : 0x000000);
  }
  stepFx(fx, dt);
  R.frame(time, P);
  drawHud();
  requestAnimationFrame(frame);
}
function onEvent(e){
  const at = { x: P.x, y: P.y };
  switch (e.type){
    case 'jump': sfx.jump(); fx.dust(at, 6, 1.4); break;
    case 'doubleJump': sfx.jump(); fx.ring(at, 0x9ff0ff); break;
    case 'land': sfx.step(); if (e.hard){ fx.dust(at, 14, 2.6); R.shake = 0.15; } else fx.dust(at, 5, 1.2); break;
    case 'slam': sfx.slam(); fx.dust(at, 22, 3.6); fx.ring(at, 0xffd27a); break;
    case 'roll': sfx.whoosh(); fx.dust(at, 6, 2); break;
    case 'dive': sfx.whoosh(); break;
    case 'strike': sfx.slash(); fx.slash({ x: P.x + P.face * 0.9, y: P.y + 1.0 }, P.face, e.finisher); break;
    case 'step': sfx.step(); break;
    case 'mantle': sfx.whoosh(); break;
    case 'hurt': sfx.hurt(); fx.burst({ x: P.x, y: P.y + 1 }, 10, 0xff6060); break;
    case 'skid': fx.dust(at, 4, 1.6); break;
  }
}
function drawHud(){
  const w = hud.clientWidth, h = hud.clientHeight, dpr = devicePixelRatio || 1;
  if (hud.width !== Math.round(w * dpr)){ hud.width = Math.round(w * dpr); hud.height = Math.round(h * dpr); }
  hx.setTransform(dpr, 0, 0, dpr, 0, 0); hx.clearRect(0, 0, w, h);
  for (let i = 0; i < P.maxHp; i++){ hx.fillStyle = i < P.hp ? '#ff4d6a' : '#3a2433'; hx.fillRect(18 + i * 22, 16, 16, 16); hx.strokeStyle = '#0b0710'; hx.lineWidth = 2; hx.strokeRect(18 + i * 22, 16, 16, 16); }
  const room = roomAt(P.x, P.y);
  hx.font = '600 14px "Pixelify Sans", sans-serif'; hx.fillStyle = '#cfe6ff'; hx.fillText(room ? room.name : '', 18, 52);
  hx.fillStyle = 'rgba(207,230,255,0.6)'; hx.font = '400 12px "Pixelify Sans", sans-serif';
  hx.fillText('A D move · Space jump (again in the air) · Shift roll · LMB attack · S + LMB in the air plunge · S + Space drop through a ledge · F9 feel', 18, h - 16);
}
window.__side = { get P(){ return P; }, set P(v){ P = v; }, R, LEVEL, weapons: null, CAM, input: null };
import('../core/input.js').then(m => { window.__side.input = m; });
import('../config/weapons.js').then(m => { window.__side.weapons = m.WEAPONS.sword; });
addEventListener('pointerdown', () => ac(), { once: true });
requestAnimationFrame(frame);
