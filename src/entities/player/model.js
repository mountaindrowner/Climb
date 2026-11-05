// The warrior: mail shirt, pauldrons, beard, nose-guard helmet, swaying cape, hip lantern and a banded shield. 1.5x scale.
import { grimeTex } from '../../render/textures.js';
import { lam, mbox } from '../../render/primitives.js';
const THREE = window.THREE;

export function makePlayer(){
  const P = new THREE.Group(), body = new THREE.Group(); P.add(body);
  const mats = [];
  const L = (c, map) => { const m = new THREE.MeshLambertMaterial({ color: c, emissive: 0x000000, map: map || null }); mats.push(m); return m; };
  const leather = 0x4a3322, cloth = 0x6e2f22, steel = 0x7d8594, dark = 0x241c24, skin = 0xc79a76;
  const mkLeg = z => {
    const g = new THREE.Group(); g.position.set(0, 0.36, z);
    g.add(mbox(0.17, 0.36, 0.17, L(dark), 0, -0.18, 0), mbox(0.25, 0.12, 0.2, L(leather), 0.03, -0.32, 0));
    return g;
  };
  const legA = mkLeg(0.12), legB = mkLeg(-0.12); body.add(legA, legB);
  body.add(mbox(0.34, 0.5, 0.5, L(0x5d5e68, grimeTex), 0, 0.64, 0));          // mail shirt
  body.add(mbox(0.36, 0.28, 0.52, L(cloth, grimeTex), 0, 0.5, 0));            // tunic
  body.add(mbox(0.38, 0.08, 0.54, L(leather), 0, 0.4, 0));                     // belt
  body.add(mbox(0.06, 0.07, 0.08, L(0xb08a3a), 0.19, 0.4, 0.02));             // buckle
  body.add(mbox(0.12, 0.14, 0.1, L(leather), 0.12, 0.33, -0.25));             // pouch
  body.add(mbox(0.3, 0.12, 0.2, L(steel, grimeTex), 0, 0.9, 0.3), mbox(0.3, 0.12, 0.2, L(steel, grimeTex), 0, 0.9, -0.3)); // pauldrons
  body.add(mbox(0.32, 0.3, 0.32, L(skin), 0.02, 1.03, 0));                     // head
  body.add(mbox(0.04, 0.05, 0.06, L(0x140f14), 0.18, 1.05, 0.08), mbox(0.04, 0.05, 0.06, L(0x140f14), 0.18, 1.05, -0.08)); // eyes
  body.add(mbox(0.07, 0.1, 0.27, L(0x3a2a20), 0.17, 0.92, 0));                // beard
  body.add(mbox(0.38, 0.15, 0.38, L(steel, grimeTex), 0, 1.21, 0), mbox(0.3, 0.06, 0.3, L(0x9aa2b0), 0, 1.31, 0), mbox(0.04, 0.17, 0.05, L(steel), 0.2, 1.09, 0)); // helmet + nose guard
  const cape = new THREE.Group(); cape.position.set(-0.19, 0.92, 0);
  cape.add(mbox(0.05, 0.78, 0.5, L(0x3b2430, grimeTex), 0, -0.38, 0)); body.add(cape);
  body.add(mbox(0.11, 0.15, 0.11, new THREE.MeshBasicMaterial({ color: 0xffc36b }), 0.06, 0.29, 0.31)); // lantern
  const shield = new THREE.Group();
  shield.add(mbox(0.52, 0.6, 0.08, L(0x5b3f25, grimeTex)), mbox(0.54, 0.06, 0.1, L(steel), 0, 0.27, 0), mbox(0.54, 0.06, 0.1, L(steel), 0, -0.27, 0), mbox(0.14, 0.14, 0.06, L(steel), 0, 0, -0.06));
  body.add(shield);
  const pivot = new THREE.Group(); pivot.position.set(0.06, 0.8, 0.33); body.add(pivot); // weapon hand
  pivot.add(mbox(0.12, 0.12, 0.12, L(leather), 0, 0, 0));
  const trailMat = new THREE.MeshBasicMaterial({ color: 0xfff0d2, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
  const trail = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.07, 3, 14, 2.4), trailMat);
  trail.position.set(0.06, 0.8, 0.38); trail.rotation.z = -0.75; body.add(trail);
  P.scale.setScalar(1.5);
  return { P, body, shield, pivot, legA, legB, mats, cape, trail, trailMat, wep: null, wepId: null };
}

export function setWeaponModel(pl, id){
  if (pl.wep) pl.pivot.remove(pl.wep);
  const g = new THREE.Group();
  if (id === 'sword'){ g.add(mbox(0.06, 0.2, 0.06, lam(0x3b2a20), 0, 0.1, 0), mbox(0.08, 0.06, 0.28, lam(0x8d7b5a), 0, 0.22, 0), mbox(0.05, 0.7, 0.11, new THREE.MeshLambertMaterial({ color: 0xcfd5e2, map: grimeTex }), 0, 0.6, 0)); }
  else if (id === 'pick'){ g.add(mbox(0.07, 0.86, 0.07, lam(0x4a3322), 0, 0.43, 0), mbox(0.6, 0.12, 0.12, new THREE.MeshLambertMaterial({ color: 0x9aa0ad, map: grimeTex }), 0.08, 0.84, 0), mbox(0.12, 0.08, 0.08, lam(0x9aa0ad), 0.4, 0.78, 0)); }
  else { g.add(mbox(0.05, 1.5, 0.05, lam(0x4a3322), 0, 0.62, 0), mbox(0.12, 0.28, 0.07, new THREE.MeshLambertMaterial({ color: 0xc9cfdb, map: grimeTex }), 0, 1.45, 0)); }
  pl.pivot.add(g); pl.wep = g; pl.wepId = id;
  pl.trail.scale.setScalar(id === 'spear' ? 1.45 : id === 'pick' ? 1.1 : 1);
}
