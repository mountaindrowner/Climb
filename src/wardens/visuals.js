// How the running fight looks. The wall is gone along the Warden's stretch, so the golem climbs the rubble beside the
// stair in the open and reaches across with its own arms: a swipe at head height, a fist slammed onto the steps, its
// head leaning in to spit. Arms are aimed with two-bone inverse kinematics and eased between poses, so nothing pops.
// Danger markers: a red band at head height for the swipe, a red strip and rolling shockwave for the slam, an aim line.
import { R, OMEGA } from '../config/constants.js';
import { TUNE } from '../config/tuning.js';
import { clamp, yawFor } from '../core/math.js';
import { ST } from '../core/state.js';
import { scene } from '../render/renderer.js';
import { lam, mbox, placeArc, vArc } from '../render/primitives.js';
import { burst } from '../render/particles.js';
import { posOf } from '../world/path.js';
import { CAVERN_R } from '../world/cavern.js';
import { head } from '../entities/player/player.js';
import { makeWarden, WARDEN } from './model.js';
const THREE = window.THREE;
const W = TUNE.warden;

// Faces the shaft centre from angle a.
const faceIn = (obj, a) => { obj.rotation.set(0, yawFor(a) + Math.PI * 1.5, 0); };

// ---- markers shared by every fight
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

// ---- two-bone IK: point an arm (shoulder joint, elbow joint) at a target given in the spine's local space
const DOWN = new THREE.Vector3(0, -1, 0), _d = new THREE.Vector3(), _n = new THREE.Vector3(), _u = new THREE.Vector3(), _e = new THREE.Vector3(), _f = new THREE.Vector3();
const _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _hint = new THREE.Vector3();
const L1 = WARDEN.upperArm, L2 = WARDEN.forearm + 0.35;
function aimArm(A, shoulderPos, target, hint){
  _d.subVectors(target, shoulderPos); let D = _d.length();
  const maxD = (L1 + L2) * 0.985; if (D > maxD){ _d.multiplyScalar(maxD / D); D = maxD; }
  if (D < 0.2){ _d.set(0, -0.2, 0); D = 0.2; }
  _d.multiplyScalar(1 / D);
  _n.crossVectors(_d, hint); if (_n.lengthSq() < 1e-4) _n.set(0, 0, 1); _n.normalize();
  const alpha = Math.acos(clamp((L1 * L1 + D * D - L2 * L2) / (2 * L1 * D), -1, 1));
  _u.copy(_d).applyAxisAngle(_n, alpha);                                  // upper arm direction
  _q.setFromUnitVectors(DOWN, _u); A.shoulder.quaternion.copy(_q);
  _e.copy(shoulderPos).addScaledVector(_u, L1);                           // elbow
  _f.copy(shoulderPos).addScaledVector(_d, D).sub(_e).normalize();        // forearm direction
  _q2.setFromUnitVectors(DOWN, _f); A.elbow.quaternion.copy(_q.invert().multiply(_q2));
  A.arm.scale.set(1, 1, 1);
}

// ---- per-fight scene
let V = null;
export function buildWardenScene(B){
  destroyWardenScene();
  const body = makeWarden(B.z); body.G.scale.setScalar(1.55);
  const root = new THREE.Group(); root.add(body.G); scene.add(root);
  const lamp = new THREE.PointLight(body.glow, 0, 12, 2); root.add(lamp);
  V = { root, body, lamp, mats: body.mats,
    // eased pose state
    ang: 0, y: 0, lean: 0, slowK: 0,
    tF: new THREE.Vector3(), tB: new THREE.Vector3(), fist: new THREE.Vector3(), mouth: new THREE.Vector3(), started: false };
}
export function destroyWardenScene(){
  if (!V) return;
  scene.remove(V.root); V = null;
  hideWardenFx();
}
// Where the thing you can hit is right now (the fist on or over the stair, or the head when it spits).
export function wardenHitPoint(){
  if (!V || !ST.B) return vArc(0, R, 0);
  return ST.B.atk === 'spit' ? V.mouth.clone() : V.fist.clone();
}

const _t = new THREE.Vector3(), _local = new THREE.Vector3(), _sh = new THREE.Vector3();
const ease = (cur, target, rate, dt) => cur + (target - cur) * Math.min(1, rate * dt);

export function animateWarden(dt){
  const B = ST.B, G = ST.G, time = ST.time;
  if (!B || !V){ hideWardenFx(); return; }
  const M = V.body, p = posOf(G.s), pa = p.a;
  const q = B.st === 'tele' ? clamp(B.tm / B.T, 0, 1) : 0;
  const isSlam = B.atk === 'slam', isSweep = B.atk === 'sweep', isSpit = B.atk === 'spit';
  const attacking = B.st === 'tele' || B.st === 'strike' || B.st === 'opening' || B.st === 'orb' || B.st === 'reflect';
  const dying = B.st === 'dying' ? clamp(B.tm / W.dying, 0, 1) : 0;
  // ---- the body: climbs the rubble beside the stair, a little ahead of you; during an attack it plants itself at the anchor
  const wantA = attacking ? B.a - 0.08 : pa + 0.3;
  const wantY = (attacking ? B.y : p.y) - 1.6 - dying * 7;
  if (!V.started){ V.ang = wantA; V.y = wantY - (B.st === 'intro' ? 9 : 0); V.started = true; }
  let dA = wantA - V.ang; dA = Math.atan2(Math.sin(dA), Math.cos(dA)); V.ang += dA * Math.min(1, dt * 2.5);
  V.y = ease(V.y, wantY, B.st === 'intro' ? 1.6 : 3, dt);
  const stride = Math.sin(time * 2.2);
  M.G.position.set(CAVERN_R * Math.cos(V.ang), V.y + Math.abs(stride) * 0.08, CAVERN_R * Math.sin(V.ang));
  faceIn(M.G, V.ang); M.G.rotation.y += -0.25 + (dying ? Math.sin(time * 25) * 0.08 : 0);
  // spine: breathes, hunches over the stair for the opening, rears back to raise the slam, twists for the swipe
  const wantLean = (B.st === 'opening' ? 0.35 : 0) + (isSlam && B.st === 'tele' ? -0.45 * q : 0) + (isSpit && B.st !== 'idle' && B.st !== 'withdraw' ? 0.25 : 0);
  V.lean = ease(V.lean, wantLean, 5, dt);
  M.spine.rotation.z = -WARDEN.spineTilt - V.lean + Math.sin(time * 1.6) * 0.02;
  M.spine.rotation.y = isSweep && B.st === 'tele' ? -0.45 * q : isSweep && (B.st === 'strike' || B.st === 'opening') ? 0.35 : 0;
  M.legs[0].hip.rotation.z = WARDEN.hipBend + stride * 0.22; M.legs[1].hip.rotation.z = WARDEN.hipBend - stride * 0.22;
  M.legs[0].knee.rotation.z = WARDEN.kneeBend - Math.max(0, stride) * 0.3; M.legs[1].knee.rotation.z = WARDEN.kneeBend - Math.max(0, -stride) * 0.3;
  M.neck.rotation.z = WARDEN.spineTilt - 0.2 + V.lean * 0.6 - (isSpit && attacking ? 0.4 : 0);
  M.head.rotation.y = -0.2;
  for (const m of V.mats) m.emissive.setHex(B.flash > 0 ? 0xffffff : 0x000000);
  const heat = B.st === 'tele' ? q : B.st === 'opening' ? 1 : 0.3;
  M.coreMat.color.setHex(M.glow).multiplyScalar(B.st === 'opening' ? 0.7 + 0.3 * Math.sin(time * 18) : 0.4 + 0.3 * heat);
  M.glowMat.color.setHex(M.glow).multiplyScalar(0.6 + 0.4 * heat);
  M.crackMat.color.setHex(M.glow).multiplyScalar(0.5 + 0.5 * heat);
  M.eyeLight.intensity = 1.4 + 1.6 * heat;
  const mouthQ = isSpit ? (B.st === 'tele' ? q : B.st === 'orb' ? 1 : B.st === 'opening' ? 0.5 : 0) : 0;
  M.mouthMat.color.setHex(M.glow).multiplyScalar(0.2 + mouthQ * 0.8); M.mouth.scale.set(1, 1 + mouthQ * 2.2, 1 + mouthQ * 0.4);
  // ---- arm targets in world space, eased so the motion reads
  M.G.updateMatrixWorld(true);
  const restF = M.spine.localToWorld(_t.set(1.7, -0.7, 1.5)).clone(), restB = M.spine.localToWorld(_t.set(1.7, -0.7, -1.5)).clone();
  let wantF = restF, wantB = restB, rateF = 4, rateB = 4;
  if (isSweep && attacking){
    if (B.st === 'tele'){ wantF = M.spine.localToWorld(_t.set(-1.2 - 1.2 * q, 1.4 + 1.2 * q, 2.4)).clone(); rateF = 5; }       // pulls back and up
    else { wantF = vArc(B.a, R - 0.4, B.y + 2.0); rateF = B.st === 'strike' ? 16 : 6; }                                      // sweeps across the stair, hangs there
  } else if (isSlam && attacking){
    const up = M.spine.localToWorld(_t.set(0.4, 5.2, -1.6)).clone(), upF = M.spine.localToWorld(_t.set(0.4, 5.2, 1.6)).clone();
    if (B.st === 'tele' && !B.slammed){ wantB = up; wantF = upF; rateB = rateF = 3 + 3 * q; }                                // both fists rise
    else { wantB = vArc(B.a, R, B.y + 0.45); rateB = 22; wantF = upF; rateF = 2; }                                           // the near fist hammers the step
  } else if (isSpit && attacking){
    wantF = M.spine.localToWorld(_t.set(2.2, 0.2, 1.3)).clone(); wantB = M.spine.localToWorld(_t.set(2.2, 0.2, -1.3)).clone(); // braces on the rubble
  }
  if (!V.started || V.tF.lengthSq() === 0){ V.tF.copy(wantF); V.tB.copy(wantB); }
  V.tF.lerp(wantF, Math.min(1, rateF * dt)); V.tB.lerp(wantB, Math.min(1, rateB * dt));
  M.spine.updateMatrixWorld(true);
  // elbows bulge up and back: a world-space hint brought into the spine's frame
  const hintLocal = _hint.set(-0.4, 1, 0).applyQuaternion(M.G.quaternion).applyQuaternion(M.spine.getWorldQuaternion(_q2).invert()).normalize();
  aimArm(M.armF, _sh.set(0.1, 2.75, WARDEN.shoulderZ), M.spine.worldToLocal(_local.copy(V.tF)), hintLocal);
  aimArm(M.armB, _sh.set(0.1, 2.75, -WARDEN.shoulderZ), M.spine.worldToLocal(_local.copy(V.tB)), hintLocal);
  V.fist.copy(isSlam ? V.tB : V.tF);
  M.head.getWorldPosition(V.mouth); V.mouth.y += 0.6;
  // lamp: the glow of whatever is nearest the stair
  V.lamp.position.copy(attacking ? V.fist : V.mouth); V.lamp.intensity = 0.6 + 1.6 * heat;
  if (B.st === 'opening' && Math.random() < 0.3) burst(V.fist, 1, M.glow, 0.6, 2, 0.08);
  // ---- danger markers: where the hit will land. Phase 2 only shows them in the last moment.
  const wStart = B.phase === 1 ? 0 : Math.max(0, B.T - W.lateWarn);
  const warn = B.st === 'tele' && B.tm >= wStart ? clamp((B.tm - wStart) / Math.max(0.01, B.T - wStart), 0, 1) : 0;
  const pulse = 0.75 + 0.25 * Math.sin(time * 22);
  const a0 = B.a, a1 = pa - 0.06;
  slamStrip.forEach((m, i) => { const on = warn > 0 && isSlam; m.visible = on; if (on) placeArc(m, a0 + (a1 - a0) * (i + 0.5) / slamStrip.length, R - 0.3, posOf(G.s + (B.s - G.s) * (1 - (i + 0.5) / slamStrip.length)).y + 0.04); });
  slamMat.opacity = isSlam ? (0.12 + 0.5 * warn) * pulse : 0;
  sweepBand.forEach((m, i) => { const on = warn > 0 && isSweep; m.visible = on; if (on) placeArc(m, a0 + (a1 - a0) * (i + 0.5) / sweepBand.length, R - 1.2, posOf(G.s + (B.s - G.s) * (1 - (i + 0.5) / sweepBand.length)).y + 2.05); });
  sweepMat.opacity = isSweep ? (0.12 + 0.45 * warn) * pulse : 0;
  if (warn > 0 && isSpit){
    const to = head(1.2);
    bossAim.visible = true; bossAim.position.lerpVectors(V.mouth, to, 0.5); bossAim.lookAt(to); bossAim.scale.z = V.mouth.distanceTo(to);
    aimMat.color.setHex(M.glow); aimMat.opacity = (0.15 + 0.55 * warn) * pulse;
  } else bossAim.visible = false;
  // shockwave rolling down the stair from the fist to the warrior
  if (B.st === 'tele' && isSlam && B.slammed){
    const qq = clamp((B.tm - (B.T - 0.3)) / 0.3, 0, 1);
    waves.forEach((w, i) => { const t = clamp(qq - i * 0.12, 0, 1), s = B.s + (G.s - B.s) * t; w.visible = qq - i * 0.12 > 0; placeArc(w, s * OMEGA, R - 0.3, posOf(s).y + 0.5 - i * 0.1); w.scale.set(1.3, 1.4 - i * 0.3, 1.2); if (Math.random() < 0.5) burst(w.position, 1, '#8a84a0', 2, 8, 0.12); });
  } else waves.forEach(w => w.visible = false);
  if (B.orb){
    bossOrb.visible = true;
    const qq = B.orb.t / B.orb.dur, hp = head(1.2);
    if (B.orb.back) bossOrb.position.lerpVectors(hp, V.mouth, qq);
    else { bossOrb.position.lerpVectors(V.mouth, hp, qq); bossOrb.position.y += Math.sin(qq * Math.PI) * 0.8; }
    bossOrb.material.color.setHex(B.orb.back ? 0x9fd0ff : M.glow); bossOrb.rotation.y += 0.3;
  } else bossOrb.visible = false;
}
