// A Warden: stone golem with glowing cracks and a core that pulses when it kneels. Turned three-quarters so its face reads.
import { ZONES } from '../config/zones.js';
import { stoneTex } from '../render/textures.js';
import { bas, mbox } from '../render/primitives.js';
const THREE = window.THREE;

export function makeWarden(z){
  const zz = ZONES[z], glow = new THREE.Color(zz.glow).getHex();
  const G0 = new THREE.Group(), body = new THREE.Group(); G0.add(body);
  const mats = [];
  const L = c => { const m = new THREE.MeshLambertMaterial({ color: c, emissive: 0x000000, map: stoneTex }); mats.push(m); return m; };
  const stone = new THREE.Color(zz.stone).multiplyScalar(0.9).getHex(), hi = new THREE.Color(zz.top).getHex(), dark = new THREE.Color(zz.stone).multiplyScalar(0.55).getHex();
  G0.add(mbox(0.65, 1.1, 0.75, L(dark), 0, 0.55, 0.45), mbox(0.65, 1.1, 0.75, L(dark), 0, 0.55, -0.45)); // legs
  body.add(mbox(1.6, 1.7, 2.3, L(stone), 0, 1.85, 0));
  body.add(mbox(1.3, 0.5, 1.9, L(dark), -0.1, 1.05, 0));
  body.add(mbox(1.62, 0.16, 2.32, L(hi), 0, 2.72, 0));
  body.add(mbox(0.7, 0.6, 0.7, L(dark), -0.1, 2.85, 1.25), mbox(0.7, 0.6, 0.7, L(dark), -0.1, 2.85, -1.25)); // shoulders
  const crackMat = new THREE.MeshBasicMaterial({ color: glow });
  [[0.81, 2.35, 0.6, 0.05, 0.4], [0.81, 1.5, -0.55, 0.05, -0.5], [0.81, 2.1, -0.75, 0.04, 0.9], [0.81, 1.25, 0.5, 0.04, 0.2]].forEach(([x, y, zz2, w, r]) => {
    const m = mbox(0.03, 0.42, w, crackMat, x, y, zz2); m.rotation.x = r; body.add(m);
  });
  const coreMat = new THREE.MeshBasicMaterial({ color: glow }); body.add(mbox(0.1, 0.5, 0.5, coreMat, 0.81, 1.95, 0));
  body.add(mbox(0.9, 0.75, 1.15, L(stone), 0.1, 3.05, 0));   // head
  body.add(mbox(0.2, 0.18, 1.2, L(dark), 0.5, 3.4, 0));      // brow
  body.add(mbox(0.06, 0.12, 0.16, bas(glow), 0.56, 3.15, 0.22), mbox(0.06, 0.12, 0.16, bas(glow), 0.56, 3.15, -0.22)); // eyes
  const mouthMat = new THREE.MeshBasicMaterial({ color: glow }); mouthMat.color.multiplyScalar(0.2);
  const mouth = mbox(0.06, 0.16, 0.4, mouthMat, 0.56, 2.88, 0); body.add(mouth);
  const mkArm = zOff => {
    const pv = new THREE.Group(); pv.position.set(0, 2.55, zOff);
    const arm = new THREE.Group(); pv.add(arm);
    arm.add(mbox(0.46, 1.6, 0.46, L(stone), 0, -0.8, 0));
    arm.add(mbox(0.5, 0.2, 0.5, L(dark), 0, -0.85, 0));
    arm.add(mbox(0.66, 0.55, 0.66, L(hi), 0, -1.7, 0));
    body.add(pv); return { pv, arm };
  };
  const armF = mkArm(1.4), armB = mkArm(-1.4);
  G0.scale.setScalar(1.5);
  return { G: G0, body, armF, armB, mats, coreMat, mouthMat, mouth, glow, crackMat };
}
