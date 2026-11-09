// The side view: boot and the loop. The motor steps at a fixed 1/120 s (input is kept until it is used, core/input.js);
// the frame draws where things are. Camera: it leads the way he faces and a little up, eases after him, and stays
// inside the map.
import { TUNE } from '../config/tuning.js';
import { IN, bindInput, endFrame, pollPads } from '../core/input.js';
import { sfx, ac } from '../audio/sfx.js';
import '../ui/feel.js';
import { LEVEL, T, spawnPoint, roomAt } from './level.js';
import { newPlayer, stepPlayer, BODY, HOOKS } from './motor.js';
import { makeRenderer, makeSprite, VIEW_H } from './render.js';
import { spawnFx, stepFx } from './fx.js';
import { spawnEnemies, stepEnemies, strikeEnemies } from './enemies.js';
import { WEAPONS } from '../config/weapons.js';
const MV = TUNE.move;

const canvas = document.getElementById('gl'), hud = document.getElementById('hud'), hx = hud.getContext('2d');
const R = makeRenderer(canvas);
const sp = spawnPoint();
let P = newPlayer(sp.x, sp.y);
const hero = { sprite: null, meta: null };
fetch('assets/side/hero/sprite.json').then(r => r.json()).then(meta => { hero.meta = meta; hero.sprite = makeSprite(R.scene, 'assets/side/hero', meta); });
const fx = spawnFx(R.scene);
const E = spawnEnemies(R.scene);
const FEEL_FX = { hitstop: 0, shake: 0 };
// the aim assist: with nothing in reach ahead and a creature in reach behind, a swing turns to it
HOOKS.aim = P => {
  const reach = WEAPONS.sword.reach + MV.aim; let ahead = false, behind = false;
  for (const e of E.list){ if (!e.alive || Math.abs(e.y - P.y) > 2.2) continue; const d = (e.x - P.x) * P.face; if (d > -0.3 && d < reach) ahead = true; else if (d <= -0.3 && d > -reach) behind = true; }
  return !ahead && behind ? -P.face : 0;
};
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
  // hit-stop: a hit freezes the world a few frames (the effects keep running)
  let sdt = dt; if (FEEL_FX.hitstop > 0){ FEEL_FX.hitstop -= dt; sdt = dt * 0.06; }
  acc += sdt; time += dt;
  const h = 1 / 120;
  while (acc >= h){ const x0 = P.x; stepPlayer(P, h); P.dist = (P.dist || 0) + Math.abs(P.x - x0); acc -= h; }
  endFrame();
  const evs = [];
  stepEnemies(E, P, sdt, fx, evs);
  for (const e of P.events) onEvent(e);
  P.events.length = 0;
  for (const e of evs) onEvent(e);
  if (P.hp <= 0){ const s = spawnPoint(); P = newPlayer(s.x, s.y); }
  // camera
  CAM.lead += (P.face * 2.4 - CAM.lead) * Math.min(1, dt * 2.2);
  const wantX = P.x + CAM.lead, wantY = P.y + 1.4 + (P.grounded ? 0 : Math.min(0, P.vy) * 0.08);
  CAM.x += (wantX - CAM.x) * Math.min(1, dt * 5); CAM.y += (wantY - CAM.y) * Math.min(1, dt * (P.grounded ? 4 : 6));
  const halfW = VIEW_H / 2 * (R.size().w / R.size().h), halfH = VIEW_H / 2;
  const cx = Math.max(halfW, Math.min(LEVEL.W * T - halfW, CAM.x)), cy = Math.max(halfH, Math.min(LEVEL.H * T - halfH, CAM.y));
  FEEL_FX.shake = Math.max(0, FEEL_FX.shake - dt * 1.2); const sk = FEEL_FX.shake;
  R.setCamera(cx + (Math.random() - 0.5) * sk, cy + (Math.random() - 0.5) * sk);
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
    case 'strike': { sfx.slash(); fx.slash({ x: P.x + P.face * 0.9, y: P.y + 1.0 }, P.face, e.finisher); const out = []; if (strikeEnemies(E, P, WEAPONS.sword.reach, e.sw.dmg, out)) for (const o of out) onEvent(o); break; }
    case 'hit': sfx.hit(); fx.burst(e.at, e.heavy ? 18 : 12, 0xffe0a8); FEEL_FX.hitstop = e.heavy ? 0.09 : 0.05; FEEL_FX.shake = Math.max(FEEL_FX.shake, e.heavy ? 0.18 : 0.1); break;
    case 'kill': sfx.gold && sfx.gold(); fx.burst(e.at, 26, 0xff70d0); fx.ring(e.at, 0xffc0ff); FEEL_FX.hitstop = 0.1; break;
    case 'parry': sfx.parry(); fx.ring(e.at, 0x9fd0ff); FEEL_FX.hitstop = 0.12; break;
    case 'block': sfx.block(); fx.burst(e.at, 8, 0xc9d2e0); break;
    case 'spit': sfx.spit(); break;
    case 'tell': e.e.tellT = 0.6; break;
    case 'step': sfx.step(); break;
    case 'mantle': sfx.whoosh(); break;
    case 'hurt': sfx.hurt(); fx.burst({ x: P.x, y: P.y + 1 }, 10, 0xff6060); break;
    case 'skid': fx.dust(at, 4, 1.6); break;
    case 'flask': if (P.flask > 0 && P.hp < P.maxHp){ P.flask--; P.hp = Math.min(P.maxHp, P.hp + TUNE.player.flaskHeal); sfx.drink(); fx.ring({ x: P.x, y: P.y + 0.8 }, 0x5ce1c6); } break;
  }
}
function drawHud(){
  const w = hud.clientWidth, h = hud.clientHeight, dpr = devicePixelRatio || 1;
  if (hud.width !== Math.round(w * dpr)){ hud.width = Math.round(w * dpr); hud.height = Math.round(h * dpr); }
  hx.setTransform(dpr, 0, 0, dpr, 0, 0); hx.clearRect(0, 0, w, h);
  for (let i = 0; i < P.maxHp; i++){ hx.fillStyle = i < P.hp ? '#ff4d6a' : '#3a2433'; hx.fillRect(18 + i * 22, 16, 16, 16); hx.strokeStyle = '#0b0710'; hx.lineWidth = 2; hx.strokeRect(18 + i * 22, 16, 16, 16); }
  // a red ! over a creature winding up
  const v = new window.THREE.Vector3();
  for (const e of E.list){
    if (!e.alive || !(e.tellT > 0)) continue; e.tellT -= 1 / 60;
    v.set(e.x, e.y + e.d.h + 0.6, 0).project(R.camera); const sx = (v.x + 1) / 2 * w, sy = (1 - v.y) / 2 * h;
    hx.fillStyle = 'rgba(10,6,16,0.8)'; hx.beginPath(); hx.arc(sx, sy, 12, 0, 7); hx.fill(); hx.strokeStyle = '#ff5a4a'; hx.lineWidth = 2.5; hx.stroke();
    hx.fillStyle = '#ff5a4a'; hx.font = '700 16px sans-serif'; hx.textAlign = 'center'; hx.textBaseline = 'middle'; hx.fillText('!', sx, sy + 1); hx.textAlign = 'left'; hx.textBaseline = 'alphabetic';
  }
  hx.fillStyle = '#5ce1c6'; hx.font = '600 13px "Pixelify Sans", sans-serif'; hx.fillText('flask ' + '●'.repeat(P.flask) + '○'.repeat(Math.max(0, TUNE.player.flask - P.flask)), 18 + P.maxHp * 22 + 10, 29);
  const room = roomAt(P.x, P.y);
  hx.font = '600 14px "Pixelify Sans", sans-serif'; hx.fillStyle = '#cfe6ff'; hx.fillText(room ? room.name : '', 18, 52);
  hx.fillStyle = 'rgba(207,230,255,0.6)'; hx.font = '400 12px "Pixelify Sans", sans-serif';
  hx.fillText('A D move · Space jump (again in the air) · Shift roll · LMB attack · S + LMB in the air plunge · S + Space drop through a ledge · F9 feel', 18, h - 16);
}
window.__side = { get P(){ return P; }, set P(v){ P = v; }, R, LEVEL, weapons: null, CAM, input: null, E };
import('../core/input.js').then(m => { window.__side.input = m; });
import('../config/weapons.js').then(m => { window.__side.weapons = m.WEAPONS.sword; });
addEventListener('pointerdown', () => ac(), { once: true });
requestAnimationFrame(frame);
