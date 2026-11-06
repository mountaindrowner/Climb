// Crawler: skitters out of a glowing crack in the wall and chases you along the stair. In reach it rears with red eyes
// and open mandibles, its aim locks, and it lunges. Then it is open for a moment before it goes again.
// Answer: A (a hit during the wind-up staggers it), hold B to block the lunge (a parry stuns it longer), or roll through.
// States: idle -> crack -> out -> chase -> windup -> lunge -> recover -> chase ...; stunned; dead
import { R, RW, OMEGA } from '../../config/constants.js';
import { TUNE } from '../../config/tuning.js';
import { GOLD } from '../../config/economy.js';
import { yawFor } from '../../core/math.js';
import { ST } from '../../core/state.js';
import { sfx } from '../../audio/sfx.js';
import { mbox, placeArc, vArc } from '../../render/primitives.js';
import { flatMat, glowMat, segment, spike, blob, joint, outline, outlineMat } from '../../render/creature.js';
import { burst } from '../../render/particles.js';
import { float, hitstop, shake } from '../../fx/feedback.js';
import { posOf, topAt } from '../../world/path.js';
import { hurt, head, isBlocking, isParry, isInvulnerable } from '../player/player.js';
const THREE = window.THREE;
const T = TUNE.crawler;

export const hint = 'A crawler. Strike it with {attack}. Hold {block} to block its lunge, or {roll} through it, then strike while it recovers.';

// +x faces the warrior, +y up, ±z its sides.
function model(glow){
  const shell = flatMat(0x4a3d5c, { rough: 0.55, metal: 0.2 }), plate = flatMat(0x6b5a84, { rough: 0.5, metal: 0.25 }), legMat = flatMat(0x2e2638, { rough: 0.7 });
  const eye = glowMat(glow), rim = outlineMat(glow, 0.45);
  const g = new THREE.Group(), body = joint(g, 0, 0.34, 0);
  const abd = blob(shell, 0.66, 0.36, 0.58); abd.position.set(-0.34, 0.04, 0); body.add(abd);
  const abd2 = blob(plate, 0.46, 0.22, 0.5); abd2.position.set(-0.32, 0.18, 0); body.add(abd2);
  const thorax = blob(shell, 0.46, 0.3, 0.46); thorax.position.set(0.06, 0.06, 0); body.add(thorax);
  for (const m of [abd, abd2, thorax]) outline(m, rim);
  for (let i = 0; i < 4; i++){ const s = spike(plate, 0.24 - i * 0.03, 0.05); s.position.set(-0.52 + i * 0.18, 0.24, 0); s.rotation.z = 0.55; body.add(s); }
  const headJ = joint(body, 0.3, 0.04, 0);
  const hb = blob(plate, 0.3, 0.24, 0.34); hb.position.set(0.08, 0, 0); headJ.add(hb); outline(hb, rim);
  for (const [y, z] of [[0.07, 0.07], [0.07, -0.07], [0.02, 0.13], [0.02, -0.13]]) headJ.add(mbox(0.06, 0.06, 0.06, eye, 0.22, y, z));
  const mand = [];
  for (const side of [1, -1]){
    const m = joint(headJ, 0.2, -0.07, side * 0.08);
    const sp = spike(plate, 0.26, 0.045); sp.rotation.z = -Math.PI / 2; m.add(sp);
    const hook = spike(legMat, 0.1, 0.03); hook.position.set(0.22, 0, 0); hook.rotation.set(side * 0.9, 0, -Math.PI / 2); m.add(hook);
    mand.push({ j: m, side });
  }
  const legs = [];
  for (let i = 0; i < 3; i++) for (const side of [1, -1]){
    const swingJ = joint(body, 0.16 - i * 0.24, -0.02, side * 0.18), hip = joint(swingJ);
    hip.add(segment(legMat, 0.36, 0.045, 0.034));
    const knee = joint(hip, 0, 0.36, 0); knee.add(segment(legMat, 0.5, 0.034, 0.012));
    legs.push({ swingJ, hip, knee, side, i, phase: (i % 2 ? 0 : Math.PI) + (side > 0 ? 0 : Math.PI) });
  }
  g.scale.setScalar(1.7);
  return { g, body, headJ, mand, legs, mats: [shell, plate], eye, rim };
}

export function build(o, { glow, dyn }){
  const a = o.s * OMEGA, top = topAt(o.s);
  const M = model(glow); M.g.visible = false; dyn.add(M.g);
  // the crack it comes out of
  const crackMat = new THREE.MeshBasicMaterial({ color: glow, transparent: true, opacity: 0.25 });
  const crack = new THREE.Group();
  [[0, 1.0, 0.45, 0.3], [0.12, 0.65, 0.42, -0.5], [-0.05, 0.3, 0.38, 0.4], [-0.2, 0.85, 0.3, -1.0], [0.25, 0.4, 0.28, 0.9]].forEach(([dx, dy, len, rot]) => { const m = mbox(0.06, len, 0.04, crackMat, dx, dy, 0); m.rotation.z = rot; crack.add(m); });
  placeArc(crack, a, RW - 0.05, top); crack.rotation.y = yawFor(a); dyn.add(crack);
  o.M = M; o.m = M.g; o.crack = crack; o.crackMat = crackMat; o.glow = glow;
}

export function update(o, dt){
  const G = ST.G, d = o.s - G.s;
  if (!o.alive){ o.dead += dt; return; }
  o.face = o.face || -1;
  const go = st => { o.st = st; o.tm = 0; };
  o.tm += dt;
  switch (o.st){
    case 'idle': if (Math.abs(d) < T.wake){ go('crack'); sfx.crack(); } break;
    case 'crack': if (Math.abs(d) < T.emerge || o.tm > T.emergeMax){ go('out'); burst(vArc(o.s * OMEGA, RW - 0.4, topAt(o.s) + 0.6), 18, '#6e6680', 3.5, 9, 0.11); } break;
    case 'out': if (o.tm > 0.24) go('chase'); break;
    case 'chase': {
      const dir = Math.sign(G.s - o.s) || o.face; o.face = dir;
      if (Math.abs(d) > 1.0) o.s += dir * T.chase * dt;
      if (Math.abs(d) < T.reach){ go('windup'); sfx.spit(); }
      break;
    }
    case 'windup': if (o.tm >= T.windup){ go('lunge'); o.hitDone = false; sfx.hit(); } break;   // aim is locked: o.face no longer turns
    case 'lunge':
      o.s += o.face * (T.lungeDist / T.lunge) * dt;
      if (!o.hitDone && Math.abs(G.s - o.s) < 0.6 && G.y < topAt(G.s) + 1.2){
        o.hitDone = true;
        if (isBlocking(G) && G.face === -o.face){
          const parry = isParry(G);
          go('stunned'); o.stun = parry ? T.parryStun : T.stun; o.s -= o.face * 0.5;
          sfx[parry ? 'parry' : 'block'](); float(parry ? 'Parry!' : 'Blocked', head(), parry ? '#9fd0ff' : '#c9d2e0'); hitstop(parry ? 0.1 : 0.06); burst(head(1.2), 8, '#c9d2e0', 2);
          return;
        }
        if (!isInvulnerable(G)) hurt(1, 'Bitten', o.s);
      }
      if (o.tm >= T.lunge) go('recover');
      break;
    case 'recover': if (o.tm >= T.recover) go('chase'); break;
    case 'stunned': if (o.tm >= (o.stun || T.stun)) go('chase'); break;
  }
  if (!o.done && Math.abs(d) > 9 && o.st !== 'idle') o.done = true;
}

export const hittable = o => o.alive && o.st !== 'idle' && o.st !== 'crack';
export function hit(o, dmg){
  const G = ST.G;
  o.hp -= dmg; o.flash = 0.12; sfx.hit(); hitstop(TUNE.feel.hitstopHit); shake(0.12);
  if (o.st === 'windup' || o.st === 'chase'){ o.st = 'stunned'; o.tm = 0; o.stun = T.hitStun; }
  o.s += Math.sign(o.s - G.s || 1) * 0.35;
  const op = vArc(o.s * OMEGA, R, posOf(o.s).y + 0.5); burst(op, 12, '#ffd9a8', 3.5);
  if (o.hp <= 0){ o.alive = false; o.dead = 0; o.done = true; hitstop(TUNE.feel.hitstopKill); G.gold += GOLD.crawler; op.y += 0.6; float('+' + GOLD.crawler, op, '#e8b04a'); sfx.gold(); }
}

export function draw(o){
  const t = ST.time, a = o.s * OMEGA, M = o.M;
  o.crackMat.opacity = o.st === 'crack' ? 0.5 + 0.5 * Math.sin(t * 20) : o.st === 'idle' ? 0.25 : 0.12;
  if (o.st === 'idle' || o.st === 'crack'){ M.g.visible = false; return; }
  if (!o.alive && o.dead > 1.2){ M.g.visible = false; return; }
  M.g.visible = true;
  const pop = o.st === 'out' ? Math.min(1, o.tm / 0.22) : 1;
  const rad = o.alive ? (RW - 0.6) + (R + 0.35 - (RW - 0.6)) * pop : R + 0.35 - o.dead * 4;
  const y = posOf(o.s).y + (o.alive ? 0 : -o.dead * o.dead * 9);
  placeArc(M.g, a, rad, y, (o.face || -1) < 0);
  const wq = o.st === 'windup' ? Math.min(1, o.tm / 0.35) : o.st === 'lunge' ? 1 : 0, stun = o.st === 'stunned' || o.st === 'recover';
  // body: rears for the lunge, sags when stunned, flips over when dead
  M.body.rotation.set(o.alive ? 0 : o.dead * 7, 0, o.alive ? wq * 0.6 - (stun ? 0.2 : 0) + (wq ? Math.sin(t * 40) * 0.03 : 0) : 0);
  M.body.position.y = 0.34 + wq * 0.16 + (o.st === 'chase' ? Math.abs(Math.sin(t * 16)) * 0.03 : 0) - (stun ? 0.06 : 0);
  M.body.position.x = o.st === 'lunge' ? 0.25 : 0;
  M.headJ.rotation.z = -wq * 0.35;
  for (const md of M.mand) md.j.rotation.y = md.side * (stun ? 0.05 : 0.15 + 0.75 * wq + (o.st === 'out' ? 0.15 * Math.sin(t * 12) : 0));
  // legs: a skittering tripod gait when moving, front pair raised for the lunge, splayed when stunned, curled when dead
  for (const L of M.legs){
    let swing = 0, lift = 0, bend = 1.62;
    if (!o.alive){ lift = -0.4; bend = 2.6; }
    else if (o.st === 'out' || o.st === 'chase'){ const ph = t * 18 + L.phase; swing = Math.sin(ph) * 0.38; lift = Math.max(0, Math.cos(ph)) * 0.35; }
    else if (wq){ if (L.i === 0){ lift = 0.95 * wq; bend = 1.62 - 0.6 * wq; swing = -0.3 * wq; } else lift = -0.1 * wq; }
    else if (stun){ lift = -0.25; swing = L.side * 0.1; bend = 1.4; }
    L.swingJ.rotation.y = swing * L.side;
    L.hip.rotation.x = L.side * (1.1 + lift);
    L.knee.rotation.x = L.side * bend;
  }
  M.eye.color.setHex(wq ? 0xff3020 : stun ? 0x553344 : o.glow);
  M.rim.color.setHex(wq ? 0xff3020 : o.glow); M.rim.opacity = wq ? 0.7 : stun ? 0.25 : 0.45;
  for (const m of M.mats) m.emissive.setHex(o.flash > 0 ? 0xffffff : wq && Math.sin(t * 30) > 0 ? 0x401010 : 0x000000);
}

export function hud(o, d, { drawIcon }){
  if (!o.alive || Math.abs(d) > TUNE.climb.iconRange || o.st === 'idle' || o.st === 'crack') return;
  const cp = vArc(o.s * OMEGA, R, posOf(o.s).y + 1.6);
  if (o.st === 'windup') drawIcon(cp, '!', '#ff6b5a');
  else if (o.st === 'stunned' || o.st === 'recover') drawIcon(cp, 'A', '#e8b04a');
}
