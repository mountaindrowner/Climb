// Crawler: crawls out of a crack in the wall, rears up with a red "!", then lunges.
// Answer: A before it lunges, or B to block the lunge (stunning it) and then A.
// States: idle -> crack -> out -> windup <-> stunned -> spent/dead
import { R, RW, OMEGA } from '../../config/constants.js';
import { TUNE } from '../../config/tuning.js';
import { GOLD } from '../../config/economy.js';
import { yawFor } from '../../core/math.js';
import { ST } from '../../core/state.js';
import { sfx } from '../../audio/sfx.js';
import { lam, mbox, placeArc, vArc } from '../../render/primitives.js';
import { burst } from '../../render/particles.js';
import { float, hitstop, shake } from '../../fx/feedback.js';
import { posOf, topAt } from '../../world/path.js';
import { hurt, head } from '../player/player.js';
const THREE = window.THREE;
const T = TUNE.crawler;

export function build(o, { glow, dyn }){
  const a = o.s * OMEGA, top = topAt(o.s);
  const bodyMat = new THREE.MeshLambertMaterial({ color: 0x2b2436, emissive: 0x000000 });
  const g = new THREE.Group();
  g.add(mbox(0.8, 0.42, 0.7, bodyMat, 0, 0.26, 0));
  g.add(mbox(0.7, 0.1, 0.6, lam(0x3d3450), 0, 0.5, 0));
  const eyeMat = new THREE.MeshBasicMaterial({ color: glow });
  g.add(mbox(0.05, 0.09, 0.09, eyeMat, 0.41, 0.32, 0.15), mbox(0.05, 0.09, 0.09, eyeMat, 0.41, 0.32, -0.15));
  g.add(mbox(0.16, 0.05, 0.05, lam(0x6e6478), 0.45, 0.16, 0.12), mbox(0.16, 0.05, 0.05, lam(0x6e6478), 0.45, 0.16, -0.12));
  g.add(mbox(0.3, 0.2, 0.5, lam(0x231d2c), -0.45, 0.2, 0));
  g.scale.setScalar(1.35);
  for (const lx of [-0.28, 0.28]) for (const lz of [-0.3, 0.3]) g.add(mbox(0.1, 0.12, 0.1, lam(0x18131f), lx, 0.04, lz));
  g.visible = false; dyn.add(g);
  // the glowing crack it comes out of
  const crackMat = new THREE.MeshBasicMaterial({ color: glow, transparent: true, opacity: 0.25 });
  const crack = new THREE.Group();
  [[0, 0.9, 0.5, 0.3], [0.12, 0.55, 0.4, -0.5], [-0.05, 0.25, 0.35, 0.4]].forEach(([dx, dy, len, rot]) => { const m = mbox(0.07, len, 0.04, crackMat, dx, dy, 0); m.rotation.z = rot; crack.add(m); });
  placeArc(crack, a, RW - 0.05, top); crack.rotation.y = yawFor(a); dyn.add(crack);
  o.m = g; o.bodyMat = bodyMat; o.crack = crack; o.crackMat = crackMat; o.eyeMat = eyeMat; o.glow = glow;
}

export function update(o, dt){
  const G = ST.G, d = o.s - G.s;
  if (!o.alive){ o.dead += dt; return; }
  if (o.st === 'idle' && d < T.wake){ o.st = 'crack'; o.tm = 0; sfx.crack(); }
  if (o.st === 'crack'){ o.tm += dt; if (d < T.emerge || o.tm > T.emergeMax){ o.st = 'out'; o.tm = 0; burst(vArc(o.s * OMEGA, RW - 0.4, topAt(o.s) + 0.5), 14, '#7a7294', 3); } }
  if (o.st === 'out'){ o.tm += dt; o.s -= T.approach * dt; if (o.s - G.s < T.rear){ o.st = 'windup'; o.tm = 0; sfx.spit(); } }
  else if (o.st === 'windup'){
    o.tm += dt; if (d < T.engageRange) G.engaged = true;
    if (o.tm >= T.lunge){
      o.s -= 0.35; sfx.hit();
      if (G.block > 0){ o.st = 'stunned'; o.tm = 0; o.s += 0.9; sfx.block(); float('Blocked', head(), '#c9d2e0'); hitstop(0.06); burst(head(1.2), 8, '#c9d2e0', 2); }
      else { o.st = 'spent'; hurt(1, 'Bitten'); if (ST.mode !== 'climb') return; o.alive = false; o.dead = 0; o.done = true; }
    }
  }
  else if (o.st === 'stunned'){ o.tm += dt; if (d < T.engageRange) G.engaged = true; if (o.tm > T.stun){ o.st = 'windup'; o.tm = 0; } }
  if (o.alive && o.s - G.s < 0.3){ o.alive = false; o.dead = 0; o.done = true; hurt(1, 'Bitten'); }
}

// Can the warrior's swing connect with this one right now?
export const hittable = o => o.alive && o.st !== 'idle';
export function hit(o, dmg){
  const G = ST.G;
  o.hp -= dmg; o.flash = 0.12; sfx.hit(); hitstop(TUNE.feel.hitstopHit); shake(0.12);
  if (o.st === 'windup'){ o.st = 'stunned'; o.tm = 0; }
  o.s += 0.25;
  const op = vArc(o.s * OMEGA, R, posOf(o.s).y + 0.5); burst(op, 12, '#ffd9a8', 3.5);
  if (o.hp <= 0){ o.alive = false; o.dead = 0; hitstop(TUNE.feel.hitstopKill); G.gold += GOLD.crawler; op.y += 0.6; float('+' + GOLD.crawler, op, '#e8b04a'); sfx.gold(); }
}

export function draw(o){
  const time = ST.time, a = o.s * OMEGA;
  o.crackMat.opacity = o.st === 'crack' ? 0.5 + 0.5 * Math.sin(time * 20) : o.st === 'idle' ? 0.25 : 0.12;
  if (o.st === 'idle' || o.st === 'crack'){ o.m.visible = false; return; }
  if (!o.alive && o.dead > 0.8){ o.m.visible = false; return; }
  o.m.visible = true;
  const pop = o.st === 'out' ? Math.min(1, o.tm / 0.18) : 1;
  const r = o.alive ? (RW - 0.6) + (R + 0.35 - (RW - 0.6)) * pop : R + 0.35 - o.dead * 4;
  const y = posOf(o.s).y + (o.alive ? 0 : -o.dead * o.dead * 9);
  placeArc(o.m, a, r, y, true);
  const wq = o.st === 'windup' ? Math.min(1, o.tm / 0.35) : 0;
  o.m.rotation.z = !o.alive ? o.dead * 6 : o.st === 'windup' ? wq * 0.65 + Math.sin(time * 40) * 0.04 : o.st === 'stunned' ? -0.3 : 0;
  o.m.position.y += o.st === 'windup' ? wq * 0.2 : 0;
  o.eyeMat.color.setHex(o.st === 'windup' ? 0xff3020 : o.glow);
  o.bodyMat.emissive.setHex(o.flash > 0 ? 0xffffff : o.st === 'windup' && Math.sin(time * 30) > 0 ? 0x401010 : 0x000000);
}

export function hud(o, d, { drawIcon }){
  if (o.done || !o.alive || d <= 0 || d > TUNE.climb.iconRange) return;
  const cp = vArc(o.s * OMEGA, R, posOf(o.s).y + 1.5);
  if (o.st === 'windup') drawIcon(cp, '!', '#ff6b5a');
  else if (o.st === 'stunned') drawIcon(cp, 'A', '#e8b04a');
  else if (o.st === 'out' && d < 3) drawIcon(cp, 'A', '#efe6d2');
}
