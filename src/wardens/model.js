// A Warden: a hunched stone giant that walks on its knuckles. Long arms, a forward-thrust head under a heavy brow,
// plates of stone down a bent spine with the glowing core burning in the gap at the chest, crystal shards on its back.
// Local axes: +x faces the warrior, +y up. Joints are groups; visuals.js poses them.
import { ZONES } from '../zones/index.js';
import { stoneTex } from '../render/textures.js';
import { mbox } from '../render/primitives.js';
const THREE = window.THREE;

export const WARDEN = { scale: 1.05, hipY: 2.15, hipZ: 0.85, thigh: 1.3, shin: 1.3, spineTilt: 0.35, shoulderZ: 1.2, upperArm: 1.8, forearm: 2.0, armSplay: 0.3, hipBend: 0.6, kneeBend: -1.2 };

export function makeWarden(z){
  const zz = ZONES[z], glow = new THREE.Color(zz.glow).getHex(), W = WARDEN;
  const G0 = new THREE.Group(), mats = [];
  const M = (c, rough = 0.95) => { const m = new THREE.MeshStandardMaterial({ color: c, emissive: 0x000000, map: stoneTex, roughness: rough, metalness: 0.05 }); mats.push(m); return m; };
  const stone = M(new THREE.Color(zz.stone).multiplyScalar(1.1).getHex()), dark = M(new THREE.Color(zz.stone).multiplyScalar(0.45).getHex()), hi = M(new THREE.Color(zz.top).multiplyScalar(1.35).getHex(), 0.8);
  const glowMat = new THREE.MeshBasicMaterial({ color: glow });
  const joint = (parent, x, y, zz2) => { const g = new THREE.Group(); g.position.set(x, y, zz2); parent.add(g); return g; };

  // ---- legs: crouched, feet planted wide
  const mkLeg = side => {
    const hip = joint(G0, 0, W.hipY, side * W.hipZ);
    hip.add(mbox(0.7, W.thigh, 0.75, stone, 0, -W.thigh / 2, 0));
    hip.add(mbox(0.8, 0.4, 0.85, dark, 0, -0.2, 0));
    const knee = joint(hip, 0, -W.thigh, 0);
    knee.add(mbox(0.8, 0.5, 0.8, hi, 0.05, 0.05, 0));                          // knee cap
    knee.add(mbox(0.6, W.shin, 0.65, dark, 0, -W.shin / 2, 0));
    knee.add(mbox(1.1, 0.45, 0.9, stone, 0.2, -W.shin - 0.1, 0));              // foot slab
    hip.rotation.z = W.hipBend; knee.rotation.z = W.kneeBend;
    return { hip, knee };
  };
  const legs = [mkLeg(1), mkLeg(-1)];
  G0.add(mbox(1.15, 0.9, 1.7, dark, -0.1, W.hipY + 0.1, 0));                    // pelvis

  // ---- spine: tilted forward, plates stacked up to the shoulders
  const spine = joint(G0, 0.1, W.hipY + 0.2, 0); spine.rotation.z = -W.spineTilt;   // +y toward -x is back, so the hunch forward is negative
  spine.add(mbox(1.15, 1.1, 1.45, stone, 0, 0.55, 0));                          // lower back plate
  spine.add(mbox(1.1, 0.5, 1.4, dark, 0.15, 1.2, 0));                           // waist gap (dark)
  spine.add(mbox(1.35, 1.4, 1.9, stone, 0, 2.15, 0));                           // chest / shoulders block
  spine.add(mbox(1.4, 0.3, 2.1, hi, 0, 2.9, 0));                                // shoulder ridge
  spine.add(mbox(0.5, 1.2, 0.5, dark, 0.7, 1.9, 0.5), mbox(0.5, 1.2, 0.5, dark, 0.7, 1.9, -0.5)); // rib plates framing the core
  const coreMat = new THREE.MeshBasicMaterial({ color: glow });
  spine.add(mbox(0.25, 0.7, 0.55, coreMat, 0.72, 1.85, 0));                      // the core, burning in the gap
  spine.add(mbox(0.35, 0.3, 0.9, dark, 0.78, 2.45, 0));                          // collar bone plate over it
  // crystal shards along the back
  const spikes = [];
  [[-0.5, 0.6, 0, 0.9], [-0.6, 1.4, 0.4, 1.1], [-0.6, 1.4, -0.4, 1.0], [-0.65, 2.3, 0.2, 1.3], [-0.65, 2.3, -0.5, 0.9], [-0.5, 3.0, 0, 0.8]].forEach(([x, y, zz2, h]) => {
    const s = mbox(0.22, h, 0.22, glowMat, x, y + h / 2, zz2); s.rotation.z = 0.9; spine.add(s); spikes.push(s);   // pointing up and back
  });
  // cracks
  const crackMat = new THREE.MeshBasicMaterial({ color: glow });
  [[0.81, 2.5, 0.8, 0.4], [0.81, 1.3, -0.6, -0.5], [0.6, 0.5, 0.5, 0.9], [-0.2, 2.9, 1.0, 0.2]].forEach(([x, y, zz2, r]) => {
    const m = mbox(0.04, 0.5, 0.05, crackMat, x, y, zz2); m.rotation.x = r; spine.add(m);
  });

  // ---- head: thrust forward from the shoulders under a heavy brow
  const neck = joint(spine, 0.45, 3.0, 0); neck.rotation.z = W.spineTilt - 0.2;    // level it back out, looking at you
  neck.add(mbox(0.5, 0.5, 0.6, dark, 0.1, 0.1, 0));
  const head = joint(neck, 0.25, 0.3, 0);
  head.add(mbox(1.15, 1.0, 1.2, stone, 0, 0.5, 0));                             // skull
  head.add(mbox(0.6, 0.32, 1.4, dark, 0.5, 0.95, 0));                            // brow ridge
  head.add(mbox(0.12, 0.2, 0.3, glowMat, 0.6, 0.68, 0.32), mbox(0.12, 0.2, 0.3, glowMat, 0.6, 0.68, -0.32)); // eyes
  const mouthMat = new THREE.MeshBasicMaterial({ color: glow }); mouthMat.color.multiplyScalar(0.2);
  const mouth = mbox(0.1, 0.16, 0.6, mouthMat, 0.6, 0.14, 0); head.add(mouth);
  head.add(mbox(1.0, 0.32, 1.0, dark, 0.15, -0.1, 0));                           // jaw, jutting
  const eyeLight = new THREE.PointLight(glow, 1.6, 7, 2); eyeLight.position.set(0.9, 0.6, 0); head.add(eyeLight); // its own glow lights its face and chest
  head.add(mbox(0.3, 0.5, 0.25, glowMat, -0.3, 1.1, 0.2), mbox(0.3, 0.4, 0.25, glowMat, -0.35, 1.05, -0.25)); // crown shards

  // ---- arms: long, knuckles on the floor
  const mkArm = side => {
    const shoulder = joint(spine, 0.1, 2.75, side * W.shoulderZ);
    shoulder.add(mbox(0.9, 0.7, 0.9, hi, 0, 0.1, side * 0.1));                  // shoulder boulder
    shoulder.add(mbox(0.6, W.upperArm, 0.6, stone, 0, -W.upperArm / 2, 0));
    const elbow = joint(shoulder, 0, -W.upperArm, 0);
    elbow.add(mbox(0.7, 0.5, 0.7, dark, 0, 0, 0));
    const arm = new THREE.Group(); elbow.add(arm);
    arm.add(mbox(0.55, W.forearm, 0.55, stone, 0, -W.forearm / 2, 0));
    arm.add(mbox(0.9, 0.8, 0.9, hi, 0.1, -W.forearm - 0.3, 0));                 // fist
    arm.add(mbox(0.3, 0.6, 0.3, crackMat, 0.3, -W.forearm / 2, 0.2));           // glowing vein
    shoulder.rotation.z = W.spineTilt + 0.2; shoulder.rotation.x = side * W.armSplay; elbow.rotation.z = 0.25;   // hangs down, a little forward and out from the body
    return { shoulder, elbow, arm };
  };
  const armF = mkArm(1), armB = mkArm(-1);
  G0.scale.setScalar(W.scale);
  return { G: G0, spine, legs, neck, head, armF, armB, mats, coreMat, mouthMat, mouth, glow, crackMat, spikes, glowMat, eyeLight };
}
