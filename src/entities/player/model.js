// The warrior: a jointed, human-proportioned rig built from chunky primitives.
// Local axes: +x is forward (the way he climbs), +y up, +z is his right side, which faces the camera.
// Joints are groups placed at the joint; limbs hang from them along -y. animate.js rotates the joints.
import { grimeTex } from '../../render/textures.js';
import { mbox } from '../../render/primitives.js';
const THREE = window.THREE;

// Proportions (model units; the whole rig is scaled 1.5 in world). About 7.5 heads tall.
export const BODY = {
  foot: 0.1, shin: 0.34, thigh: 0.36, pelvis: 0.12, torso: 0.34, neck: 0.06, head: 0.2,
  hipW: 0.1,  shoulderW: 0.2, upperArm: 0.3, forearm: 0.28, hand: 0.08,
};
const HIP_Y = BODY.foot + BODY.shin + BODY.thigh;                   // 0.80
const SHOULDER_Y = HIP_Y + BODY.pelvis + BODY.torso - 0.04;         // 1.22
const NECK_Y = HIP_Y + BODY.pelvis + BODY.torso;                    // 1.26
export const HEIGHT = NECK_Y + BODY.neck + BODY.head + 0.06;        // ~1.58 (2.37 in world)
export const TORSO_Y = HIP_Y + BODY.pelvis;                           // where the torso joint sits

export function makePlayer(){
  const P = new THREE.Group(), body = new THREE.Group(); P.add(body);
  const mats = [];
  const M = (color, { map = null, rough = 0.85, metal = 0 } = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, emissive: 0x000000, map, roughness: rough, metalness: metal });
    mats.push(m); return m;
  };
  const skin = M(0xc9966f, { rough: 0.9 }), leather = M(0x4a3322, { map: grimeTex }), cloth = M(0x6e2f22, { map: grimeTex });
  const mail = M(0x4e5464, { map: grimeTex, rough: 0.7, metal: 0.35 }), steel = M(0x737b8a, { map: grimeTex, rough: 0.55, metal: 0.45 });
  const dark = M(0x241c24), hair = M(0x3a2a20, { rough: 1 }), capeMat = M(0x3b2430, { map: grimeTex, rough: 1 });
  const joint = (parent, x, y, z) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; };

  // ---- legs: hip joint -> thigh -> knee joint -> shin -> foot
  const mkLeg = side => {
    const z = side * BODY.hipW;
    const hip = joint(body, 0, HIP_Y, z);
    hip.add(mbox(0.13, BODY.thigh, 0.12, cloth, 0, -BODY.thigh / 2, 0));                 // thigh (trousers)
    hip.add(mbox(0.14, 0.1, 0.13, leather, 0, -0.05, 0));                                  // hip strap
    const knee = joint(hip, 0, -BODY.thigh, 0);
    knee.add(mbox(0.11, 0.06, 0.11, leather, 0.01, -0.03, 0));                             // knee wrap
    knee.add(mbox(0.1, BODY.shin, 0.1, dark, 0, -BODY.shin / 2, 0));                       // shin (boot leg)
    knee.add(mbox(0.11, 0.16, 0.11, leather, 0, -BODY.shin + 0.08, 0));                    // boot cuff
    const foot = mbox(0.22, BODY.foot, 0.11, leather, 0.05, -BODY.shin - BODY.foot / 2, 0); // boot
    knee.add(foot);
    return { hip, knee };
  };
  const legR = mkLeg(1), legL = mkLeg(-1);

  // ---- pelvis and torso
  body.add(mbox(0.2, BODY.pelvis, 0.28, leather, 0, HIP_Y + BODY.pelvis / 2, 0));           // belt and hips
  body.add(mbox(0.06, 0.08, 0.08, M(0xb08a3a, { metal: 0.4, rough: 0.55 }), 0.12, HIP_Y + 0.06, 0.02)); // buckle
  body.add(mbox(0.1, 0.13, 0.09, leather, 0.06, HIP_Y - 0.02, -0.17));                       // pouch
  const torso = joint(body, 0, HIP_Y + BODY.pelvis, 0);
  torso.add(mbox(0.2, 0.16, 0.26, mail, 0, 0.08, 0));                                        // abdomen (mail)
  torso.add(mbox(0.24, 0.2, 0.32, mail, 0, 0.24, 0));                                        // chest (mail)
  torso.add(mbox(0.25, 0.12, 0.3, cloth, 0, 0.1, 0));                                        // tabard
  torso.add(mbox(0.12, 0.22, 0.04, leather, 0.1, 0.2, 0));                                   // chest strap
  torso.add(mbox(0.26, 0.06, 0.1, steel, 0, 0.33, 0.17), mbox(0.26, 0.06, 0.1, steel, 0, 0.33, -0.17)); // collar plates
  // neck and head
  const neck = joint(torso, 0, BODY.torso, 0);
  neck.add(mbox(0.09, BODY.neck + 0.02, 0.09, skin, 0, BODY.neck / 2, 0));
  const head = joint(neck, 0, BODY.neck, 0);
  const hh = BODY.head;
  head.add(mbox(0.2, hh, 0.19, skin, 0.01, hh / 2, 0));                                      // skull
  head.add(mbox(0.05, 0.05, 0.05, skin, 0.11, hh * 0.45, 0));                                // nose
  head.add(mbox(0.03, 0.03, 0.04, dark, 0.1, hh * 0.6, 0.05), mbox(0.03, 0.03, 0.04, dark, 0.1, hh * 0.6, -0.05)); // eyes
  head.add(mbox(0.04, 0.05, 0.14, hair, 0.09, hh * 0.68, 0));                                // brow
  head.add(mbox(0.08, 0.12, 0.18, hair, 0.08, hh * 0.1, 0));                                 // beard
  head.add(mbox(0.06, 0.06, 0.2, hair, 0.04, hh * 0.3, 0));                                  // beard sides
  head.add(mbox(0.24, 0.1, 0.23, steel, 0, hh + 0.01, 0));                                   // helmet bowl
  head.add(mbox(0.2, 0.05, 0.19, steel, 0, hh + 0.08, 0));                                   // crown
  head.add(mbox(0.25, 0.06, 0.24, steel, 0, hh - 0.04, 0));                                  // brim
  head.add(mbox(0.03, 0.14, 0.04, steel, 0.125, hh * 0.5, 0));                                // nose guard
  head.add(mbox(0.05, 0.14, 0.05, steel, -0.08, hh * 0.45, 0.1), mbox(0.05, 0.14, 0.05, steel, -0.08, hh * 0.45, -0.1)); // cheek guards

  // ---- arms: shoulder joint -> upper arm -> elbow joint -> forearm -> hand
  const mkArm = side => {
    const z = side * BODY.shoulderW;
    const shoulder = joint(torso, 0, BODY.torso - 0.04, z);
    shoulder.add(mbox(0.16, 0.1, 0.16, steel, 0, 0.02, side * 0.02));                        // pauldron
    shoulder.add(mbox(0.1, BODY.upperArm, 0.1, mail, 0, -BODY.upperArm / 2, 0));             // upper arm (mail sleeve)
    const elbow = joint(shoulder, 0, -BODY.upperArm, 0);
    elbow.add(mbox(0.09, 0.07, 0.09, leather, 0, -0.02, 0));                                 // elbow wrap
    elbow.add(mbox(0.08, BODY.forearm, 0.08, skin, 0, -BODY.forearm / 2, 0));                // forearm
    elbow.add(mbox(0.09, 0.12, 0.09, leather, 0, -BODY.forearm + 0.1, 0));                   // bracer
    const hand = joint(elbow, 0, -BODY.forearm, 0);
    hand.add(mbox(0.07, BODY.hand, 0.06, skin, 0.01, -BODY.hand / 2, 0));
    return { shoulder, elbow, hand };
  };
  const armR = mkArm(1), armL = mkArm(-1);
  // ---- shield on the left forearm, weapon pivot in the right hand
  const shield = new THREE.Group();
  shield.add(mbox(0.5, 0.58, 0.07, leather), mbox(0.52, 0.06, 0.09, steel, 0, 0.26, 0), mbox(0.52, 0.06, 0.09, steel, 0, -0.26, 0), mbox(0.14, 0.14, 0.05, steel, 0, 0, -0.05));
  shield.position.set(0.02, -0.14, -0.08); shield.rotation.set(0, Math.PI / 2, 0); armL.elbow.add(shield);
  const pivot = new THREE.Group(); pivot.position.set(0.02, -BODY.hand / 2, 0); armR.hand.add(pivot);
  // ---- cape in three hanging segments, lantern on the hip
  const cape = [];
  let capeParent = torso, cy = BODY.torso - 0.02;
  for (let i = 0; i < 3; i++){
    const seg = joint(capeParent, i ? 0 : -0.13, i ? -0.26 : cy, 0);
    seg.add(mbox(0.04, 0.27, 0.34 - i * 0.03, capeMat, 0, -0.13, 0));
    cape.push(seg); capeParent = seg;
  }
  const lantern = mbox(0.1, 0.13, 0.1, new THREE.MeshBasicMaterial({ color: 0xffc36b }), 0.02, HIP_Y - 0.08, 0.2); body.add(lantern);
  body.add(mbox(0.12, 0.03, 0.12, dark, 0.02, HIP_Y - 0.005, 0.2));
  // swing arc
  const trailMat = new THREE.MeshBasicMaterial({ color: 0xfff0d2, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
  const trail = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.07, 3, 14, 2.4), trailMat);
  trail.position.set(0.1, 1.0, 0.3); trail.rotation.z = -0.75; P.add(trail);   // on the root, so it shows with either rig
  P.scale.setScalar(1.5);
  return { P, body, torso, neck, head, armR, armL, legR, legL, shield, pivot, cape, mats, trail, trailMat, wep: null, wepId: null };
}

export function setWeaponModel(pl, id){
  if (pl.wep) pl.pivot.remove(pl.wep);
  const g = new THREE.Group();
  const blade = new THREE.MeshStandardMaterial({ color: 0xb9c0cc, map: grimeTex, roughness: 0.5, metalness: 0.5 });
  const haft = new THREE.MeshStandardMaterial({ color: 0x4a3322, roughness: 0.9 });
  const brass = new THREE.MeshStandardMaterial({ color: 0x8d7b5a, roughness: 0.5, metalness: 0.7 });
  if (id === 'sword'){
    g.add(mbox(0.05, 0.16, 0.05, haft, 0, -0.08, 0), mbox(0.07, 0.04, 0.26, brass, 0, 0.0, 0), mbox(0.05, 0.72, 0.11, blade, 0, 0.38, 0), mbox(0.03, 0.08, 0.06, blade, 0, 0.76, 0));
  } else if (id === 'pick'){
    g.add(mbox(0.06, 0.9, 0.06, haft, 0, 0.3, 0), mbox(0.62, 0.12, 0.12, blade, 0.1, 0.72, 0), mbox(0.14, 0.08, 0.08, blade, 0.44, 0.66, 0), mbox(0.06, 0.1, 0.06, brass, 0, -0.16, 0));
  } else {
    g.add(mbox(0.045, 1.5, 0.045, haft, 0, 0.5, 0), mbox(0.1, 0.3, 0.07, blade, 0, 1.36, 0), mbox(0.06, 0.06, 0.06, brass, 0, 1.2, 0));
  }
  pl.pivot.add(g); pl.wep = g; pl.wepId = id;
  pl.trail.scale.setScalar(id === 'spear' ? 1.45 : id === 'pick' ? 1.1 : 1);
}
