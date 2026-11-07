// Flitter: a bat-thing roosting head-down on the wall above the stair. It shrieks, drops, loops out over the open
// shaft and dives at your head. It tracks you until its commit point, then flies straight: a late roll or step dodges.
// It circles back and dives again until it is swatted. Answer: A as the ring closes (gold), hold B to block, or roll.
// States: idle -> launch -> dive -> leave -> circle -> dive ...; dead
import { R, RW, OMEGA } from '../../config/constants.js';
import { TUNE } from '../../config/tuning.js';
import { GOLD } from '../../config/economy.js';
import { ST } from '../../core/state.js';
import { clamp } from '../../core/math.js';
import { sfx } from '../../audio/sfx.js';
import { mbox, vArc } from '../../render/primitives.js';
import { flatMat, glowMat, spike, blob, membrane, joint, outline, outlineMat } from '../../render/creature.js';
import { burst } from '../../render/particles.js';
import { float, hitstop } from '../../fx/feedback.js';
import { topAt, posOf } from '../../world/path.js';
import { hurt, head, headAhead, isBlocking, isInvulnerable } from '../player/player.js';
import { BAT, makeBat, pose as batPose } from './batModel.js';
import { killed, addGold } from '../../run/run.js';
const THREE = window.THREE;
const T = TUNE.flitter;

export const hint = 'A flitter dives at your head. Swat it with {attack} as the ring closes, hold {block} to block, or {roll}.';

// +x is the way it faces (its nose), +y its back, ±z its wings.
function model(glow){
  const fur = flatMat(0x4c3c56, { rough: 0.9 }), skin = new THREE.MeshStandardMaterial({ color: 0x5e4468, emissive: new THREE.Color(glow).multiplyScalar(0.12), flatShading: true, roughness: 0.7, side: THREE.DoubleSide, transparent: true, opacity: 0.94 });
  const rim = outlineMat(glow, 0.5);
  const g = new THREE.Group(), body = joint(g);
  const torso = blob(fur, 0.42, 0.3, 0.32); body.add(torso); outline(torso, rim, 1.2);
  const h = joint(body, 0.26, 0.05, 0); const skull = blob(fur, 0.24, 0.22, 0.22); h.add(skull); outline(skull, rim, 1.2);
  const eye = glowMat(glow);
  h.add(mbox(0.06, 0.06, 0.06, eye, 0.11, 0.03, 0.06), mbox(0.06, 0.06, 0.06, eye, 0.11, 0.03, -0.06));
  for (const s of [1, -1]){ const ear = spike(fur, 0.2, 0.05); ear.position.set(-0.02, 0.09, s * 0.07); ear.rotation.set(s * 0.35, 0, 0.35); h.add(ear); }
  const fang = flatMat(0xe6dcc6); h.add(mbox(0.02, 0.05, 0.02, fang, 0.1, -0.07, 0.03), mbox(0.02, 0.05, 0.02, fang, 0.1, -0.07, -0.03));
  const wings = [];
  for (const s of [1, -1]){
    const w = joint(body, 0, 0.06, s * 0.12), mem = membrane(skin, 0.85, 0.55); if (s < 0) mem.scale.z = -1; w.add(mem);
    const bone = mbox(0.03, 0.03, 0.85, fur, 0.05, 0.01, s * 0.42); w.add(bone);
    wings.push({ w, s });
  }
  const tail = spike(fur, 0.22, 0.04); tail.position.set(-0.2, 0, 0); tail.rotation.z = Math.PI / 2 + 0.2; body.add(tail);
  g.scale.setScalar(2.0);
  return { g, body, wings, mats: [fur, skin], eye, rim };
}

export function build(o, { glow, dyn }){
  const a = o.s * OMEGA, top = topAt(o.s);
  const M = model(glow); dyn.add(M.g);
  o.M = M; o.roost = vArc(a, RW - 0.35, top + 3.4); o.top = top; o.glow = glow;
  o.pos = o.roost.clone(); o.vel = new THREE.Vector3();
  M.g.position.copy(o.roost);
}
const _p = new THREE.Vector3();
function bez(p0, p1, p2, u, out){ const v = 1 - u; return out.set(0, 0, 0).addScaledVector(p0, v * v).addScaledVector(p1, 2 * v * u).addScaledVector(p2, u * u); }

export function update(o, dt){
  const G = ST.G, d = o.s - G.s;
  o.prev = o.prev || o.pos.clone(); o.prev.copy(o.pos);
  const go = st => { o.st = st; o.tm = 0; };
  if (o.st === 'gone') return;
  o.tm += dt;
  switch (o.st){
    case 'idle': o.pos.copy(o.roost); if (Math.abs(d) < T.wake){ go('launch'); sfx.shriek(); o.from = o.pos.clone(); } break;
    case 'launch': { const u = clamp(o.tm / T.launch, 0, 1); o.pos.copy(o.from); o.pos.y -= 0.9 * u * u; if (o.tm >= T.launch) startDive(o); break; }
    case 'dive': {
      if (o.tm < T.dive - T.commit) o.target.copy(headAhead(T.dive - o.tm, 1.2));   // leads him until the commit point, then flies straight
      bez(o.p0, o.p1, o.target, Math.pow(clamp(o.tm / T.dive, 0, 1), 1.25), o.pos);
      if (Math.random() < 0.8) burst(o.pos, 1, o.glow, 0.3, 0, 0.07);
      if (o.tm >= T.dive){
        const hp = head(1.2), reach = o.pos.distanceTo(hp) < 0.95;
        if (reach && isBlocking(G)){ float('Blocked', head(), '#c9d2e0'); sfx.block(); }
        else if (reach && !isInvulnerable(G)) hurt(1, 'Bitten', o.s);
        go('leave'); o.vel.set(-o.pos.x * 0.6, 3.5, -o.pos.z * 0.6);
      }
      break;
    }
    case 'leave': o.pos.addScaledVector(o.vel, dt); if (o.tm >= T.leave) go('circle'); break;
    case 'circle': {
      // hangs over the shaft a little ahead of him, then comes again
      const a = (G.s + 1.5 * G.face) * OMEGA + Math.sin(o.tm * 3) * 0.05, want = vArc(a, R - 3.4, posOf(G.s).y + 4 + Math.sin(o.tm * 5) * 0.2);
      o.pos.lerp(want, Math.min(1, dt * 3));
      if (o.tm >= T.circle) startDive(o);
      break;
    }
    case 'dead': o.vel.y -= 14 * dt; o.pos.addScaledVector(o.vel, dt); if (o.tm > 1.6) go('gone'); break;
  }
  if (!o.done && o.st !== 'idle' && Math.abs(d) > 7) o.done = true;
}
function startDive(o){
  o.st = 'dive'; o.tm = 0; o.p0 = o.pos.clone();
  o.p1 = vArc(o.s * OMEGA + 0.12, R - 3.8, o.p0.y + 1.0);
  o.target = head(1.2);
}
// Swattable in the last moments of its dive, when it is at his head.
export const hittable = o => o.st === 'dive' && o.tm >= T.dive - T.swat;
export const inReach = (o, reach) => o.pos.distanceTo(head(1.2)) < reach + 0.6;
export function hit(o){
  const G = ST.G;
  o.st = 'dead'; o.tm = 0; o.done = true; o.vel.set(-o.pos.x, 2, -o.pos.z).normalize().multiplyScalar(4);
  const gg = addGold(GOLD.flitter); float('Swat +' + gg, head(), '#e8b04a'); killed('flitter', o.pos.clone()); sfx.hit(); hitstop(TUNE.feel.hitstopKill);
  burst(o.pos, 14, '#3e2a44', 3);
}

// The bat model, once it has loaded: posed from the flitter's state. Until then, the box-built flitter above stands in.
function drawBat(o, dt){
  if (!o.B){ o.B = makeBat(2.1); (o.M.g.parent || o.M.g).add(o.B.g); o.M.g.visible = false; }
  const B = o.B, t = ST.time, a = o.s * OMEGA;
  B.g.visible = o.st !== 'gone'; o.M.g.visible = false;
  if (!B.g.visible) return;
  B.g.position.copy(o.pos);
  const inward = Math.atan2(-Math.cos(a), -Math.sin(a));                          // facing the shaft's centre: its back to the wall
  if (o.st === 'idle'){ B.g.rotation.set(0, inward, 0); B.pitch.rotation.set(0, 0, 0); batPose(B, 'Roost', t / 2 + o.s * 0.37, dt, 30); }
  else if (o.st === 'launch'){ B.g.rotation.set(0, inward, 0); batPose(B, 'Unfurl', Math.min(0.999, o.tm / T.launch), dt, 40); }
  else if (o.st === 'dead'){ B.pitch.rotation.x += dt * 9; B.pitch.rotation.z += dt * 4; batPose(B, 'Hit', Math.min(0.999, o.tm * 1.5), dt, 30); }
  else {
    const dir = new THREE.Vector3().subVectors(o.pos, o.prev || o.pos);
    if (dir.lengthSq() > 1e-6){
      B.g.rotation.set(0, Math.atan2(dir.x, dir.z), 0);                            // nose along its flight
      B.pitch.rotation.x = clamp(-dir.y / Math.max(1e-4, Math.hypot(dir.x, dir.z)), -1.2, 1.2) * 0.6;
    }
    if (o.st === 'dive') batPose(B, 'Dive', t * 5, dt, 20);
    else batPose(B, 'Fly', t * 2.9, dt, 12);                                       // a wingbeat about three times a second
  }
  if (B.eye){ const c = o.st === 'dive' ? 0xff4a3a : o.glow; B.eye.color.setHex(c); if (B.eye.emissive) B.eye.emissive.setHex(c); }
}
export function draw(o, dt){
  if (BAT.ready) return drawBat(o, dt);
  const t = ST.time, M = o.M;
  M.g.visible = o.st !== 'gone';
  if (!M.g.visible) return;
  let flap = 1, folded = 0;
  M.g.position.copy(o.pos);
  if (o.st === 'idle'){ folded = 1; flap = 0; M.g.rotation.set(Math.PI, 0, 0); M.body.rotation.z = Math.sin(t * 1.5 + o.s) * 0.06; }
  else if (o.st === 'dead'){ M.g.rotation.x += 0.3; flap = 0; folded = 0.5; }
  else {
    const dir = new THREE.Vector3().subVectors(o.pos, o.prev || o.pos);
    if (dir.lengthSq() > 1e-6){ M.g.rotation.set(0, Math.atan2(-dir.z, dir.x), 0); M.body.rotation.z = clamp(dir.y / Math.max(1e-4, Math.hypot(dir.x, dir.z)), -1, 1) * 0.6; }
    if (o.st === 'launch'){ const u = clamp(o.tm / T.launch, 0, 1); M.g.rotation.x = Math.PI * (1 - u); folded = 1 - u; }
  }
  const beat = Math.sin(t * (o.st === 'dive' ? 26 : 18));
  for (const W of M.wings) W.w.rotation.x = W.s * (folded * 1.35 + flap * (0.15 + beat * 0.75));
  M.eye.color.setHex(o.st === 'dive' ? 0xff4a3a : o.glow);
  M.rim.color.setHex(o.st === 'dive' ? 0xff4a3a : o.glow);
}
export function hud(o, d, { drawIcon, drawTiming }){
  if (o.st === 'dive') drawTiming('{attack}', o.tm, T.dive);
  else if (o.st === 'launch') drawIcon(o.pos.clone().setY(o.pos.y + 0.6), '!', '#ff6b5a');
  else if (o.st === 'idle' && Math.abs(d) < TUNE.climb.iconRange + 0.6) drawIcon(o.roost.clone().setY(o.roost.y + 0.7), '{attack}', '#efe6d2');
}
