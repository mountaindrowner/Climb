// The whole stair (about 945 steps) drawn as two instanced meshes, plus the Warden arenas.
import { F, FL, FH, RISE, LAND, MAXK, R, OMEGA, ZF, BOSS_FLIGHT } from '../config/constants.js';
import { ZONES } from '../config/zones.js';
import { hash, yawFor } from '../core/math.js';
import { scene } from '../render/renderer.js';
import { stoneTex } from '../render/textures.js';
import { bgeo, lam, mbox, placeArc, dummy, tmpC } from '../render/primitives.js';
import { zoneOf, landingS, gateK } from './path.js';
import { content } from './generate.js';
const THREE = window.THREE;

export const STEP_W = 1.2, STEP_D = 2.6, STEP_H = 1.4;
const stairMat = new THREE.MeshLambertMaterial({ color: 0xffffff, map: stoneTex });
const stepMesh = new THREE.InstancedMesh(bgeo(STEP_W, STEP_H, STEP_D), stairMat, MAXK * F);
const landMesh = new THREE.InstancedMesh(bgeo(LAND + 0.2, STEP_H, STEP_D), stairMat, MAXK);
scene.add(stepMesh, landMesh);
for (let k = 0; k < MAXK; k++){
  const z = ZONES[zoneOf(k)];
  for (let i = 0; i < F; i++){ tmpC.set(z.stone).multiplyScalar(0.8 + hash(k, i) * 0.4); stepMesh.setColorAt(k * F + i, tmpC); }
  tmpC.set(z.top); landMesh.setColorAt(k, tmpC);
}

// Place flight k's steps. Steps above the gate or removed by a broken-step hazard are collapsed to nothing.
export function setFlight(k){
  const vis = k <= gateK(), c = content.get(k);
  for (let i = 0; i < F; i++){
    const a = (k * FL + i + 0.5) * OMEGA, top = k * FH + (i + 1) * RISE;
    dummy.position.set(R * Math.cos(a), top - STEP_H / 2, R * Math.sin(a)); dummy.rotation.set(0, yawFor(a), 0);
    const hide = !vis || (c && c.gaps.has(i)); dummy.scale.setScalar(hide ? 0.0001 : 1); dummy.updateMatrix();
    stepMesh.setMatrixAt(k * F + i, dummy.matrix);
  }
  const a = landingS(k) * OMEGA, top = k * FH + FH;
  dummy.position.set(R * Math.cos(a), top - STEP_H / 2, R * Math.sin(a)); dummy.rotation.set(0, yawFor(a), 0);
  dummy.scale.setScalar(vis ? 1 : 0.0001); dummy.updateMatrix(); landMesh.setMatrixAt(k, dummy.matrix);
  stepMesh.instanceMatrix.needsUpdate = true; landMesh.instanceMatrix.needsUpdate = true;
}
export function setAllFlights(){ for (let k = 0; k < MAXK; k++) setFlight(k); }

// Warden arenas: a wide platform jutting out from the spiral at the top of each zone.
export const bossPlats = {};
for (let z = 0; z < ZONES.length; z++){
  const k = z * ZF + BOSS_FLIGHT, g = new THREE.Group(), a0 = (k * FL + F) * OMEGA, top = k * FH + FH, segs = 7, span = 0.95;
  const mat = new THREE.MeshLambertMaterial({ color: new THREE.Color(ZONES[z].top).getHex(), map: stoneTex });
  for (let j = 0; j < segs; j++){
    const a = a0 + (j + 0.5) * span / segs, rc = R - 0.9;
    const m = mbox(span / segs * rc * 1.12, 1.8, 4.8, mat); placeArc(m, a, rc, top - 0.9); g.add(m);
  }
  for (const side of [0, 1]){
    const a = a0 + span * (side ? 0.98 : 0.05), m = mbox(0.7, 5.5, 0.7, lam(new THREE.Color(ZONES[z].stone).getHex()));
    placeArc(m, a, R + 1.2, top + 2.75); g.add(m);
  }
  scene.add(g); bossPlats[k] = g;
}
export function updateArenas(){
  const gk = gateK();
  for (const k in bossPlats) bossPlats[k].visible = gk === Infinity || +k <= gk;
}
