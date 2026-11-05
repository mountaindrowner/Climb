// Warden pose, danger markers (floor strip, head-height band, aim line), the rolling shockwave and the spit orb.
import { R } from '../config/constants.js';
import { TUNE } from '../config/tuning.js';
import { clamp } from '../core/math.js';
import { ST } from '../core/state.js';
import { scene } from '../render/renderer.js';
import { lam, mbox, placeArc, vArc } from '../render/primitives.js';
import { burst } from '../render/particles.js';
import { posOf } from '../world/path.js';
import { head } from '../entities/player/player.js';
import { WARDEN } from './model.js';
const THREE = window.THREE;

const waves = [0, 1, 2].map(() => { const m = mbox(0.4, 0.8, 2.4, lam(0x8a84a0)); m.visible = false; scene.add(m); return m; });
const bossOrb = mbox(0.7, 0.7, 0.7, new THREE.MeshBasicMaterial({ color: 0xa07cff })); bossOrb.visible = false; scene.add(bossOrb);
const slamMat = new THREE.MeshBasicMaterial({ color: 0xff3b2a, transparent: true, opacity: 0, depthWrite: false });
const sweepMat = new THREE.MeshBasicMaterial({ color: 0xff3b2a, transparent: true, opacity: 0, depthWrite: false });
const aimMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false });
const slamStrip = [...Array(9)].map(() => { const m = mbox(0.5, 0.05, 2.6, slamMat); m.visible = false; scene.add(m); return m; });
const sweepBand = [...Array(9)].map(() => { const m = mbox(0.5, 0.55, 0.06, sweepMat); m.visible = false; scene.add(m); return m; });
const bossAim = mbox(0.07, 0.07, 1, aimMat); bossAim.visible = false; scene.add(bossAim);

export function hideWardenFx(){
  bossOrb.visible = false; waves.forEach(w => w.visible = false); slamStrip.forEach(m => m.visible = false); sweepBand.forEach(m => m.visible = false); bossAim.visible = false;
}

export function animateWarden(){
  const B = ST.B, G = ST.G, time = ST.time;
  if (!B || !B.model){ hideWardenFx(); return; }
  const M = B.model;
  let kneel = 0, raise = 0, pull = 0, mouth = 0, slammed = false, sweeping = 0;
  if (B.st === 'stagger') kneel = Math.min(1, B.tm / 0.15);
  if (B.st === 'tele'){
    const q = B.tm / B.T;
    if (B.atk === 'slam'){ if (B.tm < B.T - 0.3) raise = Math.min(1, q * 1.4); else slammed = true; }
    if (B.atk === 'sweep'){ if (B.tm < B.T - 0.22) pull = Math.min(1, q * 1.3); else sweeping = (B.tm - (B.T - 0.22)) / 0.22; }
    if (B.atk === 'spit') mouth = q;
  }
  if (B.st === 'strike' && B.atk === 'sweep') sweeping = 1;
  if (B.st === 'strike' && B.atk === 'slam') slammed = true;
  const dying = B.st === 'dying' ? B.tm / TUNE.warden.dying : 0;
  placeArc(M.G, B.a, B.r, B.y - dying * 2.5 + Math.sin(time * 2) * 0.04, true);
  M.G.rotation.y += 0.85;
  M.G.position.x += dying ? (Math.random() - 0.5) * 0.15 : 0;
  for (const m of M.mats) m.emissive.setHex(B.flash > 0 ? 0xffffff : 0x000000);
  const breath = Math.sin(time * 1.6) * 0.02;
  // ---- the body: a hunch that deepens into the kneel, straightens for the slam, twists for the sweep
  const tilt = WARDEN.spineTilt;
  M.spine.rotation.z = -tilt + breath - kneel * 0.3 + raise * 0.5 - (slammed ? 0.35 : 0);
  M.spine.rotation.y = -pull * 0.5 + (sweeping > 0 ? 0.5 * sweeping : 0);
  M.spine.position.y = WARDEN.hipY + 0.2 - kneel * 0.5;
  for (const L of M.legs){ L.hip.rotation.z = WARDEN.hipBend + kneel * 0.5 - raise * 0.3; L.knee.rotation.z = WARDEN.kneeBend - kneel * 0.6 + raise * 0.4; }
  M.G.position.y -= kneel * 0.25;
  M.neck.rotation.z = tilt - 0.2 + kneel * 0.5 - raise * 0.3 - mouth * 0.15;
  M.head.rotation.z = -kneel * 0.3 + mouth * 0.25;
  M.coreMat.color.setHex(M.glow).multiplyScalar(B.st === 'stagger' ? 0.7 + 0.3 * Math.sin(time * 18) : 0.4);
  M.mouthMat.color.setHex(M.glow).multiplyScalar(0.2 + mouth * 0.8); M.mouth.scale.set(1, 1 + mouth * 2.2, 1 + mouth * 0.5);
  const heat = Math.max(raise, pull, mouth, B.st === 'stagger' ? 1 : 0.3);
  M.crackMat.color.setHex(M.glow).multiplyScalar(0.5 + 0.5 * heat);
  M.glowMat.color.setHex(M.glow).multiplyScalar(0.55 + 0.45 * heat);
  M.eyeLight.intensity = 1.2 + 1.4 * heat;
  // ---- arms: rest on the knuckles; rise overhead for the slam; the front arm pulls back then sweeps across
  const rest = tilt + 0.2;
  const setArm = (A, sh, el, twist, stretch) => { A.shoulder.rotation.z = sh; A.shoulder.rotation.x = (A === M.armF ? 1 : -1) * WARDEN.armSplay + (twist || 0); A.elbow.rotation.z = el; A.arm.scale.set(1, stretch || 1, 1); };
  if (slammed){ setArm(M.armF, rest + 1.1, -0.2, 0); setArm(M.armB, rest + 1.0, -0.2, 0); }
  else if (sweeping > 0){ setArm(M.armF, rest + 0.9, 0.1, -1.1 + sweeping * 2.2, 1 + sweeping * 0.4); setArm(M.armB, rest - 0.2, 0.3, 0); }
  else {
    const r = raise * 2.9;
    setArm(M.armF, rest + r - pull * 1.6, 0.25 - raise * 0.2 + pull * 0.9, -pull * 1.1); setArm(M.armB, rest + r, 0.25 - raise * 0.2, 0);
    if (B.st === 'stagger'){ setArm(M.armF, rest + 0.5, 0.1, 0.2); setArm(M.armB, rest + 0.4, 0.1, -0.2); }
  }
  // danger markers: where the hit will land. Phase 2 only shows them in the last moment.
  const pa = posOf(G.s).a;
  const wStart = B.phase === 1 ? 0 : Math.max(0, B.T - TUNE.warden.lateWarn);
  const warn = B.st === 'tele' && B.tm >= wStart ? clamp((B.tm - wStart) / Math.max(0.01, B.T - wStart), 0, 1) : 0;
  const pulse = 0.75 + 0.25 * Math.sin(time * 22);
  const a0 = B.a - 0.2, a1 = pa - 0.06;
  slamStrip.forEach((m, i) => { const on = warn > 0 && B.atk === 'slam'; m.visible = on; if (on) placeArc(m, a0 + (a1 - a0) * (i + 0.5) / slamStrip.length, R - 0.3, B.y + 0.04); });
  slamMat.opacity = B.atk === 'slam' ? (0.12 + 0.5 * warn) * pulse : 0;
  sweepBand.forEach((m, i) => { const on = warn > 0 && B.atk === 'sweep'; m.visible = on; if (on) placeArc(m, a0 + (a1 - a0) * (i + 0.5) / sweepBand.length, R - 1.4, B.y + 2.05); });
  sweepMat.opacity = B.atk === 'sweep' ? (0.12 + 0.45 * warn) * pulse : 0;
  if (warn > 0 && B.atk === 'spit'){
    const from = vArc(B.a - 0.12, B.r, B.y + 4.9), to = head(1.2);
    bossAim.visible = true; bossAim.position.lerpVectors(from, to, 0.5); bossAim.lookAt(to); bossAim.scale.z = from.distanceTo(to);
    aimMat.color.setHex(M.glow); aimMat.opacity = (0.15 + 0.55 * warn) * pulse;
  } else bossAim.visible = false;
  // shockwave rolling from the Warden to the warrior
  if (B.st === 'tele' && B.atk === 'slam' && slammed){
    const q = clamp((B.tm - (B.T - 0.3)) / 0.3, 0, 1);
    waves.forEach((w, i) => { const a = a0 + (pa - a0) * clamp(q - i * 0.12, 0, 1); w.visible = q - i * 0.12 > 0; placeArc(w, a, R - 0.3, B.y + 0.5 - i * 0.1); w.scale.set(1.3, 1.4 - i * 0.3, 1.2); if (Math.random() < 0.5) burst(w.position, 1, '#8a84a0', 2, 8, 0.12); });
  } else waves.forEach(w => w.visible = false);
  if (B.orb){
    bossOrb.visible = true;
    const q = B.orb.t / B.orb.dur, mouthP = vArc(B.a - 0.12, B.r, B.y + 4.9), hp = head(1.2);
    if (B.orb.back) bossOrb.position.lerpVectors(hp, mouthP, q);
    else { bossOrb.position.lerpVectors(mouthP, hp, q); bossOrb.position.y += Math.sin(q * Math.PI) * 1.2; }
    bossOrb.material.color.setHex(B.orb.back ? 0x9fd0ff : M.glow); bossOrb.rotation.y += 0.3;
  } else bossOrb.visible = false;
}
