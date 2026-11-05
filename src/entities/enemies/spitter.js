// Spitter: a swollen sac on spindly legs, gripping the wall above the stair. It draws an aim line while its sac swells
// and glows, recoils as it spits, and the glob arcs at you. Answer: B to block; a parry reflects the glob and bursts it.
// States: idle -> charge -> fired -> spent | reflect -> dead
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
import { hurt, head } from '../player/player.js';
const THREE = window.THREE;
const T = TUNE.spitter, _v = new THREE.Vector3();

export const hint = 'A spitter. Tap B to block its spit. Tap B right as it lands to parry it back.';

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
const mouthWorld = o => o.M.headJ.localToWorld(_v.set(0, -0.04, 0.25)).clone();

export function update(o, dt){
  const G = ST.G, d = o.s - G.s;
  if (!o.alive){ o.dead += dt; return; }
  if (o.st === 'idle' && d < T.range){ o.st = 'charge'; o.tm = 0; }
  if (o.st === 'charge'){ o.tm += dt; if (o.tm >= T.charge){ o.st = 'fired'; o.tm = 0; o.orb = { t: 0, dur: T.flight }; o.recoil = 0.18; sfx.spit(); } }
  if (o.st === 'fired'){ o.orb.t += dt; if (o.orb.t >= o.orb.dur) resolveOrb(o); }
  if (o.st === 'reflect'){
    o.orb.t += dt;
    if (o.orb.t >= o.orb.dur){
      o.alive = false; o.dead = 0; o.done = true; o.orb = null;
      const sp = o.M.sac.getWorldPosition(new THREE.Vector3()); burst(sp, 24, o.glow, 4.5); G.gold += GOLD.spitterParry; float('+' + GOLD.spitterParry, sp, '#e8b04a'); sfx.hit();
    }
  }
  o.recoil = Math.max(0, (o.recoil || 0) - dt);
}
function resolveOrb(o){
  const G = ST.G, since = ST.time - G.lastBlock;
  if (G.block > 0 && since <= TUNE.player.parryWindow){
    o.st = 'reflect'; o.orb = { t: 0, dur: T.reflect, back: true, from: head(1.2) };
    sfx.parry(); flash(-0.25); hitstop(TUNE.feel.hitstopParry); float('Parry!', head(), '#9fd0ff'); burst(head(1.2), 14, '#9fd0ff', 3);
  } else if (G.block > 0){
    o.st = 'spent'; o.orb = null; o.done = true; sfx.block(); float('Blocked', head(), '#c9d2e0'); burst(head(1.2), 8, o.glow, 2);
  } else { o.st = 'spent'; o.orb = null; o.done = true; hurt(1, 'Hit'); burst(head(1.2), 10, o.glow, 2.5); }
}

export function draw(o, dt){
  const G = ST.G, t = ST.time, M = o.M;
  if (!G || Math.abs(o.s - G.s) > 9){ o.orbM.visible = false; o.aim.visible = false; return; }
  if (!o.alive){
    // the sac is gone; what is left lets go of the wall and drops into the shaft
    M.sac.visible = false; o.orbM.visible = false; o.aim.visible = false;
    if (o.dead > 1.4){ M.g.visible = false; return; }
    M.g.position.set(o.home.x * (1 - o.dead * 0.12), o.home.y - o.dead * o.dead * 6, o.home.z * (1 - o.dead * 0.12));
    M.g.rotation.x += 0.12;
    for (const L of M.legs) L.knee.rotation.x = -0.2;
    return;
  }
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
  if (o.st === 'charge' && G){
    const from = mouthWorld(o), to = head(1.2);
    o.aim.visible = true; o.aim.position.lerpVectors(from, to, 0.5); o.aim.lookAt(to); o.aim.scale.z = from.distanceTo(to);
    o.aim.material.opacity = 0.15 + ch * 0.6;
  } else o.aim.visible = false;
  if (o.orb){
    o.orbM.visible = true;
    const q = o.orb.t / o.orb.dur;
    let from, to;
    if (o.orb.back){ from = o.orb.from; to = M.sac.getWorldPosition(new THREE.Vector3()); } else { from = mouthWorld(o); to = head(1.2); }
    o.orbM.position.lerpVectors(from, to, q); o.orbM.position.y += Math.sin(q * Math.PI) * 0.7;
    o.orbM.material.color.setHex(o.orb.back ? 0x9fd0ff : o.glow);
    o.orbM.rotation.y += 0.3; o.orbM.scale.setScalar(1 + 0.15 * Math.sin(t * 30));
    if (Math.random() < 0.7) burst(o.orbM.position, 1, o.orb.back ? '#9fd0ff' : o.glow, 0.5, 3, 0.09);
  } else o.orbM.visible = false;
}

export function hud(o, d, { drawIcon, drawTiming }){
  if (o.orb && !o.orb.back) drawTiming('B', o.orb.t, o.orb.dur);
  if (o.alive && o.st === 'charge') drawIcon(o.M.g.position.clone().setY(o.M.g.position.y + 1.1), '!', '#ff6b5a');
}
