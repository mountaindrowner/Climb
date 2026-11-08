// The whole stair (about 945 steps) drawn as two instanced meshes, plus the Warden arenas.
import { F, FL, LAND, MAXK, R, OMEGA } from '../config/constants.js';
import { ZONES } from '../config/zones.js';
import { hash, yawFor } from '../core/math.js';
import { scene } from '../render/renderer.js';
import { stoneTex } from '../render/textures.js';
import { bgeo, dummy, tmpC } from '../render/primitives.js';
import { zoneOf, landingS, gateK, flightY, riseOf, landingY, surfaceOf, HALF, floorShut } from './path.js';
import { content } from './generate.js';
import { stairHole } from './decks.js';
const THREE = window.THREE;

export const STEP_W = 1.2 / HALF, STEP_D = 2.6, STEP_H = 1.4;   // a block per step, HALF of them to a unit
const stairMat = new THREE.MeshLambertMaterial({ color: 0xffffff, map: stoneTex });
const N = F * HALF, stepMesh = new THREE.InstancedMesh(bgeo(STEP_W, STEP_H, STEP_D), stairMat, MAXK * N);
const landMesh = new THREE.InstancedMesh(bgeo(LAND + 0.2, STEP_H, STEP_D), stairMat, MAXK);
scene.add(stepMesh, landMesh);
for (let k = 0; k < MAXK; k++){
  const z = ZONES[zoneOf(k)];
  for (let i = 0; i < N; i++){ tmpC.set(z.stone).multiplyScalar(0.8 + hash(k, i) * 0.4); stepMesh.setColorAt(k * N + i, tmpC); }
  tmpC.set(z.top); landMesh.setColorAt(k, tmpC);
}

// Place flight k's steps. Steps above the gate or removed by a broken-step hazard are collapsed to nothing, and so is the
// flight above an unbeaten Warden's floor; when it falls, that flight rises into place from below (sink: how far down).
const SINK = new Map();
export function sinkFlight(k, d){ if (d > 0) SINK.set(k, d); else SINK.delete(k); setFlight(k); }
export function setFlight(k){
  const vis = k <= gateK() && (!floorShut(k) || SINK.has(k)), c = content.get(k), sink = SINK.get(k) || 0;
  const kind = surfaceOf(k), base = flightY(k), r = riseOf(k);
  for (let j = 0; j < N; j++){
    const i = Math.floor(j / HALF);                                       // the unit it stands in
    let u = (j + 0.5) / HALF, top = base + (j + 1) * r / HALF, tilt = 0, len = 1, hide = !vis || (c && c.gaps.has(i)) || !!stairHole(k * FL + (j + 0.5) / HALF);
    if (kind === 'slope' || kind === 'tall'){
      // a slope: each unit of it one block tilted to the grade, its top running along the ramp
      if (j % HALF) hide = true;
      else {
        const g = kind === 'slope' ? r : 0.75 * r; u = i + 0.5;
        top = base + (kind === 'slope' ? r * u : i < 4 ? g * u : 5 * r + g * (u - 4));
        tilt = Math.atan(g); len = 1.04 / Math.cos(tilt) / STEP_W;
      }
    } else if (kind === 'broad'){
      // broad steps: a whole unit each
      if (j % HALF) hide = true; else { u = i + 0.5; top = base + (i + 1) * r; len = 1.02 / STEP_W; }
    }
    const a = (k * FL + u) * OMEGA, ta = new THREE.Vector3(-Math.sin(a), 0, Math.cos(a));   // up-stair, along the path
    dummy.position.set(R * Math.cos(a), top - sink * (1 + 0.6 * (j % 5) / 4), R * Math.sin(a));   // rising, the blocks come up a little out of step
    dummy.position.addScaledVector(ta, STEP_H / 2 * Math.sin(tilt)); dummy.position.y -= STEP_H / 2 * Math.cos(tilt);   // its top face on the surface
    dummy.rotation.set(0, yawFor(a), tilt); dummy.scale.set(hide ? 0.0001 : len, hide ? 0.0001 : 1, hide ? 0.0001 : 1); dummy.updateMatrix();
    stepMesh.setMatrixAt(k * N + j, dummy.matrix);
  }
  const a = landingS(k) * OMEGA, top = landingY(k);
  dummy.position.set(R * Math.cos(a), top - STEP_H / 2, R * Math.sin(a)); dummy.rotation.set(0, yawFor(a), 0);
  dummy.scale.setScalar(vis ? 1 : 0.0001); dummy.updateMatrix(); landMesh.setMatrixAt(k, dummy.matrix);
  stepMesh.instanceMatrix.needsUpdate = true; landMesh.instanceMatrix.needsUpdate = true;
}
export function setAllFlights(){ for (let k = 0; k < MAXK; k++) setFlight(k); }
