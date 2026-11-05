// How the running fight looks. The body looms in the cavern behind the wall, keeping pace. Each attack cracks the wall
// at the anchor, then an arm (swipe, slam) or the head (spit) bursts through a breach into the lane. Breaches stay as
// scars. Danger markers: a red band at head height for the swipe, a red strip and rolling shockwave for the slam,
// an aim line for the spit. The stuck arm or head glows during the opening.
import { R, RW, OMEGA } from '../config/constants.js';
import { TUNE } from '../config/tuning.js';
import { ZONES } from '../zones/index.js';
import { clamp, yawFor } from '../core/math.js';
import { ST } from '../core/state.js';
import { scene } from '../render/renderer.js';
import { rock, rockMaterial } from '../render/rocks.js';
import { lam, bas, mbox, placeArc, vArc } from '../render/primitives.js';
import { burst } from '../render/particles.js';
import { posOf } from '../world/path.js';
import { head } from '../entities/player/player.js';
import { makeWarden, makeWardenArm, makeWardenHead, WARDEN } from './model.js';
const THREE = window.THREE;

// Faces the shaft centre from angle a (the body behind the wall, the arm coming through it).
const faceIn = (obj, a) => { obj.rotation.set(0, yawFor(a) + Math.PI * 1.5, 0); };

// ---- shared markers
const waves = [0, 1, 2].map(() => { const m = mbox(0.4, 0.8, 2.4, lam(0x8a84a0)); m.visible = false; scene.add(m); return m; });
const bossOrb = mbox(0.7, 0.7, 0.7, new THREE.MeshBasicMaterial({ color: 0xa07cff })); bossOrb.visible = false; scene.add(bossOrb);
const slamMat = new THREE.MeshBasicMaterial({ color: 0xff3b2a, transparent: true, opacity: 0, depthWrite: false });
const sweepMat = new THREE.MeshBasicMaterial({ color: 0xff3b2a, transparent: true, opacity: 0, depthWrite: false });
const aimMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false });
const slamStrip = [...Array(9)].map(() => { const m = mbox(0.5, 0.05, 2.6, slamMat); m.visible = false; scene.add(m); return m; });
const sweepBand = [...Array(9)].map(() => { const m = mbox(0.5, 0.55, 0.06, sweepMat); m.visible = false; scene.add(m); return m; });
const bossAim = mbox(0.07, 0.07, 1, aimMat); bossAim.visible = false; scene.add(bossAim);

// ---- per-fight scene: the body, a pool of breaches, the arm, the head
let V = null;
const SCARS = 6;
export function buildWardenScene(B){
  destroyWardenScene();
  const zz = ZONES[B.z], glow = new THREE.Color(zz.glow).getHex();
  const root = new THREE.Group(); scene.add(root);
  const body = makeWarden(B.z); body.G.scale.setScalar(1.7); root.add(body.G);
  const stone = rockMaterial(new THREE.Color(zz.stone).multiplyScalar(1.05).getHex());
  const dark = rockMaterial(new THREE.Color(zz.stone).multiplyScalar(0.45).getHex());
  const hi = rockMaterial(new THREE.Color(zz.top).multiplyScalar(1.3).getHex(), { rough: 0.8 });
  const crackMat = new THREE.MeshBasicMaterial({ color: glow, transparent: true, opacity: 0.6 });
  const holeMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(zz.bg).multiplyScalar(0.6).getHex() });
  // breaches: a dark hole in the wall ringed with glowing cracks and rubble
  const breaches = [];
  for (let i = 0; i < SCARS; i++){
    const g = new THREE.Group();
    const hole = mbox(0.3, 2.8, 3.2, holeMat, 0, 0, 0); g.add(hole);
    const cracks = new THREE.Group();
    for (let j = 0; j < 8; j++){
      const ang = j / 8 * Math.PI * 2, c = mbox(0.12, 0.9, 0.12, crackMat, -0.05, Math.sin(ang) * 1.5, Math.cos(ang) * 1.7); c.rotation.x = ang + 0.5; cracks.add(c);
    }
    g.add(cracks);
    const rubble = new THREE.Group();
    for (let j = 0; j < 9; j++){ const ang = j / 9 * Math.PI * 2; rubble.add(rock(j % 2 ? dark : stone, { w: 0.5 + (j % 3) * 0.15, h: 0.45, d: 0.6, jag: 0.4, seed: 90 + j + i * 11 }, 0.1, Math.sin(ang) * 1.5, Math.cos(ang) * 1.75)); }
    g.add(rubble);
    g.visible = false; root.add(g); breaches.push({ g, hole, cracks, rubble });
  }
  // the arm and the head that come through the wall, built from the same rock kit as the body
  const A = makeWardenArm(B.z), arm = A.g, fore = A.fore; arm.visible = false; root.add(arm);
  const Hd = makeWardenHead(B.z), headG = Hd.g, mouth = Hd.mouth, mouthMat = Hd.mouthMat; headG.visible = false; root.add(headG);
  const lamp = new THREE.PointLight(glow, 0, 9, 2); root.add(lamp);
  V = { root, body, breaches, arm, fore, headG, mouth, mouthMat, glowMat: A.glowMat, headGlow: Hd.glowMat, crackMat, lamp, glow, mats: [stone, dark, hi, ...body.mats, ...A.mats, ...Hd.mats], breachAt: new Map() };
}
export function destroyWardenScene(){
  if (!V) return;
  scene.remove(V.root); V = null;
  hideWardenFx();
}
export function hideWardenFx(){
  bossOrb.visible = false; waves.forEach(w => w.visible = false); slamStrip.forEach(m => m.visible = false); sweepBand.forEach(m => m.visible = false); bossAim.visible = false;
}

// The breach for this attack: one per anchor, reused in order so old ones stay as scars.
function breachFor(B, h){
  let br = V.breachAt.get(B.scars);
  if (!br){ br = V.breaches[B.scars % SCARS]; V.breachAt.set(B.scars, br); placeArc(br.g, B.a, RW - 0.1, B.y + h); faceIn(br.g, B.a); br.g.visible = true; }
  return br;
}

export function animateWarden(){
  const B = ST.B, G = ST.G, time = ST.time;
  if (!B || !V){ hideWardenFx(); return; }
  const p = posOf(G.s), pa = p.a;
  const W = TUNE.warden;
  // ---- the body behind the wall keeps pace, a little ahead, its head about level with you
  const bodyA = pa + 0.32 + Math.sin(time * 0.6) * 0.04, bodyR = RW + 3.6;
  const dying = B.st === 'dying' ? B.tm / W.dying : 0;
  V.body.G.position.set(bodyR * Math.cos(bodyA), p.y - 4.2 - dying * 6 + Math.sin(time * 1.3) * 0.08, bodyR * Math.sin(bodyA));
  faceIn(V.body.G, bodyA);
  const M = V.body, tilt = WARDEN.spineTilt, stride = Math.sin(time * 2.4);
  M.spine.rotation.z = -tilt - 0.1 + (B.st === 'tele' && B.atk === 'slam' ? 0.5 * Math.min(1, B.tm / B.T) : 0) - (B.st === 'opening' ? 0.35 : 0);
  M.spine.rotation.y = (B.st === 'tele' && B.atk === 'sweep' ? -0.5 * Math.min(1, B.tm / B.T) : 0) + (dying ? Math.sin(time * 20) * 0.1 : 0);
  M.legs[0].hip.rotation.z = WARDEN.hipBend + stride * 0.25; M.legs[1].hip.rotation.z = WARDEN.hipBend - stride * 0.25;
  const rest = tilt + 0.2, reach = B.st === 'tele' || B.st === 'strike' || B.st === 'opening' ? 1 : 0;
  M.armF.shoulder.rotation.z = rest + (B.atk === 'slam' && B.st === 'tele' ? 2.6 * Math.min(1, B.tm / B.T) : reach * 1.3) - stride * 0.1;
  M.armB.shoulder.rotation.z = rest + (B.atk === 'slam' && B.st === 'tele' ? 2.6 * Math.min(1, B.tm / B.T) : 0) + stride * 0.1;
  M.neck.rotation.z = tilt - 0.2 - (B.atk === 'spit' && B.st !== 'idle' ? 0.5 : 0);
  M.eyeLight.intensity = 1.2 + (B.st === 'tele' ? 1.5 : 0);
  for (const m of V.mats) m.emissive.setHex(B.flash > 0 ? 0xffffff : 0x000000);
  // ---- the breach, the arm, the head
  const inLane = B.st !== 'idle' && B.st !== 'intro' && B.st !== 'dying';
  const wStart = B.phase === 1 ? 0 : Math.max(0, B.T - W.lateWarn);
  const warn = B.st === 'tele' && B.tm >= wStart ? clamp((B.tm - wStart) / Math.max(0.01, B.T - wStart), 0, 1) : 0;
  const pulse = 0.75 + 0.25 * Math.sin(time * 22);
  const isSpit = B.atk === 'spit', isSlam = B.atk === 'slam';
  const breachH = isSpit ? 3.6 : isSlam ? 2.9 : 1.9;
  V.arm.visible = false; V.headG.visible = false; V.lamp.intensity = 0;
  if (inLane){
    const br = breachFor(B, breachH);
    const showCrack = B.st === 'tele' ? (B.phase === 1 || B.tm >= wStart) : true;
    br.cracks.visible = showCrack; V.crackMat.opacity = B.st === 'tele' ? (0.3 + 0.7 * warn) * pulse : 0.35;
    const open = B.st === 'tele' ? (B.slammed ? 1 : 0) : 1;             // the hole opens when it bursts through
    br.hole.scale.set(1, 0.2 + 0.8 * open, 0.2 + 0.8 * open); br.rubble.visible = open > 0;
    if (open){
      const emerge = B.st === 'tele' ? clamp((B.tm - (B.T - 0.3)) / 0.25, 0, 1) : B.st === 'withdraw' ? 1 - clamp(B.tm / W.withdraw, 0, 1) : 1;
      V.lamp.position.copy(vArc(B.a, RW - 1.5, B.y + breachH)); V.lamp.color.setHex(V.glow); V.lamp.intensity = 0.8 + (B.st === 'opening' ? 1.6 * pulse : 0.4);
      const gl = B.st === 'opening' ? 0.7 + 0.3 * Math.sin(time * 18) : 0.6; V.glowMat.color.setHex(V.glow).multiplyScalar(gl); V.headGlow.color.setHex(V.glow).multiplyScalar(gl);
      if (isSpit){
        V.headG.visible = true; placeArc(V.headG, B.a, RW - 0.2 - emerge * 1.2, B.y + breachH - 0.6); faceIn(V.headG, B.a);
        const mq = B.st === 'tele' ? warn : B.st === 'orb' ? 1 : 0.3;
        V.mouthMat.color.setHex(V.glow).multiplyScalar(0.2 + mq * 0.8); V.mouth.scale.set(1, 1 + mq * 2, 1 + mq * 0.4);
        V.headG.rotation.z += B.st === 'opening' ? -0.35 : 0;          // slumps, exposed
      } else {
        V.arm.visible = true; placeArc(V.arm, B.a, RW + 0.4 - emerge * 0.2, B.y + breachH); faceIn(V.arm, B.a);
        V.fore.scale.set(0.15 + 0.85 * emerge, 1, 1);
        if (isSlam){
          // the fist comes down onto the stair and rests there
          const down = B.st === 'tele' ? 0.1 : 1;
          V.arm.rotation.z += -0.95 * down - (B.st === 'opening' ? Math.sin(time * 30) * 0.015 : 0);
        } else {
          // the swipe: the arm sweeps across the stair, then hangs stuck
          const q = B.st === 'tele' ? -0.65 : B.st === 'strike' ? -0.65 + 1.5 * clamp(B.tm / W.strike, 0, 1) : 0.85;
          V.arm.rotation.y += q; V.arm.rotation.z += -0.15 + (B.st === 'opening' ? -0.25 + Math.sin(time * 30) * 0.015 : 0);
        }
      }
      if (B.st === 'tele' && Math.random() < 0.5) burst(vArc(B.a, RW - 0.6, B.y + breachH + (Math.random() - 0.5) * 2), 1, ZONES[B.z].wall, 1.5, 7, 0.1);
    }
  }
  // ---- danger markers: where the hit will land. Phase 2 only shows them in the last moment.
  const a0 = B.a, a1 = pa - 0.06;
  slamStrip.forEach((m, i) => { const on = warn > 0 && isSlam; m.visible = on; if (on) placeArc(m, a0 + (a1 - a0) * (i + 0.5) / slamStrip.length, R - 0.3, posOf(G.s + (B.s - G.s) * (1 - (i + 0.5) / slamStrip.length)).y + 0.04); });
  slamMat.opacity = isSlam ? (0.12 + 0.5 * warn) * pulse : 0;
  sweepBand.forEach((m, i) => { const on = warn > 0 && B.atk === 'sweep'; m.visible = on; if (on) placeArc(m, a0 + (a1 - a0) * (i + 0.5) / sweepBand.length, R - 1.2, posOf(G.s + (B.s - G.s) * (1 - (i + 0.5) / sweepBand.length)).y + 2.05); });
  sweepMat.opacity = B.atk === 'sweep' ? (0.12 + 0.45 * warn) * pulse : 0;
  if (warn > 0 && isSpit){
    const from = vArc(B.a, RW - 1.4, B.y + breachH - 0.4), to = head(1.2);
    bossAim.visible = true; bossAim.position.lerpVectors(from, to, 0.5); bossAim.lookAt(to); bossAim.scale.z = from.distanceTo(to);
    aimMat.color.setHex(V.glow); aimMat.opacity = (0.15 + 0.55 * warn) * pulse;
  } else bossAim.visible = false;
  // shockwave rolling down the stair from the fist to the warrior
  if (B.st === 'tele' && isSlam && B.slammed){
    const q = clamp((B.tm - (B.T - 0.3)) / 0.3, 0, 1);
    waves.forEach((w, i) => { const t = clamp(q - i * 0.12, 0, 1), s = B.s + (G.s - B.s) * t; w.visible = q - i * 0.12 > 0; placeArc(w, s * OMEGA, R - 0.3, posOf(s).y + 0.5 - i * 0.1); w.scale.set(1.3, 1.4 - i * 0.3, 1.2); if (Math.random() < 0.5) burst(w.position, 1, '#8a84a0', 2, 8, 0.12); });
  } else waves.forEach(w => w.visible = false);
  if (B.orb){
    bossOrb.visible = true;
    const q = B.orb.t / B.orb.dur, mouthP = vArc(B.a, RW - 1.5, B.y + breachH - 0.4), hp = head(1.2);
    if (B.orb.back) bossOrb.position.lerpVectors(hp, mouthP, q);
    else { bossOrb.position.lerpVectors(mouthP, hp, q); bossOrb.position.y += Math.sin(q * Math.PI) * 0.8; }
    bossOrb.material.color.setHex(B.orb.back ? 0x9fd0ff : V.glow); bossOrb.rotation.y += 0.3;
  } else bossOrb.visible = false;
}
