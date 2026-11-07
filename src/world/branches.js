// The high roads, drawn: each a flat foot (where the leap from the spur lands) and a run of steps cut deep into the
// shaft wall behind the main stair, a narrow ledge-stair with a rough face of rock behind it. The wall is carved open
// along them and along each spur in shaft.js (carveFor), so they read through it. (The spurs are drawn by spur.js.)
import { ZONES } from '../config/zones.js';
import { hash, yawFor } from '../core/math.js';
import { scene } from '../render/renderer.js';
import { stoneTex, wallTex } from '../render/textures.js';
import { bgeo, dummy, tmpC } from '../render/primitives.js';
import { BRANCHES, SPURS, zoneOf } from './path.js';
const THREE = window.THREE;
const STEP_H = 1.4, DEPTH = 1.2;

const total = BRANCHES.reduce((n, b) => n + b.nSteps + 2, 0);
const mat = new THREE.MeshLambertMaterial({ color: 0xffffff, map: stoneTex });
const steps = new THREE.InstancedMesh(bgeo(1, STEP_H, DEPTH), mat, total);
let n = 0;
for (const b of BRANCHES){
  const z = ZONES[zoneOf(b.kA)];
  for (let i = -1; i <= b.nSteps; i++){          // -1: the foot; nSteps: the flat where it rejoins
    const last = i === b.nSteps, foot = i < 0, len = last ? b.flat + 0.2 : foot ? b.footL : b.stepL * 1.02;
    const u = last ? b.len - b.flat / 2 : foot ? b.footL / 2 : b.footL + (i + 0.5) * b.stepL, a = b.aA - u / b.r;
    const top = last ? b.yB : foot ? b.yA : b.yA + (i + 1) * b.rise;
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
    const u = b.len * i / N, a = b.aA - u / b.r, y = roadLine(b, u);
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

function roadLine(b, u){ return u < b.footL ? b.yA : u < b.len - b.flat ? b.yA + b.rise * ((u - b.footL) / b.stepL) : b.yB; }
// Is a point of the shaft wall (angle, height) in the opening along a high road or a spur?
export function carveFor(angle, y){
  const turn = 2 * Math.PI;
  for (const b of BRANCHES){
    let da = (b.aA - angle) % turn; da = (da + turn) % turn; const du = da * b.r;   // distance along the high road from its foot
    if (du > b.len + 0.6 && da < turn - 0.15) continue;
    const yb = roadLine(b, Math.min(du, b.len));
    if (y > yb - 1.2 && y < yb + 4.4) return true;
  }
  for (const sp of SPURS){
    let da = (angle - sp.a0) % turn; da = (da + turn) % turn; const du = da * sp.r;
    if (du > sp.len + 0.4) continue;
    const yb = sp.yA + sp.rise * du / sp.stepL;
    if (y > yb - 1.2 && y < yb + 3.8) return true;
  }
  return false;
}
