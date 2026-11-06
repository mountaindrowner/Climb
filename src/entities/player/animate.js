// The warrior's pose each frame, read from his state. Built for snap: poses are reached fast and held, attacks have a
// short anticipation, an overshooting strike and an eased recovery, landings squash, the roll tucks and spins,
// turning is instant. Priority: hurt > roll > swing > air > crouch > run / idle; the shield arm layers on top.
import { yawFor, clamp, smooth } from '../../core/math.js';
import { TUNE } from '../../config/tuning.js';
import { R } from '../../config/constants.js';
import { ST } from '../../core/state.js';
import { torch, rimLight } from '../../render/renderer.js';
import { ZONES } from '../../zones/index.js';
import { posOf, zoneOf } from '../../world/path.js';
import { PL, playerWorld } from './player.js';
import { TORSO_Y } from './model.js';
import { swingInfo } from './motor.js';
import { usingGlb, animateGlb, GLB } from './glbRig.js';
const MV = TUNE.move;

function setLeg(leg, hip, knee){ leg.hip.rotation.z = hip; leg.knee.rotation.z = knee; }
function setArm(arm, shoulder, elbow, twist){ arm.shoulder.rotation.z = shoulder; arm.elbow.rotation.z = elbow; arm.shoulder.rotation.x = twist || 0; }
const lerp = (a, b, t) => a + (b - a) * t;
const back = t => { const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };   // ease out with overshoot

// Sword-arm poses: [shoulder, elbow, twist, torso twist, torso lean] for wind-up and strike.
const SWING = {
  slash:  { wind: [-2.3, 1.3, 0.35, -0.45, -0.1], hit: [1.7, 0.2, 0.1, 0.55, 0.35], blade: -1.2, trail: [-0.75, 0] },
  back:   { wind: [1.4, 0.3, 0.1, 0.4, 0.25], hit: [-2.5, 0.7, 0.4, -0.5, -0.05], blade: -1.9, trail: [0.9, Math.PI] },
  chop:   { wind: [-3.0, 1.5, 0.2, -0.2, -0.3], hit: [1.25, 0.05, 0.05, 0.2, 0.55], blade: -1.4, trail: [-1.5, 0] },
  thrust: { wind: [-0.5, 1.8, 0.1, -0.35, -0.2], hit: [1.55, 0.0, 0.05, 0.3, 0.4], blade: -1.57, trail: null },
  jab:    { wind: [-0.2, 1.6, 0.1, -0.2, -0.1], hit: [1.85, 0.0, 0.05, 0.2, 0.2], blade: -1.4, trail: null },
  lunge:  { wind: [-0.7, 1.9, 0.1, -0.45, -0.25], hit: [1.45, 0.0, 0.05, 0.4, 0.6], blade: -1.62, trail: null },
};

export function animatePlayer(dt = 1 / 60){
  const { mode, time, G, FALL } = ST;
  if (mode === 'fall' && FALL){
    PL.P.position.set(FALL.r * Math.cos(FALL.a), FALL.y, FALL.r * Math.sin(FALL.a));
    PL.P.rotation.set(0, yawFor(FALL.a), 0); PL.body.rotation.set(0, 0, FALL.spin); PL.body.position.set(0, 0.6, 0); PL.P.visible = true;
    if (usingGlb()){ animateGlb(G, dt); GLB.root.rotation.set(0, 0, FALL.spin); GLB.root.position.set(0, 0.6, 0); return torchAt(PL.P.position, time); }
    setArm(PL.armR, 2.6 + Math.sin(time * 9) * 0.4, 0.6, 0); setArm(PL.armL, 2.4 + Math.cos(time * 8) * 0.4, 0.6, 0);
    setLeg(PL.legR, 0.6 + Math.sin(time * 7) * 0.3, -0.8); setLeg(PL.legL, -0.4 + Math.cos(time * 7) * 0.3, -0.5);
    return torchAt(PL.P.position, time);
  }
  if (mode === 'pool'){ PL.P.visible = false; return PL.P.position; }
  if (!G) return PL.P.position;
  const pp = posOf(G.s), a = pp.a;
  // between routes (a fork's hop, a high road's ends) his radius slides across rather than snapping
  PL.rad = PL.rad == null || mode !== 'climb' ? pp.r : PL.rad + (pp.r - PL.rad) * Math.min(1, dt * 9);
  PL.P.position.set(PL.rad * Math.cos(a), G.y, PL.rad * Math.sin(a));
  PL.P.rotation.set(0, yawFor(a) + (G.face < 0 ? Math.PI : 0), 0);
  PL.P.visible = !(G.inv > 0 && Math.floor(time * 20) % 2 === 0) && mode !== 'title';
  // reset the root of the pose each frame, for both rigs (a fall's spin must never survive into a climb)
  PL.body.rotation.set(0, 0, 0); PL.body.position.set(0, 0, 0); PL.body.scale.set(1, 1, 1);
  if (usingGlb()){
    GLB.root.rotation.set(0, 0, 0); GLB.root.position.set(0, 0, 0);
    PL.trailMat.opacity = 0; animateGlb(G, dt); return torchAt(PL.P.position, time, G);   // GLB rigs draw their own blade trail
  }
  // reset the root of the pose each frame (a fall's spin must never survive into a climb)
  PL.body.rotation.set(0, 0, 0); PL.body.position.set(0, 0, 0); PL.body.scale.set(1, 1, 1);
  PL.torso.rotation.set(0, 0, 0); PL.torso.position.y = TORSO_Y;
  const speed = Math.abs(G.v) / MV.run, ph = G.runPhase;
  let sx = 1, sy = 1;

  if (G.hurtT > 0){
    // flinch: thrown back, arms out
    const q = G.hurtT / MV.hurtStun;
    PL.torso.rotation.z = 0.45 * q; PL.neck.rotation.z = 0.3 * q;
    setLeg(PL.legR, -0.3, -0.4); setLeg(PL.legL, 0.4, -0.6);
    setArm(PL.armR, -1.2 * q - 0.3, 0.6, 0.4); setArm(PL.armL, 1.0 * q, 0.4, -0.4);
    PL.pivot.rotation.z = -1.2;
  } else if (G.roll > 0){
    // tucked forward roll about the body's middle
    const q = 1 - G.roll / MV.roll.time, ang = -Math.PI * 2 * smooth(clamp(q * 1.15, 0, 1)), c = 0.55;
    PL.body.rotation.z = ang; PL.body.position.set(c * Math.sin(-ang), c - c * Math.cos(ang) - 0.25 * Math.sin(Math.PI * q), 0);
    setLeg(PL.legR, 1.5, -2.2); setLeg(PL.legL, 1.4, -2.1);
    setArm(PL.armR, 0.9, 1.6, 0.2); setArm(PL.armL, 1.1, 1.5, -0.2);
    PL.torso.rotation.z = -0.7; PL.neck.rotation.z = 0.5;
    PL.pivot.rotation.z = -2.6;
  } else {
    // ---- legs and trunk: air, crouch, run or stand
    if (!G.grounded){
      const rising = G.vy > 0, t = clamp(G.vy / 9, -1, 1);
      if (rising){ setLeg(PL.legR, 1.1, -1.5); setLeg(PL.legL, -0.2, -0.5); sy = 1 + 0.1 * t; sx = 1 - 0.05 * t; }
      else { setLeg(PL.legR, 0.5, -0.4); setLeg(PL.legL, -0.15, -0.2); }
      PL.torso.rotation.z = -0.15 - 0.1 * speed;
      PL.neck.rotation.z = rising ? 0.2 : -0.1;
    } else if (G.crouch){
      const w = Math.sin(ph) * Math.min(1, speed * 2.2);
      setLeg(PL.legR, 1.2 + w * 0.35, -2.0 + Math.max(0, w) * 0.3); setLeg(PL.legL, 1.0 - w * 0.35, -1.9 + Math.max(0, -w) * 0.3);
      PL.body.position.y = -0.36; PL.torso.rotation.z = -0.55; PL.neck.rotation.z = 0.45;
    } else if (speed > 0.05){
      const sR = Math.sin(ph), sL = Math.sin(ph + Math.PI), k = Math.min(1, speed * 1.4);
      setLeg(PL.legR, sR * 0.85 * k, -(0.15 + Math.max(0, Math.cos(ph)) * 1.35 * k));
      setLeg(PL.legL, sL * 0.85 * k, -(0.15 + Math.max(0, Math.cos(ph + Math.PI)) * 1.35 * k));
      PL.body.position.y = -Math.abs(Math.cos(ph)) * 0.05 * k;
      PL.torso.rotation.z = -0.22 * k; PL.neck.rotation.z = 0.15 * k;
    } else {
      const br = Math.sin(time * 2.2);
      setLeg(PL.legR, 0.18, -0.25); setLeg(PL.legL, -0.18, -0.12);
      PL.torso.rotation.z = -0.04 + br * 0.015; PL.body.position.y = br * 0.008;
    }
    if (G.landT > 0){ const q = G.landT / 0.12; sy = 1 - 0.16 * q; sx = 1 + 0.1 * q; PL.body.position.y -= 0.08 * q; }
    // ---- sword arm: a swing, or carried
    const A = swingInfo(G);
    if (A){
      const P = SWING[A.sw.pose];
      let f, from, to;
      if (A.phase === 'wind'){ f = 1 - Math.pow(1 - clamp(A.t / A.sw.wind, 0, 1), 3); from = null; to = P.wind; }
      else if (A.phase === 'active'){ f = back(clamp(A.t / A.sw.active, 0, 1)); from = P.wind; to = P.hit; }
      else { f = smooth(clamp(A.t / A.sw.rec, 0, 1)); from = P.hit; to = null; }
      const guard = [-0.25, 0.9, 0.15, 0, 0];
      const pa = from || guard, pb = to || guard, ff = A.phase === 'wind' ? f : f;
      const v = i => lerp(pa[i], pb[i], ff);
      setArm(PL.armR, v(0), v(1), v(2));
      PL.torso.rotation.y = v(3); PL.torso.rotation.z += -v(4);
      PL.pivot.rotation.z = A.phase === 'rec' ? lerp(P.blade, -1.5, f) : P.blade;
      if (A.sw.pose === 'thrust' || A.sw.pose === 'jab' || A.sw.pose === 'lunge') PL.wep.position.x = A.phase === 'active' ? 0.35 * f : A.phase === 'rec' ? 0.35 * (1 - f) : -0.1 * f;
      else PL.wep.position.x = 0;
      // the smear: a bright arc only while the blade is moving
      if (P.trail && A.phase === 'active'){ PL.trailMat.opacity = 0.85 * (1 - clamp(A.t / A.sw.active, 0, 1) * 0.5); PL.trail.rotation.set(0, 0, P.trail[0]); PL.trail.rotation.x = P.trail[1]; }
      else if (P.trail && A.phase === 'rec' && A.t < 0.06){ PL.trailMat.opacity = 0.4 * (1 - A.t / 0.06); }
      else PL.trailMat.opacity = 0;
    } else {
      PL.trailMat.opacity = 0; if (PL.wep) PL.wep.position.x = 0;
      const sw = G.grounded && !G.crouch ? Math.sin(ph) * Math.min(1, speed * 1.4) : 0;
      if (!G.grounded) setArm(PL.armR, G.vy > 0 ? -1.2 : 0.6, 0.9, 0.3);
      else setArm(PL.armR, -0.25 - sw * 0.55, 0.9 + Math.abs(sw) * 0.3, 0.15);
      PL.torso.rotation.y = 0; PL.pivot.rotation.z = -1.5;
    }
    // ---- shield arm
    if (G.blocking && G.blockHigh){
      setArm(PL.armL, 2.9, 0.4, -0.2); PL.shield.position.set(0.02, -0.16, -0.04); PL.shield.rotation.set(Math.PI / 2, 0, 0.1);
    } else if (G.blocking){
      setArm(PL.armL, 1.35, 1.0, -0.35); PL.shield.position.set(0.04, -0.14, -0.08); PL.shield.rotation.set(0.2, Math.PI / 2 + 0.3, 0);
      PL.torso.rotation.z -= 0.12; PL.body.position.y -= 0.06;
    } else {
      const sw = G.grounded && !G.crouch ? Math.sin(ph + Math.PI) * Math.min(1, speed * 1.4) : 0;
      setArm(PL.armL, !G.grounded ? (G.vy > 0 ? -0.9 : 0.8) : -0.1 + sw * 0.45, 0.8, -0.25);
      PL.shield.position.set(0.02, -0.14, -0.08); PL.shield.rotation.set(0, Math.PI / 2, 0);
    }
  }
  PL.body.scale.set(sx, sy, sx);
  // cape trails behind the motion
  const sway = Math.sin(time * 3.1) * 0.05;
  PL.cape.forEach((seg, i) => { seg.rotation.z = (i ? 0.1 : -0.25) + speed * 0.35 * (i + 1) + (G.vy < 0 ? -0.2 : G.vy > 0 ? 0.25 : 0) + sway * (i + 1); });
  return torchAt(PL.P.position, time, G);
}

function torchAt(pw, time, G){
  const tk = (R - 2.7) / R; torch.position.set(pw.x * tk, pw.y + 2.6, pw.z * tk);   // a little in from him, toward the camera
  torch.intensity = 2.3 + 0.22 * Math.sin(time * 13) * Math.sin(time * 7.3) + Math.random() * 0.08;
  if (G){ const p = posOf(G.s), ra = p.a + 0.45 * G.face; rimLight.position.set((R + 0.9) * Math.cos(ra), pw.y + 3.6, (R + 0.9) * Math.sin(ra)); rimLight.color.set(ZONES[zoneOf(p.k)].glow); rimLight.intensity = 1.8; }   // stronger with the camera farther back: he must lift off the wall
  return pw;
}
