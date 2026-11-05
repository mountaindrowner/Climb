// Per-frame pose of the warrior. The climb is a real step cycle: the lead leg lifts with a high knee, plants on the
// next step at the thud, the trailing leg pushes off and follows; arms swing opposite; the torso leans into the climb.
import { yawFor, clamp, smooth } from '../../core/math.js';
import { TUNE } from '../../config/tuning.js';
import { ST } from '../../core/state.js';
import { torch } from '../../render/renderer.js';
import { PL, playerWorld } from './player.js';
import { TORSO_Y } from './model.js';
import { rimLight } from '../../render/renderer.js';
import { ZONES } from '../../zones/index.js';
import { zoneOf } from '../../world/path.js';
import { R } from '../../config/constants.js';
import { posOf } from '../../world/path.js';

const THUD = TUNE.climb.thudAt;
function setLeg(leg, hip, knee){ leg.hip.rotation.z = hip; leg.knee.rotation.z = knee; }
function setArm(arm, shoulder, elbow, twist){ arm.shoulder.rotation.z = shoulder; arm.elbow.rotation.z = elbow; arm.shoulder.rotation.x = twist || 0; }

export function animatePlayer(){
  const { mode, time, G, FALL } = ST;
  if (mode === 'fall' && FALL){
    PL.P.position.set(FALL.r * Math.cos(FALL.a), FALL.y, FALL.r * Math.sin(FALL.a));
    PL.P.rotation.set(0, yawFor(FALL.a), 0); PL.body.rotation.z = FALL.spin; PL.body.position.y = 0.6; PL.P.visible = true;
    // flailing
    setArm(PL.armR, 2.6 + Math.sin(time * 9) * 0.4, 0.6, 0); setArm(PL.armL, 2.4 + Math.cos(time * 8) * 0.4, 0.6, 0);
    setLeg(PL.legR, 0.6 + Math.sin(time * 7) * 0.3, -0.8); setLeg(PL.legL, -0.4 + Math.cos(time * 7) * 0.3, -0.5);
  } else if (mode === 'pool'){ PL.P.visible = false; }
  else if (G){
    const p = posOf(G.s);
    PL.P.position.copy(playerWorld()); PL.P.rotation.set(0, yawFor(p.a), 0);
    PL.body.position.y = 0; PL.body.rotation.set(0, 0, 0);   // clear the fall's spin, or a root grab leaves him tumbled
    PL.P.visible = !(G.inv > 0 && Math.floor(time * 20) % 2 === 0) && mode !== 'title';
    const sq = G.squash, ducking = G.duck > 0, climbing = mode === 'climb';
    PL.body.scale.set(1 + sq * 0.06, 1 - sq * 0.08, 1 + sq * 0.06);
    // ---- step cycle
    const fr = p.land ? 0 : p.fr;
    const air = climbing && fr < THUD ? Math.sin(Math.PI * fr / THUD) : 0;          // lead foot in the air
    const after = climbing && fr >= THUD ? smooth((fr - THUD) / (1 - THUD)) : 0;    // trailing leg catching up
    const lead = p.i % 2 === 0 ? PL.legR : PL.legL, trail = lead === PL.legR ? PL.legL : PL.legR;
    if (G.jump > 0){
      const q = 1 - G.jump / TUNE.player.jump, tuck = Math.sin(Math.PI * q);
      setLeg(PL.legR, 0.9 * tuck, -1.6 * tuck); setLeg(PL.legL, 0.5 * tuck, -1.2 * tuck);
    } else if (ducking){
      setLeg(lead, 1.1, -1.9); setLeg(trail, 0.6, -1.7);
    } else if (climbing){
      setLeg(lead, 0.45 + 0.65 * air - 0.3 * after, -(0.55 + 1.25 * air - 0.35 * after));
      setLeg(trail, -0.45 + 0.9 * after, -(0.35 + 0.9 * after));
    } else {
      setLeg(PL.legR, 0.12, -0.2); setLeg(PL.legL, -0.12, -0.15);
    }
    // ---- torso, head, cape
    const bob = climbing ? air * 0.03 : 0;
    const crouch = ducking ? 0.42 : 0;
    PL.torso.position.y = TORSO_Y - bob - crouch * 0.5;
    PL.body.position.y = -crouch * 0.4;
    PL.torso.rotation.z = -(climbing ? 0.16 + air * 0.08 : 0.05) - crouch * 0.9;   // leans into the climb (+y toward -x is back, so forward is negative)
    PL.neck.rotation.z = (climbing ? 0.2 : 0.05) + crouch * 0.5;   // looks up the stair
    PL.head.rotation.z = Math.sin(time * 1.7) * 0.03;
    const sway = Math.sin(time * 3.1) * 0.05;
    PL.cape.forEach((seg, i) => { seg.rotation.z = (i ? 0.1 : -0.25) - air * 0.18 * (i + 1) + sway * (i + 1) - crouch * 0.4; });
    // ---- arms: the swing, the block, otherwise a counter-swing to the legs
    const swing = climbing ? (lead === PL.legR ? 1 : -1) * (air - after * 0.5) : 0;
    if (G.atk > 0){
      const q = 1 - G.atk / 0.2;                                   // 0 → 1 over the swing
      const wind = q < 0.25 ? q / 0.25 : 1, cut = q < 0.25 ? 0 : (q - 0.25) / 0.75;
      setArm(PL.armR, -2.4 * wind + 3.5 * cut, 1.4 * wind - 1.2 * cut, 0.35 * (1 - cut));   // up behind, then the chop through
      PL.torso.rotation.y = -0.35 * wind + 0.6 * cut;
      PL.pivot.rotation.z = -1.5 + 0.6 * cut;
    } else {
      setArm(PL.armR, -0.2 - swing * 0.35, 0.9, 0.15);
      PL.torso.rotation.y = climbing ? swing * 0.08 : 0;
      PL.pivot.rotation.z = -1.5;                                  // blade held low and forward
    }
    if (G.block > 0 && G.blockHigh){
      setArm(PL.armL, 2.9, 0.4, -0.2);                             // shield overhead against falling rock
      PL.shield.position.set(0.02, -0.16, -0.04); PL.shield.rotation.set(Math.PI / 2, 0, 0.1);
    } else if (G.block > 0){
      setArm(PL.armL, 1.3, 1.0, -0.35);
      PL.shield.position.set(0.04, -0.14, -0.08); PL.shield.rotation.set(0.2, Math.PI / 2 + 0.3, 0);
    } else {
      setArm(PL.armL, -0.1 + swing * 0.35, 0.8, -0.25);
      PL.shield.position.set(0.02, -0.14, -0.08); PL.shield.rotation.set(0, Math.PI / 2, 0);
    }
    PL.trailMat.opacity = G.atk > 0 ? (G.atk / 0.2) * 0.75 : 0;
  }
  const pw = G ? playerWorld() : PL.P.position;
  torch.position.set(pw.x * 0.62, pw.y + 2.6, pw.z * 0.62);
  // a cool rim light up the stair behind him, in the zone's glow, so his edges separate from the wall
  if (G){ const p = posOf(G.s), ra = p.a + 0.45; rimLight.position.set((R + 0.9) * Math.cos(ra), pw.y + 3.6, (R + 0.9) * Math.sin(ra)); rimLight.color.set(ZONES[zoneOf(p.k)].glow); rimLight.intensity = 1.1; }
  torch.intensity = 1.75 + 0.22 * Math.sin(time * 13) * Math.sin(time * 7.3) + Math.random() * 0.08;
  return pw;
}
