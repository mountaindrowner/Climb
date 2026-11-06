// The high roads, drawn: each a run of steps cut into the shaft wall behind the main stair, with a rough face of rock
// behind them. The wall itself is carved open along them in shaft.js (carveFor), so they read through it.
import { ZONES } from '../config/zones.js';
import { hash, yawFor } from '../core/math.js';
import { scene } from '../render/renderer.js';
import { stoneTex, wallTex } from '../render/textures.js';
import { bgeo, dummy, tmpC } from '../render/primitives.js';
import { BRANCHES, zoneOf } from './path.js';
const THREE = window.THREE;
const STEP_H = 1.4, DEPTH = 1.8;

const total = BRANCHES.reduce((n, b) => n + b.nSteps + 1 - b.iC, 0);
const mat = new THREE.MeshLambertMaterial({ color: 0xffffff, map: stoneTex });
const steps = new THREE.InstancedMesh(bgeo(1, STEP_H, DEPTH), mat, total);
let n = 0;
for (const b of BRANCHES){
  const z = ZONES[zoneOf(b.kA)];
  for (let i = b.iC; i <= b.nSteps; i++){        // the first iC steps have crumbled away (handoff.js)
    const last = i === b.nSteps, len = last ? b.flat + 0.2 : b.stepL * 1.02;
    const u = last ? b.len - b.flat / 2 : (i + 0.5) * b.stepL, a = b.aA - u / b.r;
    const top = last ? b.yB : b.yA + (i + 1) * b.rise;
    dummy.position.set(b.r * Math.cos(a), top - STEP_H / 2, b.r * Math.sin(a));
    dummy.rotation.set(0, yawFor(a), 0); dummy.scale.set(len, 1, 1); dummy.updateMatrix();
    steps.setMatrixAt(n, dummy.matrix);
    tmpC.set(z.stone).multiplyScalar(0.72 + hash(b.j, i) * 0.3); steps.setColorAt(n, tmpC);
    n++;
  }
}
scene.add(steps);

// the rock face behind each high road: a ribbon that follows it, from below its steps to well above a man's head
for (const b of BRANCHES){
  const z = ZONES[zoneOf(b.kA)], N = Math.ceil(b.len * 2), rr = b.r + DEPTH / 2 + 0.1;
  const pos = [], uv = [], idx = [];
  for (let i = 0; i <= N; i++){
    const u = b.len * i / N, a = b.aA - u / b.r, y = u < b.len - b.flat ? b.yA + b.rise * (u / b.stepL) : b.yB;
    const jag = (hash(b.j, i) - 0.5) * 0.25;
    pos.push((rr + jag) * Math.cos(a), y - 1.6, (rr + jag) * Math.sin(a), (rr + jag) * Math.cos(a), y + 4.8, (rr + jag) * Math.sin(a));
    uv.push(u / 3, 0, u / 3, 2.1);
    if (i < N){ const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  const t = wallTex.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping;
  const face = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ map: t, color: new THREE.Color(z.wall).multiplyScalar(0.55), side: THREE.DoubleSide }));
  scene.add(face);
}

// Is a point of the shaft wall (angle, height) in the opening along a high road?
export function carveFor(angle, y){
  for (const b of BRANCHES){
    let du = (b.aA - angle) * b.r; const turn = 2 * Math.PI * b.r;
    du = ((du % turn) + turn) % turn;                       // distance along the high road from its foot
    if (du > b.len + 0.6) continue;
    const yb = du < b.len - b.flat ? b.yA + b.rise * (du / b.stepL) : b.yB;
    if (y > yb - 1.2 && y < yb + 4.4) return true;
  }
  return false;
}
