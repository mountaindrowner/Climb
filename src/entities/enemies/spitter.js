// Spitter: a swollen sac on spindly legs, gripping the wall above the stair. While you are in range it draws an aim
// line, its sac swells and glows, it recoils and spits a glob straight at where you were. It keeps spitting.
// Answer: hold B to block (raise it as the glob lands to parry it back and burst the sac), roll through, or sidestep.
// States: idle -> charge -> idle (cooling) ...; dead. The glob flies on its own: o.orb
import { RW, OMEGA } from '../../config/constants.js';
import { TUNE } from '../../config/tuning.js';
import { GOLD } from '../../config/economy.js';
import { ST } from '../../core/state.js';
import { sfx } from '../../audio/sfx.js';
import { mbox, placeArc } from '../../render/primitives.js';
import { flatMat, glowMat, segment, spike, blob, joint } from '../../render/creature.js';
import { burst } from '../../render/particles.js';
import { float, hitstop, flash } from '../../fx/feedback.js';
import { topAt } from '../../world/path.js';
import { hurt, head, isBlocking, isParry, isInvulnerable, playerWorld, crownY, midY } from '../player/player.js';
import { loadModel, instance, pose, poseOnce } from '../../render/glbModel.js';
import { killed, addGold, onParry } from '../../run/run.js';
const THREE = window.THREE;
const T = TUNE.spitter, _v = new THREE.Vector3();
// the body from tools/blender/spitter.py; until it has loaded (or if it cannot), the built-in shapes stand in
export const SPITTER = loadModel('spitter', 'assets/models/spitter/spitter.glb');

export const hint = 'A spitter. Hold {block} to block its spit, or {roll}. Raise the shield just as it lands to parry it back.';

// +z faces out from the wall toward the shaft, +y up.
function model(glow){
  const shell = flatMat(0x241f2c, { rough: 0.6, metal: 0.15 }), legMat = flatMat(0x16121c, { rough: 0.7 });
  const sacMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(glow).multiplyScalar(0.35), emissive: new THREE.Color(glow).multiplyScalar(0.25), flatShading: true, roughness: 0.35 });
  const g = new THREE.Group();
  const back = blob(shell, 0.9, 0.75, 0.36); back.position.set(0, 0.12, -0.2); g.add(back);
  const sac = blob(sacMat, 0.72, 0.64, 0.6); sac.position.set(0, 0.1, 0.06); g.add(sac);
  for (let i = 0; i < 3; i++){ const v = mbox(0.04, 0.5, 0.03, shell, -0.2 + i * 0.2, 0.12, 0.36); v.rotation.z = (i - 1) * 0.4; g.add(v); }   // veins
  const headJ = joint(g, 0, -0.3, 0.24);
  headJ.add(blob(shell, 0.32, 0.24, 0.3));
  const eye = glowMat(glow);
  for (const x of [-0.08, 0, 0.08]) headJ.add(mbox(0.04, 0.04, 0.04, eye, x, 0.1, 0.13));
  const mouthMat = glowMat(glow); mouthMat.color.multiplyScalar(0.3);
  const mouth = mbox(0.14, 0.1, 0.05, mouthMat, 0, -0.04, 0.16); headJ.add(mouth);
  const lips = [];
  for (let i = 0; i < 5; i++){ const ang = i / 5 * Math.PI * 2, l = spike(shell, 0.12, 0.03); l.position.set(Math.cos(ang) * 0.1, -0.04 + Math.sin(ang) * 0.08, 0.14); l.rotation.x = Math.PI / 2; headJ.add(l); lips.push({ l, ang }); }
  const legs = [];
  for (let i = 0; i < 6; i++){
    const phi = (i + 0.5) / 6 * Math.PI * 2;
    const hip = joint(g, Math.cos(phi) * 0.28, 0.1 + Math.sin(phi) * 0.24, -0.08); hip.rotation.z = phi - Math.PI / 2;
    hip.add(segment(legMat, 0.44, 0.035, 0.026));
    const knee = joint(hip, 0, 0.44, 0); knee.rotation.x = -1.0; knee.add(segment(legMat, 0.42, 0.026, 0.01));
    legs.push({ hip, knee, phi });
  }
  g.scale.setScalar(1.3);
  return { g, sac, sacMat, headJ, mouth, mouthMat, lips, legs, mats: [shell] };
}

export function build(o, { glow, dyn }){
  const a = o.s * OMEGA, top = topAt(o.s);
  const M = model(glow); placeArc(M.g, a, RW - 0.4, top + 3.1); dyn.add(M.g);
  const orb = blob(glowMat(glow), 0.5, 0.5, 0.5, 0); orb.visible = false; dyn.add(orb);
  const aim = mbox(0.05, 0.05, 1, new THREE.MeshBasicMaterial({ color: glow, transparent: true, opacity: 0, depthWrite: false })); aim.visible = false; dyn.add(aim);
  o.M = M; o.m = M.g; o.orbM = orb; o.glow = glow; o.aim = aim; o.home = M.g.position.clone(); o.top = top;
}
const mouthWorld = o => o.B ? o.B.mouth.getWorldPosition(new THREE.Vector3()) : o.M.headJ.localToWorld(_v.set(0, -0.04, 0.25)).clone();
const sacWorld = o => (o.B ? o.B.sacNode : o.M.sac).getWorldPosition(new THREE.Vector3());

export function update(o, dt){
  const G = ST.G, d = o.s - G.s;
  o.recoil = Math.max(0, (o.recoil || 0) - dt);
  if (o.orb) flyOrb(o, dt);
  if (!o.alive){ o.dead += dt; return; }
  o.cd = Math.max(0, (o.cd || 0) - dt);
  if (o.st === 'idle' && Math.abs(d) < T.range && o.cd <= 0 && !o.orb){ o.st = 'charge'; o.tm = 0; }
  if (o.st === 'charge'){
    o.tm += dt;
    if (o.tm >= T.charge){
      // aim is locked here: the glob flies straight at where his head was
      const from = mouthWorld(o), to = head(1.2), v = to.clone().sub(from).normalize().multiplyScalar(T.speed);
      o.orb = { p: from, v, t: 0 }; o.st = 'idle'; o.cd = T.cooldown; o.recoil = 0.18; o.fired = true; sfx.spit();
    }
  }
  if (!o.done && o.fired && Math.abs(d) > 6) o.done = true;
}
const _q = new THREE.Vector3();
function flyOrb(o, dt){
  const G = ST.G, O = o.orb;
  O.t += dt;
  if (O.back){
    if (O.t >= T.reflect){
      o.orb = null;
      if (o.alive){ o.alive = false; o.dead = 0; o.done = true; const sp = sacWorld(o); burst(sp, 24, o.glow, 4.5); killed('spitter', sp.clone()); const gg = addGold(GOLD.spitterParry); float('+' + gg, sp, '#e8b04a'); sfx.hit(); }
    }
    return;
  }
  O.p.addScaledVector(O.v, dt);
  if (Math.random() < 0.7) burst(O.p, 1, o.glow, 0.5, 3, 0.09);
  // does it meet him: the nearest point of his body, feet to crown
  const pw = playerWorld(); _q.set(pw.x, Math.max(G.y + 0.3, Math.min(crownY(G), O.p.y)), pw.z);
  if (O.p.distanceTo(_q) < 0.5){
    if (isBlocking(G)){
      if (isParry(G)){ onParry(G, head(1.6)); o.orb = { back: true, t: 0, from: O.p.clone() }; sfx.parry(); flash(-0.25); hitstop(TUNE.feel.hitstopParry); float('Parry!', head(), '#9fd0ff'); burst(head(1.2), 14, '#9fd0ff', 3); return; }
      sfx.block(); float('Blocked', head(), '#c9d2e0'); burst(O.p, 8, o.glow, 2); o.orb = null; return;
    }
    if (!isInvulnerable(G)){ hurt(1, 'Hit', o.s); burst(O.p, 10, o.glow, 2.5); o.orb = null; return; }
  }
  if (O.t > T.life){ burst(O.p, 6, o.glow, 1.5); o.orb = null; }
}
// seconds until the glob reaches him, for the timing ring
export function orbEta(o){ if (!o.orb || o.orb.back) return null; const pw = playerWorld(); pw.y = midY(ST.G); return o.orb.p.distanceTo(pw) / T.speed; }

export function draw(o, dt){
  const G = ST.G, t = ST.time, M = o.M;
  if (!G || (Math.abs(o.s - G.s) > 9 && !o.orb)){ o.orbM.visible = false; o.aim.visible = false; return; }
  if (SPITTER.ready) drawModel(o, dt);
  if (!o.alive){
    // the sac is gone; what is left lets go of the wall and drops into the shaft
    if (!o.B) M.sac.visible = false;
    o.aim.visible = false;
    if (o.orb && o.orb.back){ o.orbM.visible = true; } else o.orbM.visible = false;
    if (o.dead > 1.4){ M.g.visible = false; return; }
    M.g.position.set(o.home.x * (1 - o.dead * 0.12), o.home.y - o.dead * o.dead * 6, o.home.z * (1 - o.dead * 0.12));
    M.g.rotation.x += 0.12;
    if (!o.B) for (const L of M.legs) L.knee.rotation.x = -0.2;
    return;
  }
  if (o.B){ M.g.position.copy(o.home); M.g.position.y += ((o.recoil || 0) / 0.18) * 0.12; aimAndOrb(o, G, t, M); return; }
  const ch = o.st === 'charge' ? o.tm / T.charge : 0, pulse = Math.sin(t * (6 + ch * 30));
  M.sac.scale.set(0.72 * (1 + ch * 0.38 + pulse * 0.02), 0.64 * (1 + ch * 0.32 + pulse * 0.02), 0.6 * (1 + ch * 0.45));
  M.sacMat.emissive.setHex(o.glow).multiplyScalar(0.25 + ch * 0.75);
  M.mouthMat.color.setHex(o.glow).multiplyScalar(0.3 + ch * 0.7);
  M.mouth.scale.set(1 + ch * 0.8, 1 + ch * 1.6, 1);
  for (const lp of M.lips) lp.l.position.set(Math.cos(lp.ang) * (0.1 + ch * 0.05), -0.04 + Math.sin(lp.ang) * (0.08 + ch * 0.04), 0.14);
  M.headJ.rotation.x = -ch * 0.4;
  for (const L of M.legs) L.knee.rotation.x = -1.0 - ch * 0.35 + Math.sin(t * 3 + L.phi) * 0.05;
  // recoil off the wall as it spits
  const rc = (o.recoil || 0) / 0.18;
  M.g.position.copy(o.home); M.g.position.y += rc * 0.12;
  aimAndOrb(o, G, t, M);
}
function aimAndOrb(o, G, t, M){
  const ch = o.st === 'charge' ? o.tm / T.charge : 0;
  if (o.st === 'charge' && G){
    const from = mouthWorld(o), to = head(1.2);
    o.aim.visible = true; o.aim.position.lerpVectors(from, to, 0.5); o.aim.lookAt(to); o.aim.scale.z = from.distanceTo(to);
    o.aim.material.opacity = 0.15 + ch * 0.6;
  } else o.aim.visible = false;
  if (o.orb){
    o.orbM.visible = true;
    if (o.orb.back){ const q = Math.min(1, o.orb.t / T.reflect); o.orbM.position.lerpVectors(o.orb.from, sacWorld(o), q); o.orbM.material.color.setHex(0x9fd0ff); }
    else { o.orbM.position.copy(o.orb.p); o.orbM.material.color.setHex(o.glow); }
    o.orbM.rotation.y += 0.3; o.orbM.scale.setScalar(1 + 0.15 * Math.sin(t * 30));
  } else o.orbM.visible = false;
}

// The modelled body: clinging and breathing; swelling, lifting its head and opening its mouth as it charges (the sac
// brightening); clenching as it spits; collapsing and letting go when it dies.
function drawModel(o, dt){
  const M = o.M, t = ST.time;
  if (!o.B){
    o.B = instance(SPITTER, 1 / 1.3, 'spitter_sac');
    o.B.model.traverse(n => { if (n.name === 'mouth') o.B.mouth = n; if (n.name === 'sac') o.B.sacNode = n; if (n.isMesh && n.material && /spitter_(eye|maw)/.test(n.material.name)) (o.B.lights = o.B.lights || []).push(n.material); });
    for (const c of M.g.children) c.visible = false;
    M.g.add(o.B.g); o.B.sacMat = o.B.glow;
    for (const m of o.B.lights || []){ m.color.setHex(o.glow).multiplyScalar(0.4); m.emissive.setHex(o.glow); }
  }
  const B = o.B, ch = o.st === 'charge' ? o.tm / T.charge : 0;
  let clip = 'Cling', frac = t / 2, once = false;
  if (!o.alive){ clip = 'Death'; frac = o.dead / 0.6; once = true; }
  else if (o.recoil > 0){ clip = 'Spit'; frac = 1 - o.recoil / 0.18; once = true; }
  else if (o.st === 'charge'){ clip = 'Charge'; frac = ch; once = true; }
  (once ? poseOnce : pose)(B, clip, frac, dt, 20);
  if (B.sacMat){ B.sacMat.color.setHex(o.glow).multiplyScalar(0.35); B.sacMat.emissive.setHex(o.glow); B.sacMat.emissiveIntensity = 0.3 + ch * 0.9 + Math.sin(t * (6 + ch * 30)) * 0.04 * (1 + ch * 4); }
  for (const m of B.lights || []) m.emissiveIntensity = 0.8 + ch * 1.2;
}
export function hud(o, d, { drawIcon, drawTiming }){
  const eta = orbEta(o);
  if (eta != null && eta < 0.5) drawTiming('{block}', 0.5 - eta, 0.5);
  if (o.alive && o.st === 'charge') drawIcon(o.M.g.position.clone().setY(o.M.g.position.y + 1.1), '!', '#ff6b5a');
}
