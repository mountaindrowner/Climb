// A Warden: a golem of broken stone. Every part is a cluster of craggy boulders with plates layered down the back and
// chest, knuckle clusters for fists, crystal shards along the spine and crown, and cracks of glow where the rocks meet.
// Seeded per zone, so each Warden's rocks fall differently. Local axes: +x faces the warrior, +y up.
// Joints are groups (spine, neck, head, hips, knees, shoulders, elbows); visuals.js poses them.
import { ZONES } from '../zones/index.js';
import { mbox } from '../render/primitives.js';
import { rock, rockMaterial, shard, rng } from '../render/rocks.js';
const THREE = window.THREE;

export const WARDEN = { scale: 1.05, hipY: 2.15, hipZ: 0.85, thigh: 1.3, shin: 1.3, spineTilt: 0.35, shoulderZ: 1.2, upperArm: 1.8, forearm: 2.0, armSplay: 0.3, hipBend: 0.6, kneeBend: -1.2 };

// The zone's stone palette: base, dark undersides, weathered light plates, lichen, and the glow.
export function palette(z){
  const zz = ZONES[z], glow = new THREE.Color(zz.glow).getHex();
  const mats = [];
  const M = (c, o) => { const m = rockMaterial(c, o); mats.push(m); return m; };
  const P = {
    stone: M(new THREE.Color(zz.stone).multiplyScalar(0.95).getHex()),
    dark: M(new THREE.Color(zz.stone).multiplyScalar(0.42).getHex()),
    hi: M(new THREE.Color(zz.top).multiplyScalar(1.1).getHex(), { rough: 0.85 }),
    lichen: M(new THREE.Color(zz.glow).multiplyScalar(0.35).lerp(new THREE.Color(zz.stone), 0.5).getHex()),
    pit: M(new THREE.Color(zz.stone).multiplyScalar(0.18).getHex(), { rough: 1 }),          // eye sockets: near black
    eyeMat: new THREE.MeshBasicMaterial({ color: new THREE.Color(zz.glow).lerp(new THREE.Color(0xffffff), 0.55).getHex() }), // the hot core of an eye
    glowMat: new THREE.MeshBasicMaterial({ color: glow }),
    crackMat: new THREE.MeshBasicMaterial({ color: glow }),
    glow, mats,
  };
  return P;
}
const joint = (parent, x, y, z) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; };
// A limb segment: a chain of overlapping rocks along -y from the joint, tapering, with a glowing crack between them.
function segment(parent, P, r, len, thick, n, taperTo){
  for (let i = 0; i < n; i++){
    const t = i / Math.max(1, n - 1), w = thick * (1 - t * (1 - taperTo)) * (0.9 + r() * 0.3);
    const y = -(i + 0.5) * (len / n) - 0.05;
    parent.add(rock(i % 2 ? P.dark : P.stone, { w, h: len / n * 1.5, d: w, jag: 0.3 + r() * 0.15, tilt: 0.4 }, (r() - 0.5) * 0.12, y, (r() - 0.5) * 0.12, r));
    if (i) parent.add(mbox(0.05, 0.2 + r() * 0.2, w * 0.35, P.crackMat, w * 0.45, y + len / n * 0.5, 0));
  }
}
// A fist: a big knuckle rock with smaller knuckles clustered on the front.
function fist(parent, P, r, size, x, y, z){
  const g = joint(parent, x, y, z);
  g.add(rock(P.hi, { w: size, h: size * 0.9, d: size * 1.05, jag: 0.3 }, 0, 0, 0, r));
  for (let i = 0; i < 4; i++) g.add(rock(P.dark, { w: size * 0.4, h: size * 0.35, d: size * 0.32, jag: 0.35 }, size * 0.42, size * (0.25 - i * 0.15), size * (-0.4 + i * 0.27), r));
  g.add(mbox(0.05, size * 0.35, 0.05, P.crackMat, size * 0.5, 0.1, 0));
  return g;
}
// The head: a skull boulder, a heavy brow slab, a jutting jaw, glowing eyes and a mouth, crown shards.
function buildHead(P, r){
  const head = new THREE.Group();
  head.add(rock(P.stone, { w: 1.3, h: 1.05, d: 1.35, jag: 0.22, tilt: 0.2 }, 0, 0.5, 0, r));
  head.add(rock(P.dark, { w: 0.9, h: 0.42, d: 1.6, jag: 0.3, tilt: 0.25 }, 0.45, 0.98, 0, r));                  // brow
  head.add(rock(P.hi, { w: 0.8, h: 0.5, d: 0.9, jag: 0.35 }, -0.35, 1.05, 0.2, r));                           // crown boulder
  head.add(rock(P.dark, { w: 1.05, h: 0.4, d: 1.1, jag: 0.3, tilt: 0.2 }, 0.3, -0.08, 0, r));                  // jaw
  head.add(rock(P.stone, { w: 0.5, h: 0.5, d: 0.45, jag: 0.4 }, 0.1, 0.55, 0.72, r), rock(P.stone, { w: 0.5, h: 0.5, d: 0.45, jag: 0.4 }, 0.1, 0.55, -0.72, r)); // cheek boulders
  // eyes: a dark socket boulder each, sunk under the brow, with a glowing crystal set deep in it and a soft halo in front
  const haloMat = new THREE.MeshBasicMaterial({ color: P.glow, transparent: true, opacity: 0.55, depthWrite: false });
  for (const side of [1, -1]){
    const sock = rock(P.pit, { w: 0.7, h: 0.6, d: 0.66, jag: 0.25, tilt: 0.1 }, 0.4, 0.64, side * 0.38, r); head.add(sock); // the socket, a pit of black rock
    head.add(mbox(0.06, 0.5, 0.56, haloMat, 0.74, 0.64, side * 0.38));                  // halo filling the socket mouth
    head.add(shard(P.eyeMat, 0.4, 0.34, 0.7, 0.64, side * 0.38));                        // the eye: a hot crystal set in the pit
    head.add(shard(P.glowMat, 0.52, 0.46, 0.64, 0.64, side * 0.38));                     // its coloured glow behind it
    head.add(mbox(0.16, 0.07, 0.62, P.pit, 0.66, 0.9, side * 0.38));                     // the brow's shadow line over the socket
  }
  const mouthMat = new THREE.MeshBasicMaterial({ color: P.glow }); mouthMat.color.multiplyScalar(0.2);
  const mouth = mbox(0.12, 0.18, 0.62, mouthMat, 0.7, 0.16, 0); head.add(mouth);
  for (let i = 0; i < 4; i++){ const s = shard(P.glowMat, 0.22 + r() * 0.12, 0.6 + r() * 0.5, -0.3 + (r() - 0.5) * 0.4, 1.25, -0.45 + i * 0.3); s.rotation.z = 0.3 + r() * 0.5; s.rotation.x = (r() - 0.5) * 0.6; head.add(s); }
  for (let i = 0; i < 3; i++) head.add(mbox(0.04, 0.3 + r() * 0.3, 0.05, P.crackMat, 0.62, 0.3 + r() * 0.5, (r() - 0.5) * 1.1));
  const eyeLight = new THREE.PointLight(P.glow, 1.8, 7, 2); eyeLight.position.set(1.1, 0.7, 0); head.add(eyeLight);
  return { head, mouth, mouthMat, eyeLight };
}

export function makeWarden(z){
  const P = palette(z), r = rng(1000 + z * 97), W = WARDEN;
  const G0 = new THREE.Group();
  // ---- legs: crouched, feet planted wide
  const mkLeg = side => {
    const hip = joint(G0, 0, W.hipY, side * W.hipZ);
    hip.add(rock(P.stone, { w: 1.0, h: 1.3, d: 1.05, jag: 0.3 }, 0, -0.55, 0, r));
    hip.add(rock(P.dark, { w: 0.8, h: 0.7, d: 0.85, jag: 0.35 }, 0.1, -1.05, 0, r));
    const knee = joint(hip, 0, -W.thigh, 0);
    knee.add(rock(P.hi, { w: 0.85, h: 0.6, d: 0.85, jag: 0.35 }, 0.1, 0.05, 0, r));                            // kneecap
    segment(knee, P, r, W.shin, 0.75, 2, 0.8);
    knee.add(rock(P.stone, { w: 1.4, h: 0.5, d: 1.1, jag: 0.25, tilt: 0.15 }, 0.25, -W.shin - 0.1, 0, r));      // foot slab
    knee.add(rock(P.dark, { w: 0.45, h: 0.35, d: 0.4, jag: 0.4 }, 0.85, -W.shin - 0.15, 0.3, r), rock(P.dark, { w: 0.45, h: 0.35, d: 0.4, jag: 0.4 }, 0.85, -W.shin - 0.15, -0.3, r)); // toes
    hip.rotation.z = W.hipBend; knee.rotation.z = W.kneeBend;
    return { hip, knee };
  };
  const legs = [mkLeg(1), mkLeg(-1)];
  G0.add(rock(P.dark, { w: 1.3, h: 1.0, d: 1.9, jag: 0.3 }, -0.1, W.hipY + 0.1, 0, r));                      // pelvis
  // ---- spine: tilted forward; plates layered up the back, the core burning in the chest gap
  const spine = joint(G0, 0.1, W.hipY + 0.2, 0); spine.rotation.z = -W.spineTilt;
  spine.add(rock(P.stone, { w: 1.3, h: 1.2, d: 1.6, jag: 0.28 }, 0, 0.55, 0, r));                            // lower back
  spine.add(rock(P.dark, { w: 1.0, h: 0.6, d: 1.3, jag: 0.35 }, 0.15, 1.2, 0, r));                            // waist
  spine.add(rock(P.stone, { w: 1.55, h: 1.6, d: 2.0, jag: 0.25 }, 0, 2.15, 0, r));                            // chest mass
  for (let i = 0; i < 5; i++){                                                                                 // back plates, overlapping like shingles
    const y = 0.5 + i * 0.6, w = 1.2 + (r() - 0.5) * 0.4;
    const pl = rock(i % 2 ? P.hi : P.stone, { w: 0.45, h: 0.75, d: w, jag: 0.3, tilt: 0.3 }, -0.75 - i * 0.02, y, (r() - 0.5) * 0.3, r); pl.rotation.z = 0.35; spine.add(pl);
  }
  spine.add(rock(P.hi, { w: 1.1, h: 0.8, d: 1.1, jag: 0.3 }, 0.1, 2.95, 1.1, r), rock(P.hi, { w: 1.1, h: 0.8, d: 1.1, jag: 0.3 }, 0.1, 2.95, -1.1, r)); // shoulder boulders
  spine.add(rock(P.dark, { w: 0.55, h: 1.3, d: 0.5, jag: 0.35 }, 0.72, 1.9, 0.55, r), rock(P.dark, { w: 0.55, h: 1.3, d: 0.5, jag: 0.35 }, 0.72, 1.9, -0.55, r)); // ribs framing the core
  const coreMat = new THREE.MeshBasicMaterial({ color: P.glow });
  spine.add(shard(coreMat, 0.6, 0.9, 0.78, 1.85, 0));                                                        // the core, a buried crystal
  spine.add(rock(P.dark, { w: 0.5, h: 0.35, d: 1.0, jag: 0.3 }, 0.8, 2.5, 0, r));                             // collar over it
  for (let i = 0; i < 3; i++) spine.add(rock(P.lichen, { w: 0.35 + r() * 0.3, h: 0.12, d: 0.35 + r() * 0.3, jag: 0.4, tilt: 0.3 }, -0.3 + r() * 0.8, 0.4 + r() * 2.4, (r() - 0.5) * 1.8, r)); // lichen
  const spikes = [];
  for (let i = 0; i < 7; i++){                                                                                 // crystal shards along the spine
    const s = shard(P.glowMat, 0.2 + r() * 0.15, 0.7 + r() * 0.8, -0.55 - r() * 0.2, 0.5 + i * 0.42, (r() - 0.5) * 0.9); s.rotation.z = 0.7 + r() * 0.5; s.rotation.x = (r() - 0.5) * 0.5; spine.add(s); spikes.push(s);
  }
  for (let i = 0; i < 6; i++) spine.add(mbox(0.04, 0.3 + r() * 0.4, 0.06, P.crackMat, 0.6 + r() * 0.2, 0.4 + r() * 2.4, (r() - 0.5) * 1.6));
  // ---- head
  const neck = joint(spine, 0.55, 3.1, 0); neck.rotation.z = W.spineTilt - 0.2;
  neck.add(rock(P.dark, { w: 0.6, h: 0.6, d: 0.7, jag: 0.35 }, 0.1, 0.1, 0, r));
  const H = buildHead(P, r); const head = joint(neck, 0.3, 0.35, 0); H.head.scale.setScalar(1.15); head.add(H.head);
  // ---- arms: long, down to the knuckles
  const mkArm = side => {
    const shoulder = joint(spine, 0.1, 2.75, side * W.shoulderZ);
    shoulder.add(rock(P.hi, { w: 1.0, h: 0.8, d: 1.0, jag: 0.3 }, 0, 0.1, side * 0.15, r));
    segment(shoulder, P, r, W.upperArm, 0.8, 2, 0.8);
    const elbow = joint(shoulder, 0, -W.upperArm, 0);
    elbow.add(rock(P.dark, { w: 0.8, h: 0.6, d: 0.8, jag: 0.35 }, 0, 0, 0, r));
    const arm = new THREE.Group(); elbow.add(arm);
    segment(arm, P, r, W.forearm, 0.7, 2, 0.85);
    fist(arm, P, r, 1.1, 0.1, -W.forearm - 0.35, 0);
    shoulder.rotation.z = W.spineTilt + 0.2; shoulder.rotation.x = side * W.armSplay; elbow.rotation.z = 0.25;
    return { shoulder, elbow, arm };
  };
  const armF = mkArm(1), armB = mkArm(-1);
  G0.scale.setScalar(W.scale);
  return { G: G0, spine, legs, neck, head, armF, armB, mats: P.mats, coreMat, mouthMat: H.mouthMat, mouth: H.mouth, glow: P.glow, crackMat: P.crackMat, spikes, glowMat: P.glowMat, eyeLight: H.eyeLight };
}
